import { useState, useEffect } from 'react';
import { Routes, Route, useSearchParams } from 'react-router-dom';

// Main page components
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Eligibility from './components/Eligibility';
import WhatToExpect from './components/WhatToExpect';
import HowToParticipate from './components/HowToParticipate';
import SiteMap from './components/SiteMap';
import StayConnected from './components/StayConnected';
// Toolkit and MediaCenter are hidden temporarily
// import Toolkit from './components/Toolkit';
// import MediaCenter from './components/MediaCenter';
import MediaAndPartners from './components/MediaAndPartners';
import GetInvolved from './components/GetInvolved';
import Privacy from './components/Privacy';
import Footer from './components/Footer';
import EmergencyBanner from './components/EmergencyBanner';

// Pages
import VirtualRegistration from './pages/VirtualRegistration';
import NotFound from './pages/NotFound';

// Main landing page
function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showGeoMessage, setShowGeoMessage] = useState(false);

  useEffect(() => {
    if (searchParams.get('restricted') === 'geo') {
      setShowGeoMessage(true);
      // Remove the query param from URL
      searchParams.delete('restricted');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="min-h-screen bg-background-light font-display">
      {showGeoMessage && (
        <div className="bg-az-orange text-white px-4 py-3 text-center relative">
          <p className="font-bold">
            Virtual registration is currently only available to participants in Arizona.
          </p>
          <button
            onClick={() => setShowGeoMessage(false)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-white/80"
            aria-label="Dismiss"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}
      <Header
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />

      <main>
        <Hero />
        <About />
        <Eligibility />
        <WhatToExpect />
        <HowToParticipate />
        <SiteMap />
        <StayConnected />
        {/* Toolkit and MediaCenter sections are temporarily hidden */}
        {/* <Toolkit /> */}
        {/* <MediaCenter /> */}
        <MediaAndPartners />
        <GetInvolved />
        <Privacy />
      </main>

      <Footer />
      <EmergencyBanner />
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<VirtualRegistration />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
