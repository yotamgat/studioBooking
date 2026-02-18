'use client';

import { useState, useEffect } from 'react';

export default function RecurringBlocksList() {
  const [studios, setStudios] = useState<any[]>([]);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studioId: '',
    dayOfWeek: '0',
    startTime: '09:00',
    endTime: '10:00',
    endDate: '',
    reason: '',
  });

  const daysOfWeek = [
    { value: 0, label: 'יום ראשון' },
    { value: 1, label: 'יום שני' },
    { value: 2, label: 'יום שלישי' },
    { value: 3, label: 'יום רביעי' },
    { value: 4, label: 'יום חמישי' },
    { value: 5, label: 'יום שישי' },
    { value: 6, label: 'יום שבת' },
  ];

  useEffect(() => {
    fetchStudios();
    fetchBlocks();
  }, []);

  const fetchStudios = async () => {
    try {
      const response = await fetch('/api/studios');
      const data = await response.json();
      if (data.success) {
        setStudios(data.data);
        if (data.data.length > 0) {
          setFormData(prev => ({ ...prev, studioId: data.data[0]._id }));
        }
      }
    } catch (error) {
      console.error('Error fetching studios:', error);
    }
  };

  const fetchBlocks = async () => {
    try {
      const response = await fetch('/api/admin/recurring-blocks');
      const data = await response.json();
      if (data.success) {
        setBlocks(data.data);
      }
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/recurring-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studioId: formData.studioId,
          dayOfWeek: parseInt(formData.dayOfWeek),
          startTime: formData.startTime,
          endTime: formData.endTime,
          endDate: formData.endDate || undefined,
          reason: formData.reason,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('חסימה חוזרת נוצרה בהצלחה!');
        setFormData({
          ...formData,
          reason: '',
        });
        fetchBlocks();
      } else {
        alert(data.error || 'שגיאה ביצירת חסימה');
      }
    } catch (error) {
      alert('שגיאה ביצירת חסימה');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק חסימה זו?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/recurring-blocks?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('חסימה נמחקה בהצלחה');
        fetchBlocks();
      } else {
        alert('שגיאה במחיקת חסימה');
      }
    } catch (error) {
      alert('שגיאה במחיקת חסימה');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            חלל *
          </label>
          <select
            name="studioId"
            value={formData.studioId}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-3"
          >
            {studios.map((studio) => (
              <option key={studio._id} value={studio._id}>
                {studio.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            יום בשבוע *
          </label>
          <select
            name="dayOfWeek"
            value={formData.dayOfWeek}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-3"
          >
            {daysOfWeek.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              שעת התחלה *
            </label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              שעת סיום *
            </label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg p-3"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            סיבה
          </label>
          <input
            type="text"
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="למשל: שיעור קבוע, תחזוקה שבועית"
            className="w-full border border-gray-300 rounded-lg p-3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            חסום עד תאריך (אופציונלי)
          </label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            min={new Date().toISOString().split('T')[0]}
            className="w-full border border-gray-300 rounded-lg p-3"
          />
          <p className="text-xs text-gray-500 mt-1">
            אם לא תבחר תאריך, החסימה תהיה עד אין סוף
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition disabled:bg-gray-400"
        >
          {loading ? 'יוצר...' : 'צור חסימה חוזרת'}
        </button>
      </form>

      {/* List of existing blocks */}
      <div className="border-t pt-6">
        <h3 className="font-bold mb-4">חסימות קיימות</h3>
        {blocks.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">אין חסימות חוזרות</p>
        ) : (
          <div className="space-y-3">
            {blocks.map((block: any) => {
              const dayName = daysOfWeek.find(d => d.value === block.dayOfWeek)?.label || '';
              const studioName = studios.find(s => s._id === block.studioId)?.name || block.studioId?.name || 'לא ידוע';
              
              return (
                <div
                  key={block._id}
                  className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex justify-between items-start"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{studioName}</div>
                    <div className="text-sm text-gray-600">
                      {dayName} • {block.startTime} - {block.endTime}
                    </div>
                    {block.endDate && (
                      <div className="text-xs text-orange-600 mt-1">
                        עד {new Date(block.endDate).toLocaleDateString('he-IL')}
                      </div>
                    )}
                    {block.reason && (
                      <div className="text-xs text-gray-500 mt-1">{block.reason}</div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(block._id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    מחק
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
