// Run this script to populate initial data: node scripts/seed.js
require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

async function seedDatabase() {
  try {
    console.log('🔌 מתחבר למסד הנתונים...');
    console.log('כתובת חיבור:', process.env.MONGODB_URI ? 'נמצאה' : 'לא נמצאה!');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ החיבור הצליח');

    const pricingSchema = new mongoose.Schema({
      minParticipants: Number,
      maxParticipants: Number,
      activityType: String,
      commercial: Boolean,
      pricePerHour: Number,
    }, { _id: false });

    const studioSchema = new mongoose.Schema({
      name: { type: String, required: true },
      description: String,
      detailedInfo: String,
      capacity: Number,
      size: Number,
      amenities: [String],
      images: { type: [String], required: true },
      pricing: [pricingSchema],
      features: [String],
      isActive: { type: Boolean, default: true },
    }, { timestamps: true });

    const Studio = mongoose.models.Studio || mongoose.model('Studio', studioSchema);

    console.log('🗑️  מנקה נתונים קיימים...');
    await Studio.deleteMany({});

    // בניית מחירון לפי התמונה שהעלית
    const createPricingTable = () => {
      const pricing = [];
      
      // מספר אנשים: 1
      pricing.push(
        { minParticipants: 1, maxParticipants: 1, activityType: 'חזרה', commercial: true, pricePerHour: 45 },
        { minParticipants: 1, maxParticipants: 1, activityType: 'חזרה', commercial: false, pricePerHour: 45 },
        { minParticipants: 1, maxParticipants: 1, activityType: 'אימון/שיעון', commercial: true, pricePerHour: 45 },
        { minParticipants: 1, maxParticipants: 1, activityType: 'אימון/שיעון', commercial: false, pricePerHour: 45 }
      );
      
      // מספר אנשים: 2-4
      pricing.push(
        { minParticipants: 2, maxParticipants: 4, activityType: 'חזרה', commercial: true, pricePerHour: 85 },
        { minParticipants: 2, maxParticipants: 4, activityType: 'חזרה', commercial: false, pricePerHour: 45 },
        { minParticipants: 2, maxParticipants: 4, activityType: 'אימון/שיעון', commercial: true, pricePerHour: 85 },
        { minParticipants: 2, maxParticipants: 4, activityType: 'אימון/שיעון', commercial: false, pricePerHour: 45 },
        { minParticipants: 2, maxParticipants: 4, activityType: 'סדנה/ש.פרטי', commercial: true, pricePerHour: 85 },
        { minParticipants: 2, maxParticipants: 4, activityType: 'סדנה/ש.פרטי', commercial: false, pricePerHour: 45 }
      );
      
      // מספר אנשים: 5-15
      pricing.push(
        { minParticipants: 5, maxParticipants: 15, activityType: 'חזרה', commercial: true, pricePerHour: 180 },
        { minParticipants: 5, maxParticipants: 15, activityType: 'חזרה', commercial: false, pricePerHour: 70 },
        { minParticipants: 5, maxParticipants: 15, activityType: 'אימון/שיעון', commercial: true, pricePerHour: 170 },
        { minParticipants: 5, maxParticipants: 15, activityType: 'אימון/שיעון', commercial: false, pricePerHour: 70 },
        { minParticipants: 5, maxParticipants: 15, activityType: 'סדנה/ש.פרטי', commercial: true, pricePerHour: 200 },
        { minParticipants: 5, maxParticipants: 15, activityType: 'סדנה/ש.פרטי', commercial: false, pricePerHour: 70 }
      );
      
      // מספר אנשים: 16-25
      pricing.push(
        { minParticipants: 16, maxParticipants: 25, activityType: 'חזרה', commercial: true, pricePerHour: 240 },
        { minParticipants: 16, maxParticipants: 25, activityType: 'חזרה', commercial: false, pricePerHour: 90 },
        { minParticipants: 16, maxParticipants: 25, activityType: 'אימון/שיעון', commercial: true, pricePerHour: 230 },
        { minParticipants: 16, maxParticipants: 25, activityType: 'אימון/שיעון', commercial: false, pricePerHour: 90 },
        { minParticipants: 16, maxParticipants: 25, activityType: 'סדנה/ש.פרטי', commercial: true, pricePerHour: 260 },
        { minParticipants: 16, maxParticipants: 25, activityType: 'סדנה/ש.פרטי', commercial: false, pricePerHour: 90 }
      );
      
      // מספר אנשים: 26+
      pricing.push(
        { minParticipants: 26, activityType: 'חזרה', commercial: true, pricePerHour: 300 },
        { minParticipants: 26, activityType: 'חזרה', commercial: false, pricePerHour: 110 },
        { minParticipants: 26, activityType: 'אימון/שיעון', commercial: true, pricePerHour: 290 },
        { minParticipants: 26, activityType: 'אימון/שיעון', commercial: false, pricePerHour: 110 },
        { minParticipants: 26, activityType: 'סדנה/ש.פרטי', commercial: true, pricePerHour: 320 },
        { minParticipants: 26, activityType: 'סדנה/ש.פרטי', commercial: false, pricePerHour: 110 }
      );
      
      return pricing;
    };

    const studios = [
      {
        name: 'חלל ריקוד 1 - האולם הגדול',
        description: 'חלל מרווח ומקצועי לריקוד ותנועה',
        detailedInfo: `חלל הריקוד הגדול שלנו הוא מרחב מושלם לכל סוגי הפעילויות. 

האולם כולל:
• רצפת פרקט מקצועית המתאימה לכל סוגי הריקוד
• מערכת סאונד ברמה גבוהה עם חיבור Bluetooth
• מראות לאורך כל הקיר
• תאורה מקצועית הניתנת לעמעום
• מזגן מרכזי
• שירותים ומקלחות בסמוך
• כניסה נפרדת ופרטית

מושלם עבור: שיעורי ריקוד, אימונים, חזרות להופעות, יוגה וכושר, סדנאות תנועה.`,
        capacity: 30,
        size: 80,
        amenities: ['מראות', 'מערכת סאונד', 'מזגן', 'שירותים', 'מקלחות', 'Wi-Fi'],
        images: [
          'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800',
          'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800',
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=800',
        ],
        pricing: createPricingTable(),
        features: ['מראות קיר לקיר', 'מערכת סאונד מקצועית', 'רצפת פרקט', 'תאורה מקצועית', 'מזגן'],
        isActive: true,
      },
      {
        name: 'חלל ריקוד 2 - האולם האינטימי',
        description: 'חלל קטן ויפה למפגשים אישיים',
        detailedInfo: `חלל הריקוד האינטימי שלנו מתאים במיוחד לאימונים פרטניים ולקבוצות קטנות.

האולם כולל:
• רצפה מתאימה לריקוד עם ספיגת זעזועים
• מערכת סאונד איכותית
• מראה גדולה
• תאורה רכה וניתנת לכיוון
• מזגן שקט
• אווירה נעימה ואינטימית

מושלם עבור: אימונים פרטניים, זוגות, קבוצות קטנות, פילאטיס, יוגה, מדיטציה בתנועה.`,
        capacity: 15,
        size: 50,
        amenities: ['מראה', 'מערכת סאונד', 'מזגן', 'שירותים', 'Wi-Fi'],
        images: [
          'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
          'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
          'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800',
        ],
        pricing: createPricingTable(),
        features: ['מראה גדולה', 'מערכת סאונד', 'רצפה ספיגה', 'אווירה אינטימית', 'מזגן שקט'],
        isActive: true,
      },
    ];

    console.log('📦 יוצר חללים חדשים...');
    const createdStudios = await Studio.insertMany(studios);

    console.log('\n✅ הפעולה הסתיימה בהצלחה!');
    console.log('\n📊 נוצרו החללים הבאים:');
    createdStudios.forEach(studio => {
      console.log(`\n   ${studio.name}`);
      console.log(`   - מזהה: ${studio._id}`);
      console.log(`   - תמונות: ${studio.images.length}`);
      console.log(`   - מחירונים: ${studio.pricing.length} שורות`);
      console.log(`   - קיבולת: ${studio.capacity} איש`);
      console.log(`   - גודל: ${studio.size} מ"ר`);
    });

    console.log('\n✨ מסד הנתונים מוכן לשימוש!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ שגיאה:', error);
    console.error('פרטי השגיאה:', error.message);
    process.exit(1);
  }
}

seedDatabase();
