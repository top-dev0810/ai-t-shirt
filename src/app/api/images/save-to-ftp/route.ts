import { NextRequest, NextResponse } from 'next/server';
import { serverFtpService } from '@/lib/services/ftpServer';

export async function POST(request: NextRequest) {
    try {
        const { imageUrl, orderId, designId } = await request.json();

        if (!imageUrl || !orderId || !designId) {
            return NextResponse.json(
                { success: false, message: 'Missing required parameters' },
                { status: 400 }
            );
        }

        console.log('Saving image to FTP:', { imageUrl, orderId, designId });

    // Use the server FTP service
    const result = await serverFtpService.createOrderFolder({
      order: {
        id: orderId,
        orderDate: new Date(),
        customerName: 'Customer',
        customerEmail: 'customer@example.com',
        customerPhone: '',
        items: [],
        totalAmount: 0,
        status: 'processing',
        paymentMethod: 'online',
        shippingAddress: {
          address: '',
          city: '',
          state: '',
          postcode: '',
          country: ''
        }
      },
      design: {
        id: designId,
        imageUrl: imageUrl,
        prompt: {
          text: 'Design',
          artStyle: 'modern',
          musicGenre: 'electronic'
        },
        userId: 'user',
        createdAt: new Date(),
        isPublic: false
      },
      designImageUrl: imageUrl
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 500 }
      );
    }

    // Return the FTP path for the image
    return NextResponse.json({
      success: true,
      message: 'Image saved to FTP successfully',
      imageUrl: result.imageUrl,
      ftpPath: result.filePath
    });

    } catch (error) {
        console.error('Error saving image to FTP:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}