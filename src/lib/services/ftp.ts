import { FTP_CONFIG } from '@/lib/constants';
import { GeneratedDesign } from '@/lib/types';

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

interface OrderFolderData {
  order: FTPOrderData;
  design: GeneratedDesign;
  designImage: string; // Base64 encoded image data
}

interface FTPUploadResult {
  success: boolean;
  message: string;
  filePath?: string;
}

// Note: This is a client-side simulation. In production, FTP operations should be handled server-side
export class FTPService {
  private host: string;
  private username: string;
  private password: string;
  private isConnected: boolean = false;

  constructor() {
    this.host = FTP_CONFIG.host;
    this.username = FTP_CONFIG.username;
    this.password = FTP_CONFIG.password;
  }

  // Simulate FTP connection
  async connect(): Promise<boolean> {
    try {
      // In a real implementation, this would establish an FTP connection
      // For now, we'll simulate the connection
      console.log(`Connecting to FTP server: ${this.host}`);
      console.log(`Username: ${this.username}`);

      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      this.isConnected = true;
      console.log('FTP connection established successfully');
      return true;
    } catch (error) {
      console.error('FTP connection failed:', error);
      this.isConnected = false;
      return false;
    }
  }

  // Simulate folder creation
  async createFolder(folderPath: string): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('FTP not connected');
    }

    try {
      console.log(`Creating folder: ${folderPath}`);
      // In a real implementation, this would create the folder on the FTP server
      // For now, we'll simulate success
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`Folder created successfully: ${folderPath}`);
      return true;
    } catch (error) {
      console.error(`Failed to create folder: ${folderPath}`, error);
      return false;
    }
  }

  // Simulate file upload
  async uploadFile(filePath: string, fileData: ArrayBuffer): Promise<boolean> {
    if (!this.isConnected) {
      throw new Error('FTP not connected');
    }

    try {
      console.log(`Uploading file: ${filePath}`);
      console.log(`File size: ${fileData.byteLength} bytes`);

      // In a real implementation, this would upload the file to the FTP server
      // For now, we'll simulate the upload process
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log(`File uploaded successfully: ${filePath}`);
      return true;
    } catch (error) {
      console.error(`Failed to upload file: ${filePath}`, error);
      return false;
    }
  }

  // Create order folder structure and save files
  async createOrderFolder(orderData: OrderFolderData): Promise<FTPUploadResult> {
    // Check if we're in development mode without credentials
    if (process.env.NODE_ENV === 'development' && !process.env.FTP_HOST) {
      console.log('Development mode: Simulating FTP order folder creation');
      return {
        success: true,
        message: 'Development mode: Order folder creation simulated',
        filePath: `/orders/mock_order_${Date.now()}`
      };
    }

    try {
      // Connect to FTP server
      await this.connect();

      // Create order folder
      const orderFolderPath = `/orders/${orderData.order.id}`;
      const folderCreated = await this.createFolder(orderFolderPath);
      if (!folderCreated) {
        throw new Error('Failed to create order folder');
      }

      // Create order JSON file
      const jsonResult = await this.createOrderJSON(orderData);
      if (!jsonResult.success) {
        throw new Error(`Failed to create order JSON: ${jsonResult.message}`);
      }

      // Upload design image
      const imageFileName = `design_${orderData.design.id}.jpg`;
      const imageFilePath = `${orderFolderPath}/${imageFileName}`;

      // Convert base64 to ArrayBuffer
      const imageBuffer = this.base64ToArrayBuffer(orderData.designImage);
      const imageUploaded = await this.uploadFile(imageFilePath, imageBuffer);
      if (!imageUploaded) {
        throw new Error('Failed to upload design image');
      }

      // Disconnect from FTP
      await this.disconnect();

      return {
        success: true,
        message: 'Order folder created successfully',
        filePath: orderFolderPath
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
  async createOrderJSON(orderData: OrderFolderData): Promise<FTPUploadResult> {
    try {
      const orderFolderPath = `/orders/${orderData.order.id}`;
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

      // Convert JSON to ArrayBuffer
      const jsonString = JSON.stringify(jsonContent, null, 2);
      const jsonBuffer = new TextEncoder().encode(jsonString).buffer;

      // Upload JSON file
      const jsonUploaded = await this.uploadFile(jsonFilePath, jsonBuffer);
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

  // Helper function to convert base64 to ArrayBuffer
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64.split(',')[1] || base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  // Disconnect from FTP
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      console.log('Disconnecting from FTP server...');
      this.isConnected = false;
      console.log('FTP disconnected');
    }
  }
}

// Export a singleton instance
export const ftpService = new FTPService();
