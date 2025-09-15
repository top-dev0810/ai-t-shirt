'use client';

import { X, AlertTriangle, Trash2, Edit3 } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    type: 'delete' | 'update' | 'warning';
    confirmText?: string;
    cancelText?: string;
}

export default function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type,
    confirmText,
    cancelText = 'Cancel'
}: ConfirmationModalProps) {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'delete':
                return <Trash2 className="h-8 w-8 text-red-500" />;
            case 'update':
                return <Edit3 className="h-8 w-8 text-blue-500" />;
            case 'warning':
                return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
            default:
                return <AlertTriangle className="h-8 w-8 text-gray-500" />;
        }
    };

    const getConfirmButtonColor = () => {
        switch (type) {
            case 'delete':
                return 'bg-red-600 hover:bg-red-700 focus:ring-red-500';
            case 'update':
                return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500';
            case 'warning':
                return 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500';
            default:
                return 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500';
        }
    };

    const getDefaultConfirmText = () => {
        switch (type) {
            case 'delete':
                return 'Delete';
            case 'update':
                return 'Update';
            case 'warning':
                return 'Continue';
            default:
                return 'Confirm';
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        {getIcon()}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {title}
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${getConfirmButtonColor()}`}
                    >
                        {confirmText || getDefaultConfirmText()}
                    </button>
                </div>
            </div>
        </div>
    );
}
