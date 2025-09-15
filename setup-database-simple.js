const mysql = require('mysql2/promise');

// Database configuration
const config = {
    host: '193.203.184.29',
    user: 'u317671848_BndadaAIDbAdm',
    password: 'q&9TT/Y+o?&b',
};

async function setupDatabase() {
    let connection;

    try {
        console.log('🔌 Connecting to MySQL server...');

        // Connect without specifying database
        connection = await mysql.createConnection(config);
        console.log('✅ Connected to MySQL server');

        // Step 1: Create database
        console.log('📊 Creating database...');
        await connection.execute('CREATE DATABASE IF NOT EXISTS u317671848_BandaddaAI_DB'); 
        console.log('✅ Database created successfully');

        // Step 2: Use the database
        console.log('🔄 Switching to database...');
        await connection.execute('USE u317671848_BandaddaAI_DB');
        console.log('✅ Using database u317671848_BandaddaAI_DB');

        // Step 3: Create users table
        console.log('👥 Creating users table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id INT PRIMARY KEY AUTO_INCREMENT,
                email VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                google_id VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_email (email),
                INDEX idx_google_id (google_id)
            )
        `);
        console.log('✅ Users table created');

        // Step 4: Create orders table
        console.log('📦 Creating orders table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT,
                order_id VARCHAR(255) UNIQUE NOT NULL,
                status ENUM('pending', 'paid', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
                deposit_amount DECIMAL(10,2) DEFAULT 50.00,
                total_amount DECIMAL(10,2) NOT NULL,
                payment_method VARCHAR(100),
                payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
                razorpay_order_id VARCHAR(255),
                razorpay_payment_id VARCHAR(255),
                woocommerce_order_id VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_order_id (order_id),
                INDEX idx_user_id (user_id),
                INDEX idx_status (status),
                INDEX idx_payment_status (payment_status),
                INDEX idx_created_at (created_at)
            )
        `);
        console.log('✅ Orders table created');

        // Step 5: Create order_items table
        console.log('🛍️ Creating order_items table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT PRIMARY KEY AUTO_INCREMENT,
                order_id INT,
                tshirt_style VARCHAR(100) NOT NULL,
                tshirt_color VARCHAR(100) NOT NULL,
                tshirt_size VARCHAR(10) NOT NULL,
                print_size VARCHAR(50) NOT NULL,
                placement VARCHAR(50) NOT NULL,
                quantity INT NOT NULL DEFAULT 1,
                unit_price DECIMAL(10,2) NOT NULL,
                total_price DECIMAL(10,2) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                INDEX idx_order_id (order_id)
            )
        `);
        console.log('✅ Order_items table created');

        // Step 6: Create designs table
        console.log('🎨 Creating designs table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS designs (
                id INT PRIMARY KEY AUTO_INCREMENT,
                user_id INT,
                order_id INT,
                prompt_text TEXT,
                art_style VARCHAR(100),
                music_genre VARCHAR(100),
                image_url TEXT,
                is_ai_generated BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                INDEX idx_user_id (user_id),
                INDEX idx_order_id (order_id)
            )
        `);
        console.log('✅ Designs table created');

        // Step 7: Create shipping_addresses table
        console.log('🚚 Creating shipping_addresses table...');
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS shipping_addresses (
                id INT PRIMARY KEY AUTO_INCREMENT,
                order_id INT,
                first_name VARCHAR(100) NOT NULL,
                last_name VARCHAR(100) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(20),
                address TEXT NOT NULL,
                city VARCHAR(100) NOT NULL,
                state VARCHAR(100) NOT NULL,
                postcode VARCHAR(20) NOT NULL,
                country VARCHAR(100) DEFAULT 'IN',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                INDEX idx_order_id (order_id)
            )
        `);
        console.log('✅ Shipping_addresses table created');

        console.log('🎉 Database setup completed successfully!');
        console.log('📊 Database: u317671848_BandaddaAI_DB');
        console.log('📋 Tables created: users, orders, order_items, designs, shipping_addresses');

    } catch (error) {
        console.error('❌ Database setup failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the setup
setupDatabase();
