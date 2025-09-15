import { Client } from 'basic-ftp';
import { FTP_CONFIG } from '@/lib/constants';

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

interface GeneratedDesign {
    id: string;
    imageUrl: string;
    prompt: {
        text: string;
        artStyle: string;
        musicGenre: string;
        imageUrl?: string;
    };
    userId: string;
    createdAt: Date;
    isPublic: boolean;
}

interface OrderFolderData {
    order: FTPOrderData;
    design: GeneratedDesign;
    designImageUrl: string;
}

interface FTPUploadResult {
    success: boolean;
    message: string;
    filePath?: string;
    imageUrl?: string;
}

export class ServerFTPService {
    private client: Client;
    private host: string;
    private username: string;
    private password: string;
    private isConnected: boolean = false;

    constructor() {
        this.client = new Client();
        this.host = FTP_CONFIG.host;
        this.username = FTP_CONFIG.username;
        this.password = FTP_CONFIG.password;
    }

    // Connect to FTP server
    async connect(): Promise<boolean> {
        try {
            console.log(`Connecting to FTP server: ${this.host}`);
            console.log(`Username: ${this.username}`);

            await this.client.access({
                host: this.host,
                user: this.username,
                password: this.password,
                secure: false,
                port: 21
            });

            this.isConnected = true;
            console.log('FTP connection established successfully');
            return true;
        } catch (error) {
            console.error('FTP connection failed:', error);
            this.isConnected = false;
            return false;
        }
    }

    // Create directory on FTP server
    async createDirectory(path: string): Promise<boolean> {
        if (!this.isConnected) {
            throw new Error('FTP not connected');
        }

        try {
            console.log(`Creating directory: ${path}`);
            await this.client.ensureDir(path);
            console.log(`Directory created successfully: ${path}`);
            return true;
        } catch (error) {
            console.error(`Failed to create directory: ${path}`, error);
            return false;
        }
    }

    // Download image from URL and upload to FTP
    async downloadAndUploadImage(imageUrl: string, ftpPath: string): Promise<{ success: boolean; localPath?: string; error?: string }> {
        try {
            console.log(`Downloading image from: ${imageUrl}`);

            // Download the image
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to download image: ${response.statusText}`);
            }

            const imageBuffer = await response.arrayBuffer() as ArrayBuffer;
            const imageData = Buffer.from(imageBuffer);

            console.log(`Image downloaded, size: ${imageData.length} bytes`);

            // Upload to FTP - convert Buffer to Readable stream
            const { Readable } = await import('stream');
            const imageStream = new Readable({
                read() {
                    this.push(imageData);
                    this.push(null);
                }
            });
            await this.client.uploadFrom(imageStream, ftpPath);
            console.log(`Image uploaded successfully to: ${ftpPath}`);

            return {
                success: true,
                localPath: ftpPath
            };
        } catch (error) {
            console.error(`Failed to download and upload image:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    // Upload text content as file
    async uploadTextFile(content: string, ftpPath: string): Promise<boolean> {
        try {
            console.log(`Uploading text file: ${ftpPath}`);
            const buffer = Buffer.from(content, 'utf8');
            const { Readable } = await import('stream');
            const textStream = new Readable({
                read() {
                    this.push(buffer);
                    this.push(null);
                }
            });
            await this.client.uploadFrom(textStream, ftpPath);
            console.log(`Text file uploaded successfully: ${ftpPath}`);
            return true;
        } catch (error) {
            console.error(`Failed to upload text file: ${ftpPath}`, error);
            return false;
        }
    }

    // Create order folder structure and save files
    async createOrderFolder(orderData: OrderFolderData): Promise<FTPUploadResult> {
        try {
            // Connect to FTP server
            const connected = await this.connect();
            if (!connected) {
                throw new Error('Failed to connect to FTP server');
            }

            // Create order folder
            const orderFolderPath = `orders/${orderData.order.id}`;
            const folderCreated = await this.createDirectory(orderFolderPath);
            if (!folderCreated) {
                throw new Error('Failed to create order folder');
            }

            // Download and upload design image
            const imageFileName = `design_${orderData.design.id}.jpg`;
            const imageFilePath = `${orderFolderPath}/${imageFileName}`;

            const imageResult = await this.downloadAndUploadImage(orderData.designImageUrl, imageFilePath);
            if (!imageResult.success) {
                throw new Error(`Failed to upload design image: ${imageResult.error}`);
            }

            // Create order JSON file
            const jsonResult = await this.createOrderJSON(orderData, orderFolderPath);
            if (!jsonResult.success) {
                throw new Error(`Failed to create order JSON: ${jsonResult.message}`);
            }

            // Disconnect from FTP
            await this.disconnect();

            return {
                success: true,
                message: 'Order folder created successfully',
                filePath: orderFolderPath,
                imageUrl: `https://${this.host}/${imageFilePath}`
            };

        } catch (error) {
            console.error('Error creating order folder:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    // Create order JSON file
    async createOrderJSON(orderData: OrderFolderData, orderFolderPath: string): Promise<FTPUploadResult> {
        try {
            const jsonFileName = `order_details.json`;
            const jsonFilePath = `${orderFolderPath}/${jsonFileName}`;

            // Prepare JSON content
            const jsonContent = {
                orderId: orderData.order.id,
                orderDate: orderData.order.orderDate,
                customer: {
                    name: orderData.order.customerName,
                    email: orderData.order.customerEmail,
                    phone: orderData.order.customerPhone
                },
                items: orderData.order.items.map(item => ({
                    style: item.style.name,
                    color: item.color.name,
                    size: item.size,
                    printSize: item.printSize.name,
                    placement: item.placement,
                    quantity: item.quantity,
                    price: item.price
                })),
                design: {
                    id: orderData.design.id,
                    prompt: orderData.design.prompt,
                    imageUrl: orderData.design.imageUrl,
                    createdAt: orderData.design.createdAt
                },
                totalAmount: orderData.order.totalAmount,
                status: orderData.order.status,
                paymentMethod: orderData.order.paymentMethod,
                shippingAddress: orderData.order.shippingAddress
            };

            // Upload JSON file
            const jsonString = JSON.stringify(jsonContent, null, 2);
            const jsonUploaded = await this.uploadTextFile(jsonString, jsonFilePath);
            if (!jsonUploaded) {
                throw new Error('Failed to upload order JSON');
            }

            return {
                success: true,
                message: 'Order JSON created successfully',
                filePath: jsonFilePath
            };

        } catch (error) {
            console.error('Error creating order JSON:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    // Disconnect from FTP
    async disconnect(): Promise<void> {
        if (this.isConnected) {
            try {
                console.log('Disconnecting from FTP server...');
                this.client.close();
                this.isConnected = false;
                console.log('FTP disconnected');
            } catch (error) {
                console.error('Error disconnecting from FTP:', error);
            }
        }
    }

    // Test FTP connection
    async testConnection(): Promise<{ success: boolean; message: string }> {
        try {
            const connected = await this.connect();
            if (connected) {
                await this.disconnect();
                return {
                    success: true,
                    message: 'FTP connection test successful'
                };
            } else {
                return {
                    success: false,
                    message: 'Failed to connect to FTP server'
                };
            }
        } catch (error) {
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
}

// Export a singleton instance
export const serverFtpService = new ServerFTPService();
