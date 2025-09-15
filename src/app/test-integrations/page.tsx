'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface TestResult {
  service: string;
  success: boolean;
  message: string;
  details?: unknown;
  timestamp: string;
}

export default function TestIntegrationsPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTest = async (service: string, testFunction: () => Promise<unknown>) => {
    const startTime = new Date().toISOString();
    
    try {
      console.log(`Testing ${service}...`);
      const result = await testFunction();
      
      const resultData = result as { success?: boolean; message?: string; details?: unknown };
      const testResult: TestResult = {
        service,
        success: resultData.success !== false,
        message: resultData.message || 'Test completed successfully',
        details: resultData.details || result,
        timestamp: startTime
      };
      
      setTestResults(prev => [...prev, testResult]);
      return testResult;
    } catch (error) {
      const testResult: TestResult = {
        service,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: { error: error instanceof Error ? error.message : 'Unknown error' },
        timestamp: startTime
      };
      
      setTestResults(prev => [...prev, testResult]);
      return testResult;
    }
  };

  const testOpenAI = async () => {
    const response = await fetch('/api/test-openai');
    return await response.json();
  };

  const testWooCommerce = async () => {
    const response = await fetch('/api/test-woocommerce');
    return await response.json();
  };

  const testFTP = async () => {
    const response = await fetch('/api/test-ftp');
    return await response.json();
  };

  const testRazorpay = async () => {
    // Test Razorpay by creating a test order
    const response = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: 5000, // ₹50 in paise
        currency: 'INR',
        receipt: `test_${Date.now()}`
      }),
    });
    return await response.json();
  };

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);

    const tests = [
      { name: 'OpenAI API', fn: testOpenAI },
      { name: 'WooCommerce API', fn: testWooCommerce },
      { name: 'FTP Server', fn: testFTP },
      { name: 'Razorpay Payment', fn: testRazorpay }
    ];

    for (const test of tests) {
      await runTest(test.name, test.fn);
      // Add a small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setIsRunning(false);
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Integration Tests
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test all API integrations and services
          </p>
        </div>

        <div className="mb-6 flex gap-4">
          <Button 
            onClick={runAllTests} 
            disabled={isRunning}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running Tests...
              </>
            ) : (
              'Run All Tests'
            )}
          </Button>
          
          <Button 
            onClick={clearResults} 
            variant="outline"
            disabled={isRunning}
          >
            Clear Results
          </Button>
        </div>

        {testResults.length > 0 && (
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <Card key={index} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{result.service}</CardTitle>
                    <div className="flex items-center gap-2">
                      {result.success ? (
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Success
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Failed
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardDescription>
                    {result.message}
                  </CardDescription>
                </CardHeader>
                
                {result.details ? (
                  <CardContent>
                    <details className="text-sm">
                      <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                        View Details
                      </summary>
                      <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                        {JSON.stringify(result.details as Record<string, unknown>, null, 2)}
                      </pre>
                    </details>
                  </CardContent>
                ) : null}
              </Card>
            ))}
          </div>
        )}

        {testResults.length === 0 && !isRunning && (
          <Card>
            <CardContent className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">
          Click &quot;Run All Tests&quot; to test all integrations
        </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
