'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ImprovedCalendar from '@/components/booking/ImprovedCalendar';
import StudioSelector from '@/components/booking/StudioSelector';
import BookingDetails from '@/components/booking/BookingDetails';
import UserHeader from '@/components/UserHeader';

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

export default function BookingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [studios, setStudios] = useState<Studio[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedStudio, setSelectedStudio] = useState('');
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/booking');
    }
  }, [status, router]);

  useEffect(() => {
    fetchStudios();
  }, []);

  const fetchStudios = async () => {
    try {
      const response = await fetch('/api/studios');
      const data = await response.json();
      if (data.success) {
        setStudios(data.data.map((s: any) => ({ ...s, id: s._id })));
      }
    } catch (error) {
      console.error('שגיאה בטעינת חללים:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStudioSelect = (studioId: string) => {
    setSelectedStudio(studioId);
    setStep(2);
  };

  const handleTimeSelect = (date: Date, time: string) => {
    setSelectedDate(date);
    setSelectedTime(time);
    setStep(3);
  };

  const handleBookingConfirm = (details: any) => {
    const [hours, minutes] = details.startTime.split(':').map(Number);
    const startDateTime = new Date(selectedDate!);
    startDateTime.setHours(hours, minutes, 0, 0);

    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + details.duration);

    setBookingDetails({
      ...details,
      startDateTime,
      endDateTime,
    });
    setStep(4);
  };

  // Step 4: send details to payment/create — no DB write until payment succeeds
  const handlePayment = async () => {
    if (!session?.user?.id) {
      alert('אנא התחבר למערכת');
      router.push('/auth/signin');
      return;
    }

    setPaymentLoading(true);
    try {
      const paymentRes = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studioId: selectedStudio,
          startTime: bookingDetails.startDateTime.toISOString(),
          endTime: bookingDetails.endDateTime.toISOString(),
          totalHours: bookingDetails.duration / 60,
          pricePerHour: bookingDetails.price / (bookingDetails.duration / 60),
          totalPrice: bookingDetails.price,
          participants: bookingDetails.participants,
          activityType: bookingDetails.activityType,
          isCommercial: bookingDetails.isCommercial,
        }),
      });

      const paymentData = await paymentRes.json();
      if (paymentData.paymentUrl) {
        window.location.href = paymentData.paymentUrl;
      } else {
        alert('שגיאה ביצירת דף תשלום: ' + (paymentData.error || 'נסה שוב'));
        setPaymentLoading(false);
      }
    } catch (error) {
      console.error('שגיאה:', error);
      alert('שגיאה בחיבור לשירות התשלומים');
      setPaymentLoading(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const selectedStudioData = studios.find(s => s.id === selectedStudio);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-purple-600 text-white p-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">הזמנת חלל ריקוד</h1>
            <p className="text-purple-100 mt-1">תהליך הזמנה פשוט ומהיר</p>
          </div>
          <UserHeader />
        </div>
      </header>

      <div className="bg-white border-b">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {['בחר חלל', 'בחר תאריך', 'פרטי הזמנה', 'תשלום'].map((label, index) => {
              const stepNum = index + 1;
              const isActive = step >= stepNum;
              const isCurrent = step === stepNum;
              return (
                <div key={index} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${isActive ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-500'} ${isCurrent ? 'ring-4 ring-purple-200 scale-110' : ''}`}>
                      {stepNum}
                    </div>
                    <span className="text-xs mt-2 text-center font-medium">{label}</span>
                  </div>
                  {index < 3 && (
                    <div className={`w-16 h-1 mx-2 transition-all duration-300 ${isActive ? 'bg-purple-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <main className="container mx-auto p-6 max-w-6xl">
        {step === 1 && (
          <StudioSelector studios={studios} onSelect={handleStudioSelect} />
        )}

        {step === 2 && selectedStudio && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">בחר תאריך ושעה</h2>
                <p className="text-sm text-gray-600 mt-1">לחץ על יום כדי לראות שעות פנויות, ואז בחר שעה</p>
              </div>
              <button onClick={handleBack} className="text-purple-600 hover:text-purple-700 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                חזור
              </button>
            </div>
            <ImprovedCalendar studioId={selectedStudio} onTimeSelect={handleTimeSelect} selectedDate={selectedDate} />
          </div>
        )}

        {step === 3 && selectedDate && selectedTime && selectedStudio && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">פרטי ההזמנה</h2>
                <p className="text-gray-600 mt-1">{selectedStudioData?.name}</p>
              </div>
              <button onClick={handleBack} className="text-purple-600 hover:text-purple-700 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                חזור
              </button>
            </div>
            <div className="max-w-2xl mx-auto">
              <BookingDetails studioId={selectedStudio} date={selectedDate} initialTime={selectedTime} onConfirm={handleBookingConfirm} />
            </div>
          </div>
        )}

        {step === 4 && bookingDetails && (
          <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">סיכום ההזמנה</h2>
              <p className="text-gray-600">בדוק את הפרטים ולחץ על תשלום כדי לאשר</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-right space-y-3">
              <h3 className="font-bold text-lg mb-4 border-b pb-2">פרטי ההזמנה</h3>
              <div className="flex justify-between items-start">
                <span className="text-gray-600">חלל:</span>
                <span className="font-medium text-right">{selectedStudioData?.name}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-600">תאריך:</span>
                <span className="font-medium">{selectedDate?.toLocaleDateString('he-IL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-600">שעות:</span>
                <div className="text-right">
                  <div className="font-medium">{bookingDetails.startTime} - {bookingDetails.endDateTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="text-sm text-gray-500">({bookingDetails.duration} דקות)</div>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-600">משתתפים:</span>
                <span className="font-medium">
                  {bookingDetails.participants === 1 ? '1 אדם' :
                   bookingDetails.participants === 3 ? '2-4 אנשים' :
                   bookingDetails.participants === 10 ? '5-15 אנשים' :
                   bookingDetails.participants === 20 ? '16-25 אנשים' : '26+ אנשים'}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-600">סוג פעילות:</span>
                <span className="font-medium">{bookingDetails.activityType}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-600">סוג שימוש:</span>
                <span className="font-medium">{bookingDetails.isCommercial ? 'מסחרי' : 'לא מסחרי'}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">סה"כ לתשלום:</span>
                  <span className="text-2xl font-bold text-purple-600">₪{bookingDetails.price}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePayment}
                disabled={paymentLoading}
                className="w-full bg-purple-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-purple-700 transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {paymentLoading ? '⏳ מתחבר לדף תשלום...' : '💳 מעבר לתשלום'}
              </button>
              <button
                onClick={handleBack}
                disabled={paymentLoading}
                className="w-full bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                חזור לעריכת פרטים
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
