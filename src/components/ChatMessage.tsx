'use client';

import { useState, useEffect } from 'react';
import { ChatMessage as ChatMessageType } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface ChatMessageProps {
    message: ChatMessageType;
    onRestartDesign?: () => void;
}

export default function ChatMessageComponent({ message, onRestartDesign }: ChatMessageProps) {
    const [mounted, setMounted] = useState(false);
    const [formattedDate, setFormattedDate] = useState('');

    useEffect(() => {
        setMounted(true);
        setFormattedDate(formatDate(message.timestamp));
    }, [message.timestamp]);

    const isUser = message.role === 'user';

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${isUser
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                }`}>
                <div className="text-sm">
                    {message.content}
                </div>

                {/* Action buttons for error messages */}
                {!isUser && message.content.includes('error generating your design') && onRestartDesign && (
                    <div className="mt-3">
                        <button
                            onClick={onRestartDesign}
                            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Action button for payment cancellation */}
                {!isUser && message.content.includes('Payment was cancelled') && onRestartDesign && (
                    <div className="mt-3">
                        <button
                            onClick={onRestartDesign}
                            className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                        >
                            Start New Design
                        </button>
                    </div>
                )}

                {message.imageUrl && (
                    <div className="mt-2">
                        <img
                            src={message.imageUrl}
                            alt="Reference image"
                            className="w-full h-32 object-cover rounded"
                        />
                    </div>
                )}

                {/* Only render date when component is mounted to prevent hydration mismatch */}
                {mounted && (
                    <div className={`text-xs mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
                        {formattedDate}
                    </div>
                )}
            </div>
        </div>
    );
}
