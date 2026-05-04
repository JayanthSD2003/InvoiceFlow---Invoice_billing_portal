-- Invoice Billing Portal Database Schema 

-- Go to phpMyAdmin and create a database named invoice_billing_portal
-- Created for Jayanth SD

CREATE DATABASE IF NOT EXISTS invoice_billing_portal;
USE invoice_billing_portal;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Business Profiles Table
CREATE TABLE IF NOT EXISTS business_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    business_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    tax_number VARCHAR(50), -- GSTIN
    pan_number VARCHAR(20),
    is_gst_registered BOOLEAN DEFAULT FALSE,
    profile_type ENUM('business', 'freelance') DEFAULT 'business',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Clients Table
CREATE TABLE IF NOT EXISTS clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_profile_id INT NOT NULL,
    client_name VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE
);

-- 4. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    business_profile_id INT NOT NULL,
    client_id INT NOT NULL,
    invoice_number VARCHAR(50) NOT NULL,
    invoice_date DATE NOT NULL,
    due_date DATE,
    status ENUM('draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled') DEFAULT 'draft',
    subtotal DECIMAL(15, 2) DEFAULT 0.00,
    tax_amount DECIMAL(15, 2) DEFAULT 0.00,
    total_amount DECIMAL(15, 2) DEFAULT 0.00,
    discount_amount DECIMAL(15, 2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (business_profile_id) REFERENCES business_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

-- 5. Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    hsn_code VARCHAR(20),
    quantity DECIMAL(12, 2) DEFAULT 1.00,
    unit_price DECIMAL(15, 2) NOT NULL,
    tax_percent DECIMAL(5, 2) DEFAULT 0.00,
    tax_amount DECIMAL(15, 2) DEFAULT 0.00,
    total_amount DECIMAL(15, 2) NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- 6. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    amount_paid DECIMAL(15, 2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50), -- Cash, Bank Transfer, UPI, etc.
    reference_number VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Default User for testing (password: password123)
-- INSERT INTO users (username, email, password) VALUES ('demo', 'demo@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');
