// Vercel Serverless Function for managing booking slots
// Uses Redis for persistent storage

import { createClient } from 'redis';
import {
  VOLUNTEERS,
  isVolunteerAvailable,
  getAvailableVolunteers,
  isSlotAvailable,
  selectVolunteer,
  getVolunteerSummary,
} from './volunteerConfig.js';

// Configuration
const CONFIG = {
  COUNT_START: new Date('2026-01-28'),
  COUNT_END: new Date('2026-02-13'),
  DOUBLE_SLOTS_START: new Date('2026-02-06'),
  SLOTS_BEFORE_FEB_6: 1,
  SLOTS_FROM_FEB_6: 2,
  RECAPTCHA_SECRET_KEY: process.env.RECAPTCHA_SECRET_KEY || '',
  RECAPTCHA_SECRET_KEY_V3: process.env.RECAPTCHA_SECRET_KEY_v3 || '',
  ADMIN_SECRET: process.env.ADMIN_SECRET || 'LHz*xnrrP8*nq',
  // Allowed origins for registration (prevents direct API attacks)
  ALLOWED_ORIGINS: ['https://azyouthcount.org', 'https://www.azyouthcount.org', 'http://localhost'],
  // Minimum reCAPTCHA v3 score (0.0-1.0, higher = more likely human)
  MIN_RECAPTCHA_V3_SCORE: 0.3,
};

const REDIS_KEY = 'az_youth_count_booked_slots';
const REDIS_KEY_V2 = 'az_youth_count_bookings_v2'; // New key with full booking data
const YOUTH_VOLUNTEERS_KEY = 'youth_volunteers'; // Youth board Discord volunteers

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
  console.log('[reCAPTCHA] Starting verification...');

  if (!CONFIG.RECAPTCHA_SECRET_KEY) {
    console.error('[reCAPTCHA] CRITICAL: RECAPTCHA_SECRET_KEY not configured - rejecting');
    return false;
  }
  console.log('[reCAPTCHA] Secret key is configured');

  if (!token) {
    console.log('[reCAPTCHA] No token provided - rejecting');
    return false;
  }
  console.log('[reCAPTCHA] Token received, length:', token.length);

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${CONFIG.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();
    console.log('[reCAPTCHA] Google response:', JSON.stringify(data));

    if (data.success === true) {
      console.log('[reCAPTCHA] Verification PASSED');
      return true;
    } else {
      console.log('[reCAPTCHA] Verification FAILED - error codes:', data['error-codes']);
      return false;
    }
  } catch (error) {
    console.error('[reCAPTCHA] Network/fetch error:', error.message);
    return false;
  }
}

// Verify reCAPTCHA v3 token (returns score or null on failure)
async function verifyRecaptchaV3(token) {
  console.log('[reCAPTCHA v3] Starting verification...');

  if (!CONFIG.RECAPTCHA_SECRET_KEY_V3) {
    console.log('[reCAPTCHA v3] No v3 secret key configured - skipping v3 check');
    return null; // v3 is optional enhancement
  }

  if (!token) {
    console.log('[reCAPTCHA v3] No token provided');
    return null;
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `secret=${CONFIG.RECAPTCHA_SECRET_KEY_V3}&response=${token}`,
    });

    const data = await response.json();
    console.log('[reCAPTCHA v3] Google response:', JSON.stringify(data));

    if (data.success === true) {
      console.log('[reCAPTCHA v3] Score:', data.score, 'Action:', data.action);
      return data.score;
    } else {
      console.log('[reCAPTCHA v3] Verification FAILED - error codes:', data['error-codes']);
      return null;
    }
  } catch (error) {
    console.error('[reCAPTCHA v3] Network/fetch error:', error.message);
    return null;
  }
}

// Check if request origin is allowed
function isAllowedOrigin(req) {
  const origin = req.headers.origin || '';
  const referer = req.headers.referer || '';

  // Check origin header
  for (const allowed of CONFIG.ALLOWED_ORIGINS) {
    if (origin.startsWith(allowed) || referer.startsWith(allowed)) {
      console.log('[Security] Origin check PASSED:', origin || referer);
      return true;
    }
  }

  console.log('[Security] Origin check FAILED. Origin:', origin, 'Referer:', referer);
  return false;
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

// Generate available slots based on volunteer availability
function generateAvailableSlots(existingBookings, youthVolunteers = []) {
  const slots = {};
  const START_HOUR = 6;
  const END_HOUR = 18;

  // Generate dates from COUNT_START to COUNT_END
  let current = new Date(CONFIG.COUNT_START);
  while (current <= CONFIG.COUNT_END) {
    const dayOfWeek = current.getDay();
    // Skip weekends
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const year = current.getFullYear();
      const month = (current.getMonth() + 1).toString().padStart(2, '0');
      const day = current.getDate().toString().padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      slots[dateStr] = [];

      // Generate time slots
      for (let hour = START_HOUR; hour < END_HOUR; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const hourDecimal = hour + minute / 60;
          const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const slotKey = `${dateStr}-${timeStr}`;

          // Check if any volunteer is available for this slot (phone/zoom)
          const hasVolunteer = isSlotAvailable(dateStr, hourDecimal);

          // Get available volunteers for this slot (for phone/zoom)
          const availableVolunteers = [];
          for (const [id, volunteer] of Object.entries(VOLUNTEERS)) {
            if (isVolunteerAvailable(id, dateStr, hourDecimal)) {
              // Check if this volunteer is already booked at this time
              const volunteerBooked = existingBookings.some(
                b => b.slotKey === slotKey && b.assignedVolunteer === id
              );
              if (!volunteerBooked) {
                availableVolunteers.push(id);
              }
            }
          }

          // Check for Discord availability (youth volunteers)
          const availableYouthVolunteers = getAvailableYouthVolunteers(youthVolunteers, slotKey, existingBookings);
          const hasDiscordVolunteer = availableYouthVolunteers.length > 0;

          slots[dateStr].push({
            time: timeStr,
            slotKey,
            hasVolunteer,
            availableVolunteerCount: availableVolunteers.length,
            isAvailable: availableVolunteers.length > 0,
            // Discord availability
            hasDiscordVolunteer,
            availableDiscordVolunteerCount: availableYouthVolunteers.length,
            isDiscordAvailable: hasDiscordVolunteer,
          });
        }
      }
    }
    current.setDate(current.getDate() + 1);
  }

  return slots;
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

