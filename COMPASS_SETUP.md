# 🚀 הגדרה מהירה למשתמשי MongoDB Compass

## אתה כבר משתמש ב-Compass? מעולה! 

### אופציה 1: MongoDB מקומי (הכי פשוט)

אם אתה מריץ MongoDB מקומי במחשב שלך:

**צור/ערוך את `.env.local`:**

```env
# MongoDB מקומי
MONGODB_URI=mongodb://localhost:27017/studio-booking

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Stripe (אופציונלי בינתיים)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

**זהו! עכשיו הרץ:**

```bash
# הכנס נתוני דמו
node scripts/seed.js

# הרץ את השרת
npm run dev
```

---

### אופציה 2: MongoDB Atlas (בענן)

אם אתה מתחבר ל-Atlas דרך Compass:

1. **פתח את MongoDB Compass**
2. **תראה את ה-Connection String למעלה** - זה נראה כך:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
   ```

3. **העתק את זה ל-`.env.local`** (הוסף `/studio-booking` בסוף):

```env
# החלף עם ה-connection string שלך
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/studio-booking?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Stripe
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
```

---

## 🎯 איך לדעת איזה אופציה אתה משתמש?

**פתח MongoDB Compass ותסתכל על ה-connection string:**

- אם יש `localhost` או `127.0.0.1` → **אופציה 1** (מקומי)
- אם יש `mongodb+srv://` ו-`mongodb.net` → **אופציה 2** (Atlas)

---

## ✅ בדיקה שזה עובד

אחרי שתעדכן את `.env.local`:

```bash
# 1. הרץ seed
node scripts/seed.js
```

אתה אמור לראות:
```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB
🗑️  Clearing existing studios...
📦 Creating studios...

✅ Seed completed successfully!

📊 Created studios:

   חלל ריקוד 1 - האולם הגדול
   - ID: 507f1f77bcf86cd799439011
   - Images: 3 תמונות
   - Pricing tiers: 3 מחירונים
   ...
```

**עכשיו פתח את Compass ותראה:**
- Database: `studio-booking`
- Collection: `studios` (עם 2 documents)

---

## 🔧 אם עדיין יש שגיאה

### שגיאה: "Cannot read .env"

הקובץ `.env.local` חייב להיות **בתיקייה הראשית** של הפרויקט:

```
studio-booking/
├── .env.local          ← כאן!
├── package.json
├── app/
├── components/
└── ...
```

### שגיאה: "ECONNREFUSED"

MongoDB לא רץ. הרץ אותו:

**Mac:**
```bash
brew services start mongodb-community
```

**Windows:**
- Services → MongoDB → Start

**Linux:**
```bash
sudo systemctl start mongod
```

### בדוק ש-MongoDB רץ:

```bash
# Mac/Linux
ps aux | grep mongod

# או נסה להתחבר
mongosh
```

---

## 💡 טיפ: צפה בדאטה ב-Compass

אחרי ה-seed, פתח Compass:

1. התחבר (אם לא מחובר)
2. Database: `studio-booking`
3. Collections → `studios`
4. תראה 2 חללים עם כל הפרטים!

---

## 📝 דוגמת `.env.local` מלאה

```env
# ===== MongoDB =====
# בחר אחד:

# מקומי:
MONGODB_URI=mongodb://localhost:27017/studio-booking

# או Atlas:
# MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/studio-booking?retryWrites=true&w=majority

# ===== NextAuth =====
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=my-super-secret-key-12345

# ===== Stripe (אופציונלי בינתיים) =====
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# ===== App Settings =====
STUDIO_1_HOURLY_RATE=150
STUDIO_2_HOURLY_RATE=150
```

---

**זהו! עכשיו `npm run dev` ותיכנס ל-http://localhost:3000/booking** 🎉
