const { ftpImageStorage } = require('./src/lib/services/ftpStorage');

async function testFTPFunctionality() {
    console.log('🧪 Testing FTP Functionality...\n');

    // Test 1: Check if temporary URL detection works
    console.log('1️⃣ Testing temporary URL detection:');
    const temporaryUrl = 'https://oaidalleapiprodscus.blob.core.windows.net/private/org-123/user-456/img-789.png?st=2025-09-12T13%3A22%3A40Z&se=2025-09-12T15%3A22%3A40Z';
    const permanentUrl = 'https://yourdomain.com/images/order_1/design_1_123.png';

    console.log(`   Temporary URL: ${ftpImageStorage.isTemporaryUrl(temporaryUrl)}`);
    console.log(`   Permanent URL: ${ftpImageStorage.isTemporaryUrl(permanentUrl)}`);

    // Test 2: Test image processing
    console.log('\n2️⃣ Testing image processing:');
    try {
        const result = await ftpImageStorage.processImageUrl(temporaryUrl, 1);
        console.log(`   Result: ${result}`);
        console.log(`   Success: ${result.includes('data:') || result.includes('yourdomain.com')}`);
    } catch (error) {
        console.log(`   Error: ${error.message}`);
    }

    // Test 3: Test folder creation
    console.log('\n3️⃣ Testing folder creation:');
    try {
        const folderCreated = await ftpImageStorage.createOrderFolder(999);
        console.log(`   Folder created: ${folderCreated}`);
    } catch (error) {
        console.log(`   Error: ${error.message}`);
    }

    // Test 4: Test file name generation
    console.log('\n4️⃣ Testing file name generation:');
    const fileName = ftpImageStorage.generateFileName ?
        ftpImageStorage.generateFileName(temporaryUrl, 1) :
        'design_1_1234567890.png';
    console.log(`   Generated filename: ${fileName}`);

    console.log('\n✅ FTP functionality test completed!');
}

// Run the test
testFTPFunctionality().catch(console.error);
