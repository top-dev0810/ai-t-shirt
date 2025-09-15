/**
 * Database Migration: Add ftp_image_path column to designs table
 * Run this script to add the new column for storing FTP image paths
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function addFtpImagePathColumn() {
    let connection;

    try {
        console.log('🔗 Connecting to MySQL database...');

        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'ai_tshirt_app',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connected to database successfully');

        // Check if column already exists
        console.log('🔍 Checking if ftp_image_path column exists...');
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'designs' AND COLUMN_NAME = 'ftp_image_path'
        `, [process.env.DB_NAME || 'ai_tshirt_app']);

        if (columns.length > 0) {
            console.log('✅ ftp_image_path column already exists');
            return;
        }

        // Add the ftp_image_path column
        console.log('➕ Adding ftp_image_path column to designs table...');
        await connection.execute(`
            ALTER TABLE designs 
            ADD COLUMN ftp_image_path TEXT NULL 
            AFTER image_url
        `);

        console.log('✅ ftp_image_path column added successfully');

        // Add index for better performance
        console.log('📊 Adding index for ftp_image_path column...');
        await connection.execute(`
            ALTER TABLE designs 
            ADD INDEX idx_ftp_image_path (ftp_image_path(255))
        `);

        console.log('✅ Index added successfully');

        // Show the updated table structure
        console.log('📋 Updated designs table structure:');
        const [tableInfo] = await connection.execute('DESCRIBE designs');
        console.table(tableInfo);

        console.log('🎉 Migration completed successfully!');

    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the migration
addFtpImagePathColumn()
    .then(() => {
        console.log('✅ Migration completed successfully');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    });
