import { motion } from 'framer-motion';
import { CONFIG } from '../config';
import { useAnimatedCounter } from '../utils/animations';

export default function Hero() {
  const [giftCardAmount, startCounter] = useAnimatedCounter(CONFIG.GIFT_CARD_AMOUNT, 1500, false);

  return (
    <section className="relative pt-12 pb-20 lg:pt-24 lg:pb-32 overflow-hidden bg-az-purple">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grit-pattern mix-blend-overlay opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-br from-az-purple via-indigo-900 to-purple-900 z-0" />
      
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

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="flex flex-col gap-6 max-w-2xl">
            {/* Date banner */}
            <motion.div 
              className="mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-2 text-az-orange/90">
                <motion.span 
                  className="material-symbols-outlined text-3xl"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                >
                  calendar_month
                </motion.span>
                <span className="text-lg font-bold uppercase tracking-widest">Mark Your Calendar</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-none drop-shadow-xl">
                {CONFIG.COUNT_START_DATE.split(',')[0]} <span className="text-az-orange">–</span><br />
                {CONFIG.COUNT_END_DATE}
              </h2>
            </motion.div>

            {/* Main headline */}
            <motion.div 
              className="leading-none"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-6xl sm:text-7xl xl:text-9xl font-black tracking-tighter text-white drop-shadow-2xl">
                <motion.span 
                  className="block text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  2026
                </motion.span>
                <motion.span 
                  className="block text-az-blue text-shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  YOUTH
                </motion.span>
                <motion.span 
                  className="block text-az-orange text-shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  COUNT
                </motion.span>
              </h1>
            </motion.div>

            {/* Tagline */}
            <motion.div 
              className="flex flex-col gap-4 mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <p className="text-2xl sm:text-3xl font-bold text-white/90">
                Shape our tomorrow by sharing today.
              </p>
              
              <div className="flex flex-col gap-1 pl-4 border-l-4 border-az-blue">
                {['Share your story.', 'Get paid.', 'Make an impact.'].map((text, i) => (
                  <motion.p
                    key={text}
                    className={`text-lg sm:text-xl font-bold uppercase tracking-wider ${
                      i === 0 ? 'text-az-blue' : i === 1 ? 'text-az-orange' : 'text-white'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                  >
                    {text}
                  </motion.p>
                ))}
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-wrap gap-4 pt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <motion.a
                href="#participate"
                className="group relative inline-flex h-16 items-center justify-center rounded-xl bg-az-orange px-8 text-xl font-black uppercase text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]"
                whileHover={{ 
                  x: 2, 
                  y: 2, 
                  boxShadow: "6px 6px 0px 0px rgba(0,0,0,0.3)" 
                }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="mr-2">Get Started</span>
                <motion.span 
                  className="material-symbols-outlined"
                  initial={{ x: 0 }}
                  whileHover={{ x: 4 }}
                >
                  arrow_forward
                </motion.span>
              </motion.a>
              
              <motion.a
                href="#about"
                className="inline-flex h-16 items-center justify-center rounded-xl border-4 border-white/20 bg-transparent px-8 text-xl font-black uppercase text-white hover:bg-white/10 transition-all"
                whileHover={{ borderColor: "rgba(255,255,255,0.4)" }}
                whileTap={{ scale: 0.98 }}
              >
                Learn More
              </motion.a>
            </motion.div>
          </div>

          {/* Right content - Image + Gift Card */}
          <motion.div 
            className="relative h-full min-h-[500px] flex items-center justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            onViewportEnter={startCounter}
          >
            <div className="relative w-full max-w-lg">
              {/* Main image */}
              <motion.div 
                className="rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl relative z-10 aspect-[4/5]"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  alt="Young people collaborating"
                  className="w-full h-full object-cover grayscale contrast-125"
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=1000&fit=crop&crop=faces"
                />
                <div className="absolute inset-0 bg-az-purple/20 mix-blend-overlay" />
              </motion.div>

              {/* Gift card callout */}
              <motion.div 
                className="absolute -bottom-8 -left-8 md:-left-12 z-20"
                initial={{ opacity: 0, y: 30, rotate: -5 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 200 }}
              >
                <motion.div 
                  className="bg-white rounded-2xl p-6 shadow-2xl border-4 border-az-blue max-w-[280px] text-center relative overflow-hidden"
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="absolute -right-10 -top-10 w-24 h-24 bg-az-orange/20 rounded-full blur-xl" />
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <motion.div 
                      className="w-12 h-12 bg-az-blue rounded-full flex items-center justify-center text-white mb-2 shadow-lg"
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
                    >
                      <span className="material-symbols-outlined text-3xl">card_giftcard</span>
                    </motion.div>
                    <h3 className="text-4xl font-black text-az-purple mb-0">${giftCardAmount}</h3>
                    <div className="text-lg font-black uppercase tracking-tight text-gray-800">Gift Card</div>
                    <p className="text-gray-500 font-bold text-xs mt-1">For your time & story</p>
                    <div className="mt-3 w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-az-orange to-red-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: "66%" }}
                        transition={{ delay: 1.5, duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
