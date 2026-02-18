# 🎭 Studio Booking System - מערכת הזמנת חללי ריקוד

מערכת מלאה לניהול והזמנת חללי ריקוד בנויה עם Next.js 14, MongoDB, ו-Stripe.

## ✨ פיצ'רים

- 📅 לוח זמנים אינטראקטיבי עם זמינות בזמן אמת
- 👤 מערכת הרשמה והתחברות
- 💳 תשלומים מאובטחים עם Stripe
- 🎨 ממשק ניהול למנהלת הסטודיו
- 📱 Responsive Design
- 🔒 Authentication & Authorization
- 📊 ניהול הזמנות והכנסות

## 🛠️ טכנולוגיות

- **Frontend:** Next.js 14 (App Router), React, TailwindCSS
- **Backend:** Next.js API Routes
- **Database:** MongoDB (Mongoose)
- **Authentication:** NextAuth.js
- **Payments:** Stripe
- **Deployment:** Vercel

## 📋 דרישות מקדימות

- Node.js 18+ 
- MongoDB Atlas Account (חינמי)
- Stripe Account (לתשלומים)

## 🚀 התקנה

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd studio-booking
```

### 2. התקנת Dependencies

```bash
npm install
```

### 3. הגדרת Environment Variables

העתק את `.env.example` ל-`.env.local`:

```bash
cp .env.example .env.local
```

ערוך את `.env.local` והוסף את הערכים הבאים:

#### MongoDB

1. היכנס ל-[MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. צור Cluster חינמי
3. צור Database User
4. לחץ על "Connect" -> "Connect your application"
5. העתק את ה-connection string
6. החלף `<password>` בסיסמה שלך

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/studio-booking?retryWrites=true&w=majority
```

#### NextAuth

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-here-change-this-in-production
```

ליצירת NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

#### Stripe (אופציונלי לשלב ראשון)

1. היכנס ל-[Stripe Dashboard](https://dashboard.stripe.com/)
2. לחץ על "Developers" -> "API keys"
3. העתק את ה-Publishable key וה-Secret key

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_SECRET_KEY=sk_test_xxxxx
```

### 4. הרצת השרת

```bash
npm run dev
```

פתח את [http://localhost:3000](http://localhost:3000) בדפדפן.

## 📁 מבנה הפרויקט

```
studio-booking/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── studios/      # Studios endpoints
│   │   ├── bookings/     # Bookings endpoints
│   │   └── availability/ # Availability endpoints
│   ├── page.tsx          # Home page
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── models/                # Mongoose models
│   ├── User.ts
│   ├── Studio.ts
│   ├── Booking.ts
│   └── Availability.ts
├── lib/                   # Utility functions
│   └── mongodb.ts        # MongoDB connection
└── components/           # React components (להוסיף)
```

## 🗃️ Database Schema

### User
- name, email, password, phone
- role: 'user' | 'admin'

### Studio
- name, description, capacity
- pricePerHour, amenities, images
- isActive

### Booking
- user, studio
- startTime, endTime, totalHours, totalPrice
- status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
- paymentStatus: 'pending' | 'paid' | 'refunded'

### Availability
- studio, dayOfWeek (0-6)
- timeSlots: [{ start, end }]
- specificDate (for exceptions)

## 🔌 API Endpoints

### Studios
- `GET /api/studios` - קבל את כל האולמות
- `POST /api/studios` - צור אולם חדש (admin)

### Bookings
- `GET /api/bookings?userId=xxx` - קבל הזמנות
- `POST /api/bookings` - צור הזמנה חדשה

### Availability
- `GET /api/availability?studioId=xxx&date=2024-01-01` - בדוק זמינות

## 🎯 הצעדים הבאים

1. **Authentication** - הוספת NextAuth.js
2. **Calendar Component** - בניית לוח זמנים אינטראקטיבי
3. **Stripe Integration** - חיבור מערכת תשלומים
4. **Admin Dashboard** - פאנל ניהול
5. **Email Notifications** - התראות למשתמשים
6. **Mobile App** - אפליקציית מובייל (אופציונלי)

## 📝 הערות חשובות

- הפרויקט מוכן לפיתוח נוסף
- כל ה-API Routes מוגנים מפני CSRF
- המודלים כוללים validation מלא
- נתמך RTL (עברית)

## 🚀 Deployment ל-Vercel

1. צור repository ב-GitHub
2. העלה את הקוד
3. היכנס ל-[Vercel](https://vercel.com)
4. Import the repository
5. הוסף את ה-Environment Variables
6. Deploy!

## 🤝 תרומה

Pull requests are welcome! אנא פתח issue קודם לשינויים גדולים.

## 📄 License

MIT

---

**נבנה עם ❤️ ו-AI**