// Get youth volunteer availability for Discord calls
async function getYouthVolunteers() {
  try {
    const client = await getRedisClient();
    const data = await client.hGetAll(YOUTH_VOLUNTEERS_KEY);
    if (!data || Object.keys(data).length === 0) return [];

    return Object.entries(data).map(([id, jsonStr]) => {
      const parsed = typeof jsonStr === 'string' ? JSON.parse(jsonStr) : jsonStr;
      return { id, ...parsed };
    });
  } catch (error) {
    console.error('Error fetching youth volunteers:', error);
    return [];
  }
}

// Check if a youth volunteer is available for a specific slot
function isYouthVolunteerAvailableForSlot(volunteer, slotKey) {
  return volunteer.availability?.includes(slotKey) || false;
}

// Get available youth volunteers for a Discord slot
function getAvailableYouthVolunteers(youthVolunteers, slotKey, existingBookings) {
  return youthVolunteers.filter(v => {
    // Check if volunteer has this slot in their availability
    if (!isYouthVolunteerAvailableForSlot(v, slotKey)) return false;
    // Check if already booked
    const alreadyBooked = existingBookings.some(
      b => b.slotKey === slotKey && b.assignedVolunteer === v.id
    );
    return !alreadyBooked;
  });
}

// Select youth volunteer equitably for Discord booking
function selectYouthVolunteer(youthVolunteers, slotKey, existingBookings) {
  const available = getAvailableYouthVolunteers(youthVolunteers, slotKey, existingBookings);
  if (available.length === 0) return null;

  // Count current assignments
  const counts = {};
  for (const v of available) {
    counts[v.id] = existingBookings.filter(b => b.assignedVolunteer === v.id).length;
  }

  // Select volunteer with fewest assignments
  let minCount = Infinity;
  let selected = null;
  for (const v of available) {
    if (counts[v.id] < minCount) {
      minCount = counts[v.id];
      selected = v;
    }
  }

  return selected;
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

  // GET - Return all booked slots and volunteer availability
  if (req.method === 'GET') {
    const bookedSlots = await getBookedSlots();
    const bookings = await getBookingsV2();
    const youthVolunteers = await getYouthVolunteers();

    // Generate available slots based on volunteer availability (including Discord)
    const availableSlots = generateAvailableSlots(bookings, youthVolunteers);

    // Check if admin is requesting full data
    const adminSecret = req.headers['x-admin-secret'];
    if (adminSecret === CONFIG.ADMIN_SECRET) {
      const volunteers = getVolunteerSummary();
      return res.status(200).json({ bookedSlots, bookings, availableSlots, volunteers, youthVolunteers });
    }

    return res.status(200).json({ bookedSlots, availableSlots });
  }

  // POST - Book a new slot
  if (req.method === 'POST') {
    // Security check 1: Origin header
    if (!isAllowedOrigin(req)) {
      console.log('[Security] Blocked request from unauthorized origin');
      return res.status(403).json({ error: 'Forbidden - Origin not allowed' });
    }

    const { slotKey, recaptchaToken, recaptchaV3Token, name, contactMethod, contactInfo, reminderEmail } = req.body;

    if (!slotKey) {
      return res.status(400).json({ error: 'Slot key is required' });
    }

    if (!isValidSlot(slotKey)) {
      return res.status(400).json({ error: 'Invalid slot key' });
    }

    if (!contactMethod) {
      return res.status(400).json({ error: 'Contact method is required' });
    }

    // Security check 2: Verify reCAPTCHA v2 (required)
    const isValidRecaptcha = await verifyRecaptcha(recaptchaToken);
    if (!isValidRecaptcha) {
      return res.status(400).json({ error: 'reCAPTCHA verification failed' });
    }

    // Security check 3: Verify reCAPTCHA v3 if provided (additional layer)
    if (recaptchaV3Token) {
      const v3Score = await verifyRecaptchaV3(recaptchaV3Token);
      if (v3Score !== null && v3Score < CONFIG.MIN_RECAPTCHA_V3_SCORE) {
        console.log('[Security] Blocked - v3 score too low:', v3Score);
        return res.status(400).json({ error: 'Security verification failed - please try again' });
      }
    }

    // Parse slot key for date and time
    const dateStr = slotKey.substring(0, 10);
    const timeStr = slotKey.substring(11);
    const [hours, minutes] = timeStr.split(':').map(Number);
    const hourDecimal = hours + minutes / 60;

    // Get existing bookings
    const bookings = await getBookingsV2();

    // For phone/zoom, we need to assign a volunteer
    let assignedVolunteer = null;
    let assignedVolunteerName = null;

    if (contactMethod === 'phone' || contactMethod === 'zoom') {
      // Find available volunteers for this slot
      const availableVolunteers = getAvailableVolunteers(dateStr, hourDecimal, contactMethod);

      // Filter out volunteers already booked at this time
      const unbookedVolunteers = availableVolunteers.filter(v => {
        return !bookings.some(b => b.slotKey === slotKey && b.assignedVolunteer === v.id);
      });

      if (unbookedVolunteers.length === 0) {
        return res.status(400).json({ error: 'No volunteers available for this time slot' });
      }

      // Select volunteer equitably
      const selected = selectVolunteer(dateStr, hourDecimal, contactMethod, bookings);
      if (selected && unbookedVolunteers.some(v => v.id === selected.id)) {
        assignedVolunteer = selected.id;
        assignedVolunteerName = selected.name;
      } else {
        // Fallback to first available
        assignedVolunteer = unbookedVolunteers[0].id;
        assignedVolunteerName = unbookedVolunteers[0].name;
      }
    } else if (contactMethod === 'discord') {
      // Discord bookings - assign youth volunteer if available
      const youthVolunteers = await getYouthVolunteers();
      const selected = selectYouthVolunteer(youthVolunteers, slotKey, bookings);

      if (!selected) {
        return res.status(400).json({ error: 'No youth volunteers available for this Discord slot' });
      }

      assignedVolunteer = selected.id;
      assignedVolunteerName = selected.name;
    }

    // Book the slot (legacy)
    const bookedSlots = await getBookedSlots();
    bookedSlots.push(slotKey);
    await saveBookedSlots(bookedSlots);

    // Save to v2 with person info and volunteer assignment
    const newBooking = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      slotKey,
      name: name || 'Unknown',
      contactMethod: contactMethod || 'unknown',
      contactInfo: contactInfo || '',
      reminderEmail: reminderEmail || null, // Optional email for reminders (phone/discord users)
      assignedVolunteer,
      assignedVolunteerName,
      bookedAt: new Date().toISOString(),
    };
    bookings.push(newBooking);
    await saveBookingsV2(bookings);

    return res.status(200).json({
      success: true,
      message: 'Slot booked successfully',
      slotKey,
      assignedVolunteer: assignedVolunteerName,
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

      // Parse slot key for date and time
      const dateStr = booking.slotKey.substring(0, 10);
      const timeStr = booking.slotKey.substring(11);
      const [hours, minutes] = timeStr.split(':').map(Number);
      const hourDecimal = hours + minutes / 60;

      const existingBookings = await getBookingsV2();
      const contactMethod = booking.contactMethod || 'phone';

      // Assign volunteer for phone/zoom
      let assignedVolunteer = booking.assignedVolunteer || null;
      let assignedVolunteerName = booking.assignedVolunteerName || null;

      if (!assignedVolunteer && (contactMethod === 'phone' || contactMethod === 'zoom')) {
        const availableVolunteers = getAvailableVolunteers(dateStr, hourDecimal, contactMethod);
        const unbookedVolunteers = availableVolunteers.filter(v => {
          return !existingBookings.some(b => b.slotKey === booking.slotKey && b.assignedVolunteer === v.id);
        });

        if (unbookedVolunteers.length === 0) {
          return res.status(400).json({ error: 'No volunteers available for this time slot' });
        }

        const selected = selectVolunteer(dateStr, hourDecimal, contactMethod, existingBookings);
        if (selected && unbookedVolunteers.some(v => v.id === selected.id)) {
          assignedVolunteer = selected.id;
          assignedVolunteerName = selected.name;
        } else {
          assignedVolunteer = unbookedVolunteers[0].id;
          assignedVolunteerName = unbookedVolunteers[0].name;
        }
      }

      // Add to legacy
      const bookedSlots = await getBookedSlots();
      bookedSlots.push(booking.slotKey);
      await saveBookedSlots(bookedSlots);

      // Add to v2
      existingBookings.push({
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        slotKey: booking.slotKey,
        name: booking.name || 'Admin Added',
        contactMethod,
        contactInfo: booking.contactInfo || '',
        assignedVolunteer,
        assignedVolunteerName,
        bookedAt: new Date().toISOString(),
      });
      await saveBookingsV2(existingBookings);

      return res.status(200).json({
        success: true,
        message: 'Booking added successfully',
        assignedVolunteer: assignedVolunteerName,
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
