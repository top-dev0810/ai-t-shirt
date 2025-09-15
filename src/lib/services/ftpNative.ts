import ftp from 'ftp';
import { Readable } from 'stream';
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
    ftpImageUrl?: string;
    ftpPath?: string;
    prompt: {
        text: string;
        artStyle: string;
        musicGenre: string;
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

export class FTPNativeService {
    private host: string;
    private username: string;
    private password: string;

    constructor() {
        this.host = FTP_CONFIG.host;
        this.username = FTP_CONFIG.username;
        this.password = FTP_CONFIG.password;
    }

    // Connect to FTP server
    async connect(): Promise<ftp> {
        return new Promise((resolve, reject) => {
            const client = new ftp();

            client.on('ready', () => {
                console.log('✅ FTP: Connection established successfully');
                resolve(client);
            });

            client.on('error', (err) => {
                console.error('❌ FTP: Connection failed:', err);
                reject(err);
            });

            console.log(`🔄 FTP: Connecting to FTP server: ${this.host}`);
            console.log(`🔄 FTP: Username: ${this.username}`);
            console.log(`🔄 FTP: Port: 21`);

            client.connect({
                host: this.host,
                user: this.username,
                password: this.password,
                port: 21
            });
        });
    }

    // Create directory on FTP server
    async createDirectory(client: ftp, path: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            client.mkdir(path, true, (err) => {
                if (err) {
                    console.error(`❌ FTP: Failed to create directory: ${path}`, err);
                    reject(err);
                } else {
                    console.log(`✅ FTP: Directory created successfully: ${path}`);
                    resolve(true);
                }
            });
        });
    }

    // Download image from URL and upload to FTP
    async downloadAndUploadImage(client: ftp, imageUrl: string, ftpPath: string): Promise<{ success: boolean; localPath?: string; error?: string }> {
        try {
            console.log(`🔄 FTP: Downloading image from: ${imageUrl}`);

            // Download the image
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Failed to download image: ${response.statusText} (${response.status})`);
            }

            const imageBuffer = await response.arrayBuffer() as ArrayBuffer;
            const imageData = Buffer.from(imageBuffer);

            console.log(`✅ FTP: Image downloaded, size: ${imageData.length} bytes`);

            // Ensure the directory exists before uploading
            const directoryPath = ftpPath.substring(0, ftpPath.lastIndexOf('/'));
            console.log(`🔄 FTP: Ensuring directory exists: ${directoryPath}`);

            // Create directory structure if it doesn't exist
            try {
                await this.createDirectory(client, directoryPath);
            } catch {
                console.log(`⚠️ FTP: Directory might already exist: ${directoryPath}`);
            }

            // Upload to FTP using stream directly (no temporary file)
            console.log(`🔄 FTP: Uploading to: ${ftpPath}`);

            // Create a readable stream from the buffer
            const imageStream = new Readable({
                read() {
                    this.push(imageData);
                    this.push(null); // End of stream
                }
            });

            // Upload stream directly to FTP
            await new Promise<void>((resolve, reject) => {
                client.put(imageStream, ftpPath, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            console.log(`✅ FTP: Image uploaded successfully to: ${ftpPath}`);

            return {
                success: true,
                localPath: ftpPath
            };
        } catch (error) {
            console.error(`❌ FTP: Failed to download and upload image:`, error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    // Upload text content as file
    async uploadTextFile(client: ftp, content: string, ftpPath: string): Promise<boolean> {
        try {
            console.log(`Uploading text file: ${ftpPath}`);

            // Create a readable stream from the content (no temporary file)
            const textStream = new Readable({
                read() {
                    this.push(content, 'utf8');
                    this.push(null); // End of stream
                }
            });

            // Upload stream directly to FTP
            await new Promise<void>((resolve, reject) => {
                client.put(textStream, ftpPath, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            console.log(`Text file uploaded successfully: ${ftpPath}`);
            return true;
        } catch (error) {
            console.error(`Failed to upload text file: ${ftpPath}`, error);
            return false;
        }
    }

    // Create order folder structure and save files
    async createOrderFolder(orderData: OrderFolderData): Promise<FTPUploadResult> {
        let client: ftp | null = null;

        try {
            console.log(`🎯 FTP: Starting order folder creation for order: ${orderData.order.id}`);
            console.log(`🎯 FTP: Design image URL: ${orderData.designImageUrl}`);

            // Connect to FTP server
            console.log(`🔄 FTP: Connecting to FTP server...`);
            client = await this.connect();
            console.log(`✅ FTP: Connected successfully`);

            // Create proper directory structure
            const orderFolderPath = `orders/${orderData.order.id}`;
            const designFolderPath = `${orderFolderPath}/designs`;

            console.log(`🔄 FTP: Creating order folder: ${orderFolderPath}`);
            console.log(`🔄 FTP: Creating design folder: ${designFolderPath}`);

            // Create order folder
            try {
                await this.createDirectory(client, orderFolderPath);
            } catch {
                console.log(`⚠️ FTP: Order folder might already exist: ${orderFolderPath}`);
            }

            // Create design subfolder
            try {
                await this.createDirectory(client, designFolderPath);
            } catch {
                console.log(`⚠️ FTP: Design folder might already exist: ${designFolderPath}`);
            }

            // Download and upload design image
            const imageFileName = `design_${orderData.design.id}.jpg`;
            const imageFilePath = `${designFolderPath}/${imageFileName}`;

            console.log(`🔄 FTP: Processing design image...`);
            console.log(`📸 FTP: Image file path: ${imageFilePath}`);

            const imageResult = await this.downloadAndUploadImage(client, orderData.designImageUrl, imageFilePath);
            if (!imageResult.success) {
                throw new Error(`Failed to upload design image: ${imageResult.error}`);
            }

            // Create order JSON file
            console.log(`🔄 FTP: Creating order JSON file...`);
            const jsonResult = await this.createOrderJSON(client, orderData, orderFolderPath);
            if (!jsonResult.success) {
                throw new Error(`Failed to create order JSON: ${jsonResult.message}`);
            }

            const publicImageUrl = `https://${FTP_CONFIG.host}/${imageFilePath}`;
            console.log(`✅ FTP: Order folder created successfully`);
            console.log(`📁 FTP: Public image URL: ${publicImageUrl}`);

            return {
                success: true,
                message: 'Order folder created successfully',
                filePath: orderFolderPath,
                imageUrl: publicImageUrl
            };

        } catch (error) {
            console.error('❌ FTP: Error creating order folder:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        } finally {
            // Disconnect from FTP
            if (client) {
                console.log(`🔄 FTP: Disconnecting from FTP server...`);
                client.end();
            }
        }
    }

    // Create order JSON file
    async createOrderJSON(client: ftp, orderData: OrderFolderData, orderFolderPath: string): Promise<FTPUploadResult> {
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
            const jsonUploaded = await this.uploadTextFile(client, jsonString, jsonFilePath);
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

    // Test FTP connection and directory creation
    async testConnection(): Promise<{ success: boolean; message: string }> {
        let client: ftp | null = null;

        try {
            client = await this.connect();

            // Test directory creation
            const testPath = 'test_directory';
            console.log(`🔄 FTP: Testing directory creation with path: ${testPath}`);

            try {
                await this.createDirectory(client, testPath);
                console.log(`✅ FTP: Test directory created successfully: ${testPath}`);
            } catch {
                console.log(`⚠️ FTP: Test directory might already exist: ${testPath}`);
            }

            // Test file upload
            const testFilePath = `${testPath}/test.txt`;
            const testContent = 'This is a test file for FTP upload verification.';
            const fileUploaded = await this.uploadTextFile(client, testContent, testFilePath);

            if (!fileUploaded) {
                return {
                    success: false,
                    message: 'Failed to upload test file'
                };
            }

            return {
                success: true,
                message: 'FTP connection and directory creation test successful'
            };
        } catch (error) {
            console.error('❌ FTP: Test failed:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        } finally {
            if (client) {
                client.end();
            }
        }
    }
}

// Export a singleton instance
export const ftpNativeService = new FTPNativeService();
