import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  useSiteData, 
  filterSitesByCounties, 
  filterSitesByDate,
  searchSites, 
  ARIZONA_COUNTIES 
} from '../hooks/useSiteData';
import { CONFIG } from '../config';

// Custom marker icons
const createMarkerIcon = (isActive) => {
  const color = isActive ? '#FF7500' : '#BE1E2D'; // Orange when active, red otherwise
  
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

// Component to handle map view changes
function MapController({ center, zoom, activeSite, sites }) {
  const map = useMap();
  
  // Pan to active site when selected
  useEffect(() => {
    if (activeSite) {
      const site = sites.find(s => s.id === activeSite);
      if (site) {
        map.setView([site.lat, site.lng], Math.max(map.getZoom(), 10));
      }
    }
  }, [activeSite, sites, map]);
  
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
  return (
    <motion.div
      className={`p-4 rounded-xl border cursor-pointer transition-all ${
        isActive 
          ? 'bg-az-orange/10 border-az-orange shadow-md' 
          : 'bg-white border-gray-100 hover:border-az-blue hover:shadow-md'
      }`}
      onClick={onClick}
      whileHover={{ x: 4 }}
      layout
    >
      {/* Site name */}
      <h4 className={`font-bold mb-2 ${isActive ? 'text-az-orange' : 'text-gray-900'}`}>
        {site.name}
      </h4>
      
      {/* Address */}
      <p className="text-sm text-gray-500 mb-3 flex items-start gap-1">
        <span className="material-symbols-outlined text-[16px] mt-0.5 flex-shrink-0">location_on</span>
        <span>{site.address}, {site.city} {site.zip}</span>
      </p>
      
      {/* Schedule - Days and Hours */}
      {site.schedule && site.schedule.length > 0 && (
        <div className="space-y-1.5">
          {site.schedule.map((sched, idx) => (
            <div key={idx} className="flex items-center gap-2 text-sm">
              <span className="bg-az-purple/10 text-az-purple font-bold px-2 py-0.5 rounded text-xs min-w-[60px] text-center">
                {sched.dayFormatted}
              </span>
              <span className="text-gray-600">{sched.hours}</span>
            </div>
          ))}
        </div>
      )}
      
      {/* County badge */}
      {site.county && (
        <div className="mt-3 pt-3 border-t border-gray-100">
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
  
  // Close dropdown when clicking outside
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
        className={`w-full px-4 py-3 bg-gray-50 border rounded-lg text-left flex items-center justify-between transition-all ${
          isOpen ? 'border-az-purple ring-2 ring-az-purple/20' : 'border-gray-200'
        }`}
      >
        <span className={selectedCounties.length > 0 ? 'text-gray-900 font-medium' : 'text-gray-400'}>
          {selectedCounties.length === 0 
            ? 'All Counties' 
            : selectedCounties.length === 1 
              ? selectedCounties[0]
              : `${selectedCounties.length} counties selected`
          }
        </span>
        <span className="material-symbols-outlined text-gray-400">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-[300px] overflow-y-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Clear all button */}
            {selectedCounties.length > 0 && (
              <button
                onClick={clearAll}
                className="w-full px-4 py-2 text-left text-sm text-az-red font-bold hover:bg-red-50 border-b border-gray-100 flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">close</span>
                Clear all
              </button>
            )}
            
            {/* County list */}
            {ARIZONA_COUNTIES.map(county => (
              <label
                key={county}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer"
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
  
  // Group dates by week
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
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-black text-gray-900 uppercase text-sm">Filter by Date</h4>
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

// Marker with popup that can be opened programmatically
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
        <div className="p-2 min-w-[280px]">
          <h4 className="font-black text-gray-900 text-lg mb-1">{site.name}</h4>
          <p className="text-sm text-gray-600 mb-3">
            {site.address}, {site.city} {site.zip}
          </p>
          
          {/* Access information */}
          {site.access && (
            <div className="bg-az-purple/5 rounded-lg p-3 mb-3">
              <h5 className="text-xs font-bold text-az-purple uppercase mb-1">Access Info</h5>
              <p className="text-sm text-gray-700">{site.access}</p>
            </div>
          )}
          
          {/* Schedule */}
          {site.schedule && site.schedule.length > 0 && (
            <div className="mb-3">
              <h5 className="text-xs font-bold text-gray-500 uppercase mb-2">Schedule</h5>
              <div className="space-y-1">
                {site.schedule.map((sched, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <span className="bg-az-blue/10 text-az-blue font-bold px-2 py-0.5 rounded text-xs">
                      {sched.dayFormatted}
                    </span>
                    <span className="text-gray-600">{sched.hours}</span>
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

export default function SiteMap() {
  const { sites, loading } = useSiteData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCounties, setSelectedCounties] = useState([]);
  const [activeSite, setActiveSite] = useState(null);
  
  // Apply filters
  const filteredSites = useMemo(() => {
    let result = sites;
    result = searchSites(result, searchQuery);
    result = filterSitesByCounties(result, selectedCounties);
    result = filterSitesByDate(result, selectedDate);
    return result;
  }, [sites, searchQuery, selectedCounties, selectedDate]);
  
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDate(null);
    setSelectedCounties([]);
  };
  
  const hasFilters = searchQuery || selectedDate || selectedCounties.length > 0;

  return (
    <section className="w-full bg-gray-100 border-t border-gray-200 flex flex-col lg:flex-row min-h-[800px] lg:h-[800px]" id="map">
      {/* Sidebar */}
      <div className="w-full lg:w-[440px] bg-white flex flex-col border-r border-gray-200 h-auto lg:h-full z-10 shadow-lg">
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
              placeholder="Search name, city, or zip..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-az-blue focus:border-transparent outline-none transition-all placeholder-gray-400 font-medium"
            />
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              search
            </span>
          </div>
          
          {/* County filter */}
          <div className="mb-4">
            <label className="text-xs font-bold uppercase text-gray-500 block mb-2 tracking-wide">
              Filter by County
            </label>
            <CountySelect 
              selectedCounties={selectedCounties} 
              onChange={setSelectedCounties} 
            />
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
          />
        </MapContainer>
      </div>
    </section>
  );
}
