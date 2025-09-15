# 🗄️ Database Integration Plan

## 📋 **Client Requirements Analysis:**

**Point #5: "Create DB and share with Nitin for Rs 50 Order management and Other conditions"**

### 🎯 **What This Means:**
1. **Create MySQL Database** using provided credentials
2. **Store all order data** in the database
3. **Track Rs 50 deposits** and full order management
4. **Share database access** with client's team (Nitin)
5. **Business logic** for order conditions and management

### 🏗️ **Database Schema Design:**

#### **1. Users Table**
```sql
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    google_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### **2. Orders Table**
```sql
CREATE TABLE orders (
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
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### **3. Order Items Table**
```sql
CREATE TABLE order_items (
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
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

#### **4. Designs Table**
```sql
CREATE TABLE designs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    order_id INT,
    prompt_text TEXT NOT NULL,
    art_style VARCHAR(100) NOT NULL,
    music_genre VARCHAR(100) NOT NULL,
    image_url TEXT NOT NULL,
    is_ai_generated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

#### **5. Shipping Addresses Table**
```sql
CREATE TABLE shipping_addresses (
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
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
```

### 🔧 **Implementation Steps:**

#### **Step 1: Database Connection Setup**
- Create MySQL connection service
- Add database credentials to environment variables
- Set up connection pooling

#### **Step 2: Database Service Layer**
- Create database service functions
- Implement CRUD operations for all tables
- Add transaction support for order creation

#### **Step 3: Order Management System**
- Track Rs 50 deposits separately
- Full order lifecycle management
- Status updates and notifications

#### **Step 4: Admin Dashboard**
- Order management interface
- User management
- Analytics and reporting
- Export functionality for Nitin

### 💰 **Rs 50 Order Management:**

#### **Deposit Tracking:**
- Track all Rs 50 deposits
- Link deposits to full orders
- Handle deposit refunds
- Generate deposit reports

#### **Order Conditions:**
- Minimum order value
- Deposit requirements
- Payment terms
- Shipping conditions

### 📊 **Business Logic:**

#### **Order Flow:**
1. User creates design → Rs 50 deposit required
2. Deposit paid → Design generated
3. User customizes → Full order created
4. Order processed → Status tracked
5. Order completed → Analytics updated

#### **Reporting for Nitin:**
- Daily order reports
- Revenue tracking
- User analytics
- Design popularity metrics

### 🚀 **Next Steps:**
1. Set up MySQL database
2. Create database service layer
3. Integrate with existing order flow
4. Build admin dashboard
5. Share access with Nitin

---

**This will give you complete order management and business intelligence for the client!**
