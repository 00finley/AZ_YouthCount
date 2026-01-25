import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

// Youth volunteer portal password (different from admin)
const YOUTH_VOLUNTEER_PASSWORD = process.env.YOUTH_VOLUNTEER_PASSWORD || 'YouthBoard2026!';

// Redis keys
const YOUTH_VOLUNTEERS_KEY = 'youth_volunteers'; // Hash: volunteerId -> { name, availability: [...] }
const DISCORD_BOOKINGS_KEY = 'discord_bookings'; // List of discord bookings

// Count period
const COUNT_START = new Date('2026-01-28');
const COUNT_END = new Date('2026-02-13');

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Youth-Secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check authentication
  const providedPassword = req.headers['x-youth-secret'];
  const isAuthenticated = providedPassword === YOUTH_VOLUNTEER_PASSWORD;

  if (req.method === 'GET') {
    try {
      // Get all youth volunteers
      const volunteers = await redis.hgetall(YOUTH_VOLUNTEERS_KEY) || {};

      // Get all bookings to find Discord ones
      const bookingsData = await redis.get('bookings') || [];
      const discordBookings = bookingsData.filter(b => b.contactMethod === 'discord');

      // If authenticated, return full data; otherwise just availability overview
      if (isAuthenticated) {
        // Parse volunteer data
        const volunteerList = Object.entries(volunteers).map(([id, data]) => {
          const parsed = typeof data === 'string' ? JSON.parse(data) : data;
          // Get bookings assigned to this volunteer
          const assignedBookings = discordBookings.filter(b => b.assignedVolunteer === id);
          return {
            id,
            ...parsed,
            assignedBookings,
          };
        });

        return res.status(200).json({
          authenticated: true,
          volunteers: volunteerList,
          allDiscordBookings: discordBookings,
        });
      } else {
        // Not authenticated - return limited info for login page
        return res.status(200).json({
          authenticated: false,
          message: 'Authentication required',
        });
      }
    } catch (error) {
      console.error('Error fetching youth volunteers:', error);
      return res.status(500).json({ error: 'Failed to fetch data' });
    }
  }

  if (req.method === 'POST') {
    // Must be authenticated
    if (!isAuthenticated) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { action, volunteerId, name, availability, slotKey } = req.body;

    try {
      if (action === 'register' || action === 'updateAvailability') {
        // Register new volunteer or update availability
        if (!volunteerId || !name) {
          return res.status(400).json({ error: 'Volunteer ID and name required' });
        }

        // Get existing data
        const existingData = await redis.hget(YOUTH_VOLUNTEERS_KEY, volunteerId);
        const existing = existingData ? (typeof existingData === 'string' ? JSON.parse(existingData) : existingData) : null;

        const volunteerData = {
          name,
          availability: availability || existing?.availability || [],
          createdAt: existing?.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await redis.hset(YOUTH_VOLUNTEERS_KEY, { [volunteerId]: JSON.stringify(volunteerData) });

        return res.status(200).json({ success: true, volunteer: { id: volunteerId, ...volunteerData } });
      }

      if (action === 'addSlot') {
        // Add a single availability slot
        if (!volunteerId || !slotKey) {
          return res.status(400).json({ error: 'Volunteer ID and slot key required' });
        }

        const existingData = await redis.hget(YOUTH_VOLUNTEERS_KEY, volunteerId);
        if (!existingData) {
          return res.status(404).json({ error: 'Volunteer not found' });
        }

        const volunteer = typeof existingData === 'string' ? JSON.parse(existingData) : existingData;

        // Add slot if not already present
        if (!volunteer.availability.includes(slotKey)) {
          volunteer.availability.push(slotKey);
          volunteer.updatedAt = new Date().toISOString();
          await redis.hset(YOUTH_VOLUNTEERS_KEY, { [volunteerId]: JSON.stringify(volunteer) });
        }

        return res.status(200).json({ success: true, volunteer: { id: volunteerId, ...volunteer } });
      }

      if (action === 'removeSlot') {
        // Remove a single availability slot
        if (!volunteerId || !slotKey) {
          return res.status(400).json({ error: 'Volunteer ID and slot key required' });
        }

        const existingData = await redis.hget(YOUTH_VOLUNTEERS_KEY, volunteerId);
        if (!existingData) {
          return res.status(404).json({ error: 'Volunteer not found' });
        }

        const volunteer = typeof existingData === 'string' ? JSON.parse(existingData) : existingData;

        // Remove slot
        volunteer.availability = volunteer.availability.filter(s => s !== slotKey);
        volunteer.updatedAt = new Date().toISOString();
        await redis.hset(YOUTH_VOLUNTEERS_KEY, { [volunteerId]: JSON.stringify(volunteer) });

        return res.status(200).json({ success: true, volunteer: { id: volunteerId, ...volunteer } });
      }

      return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
      console.error('Error updating youth volunteer:', error);
      return res.status(500).json({ error: 'Failed to update data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
