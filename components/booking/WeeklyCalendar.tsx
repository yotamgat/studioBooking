'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { he } from 'date-fns/locale';

interface WeeklyCalendarProps {
  studioId: string;
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

interface DayAvailability {
  date: Date;
  slots: {
    hour: number;
    available: boolean;
  }[];
}

export default function WeeklyCalendar({ studioId, onDateSelect, selectedDate }: WeeklyCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [weekAvailability, setWeekAvailability] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWeekAvailability();
  }, [currentWeek, studioId]);

  const fetchWeekAvailability = async () => {
    setLoading(true);
    try {
      const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
      
      const availabilityPromises = weekDays.map(async (date) => {
        const response = await fetch(
          `/api/bookings/day-availability?studioId=${studioId}&date=${date.toISOString()}`
        );
        
        if (response.ok) {
          const data = await response.json();
          return {
            date,
            slots: data.slots || []
          };
        }
        
        return {
          date,
          slots: []
        };
      });

      const availability = await Promise.all(availabilityPromises);
      setWeekAvailability(availability);
    } catch (error) {
      console.error('שגיאה בטעינת זמינות:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToPrevWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const goToToday = () => {
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 0 }));
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
  const hours = Array.from({ length: 14 }, (_, i) => 9 + i); // 9:00-22:00

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-purple-600 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={goToPrevWeek}
            className="p-2 hover:bg-purple-700 rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-center">
            <h2 className="text-xl font-bold">
              {format(currentWeek, 'MMMM yyyy', { locale: he })}
            </h2>
            <button
              onClick={goToToday}
              className="text-sm text-purple-200 hover:text-white mt-1"
            >
              חזור להיום
            </button>
          </div>

          <button
            onClick={goToNextWeek}
            className="p-2 hover:bg-purple-700 rounded-lg transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {weekDays.map((day, index) => {
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            const isPast = isBefore(day, startOfDay(new Date()));

            return (
              <div
                key={index}
                className={`
                  p-2 rounded-t-lg transition
                  ${isSelected ? 'bg-purple-800' : ''}
                  ${isTodayDate && !isSelected ? 'bg-purple-500' : ''}
                  ${isPast ? 'opacity-50' : ''}
                `}
              >
                <div className="font-bold">{format(day, 'EEE', { locale: he })}</div>
                <div className="text-2xl">{format(day, 'd')}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">טוען זמינות...</p>
          </div>
        ) : (
          <div className="min-w-[800px]">
            {/* Time labels and slots */}
            {hours.map((hour) => (
              <div key={hour} className="grid grid-cols-8 border-b border-gray-200">
                {/* Time label */}
                <div className="p-2 text-sm font-medium text-gray-600 border-l border-gray-200 flex items-center justify-center">
                  {String(hour).padStart(2, '0')}:00
                </div>

                {/* Day slots */}
                {weekDays.map((day, dayIndex) => {
                  const dayAvail = weekAvailability[dayIndex];
                  const slot = dayAvail?.slots.find(s => s.hour === hour);
                  const isAvailable = slot?.available ?? false;
                  const isPast = isBefore(day, startOfDay(new Date())) || 
                                 (isSameDay(day, new Date()) && hour < new Date().getHours());
                  const isSelected = selectedDate && isSameDay(day, selectedDate);

                  return (
                    <button
                      key={dayIndex}
                      onClick={() => !isPast && onDateSelect(day)}
                      disabled={isPast}
                      className={`
                        p-3 text-center transition border-l border-gray-100
                        ${isPast ? 'bg-gray-50 cursor-not-allowed' : ''}
                        ${!isPast && isAvailable ? 'bg-green-50 hover:bg-green-100' : ''}
                        ${!isPast && !isAvailable ? 'bg-red-50 hover:bg-red-100' : ''}
                        ${isSelected ? 'ring-2 ring-purple-600' : ''}
                      `}
                    >
                      {!isPast && (
                        <div className="flex items-center justify-center h-full">
                          {isAvailable ? (
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          ) : (
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 p-4 border-t flex flex-wrap gap-6 text-sm justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span className="text-gray-700">פנוי</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span className="text-gray-700">תפוס</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200"></div>
          <span className="text-gray-700">עבר</span>
        </div>
      </div>
    </div>
  );
}
