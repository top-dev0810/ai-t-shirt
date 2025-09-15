#!/usr/bin/env node

/**
 * Final Integration Test Script
 * Tests all major components of the AI T-shirt App
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const WOOCOMMERCE_URL = 'https://bandadda.com/wp-json/wc/v3';
const WOOCOMMERCE_KEY = 'ck_94cb781cfc2ecb9b35e8249a87436f2cbf2ab31a';
const WOOCOMMERCE_SECRET = 'cs_ebdeb02b0309904c762c31b2151896e405a4093f';

// Test results
const results = {
    passed: 0,
    failed: 0,
    tests: []
};

function log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : '🔄';
    console.log(`${prefix} [${timestamp}] ${message}`);
}

function addTest(name, passed, message) {
    results.tests.push({ name, passed, message });
    if (passed) {
        results.passed++;
        log(`PASS: ${name} - ${message}`, 'success');
    } else {
        results.failed++;
        log(`FAIL: ${name} - ${message}`, 'error');
    }
}

function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const isHttps = url.startsWith('https');
        const client = isHttps ? https : http;

        const request = client.request(url, options, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: response.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: response.statusCode, data: data });
                }
            });
        });

        request.on('error', reject);
        request.end();
    });
}

async function testDatabaseConnection() {
    try {
        const response = await makeRequest(`${BASE_URL}/api/database/test`);
        const passed = response.status === 200 && response.data.success;
        addTest('Database Connection', passed, response.data.message || 'Database test failed');
    } catch (error) {
        addTest('Database Connection', false, `Connection error: ${error.message}`);
    }
}

async function testFTPConnection() {
    try {
        const response = await makeRequest(`${BASE_URL}/api/test-ftp-connection`);
        const passed = response.status === 200 && response.data.success;
        addTest('FTP Connection', passed, response.data.message || 'FTP test failed');
    } catch (error) {
        addTest('FTP Connection', false, `Connection error: ${error.message}`);
    }
}

async function testWooCommerceRead() {
    try {
        const url = `${WOOCOMMERCE_URL}/products?consumer_key=${WOOCOMMERCE_KEY}&consumer_secret=${WOOCOMMERCE_SECRET}`;
        const response = await makeRequest(url);
        const passed = response.status === 200 && Array.isArray(response.data);
        addTest('WooCommerce Read API', passed, `Status: ${response.status}, Products found: ${Array.isArray(response.data) ? response.data.length : 0}`);
    } catch (error) {
        addTest('WooCommerce Read API', false, `Connection error: ${error.message}`);
    }
}

async function testWooCommerceWrite() {
    try {
        const url = `${WOOCOMMERCE_URL}/orders`;
        const orderData = {
            payment_method: 'razorpay',
            billing: {
                first_name: 'Test',
                last_name: 'User',
                email: 'test@example.com',
                phone: '1234567890',
                address_1: '123 Test Street',
                city: 'Test City',
                state: 'Test State',
                postcode: '12345',
                country: 'IN'
            },
            line_items: [{
                product_id: 39464,
                quantity: 1
            }]
        };

        const response = await makeRequest(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${WOOCOMMERCE_KEY}:${WOOCOMMERCE_SECRET}`).toString('base64')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });

        const passed = response.status === 201;
        addTest('WooCommerce Write API', passed, `Status: ${response.status}, ${passed ? 'Order created successfully' : 'Failed to create order'}`);
    } catch (error) {
        addTest('WooCommerce Write API', false, `Connection error: ${error.message}`);
    }
}

async function testOpenAI() {
    try {
        const response = await makeRequest(`${BASE_URL}/api/test-openai`);
        const passed = response.status === 200 && response.data.success;
        addTest('OpenAI Integration', passed, response.data.message || 'OpenAI test failed');
    } catch (error) {
        addTest('OpenAI Integration', false, `Connection error: ${error.message}`);
    }
}

async function testRazorpay() {
    try {
        const response = await makeRequest(`${BASE_URL}/api/razorpay/create-order`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: 5000, currency: 'INR' })
        });
        const passed = response.status === 200 && response.data.success;
        addTest('Razorpay Integration', passed, response.data.message || 'Razorpay test failed');
    } catch (error) {
        addTest('Razorpay Integration', false, `Connection error: ${error.message}`);
    }
}

async function testImageStorage() {
    try {
        const response = await makeRequest(`${BASE_URL}/api/images/save-to-ftp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                imageUrl: 'https://via.placeholder.com/300x300.jpg',
                orderId: 'test-order-123',
                designId: 'test-design-456'
            })
        });
        const passed = response.status === 200 && response.data.success;
        addTest('Image Storage (FTP)', passed, response.data.message || 'Image storage test failed');
    } catch (error) {
        addTest('Image Storage (FTP)', false, `Connection error: ${error.message}`);
    }
}

async function runAllTests() {
    log('🚀 Starting Final Integration Tests...');
    log(`Testing against: ${BASE_URL}`);

    await testDatabaseConnection();
    await testFTPConnection();
    await testWooCommerceRead();
    await testWooCommerceWrite();
    await testOpenAI();
    await testRazorpay();
    await testImageStorage();

    // Summary
    log('\n📊 Test Results Summary:');
    log(`✅ Passed: ${results.passed}`);
    log(`❌ Failed: ${results.failed}`);
    log(`📈 Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%`);

    if (results.failed === 0) {
        log('\n🎉 All tests passed! Your application is ready for production!', 'success');
    } else {
        log('\n⚠️ Some tests failed. Please check the issues above.', 'error');
    }

    // Detailed results
    log('\n📋 Detailed Results:');
    results.tests.forEach(test => {
        const status = test.passed ? '✅' : '❌';
        log(`${status} ${test.name}: ${test.message}`);
    });
}

// Run tests
runAllTests().catch(error => {
    log(`Fatal error: ${error.message}`, 'error');
    process.exit(1);
});
