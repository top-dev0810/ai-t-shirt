export interface User {
    id: string;
    name: string;
    email: string;
    avatar?: string;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    imageUrl?: string;
}

export interface DesignPrompt {
    text: string;
    artStyle: string;
    musicGenre: string;
    imageUrl?: string;
}

export interface GeneratedDesign {
    id: string;
    imageUrl: string;
    ftpImageUrl?: string;
    ftpPath?: string;
    prompt: DesignPrompt;
    userId: string;
    createdAt: Date;
    isPublic: boolean;
}

export interface TshirtStyle {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    colors: TshirtColor[];
}

export interface TshirtColor {
    id: string;
    name: string;
    hexCode: string;
    imageUrl: string;
    printArea: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export interface PrintSize {
    id: string;
    name: string;
    price: number;
    dimensions: string;
}

export interface OrderItem {
    style: TshirtStyle;
    color: TshirtColor;
    size: 'S' | 'M' | 'L' | 'XL';
    printSize: PrintSize;
    placement: 'front' | 'back' | 'both';
    design: GeneratedDesign;
    quantity: number;
}

export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

export interface PaymentDetails {
    amount: number;
    currency: string;
    paymentId: string;
    status: 'pending' | 'completed' | 'failed';
}

export interface ArtStyle {
    id: string;
    name: string;
    description: string;
    prompt: string;
}

export interface MusicGenre {
    id: string;
    name: string;
    description: string;
    prompt: string;
}
