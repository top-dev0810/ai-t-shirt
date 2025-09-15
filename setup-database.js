const mysql = require('mysql2/promise');

async function setupDatabase() {
    const connection = await mysql.createConnection({
        host: '193.203.184.29',
        user: 'u317671848_BndadaAIDbAdm',
        password: 'q&9TT/Y+o?&b',
        database: 'u317671848_BandaddaAI_DB'
    });

    try {
        console.log('Connected to database successfully!');

        // Read and execute the schema file
        const fs = require('fs');
        const schema = fs.readFileSync('./database_schema.sql', 'utf8');

        // Split by semicolon and execute each statement
        const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);

        for (const statement of statements) {
            if (statement.trim()) {
                try {
                    await connection.execute(statement);
                    console.log('✓ Executed statement successfully');
                } catch (error) {
                    if (error.code === 'ER_TABLE_EXISTS_ERROR' || error.code === 'ER_DUP_KEYNAME') {
                        console.log('⚠ Table or key already exists, skipping...');
                    } else {
                        console.error('✗ Error executing statement:', error.message);
                    }
                }
            }
        }

        console.log('✅ Database setup completed successfully!');

    } catch (error) {
        console.error('❌ Database setup failed:', error);
    } finally {
        await connection.end();
    }
}

setupDatabase();
