/**
 * Perfect Image Flow Service
 * Handles the complete flow from OpenAI generation to persistent storage and display
 */

import { GeneratedDesign } from '@/lib/types';

export interface ImageFlowResult {
    success: boolean;
    design?: GeneratedDesign;
    error?: string;
    permanentUrl?: string;
    ftpPath?: string;
}

export class PerfectImageFlowService {
    /**
     * Complete image flow: Generate → Display → Save to FTP → Store in DB → Display from DB
     * Optimized for cart addition - saves images immediately when adding to cart
     */
    static async processDesignImage(design: GeneratedDesign, orderId: string): Promise<ImageFlowResult> {
        try {
            console.log('🎨 Starting perfect image flow for design:', design.id);
            console.log('🛒 Processing for cart addition - saving to FTP immediately');

            // Step 1: Check if image is temporary
            if (!this.isTemporaryUrl(design.imageUrl)) {
                console.log('✅ Image is already permanent, no processing needed');
                return {
                    success: true,
                    design: design,
                    permanentUrl: design.imageUrl
                };
            }

            // Step 2: Save to FTP immediately (cart addition)
            console.log('📸 Saving temporary image to FTP for cart...');
            const ftpResult = await this.saveToFTP(design.imageUrl, orderId, design.id);

            if (!ftpResult.success) {
                console.error('❌ FTP save failed:', ftpResult.error);
                return {
                    success: false,
                    error: ftpResult.error,
                    design: design // Return original design with temporary URL
                };
            }

            // Step 3: Update design with permanent URL
            const updatedDesign: GeneratedDesign = {
                ...design,
                imageUrl: ftpResult.permanentUrl!,
                ftpImageUrl: ftpResult.permanentUrl!,
                ftpPath: ftpResult.ftpPath
            };

            console.log('✅ Perfect image flow completed - image saved to FTP for cart');
            console.log('📁 FTP URL:', ftpResult.permanentUrl);
            console.log('📁 FTP Path:', ftpResult.ftpPath);

            return {
                success: true,
                design: updatedDesign,
                permanentUrl: ftpResult.permanentUrl,
                ftpPath: ftpResult.ftpPath
            };

        } catch (error) {
            console.error('❌ Perfect image flow failed:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                design: design
            };
        }
    }

    /**
     * Check if URL is temporary (will expire)
     */
    private static isTemporaryUrl(url: string): boolean {
        return url.includes('oaidalleapiprodscus.blob.core.windows.net') ||
            url.includes('st=') ||
            url.includes('se=');
    }

    /**
     * Save image to FTP server
     */
    private static async saveToFTP(imageUrl: string, orderId: string, designId: string): Promise<{
        success: boolean;
        permanentUrl?: string;
        ftpPath?: string;
        error?: string;
    }> {
        try {
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
                    permanentUrl: result.imageUrl,
                    ftpPath: result.ftpPath
                };
            } else {
                return {
                    success: false,
                    error: result.message || 'FTP upload failed'
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'FTP upload failed'
            };
        }
    }

    /**
     * Get the best display URL for an image
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
     * Process multiple designs for an order
     */
    static async processOrderImages(designs: GeneratedDesign[], orderId: string): Promise<GeneratedDesign[]> {
        const processedDesigns = await Promise.all(
            designs.map(design => this.processDesignImage(design, orderId))
        );

        return processedDesigns
            .filter(result => result.success)
            .map(result => result.design!);
    }
}

// Export utility functions
export const processDesignImage = PerfectImageFlowService.processDesignImage;
export const getDisplayImageUrl = PerfectImageFlowService.getDisplayUrl;
export const getFallbackImageUrl = PerfectImageFlowService.getFallbackImageUrl;
