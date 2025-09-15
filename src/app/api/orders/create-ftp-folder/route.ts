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
        prompt: string;
        imageUrl: string;
        createdAt: Date;
    };
    designImage: string; // Base64 encoded image data
}

export async function POST(request: NextRequest) {
    try {
        const orderData: OrderFolderData = await request.json();

        if (!orderData || !orderData.order || !orderData.design || !orderData.designImage) {
            return NextResponse.json(
                { success: false, message: 'Missing required order data' },
                { status: 400 }
            );
        }

        console.log('Attempting to create FTP order folder for order:', orderData.order.id);

        // Convert the order data to the format expected by serverFtpService
        const serverOrderData = {
            order: orderData.order,
            design: {
                id: orderData.design.id,
                prompt: {
                    text: orderData.design.prompt,
                    artStyle: 'custom', // Default value since it's not provided
                    musicGenre: 'custom' // Default value since it's not provided
                },
                imageUrl: orderData.design.imageUrl,
                createdAt: orderData.design.createdAt,
                userId: 'unknown', // Default value since it's not provided
                isPublic: false    // Default value since it's not provided
            },
            designImageUrl: orderData.design.imageUrl // Use the image URL instead of base64
        };

        const result = await serverFtpService.createOrderFolder(serverOrderData);

        if (result.success) {
            return NextResponse.json(result);
        } else {
            return NextResponse.json(result, { status: 500 });
        }

    } catch (error) {
        console.error('API Error creating FTP order folder:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}
