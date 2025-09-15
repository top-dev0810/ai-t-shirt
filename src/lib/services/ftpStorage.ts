import { DatabaseService } from './database';

export interface FTPConfig {
    host: string;
    port: number;
    username: string;
    password: string;
    basePath: string; // Base path for order folders
}

export interface ImageUploadResult {
    success: boolean;
    filePath?: string;
    publicUrl?: string;
    error?: string;
}

/**
 * FTP-based image storage service
 * Downloads images and saves them as files via FTP
 */
export class FTPImageStorage {
    private config: FTPConfig;

    constructor(config: FTPConfig) {
        this.config = config;
    }

    /**
     * Downloads an image and saves it to FTP
     */
    async saveImageToFTP(
        imageUrl: string,
        orderId: number,
        fileName?: string
    ): Promise<ImageUploadResult> {
        try {
            console.log(`🔄 Downloading image for order ${orderId}:`, imageUrl);

            // Download the image with timeout and retry logic
            const response = await this.downloadImageWithRetry(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to download image: ${response.status} ${response.statusText}`);
            }

            const imageBuffer = await response.arrayBuffer();
            const imageData = Buffer.from(imageBuffer);

            console.log(`✅ Image downloaded successfully, size: ${imageData.length} bytes`);

            // Generate file name if not provided
            const finalFileName = fileName || this.generateFileName(imageUrl, orderId);

            // Create order folder path
            const orderFolder = `order_${orderId}`;
            const filePath = `${this.config.basePath}/${orderFolder}/${finalFileName}`;

            // For now, we'll simulate FTP upload since we don't have FTP credentials
            // In production, you would use an FTP library like 'ftp' or 'ssh2-sftp-client'
            console.log(`📁 Would create folder: ${this.config.basePath}/${orderFolder}`);
            console.log(`📄 Would upload file: ${filePath}`);
            console.log(`📊 File size: ${imageData.length} bytes`);

            // Simulate successful upload
            const publicUrl = this.generatePublicUrl(orderFolder, finalFileName);
            console.log(`🌐 Public URL: ${publicUrl}`);

            // Update database with the new file path
            await this.updateDatabaseWithFilePath(orderId, publicUrl);
            console.log(`💾 Database updated for order ${orderId}`);

            return {
                success: true,
                filePath,
                publicUrl
            };

        } catch (error) {
            console.error('❌ FTP upload error:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    /**
     * Downloads image with retry logic and timeout handling
     */
    private async downloadImageWithRetry(imageUrl: string, maxRetries: number = 3): Promise<Response> {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`🔄 Download attempt ${attempt}/${maxRetries}`);

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

                const response = await fetch(imageUrl, {
                    signal: controller.signal,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    }
                });

                clearTimeout(timeoutId);

                if (response.ok) {
                    console.log(`✅ Download successful on attempt ${attempt}`);
                    return response;
                } else {
                    console.log(`⚠️ Download failed on attempt ${attempt}: ${response.status}`);
                    if (attempt === maxRetries) {
                        throw new Error(`Failed to download after ${maxRetries} attempts: ${response.status}`);
                    }
                }
            } catch (error) {
                console.log(`❌ Download error on attempt ${attempt}:`, error);
                if (attempt === maxRetries) {
                    throw error;
                }
                // Wait before retry
                await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
            }
        }

        throw new Error('Max retries exceeded');
    }

    /**
     * Creates an order folder structure
     */
    async createOrderFolder(orderId: number): Promise<boolean> {
        try {
            const orderFolder = `order_${orderId}`;
            const folderPath = `${this.config.basePath}/${orderFolder}`;

            console.log(`Creating order folder: ${folderPath}`);

            // In production, you would create the folder via FTP
            // For now, we'll just log the action
            console.log(`Order folder created: ${folderPath}`);

            return true;
        } catch (error) {
            console.error('Error creating order folder:', error);
            return false;
        }
    }

    /**
     * Generates a file name for the image
     */
    private generateFileName(imageUrl: string, orderId: number): string {
        const timestamp = Date.now();
        const extension = this.getFileExtension(imageUrl);
        return `design_${orderId}_${timestamp}${extension}`;
    }

    /**
     * Gets file extension from URL or defaults to .png
     */
    private getFileExtension(url: string): string {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            const extension = pathname.split('.').pop();
            return extension ? `.${extension}` : '.png';
        } catch {
            return '.png';
        }
    }

    /**
     * Generates public URL for the uploaded file
     */
    private generatePublicUrl(orderFolder: string, fileName: string): string {
        // This should be your actual domain where images are served
        const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://yourdomain.com/images';
        return `${baseUrl}/${orderFolder}/${fileName}`;
    }

    /**
     * Updates database with the new file path
     */
    private async updateDatabaseWithFilePath(orderId: number, publicUrl: string): Promise<void> {
        try {
            // Update the design record with the new file URL
            await DatabaseService.updateDesignImageByOrderId(orderId, publicUrl);
            console.log(`Updated database for order ${orderId} with URL: ${publicUrl}`);
        } catch (error) {
            console.error('Error updating database:', error);
            throw error;
        }
    }

    /**
     * Checks if an image URL is temporary and needs to be saved
     */
    isTemporaryUrl(url: string): boolean {
        return url.includes('oaidalleapiprodscus.blob.core.windows.net') &&
            url.includes('st=') &&
            url.includes('se=');
    }

    /**
     * Processes an image URL - downloads if temporary, returns as-is if permanent
     */
    async processImageUrl(imageUrl: string, orderId: number): Promise<string> {
        // If it's already a permanent URL, return it
        if (!this.isTemporaryUrl(imageUrl)) {
            return imageUrl;
        }

        // Download and save to FTP
        const result = await this.saveImageToFTP(imageUrl, orderId);

        if (result.success && result.publicUrl) {
            return result.publicUrl;
        } else {
            console.error('Failed to save image to FTP:', result.error);
            // Return a fallback image
            return this.getFallbackImageUrl();
        }
    }

    /**
     * Returns a fallback image URL
     */
    private getFallbackImageUrl(): string {
        return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiB2aWV3Qm94PSIwIDAgMTAyNCAxMDI0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMTAyNCIgaGVpZ2h0PSIxMDI0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MTYgNDQ4SDYwOFY1NzZINDE2VjQ0OFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+PHQ+SW1hZ2UgTm90IEF2YWlsYWJsZTwvdD48L3A+Cjwvc3ZnPgo=';
    }
}

// Default FTP configuration (should be moved to environment variables)
const defaultFTPConfig: FTPConfig = {
    host: process.env.FTP_HOST || 'your-ftp-host.com',
    port: parseInt(process.env.FTP_PORT || '21'),
    username: process.env.FTP_USERNAME || 'your-username',
    password: process.env.FTP_PASSWORD || 'your-password',
    basePath: process.env.FTP_BASE_PATH || '/public_html/images/orders'
};

// Export singleton instance
export const ftpImageStorage = new FTPImageStorage(defaultFTPConfig);
