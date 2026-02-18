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
  const [selectedTime, setSelectedTime] = useState<string>(''); // Store selected time
  const [selectedStudio, setSelectedStudio] = useState('');
  const [bookingDetails, setBookingDetails] = useState<any>(null); // Store full booking details
  const [step, setStep] = useState(1); // 1: Studio, 2: Date+Time, 3: Details, 4: Confirm

  // Redirect to login if not authenticated
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

  const handleBookingConfirm = async (details: any) => {
    console.log('פרטי הזמנה:', details);
    
    if (!session?.user?.id) {
      alert('אנא התחבר למערכת');
      router.push('/auth/signin');
      return;
    }
    
    try {
      // Calculate end time
      const [hours, minutes] = details.startTime.split(':').map(Number);
      const startDateTime = new Date(selectedDate!);
      startDateTime.setHours(hours, minutes, 0, 0);
      
      const endDateTime = new Date(startDateTime);
      endDateTime.setMinutes(endDateTime.getMinutes() + details.duration);

      // Create booking with real user ID
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studioId: selectedStudio,
          userId: session.user.id, // Real user ID from session
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          totalHours: details.duration / 60,
          pricePerHour: details.price / (details.duration / 60),
          totalPrice: details.price,
          participants: details.participants,
          activityType: details.activityType,
          isCommercial: details.isCommercial,
          status: 'pending',
          paymentStatus: 'pending',
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Save full booking details for confirmation page
        setBookingDetails({
          ...details,
          startDateTime,
          endDateTime,
        });
        setStep(4);
      } else {
        alert('שגיאה ביצירת הזמנה: ' + data.error);
      }
    } catch (error) {
      console.error('שגיאה:', error);
      alert('שגיאה ביצירת הזמנה');
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
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

  if (!session) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-purple-600 text-white p-6 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">הזמנת חלל ריקוד</h1>
            <p className="text-purple-100 mt-1">תהליך הזמנה פשוט ומהיר</p>
          </div>
          <UserHeader />
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {['בחר חלל', 'בחר תאריך', 'פרטי הזמנה', 'אישור'].map((label, index) => {
              const stepNum = index + 1;
              const isActive = step >= stepNum;
              const isCurrent = step === stepNum;

              return (
                <div key={index} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`
                        w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg
                        transition-all duration-300
                        ${
                          isActive
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }
                        ${isCurrent ? 'ring-4 ring-purple-200 scale-110' : ''}
                      `}
                    >
                      {stepNum}
                    </div>
                    <span className="text-xs mt-2 text-center font-medium">{label}</span>
                  </div>
                  {index < 3 && (
                    <div
                      className={`
                        w-16 h-1 mx-2 transition-all duration-300
                        ${isActive ? 'bg-purple-600' : 'bg-gray-200'}
                      `}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto p-6 max-w-6xl">
        {/* Step 1: Select Studio */}
        {step === 1 && (
          <StudioSelector studios={studios} onSelect={handleStudioSelect} />
        )}

        {/* Step 2: Select Date and Time */}
        {step === 2 && selectedStudio && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">בחר תאריך ושעה</h2>
                <p className="text-sm text-gray-600 mt-1">לחץ על יום כדי לראות שעות פנויות, ואז בחר שעה</p>
              </div>
              <button
                onClick={handleBack}
                className="text-purple-600 hover:text-purple-700 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                חזור
              </button>
            </div>
            <ImprovedCalendar
              studioId={selectedStudio}
              onTimeSelect={handleTimeSelect}
              selectedDate={selectedDate}
            />
          </div>
        )}

        {/* Step 3: Booking Details */}
        {step === 3 && selectedDate && selectedTime && selectedStudio && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">פרטי ההזמנה</h2>
                <p className="text-gray-600 mt-1">{selectedStudioData?.name}</p>
              </div>
              <button
                onClick={handleBack}
                className="text-purple-600 hover:text-purple-700 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                חזור
              </button>
            </div>
            <div className="max-w-2xl mx-auto">
              <BookingDetails
                studioId={selectedStudio}
                date={selectedDate}
                initialTime={selectedTime}
                onConfirm={handleBookingConfirm}
              />
            </div>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && bookingDetails && (
          <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">ההזמנה נשמרה בהצלחה!</h2>
              <p className="text-gray-600">כעת יש להשלים את התשלום כדי לאשר את ההזמנה</p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-right space-y-4">
              <h3 className="font-bold text-lg mb-4 border-b pb-2">סיכום הזמנה</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">חלל:</span>
                  <span className="font-medium text-right">{selectedStudioData?.name}</span>
                </div>
                
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">תאריך:</span>
                  <span className="font-medium">
                    {selectedDate?.toLocaleDateString('he-IL', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-gray-600">שעות:</span>
                  <div className="text-right">
                    <div className="font-medium">
                      {bookingDetails.startTime} - {bookingDetails.endDateTime.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-sm text-gray-500">
                      ({bookingDetails.duration} דקות)
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-gray-600">מספר משתתפים:</span>
                  <span className="font-medium">
                    {bookingDetails.participants === 1 ? '1 אדם' : 
                     bookingDetails.participants === 3 ? '2-4 אנשים' :
                     bookingDetails.participants === 10 ? '5-15 אנשים' :
                     bookingDetails.participants === 20 ? '16-25 אנשים' :
                     '26+ אנשים'}
                  </span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-gray-600">סוג פעילות:</span>
                  <span className="font-medium">{bookingDetails.activityType}</span>
                </div>

                <div className="flex justify-between items-start">
                  <span className="text-gray-600">סוג שימוש:</span>
                  <span className="font-medium">
                    {bookingDetails.isCommercial ? 'מסחרי' : 'לא מסחרי'}
                  </span>
                </div>

                <div className="border-t pt-3 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">סה"כ לתשלום:</span>
                    <span className="text-2xl font-bold text-purple-600">
                      ₪{bookingDetails.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  // TODO: מעבר לסליקה - כאן נוסיף את הקישור לטרנזילה/סליקה
                  alert('כאן יתווסף קישור לסליקה');
                }}
                className="w-full bg-green-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-green-700 transition shadow-lg"
              >
                💳 מעבר לתשלום
              </button>
              
              <button
                onClick={() => window.location.href = '/booking'}
                className="w-full bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                הזמנה נוספת
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">
              ההזמנה תישמר למשך 15 דקות. יש להשלים את התשלום כדי לאשר.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
