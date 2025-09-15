import { GeneratedDesign } from '@/lib/types';

interface ImageStorageResult {
    success: boolean;
    imageUrl?: string;
    ftpPath?: string;
    error?: string;
}

export class ImageStorageService {
    // Save OpenAI generated image to FTP and return persistent URL
    static async saveImageToFTP(imageUrl: string, orderId: string, designId: string): Promise<ImageStorageResult> {
        try {
            console.log('Saving image to FTP via API:', { imageUrl, orderId, designId });

            const response = await fetch('/api/images/save-to-ftp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    imageUrl,
                    orderId,
                    designId
                }),
            });

            const result = await response.json();

            if (result.success) {
                return {
                    success: true,
                    imageUrl: result.imageUrl,
                    ftpPath: result.ftpPath
                };
            } else {
                return {
                    success: false,
                    error: result.message
                };
            }
        } catch (error) {
            console.error('Error saving image to FTP:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    // Generate a persistent image URL for display
    static getPersistentImageUrl(design: GeneratedDesign, orderId?: string): string {
        // If the image is already saved to FTP, use that URL
        if (design.ftpImageUrl) {
            return design.ftpImageUrl;
        }

        // If we have an order ID, try to construct the FTP URL
        if (orderId) {
            return `https://195.35.44.163/orders/${orderId}/design_${design.id}.jpg`;
        }

        // Fallback to original URL (temporary)
        return design.imageUrl;
    }

    // Check if an image URL is from FTP (persistent)
    static isFTPImageUrl(url: string): boolean {
        return url.includes('195.35.44.163') || url.includes('customized.bandadda.com');
    }

    // Check if an image URL is temporary (OpenAI)
    static isTemporaryImageUrl(url: string): boolean {
        return url.includes('oaidalleapiprodscus.blob.core.windows.net') ||
            url.includes('dalleprodsec.blob.core.windows.net');
    }
}

// Export individual functions for API routes
export const isTemporaryUrl = ImageStorageService.isTemporaryImageUrl;

export async function downloadAndStoreImage(imageUrl: string, orderId: string, designId: string): Promise<{ success: boolean; permanentUrl?: string; error?: string }> {
    const result = await ImageStorageService.saveImageToFTP(imageUrl, orderId, designId);

    if (result.success) {
        return {
            success: true,
            permanentUrl: result.imageUrl
        };
    } else {
        return {
            success: false,
            error: result.error
        };
    }
}

// Helper function to save design image and update the design object
export async function saveDesignImage(design: GeneratedDesign, orderId: string): Promise<GeneratedDesign> {
    // If image is already saved to FTP, return as is
    if (ImageStorageService.isFTPImageUrl(design.imageUrl)) {
        return design;
    }

    // If image is temporary, save it to FTP
    if (ImageStorageService.isTemporaryImageUrl(design.imageUrl)) {
        const result = await ImageStorageService.saveImageToFTP(design.imageUrl, orderId, design.id);

        if (result.success && result.imageUrl) {
            return {
                ...design,
                imageUrl: result.imageUrl,
                ftpImageUrl: result.imageUrl,
                ftpPath: result.ftpPath
            };
        } else {
            console.warn('Failed to save image to FTP, using temporary URL:', result.error);
            return design;
        }
    }

    // For other URLs (like fallback images), return as is
    return design;
}