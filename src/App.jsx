import { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Eligibility from './components/Eligibility';
import WhatToExpect from './components/WhatToExpect';
import HowToParticipate from './components/HowToParticipate';
import SiteMap from './components/SiteMap';
import Toolkit from './components/Toolkit';
import GetInvolved from './components/GetInvolved';
import MediaCenter from './components/MediaCenter';
import Privacy from './components/Privacy';
import Footer from './components/Footer';
import EmergencyBanner from './components/EmergencyBanner';

function App() {
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
        <Toolkit />
        <GetInvolved />
        <MediaCenter />
        <Privacy />
      </main>
      
      <Footer />
      <EmergencyBanner />
    </div>
  );
}

export default App;
