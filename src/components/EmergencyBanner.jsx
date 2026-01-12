import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmergencyBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-4 right-4 z-50"
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ delay: 1, duration: 0.3 }}
      >
        <motion.a
          href="tel:988"
          className="bg-red-600 hover:bg-red-700 text-white font-black py-3 px-6 rounded-full shadow-2xl flex items-center gap-2 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <motion.span 
            className="material-symbols-outlined"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            call
          </motion.span>
          <span className="uppercase tracking-wide text-sm">Need Help Now? Call 988</span>
          
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsVisible(false);
            }}
            className="ml-2 hover:bg-red-800 rounded-full p-1 transition-colors"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </motion.a>
      </motion.div>
    </AnimatePresence>
  );
}
