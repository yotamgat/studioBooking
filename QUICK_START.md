# 🚀 מדריך התחלה מהירה

## צעדים ראשונים

### 1. התקנה

```bash
# התקן את כל התלויות
npm install
```

### 2. הגדר MongoDB

**אופציה א' - MongoDB Atlas (מומלץ, חינמי):**

1. היכנס ל-https://www.mongodb.com/cloud/atlas
2. צור חשבון חינמי
3. לחץ "Build a Database" → בחר M0 (חינמי)
4. בחר region (Europe - לישראל)
5. צור cluster
6. ב-Security → Database Access → הוסף משתמש חדש
7. ב-Security → Network Access → הוסף `0.0.0.0/0` (לפיתוח)
8. לחץ "Connect" → "Connect your application"
9. העתק את ה-connection string

**אופציה ב' - MongoDB מקומי:**

```bash
# התקן MongoDB (macOS)
brew tap mongodb/brew
brew install mongodb-community

# הרץ MongoDB
brew services start mongodb-community
```

### 3. צור קובץ .env.local

```bash
cp .env.example .env.local
```

ערוך את הקובץ:

```env
# החלף עם ה-connection string שלך
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/studio-booking?retryWrites=true&w=majority

# צור secret (או השתמש באחד כלשהו בפיתוח)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-key-change-this

# Stripe (תוכל להשאיר ריק בינתיים)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
```

### 4. הכנס נתוני דוגמה (אופציונלי)

```bash
node scripts/seed.js
```

זה יוסיף:
- 2 חללי ריקוד
- משתמש admin (admin@studio.com / password123)
- כמה הזמנות לדוגמה

### 5. הרץ את הפרויקט

```bash
npm run dev
```

פתח דפדפן: http://localhost:3000

## 🎯 מה יש בפרויקט?

### ✅ מה כבר מוכן:

1. **מבנה הפרויקט**
   - Next.js 14 עם App Router
   - TypeScript
   - Tailwind CSS
   - MongoDB + Mongoose

2. **Models (מסד נתונים)**
   - User - משתמשים
   - Studio - חללי ריקוד
   - Booking - הזמנות
   - Availability - זמינות וחסימות

3. **API Routes**
   - `/api/studios` - ניהול חללים
   - `/api/bookings` - יצירת וצפייה בהזמנות
   - `/api/bookings/availability` - בדיקת זמינות

4. **קבצי הגדרות**
   - MongoDB connection
   - TypeScript config
   - Tailwind config
   - Environment variables

### 🚧 מה צריך להוסיף:

1. **Authentication (NextAuth.js)**
   - עמוד התחברות
   - עמוד הרשמה
   - Protected routes

2. **Frontend Pages**
   - דף הזמנה עם לוח שנה
   - דף תשלום
   - פאנל ניהול

3. **Stripe Integration**
   - תשלומים
   - Webhooks

## 📝 משימות הבאות

### שלב 1 - Authentication (נדרש)

1. התקן NextAuth:
```bash
npm install next-auth
```

2. צור `/app/api/auth/[...nextauth]/route.ts`
3. צור עמודי Login/Register

### שלב 2 - UI Components

1. צור קומפוננטת Calendar
2. צור טופס הזמנה
3. צור דף אישור הזמנה

### שלב 3 - Payments

1. הירשם ל-Stripe
2. קבל API keys
3. צור payment flow

## 🔍 בדיקת המערכת

### בדוק שה-API עובד:

```bash
# קבל את כל החללים
curl http://localhost:3000/api/studios

# בדוק זמינות
curl "http://localhost:3000/api/bookings/availability?studioId=xxx&date=2024-02-15"
```

### בדוק את MongoDB:

1. התקן MongoDB Compass: https://www.mongodb.com/try/download/compass
2. התחבר עם ה-connection string שלך
3. תראה את הדאטה בצורה ויזואלית

## 💡 טיפים

1. **Hot Reload עובד** - כל שינוי בקוד מתעדכן אוטומטית
2. **התקן VS Code Extensions:**
   - ES7+ React/Redux/React-Native snippets
   - Tailwind CSS IntelliSense
   - MongoDB for VS Code

3. **שגיאות נפוצות:**
   - אם יש שגיאת MongoDB connection - בדוק את ה-MONGODB_URI
   - אם הפורט תפוס - שנה ל-`npm run dev -- -p 3001`

## 📚 משאבים

- [Next.js Docs](https://nextjs.org/docs)
- [MongoDB Docs](https://www.mongodb.com/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [NextAuth.js](https://next-auth.js.org/)
- [Stripe Docs](https://stripe.com/docs)

## 🆘 עזרה

אם יש בעיה:
1. בדוק את הקונסול בדפדפן (F12)
2. בדוק את הלוגים בטרמינל
3. בדוק שכל ה-environment variables נכונות

---

**בהצלחה! 🎉**
