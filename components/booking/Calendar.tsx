'use client';

import { useState } from 'react';
import { format, addDays, startOfWeek, addWeeks, isSameDay, isToday } from 'date-fns';
import { he } from 'date-fns/locale';

interface CalendarProps {
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
}

export default function Calendar({ onDateSelect, selectedDate }: CalendarProps) {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 0 }));

  // Generate week days
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  const goToNextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToPrevWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, -1));
  };

  const goToToday = () => {
    setCurrentWeek(startOfWeek(new Date(), { weekStartsOn: 0 }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={goToPrevWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">
            {format(currentWeek, 'MMMM yyyy', { locale: he })}
          </h2>
          <button
            onClick={goToToday}
            className="text-sm text-purple-600 hover:text-purple-700 mt-1"
          >
            חזור להיום
          </button>
        </div>

        <button
          onClick={goToNextWeek}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-2">
        {['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'].map((day, index) => (
          <div key={index} className="text-center text-sm font-semibold text-gray-600">
            {day}
          </div>
        ))}

        {weekDays.map((day, index) => {
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isPast = day < new Date() && !isToday(day);
          const isTodayDate = isToday(day);

          return (
            <button
              key={index}
              onClick={() => !isPast && onDateSelect(day)}
              disabled={isPast}
              className={`
                aspect-square p-2 rounded-lg text-center transition
                ${isPast ? 'opacity-40 cursor-not-allowed bg-gray-50' : 'hover:bg-purple-50'}
                ${isSelected ? 'bg-purple-600 text-white hover:bg-purple-700' : ''}
                ${isTodayDate && !isSelected ? 'border-2 border-purple-600' : ''}
              `}
            >
              <div className="text-sm font-medium">
                {format(day, 'd')}
              </div>
              <div className="text-xs mt-1">
                {format(day, 'EEE', { locale: he })}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-purple-600 rounded"></div>
          <span>היום</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-600 rounded"></div>
          <span>נבחר</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-50 opacity-40 rounded"></div>
          <span>עבר</span>
        </div>
      </div>
    </div>
  );
}
