'use client';

import { useState, useEffect } from 'react';

export default function AllBlocksList() {
  const [oneTimeBlocks, setOneTimeBlocks] = useState<any[]>([]);
  const [recurringBlocks, setRecurringBlocks] = useState<any[]>([]);
  const [studios, setStudios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, onetime, recurring

  const daysOfWeek = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studiosRes, recurringRes, bookingsRes] = await Promise.all([
        fetch('/api/studios'),
        fetch('/api/admin/recurring-blocks'),
        fetch('/api/admin/bookings'),
      ]);

      const studiosData = await studiosRes.json();
      const recurringData = await recurringRes.json();
      const bookingsData = await bookingsRes.json();

      if (studiosData.success) {
        setStudios(studiosData.data);
      }

      if (recurringData.success) {
        setRecurringBlocks(recurringData.data);
      }

      if (bookingsData.success) {
        // Filter only blocked bookings (price = 0 and confirmed)
        const blocked = bookingsData.data.filter(
          (b: any) => b.totalPrice === 0 && b.status === 'confirmed'
        );
        setOneTimeBlocks(blocked);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteOneTimeBlock = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק חסימה זו?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });

      if (response.ok) {
        alert('חסימה נמחקה בהצלחה');
        fetchData();
      } else {
        alert('שגיאה במחיקת חסימה');
      }
    } catch (error) {
      alert('שגיאה במחיקת חסימה');
    }
  };

  const deleteRecurringBlock = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק חסימה חוזרת זו?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/recurring-blocks?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('חסימה חוזרת נמחקה בהצלחה');
        fetchData();
      } else {
        alert('שגיאה במחיקת חסימה');
      }
    } catch (error) {
      alert('שגיאה במחיקת חסימה');
    }
  };

  const getStudioName = (studioId: any) => {
    const studio = studios.find(s => s._id === studioId || s._id === studioId?._id);
    return studio?.name || 'לא ידוע';
  };

  const filteredOneTime = filter === 'recurring' ? [] : oneTimeBlocks;
  const filteredRecurring = filter === 'onetime' ? [] : recurringBlocks;

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">טוען חסימות...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            הכל ({oneTimeBlocks.length + recurringBlocks.length})
          </button>
          <button
            onClick={() => setFilter('onetime')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'onetime'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            חד-פעמי ({oneTimeBlocks.length})
          </button>
          <button
            onClick={() => setFilter('recurring')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filter === 'recurring'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            חוזר ({recurringBlocks.length})
          </button>
        </div>
      </div>

      {/* Recurring Blocks */}
      {filteredRecurring.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">חסימות חוזרות ({filteredRecurring.length})</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    חלל
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    יום
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    שעות
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    עד תאריך
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    סיבה
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRecurring.map((block: any) => (
                  <tr key={block._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getStudioName(block.studioId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      יום {daysOfWeek[block.dayOfWeek]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {block.startTime} - {block.endTime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {block.endDate ? (
                        <span className="text-orange-600">
                          {new Date(block.endDate).toLocaleDateString('he-IL')}
                        </span>
                      ) : (
                        <span className="text-green-600">∞ (ללא סיום)</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {block.reason || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => deleteRecurringBlock(block._id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        מחק
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* One-time Blocks */}
      {filteredOneTime.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">חסימות חד-פעמיות ({filteredOneTime.length})</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    חלל
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    תאריך
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    שעות
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    סיבה
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    פעולות
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOneTime.map((block: any) => (
                  <tr key={block._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getStudioName(block.studioId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(block.startTime).toLocaleDateString('he-IL')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(block.startTime).toLocaleTimeString('he-IL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}{' '}
                      -{' '}
                      {new Date(block.endTime).toLocaleTimeString('he-IL', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {block.notes || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => deleteOneTimeBlock(block._id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        מחק
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredOneTime.length === 0 && filteredRecurring.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">אין חסימות</h3>
          <p className="mt-1 text-sm text-gray-500">
            עדיין לא נוצרו חסימות. צור חסימה חדשה בעמוד ניהול זמינות.
          </p>
        </div>
      )}
    </div>
  );
}
