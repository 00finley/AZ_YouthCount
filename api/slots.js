// Vercel Serverless Function for managing booking slots
// Uses Redis for persistent storage

import { createClient } from 'redis';

// Configuration
const CONFIG = {
  COUNT_START: new Date('2026-01-28'),
  COUNT_END: new Date('2026-02-13'),
  DOUBLE_SLOTS_START: new Date('2026-02-06'),
  SLOTS_BEFORE_FEB_6: 1,
  SLOTS_FROM_FEB_6: 2,
  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY || '',
  ADMIN_SECRET: process.env.ADMIN_SECRET || '',
};

const REDIS_KEY = 'az_youth_count_booked_slots';

// Create Redis client
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

// Verify reCAPTCHA v2 token
async function verifyRecaptcha(token) {
  if (!CONFIG.RECAPTCHA_SECRET_KEY) {
    console.log('No reCAPTCHA secret key configured, skipping verification');
    return true;
  }

  if (!token) {
    console.log('No reCAPTCHA token provided');
    return false;
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${CONFIG.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();
    // v2 just returns success: true/false (no score like v3)
    return data.success === true;
  } catch (error) {
    console.error('reCAPTCHA verification error:', error);
    return false;
  }
}

// Check if slot is valid
function isValidSlot(slotKey) {
  const regex = /^\d{4}-\d{2}-\d{2}-\d{2}:\d{2}$/;
  if (!regex.test(slotKey)) return false;

  const dateStr = slotKey.substring(0, 10);
  const date = new Date(dateStr);

  if (date < CONFIG.COUNT_START || date > CONFIG.COUNT_END) return false;

  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) return false;

  return true;
}

// Get max slots for a date
function getMaxSlots(dateStr) {
  const date = new Date(dateStr);
  return date >= CONFIG.DOUBLE_SLOTS_START ? CONFIG.SLOTS_FROM_FEB_6 : CONFIG.SLOTS_BEFORE_FEB_6;
}

// Get booked slots from Redis
async function getBookedSlots() {
  try {
    const client = await getRedisClient();
    const data = await client.get(REDIS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Redis read error:', error);
    return [];
  }
}

// Save booked slots to Redis
async function saveBookedSlots(slots) {
  try {
    const client = await getRedisClient();
    await client.set(REDIS_KEY, JSON.stringify(slots));
    return true;
  } catch (error) {
    console.error('Redis write error:', error);
    return false;
  }
}

// Main handler
export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Admin-Secret');

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

  // PUT - Admin: Set specific slots (replaces all existing)
  if (req.method === 'PUT') {
    const adminSecret = req.headers['x-admin-secret'];

    if (!CONFIG.ADMIN_SECRET || adminSecret !== CONFIG.ADMIN_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { slots } = req.body;

    if (!Array.isArray(slots)) {
      return res.status(400).json({ error: 'Slots must be an array' });
    }

    // Validate all slots
    for (const slot of slots) {
      if (!isValidSlot(slot)) {
        return res.status(400).json({ error: `Invalid slot: ${slot}` });
      }
    }

    await saveBookedSlots(slots);

    return res.status(200).json({
      success: true,
      message: 'Slots updated successfully',
      slots,
    });
  }

  // DELETE - Admin: Clear all slots
  if (req.method === 'DELETE') {
    const adminSecret = req.headers['x-admin-secret'];

    if (!CONFIG.ADMIN_SECRET || adminSecret !== CONFIG.ADMIN_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await saveBookedSlots([]);

    return res.status(200).json({
      success: true,
      message: 'All slots cleared',
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
