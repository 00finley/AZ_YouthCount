// ============================================
// CONFIGURATION FILE
// Update these values for your deployment
// ============================================

export const CONFIG = {
  // Google Sheets URL (Published as CSV)
  // Instructions: 
  // 1. Create a Google Sheet with your site data
  // 2. Go to File > Share > Publish to web
  // 3. Select "Comma-separated values (.csv)" 
  // 4. Copy the URL and paste below
  GOOGLE_SHEETS_CSV_URL: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTaqtdn6kLFxGKDDaMmn0ltWT_I5Rudy79Oumhy_Z_8NRzRMQvRthppZPMY-uXVw92bAltq3Na0ExWr/pub?gid=0&single=true&output=csv',
  
  // Formspree endpoint for forms
  // Instructions:
  // 1. Go to formspree.io and create a free account
  // 2. Create a new form and copy the endpoint
  // 3. Paste below (format: https://formspree.io/f/xxxxxxxx)
  FORMSPREE_ENDPOINT: 'https://formspree.io/f/xbddjlgp',
  
  // Contact email (displayed on site)
  CONTACT_EMAIL: 'mfinley@azmag.gov',
  
  // Contact phone
  CONTACT_PHONE: '(602) 254-6300',
  
  // Virtual session booking URL (Calendly, Cal.com, etc.)
  BOOKING_URL: 'https://calendly.com/your-booking-link',
  
  // Social media links
  SOCIAL: {
    facebook: 'https://facebook.com/arizonayouthcount',
    twitter: 'https://twitter.com/azyouthcount',
    instagram: 'https://instagram.com/arizonayouthcount',
  },
  
  // Count dates
  COUNT_START_DATE: 'January 27, 2026',
  COUNT_END_DATE: 'February 13, 2026',
  
  // Gift card amount
  GIFT_CARD_AMOUNT: 25,
  
  // Map default center (Arizona center point)
  MAP_CENTER: [34.0489, -111.0937],
  MAP_ZOOM: 6,
};

// Demo site data (used when Google Sheets is not configured)
export const DEMO_SITES = [
  {
    id: 1,
    name: "Phoenix Public Library - Central",
    address: "1221 N Central Ave",
    city: "Phoenix",
    zip: "85004",
    lat: 33.4628,
    lng: -112.0740,
    hours: "9:00 AM - 5:00 PM",
    daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    description: "Main branch library with private meeting rooms available. Free WiFi and charging stations. Spanish-speaking staff available.",
    status: "open",
    amenities: ["WiFi", "Charging", "Private Rooms", "Spanish"],
  },
  {
    id: 2,
    name: "Native Health Central",
    address: "4041 N Central Ave",
    city: "Phoenix",
    zip: "85012",
    lat: 33.4892,
    lng: -112.0740,
    hours: "8:00 AM - 6:00 PM",
    daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    description: "Native American health center offering a welcoming environment. Cultural liaisons available. Free snacks provided.",
    status: "open",
    amenities: ["Snacks", "Cultural Support", "Healthcare"],
  },
  {
    id: 3,
    name: "one·n·ten Youth Center",
    address: "2700 N 3rd St",
    city: "Phoenix",
    zip: "85004",
    lat: 33.4711,
    lng: -112.0693,
    hours: "12:00 PM - 7:00 PM",
    daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    description: "LGBTQ+ affirming youth center. Safe space with peer support. Hot meals available during evening hours.",
    status: "open",
    amenities: ["Meals", "LGBTQ+ Affirming", "Peer Support"],
  },
  {
    id: 4,
    name: "Tempe Community Action Agency",
    address: "2146 E Apache Blvd",
    city: "Tempe",
    zip: "85281",
    lat: 33.4148,
    lng: -111.9098,
    hours: "8:00 AM - 4:00 PM",
    daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    description: "Community service center near ASU campus. Resource navigation assistance available. Bus passes provided.",
    status: "open",
    amenities: ["Bus Passes", "Resource Navigation"],
  },
  {
    id: 5,
    name: "Tucson Youth Development",
    address: "1745 E Glenn St",
    city: "Tucson",
    zip: "85719",
    lat: 32.2399,
    lng: -110.9471,
    hours: "10:00 AM - 6:00 PM",
    daysOpen: ["Tue", "Wed", "Thu", "Fri", "Sat"],
    description: "Youth-focused drop-in center in central Tucson. Art therapy programs. Hygiene supplies available.",
    status: "open",
    amenities: ["Art Programs", "Hygiene Supplies"],
  },
  {
    id: 6,
    name: "Flagstaff Family Resource Center",
    address: "1515 E Cedar Ave",
    city: "Flagstaff",
    zip: "86004",
    lat: 35.1983,
    lng: -111.6311,
    hours: "9:00 AM - 5:00 PM",
    daysOpen: ["Mon", "Wed", "Fri"],
    description: "Family-friendly center serving Northern Arizona. Warm clothing available during winter months.",
    status: "coming_soon",
    amenities: ["Family Friendly", "Clothing"],
  },
];
