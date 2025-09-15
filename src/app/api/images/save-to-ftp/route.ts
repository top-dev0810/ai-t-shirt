import { NextRequest, NextResponse } from 'next/server';
import { ftpImageStorage } from '@/lib/services/ftpStorage';

export async function POST(request: NextRequest) {
    try {
        const { imageUrl, orderId, fileName } = await request.json();

        if (!imageUrl || !orderId) {
            return NextResponse.json({
                success: false,
                message: 'Image URL and Order ID are required'
            }, { status: 400 });
        }

        // Create order folder first
        const folderCreated = await ftpImageStorage.createOrderFolder(orderId);
        if (!folderCreated) {
            return NextResponse.json({
                success: false,
                message: 'Failed to create order folder'
            }, { status: 500 });
        }

        // Save image to FTP
        const result = await ftpImageStorage.saveImageToFTP(imageUrl, orderId, fileName);

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Image saved to FTP successfully',
                filePath: result.filePath,
                publicUrl: result.publicUrl
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'Failed to save image to FTP',
                error: result.error
            }, { status: 500 });
        }

    } catch (error) {
        console.error('FTP save API error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const imageUrl = url.searchParams.get('imageUrl');
        const orderId = url.searchParams.get('orderId');

        if (!imageUrl || !orderId) {
            return NextResponse.json({
                success: false,
                message: 'Image URL and Order ID are required'
            }, { status: 400 });
        }

        // Process the image URL (download if temporary, return as-is if permanent)
        const processedUrl = await ftpImageStorage.processImageUrl(imageUrl, parseInt(orderId));

        return NextResponse.json({
            success: true,
            message: 'Image URL processed successfully',
            processedUrl
        });

    } catch (error) {
        console.error('FTP process API error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
