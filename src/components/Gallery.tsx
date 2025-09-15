'use client';

import { useState } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import LoadingImage from './LoadingImage';

export default function Gallery() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock gallery data
  const designs = [
    {
      id: 1,
      title: 'Abstract Jazz Design',
      image: 'https://picsum.photos/300/300?random=1',
      style: 'Abstract',
      genre: 'Jazz',
      price: '₹50',
      date: '2024-01-15'
    },
    {
      id: 2,
      title: 'Rock Band Logo',
      image: 'https://picsum.photos/300/300?random=2',
      style: 'Realistic',
      genre: 'Rock',
      price: '₹50',
      date: '2024-01-14'
    },
    {
      id: 3,
      title: 'Electronic Wave',
      image: 'https://picsum.photos/300/300?random=3',
      style: 'Minimalist',
      genre: 'Electronic',
      price: '₹50',
      date: '2024-01-13'
    },
    {
      id: 4,
      title: 'Classical Symphony',
      image: 'https://picsum.photos/300/300?random=4',
      style: 'Vintage',
      genre: 'Classical',
      price: '₹50',
      date: '2024-01-12'
    },
    {
      id: 5,
      title: 'Hip Hop Street Art',
      image: 'https://picsum.photos/300/300?random=5',
      style: 'Street Art',
      genre: 'Hip Hop',
      price: '₹50',
      date: '2024-01-11'
    },
    {
      id: 6,
      title: 'Pop Color Burst',
      image: 'https://picsum.photos/300/300?random=6',
      style: 'Pop Art',
      genre: 'Pop',
      price: '₹50',
      date: '2024-01-10'
    }
  ];

  const filteredDesigns = designs.filter(design =>
    design.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    design.style.toLowerCase().includes(searchQuery.toLowerCase()) ||
    design.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 pb-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Design Gallery
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore amazing AI-generated T-shirt designs
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search designs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <button className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700">
            <Filter className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>

          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <Grid className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
            >
              <List className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Designs Grid/List */}
      <div className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
          : 'space-y-4'
      }>
        {filteredDesigns.map((design) => (
          <div
            key={design.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow ${viewMode === 'list' ? 'flex items-center gap-4 p-4' : 'overflow-hidden'
              }`}
          >
            <div className={`${viewMode === 'list' ? 'w-24 h-24' : 'w-full h-48'} relative`}>
              <LoadingImage
                src={design.image}
                alt={design.title}
                className="w-full h-full"
              />
            </div>

            <div className={`${viewMode === 'list' ? 'flex-1' : 'p-4'}`}>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {design.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                  {design.style}
                </span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                  {design.genre}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {design.price}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {design.date}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDesigns.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-600 mb-4">
            <Search className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No designs found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
    </div>
  );
}

