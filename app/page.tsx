import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-purple-900 mb-4">
            השכרת חללי ריקוד
          </h1>
          <p className="text-xl text-gray-600">
            הזמן את האולם שלך בקלות ובמהירות
          </p>
        </header>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold mb-2">הזמנה מהירה</h3>
            <p className="text-gray-600">
              צפה בזמינות בזמן אמת והזמן בקליק
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-semibold mb-2">תשלום מאובטח</h3>
            <p className="text-gray-600">
              תשלום בכרטיס אשראי באופן בטוח ומהיר
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-4xl mb-4">⭐</div>
            <h3 className="text-xl font-semibold mb-2">חללים מקצועיים</h3>
            <p className="text-gray-600">
              אולמות מאובזרים עם ריצוף מקצועי
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link 
            href="/booking"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg hover:shadow-xl"
          >
            הזמנת חלל לריקוד
          </Link>
        </div>

        {/* Info Section */}
        <div className="mt-16 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-purple-900 mb-6 text-center">
            איך זה עובד?
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">1</span>
              </div>
              <h4 className="font-semibold mb-2">הירשם</h4>
              <p className="text-gray-600 text-sm">צור חשבון בחינם</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h4 className="font-semibold mb-2">בחר תאריך</h4>
              <p className="text-gray-600 text-sm">צפה בזמינות</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h4 className="font-semibold mb-2">שלם</h4>
              <p className="text-gray-600 text-sm">תשלום מאובטח</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">4</span>
              </div>
              <h4 className="font-semibold mb-2">תרקוד!</h4>
              <p className="text-gray-600 text-sm">תהנה מהאולם</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
