'use client';

import { Loader2, Palette, Sparkles, Wand2 } from 'lucide-react';

interface DesignLoadingStateProps {
    prompt: string;
    artStyle: string;
    musicGenre: string;
}

export default function DesignLoadingState({ prompt, artStyle, musicGenre }: DesignLoadingStateProps) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Wand2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Generating Your Design
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        AI is creating your custom T-shirt design...
                    </p>
                </div>
            </div>

            {/* Loading Animation */}
            <div className="flex justify-center mb-6">
                <div className="relative">
                    <Loader2 className="h-12 w-12 text-blue-600 dark:text-blue-400 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-6 bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Design Details */}
            <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Design Prompt</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        &ldquo;{prompt}&rdquo;
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Palette className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Art Style</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {artStyle}
                        </p>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">Music Genre</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {musicGenre}
                        </p>
                    </div>
                </div>
            </div>

            {/* Progress Steps */}
            <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Processing your prompt...</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <Loader2 className="h-3 w-3 text-white animate-spin" />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Generating AI artwork...</span>
                </div>

                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-500">Preparing design preview...</span>
                </div>
            </div>

            {/* Fun Facts */}
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                    💡 <strong>Did you know?</strong> Our AI analyzes your prompt and creates unique designs that match your style preferences. This usually takes 10-30 seconds.
                </p>
            </div>
        </div>
    );
}
