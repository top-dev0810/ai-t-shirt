-- Bandadda AI T-Shirt Designer Database Schema
-- Database: u317671848_BandaddaAI_DB
-- Host: 193.203.184.29

-- Create database (if not exists)
CREATE DATABASE IF NOT EXISTS u317671848_BandaddaAI_DB;
USE u317671848_BandaddaAI_DB;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    google_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_google_id (google_id)
);

-- 2. Orders Table
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
);

-- 3. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    tshirt_style VARCHAR(100) NOT NULL,
    tshirt_color VARCHAR(100) NOT NULL,
    tshirt_size VARCHAR(10) NOT NULL,
    print_size VARCHAR(20) NOT NULL,
    placement VARCHAR(50) NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id)
);

-- 4. Designs Table
CREATE TABLE IF NOT EXISTS designs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    order_id INT,
    prompt_text TEXT NOT NULL,
    art_style VARCHAR(100) NOT NULL,
    music_genre VARCHAR(100) NOT NULL,
    image_url TEXT NOT NULL,
    is_ai_generated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_order_id (order_id),
    INDEX idx_art_style (art_style),
    INDEX idx_music_genre (music_genre)
);

-- 5. Shipping Addresses Table
CREATE TABLE IF NOT EXISTS shipping_addresses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postcode VARCHAR(20) NOT NULL,
    country VARCHAR(100) DEFAULT 'India',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id)
);

-- 6. Payment Transactions Table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT,
    transaction_id VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    payment_method VARCHAR(100) NOT NULL,
    status ENUM('pending', 'success', 'failed', 'refunded') DEFAULT 'pending',
    razorpay_payment_id VARCHAR(255),
    razorpay_order_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order_id (order_id),
    INDEX idx_transaction_id (transaction_id),
    INDEX idx_status (status)
);

-- 7. Admin Users Table (for Nitin and team)
CREATE TABLE IF NOT EXISTS admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'viewer') DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email)
);

-- Insert default admin user for Nitin
INSERT INTO admin_users (username, email, password_hash, role) 
VALUES ('nitin', 'nitin@bandadda.com', '$2b$10$example_hash', 'admin')
ON DUPLICATE KEY UPDATE role = 'admin';

-- 8. System Settings Table
CREATE TABLE IF NOT EXISTS system_settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key)
);

-- Insert default settings
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('deposit_amount', '50.00', 'Default deposit amount for design generation'),
('min_order_amount', '100.00', 'Minimum order amount'),
('currency', 'INR', 'Default currency'),
('company_name', 'Band Adda AI T-Shirt Designer', 'Company name'),
('support_email', 'support@bandadda.com', 'Support email address')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- 9. Create views for easy reporting

-- View for order summary
CREATE OR REPLACE VIEW order_summary AS
SELECT 
    o.id,
    o.order_id,
    o.status,
    o.deposit_amount,
    o.total_amount,
    o.payment_status,
    o.created_at,
    u.name as customer_name,
    u.email as customer_email,
    COUNT(oi.id) as item_count,
    GROUP_CONCAT(oi.tshirt_style) as tshirt_styles
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
LEFT JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id;

-- View for Rs 50 deposit tracking
CREATE OR REPLACE VIEW deposit_orders AS
SELECT 
    o.*,
    u.name as customer_name,
    u.email as customer_email,
    d.prompt_text,
    d.art_style,
    d.music_genre
FROM orders o
LEFT JOIN users u ON o.user_id = u.id
LEFT JOIN designs d ON o.id = d.order_id
WHERE o.deposit_amount = 50.00
ORDER BY o.created_at DESC;

-- 10. Create indexes for better performance
CREATE INDEX idx_orders_date_status ON orders(created_at, status);
CREATE INDEX idx_orders_user_status ON orders(user_id, status);
CREATE INDEX idx_designs_created_at ON designs(created_at);
CREATE INDEX idx_payment_transactions_created_at ON payment_transactions(created_at);

-- 11. Create stored procedures for common operations

DELIMITER //

-- Procedure to get daily order statistics
CREATE PROCEDURE GetDailyOrderStats(IN target_date DATE)
BEGIN
    SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        SUM(deposit_amount) as total_deposits,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders
    FROM orders 
    WHERE DATE(created_at) = target_date;
END //

-- Procedure to get user order history
CREATE PROCEDURE GetUserOrderHistory(IN user_email VARCHAR(255))
BEGIN
    SELECT 
        o.*,
        COUNT(oi.id) as item_count,
        d.prompt_text,
        d.art_style,
        d.music_genre
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    LEFT JOIN order_items oi ON o.id = oi.order_id
    LEFT JOIN designs d ON o.id = d.order_id
    WHERE u.email = user_email
    GROUP BY o.id
    ORDER BY o.created_at DESC;
END //

DELIMITER ;

-- 12. Grant permissions for Nitin's access
-- Note: Run these commands with appropriate user credentials
-- GRANT SELECT, INSERT, UPDATE, DELETE ON u317671848_BandaddaAI_DB.* TO 'nitin_user'@'%' IDENTIFIED BY 'secure_password';
-- GRANT EXECUTE ON PROCEDURE u317671848_BandaddaAI_DB.GetDailyOrderStats TO 'nitin_user'@'%';
-- GRANT EXECUTE ON PROCEDURE u317671848_BandaddaAI_DB.GetUserOrderHistory TO 'nitin_user'@'%';

-- 13. Sample data for testing (optional)
-- INSERT INTO users (email, name, google_id) VALUES 
-- ('test@example.com', 'Test User', 'google_123'),
-- ('demo@example.com', 'Demo User', 'google_456');

COMMIT;
