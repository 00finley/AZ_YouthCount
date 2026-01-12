import { motion } from 'framer-motion';
import { CONFIG } from '../config';

export default function MediaCenter() {
  return (
    <section className="py-20 bg-az-blue text-white relative overflow-hidden" id="media-center">
      <div className="absolute inset-0 bg-grit-pattern mix-blend-overlay opacity-20 pointer-events-none" />
      
      <motion.div 
        className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-black uppercase mb-6 tracking-tight drop-shadow-md">
            Press & Media
          </h2>
          <p className="text-xl md:text-2xl font-medium opacity-95 leading-relaxed mb-10">
            For media inquiries, interviews, or data requests regarding the 2026 Youth Count.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            <motion.a
              href={`mailto:${CONFIG.CONTACT_EMAIL}`}
              className="flex items-center gap-3 bg-white text-az-blue px-8 py-4 rounded-xl font-black uppercase tracking-wide shadow-lg"
              whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="material-symbols-outlined">mail</span>
              {CONFIG.CONTACT_EMAIL}
            </motion.a>

            <motion.button
              className="flex items-center gap-3 bg-transparent border-4 border-white text-white px-8 py-4 rounded-xl font-black uppercase tracking-wide"
              whileHover={{ 
                backgroundColor: "rgba(255,255,255,0.1)",
                y: -4 
              }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="material-symbols-outlined">folder_zip</span>
              Download Media Kit
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
