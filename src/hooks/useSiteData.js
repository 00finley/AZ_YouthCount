import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { CONFIG, DEMO_SITES } from '../config';

// All Arizona counties
export const ARIZONA_COUNTIES = [
  'Apache',
  'Cochise',
  'Coconino',
  'Gila',
  'Graham',
  'Greenlee',
  'La Paz',
  'Maricopa',
  'Mohave',
  'Navajo',
  'Pima',
  'Pinal',
  'Santa Cruz',
  'Yavapai',
  'Yuma',
];

/**
 * Custom hook to fetch and parse site data from Google Sheets
 * Expected columns: Site Name, Address, City, Zip, County, Latitude, Longitude, Day, Hours, Access
 * 
 * Sites with multiple days will have multiple rows - this groups them together
 */
export function useSiteData() {
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      // Check if Google Sheets URL is configured
      if (!CONFIG.GOOGLE_SHEETS_CSV_URL || CONFIG.GOOGLE_SHEETS_CSV_URL === 'YOUR_GOOGLE_SHEETS_CSV_URL_HERE') {
        console.log('Using demo site data. Configure GOOGLE_SHEETS_CSV_URL in config.js for live data.');
        setSites(DEMO_SITES);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(CONFIG.GOOGLE_SHEETS_CSV_URL);
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            // Group rows by site (using name + address as key)
            const siteMap = new Map();
            
            results.data.forEach((row) => {
              const siteName = row['Site Name'] || row['name'] || '';
              const address = row['Address'] || row['address'] || '';
              const siteKey = `${siteName}-${address}`;
              
              if (!siteName) return; // Skip empty rows
              
              const day = row['Day'] || row['day'] || '';
              const hours = row['Hours'] || row['hours'] || '';
              
              if (siteMap.has(siteKey)) {
                // Add this day/hours to existing site
                const existingSite = siteMap.get(siteKey);
                if (day && hours) {
                  existingSite.schedule.push({
                    day: day,
                    dayFormatted: formatDay(day),
                    hours: hours,
                  });
                }
              } else {
                // Create new site entry
                const newSite = {
                  id: siteMap.size + 1,
                  name: siteName,
                  address: address,
                  city: row['City'] || row['city'] || '',
                  zip: row['Zip'] || row['zip'] || '',
                  county: row['County'] || row['county'] || '',
                  lat: parseFloat(row['Latitude'] || row['lat'] || 0),
                  lng: parseFloat(row['Longitude'] || row['lng'] || 0),
                  access: row['Access'] || row['access'] || '',
                  schedule: [],
                };
                
                if (day && hours) {
                  newSite.schedule.push({
                    day: day,
                    dayFormatted: formatDay(day),
                    hours: hours,
                  });
                }
                
                siteMap.set(siteKey, newSite);
              }
            });
            
            // Convert map to array and filter out invalid entries
            const parsedSites = Array.from(siteMap.values())
              .filter(site => site.name && site.lat && site.lng);
            
            // Sort schedule by date for each site
            parsedSites.forEach(site => {
              site.schedule.sort((a, b) => {
                return parseDay(a.day) - parseDay(b.day);
              });
            });
            
            setSites(parsedSites);
            setLoading(false);
          },
          error: (err) => {
            console.error('Error parsing CSV:', err);
            setError('Failed to load site data');
            setSites(DEMO_SITES);
            setLoading(false);
          }
        });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch site data');
        setSites(DEMO_SITES);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { sites, loading, error };
}

/**
 * Format day from "dd-month-yy" to more readable format
 * e.g., "28-Jan-26" -> "Jan 28"
 */
function formatDay(dayStr) {
  if (!dayStr) return '';
  
  // Try to parse dd-month-yy format
  const parts = dayStr.split('-');
  if (parts.length === 3) {
    const day = parts[0];
    const month = parts[1];
    return `${month} ${parseInt(day, 10)}`;
  }
  
  // Return as-is if format doesn't match
  return dayStr;
}

/**
 * Parse day string to Date object for sorting
 */
function parseDay(dayStr) {
  if (!dayStr) return new Date(0);
  
  const parts = dayStr.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const monthStr = parts[1];
    const year = parseInt(parts[2], 10) + 2000; // Assume 20xx
    
    const months = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    const month = months[monthStr] ?? 0;
    return new Date(year, month, day);
  }
  
  return new Date(0);
}

/**
 * Filter sites by counties (multiple selection)
 */
export function filterSitesByCounties(sites, counties) {
  if (!counties || counties.length === 0) return sites;
  return sites.filter(site => 
    counties.some(county => 
      site.county.toLowerCase() === county.toLowerCase()
    )
  );
}

/**
 * Filter sites by selected date
 */
export function filterSitesByDate(sites, selectedDate) {
  if (!selectedDate) return sites;
  
  const selectedStr = formatDateForComparison(selectedDate);
  
  return sites.filter(site => 
    site.schedule.some(sched => {
      const schedDate = parseDay(sched.day);
      const schedStr = formatDateForComparison(schedDate);
      return schedStr === selectedStr;
    })
  );
}

/**
 * Format date for comparison (YYYY-MM-DD)
 */
function formatDateForComparison(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Search sites by name, address, city, or county
 */
export function searchSites(sites, query) {
  if (!query) return sites;
  const lowerQuery = query.toLowerCase();
  return sites.filter(site => 
    site.name.toLowerCase().includes(lowerQuery) ||
    site.address.toLowerCase().includes(lowerQuery) ||
    site.city.toLowerCase().includes(lowerQuery) ||
    site.county.toLowerCase().includes(lowerQuery) ||
    site.zip.includes(query)
  );
}

/**
 * Get unique counties from sites (for showing only counties with sites)
 */
export function getActiveCounties(sites) {
  return [...new Set(sites.map(site => site.county))].filter(Boolean).sort();
}
