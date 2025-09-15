'use client';

import { useState } from 'react';
import { X, CreditCard, Smartphone, Wifi } from 'lucide-react';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (paymentId: string, orderId: string) => void;
    amount: number;
    description: string;
}

export default function PaymentModal({
    isOpen,
    onClose,
    onSuccess,
    amount,
    description
}: PaymentModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentSuccessful, setPaymentSuccessful] = useState(false);

    const loadRazorpayScript = (): Promise<boolean> => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Load Razorpay script
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded) {
                throw new Error('Failed to load Razorpay script');
            }

            // Create order
            const response = await fetch('/api/payment/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: amount,
                    receipt: `receipt_${Date.now()}`,
                }),
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to create payment order');
            }

            const order = data.order;

            // Configure Razorpay options (Test Mode - No Mobile Required)
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: order.amount * 100, // Amount in paise
                currency: order.currency,
                name: 'AI T-Shirt Designer (Test Mode)',
                description: description,
                image: '/logo.png',
                order_id: order.id,
                // Testing configuration - no mobile number required
                prefill: {
                    name: 'Test Customer',
                    email: 'test@example.com',
                },
                // Disable mobile number requirement for testing
                notes: {
                    source: 'test_mode',
                    skip_mobile: 'true'
                },
                // Testing conditions
                theme: {
                    color: '#3B82F6',
                },
                // Disable mobile validation
                config: {
                    display: {
                        hide: ['mobile']
                    }
                },
                handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
                    try {
                        // Verify payment
                        const verifyResponse = await fetch('/api/payment/verify-payment', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyData = await verifyResponse.json();

                        if (verifyData.success) {
                            setPaymentSuccessful(true);
                            onSuccess(response.razorpay_payment_id, response.razorpay_order_id);
                            // Don't call onClose here - let the modal close naturally
                        } else {
                            throw new Error('Payment verification failed');
                        }
                    } catch (error) {
                        console.error('Payment verification error:', error);
                        setError('Payment verification failed. Please try again.');
                    }
                },
                modal: {
                    ondismiss: () => {
                        setIsLoading(false);
                        // Only call onClose if payment wasn't successful
                        if (!paymentSuccessful) {
                            onClose();
                        }
                    },
                },
            };

            // Open Razorpay checkout
            const rzp = new (window as unknown as { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Payment error:', error);
            setError(error instanceof Error ? error.message : 'Payment failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Complete Payment
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="text-center mb-6">
                        <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            ₹{amount}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400">{description}</p>
                    </div>

                    {/* Payment Methods */}
                    <div className="space-y-3 mb-6">
                        <div className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <CreditCard className="h-5 w-5 text-blue-600 mr-3" />
                            <span className="text-gray-700 dark:text-gray-300">Credit/Debit Card</span>
                        </div>
                        <div className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <Smartphone className="h-5 w-5 text-green-600 mr-3" />
                            <span className="text-gray-700 dark:text-gray-300">UPI</span>
                        </div>
                        <div className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <Wifi className="h-5 w-5 text-purple-600 mr-3" />
                            <span className="text-gray-700 dark:text-gray-300">Net Banking</span>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Payment Button */}
                    <button
                        onClick={handlePayment}
                        disabled={isLoading}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                        {isLoading ? 'Processing...' : `Pay ₹${amount}`}
                    </button>

                    {/* Security Note */}
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
                        🔒 Your payment is secure and encrypted
                    </p>
                </div>
            </div>
        </div>
    );
}