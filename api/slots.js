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
  ADMIN_SECRET: process.env.ADMIN_SECRET || 'LHz*xnrrP8*nq',
};

const REDIS_KEY = 'az_youth_count_booked_slots';
const REDIS_KEY_V2 = 'az_youth_count_bookings_v2'; // New key with full booking data

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

// Get booked slots from Redis (legacy - just slot keys)
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

// Save booked slots to Redis (legacy)
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

// Get full booking data from Redis (v2 with person info)
async function getBookingsV2() {
  try {
    const client = await getRedisClient();
    const data = await client.get(REDIS_KEY_V2);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Redis read error (v2):', error);
    return [];
  }
}

// Save full booking data to Redis (v2)
async function saveBookingsV2(bookings) {
  try {
    const client = await getRedisClient();
    await client.set(REDIS_KEY_V2, JSON.stringify(bookings));
    return true;
  } catch (error) {
    console.error('Redis write error (v2):', error);
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

    // Check if admin is requesting full booking data
    const adminSecret = req.headers['x-admin-secret'];
    if (adminSecret === CONFIG.ADMIN_SECRET) {
      const bookings = await getBookingsV2();
      return res.status(200).json({ bookedSlots, bookings });
    }

    return res.status(200).json({ bookedSlots });
  }

  // POST - Book a new slot
  if (req.method === 'POST') {
    const { slotKey, recaptchaToken, name, contactMethod, contactInfo } = req.body;

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

    // Book the slot (legacy)
    bookedSlots.push(slotKey);
    await saveBookedSlots(bookedSlots);

    // Also save to v2 with person info
    const bookings = await getBookingsV2();
    bookings.push({
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      slotKey,
      name: name || 'Unknown',
      contactMethod: contactMethod || 'unknown',
      contactInfo: contactInfo || '',
      bookedAt: new Date().toISOString(),
    });
    await saveBookingsV2(bookings);

    return res.status(200).json({
      success: true,
      message: 'Slot booked successfully',
      slotKey,
      spotsRemaining: maxSlots - currentBookings - 1,
    });
  }

  // PUT - Admin: Various admin operations
  if (req.method === 'PUT') {
    const adminSecret = req.headers['x-admin-secret'];

    if (!CONFIG.ADMIN_SECRET || adminSecret !== CONFIG.ADMIN_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { action, slots, bookings, slotKey, date, booking } = req.body;

    // Legacy: Set specific slots (replaces all existing)
    if (slots && Array.isArray(slots)) {
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

    // Set full bookings data (v2)
    if (action === 'setBookings' && Array.isArray(bookings)) {
      // Update legacy slots array to match
      const slotKeys = bookings.map(b => b.slotKey);
      await saveBookedSlots(slotKeys);
      await saveBookingsV2(bookings);

      return res.status(200).json({
        success: true,
        message: 'Bookings updated successfully',
        bookings,
      });
    }

    // Add a manual booking (admin-created)
    if (action === 'addBooking' && booking) {
      if (!booking.slotKey || !isValidSlot(booking.slotKey)) {
        return res.status(400).json({ error: 'Invalid slot key' });
      }

      // Check slot availability
      const bookedSlots = await getBookedSlots();
      const dateStr = booking.slotKey.substring(0, 10);
      const maxSlots = getMaxSlots(dateStr);
      const currentBookings = bookedSlots.filter(s => s === booking.slotKey).length;

      if (currentBookings >= maxSlots) {
        return res.status(400).json({ error: 'Slot is already fully booked' });
      }

      // Add to legacy
      bookedSlots.push(booking.slotKey);
      await saveBookedSlots(bookedSlots);

      // Add to v2
      const existingBookings = await getBookingsV2();
      existingBookings.push({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        slotKey: booking.slotKey,
        name: booking.name || 'Admin Added',
        contactMethod: booking.contactMethod || 'admin',
        contactInfo: booking.contactInfo || '',
        bookedAt: new Date().toISOString(),
      });
      await saveBookingsV2(existingBookings);

      return res.status(200).json({
        success: true,
        message: 'Booking added successfully',
      });
    }

    // Remove a specific booking by ID
    if (action === 'removeBooking' && slotKey) {
      const bookedSlots = await getBookedSlots();
      const bookingsV2 = await getBookingsV2();

      // Remove first occurrence from legacy
      const idx = bookedSlots.indexOf(slotKey);
      if (idx > -1) {
        bookedSlots.splice(idx, 1);
        await saveBookedSlots(bookedSlots);
      }

      // Remove from v2 (by slotKey, first match)
      const v2Idx = bookingsV2.findIndex(b => b.slotKey === slotKey);
      if (v2Idx > -1) {
        bookingsV2.splice(v2Idx, 1);
        await saveBookingsV2(bookingsV2);
      }

      return res.status(200).json({
        success: true,
        message: 'Booking removed successfully',
      });
    }

    // Clear all bookings for a specific date
    if (action === 'clearDate' && date) {
      const bookedSlots = await getBookedSlots();
      const bookingsV2 = await getBookingsV2();

      // Filter out bookings for this date
      const newSlots = bookedSlots.filter(s => !s.startsWith(date));
      const newBookings = bookingsV2.filter(b => !b.slotKey.startsWith(date));

      await saveBookedSlots(newSlots);
      await saveBookingsV2(newBookings);

      return res.status(200).json({
        success: true,
        message: `All bookings for ${date} cleared`,
      });
    }

    return res.status(400).json({ error: 'Invalid request' });
  }

  // DELETE - Admin: Clear all slots
  if (req.method === 'DELETE') {
    const adminSecret = req.headers['x-admin-secret'];

    if (!CONFIG.ADMIN_SECRET || adminSecret !== CONFIG.ADMIN_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await saveBookedSlots([]);
    await saveBookingsV2([]);

    return res.status(200).json({
      success: true,
      message: 'All slots cleared',
    });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
