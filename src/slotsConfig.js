// ============================================
// RESERVATION SLOTS CONFIGURATION
// ============================================
// 
// HOW TO MANAGE SLOTS:
// 
// When someone books a slot, add it to the BOOKED_SLOTS array below.
// Format: "YYYY-MM-DD-HH:MM" (24-hour time)
// 
// Example: To mark January 28 at 10:00 AM as booked:
// Add: "2026-01-28-10:00"
//
// Then push to GitHub and Vercel will auto-deploy.
// ============================================

// Add booked slots here as they get reserved
// Format: "YYYY-MM-DD-HH:MM"
export const BOOKED_SLOTS = [
  // Example entries (remove these and add real ones):
  // "2026-01-28-09:00",
  // "2026-01-28-09:30",
  // "2026-01-29-14:00",
];

// Discord server invite link for Discord option
export const DISCORD_INVITE_LINK = "https://discord.gg/your-invite-link";

// ============================================
// CONFIGURATION (Don't modify unless needed)
// ============================================

// Count period
export const COUNT_START = new Date('2026-01-28'); // First day of virtual sessions
export const COUNT_END = new Date('2026-02-13');
export const DOUBLE_SLOTS_START = new Date('2026-02-06'); // When we allow 2 per slot

// Time range (6 AM to 6 PM)
export const START_HOUR = 6;
export const END_HOUR = 18;
export const SLOT_DURATION_MINUTES = 30;

// Max reservations per slot
export const SLOTS_BEFORE_FEB_6 = 1;
export const SLOTS_FROM_FEB_6 = 2;

// Generate all available dates (weekdays only)
export function getAvailableDates() {
  const dates = [];
  let current = new Date(COUNT_START);
  
  while (current <= COUNT_END) {
    const dayOfWeek = current.getDay();
    // 0 = Sunday, 6 = Saturday - skip weekends
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      dates.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

// Generate time slots for a given date
export function getTimeSlotsForDate(date) {
  const slots = [];
  const dateStr = formatDateKey(date);
  const isDoubleSlotDay = date >= DOUBLE_SLOTS_START;
  const maxSlots = isDoubleSlotDay ? SLOTS_FROM_FEB_6 : SLOTS_BEFORE_FEB_6;
  
  for (let hour = START_HOUR; hour < END_HOUR; hour++) {
    for (let minute = 0; minute < 60; minute += SLOT_DURATION_MINUTES) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const slotKey = `${dateStr}-${timeStr}`;
      
      // Count how many times this slot is booked
      const bookedCount = BOOKED_SLOTS.filter(s => s === slotKey).length;
      const isAvailable = bookedCount < maxSlots;
      
      slots.push({
        time: timeStr,
        displayTime: formatTimeDisplay(hour, minute),
        slotKey,
        isAvailable,
        spotsLeft: maxSlots - bookedCount,
      });
    }
  }
  
  return slots;
}

// Helper: Format date as YYYY-MM-DD
export function formatDateKey(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: Format time for display (12-hour format)
function formatTimeDisplay(hour, minute) {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  const displayMinute = minute.toString().padStart(2, '0');
  return `${displayHour}:${displayMinute} ${period}`;
}

// Helper: Format date for display
export function formatDateDisplay(date) {
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
}
