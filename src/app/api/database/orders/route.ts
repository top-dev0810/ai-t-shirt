import { NextRequest, NextResponse } from 'next/server';
import { DatabaseService } from '@/lib/services/database';
import { ImagePersistenceService } from '@/lib/services/imagePersistence';

// Design interface removed as it's not used in this file

// Note: Image processing is now done BEFORE saving to database, not in background

export async function GET() {
    try {
        // Test database connection first
        const connectionTest = await DatabaseService.testConnection();
        if (!connectionTest.success) {
            return NextResponse.json({
                success: false,
                message: 'Database not available',
                orders: [],
                fallback: true
            });
        }

        // Get all orders
        const orders = await DatabaseService.getAllOrders();

        return NextResponse.json({
            success: true,
            message: 'Orders retrieved successfully',
            orders: orders || []
        });
    } catch (error: unknown) {
        console.error('Database API error:', error);
        return NextResponse.json({
            success: false,
            message: (error as Error).message || 'Failed to retrieve orders',
            orders: [],
            fallback: true
        }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const orderData = await request.json();

        // Test database connection first
        const connectionTest = await DatabaseService.testConnection();
        if (!connectionTest.success) {
            console.warn('Database connection failed:', connectionTest.message);
            return NextResponse.json({
                success: false,
                message: 'Database not available. Order saved to WooCommerce only.',
                fallback: true
            });
        }

        // Create user first
        const userResult = await DatabaseService.createUser({
            email: orderData.email,
            name: orderData.name,
            google_id: orderData.google_id || 'checkout_user'
        });

        // Get user ID from the result
        const userId = (userResult as { insertId?: number }).insertId || 1; // Fallback to 1 if insertId not available

        // Create order
        const order = await DatabaseService.createOrder({
            order_id: orderData.order_id,
            user_id: userId,
            status: orderData.status || 'processing',
            total_amount: orderData.total_amount,
            deposit_amount: orderData.deposit_amount || 50.00,
            payment_method: orderData.payment_method || 'razorpay',
            payment_status: orderData.payment_status || 'paid',
            razorpay_order_id: orderData.razorpay_order_id,
            razorpay_payment_id: orderData.razorpay_payment_id,
            woocommerce_order_id: orderData.woocommerce_order_id
        });

        // Get order ID from the result
        const orderId = (order as { insertId?: number }).insertId || 1; // Fallback to 1 if insertId not available

        // Create order items
        if (orderData.items && Array.isArray(orderData.items)) {
            for (const item of orderData.items) {
                await DatabaseService.createOrderItem({
                    order_id: orderId,
                    tshirt_style: item.style?.name || 'Custom T-Shirt',
                    tshirt_color: item.color || 'White',
                    tshirt_size: item.size || 'M',
                    print_size: item.printSize?.name || 'A4',
                    placement: item.placement || 'front',
                    quantity: item.quantity || 1,
                    unit_price: item.price || 0,
                    total_price: (item.price || 0) * (item.quantity || 1)
                });
            }
        }

        // Handle design image - Check if already saved to FTP or needs processing
        let finalImageUrl = orderData.design?.image_url || '';
        let ftpImagePath = '';

        if (orderData.design && orderData.design.image_url) {
            console.log('🔄 Processing design image for database storage...');
            console.log('Original image URL:', orderData.design.image_url);

            // Check if image is already saved to FTP (from cart addition)
            if (orderData.design.ftp_image_path) {
                console.log('✅ Image already saved to FTP from cart:', orderData.design.ftp_image_path);
                finalImageUrl = orderData.design.ftp_image_path;
                ftpImagePath = orderData.design.ftp_image_path;
            } else if (ImagePersistenceService.isTemporaryUrl(orderData.design.image_url)) {
                console.log('📸 Temporary URL detected, saving to FTP now...');

                // Save image to FTP using the new service
                const result = await ImagePersistenceService.saveImageToFTP(
                    orderData.design.image_url,
                    orderId.toString(),
                    `design_${orderId}`
                );

                if (result.success && result.permanentUrl) {
                    finalImageUrl = result.permanentUrl;
                    ftpImagePath = result.ftpPath || '';
                    console.log('✅ Image saved to FTP successfully:', finalImageUrl);
                    console.log('📁 FTP Path:', ftpImagePath);
                } else {
                    console.error('❌ Failed to save image to FTP:', result.error);
                    // Continue with temporary URL if FTP fails
                    finalImageUrl = orderData.design.image_url;
                }
            } else {
                console.log('✅ Image URL is already permanent:', finalImageUrl);
                // If it's already a permanent URL, we can still store the path
                ftpImagePath = orderData.design.image_url;
            }
        }

        // Create design record with FTP image URL and path
        if (orderData.design) {
            console.log('💾 Saving design data with FTP image URL:', finalImageUrl);
            console.log('📁 FTP Path:', ftpImagePath);
            await DatabaseService.createDesign({
                user_id: userId,
                order_id: orderId,
                prompt_text: orderData.design.prompt_text || 'Custom design',
                art_style: orderData.design.art_style || 'modern',
                music_genre: orderData.design.music_genre || 'electronic',
                image_url: finalImageUrl, // Use FTP URL instead of temporary URL
                ftp_image_path: ftpImagePath, // Store FTP path for reference
                is_ai_generated: true
            });
        } else {
            console.log('No design data found in orderData:', orderData);
        }

        // Create shipping address
        if (orderData.shipping_address) {
            await DatabaseService.createShippingAddress({
                order_id: orderId,
                first_name: orderData.shipping_address.first_name || '',
                last_name: orderData.shipping_address.last_name || '',
                email: orderData.shipping_address.email || '',
                phone: orderData.shipping_address.phone || '',
                address: orderData.shipping_address.address || '',
                city: orderData.shipping_address.city || '',
                state: orderData.shipping_address.state || '',
                postcode: orderData.shipping_address.postcode || '',
                country: orderData.shipping_address.country || 'IN'
            });
        }

        // Create payment transaction
        if (orderData.razorpay_payment_id) {
            await DatabaseService.createPaymentTransaction({
                order_id: orderId,
                transaction_id: orderData.razorpay_payment_id,
                payment_method: orderData.payment_method || 'razorpay',
                amount: orderData.total_amount,
                currency: 'INR',
                status: 'completed',
                gateway_response: JSON.stringify({
                    razorpay_order_id: orderData.razorpay_order_id,
                    razorpay_payment_id: orderData.razorpay_payment_id,
                    woocommerce_order_id: orderData.woocommerce_order_id
                })
            });
        }

        // Images are already processed and saved to FTP above
        console.log(`✅ Order ${orderId} created successfully with FTP image URL: ${finalImageUrl}`);

        return NextResponse.json({
            success: true,
            message: 'Order saved to database successfully',
            orderId: orderData.order_id
        });
    } catch (error: unknown) {
        console.error('Database API error:', error);
        return NextResponse.json({
            success: false,
            message: (error as Error).message || 'Failed to save order to database'
        }, { status: 500 });
    }
}