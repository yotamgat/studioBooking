'use client';

import { useState, useEffect } from 'react';
import TermsModal from '@/components/TermsModal';

interface BookingDetailsProps {
  studioId: string;
  date: Date;
  initialTime?: string; // Optional initial time from calendar selection
  onConfirm: (details: {
    startTime: string;
    duration: number; // in minutes
    participants: number;
    activityType: 'חזרה' | 'אימון/שיעון' | 'סדנה/ש.פרטי';
    isCommercial: boolean;
    price: number;
  }) => void;
}

export default function BookingDetails({ studioId, date, initialTime, onConfirm }: BookingDetailsProps) {
  // Parse initial time if provided
  const parseInitialTime = () => {
    if (initialTime) {
      const [hour, minute] = initialTime.split(':');
      return { hour, minute };
    }
    // Otherwise calculate next quarter hour
    const now = new Date();
    const minutes = now.getMinutes();
    const nextQuarter = Math.ceil(minutes / 15) * 15;
    
    if (nextQuarter === 60) {
      return { hour: String(now.getHours() + 1).padStart(2, '0'), minute: '00' };
    }
    
    return { 
      hour: String(now.getHours()).padStart(2, '0'), 
      minute: String(nextQuarter).padStart(2, '0') 
    };
  };

  const parsedTime = parseInitialTime();
  
  const [startHour, setStartHour] = useState(parsedTime.hour);
  const [startMinute, setStartMinute] = useState(parsedTime.minute);
  const [duration, setDuration] = useState(60); // minutes
  const [participants, setParticipants] = useState(1);
  const [activityType, setActivityType] = useState<'חזרה' | 'אימון/שיעון' | 'סדנה/ש.פרטי'>('אימון/שיעון');
  const [isCommercial, setIsCommercial] = useState(false);
  const [price, setPrice] = useState(0);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Generate time options
  const hours = Array.from({ length: 14 }, (_, i) => String(9 + i).padStart(2, '0')); // 09:00 - 22:00
  const minutes = ['00', '15', '30', '45'];
  const durations = Array.from({ length: 24 }, (_, i) => (i + 1) * 15); // 15min to 6 hours

  useEffect(() => {
    checkAvailabilityAndCalculatePrice();
  }, [startHour, startMinute, duration, participants, activityType, isCommercial]);

  const checkAvailabilityAndCalculatePrice = async () => {
    setChecking(true);
    
    try {
      const startTime = `${startHour}:${startMinute}`;
      const hours = duration / 60;
      
      // Check availability
      const availabilityRes = await fetch(
        `/api/bookings/check-availability?studioId=${studioId}&date=${date.toISOString()}&startTime=${startTime}&duration=${duration}`
      );
      
      if (availabilityRes.ok) {
        const availData = await availabilityRes.json();
        setIsAvailable(availData.available);
        
        if (!availData.available) {
          setPrice(0);
          setChecking(false);
          return;
        }
      }
      
      // Calculate price
      const priceRes = await fetch('/api/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studioId,
          participants,
          hours,
          activityType,
          isCommercial,
        }),
      });
      
      if (priceRes.ok) {
        const priceData = await priceRes.json();
        setPrice(priceData.totalPrice);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleConfirm = () => {
    const startTime = `${startHour}:${startMinute}`;
    onConfirm({
      startTime,
      duration,
      participants,
      activityType,
      isCommercial,
      price,
    });
  };

  const endTime = () => {
    const start = parseInt(startHour) * 60 + parseInt(startMinute);
    const end = start + duration;
    const endHour = Math.floor(end / 60);
    const endMin = end % 60;
    return `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
      <h3 className="text-2xl font-bold mb-4">פרטי ההזמנה</h3>

      {/* Date Display */}
      <div className="bg-purple-50 p-4 rounded-lg">
        <p className="text-sm text-purple-700 font-medium">תאריך ושעה נבחרו</p>
        <p className="text-lg font-bold text-purple-900">
          {date.toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
        {initialTime && (
          <p className="text-md text-purple-800 mt-1">
            שעת התחלה: <span className="font-bold">{initialTime}</span>
          </p>
        )}
      </div>

      {/* Time Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          שעת התחלה
        </label>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3 text-xs text-blue-800">
          💡 ניתן לבחור זמן בקפיצות של 15 דקות
        </div>
        <div className="grid grid-cols-2 gap-2">
          <select
            value={startHour}
            onChange={(e) => setStartHour(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 text-lg font-medium"
          >
            {hours.map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
          <select
            value={startMinute}
            onChange={(e) => setStartMinute(e.target.value)}
            className="border border-gray-300 rounded-lg p-3 text-lg font-medium"
          >
            {minutes.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <p className="text-sm text-gray-500 mt-1">שעת סיום משוערת: {endTime()}</p>
      </div>

      {/* Duration */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          משך זמן
        </label>
        <select
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-lg p-3 text-lg font-medium"
        >
          {durations.map((d) => (
            <option key={d} value={d}>
              {d >= 60 
                ? `${Math.floor(d / 60)} שעות${d % 60 > 0 ? ` ו-${d % 60} דקות` : ''}`
                : `${d} דקות`
              }
            </option>
          ))}
        </select>
      </div>

      {/* Participants */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          מספר משתתפים
        </label>
        <select
          value={participants}
          onChange={(e) => setParticipants(parseInt(e.target.value))}
          className="w-full border border-gray-300 rounded-lg p-3 text-lg font-medium"
        >
          <option value={1}>1 אדם</option>
          <option value={3}>2-4 אנשים</option>
          <option value={10}>5-15 אנשים</option>
          <option value={20}>16-25 אנשים</option>
          <option value={26}>26+ אנשים</option>
        </select>
      </div>

      {/* Activity Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          סוג פעילות
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['חזרה', 'אימון/שיעון', 'סדנה/ש.פרטי'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActivityType(type)}
              className={`
                p-3 rounded-lg border-2 font-medium transition text-sm
                ${activityType === type
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-purple-600'
                }
              `}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Commercial */}
      <div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isCommercial}
            onChange={(e) => setIsCommercial(e.target.checked)}
            className="w-5 h-5"
          />
          <span className="text-sm font-medium text-gray-700">
            שימוש מסחרי
          </span>
        </label>
        <p className="text-xs text-gray-500 mt-1 mr-8">
          סמן אם מדובר בפעילות מסחרית
        </p>
      </div>

      {/* Availability Status */}
      {checking && (
        <div className="bg-gray-50 p-4 rounded-lg text-center">
          <p className="text-gray-600">בודק זמינות...</p>
        </div>
      )}

      {!checking && isAvailable === false && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-800 font-medium">❌ לא פנוי בזמן הנבחר</p>
          <p className="text-sm text-red-600 mt-1">נסה שעה אחרת</p>
        </div>
      )}

      {!checking && isAvailable === true && (
        <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
          <p className="text-green-800 font-medium">✓ פנוי!</p>
          <div className="mt-3 pt-3 border-t border-green-200">
            <div className="flex justify-between items-center">
              <p className="text-sm text-green-700">מחיר לשעה:</p>
              <p className="text-lg font-bold text-green-900">
                ₪{Math.round(price / (duration / 60))}
              </p>
            </div>
            <div className="flex justify-between items-center mt-2">
              <p className="text-lg font-medium text-green-800">סה"כ לתשלום:</p>
              <p className="text-3xl font-bold text-green-900">
                ₪{price}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Terms and Conditions */}
      <div className="border-t pt-6">
        <div className="flex items-start gap-3 mb-4">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
          />
          <label htmlFor="acceptTerms" className="text-sm text-gray-700">
            קראתי ואני מסכים/ה ל
            <button
              type="button"
              onClick={() => setShowTermsModal(true)}
              className="text-purple-600 hover:text-purple-700 font-medium underline mx-1"
            >
              תקנון השכרת החללים
            </button>
            *
          </label>
        </div>
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        disabled={!isAvailable || checking || !acceptedTerms}
        className={`
          w-full py-4 rounded-lg font-bold text-lg transition
          ${isAvailable && !checking && acceptedTerms
            ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-xl'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        {!acceptedTerms 
          ? 'יש לאשר את התקנון כדי להמשיך'
          : checking 
          ? 'בודק...' 
          : isAvailable 
          ? 'אישור והמשך לתשלום' 
          : 'לא זמין'}
      </button>

      {/* Terms Modal */}
      <TermsModal isOpen={showTermsModal} onClose={() => setShowTermsModal(false)} />
    </div>
  );
}
