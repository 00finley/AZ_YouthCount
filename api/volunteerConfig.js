// Volunteer availability configuration for API
// Times are in 24-hour format, dates are in 2026

export const VOLUNTEERS = {
  kelly: {
    name: 'Kelly',
    methods: ['phone', 'zoom'],
    availability: {
      '2026-02-02': { start: 9, end: 11 },
      '2026-02-04': { start: 9, end: 13 },
      '2026-02-05': { start: 14, end: 14.5 },
      '2026-02-06': { start: 9, end: 14 },
      '2026-02-09': { start: 6, end: 18 },
      '2026-02-10': { start: 9, end: 10 },
      '2026-02-11': { start: 9, end: 11 },
      '2026-02-12': { start: 9, end: 12 },
      '2026-02-13': { start: 9, end: 11 },
    },
  },
  joyce: {
    name: 'Joyce',
    methods: ['phone', 'zoom'],
    availability: {
      '2026-02-02': { start: 8, end: 10 },
      '2026-02-04': { start: 9, end: 13 },
      '2026-02-06': { start: 9, end: 13 },
      '2026-02-09': { start: 6, end: 18 },
      '2026-02-10': { start: 6, end: 18 },
      '2026-02-11': { start: 8, end: 10 },
      '2026-02-12': { start: 6, end: 18 },
      '2026-02-13': { start: 9, end: 13 },
    },
  },
  stephen: {
    name: 'Stephen',
    methods: ['phone', 'zoom'],
    availability: {
      '2026-02-02': { start: 12, end: 15 },
      '2026-02-03': { start: 10, end: 12 },
      '2026-02-04': { start: 13, end: 14 },
      '2026-02-05': { start: 10, end: 12 },
      '2026-02-09': { start: 11, end: 12 },
      '2026-02-10': { start: 10, end: 12 },
      '2026-02-12': { start: 6, end: 18 },
    },
  },
  kyle: {
    name: 'Kyle',
    methods: ['phone', 'zoom'],
    availability: {
      '2026-01-29': { start: 12, end: 14 },
      '2026-01-30': { start: 15, end: 16 },
      '2026-02-02': { start: 15, end: 16 },
      '2026-02-03': { start: 13, end: 14 },
      '2026-02-04': { start: 15, end: 16 },
      '2026-02-05': { start: 11, end: 12 },
      '2026-02-09': { start: 13, end: 14 },
      '2026-02-10': { start: 11.5, end: 12.5 },
      '2026-02-11': { start: 12, end: 14 },
      '2026-02-13': { start: 13, end: 14 },
    },
  },
  matt: {
    name: 'Matt',
    methods: ['phone', 'zoom'],
    availability: {
      '2026-01-28': { start: 6, end: 9 },
      '2026-01-29': { start: 6, end: 9 },
      '2026-01-30': { start: 6, end: 9 },
      '2026-01-31': { start: 6, end: 9 },
      '2026-02-02': { start: 6, end: 9 },
      '2026-02-03': { start: 6, end: 9 },
      '2026-02-04': { start: 6, end: 9 },
      '2026-02-05': { start: 6, end: 9 },
      '2026-02-06': { start: 6, end: 9 },
      '2026-02-09': { start: 6, end: 9 },
      '2026-02-10': { start: 6, end: 9 },
      '2026-02-11': { start: 6, end: 9 },
      '2026-02-12': { start: 6, end: 9 },
      '2026-02-13': { start: 6, end: 9 },
    },
  },
  casey: {
    name: 'Casey',
    methods: ['phone', 'zoom'],
    availability: {
      '2026-01-28': { start: 9, end: 17 },
      '2026-01-29': { start: 9, end: 17 },
      '2026-01-30': { start: 9, end: 17 },
      '2026-01-31': { start: 9, end: 17 },
      '2026-02-02': { start: 9, end: 17 },
      '2026-02-03': { start: 9, end: 17 },
      '2026-02-04': { start: 9, end: 17 },
      '2026-02-05': { start: 9, end: 17 },
      '2026-02-06': { start: 9, end: 17 },
      '2026-02-09': { start: 9, end: 17 },
      '2026-02-10': { start: 9, end: 17 },
      '2026-02-11': { start: 9, end: 17 },
      '2026-02-12': { start: 9, end: 17 },
      '2026-02-13': { start: 9, end: 17 },
    },
  },
  corinn: {
    name: 'Corinn',
    methods: ['phone', 'zoom'],
    availability: {
      '2026-01-28': { start: 9, end: 18 },
      '2026-01-29': { start: 9, end: 18 },
      '2026-01-30': { start: 9, end: 18 },
      '2026-01-31': { start: 9, end: 18 },
      '2026-02-02': { start: 9, end: 18 },
      '2026-02-03': { start: 9, end: 18 },
      '2026-02-04': { start: 9, end: 18 },
      '2026-02-05': { start: 9, end: 18 },
      '2026-02-06': { start: 9, end: 18 },
      '2026-02-09': { start: 9, end: 18 },
      '2026-02-10': { start: 9, end: 18 },
      '2026-02-11': { start: 9, end: 18 },
      '2026-02-12': { start: 9, end: 18 },
      '2026-02-13': { start: 9, end: 18 },
    },
  },
};

// Check if a volunteer is available at a specific date/time
export function isVolunteerAvailable(volunteerId, dateStr, hour) {
  const volunteer = VOLUNTEERS[volunteerId];
  if (!volunteer) return false;

  const dayAvailability = volunteer.availability[dateStr];
  if (!dayAvailability) return false;

  return hour >= dayAvailability.start && hour < dayAvailability.end;
}

// Get all available volunteers for a specific date/time and contact method
export function getAvailableVolunteers(dateStr, hour, contactMethod) {
  const available = [];

  for (const [id, volunteer] of Object.entries(VOLUNTEERS)) {
    if (!volunteer.methods.includes(contactMethod)) continue;
    if (isVolunteerAvailable(id, dateStr, hour)) {
      available.push({ id, ...volunteer });
    }
  }

  return available;
}

// Check if any volunteer is available for a slot (phone or zoom)
export function isSlotAvailable(dateStr, hour) {
  for (const [id] of Object.entries(VOLUNTEERS)) {
    if (isVolunteerAvailable(id, dateStr, hour)) {
      return true;
    }
  }
  return false;
}

// Select the best volunteer for a booking (equitable distribution)
export function selectVolunteer(dateStr, hour, contactMethod, existingBookings) {
  const available = getAvailableVolunteers(dateStr, hour, contactMethod);
  if (available.length === 0) return null;

  // Count current assignments for each volunteer
  const assignmentCounts = {};
  for (const v of available) {
    assignmentCounts[v.id] = 0;
  }

  for (const booking of existingBookings) {
    if (booking.assignedVolunteer && assignmentCounts[booking.assignedVolunteer] !== undefined) {
      assignmentCounts[booking.assignedVolunteer]++;
    }
  }

  // Select the volunteer with the fewest assignments
  let minCount = Infinity;
  let selectedVolunteer = null;

  for (const v of available) {
    if (assignmentCounts[v.id] < minCount) {
      minCount = assignmentCounts[v.id];
      selectedVolunteer = v;
    }
  }

  return selectedVolunteer;
}

// Get volunteer summary for admin
export function getVolunteerSummary() {
  return Object.entries(VOLUNTEERS).map(([id, volunteer]) => ({
    id,
    name: volunteer.name,
    methods: volunteer.methods,
    availability: Object.entries(volunteer.availability).map(([date, times]) => ({
      date,
      start: times.start,
      end: times.end,
    })).sort((a, b) => a.date.localeCompare(b.date)),
  }));
}
