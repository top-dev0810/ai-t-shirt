'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, X, ExternalLink, Database, ShoppingBag, Upload } from 'lucide-react';

interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
    orderId: string;
    onViewOrders?: () => void;
}

export default function SuccessModal({ isOpen, onClose, orderId, onViewOrders }: SuccessModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
        }
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    const handleViewOrders = () => {
        if (onViewOrders) {
            onViewOrders();
        }
        handleClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                onClick={handleClose}
            />

            {/* Modal */}
            <div
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Order Placed Successfully!
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Order ID: {orderId}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Success Message */}
                    <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Your order has been successfully saved to all systems:
                        </p>
                    </div>

                    {/* Systems Status */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                            <ShoppingBag className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <div>
                                <p className="font-medium text-green-800 dark:text-green-200">WooCommerce System</p>
                                <p className="text-sm text-green-600 dark:text-green-400">E-commerce platform updated</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                            <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <div>
                                <p className="font-medium text-blue-800 dark:text-blue-200">MySQL Database</p>
                                <p className="text-sm text-blue-600 dark:text-blue-400">Order data stored securely</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                            <Upload className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                            <div>
                                <p className="font-medium text-purple-800 dark:text-purple-200">FTP Server</p>
                                <p className="text-sm text-purple-600 dark:text-purple-400">Design files uploaded</p>
                            </div>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">What&apos;s Next?</h4>
                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                            <li>• Check your orders in the &ldquo;My Orders&rdquo; section</li>
                            <li>• You&apos;ll receive email confirmation shortly</li>
                            <li>• Our team will process your order within 24 hours</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors font-medium"
                    >
                        Continue Shopping
                    </button>
                    <button
                        onClick={handleViewOrders}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        <ExternalLink className="w-4 h-4" />
                        View Orders
                    </button>
                </div>
            </div>
        </div>
    );
}
