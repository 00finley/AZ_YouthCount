# Arizona Youth Count 2026

A landing page for Arizona's statewide youth homelessness count (January 27 - February 13, 2026).

## Features

- 🗺️ **Interactive Map** - Leaflet-based map with calendar date picker and filterable magnet sites
- 📅 **Virtual Registration** - Multi-step booking form for phone/Zoom/Discord appointments
- 📊 **Google Sheets Integration** - Update site data via spreadsheet (no code changes needed)
- 📧 **Form Handling** - Partner inquiry forms via Formspree
- ✨ **Micro-interactions** - Smooth animations on desktop, optimized for mobile
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile

---

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd arizona-youth-count
npm install
```

### 2. Configure (see Configuration section below)

Edit `src/config.js` with your details.

### 3. Run Locally

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 4. Deploy to Vercel

Push to GitHub - Vercel will auto-deploy.

---

## Managing Virtual Appointment Slots

The virtual registration system uses a simple config file to track booked slots.

### To mark a slot as booked:

1. Open `src/slotsConfig.js`
2. Add the booked slot to the `BOOKED_SLOTS` array
3. Format: `"YYYY-MM-DD-HH:MM"` (24-hour time)
4. Push to GitHub

**Example:**
```javascript
export const BOOKED_SLOTS = [
  "2026-01-28-09:00",  // Jan 28 at 9:00 AM
  "2026-01-28-09:30",  // Jan 28 at 9:30 AM
  "2026-01-29-14:00",  // Jan 29 at 2:00 PM
];
```

### Slot capacity:
- **Jan 28 - Feb 5**: 1 person per 30-min slot
- **Feb 6 - Feb 13**: 2 people per 30-min slot

### Discord link:
Update `DISCORD_INVITE_LINK` in `src/slotsConfig.js` with your actual Discord server invite.

---

## Downloadable Resources

Place files in `public/downloads/`:
- `youth-count-flyer.pdf`
- `social-media-kit.zip`
- `host-guide.pdf`

They'll be available at `yoursite.com/downloads/filename.pdf`
