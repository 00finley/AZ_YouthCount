# Arizona Youth Count 2026

A landing page for Arizona's statewide youth homelessness count (January 27 - February 13, 2026).

## Features

- 🗺️ **Interactive Map** - Leaflet-based map with filterable magnet site locations
- 📊 **Google Sheets Integration** - Update site data via spreadsheet (no code changes needed)
- 📧 **Form Handling** - Partner inquiry forms via Formspree
- ✨ **Micro-interactions** - Smooth animations powered by Framer Motion
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- ♿ **Accessible** - Semantic HTML and keyboard navigation

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

```bash
# Install Vercel CLI (if needed)
npm i -g vercel

# Deploy
vercel
```

Or connect your GitHub repo to Vercel for automatic deployments.

---

## Configuration

All configuration is in `src/config.js`:

```javascript
export const CONFIG = {
  // Google Sheets (see setup below)
  GOOGLE_SHEETS_CSV_URL: 'https://docs.google.com/spreadsheets/d/.../pub?output=csv',
  
  // Formspree for forms
  FORMSPREE_ENDPOINT: 'https://formspree.io/f/xxxxxxxx',
  
  // Contact info
  CONTACT_EMAIL: 'youthcount@azmag.gov',
  CONTACT_PHONE: '(602) 254-6300',
  
  // Virtual session booking
  BOOKING_URL: 'https://calendly.com/your-link',
  
  // Social media
  SOCIAL: {
    facebook: 'https://facebook.com/...',
    twitter: 'https://twitter.com/...',
    instagram: 'https://instagram.com/...',
  },
};
```

---

## Google Sheets Setup (for Site Data)

This is what makes updates easy - you just edit a spreadsheet!

### Step 1: Create Your Spreadsheet

Create a new Google Sheet with these column headers (Row 1):

| Site Name | Address | City | Zip | Latitude | Longitude | Hours | Days Open | Description | Status | Amenities |
|-----------|---------|------|-----|----------|-----------|-------|-----------|-------------|--------|-----------|
| Phoenix Public Library | 1221 N Central Ave | Phoenix | 85004 | 33.4628 | -112.0740 | 9:00 AM - 5:00 PM | Mon,Tue,Wed,Thu,Fri | Main branch... | open | WiFi,Charging |

**Column Details:**
- **Site Name**: Display name of the location
- **Address**: Street address
- **City**: City name
- **Zip**: ZIP code
- **Latitude/Longitude**: Coordinates (use Google Maps to find these)
- **Hours**: Operating hours (text)
- **Days Open**: Comma-separated days: `Mon,Tue,Wed,Thu,Fri,Sat,Sun`
- **Description**: Details about the site
- **Status**: `open`, `closed`, or `coming_soon`
- **Amenities**: Comma-separated: `WiFi,Snacks,Bus Passes`

### Step 2: Publish to Web

1. Go to **File → Share → Publish to web**
2. Under "Link", select your sheet (usually "Sheet1")
3. Change format from "Web page" to **"Comma-separated values (.csv)"**
4. Click **Publish**
5. Copy the URL

### Step 3: Add to Config

Paste the URL in `src/config.js`:

```javascript
GOOGLE_SHEETS_CSV_URL: 'https://docs.google.com/spreadsheets/d/YOUR_ID/pub?output=csv',
```

### Updating Sites

Just edit the spreadsheet! Changes appear on the site within a few minutes (data is fetched fresh on each page load).

**Finding Coordinates:**
1. Go to Google Maps
2. Right-click the location
3. Click the coordinates to copy them
4. First number is Latitude, second is Longitude

---

## Formspree Setup (for Forms)

### Step 1: Create Account

1. Go to [formspree.io](https://formspree.io) and sign up (free tier works)
2. Create a new form
3. Copy your form endpoint (looks like `https://formspree.io/f/xxxxxxxx`)

### Step 2: Add to Config

```javascript
FORMSPREE_ENDPOINT: 'https://formspree.io/f/xxxxxxxx',
```

### Form Submissions

All partner inquiries will be sent to the email associated with your Formspree account.

---

## Deployment (Vercel)

### Option 1: GitHub Integration (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in with GitHub
3. Click "Import Project" and select your repo
4. Click "Deploy"

Every push to `main` will auto-deploy.

### Option 2: CLI

```bash
npm i -g vercel
vercel
```

---

## Customization

### Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  "az-purple": "#5C2D91",
  "az-orange": "#FF7500",
  "az-blue": "#00B2E3",
  "az-red": "#BE1E2D",
}
```

### Content

- **Hero section**: `src/components/Hero.jsx`
- **About text**: `src/components/About.jsx`
- **Eligibility criteria**: `src/components/Eligibility.jsx`

### Adding Downloadable Resources

Update the `resources` array in `src/components/Toolkit.jsx` with your actual file URLs.

---

## Project Structure

```
arizona-youth-count/
├── public/              # Static assets
├── src/
│   ├── components/      # React components
│   │   ├── Header.jsx
│   │   ├── Hero.jsx
│   │   ├── About.jsx
│   │   ├── Eligibility.jsx
│   │   ├── WhatToExpect.jsx
│   │   ├── HowToParticipate.jsx
│   │   ├── SiteMap.jsx       # Interactive map
│   │   ├── Toolkit.jsx
│   │   ├── GetInvolved.jsx   # Partner form
│   │   ├── MediaCenter.jsx
│   │   ├── Privacy.jsx
│   │   ├── Footer.jsx
│   │   └── EmergencyBanner.jsx
│   ├── hooks/
│   │   └── useSiteData.js    # Google Sheets fetching
│   ├── utils/
│   │   └── animations.js     # Framer Motion helpers
│   ├── config.js             # ⚡ MAIN CONFIG FILE
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

---

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Leaflet + React Leaflet** - Maps
- **PapaParse** - CSV parsing (for Google Sheets)

---

## Support

Questions? Contact the MAG Community Initiatives Division.
