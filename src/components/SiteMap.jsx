import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { 
  useSiteData, 
  filterSitesByCounties, 
  filterSitesByDate,
  ARIZONA_COUNTIES 
} from '../hooks/useSiteData';
import { CONFIG } from '../config';

// Custom marker icons
const createMarkerIcon = (isActive) => {
  const color = isActive ? '#FF7500' : '#BE1E2D';
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        position: relative;
      ">
        <span class="material-symbols-outlined" style="
          font-size: 32px;
          color: ${color};
          filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.3));
        ">location_on</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// User location marker
const userLocationIcon = L.divIcon({
  className: 'user-marker',
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: #3B82F6;
      border: 3px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// Calculate distance between two coordinates (in miles)
function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Generate dates for the count period
function generateCountDates() {
  const startDate = new Date('2026-01-27');
  const endDate = new Date('2026-02-13');
  const dates = [];
  
  let current = new Date(startDate);
  while (current <= endDate) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
}

// Format date for comparison
function formatDateForComparison(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Parse day string to Date for comparison
function parseDay(dayStr) {
  if (!dayStr) return null;
  
  const parts = dayStr.split('-');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const monthStr = parts[1];
    const year = parseInt(parts[2], 10) + 2000;
    
    const months = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    const month = months[monthStr] ?? 0;
    return new Date(year, month, day);
  }
  
  return null;
}

// Component to handle map view changes
function MapController({ center, zoom, activeSite, sites, userLocation }) {
  const map = useMap();
  
  useEffect(() => {
    if (activeSite) {
      const site = sites.find(s => s.id === activeSite);
      if (site) {
        map.setView([site.lat, site.lng], Math.max(map.getZoom(), 12));
      }
    }
  }, [activeSite, sites, map]);
  
  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 11);
    }
  }, [userLocation, map]);
  
  const handleRecenter = () => {
    map.setView(center, zoom);
  };
  
  return (
    <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-[1000]">
      <button 
        onClick={() => map.zoomIn()}
        className="w-9 h-9 bg-white rounded shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        <span className="material-symbols-outlined text-xl">add</span>
      </button>
      <button 
        onClick={() => map.zoomOut()}
        className="w-9 h-9 bg-white rounded shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        <span className="material-symbols-outlined text-xl">remove</span>
      </button>
      <button 
        onClick={handleRecenter}
        className="w-9 h-9 bg-white rounded shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="Reset view"
      >
        <span className="material-symbols-outlined text-xl">my_location</span>
      </button>
    </div>
  );
}

// Site card component - shows only selected date if filtering
function SiteCard({ site, isActive, onClick, selectedDate, userLocation }) {
  const displaySchedule = useMemo(() => {
    if (!selectedDate || !site.schedule) return site.schedule;
    
    const selectedStr = formatDateForComparison(selectedDate);
    
    return site.schedule.filter(sched => {
      const schedDate = parseDay(sched.day);
      if (!schedDate) return false;
      return formatDateForComparison(schedDate) === selectedStr;
    });
  }, [site.schedule, selectedDate]);
  
  const distance = useMemo(() => {
    if (!userLocation) return null;
    return calculateDistance(userLocation.lat, userLocation.lng, site.lat, site.lng);
  }, [userLocation, site.lat, site.lng]);
  
  return (
    <motion.div
      className={`p-4 rounded-xl border cursor-pointer transition-all ${
        isActive 
          ? 'bg-az-orange/10 border-az-orange shadow-md' 
          : 'bg-white border-gray-100 hover:border-az-blue hover:shadow-md'
      }`}
      onClick={onClick}
      whileHover={{ x: 2 }}
      layout
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className={`font-bold ${isActive ? 'text-az-orange' : 'text-gray-900'}`}>
          {site.name}
        </h4>
        {distance !== null && (
          <span className="text-xs font-bold text-az-blue bg-az-blue/10 px-2 py-0.5 rounded whitespace-nowrap">
            {distance < 1 ? '<1' : distance.toFixed(1)} mi
          </span>
        )}
      </div>
      
      <p className="text-sm text-gray-500 mb-3 flex items-start gap-1">
        <span className="material-symbols-outlined text-[14px] mt-0.5 flex-shrink-0">location_on</span>
        <span>{site.address}, {site.city}</span>
      </p>
      
      {displaySchedule && displaySchedule.length > 0 && (
        <div className="space-y-1.5">
          {displaySchedule.map((sched, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <span className="bg-az-purple/10 text-az-purple font-bold px-2 py-0.5 rounded text-xs min-w-[55px] text-center">
                {sched.dayFormatted}
              </span>
              <span className="text-gray-600 text-xs">{sched.hours}</span>
            </div>
          ))}
        </div>
      )}
      
      {site.county && (
        <div className="mt-3 pt-2 border-t border-gray-100">
          <span className="text-xs font-bold text-gray-400 uppercase">{site.county} County</span>
        </div>
      )}
    </motion.div>
  );
}

