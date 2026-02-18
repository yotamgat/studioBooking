interface Studio {
  _id: string;
  name: string;
  description?: string;
  capacity: number;
  pricePerHour: number;
  amenities: string[];
  images: string[];
  isActive: boolean;
}

interface StudioCardProps {
  studio: Studio;
  onBook: (studioId: string) => void;
}

export default function StudioCard({ studio, onBook }: StudioCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      {/* Image placeholder */}
      <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
        <div className="text-white text-6xl">🎭</div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <h3 className="text-2xl font-bold text-purple-900 mb-2">
          {studio.name}
        </h3>
        
        {studio.description && (
          <p className="text-gray-600 mb-4 line-clamp-2">
            {studio.description}
          </p>
        )}
        
        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">קיבולת:</span>
            <span className="font-semibold">{studio.capacity} אנשים</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600">מחיר לשעה:</span>
            <span className="text-2xl font-bold text-purple-600">
              ₪{studio.pricePerHour}
            </span>
          </div>
        </div>
        
        {/* Amenities */}
        {studio.amenities.length > 0 && (
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">מתקנים:</p>
            <div className="flex flex-wrap gap-2">
              {studio.amenities.slice(0, 3).map((amenity, index) => (
                <span
                  key={index}
                  className="bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded"
                >
                  {amenity}
                </span>
              ))}
              {studio.amenities.length > 3 && (
                <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  +{studio.amenities.length - 3} נוספים
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Book button */}
        <button
          onClick={() => onBook(studio._id)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          הזמן עכשיו
        </button>
      </div>
    </div>
  );
}
