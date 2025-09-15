import { DatabaseService } from './database';

export interface ImageStorageResult {
    success: boolean;
    permanentUrl?: string;
    error?: string;
}

/**
 * Downloads an image from a temporary URL and stores it permanently
 * This is needed because OpenAI DALL-E URLs expire after a few hours
 */
export async function downloadAndStoreImage(
    temporaryUrl: string,
    orderId: number,
    designId?: number
): Promise<ImageStorageResult> {
    try {
        console.log('Downloading image from temporary URL:', temporaryUrl);

        // Download the image
        const response = await fetch(temporaryUrl);
        if (!response.ok) {
            throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
        }

        const imageBuffer = await response.arrayBuffer();
        const imageData = Buffer.from(imageBuffer);

        // Convert to base64 for storage
        const base64Image = imageData.toString('base64');
        const mimeType = response.headers.get('content-type') || 'image/png';
        const dataUrl = `data:${mimeType};base64,${base64Image}`;

        console.log('Image downloaded successfully, size:', imageData.length, 'bytes');

        // Store in database
        const permanentUrl = await storeImageInDatabase(dataUrl, orderId, designId);

        return {
            success: true,
            permanentUrl
        };

    } catch (error) {
        console.error('Error downloading and storing image:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Stores image data in the database
 */
async function storeImageInDatabase(
    imageData: string,
    orderId: number,
    designId?: number
): Promise<string> {
    try {
        // For now, we'll store the base64 data directly in the database
        // In production, you might want to use a cloud storage service like AWS S3, Cloudinary, etc.

        if (designId) {
            // Update existing design record
            await DatabaseService.updateDesignImage(designId, imageData);
        } else {
            // Create new design record
            await DatabaseService.createDesignRecord({
                orderId,
                imageUrl: imageData,
                promptText: 'AI Generated Design',
                artStyle: 'ai-generated',
                musicGenre: 'electronic',
                isAiGenerated: true
            });
        }

        return imageData; // Return the data URL as the permanent URL

    } catch (error) {
        console.error('Error storing image in database:', error);
        throw error;
    }
}

/**
 * Checks if a URL is a temporary OpenAI URL that needs to be downloaded
 */
export function isTemporaryUrl(url: string): boolean {
    return url.includes('oaidalleapiprodscus.blob.core.windows.net') &&
        url.includes('st=') &&
        url.includes('se=');
}

/**
 * Gets a permanent image URL, downloading if necessary
 */
export async function getPermanentImageUrl(
    imageUrl: string,
    orderId: number,
    designId?: number
): Promise<string> {
    // If it's already a permanent URL (data URL), return it
    if (imageUrl.startsWith('data:')) {
        return imageUrl;
    }

    // If it's a temporary URL, download and store it
    if (isTemporaryUrl(imageUrl)) {
        console.log('Detected temporary URL, downloading and storing...');
        const result = await downloadAndStoreImage(imageUrl, orderId, designId);

        if (result.success && result.permanentUrl) {
            return result.permanentUrl;
        } else {
            console.error('Failed to download image:', result.error);
            // Return a fallback image
            return getFallbackImageUrl();
        }
    }

    // For other URLs, return as-is
    return imageUrl;
}

/**
 * Returns a fallback image URL when image loading fails
 */
function getFallbackImageUrl(): string {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MTYgNDQ4SDYwOFY1NzZINDE2VjQ0OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+PHQ+SW1hZ2UgTm90IEF2YWlsYWJsZTwvdD48L3A+Cjwvc3ZnPgo=';
}