// Multi-select county dropdown
function CountySelect({ selectedCounties, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const toggleCounty = (county) => {
    if (selectedCounties.includes(county)) {
      onChange(selectedCounties.filter(c => c !== county));
    } else {
      onChange([...selectedCounties, county]);
    }
  };
  
  const clearAll = () => {
    onChange([]);
    setIsOpen(false);
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2.5 bg-gray-50 border rounded-lg text-left flex items-center justify-between transition-all text-sm ${
          isOpen ? 'border-az-purple ring-2 ring-az-purple/20' : 'border-gray-200'
        }`}
      >
        <span className={selectedCounties.length > 0 ? 'text-gray-900 font-medium' : 'text-gray-400'}>
          {selectedCounties.length === 0 
            ? 'All Counties' 
            : selectedCounties.length === 1 
              ? selectedCounties[0]
              : `${selectedCounties.length} counties`
          }
        </span>
        <span className="material-symbols-outlined text-gray-400 text-lg">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[250px] overflow-y-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {selectedCounties.length > 0 && (
              <button
                onClick={clearAll}
                className="w-full px-3 py-2 text-left text-xs text-az-red font-bold hover:bg-red-50 border-b border-gray-100 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                Clear all
              </button>
            )}
            
            {ARIZONA_COUNTIES.map(county => (
              <label
                key={county}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selectedCounties.includes(county)}
                  onChange={() => toggleCounty(county)}
                  className="w-4 h-4 rounded border-gray-300 text-az-purple focus:ring-az-purple"
                />
                <span className="text-gray-700">{county}</span>
              </label>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Calendar component
function CalendarPicker({ selectedDate, onSelectDate }) {
  const countDates = useMemo(() => generateCountDates(), []);
  
  const weeks = useMemo(() => {
    const grouped = [];
    let currentWeek = [];
    
    const firstDay = countDates[0].getDay();
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }
    
    countDates.forEach((date, index) => {
      currentWeek.push(date);
      if (date.getDay() === 6 || index === countDates.length - 1) {
        while (currentWeek.length < 7) {
          currentWeek.push(null);
        }
        grouped.push(currentWeek);
        currentWeek = [];
      }
    });
    
    return grouped;
  }, [countDates]);
  
  const isSelected = (date) => {
    if (!selectedDate || !date) return false;
    return date.toDateString() === selectedDate.toDateString();
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-bold text-gray-700 text-sm">Date</h4>
        {selectedDate && (
          <button
            onClick={() => onSelectDate(null)}
            className="text-xs font-bold text-gray-400 hover:text-az-red flex items-center gap-0.5"
          >
            <span className="material-symbols-outlined text-sm">close</span>
            Clear
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-7 gap-0.5 mb-1">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-center text-xs font-bold text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>
      
      <div className="space-y-0.5">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-0.5">
            {week.map((date, dayIndex) => (
              <div key={dayIndex} className="aspect-square">
                {date ? (
                  <button
                    onClick={() => onSelectDate(isSelected(date) ? null : date)}
                    className={`w-full h-full rounded text-xs font-bold flex items-center justify-center transition-all ${
                      isSelected(date)
                        ? 'bg-az-purple text-white shadow'
                        : 'bg-gray-100 text-gray-700 hover:bg-az-blue/20 hover:text-az-blue'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {selectedDate && (
        <div className="mt-2 text-center">
          <p className="text-xs text-gray-500">
            Showing: <strong className="text-az-purple">{formatDate(selectedDate)}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

// Location finder component with address/zip input
function LocationFinder({ userLocation, setUserLocation, isLocating, setIsLocating, locationLabel, setLocationLabel }) {
  const [addressInput, setAddressInput] = useState('');
  const [error, setError] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported by your browser');
      return;
    }
    
    setIsLocating(true);
    setError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationLabel('Current Location');
        setIsLocating(false);
      },
      (err) => {
        setError('Could not get your location. Please enter an address instead.');
        setIsLocating(false);
        console.error('Geolocation error:', err);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };
  
  const handleAddressSearch = async () => {
    if (!addressInput.trim()) return;
    
    setIsSearching(true);
    setError(null);
    
    try {
      const query = encodeURIComponent(`${addressInput.trim()}, Arizona`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
        { headers: { 'User-Agent': 'ArizonaYouthCount/1.0' } }
      );
      
      const results = await response.json();
      
      if (results && results.length > 0) {
        const result = results[0];
        setUserLocation({
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
        });
        setLocationLabel(addressInput.trim());
        setAddressInput('');
      } else {
        setError('Address not found. Try a zip code or nearby city.');
      }
    } catch (err) {
      setError('Could not search address. Please try again.');
      console.error('Geocoding error:', err);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleAddressSearch();
    }
  };
  
  const clearLocation = () => {
    setUserLocation(null);
    setLocationLabel('');
    setError(null);
    setAddressInput('');
  };
  
  return (
    <div>
      <h4 className="font-bold text-gray-700 text-sm mb-2">Your Location</h4>
      
      {userLocation ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 px-3 py-2 bg-az-blue/10 border border-az-blue/20 rounded-lg text-sm text-az-blue font-medium flex items-center gap-2 overflow-hidden">
              <span className="material-symbols-outlined text-lg flex-shrink-0">my_location</span>
              <span className="truncate">{locationLabel || 'Location set'}</span>
            </div>
            <button
              onClick={clearLocation}
              className="p-2 text-gray-400 hover:text-az-red transition-colors flex-shrink-0"
              title="Clear location"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <p className="text-xs text-gray-500">Sites are sorted by distance from this location.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Address or zip code"
                className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-az-blue focus:border-transparent outline-none"
              />
              <button
                onClick={handleAddressSearch}
                disabled={isSearching || !addressInput.trim()}
                className="px-3 py-2 bg-az-purple text-white rounded-lg text-sm font-bold disabled:opacity-50 flex items-center justify-center"
              >
                {isSearching ? (
                  <motion.span
                    className="material-symbols-outlined text-lg"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    sync
                  </motion.span>
                ) : (
                  <span className="material-symbols-outlined text-lg">search</span>
                )}
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-xs text-gray-400 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>
          
          <button
            onClick={handleUseMyLocation}
            disabled={isLocating}
            className="w-full px-3 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:border-az-blue hover:text-az-blue transition-colors disabled:opacity-50"
          >
            {isLocating ? (
              <>
                <motion.span
                  className="material-symbols-outlined text-lg"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  sync
                </motion.span>
                Finding...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-lg">my_location</span>
                Use My Current Location
              </>
            )}
          </button>
        </div>
      )}
      
      {error && (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

// Marker with popup
function SiteMarker({ site, isActive, onClick }) {
  const markerRef = useRef(null);
  
  useEffect(() => {
    if (isActive && markerRef.current) {
      markerRef.current.openPopup();
    }
  }, [isActive]);
  
  return (
    <Marker
      ref={markerRef}
      position={[site.lat, site.lng]}
      icon={createMarkerIcon(isActive)}
      eventHandlers={{
        click: onClick,
      }}
    >
      <Popup>
        <div className="p-2 min-w-[260px]">
          <h4 className="font-black text-gray-900 text-lg mb-1">{site.name}</h4>
          <p className="text-sm text-gray-600 mb-3">
            {site.address}, {site.city} {site.zip}
          </p>
          
          {site.access && (
            <div className="bg-az-purple/5 rounded-lg p-3 mb-3">
              <h5 className="text-xs font-bold text-az-purple uppercase mb-1">Access Info</h5>
              <p className="text-sm text-gray-700">{site.access}</p>
            </div>
          )}
          
          {site.schedule && site.schedule.length > 0 && (
            <div className="mb-3">
              <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Schedule</h5>
              <div className="space-y-1">
                {site.schedule.map((sched, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="bg-az-blue/10 text-az-blue font-bold px-2 py-0.5 rounded text-xs">
                      {sched.dayFormatted}
                    </span>
                    <span className="text-gray-600 text-xs">{sched.hours}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${site.lat},${site.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-az-blue font-bold text-sm hover:underline"
          >
            <span className="material-symbols-outlined text-base">directions</span>
            Get Directions
          </a>
        </div>
      </Popup>
    </Marker>
  );
}

// Instructions component
function MapInstructions() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="bg-az-blue/5 border border-az-blue/20 rounded-lg p-3">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-az-blue text-lg">help</span>
          <span className="font-bold text-sm text-gray-700">How to Use This Tool</span>
        </div>
        <span className="material-symbols-outlined text-gray-400 text-lg">
          {isExpanded ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-az-blue/20 text-sm text-gray-600 space-y-2">
              <p>
                <strong className="text-gray-700">1. Find sites near you:</strong> Enter your address or zip code, or use your current location to see nearby sites sorted by distance.
              </p>
              <p>
                <strong className="text-gray-700">2. Filter by county:</strong> Select one or more counties to narrow down your search.
              </p>
              <p>
                <strong className="text-gray-700">3. Pick a date:</strong> Click a date on the calendar to see only sites open that day.
              </p>
              <p>
                <strong className="text-gray-700">4. View details:</strong> Click any site in the list to see it on the map and get directions.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SiteMap() {
  const { sites, loading } = useSiteData();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCounties, setSelectedCounties] = useState([]);
  const [activeSite, setActiveSite] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLabel, setLocationLabel] = useState('');
  const [isLocating, setIsLocating] = useState(false);
  
  const filteredSites = useMemo(() => {
    let result = sites;
    result = filterSitesByCounties(result, selectedCounties);
    result = filterSitesByDate(result, selectedDate);
    
    if (userLocation) {
      result = [...result].sort((a, b) => {
        const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
        const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
        return distA - distB;
      });
    }
    
    return result;
  }, [sites, selectedCounties, selectedDate, userLocation]);
  
  const clearFilters = () => {
    setSelectedDate(null);
    setSelectedCounties([]);
    setUserLocation(null);
    setLocationLabel('');
  };
  
  const hasFilters = selectedDate || selectedCounties.length > 0 || userLocation;

  return (
    <section className="w-full bg-gray-100 border-t border-gray-200" id="map">
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <h3 className="text-2xl font-black text-az-purple uppercase">Find a Site</h3>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm font-bold text-gray-500 hover:text-az-red flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">close</span>
              Clear All Filters
            </button>
          )}
        </div>
      </div>
      
      <div className="flex flex-col lg:flex-row min-h-[700px] lg:h-[700px]">
        <div className="w-full lg:w-[300px] bg-white border-r border-gray-200 p-4 space-y-4 overflow-y-auto">
          <MapInstructions />
          
          <LocationFinder 
            userLocation={userLocation}
            setUserLocation={setUserLocation}
            isLocating={isLocating}
            setIsLocating={setIsLocating}
            locationLabel={locationLabel}
            setLocationLabel={setLocationLabel}
          />
          
          <div>
            <h4 className="font-bold text-gray-700 text-sm mb-2">County</h4>
            <CountySelect 
              selectedCounties={selectedCounties} 
              onChange={setSelectedCounties} 
            />
          </div>
          
          <CalendarPicker 
            selectedDate={selectedDate} 
            onSelectDate={setSelectedDate} 
          />
          
          <div className="pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              <strong className="text-gray-900">{filteredSites.length}</strong> sites found
            </p>
          </div>
        </div>
        
        <div className="w-full lg:w-[340px] bg-gray-50 border-r border-gray-200 flex flex-col h-[400px] lg:h-full">
          <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                <motion.span 
                  className="material-symbols-outlined text-4xl"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  sync
                </motion.span>
                <p className="mt-2 font-medium">Loading sites...</p>
              </div>
            ) : filteredSites.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400 py-12">
                <span className="material-symbols-outlined text-4xl">search_off</span>
                <p className="mt-2 font-medium">No sites found</p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-az-blue font-bold text-sm hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <AnimatePresence>
                {filteredSites.map(site => (
                  <SiteCard
                    key={site.id}
                    site={site}
                    isActive={activeSite === site.id}
                    onClick={() => setActiveSite(activeSite === site.id ? null : site.id)}
                    selectedDate={selectedDate}
                    userLocation={userLocation}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
        
        <div className="flex-1 relative h-[400px] lg:h-full">
          <MapContainer
            center={CONFIG.MAP_CENTER}
            zoom={CONFIG.MAP_ZOOM}
            className="w-full h-full z-0"
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            
            {userLocation && (
              <>
                <Marker 
                  position={[userLocation.lat, userLocation.lng]} 
                  icon={userLocationIcon}
                >
                  <Popup>
                    <div className="p-1 text-center">
                      <p className="font-bold text-gray-900">{locationLabel || 'Your Location'}</p>
                    </div>
                  </Popup>
                </Marker>
                <Circle 
                  center={[userLocation.lat, userLocation.lng]}
                  radius={16093}
                  pathOptions={{ 
                    color: '#3B82F6', 
                    fillColor: '#3B82F6', 
                    fillOpacity: 0.1,
                    weight: 2,
                    dashArray: '5, 5'
                  }}
                />
              </>
            )}
            
            {filteredSites.map(site => (
              <SiteMarker
                key={site.id}
                site={site}
                isActive={activeSite === site.id}
                onClick={() => setActiveSite(site.id)}
              />
            ))}
            
            <MapController 
              center={CONFIG.MAP_CENTER} 
              zoom={CONFIG.MAP_ZOOM} 
              activeSite={activeSite}
              sites={filteredSites}
              userLocation={userLocation}
            />
          </MapContainer>
        </div>
      </div>
    </section>
  );
}
