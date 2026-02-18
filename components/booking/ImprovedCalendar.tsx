'use client';

import { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, isToday, isBefore, startOfDay } from 'date-fns';
import { he } from 'date-fns/locale';

interface TimeSlot {
  time: string; // "HH:mm"
  available: boolean;
}

interface DaySchedule {
  date: Date;
  slots: TimeSlot[];
}

interface ImprovedCalendarProps {
  studioId: string;
  onTimeSelect: (date: Date, time: string) => void; // Pass both date and time
  selectedDate?: Date;
}

export default function ImprovedCalendar({ studioId, onTimeSelect, selectedDate }: ImprovedCalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));
  const [weekSchedule, setWeekSchedule] = useState<DaySchedule[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  useEffect(() => {
    fetchWeekSchedule();
  }, [currentWeek, studioId]);

  const fetchWeekSchedule = async () => {
    setLoading(true);
    try {
      const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));
      
      const schedulePromises = weekDays.map(async (date) => {
        try {
          const response = await fetch(
            `/api/bookings/available-slots?studioId=${studioId}&date=${date.toISOString()}`
          );
          
          if (response.ok) {
            const data = await response.json();
            return {
              date,
              slots: data.slots || []
            };
          }
        } catch (error) {
          console.error('Error fetching slots:', error);
        }
        
        return { date, slots: [] };
      });

      const schedule = await Promise.all(schedulePromises);
      setWeekSchedule(schedule);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const goToNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1));
  const goToPrevWeek = () => setCurrentWeek(subWeeks(currentWeek, 1));
  const goToToday = () => setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 0 }));

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-purple-600 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <button onClick={goToPrevWeek} className="p-2 hover:bg-purple-700 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="text-center">
            <h2 className="text-xl font-bold">
              {format(currentWeek, 'MMMM yyyy', { locale: he })}
            </h2>
            <button onClick={goToToday} className="text-sm text-purple-200 hover:text-white mt-1">
              חזור להיום
            </button>
          </div>

          <button onClick={goToNextWeek} className="p-2 hover:bg-purple-700 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Days List */}
      <div className="divide-y">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">טוען זמינות...</p>
          </div>
        ) : (
          weekDays.map((day, dayIndex) => {
            const daySchedule = weekSchedule[dayIndex];
            const isPast = isBefore(day, startOfDay(new Date()));
            const isTodayDate = isToday(day);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isExpanded = expandedDay === dayIndex;
            const availableSlots = daySchedule?.slots.filter(s => s.available) || [];

            return (
              <div
                key={dayIndex}
                className={`
                  ${isPast ? 'bg-gray-50 opacity-60' : ''}
                  ${isSelected ? 'bg-purple-50 border-r-4 border-purple-600' : ''}
                `}
              >
                {/* Day Header */}
                <button
                  onClick={() => !isPast && setExpandedDay(isExpanded ? null : dayIndex)}
                  disabled={isPast}
                  className="w-full p-4 text-right hover:bg-gray-50 transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className={`
                      text-center
                      ${isTodayDate ? 'bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center' : ''}
                    `}>
                      <div className="font-bold text-lg">{format(day, 'd')}</div>
                    </div>
                    <div>
                      <div className="font-bold text-lg">{format(day, 'EEEE', { locale: he })}</div>
                      <div className="text-sm text-gray-600">
                        {format(day, 'd MMMM', { locale: he })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isPast && (
                      <div className="text-sm">
                        {availableSlots.length > 0 ? (
                          <span className="text-green-600 font-medium">
                            {availableSlots.length} משבצות פנויות
                          </span>
                        ) : (
                          <span className="text-red-600">מלא</span>
                        )}
                      </div>
                    )}
                    {!isPast && (
                      <svg
                        className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    )}
                  </div>
                </button>

                {/* Time Slots */}
                {isExpanded && !isPast && (
                  <div className="p-4 bg-gray-50 border-t">
                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                      {daySchedule?.slots.map((slot, slotIndex) => (
                        <button
                          key={slotIndex}
                          onClick={() => slot.available && onTimeSelect(day, slot.time)}
                          disabled={!slot.available}
                          className={`
                            p-2 rounded-lg text-sm font-medium transition
                            ${slot.available
                              ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-300'
                              : 'bg-red-50 text-red-400 cursor-not-allowed border border-red-200'
                            }
                          `}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                    {availableSlots.length === 0 && (
                      <p className="text-center text-gray-500 py-4">אין משבצות פנויות ביום זה</p>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Legend */}
      <div className="bg-gray-50 p-4 border-t flex flex-wrap gap-4 text-sm justify-center">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
          <span>פנוי</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-50 border border-red-200 rounded"></div>
          <span>תפוס</span>
        </div>
      </div>
    </div>
  );
}
