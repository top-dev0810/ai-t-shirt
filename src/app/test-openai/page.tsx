'use client';

import { useState } from 'react';
import { Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function TestOpenAIPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const testOpenAI = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-openai');
      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || 'Test failed');
      }
    } catch (err) {
      setError('Network error: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            OpenAI API Test
          </h1>

          <div className="text-center mb-8">
            <button
              onClick={testOpenAI}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Testing OpenAI API...
                </>
              ) : (
                'Test OpenAI API'
              )}
            </button>
          </div>

          {result && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">
                  ✅ OpenAI API is Working!
                </h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                  <span className="text-green-600 dark:text-green-400 font-medium">Success</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">API Key:</span>
                  <span className="font-mono text-gray-600 dark:text-gray-400">
                    {String(result.apiKeyPrefix)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Model:</span>
                  <span className="text-gray-600 dark:text-gray-400">{String(result.model)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Response:</span>
                  <span className="text-gray-600 dark:text-gray-400 italic">
                    &ldquo;{String(result.response)}&rdquo;
                  </span>
                </div>

                {result.usage ? (
                  <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Usage:</h4>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {JSON.stringify(result.usage as Record<string, unknown>, null, 2)}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">
                  ❌ OpenAI API Test Failed
                </h3>
              </div>

              <div className="text-red-700 dark:text-red-300">
                <p className="font-medium mb-2">Error:</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">How to fix common issues:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Make sure your OpenAI API key is correct in <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">.env.local</code></li>
                  <li>Check that you have sufficient credits in your OpenAI account</li>
                  <li>Verify the API key has the correct permissions</li>
                  <li>Ensure you&apos;re using a valid OpenAI API key (starts with &apos;sk-&apos;)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

