/**
 * Image Persistence Service
 * Handles saving temporary OpenAI images to FTP and managing persistent URLs
 */

import { GeneratedDesign } from '@/lib/types';

export interface ImagePersistenceResult {
    success: boolean;
    permanentUrl?: string;
    ftpPath?: string;
    error?: string;
}

export class ImagePersistenceService {
    /**
     * Check if an image URL is temporary (will expire)
     */
    static isTemporaryUrl(url: string): boolean {
        return url.includes('oaidalleapiprodscus.blob.core.windows.net') ||
            url.includes('st=') ||
            url.includes('se=');
    }

    /**
     * Save a temporary image to FTP and return the permanent URL
     */
    static async saveImageToFTP(imageUrl: string, orderId: string, designId: string): Promise<ImagePersistenceResult> {
        try {
            console.log('🔄 Saving temporary image to FTP:', { imageUrl, orderId, designId });

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
                console.log('✅ Image saved to FTP successfully:', result.imageUrl);
                return {
                    success: true,
                    permanentUrl: result.imageUrl,
                    ftpPath: result.ftpPath
                };
            } else {
                console.error('❌ Failed to save image to FTP:', result.message);
                return {
                    success: false,
                    error: result.message
                };
            }
        } catch (error) {
            console.error('❌ Error saving image to FTP:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Process a design image - save to FTP if temporary, return permanent URL
     */
    static async processDesignImage(design: GeneratedDesign, orderId: string): Promise<GeneratedDesign> {
        // If image is already permanent, return as-is
        if (!this.isTemporaryUrl(design.imageUrl)) {
            console.log('✅ Image is already permanent:', design.imageUrl);
            return design;
        }

        // Save temporary image to FTP
        const result = await this.saveImageToFTP(design.imageUrl, orderId, design.id);

        if (result.success && result.permanentUrl) {
            return {
                ...design,
                imageUrl: result.permanentUrl,
                ftpImageUrl: result.permanentUrl,
                ftpPath: result.ftpPath
            };
        } else {
            console.warn('⚠️ Failed to save image to FTP, keeping original URL');
            return design;
        }
    }

    /**
     * Get the best available image URL for display
     * Priority: FTP URL > Original URL > Fallback
     */
    static getDisplayUrl(design: GeneratedDesign): string {
        // Use FTP URL if available
        if (design.ftpImageUrl) {
            return design.ftpImageUrl;
        }

        // Use original URL if not temporary
        if (!this.isTemporaryUrl(design.imageUrl)) {
            return design.imageUrl;
        }

        // Return fallback image
        return this.getFallbackImageUrl();
    }

    /**
     * Get fallback image URL
     */
    static getFallbackImageUrl(): string {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5YTNhZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIFVuYXZhaWxhYmxlPC90ZXh0Pjwvc3ZnPg==';
    }

    /**
     * Batch process multiple designs for an order
     */
    static async processOrderImages(designs: GeneratedDesign[], orderId: string): Promise<GeneratedDesign[]> {
        const processedDesigns = await Promise.all(
            designs.map(design => this.processDesignImage(design, orderId))
        );

        return processedDesigns;
    }
}

// Export utility functions for easy use
export const isTemporaryImageUrl = ImagePersistenceService.isTemporaryUrl;
export const getDisplayImageUrl = ImagePersistenceService.getDisplayUrl;
export const processDesignImage = ImagePersistenceService.processDesignImage;
