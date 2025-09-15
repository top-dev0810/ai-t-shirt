'use client';

import { useState } from 'react';
import { Send, Upload, X } from 'lucide-react';
import { DesignPrompt } from '@/lib/types';
import { ART_STYLES, MUSIC_GENRES } from '@/lib/constants';

interface DesignPromptFormProps {
    onSubmit: (prompt: DesignPrompt) => void;
}

export default function DesignPromptForm({ onSubmit }: DesignPromptFormProps) {
    const [text, setText] = useState('');
    const [artStyle, setArtStyle] = useState('');
    const [musicGenre, setMusicGenre] = useState('');
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!text.trim() || !artStyle || !musicGenre) {
            alert('Please fill in all fields');
            return;
        }

        setIsSubmitting(true);

        try {
            const prompt: DesignPrompt = {
                text: text.trim(),
                artStyle,
                musicGenre,
                imageUrl: imageUrl || undefined
            };

            await onSubmit(prompt);

            // Reset form
            setText('');
            setArtStyle('');
            setMusicGenre('');
            setImageUrl(null);
        } catch (error) {
            console.error('Error submitting prompt:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImageUrl(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageUrl(null);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Text Input */}
            <div>
                <label htmlFor="design-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Describe your design idea
                </label>
                <textarea
                    id="design-text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Describe the artwork you want on your T-shirt... (e.g., 'A futuristic city skyline with neon lights')"
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm transition-all duration-200 focus:shadow-md"
                    rows={3}
                    required
                />
            </div>

            {/* Style Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Art Style */}
                <div>
                    <label htmlFor="art-style" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Art Style
                    </label>
                    <select
                        id="art-style"
                        value={artStyle}
                        onChange={(e) => setArtStyle(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm transition-all duration-200 focus:shadow-md"
                        required
                    >
                        <option value="">Select an art style</option>
                        {ART_STYLES.map((style) => (
                            <option key={style.id} value={style.id}>
                                {style.name} - {style.description}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Music Genre */}
                <div>
                    <label htmlFor="music-genre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Music Genre
                    </label>
                    <select
                        id="music-genre"
                        value={musicGenre}
                        onChange={(e) => setMusicGenre(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm transition-all duration-200 focus:shadow-md"
                        required
                    >
                        <option value="">Select a music genre</option>
                        {MUSIC_GENRES.map((genre) => (
                            <option key={genre.id} value={genre.id}>
                                {genre.name} - {genre.description}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Image Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reference Image (Optional)
                </label>
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Upload className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Upload Image</span>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                    </label>

                    {imageUrl && (
                        <div className="flex items-center gap-2">
                            <img
                                src={imageUrl}
                                alt="Reference"
                                className="w-12 h-12 object-cover rounded border border-gray-200 dark:border-gray-600"
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="p-1 text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isSubmitting || !text.trim() || !artStyle || !musicGenre}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:scale-100"
                >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? 'Generating...' : 'Generate Design'}
                </button>
            </div>
        </form>
    );
}
