import { NextRequest, NextResponse } from 'next/server';
import { serverFtpService } from '@/lib/services/ftpServer';

interface FTPOrderData {
    id: string;
    orderDate: Date;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    items: Array<{
        style: { name: string };
        color: { name: string };
        size: string;
        printSize: { name: string };
        placement: string;
        quantity: number;
        price: number;
    }>;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    shippingAddress: {
        address: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
    };
}

interface OrderFolderData {
    order: FTPOrderData;
    design: {
        id: string;
        prompt: {
            text: string;
            artStyle: string;
            musicGenre: string;
        };
        imageUrl: string;
        createdAt: Date;
        userId: string;
        isPublic: boolean;
    };
    designImage: string; // Base64 encoded image data
}

export async function POST(request: NextRequest) {
    try {
        console.log('🔄 API: Starting FTP order folder creation...');

        const orderData: OrderFolderData = await request.json();
        console.log('🔄 API: Received order data:', {
            orderId: orderData.order?.id,
            designId: orderData.design?.id,
            hasImageUrl: !!orderData.design?.imageUrl
        });

        if (!orderData || !orderData.order || !orderData.design || !orderData.designImage) {
            console.error('❌ API: Missing required order data');
            return NextResponse.json(
                { success: false, message: 'Missing required order data' },
                { status: 400 }
            );
        }

        // Check FTP configuration
        console.log('🔄 API: Checking FTP configuration...');
        const ftpHost = process.env.FTP_HOST;
        const ftpUsername = process.env.FTP_USERNAME;
        const ftpPassword = process.env.FTP_PASSWORD;

        if (!ftpHost || !ftpUsername || !ftpPassword) {
            console.error('❌ API: FTP configuration missing');
            return NextResponse.json(
                { success: false, message: 'FTP configuration missing' },
                { status: 500 }
            );
        }

        console.log('✅ API: FTP configuration found');

        // Convert the order data to the format expected by serverFtpService
        const serverOrderData = {
            order: orderData.order,
            design: {
                id: orderData.design.id,
                prompt: orderData.design.prompt,
                imageUrl: orderData.design.imageUrl,
                createdAt: orderData.design.createdAt,
                userId: orderData.design.userId,
                isPublic: orderData.design.isPublic
            },
            designImageUrl: orderData.design.imageUrl // Use the image URL instead of base64
        };

        console.log('🔄 API: Calling serverFtpService.createOrderFolder...');
        const result = await serverFtpService.createOrderFolder(serverOrderData);
        console.log('🔄 API: ServerFtpService result:', result);

        if (result.success) {
            console.log('✅ API: FTP order folder created successfully');
            return NextResponse.json(result);
        } else {
            console.error('❌ API: FTP order folder creation failed:', result.message);
            return NextResponse.json(result, { status: 500 });
        }

    } catch (error) {
        console.error('❌ API: Error creating FTP order folder:', error);
        console.error('❌ API: Error details:', {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}
