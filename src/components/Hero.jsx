import { motion, useReducedMotion } from 'framer-motion';
import { CONFIG } from '../config';
import { useEffect, useState } from 'react';

// Hook to detect mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}

export default function Hero() {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  
  // Disable animations on mobile or if user prefers reduced motion
  const shouldAnimate = !isMobile && !prefersReducedMotion;

  return (
    <section className="relative pt-8 pb-12 md:pt-12 md:pb-20 lg:pt-24 lg:pb-32 overflow-hidden bg-az-purple">
      {/* Background effects - simplified on mobile */}
      <div className="absolute inset-0 bg-grit-pattern mix-blend-overlay opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-az-purple via-indigo-900 to-purple-900 z-0" />
      
      {shouldAnimate && (
        <>
          <motion.div 
            className="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-az-orange/20 rounded-full blur-3xl z-0 mix-blend-screen"
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{ 
              duration: 8, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          
          <motion.div 
            className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-az-blue/20 rounded-full blur-3xl z-0 mix-blend-screen"
            animate={{ 
              scale: [1.1, 1, 1.1],
              opacity: [0.2, 0.3, 0.2]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </>
      )}

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Mobile: Image at top with text overlay approach */}
        {/* Desktop: Side by side layout */}
        
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-12 items-center">
          {/* Left content */}
          <div className="flex flex-col gap-4 md:gap-6 max-w-2xl order-2 lg:order-1">
            {/* Date banner */}
            <motion.div 
              className="mb-2"
              initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-2 text-az-orange/90">
                <span className="material-symbols-outlined text-2xl md:text-3xl">
                  calendar_month
                </span>
                <span className="text-sm md:text-lg font-bold uppercase tracking-widest">Mark Your Calendar</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-none drop-shadow-xl">
                {CONFIG.COUNT_START_DATE.split(',')[0]} <span className="text-az-orange">–</span><br />
                {CONFIG.COUNT_END_DATE}
              </h2>
            </motion.div>

            {/* Main headline */}
            <div className="leading-none">
              <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-9xl font-black tracking-tighter text-white drop-shadow-2xl">
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                  2026
                </span>
                <span className="block text-az-blue text-shadow-lg">
                  YOUTH
                </span>
                <span className="block text-az-orange text-shadow-lg">
                  COUNT
                </span>
              </h1>
            </div>

            {/* Tagline */}
            <div className="flex flex-col gap-3 md:gap-4 mt-2">
              <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white/90">
                Shape our tomorrow by sharing today.
              </p>
              
              {/* Larger tagline items */}
              <div className="flex flex-col gap-1 md:gap-2 pl-4 border-l-4 border-az-blue">
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-wide text-az-blue">
                  Share your story.
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-wide text-az-orange">
                  Get paid.
                </p>
                <p className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black uppercase tracking-wide text-white">
                  Make an impact.
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3 md:gap-4 pt-4 md:pt-6">
              <motion.a
                href="#participate"
                className="group relative inline-flex h-14 md:h-16 items-center justify-center rounded-xl bg-az-orange px-6 md:px-8 text-lg md:text-xl font-black uppercase text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]"
                whileHover={shouldAnimate ? { 
                  x: 2, 
                  y: 2, 
                  boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.3)" 
                } : {}}
                whileTap={{ scale: 0.98 }}
              >
                <span className="mr-2">Get Started</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </motion.a>
              
              <motion.a
                href="#about"
                className="inline-flex h-14 md:h-16 items-center justify-center rounded-xl border-4 border-white/20 bg-transparent px-6 md:px-8 text-lg md:text-xl font-black uppercase text-white hover:bg-white/10 transition-all"
                whileTap={{ scale: 0.98 }}
              >
                Learn More
              </motion.a>
            </div>
          </div>

          {/* Right content - Image + Gift Card */}
          <div className="relative flex items-center justify-center lg:justify-end order-1 lg:order-2 mb-4 lg:mb-0">
            <div className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-sm lg:max-w-lg">
              {/* Main image - speaker at podium */}
              <div className="rounded-2xl md:rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl relative z-10 aspect-[4/5]">
                <img
                  alt="Young person speaking at podium"
                  className="w-full h-full object-cover"
                  src="/hero-speaker.jpg"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-az-purple/10 mix-blend-overlay" />
              </div>

              {/* Gift card callout - positioned to not get cut off */}
              <motion.div 
                className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 md:-bottom-8 md:-left-8 lg:-left-12 z-20"
                initial={shouldAnimate ? { opacity: 0, y: 30, rotate: -5 } : false}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
              >
                <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-2xl border-4 border-az-blue max-w-[200px] sm:max-w-[240px] md:max-w-[280px] text-center relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-24 h-24 bg-az-orange/20 rounded-full blur-xl" />
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-az-blue rounded-full flex items-center justify-center text-white mb-1 md:mb-2 shadow-lg">
                      <span className="material-symbols-outlined text-2xl md:text-3xl">card_giftcard</span>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-black text-az-purple mb-0">${CONFIG.GIFT_CARD_AMOUNT}</h3>
                    <div className="text-base md:text-lg font-black uppercase tracking-tight text-gray-800">Gift Card</div>
                    <p className="text-gray-500 font-bold text-xs md:text-sm mt-1">For your time & story</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
