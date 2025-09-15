import mysql from 'mysql2/promise';

// Database configuration
const DB_CONFIG: mysql.PoolOptions = {
    host: process.env.DB_HOST || '193.203.184.29',
    user: process.env.DB_USER || 'u317671848_BndadaAIDbAdm',
    password: process.env.DB_PASSWORD || 'q&9TT/Y+o?&b',
    database: process.env.DB_NAME || 'u317671848_BandaddaAI_DB',
    port: 3306,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(DB_CONFIG);

interface AdminUser {
    id: number;
    username: string;
    email: string;
    role: string;
    is_active: boolean;
    account_state: 'active' | 'inactive' | 'suspended';
    created_at: string;
    updated_at: string;
}

// Database service class
export class DatabaseService {
    // User operations
    static async createUser(userData: {
        email: string;
        name: string;
        google_id?: string;
    }) {
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.execute(
                `INSERT INTO users (email, name, google_id) VALUES (?, ?, ?) 
         ON DUPLICATE KEY UPDATE name = VALUES(name), google_id = VALUES(google_id)`,
                [userData.email, userData.name, userData.google_id]
            );
            return result;
        } finally {
            connection.release();
        }
    }

    static async getUserByEmail(email: string) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            return rows;
        } finally {
            connection.release();
        }
    }

    // Order operations
    static async createOrder(orderData: {
        user_id: number;
        order_id: string;
        status: string;
        deposit_amount: number;
        total_amount: number;
        payment_method: string;
        payment_status: string;
        razorpay_order_id?: string;
        razorpay_payment_id?: string;
        woocommerce_order_id?: string;
    }) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [result] = await connection.execute(
                `INSERT INTO orders (user_id, order_id, status, deposit_amount, total_amount, 
         payment_method, payment_status, razorpay_order_id, razorpay_payment_id, woocommerce_order_id) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    orderData.user_id,
                    orderData.order_id,
                    orderData.status,
                    orderData.deposit_amount,
                    orderData.total_amount,
                    orderData.payment_method,
                    orderData.payment_status,
                    orderData.razorpay_order_id,
                    orderData.razorpay_payment_id,
                    orderData.woocommerce_order_id
                ]
            );

            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    static async createOrderItem(itemData: {
        order_id: number;
        tshirt_style: string;
        tshirt_color: string;
        tshirt_size: string;
        print_size: string;
        placement: string;
        quantity: number;
        unit_price: number;
        total_price: number;
    }) {
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.execute(
                `INSERT INTO order_items (order_id, tshirt_style, tshirt_color, tshirt_size, 
         print_size, placement, quantity, unit_price, total_price) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    itemData.order_id,
                    itemData.tshirt_style,
                    itemData.tshirt_color,
                    itemData.tshirt_size,
                    itemData.print_size,
                    itemData.placement,
                    itemData.quantity,
                    itemData.unit_price,
                    itemData.total_price
                ]
            );
            return result;
        } finally {
            connection.release();
        }
    }

    static async createDesign(designData: {
        user_id: number;
        order_id: number;
        prompt_text: string;
        art_style: string;
        music_genre: string;
        image_url: string;
        is_ai_generated: boolean;
    }) {
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.execute(
                `INSERT INTO designs (user_id, order_id, prompt_text, art_style, music_genre, 
         image_url, is_ai_generated) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    designData.user_id,
                    designData.order_id,
                    designData.prompt_text,
                    designData.art_style,
                    designData.music_genre,
                    designData.image_url,
                    designData.is_ai_generated
                ]
            );
            return result;
        } finally {
            connection.release();
        }
    }

    static async createShippingAddress(addressData: {
        order_id: number;
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        address: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
    }) {
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.execute(
                `INSERT INTO shipping_addresses (order_id, first_name, last_name, email, phone, 
         address, city, state, postcode, country) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    addressData.order_id,
                    addressData.first_name,
                    addressData.last_name,
                    addressData.email,
                    addressData.phone,
                    addressData.address,
                    addressData.city,
                    addressData.state,
                    addressData.postcode,
                    addressData.country
                ]
            );
            return result;
        } finally {
            connection.release();
        }
    }

    // Get orders for user
    static async getUserOrders(userId: number) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(
                `SELECT o.*, oi.*, d.*, sa.* 
         FROM orders o
         LEFT JOIN order_items oi ON o.id = oi.order_id
         LEFT JOIN designs d ON o.id = d.order_id
         LEFT JOIN shipping_addresses sa ON o.id = sa.order_id
         WHERE o.user_id = ?
         ORDER BY o.created_at DESC`,
                [userId]
            );
            return rows;
        } finally {
            connection.release();
        }
    }

    // Get all orders (for admin)
    static async getAllOrders() {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(
                `SELECT o.*, u.name as user_name, u.email as user_email,
         d.prompt_text, d.art_style, d.music_genre, d.image_url, d.is_ai_generated,
         COUNT(oi.id) as item_count,
         SUM(oi.total_price) as items_total
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.id
         LEFT JOIN (
             SELECT d1.*
             FROM designs d1
             INNER JOIN (
                 SELECT order_id, MAX(created_at) as max_created_at
                 FROM designs
                 GROUP BY order_id
             ) d2 ON d1.order_id = d2.order_id AND d1.created_at = d2.max_created_at
         ) d ON o.id = d.order_id
         LEFT JOIN order_items oi ON o.id = oi.order_id
         GROUP BY o.id
         ORDER BY o.created_at DESC`
            );
            return rows;
        } finally {
            connection.release();
        }
    }

    // Update order status
    static async updateOrderStatus(orderId: string, status: string) {
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.execute(
                'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE order_id = ?',
                [status, orderId]
            );
            return result;
        } finally {
            connection.release();
        }
    }

    // Get Rs 50 deposit orders
    static async getDepositOrders() {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(
                `SELECT o.*, u.name as user_name, u.email as user_email
         FROM orders o
         LEFT JOIN users u ON o.user_id = u.id
         WHERE o.deposit_amount = 50.00
         ORDER BY o.created_at DESC`
            );
            return rows;
        } finally {
            connection.release();
        }
    }

    // Analytics queries
    static async getOrderAnalytics() {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(`
        SELECT 
          COUNT(*) as total_orders,
          SUM(total_amount) as total_revenue,
          SUM(deposit_amount) as total_deposits,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
          AVG(total_amount) as average_order_value
        FROM orders
        WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `);
            return rows;
        } finally {
            connection.release();
        }
    }

    // Test database connection
    static async testConnection() {
        try {
            const connection = await pool.getConnection();
            await connection.ping();
            connection.release();
            return { success: true, message: 'Database connected successfully' };
        } catch (error) {
            return { success: false, message: `Database connection failed: ${error}` };
        }
    }

    // Payment transaction operations
    static async createPaymentTransaction(transactionData: {
        order_id: number;
        transaction_id: string;
        payment_method: string;
        amount: number;
        currency?: string;
        status?: string;
        gateway_response?: string;
    }) {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [result] = await connection.execute(
                `INSERT INTO payment_transactions (order_id, transaction_id, payment_method, amount, currency, status, gateway_response) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    transactionData.order_id,
                    transactionData.transaction_id,
                    transactionData.payment_method,
                    transactionData.amount,
                    transactionData.currency || 'INR',
                    transactionData.status || 'completed',
                    transactionData.gateway_response || null
                ]
            );

            await connection.commit();
            return result;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    // Admin operations
    static async getAdminByEmail(email: string) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM admin_users WHERE email = ? AND is_active = 1',
                [email]
            );
            return (rows as unknown[])[0] as AdminUser | null || null;
        } finally {
            connection.release();
        }
    }

    static async getAllAdmins() {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM admin_users ORDER BY created_at DESC'
            );
            return rows;
        } finally {
            connection.release();
        }
    }

    static async createAdmin(adminData: {
        username: string;
        email: string;
        role?: string;
        account_state?: 'active' | 'inactive' | 'suspended';
    }) {
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.execute(
                `INSERT INTO admin_users (username, email, role, is_active, account_state) 
                 VALUES (?, ?, ?, 1, ?)`,
                [
                    adminData.username,
                    adminData.email,
                    adminData.role || 'admin',
                    adminData.account_state || 'active'
                ]
            );
            return result;
        } finally {
            connection.release();
        }
    }

    static async updateAdmin(id: number, adminData: {
        username?: string;
        email?: string;
        is_active?: boolean;
        account_state?: 'active' | 'inactive' | 'suspended';
    }) {
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.execute(
                `UPDATE admin_users SET username = ?, email = ?, is_active = ?, account_state = ?, updated_at = NOW() 
                 WHERE id = ?`,
                [
                    adminData.username || null,
                    adminData.email || null,
                    adminData.is_active !== undefined ? adminData.is_active : null,
                    adminData.account_state || null,
                    id
                ]
            );
            return result;
        } finally {
            connection.release();
        }
    }

    static async deleteAdmin(id: number) {
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.execute(
                'DELETE FROM admin_users WHERE id = ?',
                [id]
            );
            return result;
        } finally {
            connection.release();
        }
    }

    // Design operations
    static async updateDesignImage(designId: number, imageUrl: string) {
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.execute(
                'UPDATE designs SET image_url = ?, updated_at = NOW() WHERE id = ?',
                [imageUrl, designId]
            );
            return result;
        } finally {
            connection.release();
        }
    }

    static async createDesignRecord(designData: {
        orderId: number;
        imageUrl: string;
        promptText: string;
        artStyle: string;
        musicGenre: string;
        isAiGenerated: boolean;
    }) {
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.execute(
                `INSERT INTO designs (order_id, image_url, prompt_text, art_style, music_genre, is_ai_generated, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
                [
                    designData.orderId,
                    designData.imageUrl,
                    designData.promptText,
                    designData.artStyle,
                    designData.musicGenre,
                    designData.isAiGenerated
                ]
            );
            return result;
        } finally {
            connection.release();
        }
    }

    static async updateDesignImageByOrderId(orderId: number, imageUrl: string) {
        const connection = await pool.getConnection();
        try {
            const [result] = await connection.execute(
                'UPDATE designs SET image_url = ?, updated_at = NOW() WHERE order_id = ?',
                [imageUrl, orderId]
            );
            return result;
        } finally {
            connection.release();
        }
    }

    static async getOrderById(orderId: number) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM orders WHERE id = ?',
                [orderId]
            );
            return (rows as unknown[])[0] || null;
        } finally {
            connection.release();
        }
    }

    static async getDesignByOrderId(orderId: number) {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(
                'SELECT * FROM designs WHERE order_id = ? ORDER BY created_at DESC LIMIT 1',
                [orderId]
            );
            return (rows as unknown[])[0] || null;
        } finally {
            connection.release();
        }
    }

    static async getPaymentTransactions() {
        const connection = await pool.getConnection();
        try {
            const [rows] = await connection.execute(
                `SELECT pt.*, o.order_id, o.total_amount, o.status as order_status,
                        u.name as customer_name, u.email as customer_email
                 FROM payment_transactions pt
                 LEFT JOIN orders o ON pt.order_id = o.id
                 LEFT JOIN users u ON o.user_id = u.id
                 ORDER BY pt.created_at DESC`
            );
            return rows;
        } finally {
            connection.release();
        }
    }
}

export default DatabaseService;
