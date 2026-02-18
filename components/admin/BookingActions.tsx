'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface BookingActionsProps {
  bookingId: string;
  status: string;
  onUpdate?: () => void;
}

export default function BookingActions({ bookingId, status, onUpdate }: BookingActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`האם אתה בטוח שברצונך ${newStatus === 'confirmed' ? 'לאשר' : 'לבטל'} הזמנה זו?`)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        if (onUpdate) {
          onUpdate();
        } else {
          router.refresh();
        }
      } else {
        alert('שגיאה בעדכון ההזמנה');
      }
    } catch (error) {
      alert('שגיאה בעדכון ההזמנה');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'cancelled' || status === 'completed') {
    return (
      <span className="text-gray-400 text-xs">
        {status === 'cancelled' ? 'בוטלה' : 'הושלמה'}
      </span>
    );
  }

  return (
    <div className="flex gap-2">
      {status === 'pending' && (
        <button
          onClick={() => handleStatusChange('confirmed')}
          disabled={loading}
          className="text-green-600 hover:text-green-700 font-medium text-xs disabled:opacity-50"
        >
          אשר
        </button>
      )}
      <button
        onClick={() => handleStatusChange('cancelled')}
        disabled={loading}
        className="text-red-600 hover:text-red-700 font-medium text-xs disabled:opacity-50"
      >
        בטל
      </button>
    </div>
  );
}
