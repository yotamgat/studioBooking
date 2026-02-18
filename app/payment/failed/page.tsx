'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

const errorMessages: Record<string, string> = {
  missing_key: 'לא התקבל אישור מחברת הסליקה.',
  verification_failed: 'לא ניתן היה לאמת את התשלום.',
  booking_not_found: 'ההזמנה לא נמצאה במערכת.',
  server_error: 'אירעה שגיאה בשרת.',
  payment_declined: 'הכרטיס סורב על ידי חברת האשראי.',
};

function PaymentFailedContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const reason = searchParams.get('reason') || 'server_error';
  const errorMessage = errorMessages[reason] || 'אירעה שגיאה לא ידועה.';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">התשלום נכשל</h1>
        <p className="text-gray-500 mb-6">{errorMessage}</p>
        <p className="text-sm text-gray-400 mb-6">לא חויבת. ניתן לנסות שוב או לפנות אלינו לעזרה.</p>
        <button
          onClick={() => router.back()}
          className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition mb-3"
        >
          נסה שוב
        </button>
        <button
          onClick={() => router.push('/')}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition"
        >
          חזור לדף הבית
        </button>
      </div>
    </div>
  );
}

export default function PaymentFailedPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" /></div>}>
      <PaymentFailedContent />
    </Suspense>
  );
}
