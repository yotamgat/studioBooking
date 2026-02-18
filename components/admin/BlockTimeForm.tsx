'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BlockTimeForm() {
  const router = useRouter();
  const [studios, setStudios] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studioId: '',
    date: '',
    startTime: '09:00',
    endTime: '10:00',
    reason: '',
  });

  useEffect(() => {
    fetchStudios();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create a "blocked" booking
      const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
      const endDateTime = new Date(`${formData.date}T${formData.endTime}`);

      const response = await fetch('/api/admin/block-time', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studioId: formData.studioId,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          reason: formData.reason,
        }),
      });

      if (response.ok) {
        alert('השעות נחסמו בהצלחה');
        setFormData({
          ...formData,
          date: '',
          reason: '',
        });
        router.refresh();
      } else {
        const data = await response.json();
        alert(data.error || 'שגיאה בחסימת שעות');
      }
    } catch (error) {
      alert('שגיאה בחסימת שעות');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
          תאריך *
        </label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          min={new Date().toISOString().split('T')[0]}
          className="w-full border border-gray-300 rounded-lg p-3"
        />
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
        <textarea
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          placeholder="למשל: תחזוקה, אירוע פרטי, וכו'"
          rows={3}
          className="w-full border border-gray-300 rounded-lg p-3"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition disabled:bg-gray-400"
      >
        {loading ? 'חוסם...' : 'חסום שעות'}
      </button>
    </form>
  );
}
