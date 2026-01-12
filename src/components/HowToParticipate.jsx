import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function HowToParticipate() {
  return (
    <section className="py-20 lg:py-28 bg-background-off" id="participate">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-az-blue font-black uppercase tracking-widest text-sm mb-2 block">
            Choose Your Path
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 uppercase">
            How to Participate
          </h2>
          <p className="text-xl text-gray-600 font-medium">
            We've made it easy. Choose the option that works best for you.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Visit a Magnet Site */}
          <motion.div
            className="group bg-white rounded-3xl p-2 shadow-xl border border-gray-100 flex flex-col"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ 
              y: -8, 
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
              transition: { duration: 0.3 }
            }}
          >
            <div className="bg-az-purple/5 rounded-2xl p-8 h-full flex flex-col items-center text-center">
              <motion.div 
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-az-purple shadow-md mb-6"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <span className="material-symbols-outlined text-5xl">map</span>
              </motion.div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-3 uppercase">
                Visit a Magnet Site
              </h3>
              
              <p className="text-gray-600 mb-6 font-medium">
                Head to one of our designated safe locations. Meet our team, grab some food, and take the survey in a safe space.
              </p>
              
              <motion.a
                href="#map"
                className="mt-auto text-az-purple font-black uppercase tracking-wide flex items-center gap-1"
                whileHover={{ gap: 8 }}
                transition={{ duration: 0.2 }}
              >
                View Map 
                <span className="material-symbols-outlined">arrow_forward</span>
              </motion.a>
            </div>
          </motion.div>

          {/* Schedule Virtual Call */}
          <motion.div
            className="group bg-white rounded-3xl p-2 shadow-xl border border-gray-100 flex flex-col"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ 
              y: -8, 
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
              transition: { duration: 0.3 }
            }}
          >
            <div className="bg-az-blue/5 rounded-2xl p-8 h-full flex flex-col items-center text-center">
              <motion.div 
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-az-blue shadow-md mb-6"
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ duration: 0.3 }}
              >
                <span className="material-symbols-outlined text-5xl">devices</span>
              </motion.div>
              
              <h3 className="text-2xl font-black text-gray-900 mb-3 uppercase">
                Schedule Virtual Call
              </h3>
              
              <p className="text-gray-600 mb-6 font-medium">
                Prefer to stay digital? Connect with us via Phone, Zoom, or Discord at a time that works for you.
              </p>
              
              <Link
                to="/register"
                className="mt-auto inline-flex items-center justify-center px-6 py-3 rounded-lg bg-az-blue text-white font-black uppercase tracking-wide shadow-lg hover:bg-cyan-600 transition-colors"
              >
                Schedule Now
                <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
