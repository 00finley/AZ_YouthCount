import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

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

// Main landing page
function HomePage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background-light font-display">
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
    </Routes>
  );
}

export default App;
