'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Studio {
  id: string;
  name: string;
  description: string;
  detailedInfo?: string;
  capacity?: number;
  size?: number;
  amenities: string[];
  images: string[];
  features?: string[];
}

interface StudioSelectorProps {
  studios: Studio[];
  onSelect: (studioId: string) => void;
}

export default function StudioSelector({ studios, onSelect }: StudioSelectorProps) {
  const [selectedStudio, setSelectedStudio] = useState<string | null>(null);
  const [showDetailsId, setShowDetailsId] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});

  const handleSelect = (studioId: string) => {
    setSelectedStudio(studioId);
    onSelect(studioId);
  };

  const toggleDetails = (studioId: string) => {
    setShowDetailsId(showDetailsId === studioId ? null : studioId);
  };

  const nextImage = (studioId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [studioId]: ((prev[studioId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (studioId: string, totalImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [studioId]: ((prev[studioId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">בחר חלל ריקוד</h2>

      <div className="grid md:grid-cols-2 gap-8">
        {studios.map((studio) => {
          const isExpanded = showDetailsId === studio.id;
          const imageIndex = currentImageIndex[studio.id] || 0;
          const currentImage = studio.images[imageIndex] || '/placeholder-studio.jpg';

          return (
            <div
              key={studio.id}
              className={`
                bg-white rounded-xl shadow-lg overflow-hidden border-2 transition-all
                ${selectedStudio === studio.id ? 'border-purple-600 ring-4 ring-purple-200' : 'border-gray-200'}
              `}
            >
              {/* Image Gallery with Navigation */}
              <div className="relative h-64 bg-gray-200 group">
                {studio.images.length > 0 ? (
                  <>
                    <div className="relative w-full h-full">
                      <Image
                        src={currentImage}
                        alt={studio.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>

                    {/* Navigation Arrows */}
                    {studio.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            prevImage(studio.id, studio.images.length);
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            nextImage(studio.id, studio.images.length);
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>

                        {/* Image Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                          {imageIndex + 1} / {studio.images.length}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <svg
                      className="w-24 h-24 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Header */}
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{studio.name}</h3>
                  <p className="text-gray-600">{studio.description}</p>
                </div>

                {/* Quick Info */}
                <div className="flex flex-wrap gap-4 mb-4 text-sm">
                  {studio.capacity && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>עד {studio.capacity} איש</span>
                    </div>
                  )}
                  {studio.size && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                      <span>{studio.size} מ"ר</span>
                    </div>
                  )}
                </div>

                {/* Features */}
                {studio.features && studio.features.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">מתקנים:</h4>
                    <div className="flex flex-wrap gap-2">
                      {studio.features.map((feature, index) => (
                        <span
                          key={index}
                          className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Info - Expandable */}
                {studio.detailedInfo && (
                  <div className="mb-4">
                    <button
                      onClick={() => toggleDetails(studio.id)}
                      className="text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-2"
                    >
                      {isExpanded ? 'הסתר פרטים' : 'פרטים נוספים'}
                      <svg
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {isExpanded && (
                      <div className="mt-3 text-gray-700 text-sm bg-gray-50 p-4 rounded-lg whitespace-pre-line">
                        {studio.detailedInfo}
                      </div>
                    )}
                  </div>
                )}

                {/* Select Button */}
                <button
                  onClick={() => handleSelect(studio.id)}
                  className={`
                    w-full py-4 rounded-lg font-bold text-lg transition-all
                    ${
                      selectedStudio === studio.id
                        ? 'bg-purple-600 text-white shadow-lg scale-105'
                        : 'bg-purple-600 text-white hover:bg-purple-700 hover:shadow-lg'
                    }
                  `}
                >
                  {selectedStudio === studio.id ? 'נבחר ✓' : 'בחר חלל זה'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">💡 שים לב</p>
        <p>המחיר הסופי יחושב לפי מספר המשתתפים, סוג הפעילות ומשך ההשכרה</p>
      </div>
    </div>
  );
}
