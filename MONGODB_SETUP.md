# 🔧 פתרון בעיית חיבור ל-MongoDB

## הבעיה שקיבלת:
```
Error: querySrv ENOTFOUND _mongodb._tcp.cluster.mongodb.net
```

זה אומר שה-`MONGODB_URI` לא מוגדר נכון או חסר.

---

## ✅ פתרון מהיר - 3 דקות

### שלב 1: צור MongoDB Atlas (חינמי)

1. **היכנס לאתר:**
   https://www.mongodb.com/cloud/atlas/register

2. **הירשם:**
   - לחץ "Try Free"
   - השתמש ב-Google/Email
   - מלא פרטים בסיסיים

3. **צור Cluster:**
   - בחר **M0 (FREE)**
   - בחר **Region: Europe (Ireland)** (הכי קרוב לישראל)
   - שם Cluster: `studio-booking` (או כל שם)
   - לחץ "Create Deployment"

4. **צור משתמש למסד נתונים:**
   ```
   Username: admin
   Password: [בחר סיסמה חזקה ושמור אותה!]
   ```
   לחץ "Create User"

5. **אפשר גישה מכל מקום:**
   - ב-"Network Access" לחץ "Add IP Address"
   - בחר **"Allow Access from Anywhere"** (0.0.0.0/0)
   - לחץ "Confirm"

6. **קבל Connection String:**
   - חזור ל-"Database"
   - לחץ "Connect" ליד הקלאסטר שלך
   - בחר "Drivers"
   - בחר "Node.js" ו-Version 4.1 or later
   - העתק את ה-Connection String

   זה ייראה ככה:
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### שלב 2: עדכן את `.env.local`

1. **פתח/צור את הקובץ `.env.local`** בתיקיית הפרויקט

2. **הדבק את זה (עם השינויים שלך):**

```env
# MongoDB - החלף עם ה-Connection String שלך!
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD_HERE@cluster0.xxxxx.mongodb.net/studio-booking?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=super-secret-key-change-this-in-production

# Stripe (אפשר להשאיר ריק בינתיים)
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# App Settings
STUDIO_1_HOURLY_RATE=150
STUDIO_2_HOURLY_RATE=150
```

**חשוב מאוד:**
- החלף `YOUR_PASSWORD_HERE` בסיסמה שיצרת
- החלף `cluster0.xxxxx` עם המזהה האמיתי שקיבלת
- הוסף `/studio-booking` לפני ה-`?` (זה שם הדאטאבייס)

### שלב 3: הרץ Seed

```bash
node scripts/seed.js
```

אתה אמור לראות:
```
✅ Connected to MongoDB
📦 Creating studios...
✅ Seed completed successfully!
```

### שלב 4: הרץ את השרת

```bash
npm run dev
```

עכשיו גש ל-http://localhost:3000/booking

---

## 🔍 בעיות נפוצות

### בעיה 1: "bad auth"
```
MongoServerError: bad auth
```

**פתרון:**
- הסיסמה לא נכונה
- וודא שהחלפת `<password>` בסיסמה האמיתית
- אם יש תווים מיוחדים בסיסמה (כמו @, #, %), צריך לעשות URL encoding
  - `@` → `%40`
  - `#` → `%23`
  - `/` → `%2F`

### בעיה 2: "IP not whitelisted"
```
MongoServerError: IP address is not whitelisted
```

**פתרון:**
1. MongoDB Atlas → Network Access
2. Add IP Address
3. בחר "Allow Access from Anywhere" (0.0.0.0/0)

### בעיה 3: "ENOTFOUND" או "timeout"
```
Error: querySrv ENOTFOUND
```

**פתרון:**
- בדוק שה-MONGODB_URI נכון בדיוק
- בדוק שיש חיבור לאינטרנט
- נסה להריץ `ping cluster0.xxxxx.mongodb.net`

---

## 🚀 דרך חלופית - MongoDB מקומי (למתקדמים)

אם אתה רוצה להריץ MongoDB מקומי במחשב:

### Mac:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community

# Connection String:
MONGODB_URI=mongodb://localhost:27017/studio-booking
```

### Windows:
1. הורד מ-https://www.mongodb.com/try/download/community
2. התקן
3. הרץ MongoDB
```
MONGODB_URI=mongodb://localhost:27017/studio-booking
```

### Linux:
```bash
sudo apt-get install mongodb
sudo systemctl start mongodb

MONGODB_URI=mongodb://localhost:27017/studio-booking
```

---

## ✅ בדיקה שהכל עובד

הרץ את הפקודה הזו:

```bash
node -e "const mongoose = require('mongoose'); mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://...').then(() => console.log('✅ Connected!')).catch(e => console.error('❌ Error:', e.message))"
```

אם זה עובד, תראה:
```
✅ Connected!
```

---

## 📝 דוגמה ל-Connection String תקין

```env
# טוב ✅
MONGODB_URI=mongodb+srv://admin:MyPass123@cluster0.abc12.mongodb.net/studio-booking?retryWrites=true&w=majority

# לא טוב ❌ (שכח שם DB)
MONGODB_URI=mongodb+srv://admin:MyPass123@cluster0.abc12.mongodb.net/?retryWrites=true&w=majority

# לא טוב ❌ (לא החליף <password>)
MONGODB_URI=mongodb+srv://admin:<password>@cluster0.abc12.mongodb.net/studio-booking

# לא טוב ❌ (חסר במרכאות)
MONGODB_URI="mongodb+srv://admin:MyPass123@cluster0.abc12.mongodb.net/studio-booking"
```

---

## 🆘 עדיין לא עובד?

אם עדיין יש בעיה:

1. **שלח לי screenshot** של:
   - ה-`.env.local` (בלי הסיסמה!)
   - השגיאה המלאה

2. **או נסה:**
```bash
# בדוק שהקובץ קיים
ls -la .env.local

# הצג את התוכן (בלי סיסמה!)
cat .env.local | grep MONGODB_URI
```

3. **בדוק ש-MongoDB Atlas פעיל:**
   - היכנס ל-https://cloud.mongodb.com
   - ודא שה-Cluster בסטטוס "Active"

---

## 💡 טיפים

1. **חשוב:** הקובץ `.env.local` חייב להיות בתיקייה הראשית של הפרויקט (ליד `package.json`)

2. **רענן אחרי שינוי .env:**
   ```bash
   # עצור את השרת (Ctrl+C)
   # הרץ מחדש
   npm run dev
   ```

3. **MongoDB Compass** (GUI):
   - הורד: https://www.mongodb.com/try/download/compass
   - התחבר עם אותו Connection String
   - תוכל לראות את הדאטה ויזואלית

---

בהצלחה! אם זה עובד, תראה את החללים עם התמונות היפות 🎉
