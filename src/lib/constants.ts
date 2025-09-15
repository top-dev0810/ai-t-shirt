import { ArtStyle, MusicGenre, PrintSize, TshirtStyle } from './types';

export const ART_STYLES: ArtStyle[] = [
    {
        id: 'realistic',
        name: 'Realistic',
        description: 'Photorealistic artwork with detailed textures',
        prompt: 'realistic, detailed, high quality'
    },
    {
        id: 'cartoon',
        name: 'Cartoon',
        description: 'Fun and colorful cartoon style',
        prompt: 'cartoon, vibrant, fun, colorful'
    },
    {
        id: 'abstract',
        name: 'Abstract',
        description: 'Modern abstract and geometric designs',
        prompt: 'abstract, geometric, modern, minimalist'
    },
    {
        id: 'vintage',
        name: 'Vintage',
        description: 'Retro and nostalgic aesthetic',
        prompt: 'vintage, retro, nostalgic, classic'
    },
    {
        id: 'watercolor',
        name: 'Watercolor',
        description: 'Soft and artistic watercolor style',
        prompt: 'watercolor, soft, artistic, flowing'
    }
];

export const MUSIC_GENRES: MusicGenre[] = [
    {
        id: 'rock',
        name: 'Rock',
        description: 'Energetic and powerful rock music',
        prompt: 'rock music, energetic, powerful, guitar'
    },
    {
        id: 'jazz',
        name: 'Jazz',
        description: 'Smooth and sophisticated jazz',
        prompt: 'jazz music, smooth, sophisticated, saxophone'
    },
    {
        id: 'electronic',
        name: 'Electronic',
        description: 'Modern electronic and EDM',
        prompt: 'electronic music, modern, digital, synth'
    },
    {
        id: 'classical',
        name: 'Classical',
        description: 'Elegant classical music',
        prompt: 'classical music, elegant, orchestral, timeless'
    },
    {
        id: 'hiphop',
        name: 'Hip Hop',
        description: 'Urban and street culture',
        prompt: 'hip hop, urban, street culture, graffiti'
    }
];

// Mapping between our style IDs and WooCommerce product IDs
export const WOOCOMMERCE_PRODUCT_MAPPING: Record<string, number> = {
    'round-neck': 39464, // Use existing product ID
    'full-sleeve': 39464, // Use existing product ID for now
    'hoodie': 39464, // Use existing product ID for now
    'tank-top': 39464, // Use existing product ID for now
    'polo': 39464, // Use existing product ID for now
};

export const TSHIRT_STYLES: TshirtStyle[] = [
    {
        id: 'round-neck',
        name: 'Round Neck',
        price: 399,
        imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/round-neck-black.jpg',
        colors: [
            {
                id: 'black',
                name: 'Black',
                hexCode: '#000000',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/round-neck-black.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'dark-blue',
                name: 'Dark Blue',
                hexCode: '#1E3A8A',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/round-neck-dark-blue.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'white',
                name: 'White',
                hexCode: '#FFFFFF',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/round-neck-white.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'red',
                name: 'Red',
                hexCode: '#DC2626',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/round-neck-red.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'gray',
                name: 'Gray',
                hexCode: '#6B7280',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/round-neck-gray.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'cyan',
                name: 'Cyan',
                hexCode: '#06B6D4',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/round-neck-cyan.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'blue',
                name: 'Blue',
                hexCode: '#3B82F6',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/round-neck-blue.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'green',
                name: 'Green',
                hexCode: '#059669',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/round-neck-green.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'orange',
                name: 'Orange',
                hexCode: '#EA580C',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/round-neck-orange.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'pink',
                name: 'Pink',
                hexCode: '#EC4899',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/round-neck-pink.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            }
        ]
    },
    {
        id: 'full-sleeve',
        name: 'Full Sleeve',
        price: 499,
        imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/full-sleeve-black.jpg',
        colors: [
            {
                id: 'black',
                name: 'Black',
                hexCode: '#000000',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/full-sleeve-black.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'dark-blue',
                name: 'Dark Blue',
                hexCode: '#1E3A8A',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/full-sleeve-dark-blue.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'white',
                name: 'White',
                hexCode: '#FFFFFF',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/full-sleeve-white.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'red',
                name: 'Red',
                hexCode: '#DC2626',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/full-sleeve-red.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'gray',
                name: 'Gray',
                hexCode: '#6B7280',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/full-sleeve-gray.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'cyan',
                name: 'Cyan',
                hexCode: '#06B6D4',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/full-sleeve-cyan.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'blue',
                name: 'Blue',
                hexCode: '#3B82F6',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/full-sleeve-blue.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'green',
                name: 'Green',
                hexCode: '#059669',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/full-sleeve-green.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'orange',
                name: 'Orange',
                hexCode: '#EA580C',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/full-sleeve-orange.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'pink',
                name: 'Pink',
                hexCode: '#EC4899',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/full-sleeve-pink.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            }
        ]
    },
    {
        id: 'hoodie',
        name: 'Hoodie',
        price: 799,
        imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/hoodie-black.jpg',
        colors: [
            {
                id: 'black',
                name: 'Black',
                hexCode: '#000000',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/hoodie-black.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'dark-blue',
                name: 'Dark Blue',
                hexCode: '#1E3A8A',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/hoodie-dark-blue.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'white',
                name: 'White',
                hexCode: '#FFFFFF',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/hoodie-white.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'red',
                name: 'Red',
                hexCode: '#DC2626',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/hoodie-red.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'gray',
                name: 'Gray',
                hexCode: '#6B7280',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/hoodie-gray.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'cyan',
                name: 'Cyan',
                hexCode: '#06B6D4',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/hoodie-cyan.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'blue',
                name: 'Blue',
                hexCode: '#3B82F6',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/hoodie-blue.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'green',
                name: 'Green',
                hexCode: '#059669',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/hoodie-green.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'orange',
                name: 'Orange',
                hexCode: '#EA580C',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/hoodie-orange.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            },
            {
                id: 'pink',
                name: 'Pink',
                hexCode: '#EC4899',
                imageUrl: 'https://bandadda.com/wp-content/uploads/2024/01/hoodie-pink.jpg',
                printArea: { x: 50, y: 80, width: 200, height: 150 }
            }
        ]
    }
];

export const PRINT_SIZES: PrintSize[] = [
    { id: 'a6', name: 'A6', price: 150, dimensions: '105 x 148 mm' },
    { id: 'a5', name: 'A5', price: 175, dimensions: '148 x 210 mm' },
    { id: 'a4', name: 'A4', price: 199, dimensions: '210 x 297 mm' },
    { id: 'a3', name: 'A3', price: 249, dimensions: '297 x 420 mm' }
];

export const SIZES = ['S', 'M', 'L', 'XL'] as const;

export const PLACEMENT_OPTIONS = [
    { value: 'front', label: 'Front Only', description: 'Print on front only' },
    { value: 'back', label: 'Back Only', description: 'Print on back only' },
    { value: 'both', label: 'Front & Back', description: 'Print on both sides' }
] as const;

export const DEPOSIT_AMOUNT = 50;

// API Configuration
export const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY || '';
export const WOOCOMMERCE_CONFIG = {
    url: process.env.WOOCOMMERCE_URL || '',
    consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || '',
    consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || ''
};

export const RAZORPAY_CONFIG = {
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
    keySecret: process.env.NEXT_PUBLIC_RAZORPAY_KEY_SECRET || ''
};

export const FTP_CONFIG = {
    host: process.env.FTP_HOST || '',
    username: process.env.FTP_USERNAME || '',
    password: process.env.FTP_PASSWORD || ''
};
