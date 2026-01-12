import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useSiteData, filterSitesByDay, filterSitesByCity, searchSites, getUniqueCities } from '../hooks/useSiteData';
import { CONFIG } from '../config';

// Custom marker icons
const createMarkerIcon = (status) => {
  const colors = {
    open: '#BE1E2D',      // az-red for open
    closed: '#6B7280',    // gray for closed
    coming_soon: '#5C2D91', // az-purple for coming soon
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
        <div className="mt-2 flex gap-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <span
              key={day}
              className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center ${
                site.daysOpen.includes(day) 
                  ? 'bg-az-blue text-white' 
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {day.charAt(0)}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// Day filter buttons
const days = [
  { key: 'Mon', label: 'M' },
  { key: 'Tue', label: 'T' },
  { key: 'Wed', label: 'W' },
  { key: 'Thu', label: 'T' },
  { key: 'Fri', label: 'F' },
  { key: 'Sat', label: 'S' },
  { key: 'Sun', label: 'S' },
];

export default function SiteMap() {
  const { sites, loading, error } = useSiteData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [activeSite, setActiveSite] = useState(null);
  
  // Get unique cities for filter
  const cities = useMemo(() => getUniqueCities(sites), [sites]);
  
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
    setSelectedDay(null);
    setSelectedCity(null);
  };
  
  const hasFilters = searchQuery || selectedDay || selectedCity;

  return (
    <section className="w-full bg-gray-100 border-t border-gray-200 flex flex-col lg:flex-row h-[800px] lg:h-[700px]" id="map">
      {/* Sidebar */}
      <div className="w-full lg:w-[400px] bg-white flex flex-col border-r border-gray-200 h-[50%] lg:h-full z-10 shadow-lg">
        {/* Header & Filters */}
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
                Clear
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
          
          {/* Day filter */}
          <div className="mb-4">
            <span className="text-xs font-bold uppercase text-gray-500 block mb-2 tracking-wide">
              Open On
            </span>
            <div className="flex justify-between">
              {days.map((day, index) => (
                <motion.button
                  key={day.key}
                  onClick={() => setSelectedDay(selectedDay === day.key ? null : day.key)}
                  className={`w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                    selectedDay === day.key
                      ? 'bg-az-blue text-white'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  title={day.key}
                >
                  {day.label}
                </motion.button>
              ))}
            </div>
          </div>
          
          {/* City filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {cities.map(city => (
              <motion.button
                key={city}
                onClick={() => setSelectedCity(selectedCity === city ? null : city)}
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase whitespace-nowrap transition-colors ${
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
        
        {/* Site list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
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
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
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
      <div className="flex-1 relative h-[50%] lg:h-full">
        <MapContainer
          center={CONFIG.MAP_CENTER}
          zoom={CONFIG.MAP_ZOOM}
          className="w-full h-full z-0"
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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
                    <div className="flex flex-wrap gap-1">
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
                    className="mt-3 inline-flex items-center gap-1 text-az-blue font-bold text-sm hover:underline"
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
