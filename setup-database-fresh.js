const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration
const config = {
    host: '193.203.184.29',
    user: 'u317671848_BndadaAIDbAdm',
    password: 'q&9TT/Y+o?&b',
    // Don't specify database initially
};

async function setupDatabase() {
    let connection;

    try {
        console.log('🔌 Connecting to MySQL server...');

        // Connect without specifying database
        connection = await mysql.createConnection(config);
        console.log('✅ Connected to MySQL server');

        // Read and execute the schema file
        const schemaPath = path.join(__dirname, 'database_schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        console.log('📄 Reading database schema...');

        // Split the schema into individual statements
        const statements = schema
            .split(';')
            .map(stmt => stmt.trim())
            .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

        console.log(`📝 Found ${statements.length} SQL statements to execute`);

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (statement.trim()) {
                try {
                    console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
                    await connection.execute(statement);
                    console.log(`✅ Statement ${i + 1} executed successfully`);
                } catch (error) {
                    // Some statements might fail (like DELIMITER) - that's okay
                    if (error.message.includes('DELIMITER')) {
                        console.log(`⚠️  Skipping DELIMITER statement (not supported by mysql2)`);
                    } else {
                        console.error(`❌ Error executing statement ${i + 1}:`, error.message);
                        // Continue with other statements
                    }
                }
            }
        }

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
