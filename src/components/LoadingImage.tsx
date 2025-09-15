'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingImageProps {
    src: string;
    alt: string;
    className?: string;
    fallbackSrc?: string;
}

export default function LoadingImage({ src, alt, className = '', fallbackSrc = 'https://picsum.photos/200/200?random=1' }: LoadingImageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
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

            {/* Image */}
            <img
                src={hasError ? fallbackSrc : src}
                alt={alt}
                className={`w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-600 transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                onLoad={handleLoad}
                onError={handleError}
            />
        </div>
    );
}
