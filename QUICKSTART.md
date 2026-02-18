# 🚀 מדריך התחלה מהירה

## צעדים ראשונים

### 1. הגדרת MongoDB Atlas (5 דקות)

1. כנס ל-https://www.mongodb.com/cloud/atlas/register
2. צור חשבון חינמי
3. לחץ על "Build a Database" -> בחר "FREE" (M0)
4. בחר region קרוב (למשל Frankfurt)
5. שם למסד: `studio-booking`
6. צור Database User:
   - Username: `admin`
   - Password: (שמור אותו!)
7. ב-Network Access: לחץ "Add IP Address" -> "Allow Access from Anywhere" (0.0.0.0/0)
8. חזור ל-Databases -> לחץ "Connect" -> "Connect your application"
9. העתק את ה-connection string

### 2. הגדרת הפרויקט

```bash
# העתק את קובץ ההגדרות
cp .env.example .env.local

# ערוך את הקובץ
nano .env.local  # או vim, או VSCode
```

הדבק את ה-connection string שהעתקת:
```env
MONGODB_URI=mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/studio-booking?retryWrites=true&w=majority
```

החלף `YOUR_PASSWORD` בסיסמה שיצרת!

ליצירת NEXTAUTH_SECRET:
```bash
# Linux/Mac:
openssl rand -base64 32

# Windows PowerShell:
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

הדבק את התוצאה:
```env
NEXTAUTH_SECRET=the-generated-secret-here
```

### 3. התקנה והרצה

```bash
# התקן את כל החבילות
npm install

# מלא את מסד הנתונים בנתונים ראשוניים
node scripts/seed.js

# הרץ את השרת
npm run dev
```

פתח את הדפדפן: http://localhost:3000

## ✅ בדיקה שהכל עובד

### בדוק את ה-API:

```bash
# קבל את רשימת הסטודיאות
curl http://localhost:3000/api/studios

# בדוק זמינות
curl "http://localhost:3000/api/studios?active=true"
```

אם אתה רואה JSON עם 2 סטודיאות - הכל עובד! 🎉

## 🎯 המשך פיתוח

### עכשיו אפשר להתחיל לעבוד על:

1. **דף הסטודיאות** - הצג את כל האולמות
2. **לוח זמנים** - בחירת תאריך ושעה
3. **הרשמה והתחברות** - NextAuth.js
4. **תשלומים** - Stripe integration
5. **פאנל ניהול** - לבת הזוג שלך

## 🐛 פתרון בעיות נפוצות

### MongoDB connection error
- ודא שהסיסמה נכונה (ללא תווים מיוחדים, או encode them)
- ודא ש-IP Address מורשה (0.0.0.0/0)
- המתן 1-2 דקות אחרי יצירת ה-cluster

### Port 3000 already in use
```bash
# הרוג תהליך שתופס את הפורט
# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F
```

### Cannot find module
```bash
# נקה ב-node_modules והתקן מחדש
rm -rf node_modules package-lock.json
npm install
```

## 📞 צריך עזרה?

- בדוק את ה-README.md המלא
- פתח issue ב-GitHub
- שלח לי הודעה

---

**Happy Coding! 💪**
