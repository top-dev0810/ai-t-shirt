const mysql = require('mysql2/promise');

// Database configuration
const config = {
    host: '193.203.184.29',
    user: 'u317671848_BndadaAIDbAdm',
    password: 'q&9TT/Y+o?&b',
    database: 'u317671848_BandaddaAI_DB'
};

async function checkFTPImages() {
    let connection;

    try {
        console.log('🔌 Connecting to database...');
        connection = await mysql.createConnection(config);
        console.log('✅ Connected to database');

        // Get all orders with their designs
        console.log('📊 Fetching orders and designs...');
        const [orders] = await connection.execute(`
            SELECT 
                o.id as order_id,
                o.order_id as order_number,
                o.status,
                o.created_at,
                d.image_url,
                d.prompt_text,
                d.art_style,
                d.music_genre,
                d.is_ai_generated
            FROM orders o
            LEFT JOIN designs d ON o.id = d.order_id
            ORDER BY o.created_at DESC
            LIMIT 10
        `);

        console.log(`\n📋 Found ${orders.length} orders:`);
        console.log('='.repeat(80));

        orders.forEach((order, index) => {
            console.log(`\n${index + 1}. Order #${order.order_number} (ID: ${order.order_id})`);
            console.log(`   Status: ${order.status}`);
            console.log(`   Created: ${order.created_at}`);

            if (order.image_url) {
                console.log(`   Image URL: ${order.image_url}`);

                // Check if it's a temporary URL
                if (order.image_url.includes('oaidalleapiprodscus.blob.core.windows.net')) {
                    console.log(`   ⚠️  TEMPORARY URL - Will expire soon!`);
                } else if (order.image_url.startsWith('data:')) {
                    console.log(`   ✅ PERMANENT URL (Base64 stored in database)`);
                } else if (order.image_url.includes('yourdomain.com') || order.image_url.includes('localhost')) {
                    console.log(`   ✅ PERMANENT URL (FTP server)`);
                } else {
                    console.log(`   ❓ UNKNOWN URL TYPE`);
                }

                console.log(`   Design: ${order.prompt_text || 'N/A'}`);
                console.log(`   Style: ${order.art_style || 'N/A'}`);
                console.log(`   Genre: ${order.music_genre || 'N/A'}`);
                console.log(`   AI Generated: ${order.is_ai_generated ? 'Yes' : 'No'}`);
            } else {
                console.log(`   ❌ No image URL found`);
            }
        });

        // Check for temporary URLs that need to be converted
        const temporaryUrls = orders.filter(order =>
            order.image_url && order.image_url.includes('oaidalleapiprodscus.blob.core.windows.net')
        );

        if (temporaryUrls.length > 0) {
            console.log(`\n⚠️  Found ${temporaryUrls.length} orders with temporary URLs:`);
            temporaryUrls.forEach(order => {
                console.log(`   - Order #${order.order_number}: ${order.image_url.substring(0, 100)}...`);
                console.log(`     Status: ${order.status} - Images will be processed after order completion`);
            });
            console.log(`\n💡 Note: Images are now processed AFTER order completion, not during generation!`);
        } else {
            console.log(`\n✅ All images have permanent URLs!`);
        }

        // Check FTP configuration
        console.log(`\n🔧 FTP Configuration Check:`);
        console.log(`   FTP Host: ${process.env.FTP_HOST || 'Not set'}`);
        console.log(`   FTP Port: ${process.env.FTP_PORT || 'Not set'}`);
        console.log(`   FTP Username: ${process.env.FTP_USERNAME || 'Not set'}`);
        console.log(`   FTP Base Path: ${process.env.FTP_BASE_PATH || 'Not set'}`);
        console.log(`   Image Base URL: ${process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'Not set'}`);

        if (!process.env.FTP_HOST) {
            console.log(`\n❌ FTP configuration is missing! Add these to your .env.local:`);
            console.log(`   FTP_HOST=your-ftp-host.com`);
            console.log(`   FTP_PORT=21`);
            console.log(`   FTP_USERNAME=your-username`);
            console.log(`   FTP_PASSWORD=your-password`);
            console.log(`   FTP_BASE_PATH=/public_html/images/orders`);
            console.log(`   NEXT_PUBLIC_IMAGE_BASE_URL=https://yourdomain.com/images`);
        }

    } catch (error) {
        console.error('❌ Error checking FTP images:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Database connection closed');
        }
    }
}

// Run the check
checkFTPImages();
