'use client';

import { useState, useEffect } from 'react';
import { Check, CreditCard, Truck, AlertCircle, CheckCircle } from 'lucide-react';
import { OrderItem, GeneratedDesign } from '@/lib/types';
import { formatPrice, calculateTotal } from '@/lib/utils';
import { WOOCOMMERCE_PRODUCT_MAPPING } from '@/lib/constants';
import { createOrder } from '@/lib/services/woocommerce';
import { ftpService } from '@/lib/services/ftp';
import { useAuth } from '@/hooks/useAuth';
import SuccessModal from './SuccessModal';

interface CheckoutFormProps {
    items: OrderItem[];
    design: GeneratedDesign;
    onSuccess: (orderId: string) => void;
    onCancel: () => void;
}

interface ShippingAddress {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
}

interface ValidationErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    postcode?: string;
}

interface FTPOrderData {
    id: string;
    orderDate: Date;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    items: Array<OrderItem & { price: number }>;
    totalAmount: number;
    status: string;
    paymentMethod: string;
    shippingAddress: {
        address: string;
        city: string;
        state: string;
        postcode: string;
        country: string;
    };
}

export default function CheckoutForm({ items, design, onSuccess, onCancel }: CheckoutFormProps) {
    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [orderId, setOrderId] = useState('');
    const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        postcode: '',
        country: 'IN'
    });
    const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
    const [isEmailDisabled, setIsEmailDisabled] = useState(false);

    // Auto-populate user data when component mounts
    useEffect(() => {
        if (user) {
            setShippingAddress(prev => ({
                ...prev,
                email: user.email || '',
                firstName: user.name?.split(' ')[0] || '',
                lastName: user.name?.split(' ').slice(1).join(' ') || ''
            }));
            // Disable email field if user is logged in
            if (user.email) {
                setIsEmailDisabled(true);
            }
        }
    }, [user]);

    const [errorMessage, setErrorMessage] = useState('');

    // Calculate total amount using the calculateTotal function
    const totalAmount = items.reduce((sum, item) => {
        const itemPrice = calculateTotal(item.style.price, item.printSize.price, item.placement);
        return sum + (itemPrice * item.quantity);
    }, 0);

    // Validation functions
    const validateEmail = (email: string): string | undefined => {
        if (!email.trim()) return 'Email is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return 'Please enter a valid email address';
        return undefined;
    };

    const validatePhone = (phone: string): string | undefined => {
        if (!phone.trim()) return 'Phone number is required';
        // Remove all non-digit characters for validation
        const cleanPhone = phone.replace(/\D/g, '');
        // Check if it's a valid Indian phone number (10 digits) or international (7-15 digits)
        if (cleanPhone.length < 7 || cleanPhone.length > 15) {
            return 'Please enter a valid phone number (7-15 digits)';
        }
        return undefined;
    };

    const validateName = (name: string, fieldName: string): string | undefined => {
        if (!name.trim()) return `${fieldName} is required`;
        if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`;
        if (name.trim().length > 50) return `${fieldName} must be less than 50 characters`;
        // Check for valid characters (letters, spaces, hyphens, apostrophes)
        const nameRegex = /^[a-zA-Z\s\-']+$/;
        if (!nameRegex.test(name.trim())) {
            return `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`;
        }
        return undefined;
    };

    const validateAddress = (address: string): string | undefined => {
        if (!address.trim()) return 'Address is required';
        if (address.trim().length < 10) return 'Address must be at least 10 characters';
        if (address.trim().length > 200) return 'Address must be less than 200 characters';
        return undefined;
    };

    const validateCity = (city: string): string | undefined => {
        if (!city.trim()) return 'City is required';
        if (city.trim().length < 2) return 'City must be at least 2 characters';
        if (city.trim().length > 50) return 'City must be less than 50 characters';
        const cityRegex = /^[a-zA-Z\s\-']+$/;
        if (!cityRegex.test(city.trim())) {
            return 'City can only contain letters, spaces, hyphens, and apostrophes';
        }
        return undefined;
    };

    const validateState = (state: string): string | undefined => {
        if (!state.trim()) return 'State is required';
        if (state.trim().length < 2) return 'State must be at least 2 characters';
        if (state.trim().length > 50) return 'State must be less than 50 characters';
        const stateRegex = /^[a-zA-Z\s\-']+$/;
        if (!stateRegex.test(state.trim())) {
            return 'State can only contain letters, spaces, hyphens, and apostrophes';
        }
        return undefined;
    };

    const validatePostcode = (postcode: string): string | undefined => {
        if (!postcode.trim()) return 'Postal code is required';
        // Indian postal codes are 6 digits
        const postcodeRegex = /^\d{6}$/;
        if (!postcodeRegex.test(postcode.trim())) {
            return 'Please enter a valid 6-digit postal code';
        }
        return undefined;
    };

    const validateField = (field: keyof ShippingAddress, value: string): string | undefined => {
        switch (field) {
            case 'firstName':
                return validateName(value, 'First name');
            case 'lastName':
                return validateName(value, 'Last name');
            case 'email':
                return validateEmail(value);
            case 'phone':
                return validatePhone(value);
            case 'address':
                return validateAddress(value);
            case 'city':
                return validateCity(value);
            case 'state':
                return validateState(value);
            case 'postcode':
                return validatePostcode(value);
            default:
                return undefined;
        }
    };

    const handleInputChange = (field: keyof ShippingAddress, value: string) => {
        setShippingAddress(prev => ({
            ...prev,
            [field]: value
        }));

        // Only validate fields that are in ValidationErrors interface
        if (field !== 'country') {
            // Clear error when user starts typing
            if (validationErrors[field as keyof ValidationErrors]) {
                setValidationErrors(prev => ({
                    ...prev,
                    [field as keyof ValidationErrors]: undefined
                }));
            }

            // Real-time validation
            const error = validateField(field, value);
            if (error) {
                setValidationErrors(prev => ({
                    ...prev,
                    [field as keyof ValidationErrors]: error
                }));
            } else {
                setValidationErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors[field as keyof ValidationErrors];
                    return newErrors;
                });
            }
        }
    };

    const handleSuccessModalClose = () => {
        setShowSuccessModal(false);
        onSuccess(orderId);
    };

    const handleViewOrders = () => {
        // Navigate to orders page or trigger orders view
        window.location.href = '/#orders';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        setErrorMessage('');

        try {
            // Validate all fields
            const requiredFields: (keyof ShippingAddress)[] = ['firstName', 'lastName', 'email', 'phone', 'address', 'city', 'state', 'postcode'];
            const newValidationErrors: ValidationErrors = {};
            let hasErrors = false;

            for (const field of requiredFields) {
                const error = validateField(field, shippingAddress[field]);
                if (error) {
                    newValidationErrors[field as keyof ValidationErrors] = error;
                    hasErrors = true;
                }
            }

            if (hasErrors) {
                setValidationErrors(newValidationErrors);
                setErrorMessage('Please fix the validation errors below');
                setIsProcessing(false);
                return;
            }

            // Create WooCommerce order
            const orderData = {
                payment_method: 'razorpay',
                payment_method_title: 'Razorpay',
                set_paid: false,
                billing: {
                    first_name: shippingAddress.firstName,
                    last_name: shippingAddress.lastName,
                    email: shippingAddress.email,
                    phone: shippingAddress.phone,
                    address_1: shippingAddress.address,
                    city: shippingAddress.city,
                    state: shippingAddress.state,
                    postcode: shippingAddress.postcode,
                    country: shippingAddress.country
                },
                line_items: items.map(item => {
                    const itemPrice = calculateTotal(item.style.price, item.printSize.price, item.placement);
                    const wooCommerceProductId = WOOCOMMERCE_PRODUCT_MAPPING[item.style.id] || 39464; // Use mapping or fallback
                    return {
                        product_id: wooCommerceProductId,
                        quantity: item.quantity,
                        meta_data: [
                            { key: 'design_id', value: design.id },
                            { key: 'color', value: item.color.name },
                            { key: 'size', value: item.size },
                            { key: 'print_size', value: item.printSize.name },
                            { key: 'placement', value: item.placement },
                            { key: 'item_price', value: itemPrice.toString() }
                        ]
                    };
                }),
                meta_data: [
                    { key: 'design_prompt', value: design.prompt.text },
                    { key: 'design_image', value: design.ftpImageUrl || design.imageUrl },
                    { key: 'art_style', value: design.prompt.artStyle },
                    { key: 'music_genre', value: design.prompt.musicGenre }
                ]
            };

            console.log('Creating order with data:', orderData);
            const order = await createOrder(orderData);
            const orderId = (order as Record<string, unknown>).id?.toString() || 'unknown';

            console.log('Order created successfully:', order);

            // Save to database via API
            try {
                console.log('Saving order to database via API...');

                // Prepare order data for database
                const dbOrderData = {
                    order_id: orderId,
                    email: shippingAddress.email,
                    name: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
                    google_id: 'checkout_user',
                    status: 'processing',
                    deposit_amount: 50.00, // Rs 50 deposit
                    total_amount: totalAmount,
                    payment_method: 'razorpay',
                    payment_status: 'paid',
                    razorpay_order_id: orderId,
                    razorpay_payment_id: orderId,
                    woocommerce_order_id: orderId, // Save WooCommerce order ID
                    items: items.map(item => {
                        const itemPrice = calculateTotal(item.style.price, item.printSize.price, item.placement);
                        return {
                            tshirt_style: item.style.name,
                            tshirt_color: item.color.name,
                            tshirt_size: item.size,
                            print_size: item.printSize.name,
                            placement: item.placement,
                            quantity: item.quantity,
                            unit_price: itemPrice,
                            total_price: itemPrice * item.quantity
                        };
                    }),
                    design: {
                        prompt_text: design.prompt.text,
                        art_style: design.prompt.artStyle,
                        music_genre: design.prompt.musicGenre,
                        image_url: design.ftpImageUrl || design.imageUrl,
                        ftp_image_path: design.ftpPath || design.ftpImageUrl,
                        is_ai_generated: true
                    },
                    shipping_address: {
                        first_name: shippingAddress.firstName,
                        last_name: shippingAddress.lastName,
                        email: shippingAddress.email,
                        phone: shippingAddress.phone,
                        address: shippingAddress.address,
                        city: shippingAddress.city,
                        state: shippingAddress.state,
                        postcode: shippingAddress.postcode,
                        country: shippingAddress.country
                    }
                };

                // Save to database via API
                const dbResponse = await fetch('/api/database/orders', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(dbOrderData)
                });

                if (dbResponse.ok) {
                    const dbResult = await dbResponse.json();
                    if (dbResult.fallback) {
                        console.warn('Database not available, using WooCommerce only:', dbResult.message);
                    } else {
                        console.log('✅ Order successfully saved to MySQL database!', dbResult);
                    }
                } else {
                    const dbError = await dbResponse.json();
                    console.warn('Database save failed:', dbError);
                    console.warn('Order saved to WooCommerce but not to database');
                }
            } catch (dbError) {
                console.error('Database save failed:', dbError);
                console.warn('Order saved to WooCommerce but not to database');
                // Don't fail the order if database save fails
            }

            // Create FTP folder and save files
            try {
                const ftpOrderData: FTPOrderData = {
                    id: orderId,
                    orderDate: new Date(),
                    customerName: `${shippingAddress.firstName} ${shippingAddress.lastName}`,
                    customerEmail: shippingAddress.email,
                    customerPhone: shippingAddress.phone,
                    items: items.map(item => {
                        const itemPrice = calculateTotal(item.style.price, item.printSize.price, item.placement);
                        return {
                            ...item,
                            price: itemPrice * item.quantity
                        };
                    }),
                    totalAmount,
                    status: 'processing',
                    paymentMethod: 'razorpay',
                    shippingAddress: {
                        address: shippingAddress.address,
                        city: shippingAddress.city,
                        state: shippingAddress.state,
                        postcode: shippingAddress.postcode,
                        country: shippingAddress.country
                    }
                };

                const ftpResult = await ftpService.createOrderFolder({
                    order: ftpOrderData,
                    design,
                    designImage: design.ftpImageUrl || design.imageUrl // Use FTP URL if available
                });

                if (ftpResult.success) {
                    console.log('Order files saved to FTP:', ftpResult.filePath);
                } else {
                    console.warn('FTP save failed:', ftpResult.message);
                }
            } catch (ftpError) {
                console.warn('FTP operation failed:', ftpError);
                // Don't fail the order creation if FTP fails
            }

            // FTP operations are now handled server-side via API routes

            // Show success modal
            setOrderId(orderId);
            setShowSuccessModal(true);

            // Show development mode message if applicable
            if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY) {
                console.log('Development mode: All operations were simulated');
            }

            onSuccess(orderId);

        } catch (error) {
            console.error('Checkout error:', error);

            // Handle specific error types
            if (error instanceof Error) {
                if (error.message.includes('required')) {
                    setErrorMessage(error.message);
                } else if (error.message.includes('WooCommerce')) {
                    setErrorMessage('Order creation failed. Please try again or contact support.');
                } else {
                    setErrorMessage('An unexpected error occurred. Please try again.');
                }
            } else {
                setErrorMessage('Checkout failed. Please try again.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl">
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Checkout</h2>
            </div>

            {/* Development Mode Indicator */}
            {process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_WOOCOMMERCE_CONSUMER_KEY && (
                <div className="mx-8 mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-3 text-sm text-blue-700 dark:text-blue-300">
                        <span className="text-lg">🧪</span>
                        <div>
                            <strong>Development Mode:</strong> Order creation and FTP operations will be simulated
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Order Summary */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-3 text-lg">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <Check className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        Order Summary
                    </h3>
                    <div className="space-y-3">
                        {items.map((item, index) => {
                            const itemPrice = calculateTotal(item.style.price, item.printSize.price, item.placement);
                            const totalItemPrice = itemPrice * item.quantity;
                            return (
                                <div key={index} className="flex justify-between items-center py-2">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600"
                                            style={{ backgroundColor: item.color.hexCode }}
                                        />
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                                            {item.style.name} - {item.color.name} ({item.size}) - {item.printSize.name}
                                        </span>
                                    </div>
                                    <span className="text-gray-900 dark:text-white font-semibold">{formatPrice(totalItemPrice)}</span>
                                </div>
                            );
                        })}
                        <div className="border-t border-gray-300 dark:border-gray-600 pt-4 mt-4">
                            <div className="flex justify-between items-center">
                                <span className="text-xl font-bold text-gray-900 dark:text-white">Total</span>
                                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatPrice(totalAmount)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shipping Information */}
                <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-3 text-lg">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        Shipping Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                First Name *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={shippingAddress.firstName}
                                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${validationErrors.firstName
                                        ? 'border-red-500 dark:border-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                    placeholder="e.g., John"
                                    required
                                />
                                {validationErrors.firstName ? (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                    </div>
                                ) : shippingAddress.firstName && !validationErrors.firstName ? (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                ) : null}
                            </div>
                            {validationErrors.firstName && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {validationErrors.firstName}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Last Name *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={shippingAddress.lastName}
                                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${validationErrors.lastName
                                        ? 'border-red-500 dark:border-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                    placeholder="e.g., Smith"
                                    required
                                />
                                {validationErrors.lastName ? (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                    </div>
                                ) : shippingAddress.lastName && !validationErrors.lastName ? (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                ) : null}
                            </div>
                            {validationErrors.lastName && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {validationErrors.lastName}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Email * {isEmailDisabled && <span className="text-sm text-blue-600 dark:text-blue-400">(Auto-filled from your account)</span>}
                            </label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={shippingAddress.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    disabled={isEmailDisabled}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${isEmailDisabled
                                        ? 'bg-gray-100 dark:bg-gray-600 border-gray-300 dark:border-gray-500 cursor-not-allowed'
                                        : validationErrors.email
                                            ? 'border-red-500 dark:border-red-400 bg-white dark:bg-gray-700'
                                            : 'border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700'
                                        }`}
                                    placeholder="e.g., john.smith@gmail.com"
                                    required
                                />
                                {isEmailDisabled ? (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <CheckCircle className="h-5 w-5 text-blue-500" />
                                    </div>
                                ) : validationErrors.email ? (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                    </div>
                                ) : shippingAddress.email && !validationErrors.email ? (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                ) : null}
                            </div>
                            {validationErrors.email && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {validationErrors.email}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Phone *
                            </label>
                            <div className="relative">
                                <input
                                    type="tel"
                                    value={shippingAddress.phone}
                                    onChange={(e) => handleInputChange('phone', e.target.value)}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${validationErrors.phone
                                        ? 'border-red-500 dark:border-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                    placeholder="e.g., +91 98765 43210"
                                    required
                                />
                                {validationErrors.phone ? (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                    </div>
                                ) : shippingAddress.phone && !validationErrors.phone ? (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                ) : null}
                            </div>
                            {validationErrors.phone && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {validationErrors.phone}
                                </p>
                            )}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Address *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={shippingAddress.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${validationErrors.address
                                        ? 'border-red-500 dark:border-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                    placeholder="e.g., 123 Main Street, Apartment 4B"
                                    required
                                />
                                {validationErrors.address ? (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                    </div>
                                ) : shippingAddress.address && !validationErrors.address ? (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                ) : null}
                            </div>
                            {validationErrors.address && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {validationErrors.address}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                City *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={shippingAddress.city}
                                    onChange={(e) => handleInputChange('city', e.target.value)}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${validationErrors.city
                                        ? 'border-red-500 dark:border-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                    placeholder="e.g., Mumbai"
                                    required
                                />
                                {validationErrors.city ? (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                    </div>
                                ) : shippingAddress.city && !validationErrors.city ? (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                ) : null}
                            </div>
                            {validationErrors.city && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {validationErrors.city}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                State *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={shippingAddress.state}
                                    onChange={(e) => handleInputChange('state', e.target.value)}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${validationErrors.state
                                        ? 'border-red-500 dark:border-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                    placeholder="e.g., Maharashtra"
                                    required
                                />
                                {validationErrors.state ? (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                    </div>
                                ) : shippingAddress.state && !validationErrors.state ? (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                ) : null}
                            </div>
                            {validationErrors.state && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {validationErrors.state}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Postal Code *
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={shippingAddress.postcode}
                                    onChange={(e) => handleInputChange('postcode', e.target.value)}
                                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${validationErrors.postcode
                                        ? 'border-red-500 dark:border-red-400 focus:ring-2 focus:ring-red-500 focus:border-red-500'
                                        : 'border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                                        }`}
                                    placeholder="e.g., 400001"
                                    required
                                />
                                {validationErrors.postcode ? (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <AlertCircle className="h-5 w-5 text-red-500" />
                                    </div>
                                ) : shippingAddress.postcode && !validationErrors.postcode ? (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    </div>
                                ) : null}
                            </div>
                            {validationErrors.postcode && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                                    <AlertCircle className="h-4 w-4" />
                                    {validationErrors.postcode}
                                </p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Country
                            </label>
                            <select
                                value={shippingAddress.country}
                                onChange={(e) => handleInputChange('country', e.target.value)}
                                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none transition-all duration-200 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                disabled
                            >
                                <option value="IN">India</option>
                            </select>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Currently only shipping to India
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {errorMessage && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">{errorMessage}</p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-6 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 font-semibold hover:scale-105"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isProcessing}
                        className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100"
                    >
                        {isProcessing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <CreditCard className="h-6 w-6" />
                                Place Order
                            </>
                        )}
                    </button>
                </div>
            </form>

            {/* Success Modal */}
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={handleSuccessModalClose}
                orderId={orderId}
                onViewOrders={handleViewOrders}
            />
        </div>
    );
}
