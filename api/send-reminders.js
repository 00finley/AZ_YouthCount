import { createClient } from 'redis';

// Resend API for sending reminder emails (free tier: 100 emails/day)
// Sign up at https://resend.com and get your API key
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'AZ Youth Count <noreply@azyouthcount.org>';

const BOOKINGS_KEY = 'az_youth_count_bookings_v2';
const REMINDERS_SENT_KEY = 'az_youth_count_reminders_sent';

let redis = null;

async function getRedisClient() {
  if (!redis) {
    redis = createClient({
      url: process.env.REDIS_URL || process.env.KV_URL,
    });
    redis.on('error', (err) => console.error('Redis Client Error', err));
    await redis.connect();
  }
  return redis;
}

// Parse slot key to get date and time
function parseSlotKey(slotKey) {
  // Format: YYYY-MM-DD-HH:MM
  const parts = slotKey.split('-');
  const date = `${parts[0]}-${parts[1]}-${parts[2]}`;
  const time = parts[3];
  return { date, time };
}

// Get appointment datetime from slot key
function getAppointmentTime(slotKey) {
  const { date, time } = parseSlotKey(slotKey);
  // Create date in Arizona time (MST, no DST)
  const dateTimeStr = `${date}T${time}:00`;
  // Parse as local time and adjust for Arizona (UTC-7)
  const localDate = new Date(dateTimeStr);
  return localDate;
}

// Format time for display
function formatTime(timeStr) {
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${period}`;
}

// Format date for display
function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// Send email via Resend
async function sendReminderEmail({ toEmail, toName, appointmentDate, appointmentTime, contactMethod }) {
  if (!RESEND_API_KEY) {
    console.log('Resend API key not configured, skipping reminder email');
    return { success: false, reason: 'not_configured' };
  }

  const contactMethodText = contactMethod === 'zoom'
    ? 'We\'ll send you a Zoom link shortly before your appointment.'
    : contactMethod === 'phone'
      ? 'We\'ll call you at your provided phone number.'
      : 'Please be online on Discord and ready to receive a call.';

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0;">Reminder: Your Survey is in 1 Hour!</h1>
      </div>
      <div style="padding: 30px; background: #f9fafb;">
        <p style="font-size: 16px; color: #374151;">Hi ${toName},</p>
        <p style="font-size: 16px; color: #374151;">
          This is a friendly reminder that your AZ Youth Count survey appointment is coming up in about 1 hour.
        </p>
        <div style="background: white; border-radius: 12px; padding: 20px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <p style="margin: 0 0 10px 0;"><strong>Date:</strong> ${appointmentDate}</p>
          <p style="margin: 0 0 10px 0;"><strong>Time:</strong> ${appointmentTime}</p>
          <p style="margin: 0;"><strong>Method:</strong> ${contactMethod.charAt(0).toUpperCase() + contactMethod.slice(1)}</p>
        </div>
        <p style="font-size: 16px; color: #374151;">${contactMethodText}</p>
        <p style="font-size: 16px; color: #374151;">
          The survey takes about 10-15 minutes, and you'll receive a <strong>$20 gift card</strong> for participating!
        </p>
        <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
          Thank you for helping us better understand and support young adults in Arizona.
        </p>
      </div>
      <div style="background: #1f2937; padding: 20px; text-align: center;">
        <p style="color: #9ca3af; margin: 0; font-size: 12px;">
          Arizona 2026 Youth Count
        </p>
      </div>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [toEmail],
        subject: `Reminder: Your AZ Youth Count Survey is in 1 Hour - ${appointmentTime}`,
        html: htmlContent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      return { success: false, error: data };
    }

    return { success: true, id: data.id };
  } catch (error) {
    console.error('Failed to send reminder email:', error);
    return { success: false, error };
  }
}

export default async function handler(req, res) {
  // Verify this is a cron request (Vercel sends a special header)
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  // Allow cron requests or requests with correct secret
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // Also check for Vercel's cron header
    if (req.headers['x-vercel-cron'] !== '1') {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const client = await getRedisClient();

    // Get all bookings
    const bookingsRaw = await client.get(BOOKINGS_KEY);
    const bookings = bookingsRaw ? JSON.parse(bookingsRaw) : [];

    // Get already sent reminders
    const sentRemindersRaw = await client.get(REMINDERS_SENT_KEY);
    const sentReminders = sentRemindersRaw ? JSON.parse(sentRemindersRaw) : [];

    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const remindersSent = [];
    const errors = [];

    for (const booking of bookings) {
      // Determine email to use: reminderEmail (for phone/discord) or contactInfo (for zoom)
      const emailToUse = booking.reminderEmail || (booking.contactMethod === 'zoom' ? booking.contactInfo : null);

      // Skip if no email available
      if (!emailToUse) {
        continue;
      }

      // Skip if reminder already sent
      if (sentReminders.includes(booking.slotKey)) {
        continue;
      }

      // Check if appointment is within the next 1-2 hours
      const appointmentTime = getAppointmentTime(booking.slotKey);

      if (appointmentTime > oneHourFromNow && appointmentTime <= twoHoursFromNow) {
        // Send reminder
        const { date, time } = parseSlotKey(booking.slotKey);
        const result = await sendReminderEmail({
          toEmail: emailToUse,
          toName: booking.name,
          appointmentDate: formatDate(date),
          appointmentTime: formatTime(time),
          contactMethod: booking.contactMethod,
        });

        if (result.success) {
          remindersSent.push(booking.slotKey);
          sentReminders.push(booking.slotKey);
        } else if (result.reason !== 'not_configured') {
          errors.push({ slotKey: booking.slotKey, error: result.error });
        }
      }
    }

    // Save updated sent reminders list
    if (remindersSent.length > 0) {
      await client.set(REMINDERS_SENT_KEY, JSON.stringify(sentReminders));
    }

    return res.status(200).json({
      success: true,
      remindersSent: remindersSent.length,
      errors: errors.length,
      details: { remindersSent, errors },
    });
  } catch (error) {
    console.error('Error in send-reminders:', error);
    return res.status(500).json({ error: 'Failed to process reminders' });
  }
}
