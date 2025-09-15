'use client';

import { useState } from 'react';

export default function TestDatabasePage() {
    const [testResult, setTestResult] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const testConnection = async () => {
        setLoading(true);
        setTestResult('Testing database connection...');

        try {
            const response = await fetch('/api/database/test');
            const result = await response.json();

            if (result.success) {
                setTestResult('✅ Database connection successful!');
            } else {
                setTestResult(`❌ Database connection failed: ${result.message}`);
            }
        } catch (error) {
            setTestResult(`❌ Database test error: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    const testOrderCreation = async () => {
        setLoading(true);
        setTestResult('Testing order creation...');

        try {
            const testOrderData = {
                order_id: `test_order_${Date.now()}`,
                email: 'test@example.com',
                name: 'Test User',
                google_id: 'test_123',
                status: 'processing',
                deposit_amount: 50.00,
                total_amount: 100.00,
                payment_method: 'razorpay',
                payment_status: 'paid',
                razorpay_order_id: 'test_razorpay_123',
                razorpay_payment_id: 'test_payment_123',
                items: [{
                    tshirt_style: 'Round Neck',
                    tshirt_color: 'Black',
                    tshirt_size: 'M',
                    print_size: 'A4',
                    placement: 'front',
                    quantity: 1,
                    unit_price: 100.00,
                    total_price: 100.00
                }],
                design: {
                    prompt_text: 'Test design',
                    art_style: 'abstract',
                    music_genre: 'rock',
                    image_url: 'https://example.com/test.jpg',
                    is_ai_generated: true
                },
                shipping_address: {
                    first_name: 'Test',
                    last_name: 'User',
                    email: 'test@example.com',
                    phone: '1234567890',
                    address: 'Test Address',
                    city: 'Test City',
                    state: 'Test State',
                    postcode: '12345',
                    country: 'India'
                }
            };

            const response = await fetch('/api/database/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(testOrderData)
            });

            const result = await response.json();

            if (result.success) {
                setTestResult(`✅ Order created successfully: ${JSON.stringify(result)}`);
            } else {
                setTestResult(`❌ Order creation failed: ${result.message}`);
            }

        } catch (error) {
            setTestResult(`❌ Order creation failed: ${error}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Database Test Page
                </h1>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Test Database Connection
                    </h2>

                    <div className="space-y-4">
                        <button
                            onClick={testConnection}
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Testing...' : 'Test Connection'}
                        </button>

                        <button
                            onClick={testOrderCreation}
                            disabled={loading}
                            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors ml-4"
                        >
                            {loading ? 'Testing...' : 'Test Order Creation'}
                        </button>
                    </div>

                    {testResult && (
                        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                                {testResult}
                            </pre>
                        </div>
                    )}
                </div>

                <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
                        Database Configuration
                    </h3>
                    <div className="text-sm text-yellow-700 dark:text-yellow-300">
                        <p><strong>Host:</strong> {process.env.NEXT_PUBLIC_DB_HOST || '193.203.184.29'}</p>
                        <p><strong>Database:</strong> {process.env.NEXT_PUBLIC_DB_NAME || 'u317671848_BandaddaAI_DB'}</p>
                        <p><strong>User:</strong> {process.env.NEXT_PUBLIC_DB_USER || 'u317671848_BndadaAIDbAdm'}</p>
                        <p className="mt-2 text-xs">
                            Note: Make sure to add database credentials to your .env.local file
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
