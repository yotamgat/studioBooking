'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  reason?: string;
}

interface TimeSlotSelectorProps {
  studioId: string;
  date: Date;
  onSlotSelect: (startTime: string, endTime: string) => void;
  selectedSlots?: string[];
}

export default function TimeSlotSelector({
  studioId,
  date,
  onSlotSelect,
  selectedSlots = [],
}: TimeSlotSelectorProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailability();
  }, [studioId, date]);

  const fetchAvailability = async () => {
    try {
      setLoading(true);
      setError('');
      
      const dateStr = format(date, 'yyyy-MM-dd');
      const response = await fetch(
        `/api/bookings/availability?studioId=${studioId}&date=${dateStr}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch availability');
      }

      const data = await response.json();
      setTimeSlots(data.data.timeSlots);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching availability:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return format(date, 'HH:mm');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-red-600">
          <p>שגיאה בטעינת זמינות</p>
          <button
            onClick={fetchAvailability}
            className="mt-4 text-purple-600 hover:text-purple-700"
          >
            נסה שוב
          </button>
        </div>
      </div>
    );
  }

  const availableSlots = timeSlots.filter(slot => slot.available);
  const unavailableSlots = timeSlots.filter(slot => !slot.available);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold mb-4">בחר שעות</h3>

      {availableSlots.length === 0 ? (
        <div className="text-center py-8 text-gray-600">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-lg font-medium">אין שעות פנויות בתאריך זה</p>
          <p className="text-sm mt-2">נסה לבחור תאריך אחר</p>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="mb-4 text-sm text-gray-600">
            {availableSlots.length} שעות פנויות
          </div>

          {/* Available Slots */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {availableSlots.map((slot, index) => {
              const isSelected = selectedSlots.includes(slot.startTime);
              
              return (
                <button
                  key={index}
                  onClick={() => onSlotSelect(slot.startTime, slot.endTime)}
                  className={`
                    p-3 rounded-lg border-2 transition font-medium
                    ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-900 border-gray-200 hover:border-purple-600 hover:bg-purple-50'
                    }
                  `}
                >
                  {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                </button>
              );
            })}
          </div>

          {/* Unavailable Slots */}
          {unavailableSlots.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-600 mb-2">
                שעות תפוסות/חסומות
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 opacity-50">
                {unavailableSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-gray-100 border-2 border-gray-200 text-gray-500 text-center"
                  >
                    <div className="font-medium">
                      {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                    </div>
                    {slot.reason && (
                      <div className="text-xs mt-1">{slot.reason}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selection Summary */}
      {selectedSlots.length > 0 && (
        <div className="mt-6 p-4 bg-purple-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-purple-900">שעות שנבחרו:</p>
              <p className="text-sm text-purple-700">
                {selectedSlots.length} שעה/שעות
              </p>
            </div>
            <div className="text-left">
              <p className="text-sm text-purple-700">סה"כ:</p>
              <p className="text-xl font-bold text-purple-900">
                ₪{selectedSlots.length * 150}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
