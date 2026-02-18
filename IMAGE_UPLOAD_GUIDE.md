# 📸 מדריך להעלאת והצגת תמונות

## אפשרויות להעלאת תמונות

### אפשרות 1: שימוש ב-Cloudinary (מומלץ)

**יתרונות:**
- חינמי עד 25GB
- CDN מהיר
- אופטימיזציה אוטומטית
- Resize אוטומטי

**הגדרה:**

1. **צור חשבון ב-Cloudinary**
   - https://cloudinary.com/users/register/free
   - קבל את ה-cloud name, API key, API secret

2. **התקן את החבילה**
```bash
npm install cloudinary next-cloudinary
```

3. **הוסף ל-.env.local**
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. **צור API route להעלאה**

קובץ: `app/api/upload/route.ts`

```typescript
import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'studio-booking' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({ url: (result as any).secure_url });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
```

5. **קומפוננטת העלאה**

קובץ: `components/admin/ImageUploader.tsx`

```typescript
'use client';

import { useState } from 'react';

export default function ImageUploader({ onUpload }: { onUpload: (url: string) => void }) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      onUpload(data.url);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
      />
      {uploading && <p className="text-sm text-gray-600 mt-2">מעלה...</p>}
    </div>
  );
}
```

---

### אפשרות 2: שימוש ב-Vercel Blob Storage

**יתרונות:**
- משולב עם Vercel
- פשוט מאוד
- חינמי עד 1GB

**הגדרה:**

1. **התקן**
```bash
npm install @vercel/blob
```

2. **הוסף ל-.env.local**
```env
BLOB_READ_WRITE_TOKEN=your_token_from_vercel
```

3. **API Route**
```typescript
import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  const blob = await put(filename!, request.body!, {
    access: 'public',
  });

  return NextResponse.json(blob);
}
```

---

### אפשרות 3: שימוש ב-URLs חיצוניים (זמני)

**לפיתוח ובדיקות:**
- השתמש ב-Unsplash URLs (כמו בקוד הנוכחי)
- https://unsplash.com/
- חינמי לגמרי אבל לא לשימוש קבוע

**דוגמאות:**
```javascript
images: [
  'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800',
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800',
]
```

---

## איך להוסיף תמונות דרך Admin Panel (עתידי)

### צור עמוד Admin לניהול סטודיו

קובץ: `app/admin/studios/[id]/edit/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import ImageUploader from '@/components/admin/ImageUploader';

export default function EditStudioPage({ params }: { params: { id: string } }) {
  const [images, setImages] = useState<string[]>([]);

  const handleImageUpload = (url: string) => {
    setImages([...images, url]);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    await fetch(`/api/studios/${params.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images }),
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">עריכת תמונות</h1>
      
      {/* Gallery */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {images.map((url, index) => (
          <div key={index} className="relative">
            <img src={url} alt="" className="w-full h-48 object-cover rounded" />
            <button
              onClick={() => handleRemoveImage(index)}
              className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Upload */}
      <ImageUploader onUpload={handleImageUpload} />
      
      <button
        onClick={handleSave}
        className="mt-6 bg-purple-600 text-white px-6 py-2 rounded"
      >
        שמור
      </button>
    </div>
  );
}
```

---

## המלצות

1. **לפיתוח:** השתמש ב-Unsplash URLs (כמו שיש עכשיו)
2. **לפרודקשן:** Cloudinary או Vercel Blob
3. **גלריה:** תמיד שמור 3-5 תמונות איכותיות לכל חלל
4. **גודל תמונה:** 800-1200px ברוחב
5. **פורמט:** JPG או WebP (WebP יותר קל)

---

## עדכון מהיר - שינוי תמונות ידנית (זמני)

אם רוצים להחליף תמונות ידנית עכשיו:

1. מצא תמונות ב-Unsplash
2. העתק את ה-URL
3. ערוך את `scripts/seed.js`
4. שנה את המערך `images`
5. הרץ `node scripts/seed.js`

דוגמה:
```javascript
images: [
  'https://images.unsplash.com/photo-YOUR-IMAGE-ID?w=800',
]
```

---

## בעיות נפוצות

**Q: התמונות לא נטענות**
A: בדוק ש-Next.js מאשר את הדומיין:
```javascript
// next.config.js
module.exports = {
  images: {
    domains: ['images.unsplash.com', 'res.cloudinary.com'],
  },
};
```

**Q: התמונות איטיות**
A: השתמש ב-Next.js Image component:
```tsx
import Image from 'next/image';

<Image
  src={url}
  alt="studio"
  width={800}
  height={600}
  className="object-cover"
/>
```
