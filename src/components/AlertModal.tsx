'use client';

import React from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number; // Auto-close duration in milliseconds
}

export default function AlertModal({
    isOpen,
    onClose,
    type,
    title,
    message,
    duration = 3000
}: AlertModalProps) {
    // Auto-close after duration
    React.useEffect(() => {
        if (isOpen && duration > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, duration, onClose]);

    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-6 w-6 text-green-500" />;
            case 'error':
                return <XCircle className="h-6 w-6 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
            case 'info':
                return <Info className="h-6 w-6 text-blue-500" />;
            default:
                return <Info className="h-6 w-6 text-blue-500" />;
        }
    };

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return 'bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700';
            case 'error':
                return 'bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700';
            case 'warning':
                return 'bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700';
            case 'info':
                return 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700';
            default:
                return 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700';
        }
    };

    const getTextColor = () => {
        switch (type) {
            case 'success':
                return 'text-green-800 dark:text-green-200';
            case 'error':
                return 'text-red-800 dark:text-red-200';
            case 'warning':
                return 'text-yellow-800 dark:text-yellow-200';
            case 'info':
                return 'text-blue-800 dark:text-blue-200';
            default:
                return 'text-blue-800 dark:text-blue-200';
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50 max-w-sm w-80">
            <div className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full border-2 ${getBackgroundColor()}`}>
                {/* Content */}
                <div className="p-4">
                    <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                            {getIcon()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className={`text-base font-semibold ${getTextColor()}`}>
                                {title}
                            </h3>
                            <p className={`mt-1 text-sm ${getTextColor()}`}>
                                {message}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Progress bar for auto-close */}
                {duration > 0 && (
                    <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden">
                        <div
                            className={`h-full transition-all ease-linear ${type === 'success' ? 'bg-green-500' :
                                type === 'error' ? 'bg-red-500' :
                                    type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                                }`}
                            style={{
                                animation: `shrink ${duration}ms linear forwards`
                            }}
                        />
                    </div>
                )}
            </div>

            <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
        </div>
    );
}
