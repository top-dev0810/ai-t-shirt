'use client';

import { useState } from 'react';
import { Loader2, ImageIcon } from 'lucide-react';

interface ImageWithErrorFallbackProps {
    src: string;
    alt: string;
    className?: string;
}

export default function ImageWithErrorFallback({ src, alt, className = '' }: ImageWithErrorFallbackProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        console.error('Image failed to load:', src);
        setIsLoading(false);
        setHasError(true);
    };

    return (
        <div className={`relative ${className}`}>
            {/* Loading State */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
            )}

            {/* Error State */}
            {hasError && (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                        <ImageIcon className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                        <div className="text-xs text-gray-500 dark:text-gray-400">Image Error</div>
                    </div>
                </div>
            )}

            {/* Image */}
            {!hasError && (
                <img
                    src={src}
                    alt={alt}
                    className={`w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-600 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'
                        }`}
                    onLoad={handleLoad}
                    onError={handleError}
                />
            )}
        </div>
    );
}
