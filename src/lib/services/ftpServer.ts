import { Client } from 'basic-ftp';
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

export class FTPServerService {
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
        // Enable verbose logging for debugging
        this.client.ftp.verbose = true;
    }

    // Connect to FTP server
    async connect(): Promise<boolean> {
        if (this.isConnected) {
            console.log('🔄 FTP: Already connected');
            return true;
        }

        try {
            console.log(`🔄 FTP: Connecting to FTP server: ${this.host}`);
            console.log(`🔄 FTP: Username: ${this.username}`);
            console.log(`🔄 FTP: Port: 21`);

            await this.client.access({
                host: this.host,
                user: this.username,
                password: this.password,
                secure: false,
                port: 21
            });

            this.isConnected = true;
            console.log('✅ FTP: Connection established successfully');
            return true;
        } catch (error) {
            console.error('❌ FTP: Connection failed:', error);
            console.error('❌ FTP: Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                host: this.host,
                username: this.username,
                port: 21
            });
            this.isConnected = false;
            return false;
        }
    }

    // Create directory on FTP server (handles nested paths)
    async createDirectory(path: string): Promise<boolean> {
        if (!this.isConnected) {
            throw new Error('FTP not connected');
        }

        try {
            console.log(`🔄 FTP: Creating directory structure: ${path}`);

            // Split path into parts and create each level step by step
            const pathParts = path.split('/').filter(part => part.length > 0);
            let currentPath = '';

            for (let i = 0; i < pathParts.length; i++) {
                currentPath = currentPath ? `${currentPath}/${pathParts[i]}` : pathParts[i];
                console.log(`🔄 FTP: Creating directory level ${i + 1}/${pathParts.length}: ${currentPath}`);

                try {
                    // First, try to list the directory to see if it exists
                    try {
                        await this.client.list(currentPath);
                        console.log(`✅ FTP: Directory already exists: ${currentPath}`);
                        continue;
                    } catch (listError) {
                        // Directory doesn't exist, try to create it
                        console.log(`🔄 FTP: Directory doesn't exist, creating: ${currentPath}`);
                        console.log(`🔄 FTP: List error: ${listError instanceof Error ? listError.message : 'Unknown error'}`);
                    }

                    // Try to create the directory using ensureDir
                    try {
                        await this.client.ensureDir(currentPath);
                        console.log(`✅ FTP: Directory created successfully: ${currentPath}`);
                    } catch (ensureDirError) {
                        console.error(`❌ FTP: ensureDir failed for: ${currentPath}`, ensureDirError);
                        throw new Error(`Failed to create directory: ${currentPath}. Error: ${ensureDirError instanceof Error ? ensureDirError.message : 'Unknown error'}`);
                    }
                } catch (dirError) {
                    console.error(`❌ FTP: Failed to create directory level: ${currentPath}`, dirError);
                    throw new Error(`Failed to create directory: ${currentPath}. Error: ${dirError instanceof Error ? dirError.message : 'Unknown error'}`);
                }
            }

            console.log(`✅ FTP: Directory structure created successfully: ${path}`);
            return true;
        } catch (error) {
            console.error(`❌ FTP: Failed to create directory: ${path}`, error);
            console.error(`❌ FTP: Error details:`, {
                message: error instanceof Error ? error.message : 'Unknown error',
                path: path,
                pathParts: path.split('/').filter(part => part.length > 0)
            });
            return false;
        }
    }

    // Download image from URL and upload to FTP
    async downloadAndUploadImage(imageUrl: string, ftpPath: string): Promise<{ success: boolean; localPath?: string; error?: string }> {
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
            const dirCreated = await this.createDirectory(directoryPath);
            if (!dirCreated) {
                throw new Error(`Failed to create directory: ${directoryPath}`);
            }

            // Upload to FTP - convert Buffer to Readable stream
            console.log(`🔄 FTP: Creating Readable stream for upload...`);
            const imageStream = new Readable({
                read() {
                    this.push(imageData);
                    this.push(null);
                }
            });

            console.log(`🔄 FTP: Uploading to: ${ftpPath}`);
            await this.client.uploadFrom(imageStream, ftpPath);
            console.log(`✅ FTP: Image uploaded successfully to: ${ftpPath}`);

            return {
                success: true,
                localPath: ftpPath
            };
        } catch (error) {
            console.error(`❌ FTP: Failed to download and upload image:`, error);
            console.error(`❌ FTP: Error details:`, {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                imageUrl,
                ftpPath
            });
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
            console.log(`🎯 FTP: Starting order folder creation for order: ${orderData.order.id}`);
            console.log(`🎯 FTP: Design image URL: ${orderData.designImageUrl}`);

            // Connect to FTP server
            console.log(`🔄 FTP: Connecting to FTP server...`);
            const connected = await this.connect();
            if (!connected) {
                console.error(`❌ FTP: Failed to connect to FTP server`);
                throw new Error('Failed to connect to FTP server');
            }
            console.log(`✅ FTP: Connected successfully`);

            // Create proper directory structure
            const orderFolderPath = `orders/${orderData.order.id}`;
            const designFolderPath = `${orderFolderPath}/designs`;

            console.log(`🔄 FTP: Creating order folder: ${orderFolderPath}`);
            console.log(`🔄 FTP: Creating design folder: ${designFolderPath}`);

            // Create order folder (this will create all parent directories)
            const orderFolderCreated = await this.createDirectory(orderFolderPath);
            if (!orderFolderCreated) {
                throw new Error('Failed to create order folder');
            }

            // Verify order folder was created
            const orderFolderExists = await this.verifyDirectoryExists(orderFolderPath);
            if (!orderFolderExists) {
                throw new Error('Order folder was not created successfully');
            }

            // Create design subfolder
            const designFolderCreated = await this.createDirectory(designFolderPath);
            if (!designFolderCreated) {
                throw new Error('Failed to create design folder');
            }

            // Verify design folder was created
            const designFolderExists = await this.verifyDirectoryExists(designFolderPath);
            if (!designFolderExists) {
                throw new Error('Design folder was not created successfully');
            }

            // Download and upload design image
            const imageFileName = `design_${orderData.design.id}.jpg`;
            const imageFilePath = `${designFolderPath}/${imageFileName}`;

            console.log(`🔄 FTP: Processing design image...`);
            console.log(`📸 FTP: Image file path: ${imageFilePath}`);

            const imageResult = await this.downloadAndUploadImage(orderData.designImageUrl, imageFilePath);
            if (!imageResult.success) {
                throw new Error(`Failed to upload design image: ${imageResult.error}`);
            }

            // Create order JSON file
            console.log(`🔄 FTP: Creating order JSON file...`);
            const jsonResult = await this.createOrderJSON(orderData, orderFolderPath);
            if (!jsonResult.success) {
                throw new Error(`Failed to create order JSON: ${jsonResult.message}`);
            }

            // Disconnect from FTP
            console.log(`🔄 FTP: Disconnecting from FTP server...`);
            await this.disconnect();

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
            console.error('❌ FTP: Error details:', {
                message: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                orderId: orderData.order.id
            });

            // Try to disconnect even if there was an error
            try {
                await this.disconnect();
            } catch (disconnectError) {
                console.error('❌ FTP: Error disconnecting:', disconnectError);
            }

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

    // Verify directory exists
    async verifyDirectoryExists(path: string): Promise<boolean> {
        if (!this.isConnected) {
            return false;
        }

        try {
            await this.client.list(path);
            console.log(`✅ FTP: Directory exists: ${path}`);
            return true;
        } catch (error) {
            console.log(`❌ FTP: Directory does not exist: ${path}`);
            console.log(`❌ FTP: List error: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return false;
        }
    }

    // Test FTP connection and directory creation
    async testConnection(): Promise<{ success: boolean; message: string }> {
        try {
            const connected = await this.connect();
            if (!connected) {
                return {
                    success: false,
                    message: 'Failed to connect to FTP server'
                };
            }

            // Test directory creation
            const testPath = 'test_directory';
            console.log(`🔄 FTP: Testing directory creation with path: ${testPath}`);

            const dirCreated = await this.createDirectory(testPath);
            if (!dirCreated) {
                await this.disconnect();
                return {
                    success: false,
                    message: 'Failed to create test directory'
                };
            }

            // Verify directory was created
            const dirExists = await this.verifyDirectoryExists(testPath);
            if (!dirExists) {
                await this.disconnect();
                return {
                    success: false,
                    message: 'Directory was not created successfully'
                };
            }

            // Test file upload
            const testFilePath = `${testPath}/test.txt`;
            const testContent = 'This is a test file for FTP upload verification.';
            const fileUploaded = await this.uploadTextFile(testContent, testFilePath);

            if (!fileUploaded) {
                await this.disconnect();
                return {
                    success: false,
                    message: 'Failed to upload test file'
                };
            }

            await this.disconnect();
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
        }
    }
}

// Export a singleton instance
export const serverFtpService = new FTPServerService();
