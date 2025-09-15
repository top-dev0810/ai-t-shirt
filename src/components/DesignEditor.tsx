'use client';

import { useState } from 'react';
import { Check, ShoppingCart, Image as ImageIcon, X } from 'lucide-react';
import { TshirtStyle, TshirtColor, PrintSize, OrderItem } from '@/lib/types';
import { TSHIRT_STYLES, PRINT_SIZES, SIZES, PLACEMENT_OPTIONS } from '@/lib/constants';
import { formatPrice, calculateTotal } from '@/lib/utils';
import CheckoutForm from './CheckoutForm';

interface DesignEditorProps {
    design: string;
    onComplete?: () => void;
}

export default function DesignEditor({ design, onComplete }: DesignEditorProps) {
    const [selectedStyle, setSelectedStyle] = useState<TshirtStyle | null>(null);
    const [selectedColor, setSelectedColor] = useState<TshirtColor | null>(null);
    const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL'>('M');
    const [selectedPrintSize, setSelectedPrintSize] = useState<PrintSize | null>(null);
    const [selectedPlacement, setSelectedPlacement] = useState<'front' | 'back' | 'both'>('front');
    const [quantity, setQuantity] = useState(1);
    const [showCheckout, setShowCheckout] = useState(false);
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successOrderId, setSuccessOrderId] = useState('');

    const totalPrice = selectedStyle && selectedPrintSize
        ? calculateTotal(selectedStyle.price, selectedPrintSize.price, selectedPlacement) * quantity
        : 0;

    const handleStyleSelect = (style: TshirtStyle) => {
        setSelectedStyle(style);
        setSelectedColor(style.colors[0]); // Default to first color
    };

    const handleAddToCart = () => {
        if (!selectedStyle || !selectedColor || !selectedSize || !selectedPrintSize) {
            alert('Please select all options before adding to cart');
            return;
        }

        // Create order item
        const orderItem: OrderItem = {
            style: selectedStyle!,
            color: selectedColor!,
            size: selectedSize,
            printSize: selectedPrintSize!,
            placement: selectedPlacement,
            design: {
                id: `design_${Date.now()}`,
                imageUrl: design,
                prompt: {
                    text: 'Custom AI-generated design',
                    artStyle: 'modern',
                    musicGenre: 'electronic',
                    imageUrl: design
                },
                userId: 'demo-user',
                createdAt: new Date(),
                isPublic: false
            },
            quantity,
        };

        setOrderItems([orderItem]);
        setShowCheckout(true);
    };

    const handleCheckoutSuccess = (orderId: string) => {
        setSuccessOrderId(orderId);
        setShowSuccessModal(true);
        setShowCheckout(false);
        // Reset form
        setSelectedStyle(null);
        setSelectedColor(null);
        setSelectedSize('M');
        setSelectedPrintSize(null);
        setSelectedPlacement('front');
        setQuantity(1);
        setOrderItems([]);

        // Call onComplete if provided
        if (onComplete) {
            onComplete();
        }
    };

    const handleCheckoutCancel = () => {
        setShowCheckout(false);
        setOrderItems([]);
    };

    if (showCheckout) {
        return (
            <CheckoutForm
                items={orderItems}
                design={{
                    id: `design_${Date.now()}`,
                    imageUrl: design,
                    prompt: {
                        text: 'Custom AI-generated design',
                        artStyle: 'modern',
                        musicGenre: 'electronic',
                        imageUrl: design
                    },
                    userId: 'demo-user',
                    createdAt: new Date(),
                    isPublic: false
                }}
                onSuccess={handleCheckoutSuccess}
                onCancel={handleCheckoutCancel}
            />
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Customize Your T-Shirt</h3>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Design Preview */}
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">Design Preview</h4>
                    <div className="relative">
                        {design ? (
                            <img
                                src={design}
                                alt="Your design"
                                className="w-full h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                                onError={(e) => {
                                    console.error('Failed to load design image:', design);
                                    // Set a fallback image
                                    e.currentTarget.src = 'https://picsum.photos/400/400?random=999';
                                }}
                            />
                        ) : (
                            <div className="w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center">
                                <div className="text-center text-gray-500 dark:text-gray-400">
                                    <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
                                    <p>No design available</p>
                                </div>
                            </div>
                        )}

                        {selectedStyle && selectedColor && design && (
                            <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg flex items-center justify-center">
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Design will be printed on</p>
                                    <p className="font-medium text-gray-900 dark:text-white">{selectedStyle.name}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedColor.name}</p>
                                </div>
                            </div>
                        )}
                    </div>

                </div>

                {/* Right Column - Customization Options */}
                <div className="space-y-6">
                    {/* T-Shirt Style */}
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Choose Style</h4>
                        <div className="grid grid-cols-1 gap-3">
                            {TSHIRT_STYLES.map((style) => (
                                <button
                                    key={style.id}
                                    onClick={() => handleStyleSelect(style)}
                                    className={`p-3 border rounded-lg text-left transition-colors ${selectedStyle?.id === style.id
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{style.name}</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{formatPrice(style.price)}</p>
                                        </div>
                                        {selectedStyle?.id === style.id && (
                                            <Check className="h-5 w-5 text-blue-600" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* T-Shirt Color */}
                    {selectedStyle && (
                        <div>
                            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Choose Color</h4>
                            <div className="grid grid-cols-5 gap-3">
                                {selectedStyle.colors.map((color) => (
                                    <button
                                        key={color.id}
                                        onClick={() => setSelectedColor(color)}
                                        className={`p-2 border-2 rounded-lg transition-all duration-200 flex items-center justify-center relative hover:scale-105 ${selectedColor?.id === color.id
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/25'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                            }`}
                                    >
                                        <div
                                            className="w-10 h-10 rounded-md border border-gray-300 dark:border-gray-600 shadow-sm"
                                            style={{ backgroundColor: color.hexCode }}
                                        />
                                        {selectedColor?.id === color.id && (
                                            <Check className="h-5 w-5 text-white absolute -top-1 -right-1 bg-blue-600 rounded-full p-0.5 shadow-lg" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Size Selection */}
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Choose Size</h4>
                        <div className="flex gap-2">
                            {SIZES.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size as 'S' | 'M' | 'L' | 'XL')}
                                    className={`px-4 py-2 border rounded-md transition-colors ${selectedSize === size
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 text-gray-900 dark:text-white'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Print Size */}
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Print Size</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {PRINT_SIZES.map((printSize) => (
                                <button
                                    key={printSize.id}
                                    onClick={() => setSelectedPrintSize(printSize)}
                                    className={`p-3 border rounded-lg text-left transition-colors ${selectedPrintSize?.id === printSize.id
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                        }`}
                                >
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">{printSize.name}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{formatPrice(printSize.price)}</p>
                                    </div>
                                    {selectedPrintSize?.id === printSize.id && (
                                        <Check className="h-5 w-5 text-blue-600 ml-auto" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Placement */}
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Print Placement</h4>
                        <div className="grid grid-cols-3 gap-3">
                            {PLACEMENT_OPTIONS.map((placement) => (
                                <button
                                    key={placement.value}
                                    onClick={() => setSelectedPlacement(placement.value)}
                                    className={`p-3 border rounded-lg text-center transition-colors ${selectedPlacement === placement.value
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                        }`}
                                >
                                    <p className="font-medium text-gray-900 dark:text-white">{placement.label}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{placement.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Quantity */}
                    <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">Quantity</h4>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                -
                            </button>
                            <span className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                                {quantity}
                            </span>
                            <button
                                onClick={() => setQuantity(quantity + 1)}
                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Total Price */}
                    {totalPrice > 0 && (
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-semibold text-gray-900 dark:text-white">Total Price</span>
                                <span className="text-2xl font-bold text-blue-600">{formatPrice(totalPrice)}</span>
                            </div>
                        </div>
                    )}

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        disabled={!selectedStyle || !selectedColor || !selectedSize || !selectedPrintSize}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ShoppingCart className="h-5 w-5" />
                        Add to Cart
                    </button>
                </div>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100]">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full mx-4 transform transition-all scale-100 opacity-100">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                    <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Order Placed Successfully!
                                </h3>
                            </div>
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                                    <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                                </div>

                                <div>
                                    <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                        Thank you for your order!
                                    </h4>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Your custom T-shirt design has been successfully placed.
                                    </p>
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Order ID:</p>
                                        <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                                            {successOrderId}
                                        </p>
                                    </div>
                                </div>

                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">What&apos;s Next?</h4>
                                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                        <li>• Check your orders in the &ldquo;My Orders&rdquo; section</li>
                                        <li>• You&apos;ll receive email confirmation shortly</li>
                                        <li>• Our team will process your order within 24 hours</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}