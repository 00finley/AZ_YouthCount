// Vercel Serverless Function for managing booking slots
// This uses Vercel KV (Redis) for persistent storage
// To set up: Install @vercel/kv and configure KV in Vercel dashboard

// For development/fallback, we use in-memory storage
let inMemorySlots = [];

// Configuration
const CONFIG = {
  COUNT_START: new Date('2026-01-28'),
  COUNT_END: new Date('2026-02-13'),
  DOUBLE_SLOTS_START: new Date('2026-02-06'),
  SLOTS_BEFORE_FEB_6: 1,
  SLOTS_FROM_FEB_6: 2,
  // reCAPTCHA secret key (set in Vercel environment variables)
  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY || '',
};

// Verify reCAPTCHA token
async function verifyRecaptcha(token) {
  if (!CONFIG.RECAPTCHA_SECRET_KEY || !token) {
    // Skip verification if no secret key configured
    return true;
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${CONFIG.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();
    return data.success && data.score >= 0.5; // Score threshold for v3
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

// Check if slot is valid
function isValidSlot(slotKey) {
  // Format: YYYY-MM-DD-HH:MM
  const regex = /^\d{4}-\d{2}-\d{2}-\d{2}:\d{2}$/;
  if (!regex.test(slotKey)) return false;

  const [datePart] = slotKey.split('-').slice(0, 3).join('-').split('-');
  const dateStr = slotKey.substring(0, 10);
  const date = new Date(dateStr);

  // Check if date is within count period
  if (date < CONFIG.COUNT_START || date > CONFIG.COUNT_END) return false;

  // Check if it's a weekday
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;

  return true;
}

// Get max slots for a date
function getMaxSlots(dateStr) {
  const date = new Date(dateStr);
  return date >= CONFIG.DOUBLE_SLOTS_START ? CONFIG.SLOTS_FROM_FEB_6 : CONFIG.SLOTS_BEFORE_FEB_6;
}

// Try to use Vercel KV if available
async function getKV() {
  try {
    const { kv } = await import('@vercel/kv');
    return kv;
  } catch {
    return null;
  }
}

// Get booked slots
async function getBookedSlots() {
  const kv = await getKV();
  if (kv) {
    try {
      const slots = await kv.get('booked_slots');
      return slots || [];
    } catch (error) {
      console.error('KV read error:', error);
      return inMemorySlots;
    }
  }
  return inMemorySlots;
}

// Save booked slots
async function saveBookedSlots(slots) {
  const kv = await getKV();
  if (kv) {
    try {
      await kv.set('booked_slots', slots);
      return true;
    } catch (error) {
      console.error('KV write error:', error);
      inMemorySlots = slots;
      return false;
    }
  }
  inMemorySlots = slots;
  return true;
}

// Main handler
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // GET - Return all booked slots
  if (req.method === 'GET') {
    const bookedSlots = await getBookedSlots();
    return res.status(200).json({ bookedSlots });
  }

  // POST - Book a new slot
  if (req.method === 'POST') {
    const { slotKey, recaptchaToken } = req.body;

    // Validate slot key
    if (!slotKey) {
      return res.status(400).json({ error: 'Slot key is required' });
    }

    if (!isValidSlot(slotKey)) {
      return res.status(400).json({ error: 'Invalid slot key' });
    }

    // Verify reCAPTCHA
    const isValidRecaptcha = await verifyRecaptcha(recaptchaToken);
    if (!isValidRecaptcha) {
      return res.status(400).json({ error: 'reCAPTCHA verification failed' });
    }

    // Get current slots
    const bookedSlots = await getBookedSlots();

    // Check slot availability
    const dateStr = slotKey.substring(0, 10);
    const maxSlots = getMaxSlots(dateStr);
    const currentBookings = bookedSlots.filter(s => s === slotKey).length;

    if (currentBookings >= maxSlots) {
      return res.status(400).json({ error: 'Slot is already fully booked' });
    }

    // Book the slot
    bookedSlots.push(slotKey);
    await saveBookedSlots(bookedSlots);

    return res.status(200).json({
      success: true,
      message: 'Slot booked successfully',
      slotKey,
      spotsRemaining: maxSlots - currentBookings - 1,
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
