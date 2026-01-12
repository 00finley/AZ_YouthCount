import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { CONFIG, DEMO_SITES } from '../config';

/**
 * Custom hook to fetch and parse site data from Google Sheets
 * Falls back to demo data if no URL is configured
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
            const parsedSites = results.data.map((row, index) => ({
              id: index + 1,
              name: row['Site Name'] || row['name'] || '',
              address: row['Address'] || row['address'] || '',
              city: row['City'] || row['city'] || '',
              zip: row['Zip'] || row['zip'] || '',
              lat: parseFloat(row['Latitude'] || row['lat'] || 0),
              lng: parseFloat(row['Longitude'] || row['lng'] || 0),
              hours: row['Hours'] || row['hours'] || '',
              daysOpen: (row['Days Open'] || row['daysOpen'] || '').split(',').map(d => d.trim()),
              description: row['Description'] || row['description'] || '',
              status: (row['Status'] || row['status'] || 'open').toLowerCase(),
              amenities: (row['Amenities'] || row['amenities'] || '').split(',').map(a => a.trim()).filter(Boolean),
            })).filter(site => site.name && site.lat && site.lng);
            
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
 * Filter sites by day of week
 */
export function filterSitesByDay(sites, day) {
  if (!day || day === 'all') return sites;
  return sites.filter(site => site.daysOpen.includes(day));
}

/**
 * Filter sites by city
 */
export function filterSitesByCity(sites, city) {
  if (!city || city === 'all') return sites;
  return sites.filter(site => site.city.toLowerCase() === city.toLowerCase());
}

/**
 * Search sites by name, address, or city
 */
export function searchSites(sites, query) {
  if (!query) return sites;
  const lowerQuery = query.toLowerCase();
  return sites.filter(site => 
    site.name.toLowerCase().includes(lowerQuery) ||
    site.address.toLowerCase().includes(lowerQuery) ||
    site.city.toLowerCase().includes(lowerQuery) ||
    site.zip.includes(query)
  );
}

/**
 * Get unique cities from sites
 */
export function getUniqueCities(sites) {
  return [...new Set(sites.map(site => site.city))].sort();
}
