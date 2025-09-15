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
  imageUrl?: string;
}

/**
 * Client-side FTP Service
 * This service only handles API calls to server-side FTP operations.
 * All actual FTP operations are performed server-side via API routes.
 */
export class FTPService {
  /**
   * Create order folder structure and save files to FTP
   * This method calls the server-side API route to handle all FTP operations
   */
  async createOrderFolder(orderData: OrderFolderData): Promise<FTPUploadResult> {
    // Check if we have FTP credentials configured
    if (FTP_CONFIG.host && FTP_CONFIG.username && FTP_CONFIG.password) {
      console.log('Using server API route for FTP order folder creation');
      try {
        // Use the server API route for FTP operations
        const response = await fetch('/api/orders/create-ftp-folder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(orderData),
        });

        const result = await response.json();

        if (result.success) {
          return {
            success: true,
            message: 'Order folder created successfully via server API',
            filePath: result.filePath,
            imageUrl: result.imageUrl
          };
        } else {
          throw new Error(result.message || 'FTP server API failed');
        }
      } catch (error) {
        console.error('FTP server API failed:', error);
        return {
          success: false,
          message: error instanceof Error ? error.message : 'FTP server API failed'
        };
      }
    }

    // Fallback: Development mode simulation
    console.log('Development mode: Simulating FTP order folder creation');
    return {
      success: true,
      message: 'Development mode: Order folder creation simulated',
      filePath: `/orders/mock_order_${Date.now()}`,
      imageUrl: orderData.design.imageUrl
    };
  }
}

// Export a singleton instance
export const ftpService = new FTPService();
