import { NextRequest, NextResponse } from 'next/server';
import { downloadAndStoreImage, isTemporaryUrl } from '@/lib/services/imageStorage';

export async function POST(request: NextRequest) {
    try {
        const { imageUrl, orderId, designId } = await request.json();

        if (!imageUrl || !orderId) {
            return NextResponse.json({
                success: false,
                message: 'Image URL and Order ID are required'
            }, { status: 400 });
        }

        // Check if it's a temporary URL that needs downloading
        if (!isTemporaryUrl(imageUrl)) {
            return NextResponse.json({
                success: true,
                message: 'URL is already permanent',
                permanentUrl: imageUrl
            });
        }

        // Download and store the image
        const result = await downloadAndStoreImage(imageUrl, orderId, designId);

        if (result.success) {
            return NextResponse.json({
                success: true,
                message: 'Image downloaded and stored successfully',
                permanentUrl: result.permanentUrl
            });
        } else {
            return NextResponse.json({
                success: false,
                message: 'Failed to download and store image',
                error: result.error
            }, { status: 500 });
        }

    } catch (error) {
        console.error('Image download API error:', error);
        return NextResponse.json({
            success: false,
            message: 'Internal server error',
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
