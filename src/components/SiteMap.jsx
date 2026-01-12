import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSiteData, filterSitesByDay, filterSitesByCity, searchSites, getUniqueCities } from '../hooks/useSiteData';
import { CONFIG } from '../config';

// Custom marker icons
const createMarkerIcon = (status) => {
  const colors = {
    open: '#BE1E2D',
    closed: '#6B7280',
    coming_soon: '#5C2D91',
  };
  
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
          color: ${colors[status] || colors.open};
          filter: drop-shadow(2px 2px 2px rgba(0,0,0,0.3));
        ">location_on</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

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

// Get day abbreviation from date
function getDayAbbrev(date) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
}

// Format date for display
function formatDate(date) {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Component to handle map centering
function MapController({ center, zoom }) {
  const map = useMap();
  
  const handleRecenter = () => {
    map.setView(center, zoom);
  };
  
  return (
    <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-[1000]">
      <button 
        onClick={() => map.zoomIn()}
        className="w-10 h-10 bg-white rounded shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        <span className="material-symbols-outlined">add</span>
      </button>
      <button 
        onClick={() => map.zoomOut()}
        className="w-10 h-10 bg-white rounded shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
      >
        <span className="material-symbols-outlined">remove</span>
      </button>
      <button 
        onClick={handleRecenter}
        className="w-10 h-10 bg-white rounded shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
        title="Reset view"
      >
        <span className="material-symbols-outlined">my_location</span>
      </button>
    </div>
  );
}

// Site card component
function SiteCard({ site, isActive, onClick }) {
  const statusColors = {
    open: { bg: 'bg-green-100', text: 'text-green-700', label: 'OPEN' },
    closed: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'CLOSED' },
    coming_soon: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'COMING SOON' },
  };
  
  const status = statusColors[site.status] || statusColors.open;
  
  return (
    <motion.div
      className={`p-4 rounded-xl border cursor-pointer transition-all ${
        isActive 
          ? 'bg-az-purple/10 border-az-purple shadow-md' 
          : 'bg-white border-gray-100 hover:border-az-orange hover:shadow-md'
      }`}
      onClick={onClick}
      whileHover={{ x: 4 }}
      layout
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className={`font-bold ${isActive ? 'text-az-purple' : 'text-gray-900'}`}>
          {site.name}
        </h4>
        <span className={`text-xs font-black ${status.bg} ${status.text} px-2 py-0.5 rounded`}>
          {status.label}
        </span>
      </div>
      
      <p className="text-sm text-gray-500 mb-1 flex items-center gap-1">
        <span className="material-symbols-outlined text-[16px]">location_on</span>
        {site.address}, {site.city}
      </p>
      
      <p className="text-sm text-gray-500 flex items-center gap-1">
        <span className="material-symbols-outlined text-[16px]">schedule</span>
        {site.hours}
      </p>
      
      {site.daysOpen && site.daysOpen.length > 0 && (
        <div className="mt-2 flex gap-1 flex-wrap">
          {site.daysOpen.map(day => (
            <span
              key={day}
              className="px-2 py-0.5 bg-az-blue/10 text-az-blue text-xs font-bold rounded"
            >
              {day}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Calendar component
function CalendarPicker({ selectedDate, onSelectDate }) {
  const countDates = useMemo(() => generateCountDates(), []);
  
  // Group dates by week
  const weeks = useMemo(() => {
    const grouped = [];
    let currentWeek = [];
    
    // Add empty slots for days before the start
    const firstDay = countDates[0].getDay();
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null);
    }
    
    countDates.forEach((date, index) => {
      currentWeek.push(date);
      if (date.getDay() === 6 || index === countDates.length - 1) {
        // Fill remaining slots
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
  
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-black text-gray-900 uppercase text-sm">Select a Date</h4>
        {selectedDate && (
          <button
            onClick={() => onSelectDate(null)}
            className="text-xs font-bold text-gray-500 hover:text-az-red flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">close</span>
            Clear
          </button>
        )}
      </div>
      
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
          <div key={i} className="text-center text-xs font-bold text-gray-400 py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((date, dayIndex) => (
              <div key={dayIndex} className="aspect-square">
                {date ? (
                  <motion.button
                    onClick={() => onSelectDate(isSelected(date) ? null : date)}
                    className={`w-full h-full rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                      isSelected(date)
                        ? 'bg-az-purple text-white shadow-md'
                        : 'bg-gray-50 text-gray-700 hover:bg-az-blue/10 hover:text-az-blue'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {date.getDate()}
                  </motion.button>
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      {/* Month labels */}
      <div className="mt-3 flex justify-between text-xs font-bold text-gray-500">
        <span>Jan 27 – 31</span>
        <span>Feb 1 – 13</span>
      </div>
      
      {selectedDate && (
        <div className="mt-3 pt-3 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-600">
            Showing sites open on <strong className="text-az-purple">{formatDate(selectedDate)}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

export default function SiteMap() {
  const { sites, loading } = useSiteData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [activeSite, setActiveSite] = useState(null);
  
  // Get unique cities for filter
  const cities = useMemo(() => getUniqueCities(sites), [sites]);
  
  // Get day abbreviation from selected date
  const selectedDay = selectedDate ? getDayAbbrev(selectedDate) : null;
  
  // Apply filters
  const filteredSites = useMemo(() => {
    let result = sites;
    result = searchSites(result, searchQuery);
    result = filterSitesByDay(result, selectedDay);
    result = filterSitesByCity(result, selectedCity);
    return result;
  }, [sites, searchQuery, selectedDay, selectedCity]);
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDate(null);
    setSelectedCity(null);
  };
  
  const hasFilters = searchQuery || selectedDate || selectedCity;

  return (
    <section className="w-full bg-gray-100 border-t border-gray-200 flex flex-col lg:flex-row min-h-[800px] lg:h-[750px]" id="map">
      {/* Sidebar */}
      <div className="w-full lg:w-[420px] bg-white flex flex-col border-r border-gray-200 h-auto lg:h-full z-10 shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 bg-white z-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-black text-az-purple uppercase">Find a Site</h3>
            {hasFilters && (
              <motion.button
                onClick={clearFilters}
                className="text-sm font-bold text-gray-500 hover:text-az-red flex items-center gap-1"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="material-symbols-outlined text-sm">close</span>
                Clear All
              </motion.button>
            )}
          </div>
          
          {/* Search */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search city or zip code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-az-blue focus:border-transparent outline-none transition-all placeholder-gray-400 font-medium"
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>
          </div>
          
          {/* City filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {cities.map(city => (
              <motion.button
                key={city}
                onClick={() => setSelectedCity(selectedCity === city ? null : city)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase whitespace-nowrap transition-colors ${
                  selectedCity === city
                    ? 'bg-az-blue text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {city}
              </motion.button>
            ))}
          </div>
        </div>
        
        {/* Calendar picker */}
        <div className="p-4 border-b border-gray-100">
          <CalendarPicker 
            selectedDate={selectedDate} 
            onSelectDate={setSelectedDate} 
          />
        </div>
        
        {/* Site list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
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
                />
              ))}
            </AnimatePresence>
          )}
        </div>
        
        {/* Results count */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-500 font-medium">
            Showing <strong className="text-gray-900">{filteredSites.length}</strong> of {sites.length} sites
          </p>
        </div>
      </div>
      
      {/* Map */}
      <div className="flex-1 relative h-[400px] lg:h-full">
        <MapContainer
          center={CONFIG.MAP_CENTER}
          zoom={CONFIG.MAP_ZOOM}
          className="w-full h-full z-0"
          scrollWheelZoom={true}
        >
          {/* Simple, clean map style */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          
          {filteredSites.map(site => (
            <Marker
              key={site.id}
              position={[site.lat, site.lng]}
              icon={createMarkerIcon(site.status)}
              eventHandlers={{
                click: () => setActiveSite(site.id),
              }}
            >
              <Popup>
                <div className="p-2 min-w-[250px]">
                  <h4 className="font-black text-gray-900 text-lg mb-1">{site.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{site.address}, {site.city} {site.zip}</p>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span className="material-symbols-outlined text-base">schedule</span>
                    {site.hours}
                  </div>
                  
                  {site.description && (
                    <p className="text-sm text-gray-600 mb-3">{site.description}</p>
                  )}
                  
                  {site.amenities && site.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {site.amenities.map(amenity => (
                        <span
                          key={amenity}
                          className="px-2 py-0.5 bg-az-purple/10 text-az-purple text-xs font-bold rounded"
                        >
                          {amenity}
                        </span>
                      ))}
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
          ))}
          
          <MapController center={CONFIG.MAP_CENTER} zoom={CONFIG.MAP_ZOOM} />
        </MapContainer>
      </div>
    </section>
  );
}
