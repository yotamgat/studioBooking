import { requireAdmin } from '@/lib/admin-auth';
import Link from 'next/link';
import AllBlocksList from '@/components/admin/AllBlocksList';

export default async function AllBlocksPage() {
  await requireAdmin();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">כל החסימות</h1>
            <Link
              href="/admin"
              className="text-purple-600 hover:text-purple-700 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              חזור לסקירה
            </Link>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 space-x-reverse">
            <Link
              href="/admin"
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-3 py-4 text-sm font-medium"
            >
              סקירה כללית
            </Link>
            <Link
              href="/admin/bookings"
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-3 py-4 text-sm font-medium"
            >
              הזמנות
            </Link>
            <Link
              href="/admin/availability"
              className="border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 px-3 py-4 text-sm font-medium"
            >
              ניהול זמינות
            </Link>
            <Link
              href="/admin/all-blocks"
              className="border-b-2 border-purple-600 text-purple-600 px-3 py-4 text-sm font-medium"
            >
              כל החסימות
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AllBlocksList />
      </main>
    </div>
  );
}
