'use client';

// No imports needed for this component

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    text?: string;
    subtext?: string;
    centered?: boolean;
    className?: string;
}

export default function LoadingSpinner({
    size = 'md',
    text = 'Loading...',
    subtext,
    centered = true,
    className = ''
}: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16'
    };

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl'
    };

    const containerClasses = centered
        ? 'flex flex-col items-center justify-center min-h-[200px] space-y-4 ml-8'
        : 'flex items-center space-x-3';

    return (
        <div className={`${containerClasses} ${className}`}>
            <div className="relative">
                {/* Outer ring */}
                <div className={`${sizeClasses[size]} border-4 border-gray-200 dark:border-gray-700 rounded-full`}></div>
                {/* Spinning ring */}
                <div className={`${sizeClasses[size]} border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0`}></div>
            </div>

            <div className="text-center space-y-1">
                <p className={`font-medium text-gray-900 dark:text-white ${textSizeClasses[size]}`}>
                    {text}
                </p>
                {subtext && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {subtext}
                    </p>
                )}
            </div>
        </div>
    );
}
