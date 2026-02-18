'use client';

import { useState, useEffect, useCallback } from 'react';

interface Studio {
  _id: string;
  name: string;
}

interface BookingUser {
  name: string;
  email: string;
  phone?: string;
}

interface Booking {
  _id: string;
  studioId: string;
  startTime: string;
  endTime: string;
  totalHours: number;
  totalPrice: number;
  participants: number;
  activityType: string;
  isCommercial: boolean;
  status: string;
  paymentStatus: string;
  user: BookingUser | null;
}

const HOUR_START = 8;
const HOUR_END = 23;
const TOTAL_HOURS = HOUR_END - HOUR_START;

function timeToPercent(dateStr: string, dayStart: Date, dayEnd: Date): number {
  const date = new Date(dateStr);
  const total = dayEnd.getTime() - dayStart.getTime();
  const offset = date.getTime() - dayStart.getTime();
  return Math.max(0, Math.min(100, (offset / total) * 100));
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

interface BookingModalProps {
  booking: Booking;
  onClose: () => void;
  onCancel: (id: string) => void;
}

function BookingModal({ booking, onClose, onCancel }: BookingModalProps) {
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!confirm('האם אתה בטוח שברצונך לבטל את ההזמנה?')) return;
    setCancelling(true);
    await onCancel(booking._id);
    setCancelling(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
        onClick={e => e.stopPropagation()}
        dir="rtl"
      >
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-900">פרטי הזמנה</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        {/* Status badges */}
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {booking.status === 'confirmed' ? 'מאושר' :
             booking.status === 'pending' ? 'ממתין' :
             booking.status === 'cancelled' ? 'בוטל' : booking.status}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            booking.paymentStatus === 'paid' ? 'bg-blue-100 text-blue-700' :
            booking.paymentStatus === 'pending' ? 'bg-orange-100 text-orange-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {booking.paymentStatus === 'paid' ? 'שולם' :
             booking.paymentStatus === 'pending' ? 'לא שולם' : booking.paymentStatus}
          </span>
        </div>

        {/* Customer info */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <h4 className="font-semibold text-gray-700 text-sm">פרטי לקוח</h4>
          {booking.user ? (
            <>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">שם:</span>
                <span className="font-medium">{booking.user.name}</span>
              </div>
              {booking.user.phone && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-sm">טלפון:</span>
                  <a href={`tel:${booking.user.phone}`} className="font-medium text-purple-600 hover:underline">
                    {booking.user.phone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">אימייל:</span>
                <span className="font-medium text-sm">{booking.user.email}</span>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-sm">אין פרטי משתמש</p>
          )}
        </div>

        {/* Booking details */}
        <div className="bg-gray-50 rounded-xl p-4 space-y-2">
          <h4 className="font-semibold text-gray-700 text-sm">פרטי ההזמנה</h4>
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">שעות:</span>
            <span className="font-medium">{formatTime(booking.startTime)} - {formatTime(booking.endTime)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">משך:</span>
            <span className="font-medium">{booking.totalHours} שעות</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">משתתפים:</span>
            <span className="font-medium">
              {booking.participants === 1 ? '1 אדם' :
               booking.participants === 3 ? '2-4 אנשים' :
               booking.participants === 10 ? '5-15 אנשים' :
               booking.participants === 20 ? '16-25 אנשים' : '26+ אנשים'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">סוג פעילות:</span>
            <span className="font-medium">{booking.activityType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">שימוש:</span>
            <span className="font-medium">{booking.isCommercial ? 'מסחרי' : 'לא מסחרי'}</span>
          </div>
          <div className="flex justify-between border-t pt-2 mt-2">
            <span className="font-bold text-gray-700">סה"כ תשלום:</span>
            <span className="font-bold text-purple-600 text-lg">₪{booking.totalPrice}</span>
          </div>
        </div>

        {/* Actions */}
        {booking.status !== 'cancelled' && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
          >
            {cancelling ? 'מבטל...' : '🗑 בטל הזמנה'}
          </button>
        )}
      </div>
    </div>
  );
}

interface StudioCalendarProps {
  studio: Studio;
  bookings: Booking[];
  dayStart: Date;
  dayEnd: Date;
  onBookingClick: (booking: Booking) => void;
}

function StudioCalendar({ studio, bookings, dayStart, dayEnd, onBookingClick }: StudioCalendarProps) {
  const hours = Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => HOUR_START + i);
  const studioBookings = bookings.filter(b => b.studioId === studio._id);

  return (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden">
      {/* Studio header */}
      <div className="bg-gradient-to-l from-purple-600 to-purple-800 text-white px-6 py-4">
        <h3 className="text-lg font-bold">{studio.name}</h3>
        <p className="text-purple-200 text-sm mt-1">
          {studioBookings.length === 0 ? 'פנוי לחלוטין' : `${studioBookings.length} הזמנות`}
        </p>
      </div>

      {/* Timeline */}
      <div className="p-4">
        <div className="relative" style={{ height: `${TOTAL_HOURS * 48}px` }}>

          {/* Hour grid lines */}
          {hours.map((hour) => {
            const pct = ((hour - HOUR_START) / TOTAL_HOURS) * 100;
            return (
              <div
                key={hour}
                className="absolute w-full border-t border-gray-100 flex items-start"
                style={{ top: `${pct}%` }}
              >
                <span className="text-xs text-gray-400 pr-1 -mt-2 w-10 text-left shrink-0">
                  {String(hour).padStart(2, '0')}:00
                </span>
                <div className="flex-1 border-t border-gray-100" />
              </div>
            );
          })}

          {/* Free/busy background blocks */}
          <div className="absolute right-12 left-0 top-0 bottom-0">
            {/* Full green background = all free */}
            <div className="absolute inset-0 bg-green-50 rounded-lg" />

            {/* Red blocks for booked times */}
            {studioBookings.map(booking => {
              const top = timeToPercent(booking.startTime, dayStart, dayEnd);
              const bottom = timeToPercent(booking.endTime, dayStart, dayEnd);
              const height = bottom - top;

              return (
                <button
                  key={booking._id}
                  onClick={() => onBookingClick(booking)}
                  className="absolute left-1 right-1 rounded-lg flex flex-col justify-center px-2 text-right transition hover:brightness-95 hover:scale-[1.01] active:scale-100 shadow-sm overflow-hidden"
                  style={{
                    top: `${top}%`,
                    height: `${height}%`,
                    background: booking.paymentStatus === 'paid'
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                      : 'linear-gradient(135deg, #f97316, #ea580c)',
                    minHeight: '28px',
                  }}
                  title={`${booking.user?.name || 'לקוח'} - ${formatTime(booking.startTime)}-${formatTime(booking.endTime)}`}
                >
                  <p className="text-white font-semibold text-xs truncate leading-tight">
                    {booking.user?.name || 'לקוח'}
                  </p>
                  <p className="text-white/80 text-xs truncate leading-tight">
                    {formatTime(booking.startTime)}-{formatTime(booking.endTime)}
                  </p>
                  <p className="text-white/70 text-xs leading-tight">₪{booking.totalPrice}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-3 text-xs text-gray-500 justify-end">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-green-200 inline-block" /> פנוי
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-400 inline-block" /> שולם
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-orange-400 inline-block" /> ממתין לתשלום
          </span>
        </div>
      </div>
    </div>
  );
}

export default function AdminCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [studios, setStudios] = useState<Studio[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const dayStart = new Date(selectedDate);
  dayStart.setHours(HOUR_START, 0, 0, 0);
  const dayEnd = new Date(selectedDate);
  dayEnd.setHours(HOUR_END, 0, 0, 0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/calendar?date=${selectedDate.toISOString()}`);
      const data = await res.json();
      if (data.success) {
        setStudios(data.studios);
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error('Failed to fetch calendar data', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCancelBooking = async (id: string) => {
    const res = await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) {
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
    }
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Date Navigator */}
      <div className="bg-white rounded-2xl shadow-md p-4 flex items-center justify-between">
        <button
          onClick={() => changeDate(-1)}
          className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="text-center flex items-center gap-3">
          <input
            type="date"
            value={selectedDate.toISOString().split('T')[0]}
            onChange={e => setSelectedDate(new Date(e.target.value))}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <div>
            <p className="font-bold text-gray-900">{formatDate(selectedDate)}</p>
            <p className="text-xs text-gray-500">
              {bookings.filter(b => b.status !== 'cancelled').length} הזמנות ביום זה
            </p>
          </div>
          <button
            onClick={() => setSelectedDate(new Date())}
            className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-lg hover:bg-purple-200 transition"
          >
            היום
          </button>
        </div>

        <button
          onClick={() => changeDate(1)}
          className="p-2 rounded-xl hover:bg-gray-100 transition text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Calendars */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {studios.map(studio => (
            <StudioCalendar
              key={studio._id}
              studio={studio}
              bookings={bookings.filter(b => b.status !== 'cancelled')}
              dayStart={dayStart}
              dayEnd={dayEnd}
              onBookingClick={setSelectedBooking}
            />
          ))}
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <BookingModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onCancel={handleCancelBooking}
        />
      )}
    </div>
  );
}
