'use client';

import { useState } from 'react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsModal({ isOpen, onClose }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-purple-600 text-white px-6 py-4 flex justify-between items-center">
            <h2 className="text-2xl font-bold">תקנון השכרת חללי ריקוד</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 overflow-y-auto max-h-[calc(80vh-120px)] text-right">
            <div className="prose prose-sm max-w-none">
              <h3 className="text-lg font-bold mt-6 mb-3">1. כללי</h3>
              <p className="mb-2">1.1. תקנון זה מסדיר את תנאי השכרת החללים באתר.</p>
              <p className="mb-2">1.2. ביצוע הזמנה מהווה הסכמה מלאה לתנאי תקנון זה.</p>
              <p className="mb-2">1.3. אנו שומרים לעצמנו את הזכות לשנות את התקנון מעת לעת.</p>

              <h3 className="text-lg font-bold mt-6 mb-3">2. ביצוע הזמנה</h3>
              <p className="mb-2">2.1. ההזמנה תיחשב כסופית רק לאחר קבלת אישור ותשלום מלא.</p>
              <p className="mb-2">2.2. הנהלת האולם שומרת לעצמה את הזכות לאשר או לדחות הזמנה.</p>
              <p className="mb-2">2.3. זמן ההשכרה מתחיל ומסתיים בדיוק בשעות שנקבעו בהזמנה.</p>

              <h3 className="text-lg font-bold mt-6 mb-3">3. תשלום וביטול</h3>
              <p className="mb-2">3.1. התשלום יבוצע באמצעות כרטיס אשראי או העברה בנקאית.</p>
              <p className="mb-2">3.2. ביטול הזמנה עד 48 שעות לפני מועד ההשכרה - <strong>זיכוי מלא</strong>.</p>
              <p className="mb-2">3.3. ביטול בין 24-48 שעות לפני מועד ההשכרה - <strong>זיכוי של 50%</strong>.</p>
              <p className="mb-2">3.4. ביטול פחות מ-24 שעות לפני מועד ההשכרה - <strong>ללא זיכוי</strong>.</p>
              <p className="mb-2">3.5. אי הגעה ללא הודעה מראש - <strong>ללא זיכוי</strong>.</p>

              <h3 className="text-lg font-bold mt-6 mb-3">4. אחריות ונזקים</h3>
              <p className="mb-2">4.1. השוכר אחראי לשמירה על נקיון וסדר במהלך ההשכרה.</p>
              <p className="mb-2">4.2. השוכר אחראי לכל נזק שייגרם לחלל, לציוד או לרכוש.</p>
              <p className="mb-2">4.3. יש לדווח מיד על כל נזק או תקלה למנהל החלל.</p>
              <p className="mb-2">4.4. עלות תיקון נזקים תחויב למזמין ההשכרה.</p>

              <h3 className="text-lg font-bold mt-6 mb-3">5. כללי שימוש</h3>
              <p className="mb-2">5.1. אין להעביר את זכות השימוש לצד שלישי ללא אישור מראש בכתב.</p>
              <p className="mb-2">5.2. מספר המשתתפים לא יעלה על הקיבולת המקסימלית של החלל.</p>
              <p className="mb-2">5.3. <strong>אסור לעשן</strong> בחלל ובסביבתו הקרובה.</p>
              <p className="mb-2">5.4. אסור להכניס מזון ומשקאות לחלל ללא אישור מראש.</p>
              <p className="mb-2">5.5. חל <strong>איסור מוחלט</strong> על שימוש בסמים או אלכוהול בחלל.</p>
              <p className="mb-2">5.6. יש לשמור על רמת רעש סבירה.</p>

              <h3 className="text-lg font-bold mt-6 mb-3">6. ביטוח ובטיחות</h3>
              <p className="mb-2">6.1. השוכר אחראי לביטוח המשתתפים בפעילות.</p>
              <p className="mb-2">6.2. ההנהלה לא תישא באחריות לפגיעה גופנית או נזק לרכוש אישי.</p>
              <p className="mb-2">6.3. יש לעמוד בכללי הבטיחות ובהנחיות מנהל החלל.</p>

              <h3 className="text-lg font-bold mt-6 mb-3">7. ציוד</h3>
              <p className="mb-2">7.1. הציוד הקבוע בחלל עומד לרשות השוכר ללא תשלום נוסף.</p>
              <p className="mb-2">7.2. חל איסור להזיז או לשנות את מיקום הציוד הקבוע ללא אישור.</p>
              <p className="mb-2">7.3. ציוד נוסף בתיאום מראש ובתשלום נוסף.</p>

              <h3 className="text-lg font-bold mt-6 mb-3">8. סיום ההשכרה</h3>
              <p className="mb-2">8.1. יש לפנות את החלל בסיום השעה המוסכמת.</p>
              <p className="mb-2">8.2. יש להשאיר את החלל נקי ומסודר.</p>
              <p className="mb-2">8.3. יש לכבות את האורות, המזגן ולסגור את הדלתות.</p>

              <p className="mt-6 pt-4 border-t text-sm text-gray-600">
                <strong>עדכון אחרון:</strong> פברואר 2026<br />
                ההזמנה כפופה לתקנון זה ולחוקי מדינת ישראל.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t">
            <button
              onClick={onClose}
              className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 transition"
            >
              סגור
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
