import nodemailer from 'nodemailer';

// Create transporter using Gmail (you can change to other providers)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASSWORD, // Your Gmail app password
  },
});

interface BookingEmailData {
  customerName: string;
  customerEmail: string;
  studioName: string;
  studioAddress?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: string;
  participants: number;
  activityType: string;
  totalPrice: number;
  bookingId: string;
}

export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  const {
    customerName,
    customerEmail,
    studioName,
    studioAddress,
    date,
    startTime,
    endTime,
    duration,
    participants,
    activityType,
    totalPrice,
    bookingId,
  } = data;

  const mailOptions = {
    from: {
      name: 'השכרת חללי ריקוד',
      address: process.env.EMAIL_USER || '',
    },
    to: customerEmail,
    subject: `אישור הזמנה #${bookingId.slice(-6)} - ${studioName}`,
    html: `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f4f4f4;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 30px 20px;
    }
    .greeting {
      font-size: 18px;
      margin-bottom: 20px;
      color: #7c3aed;
      font-weight: bold;
    }
    .info-box {
      background-color: #f9fafb;
      border-right: 4px solid #7c3aed;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-row:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: bold;
      color: #6b7280;
    }
    .info-value {
      color: #111827;
      font-weight: 500;
    }
    .price-box {
      background-color: #7c3aed;
      color: white;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
      border-radius: 8px;
    }
    .price-box .amount {
      font-size: 32px;
      font-weight: bold;
      margin: 10px 0;
    }
    .instructions {
      background-color: #fef3c7;
      border-right: 4px solid #f59e0b;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .instructions h3 {
      margin-top: 0;
      color: #92400e;
    }
    .instructions ul {
      margin: 10px 0;
      padding-right: 20px;
    }
    .instructions li {
      margin: 8px 0;
      color: #78350f;
    }
    .footer {
      background-color: #f9fafb;
      padding: 20px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
      font-size: 12px;
      color: #6b7280;
    }
    .button {
      display: inline-block;
      background-color: #7c3aed;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ ההזמנה שלך אושרה!</h1>
      <p>מספר הזמנה: #${bookingId.slice(-6)}</p>
    </div>

    <div class="content">
      <div class="greeting">
        שלום ${customerName},
      </div>

      <p>תודה שבחרת להזמין אצלנו! ההזמנה שלך אושרה והחלל ממתין לך.</p>

      <div class="info-box">
        <h2 style="margin-top: 0; color: #7c3aed;">📋 פרטי ההזמנה</h2>
        
        <div class="info-row">
          <span class="info-label">חלל:</span>
          <span class="info-value">${studioName}</span>
        </div>

        ${studioAddress ? `
        <div class="info-row">
          <span class="info-label">כתובת:</span>
          <span class="info-value">${studioAddress}</span>
        </div>
        ` : ''}

        <div class="info-row">
          <span class="info-label">תאריך:</span>
          <span class="info-value">${date}</span>
        </div>

        <div class="info-row">
          <span class="info-label">שעות:</span>
          <span class="info-value">${startTime} - ${endTime}</span>
        </div>

        <div class="info-row">
          <span class="info-label">משך:</span>
          <span class="info-value">${duration}</span>
        </div>

        <div class="info-row">
          <span class="info-label">מספר משתתפים:</span>
          <span class="info-value">${participants}</span>
        </div>

        <div class="info-row">
          <span class="info-label">סוג פעילות:</span>
          <span class="info-value">${activityType}</span>
        </div>
      </div>

      <div class="price-box">
        <div style="font-size: 16px;">סה"כ לתשלום</div>
        <div class="amount">₪${totalPrice}</div>
      </div>

      <div class="instructions">
        <h3>🚪 הוראות כניסה</h3>
        <ul>
          <li><strong>הגעה:</strong> אנא הגיעו 5 דקות לפני תחילת ההשכרה</li>
          <li><strong>כניסה:</strong> הכניסה לחלל דרך הכניסה הראשית בקומה 2</li>
          <li><strong>ציוד:</strong> כל הציוד הבסיסי כלול במחיר</li>
          <li><strong>נעילה:</strong> בסיום ההשכרה, אנא ודאו שהחלל נעול והאורות כבויים</li>
          <li><strong>תמיכה:</strong> לכל שאלה, צרו קשר בטלפון: 050-1234567</li>
        </ul>
      </div>

      <p><strong>חשוב לדעת:</strong></p>
      <ul style="color: #6b7280; font-size: 14px;">
        <li>אנא הביאו איתכם תעודה מזהה</li>
        <li>שמרו על הנקיון והסדר בחלל</li>
        <li>מדיניות ביטולים: עד 48 שעות לפני - החזר מלא</li>
      </ul>

      <center>
        <a href="${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/booking" class="button">
          הזמנה נוספת
        </a>
      </center>
    </div>

    <div class="footer">
      <p>מייל זה נשלח אוטומטית ממערכת ההזמנות שלנו</p>
      <p>לשאלות ובירורים: info@studio-booking.com | 050-1234567</p>
      <p style="margin-top: 15px; color: #9ca3af;">
        © 2026 השכרת חללי ריקוד. כל הזכויות שמורות.
      </p>
    </div>
  </div>
</body>
</html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', customerEmail);
    return { success: true };
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return { success: false, error };
  }
}

// Test email configuration
export async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log('✅ Email server is ready');
    return true;
  } catch (error) {
    console.error('❌ Email server error:', error);
    return false;
  }
}
