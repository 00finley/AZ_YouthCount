import { createClient } from 'redis';

// Youth volunteer portal password (same for all users)
const YOUTH_VOLUNTEER_PASSWORD = process.env.YOUTH_VOLUNTEER_PASSWORD || 'YouthBoard2026!';

// Valid users - username: { name, isAdmin }
const VALID_USERS = {
  mfinley: { name: 'M. Finley', isAdmin: true },
  dkenney: { name: 'D. Kenney', isAdmin: false },
  svaldez: { name: 'S. Valdez', isAdmin: false },
  jgarcia: { name: 'J. Garcia', isAdmin: false },
  jfernandez: { name: 'J. Fernandez', isAdmin: false },
  cyahuaca: { name: 'C. Yahuaca', isAdmin: false },
  jlopez: { name: 'J. Lopez', isAdmin: false },
};

// Redis keys
const YOUTH_VOLUNTEERS_KEY = 'youth_volunteers'; // Hash: volunteerId -> { name, availability: [...] }
const BOOKINGS_KEY = 'az_youth_count_bookings_v2'; // Same key as slots API

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

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Youth-Secret');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Check authentication - requires both username and password
  const providedPassword = req.headers['x-youth-secret'];
  const providedUsername = req.headers['x-youth-username']?.toLowerCase();
  const isValidUser = providedUsername && VALID_USERS[providedUsername];
  const isAuthenticated = providedPassword === YOUTH_VOLUNTEER_PASSWORD && isValidUser;
  const currentUser = isValidUser ? {
    username: providedUsername,
    ...VALID_USERS[providedUsername]
  } : null;

  if (req.method === 'GET') {
    try {
      const client = await getRedisClient();

      // Get all youth volunteers
      const volunteersData = await client.hGetAll(YOUTH_VOLUNTEERS_KEY) || {};

      // Get all bookings to find Discord ones
      const bookingsRaw = await client.get(BOOKINGS_KEY);
      const bookingsData = bookingsRaw ? JSON.parse(bookingsRaw) : [];
      const discordBookings = Array.isArray(bookingsData) ? bookingsData.filter(b => b.contactMethod === 'discord') : [];

      // If authenticated, return full data; otherwise just availability overview
      if (isAuthenticated) {
        // Parse volunteer data
        const volunteerList = Object.entries(volunteersData).map(([id, data]) => {
          const parsed = typeof data === 'string' ? JSON.parse(data) : data;
          // Get bookings assigned to this volunteer
          const assignedBookings = discordBookings.filter(b => b.assignedVolunteer === id);
          return {
            id,
            ...parsed,
            assignedBookings,
          };
        });

        // Auto-create volunteer record if it doesn't exist for this user
        const userVolunteer = volunteerList.find(v => v.id === providedUsername);
        if (!userVolunteer) {
          // Create volunteer record for new user
          const volunteerData = {
            name: currentUser.name,
            availability: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await client.hSet(YOUTH_VOLUNTEERS_KEY, providedUsername, JSON.stringify(volunteerData));
          volunteerList.push({
            id: providedUsername,
            ...volunteerData,
            assignedBookings: [],
          });
        }

        return res.status(200).json({
          authenticated: true,
          user: currentUser,
          volunteers: volunteerList,
          allDiscordBookings: discordBookings,
        });
      } else {
        // Not authenticated - return error message
        if (providedPassword && !isValidUser) {
          return res.status(401).json({
            authenticated: false,
            error: 'Invalid username',
          });
        }
        if (providedUsername && providedPassword !== YOUTH_VOLUNTEER_PASSWORD) {
          return res.status(401).json({
            authenticated: false,
            error: 'Invalid password',
          });
        }
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

    const { action, volunteerId, slotKey } = req.body;

    // Users can only modify their own data (unless admin)
    if (volunteerId && volunteerId !== providedUsername && !currentUser.isAdmin) {
      return res.status(403).json({ error: 'You can only modify your own availability' });
    }

    // Use the logged-in username if no volunteerId provided
    const targetVolunteerId = volunteerId || providedUsername;

    try {
      const client = await getRedisClient();

      if (action === 'addSlot') {
        // Add a single availability slot
        if (!slotKey) {
          return res.status(400).json({ error: 'Slot key required' });
        }

        const existingData = await client.hGet(YOUTH_VOLUNTEERS_KEY, targetVolunteerId);
        if (!existingData) {
          // Auto-create if not exists
          const volunteerData = {
            name: VALID_USERS[targetVolunteerId]?.name || targetVolunteerId,
            availability: [slotKey],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await client.hSet(YOUTH_VOLUNTEERS_KEY, targetVolunteerId, JSON.stringify(volunteerData));
          return res.status(200).json({ success: true, volunteer: { id: targetVolunteerId, ...volunteerData } });
        }

        const volunteer = typeof existingData === 'string' ? JSON.parse(existingData) : existingData;

        // Add slot if not already present
        if (!volunteer.availability.includes(slotKey)) {
          volunteer.availability.push(slotKey);
          volunteer.updatedAt = new Date().toISOString();
          await client.hSet(YOUTH_VOLUNTEERS_KEY, targetVolunteerId, JSON.stringify(volunteer));
        }

        return res.status(200).json({ success: true, volunteer: { id: targetVolunteerId, ...volunteer } });
      }

      if (action === 'removeSlot') {
        // Remove a single availability slot
        if (!slotKey) {
          return res.status(400).json({ error: 'Slot key required' });
        }

        const existingData = await client.hGet(YOUTH_VOLUNTEERS_KEY, targetVolunteerId);
        if (!existingData) {
          return res.status(404).json({ error: 'Volunteer not found' });
        }

        const volunteer = typeof existingData === 'string' ? JSON.parse(existingData) : existingData;

        // Remove slot
        volunteer.availability = volunteer.availability.filter(s => s !== slotKey);
        volunteer.updatedAt = new Date().toISOString();
        await client.hSet(YOUTH_VOLUNTEERS_KEY, targetVolunteerId, JSON.stringify(volunteer));

        return res.status(200).json({ success: true, volunteer: { id: targetVolunteerId, ...volunteer } });
      }

      if (action === 'markComplete') {
        // Mark a booking as completed (or uncomplete)
        const { bookingId, completed } = req.body;

        if (!bookingId) {
          return res.status(400).json({ error: 'Booking ID required' });
        }

        // Get all bookings
        const bookingsRaw = await client.get(BOOKINGS_KEY);
        const bookings = bookingsRaw ? JSON.parse(bookingsRaw) : [];

        // Find the booking
        const bookingIndex = bookings.findIndex(b => b.id === bookingId);
        if (bookingIndex === -1) {
          return res.status(404).json({ error: 'Booking not found' });
        }

        const booking = bookings[bookingIndex];

        // Only the assigned volunteer or admin can mark as complete
        if (booking.assignedVolunteer !== providedUsername && !currentUser.isAdmin) {
          return res.status(403).json({ error: 'You can only mark your own bookings as complete' });
        }

        // Update the booking
        bookings[bookingIndex] = {
          ...booking,
          completed: completed !== false,
          completedAt: completed !== false ? new Date().toISOString() : null,
          completedBy: completed !== false ? providedUsername : null,
        };

        await client.set(BOOKINGS_KEY, JSON.stringify(bookings));

        return res.status(200).json({ success: true, booking: bookings[bookingIndex] });
      }

      return res.status(400).json({ error: 'Invalid action' });
    } catch (error) {
      console.error('Error updating youth volunteer:', error);
      return res.status(500).json({ error: 'Failed to update data' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
