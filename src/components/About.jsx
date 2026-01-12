import { motion } from 'framer-motion';
import { useScrollReveal } from '../utils/animations';

export default function About() {
  const [ref, isVisible] = useScrollReveal(0.2);

  return (
    <section className="py-20 lg:py-24 bg-white" id="about">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-12 gap-12 items-center">
          {/* Left - Image */}
          <motion.div 
            className="md:col-span-5 relative"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="aspect-square rounded-3xl overflow-hidden relative shadow-2xl">
              <img
                src="/about-image.jpg"
                alt="Community outreach"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-az-purple/30 to-transparent" />
            </div>
            
            {/* Decorative elements */}
            <motion.div
              className="absolute -top-4 -right-4 w-24 h-24 bg-az-blue/20 rounded-full blur-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.div
              className="absolute -bottom-4 -left-4 w-20 h-20 bg-az-orange/20 rounded-full blur-xl"
              animate={{ scale: [1.2, 1, 1.2] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>

          {/* Right - Content */}
          <div className="md:col-span-7" ref={ref}>
            <motion.span 
              className="text-az-blue font-black uppercase tracking-widest text-sm mb-2 block"
              initial={{ opacity: 0 }}
              animate={isVisible ? { opacity: 1 } : {}}
              transition={{ duration: 0.4 }}
            >
              Our Mission
            </motion.span>
            
            <motion.h2 
              className="text-4xl md:text-5xl font-black text-gray-900 mb-6 uppercase leading-none"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              What is the<br /> <span className="text-az-purple">Youth Count?</span>
            </motion.h2>
            
            <motion.div 
              className="space-y-6 text-lg text-gray-600 font-medium"
              initial={{ opacity: 0, y: 20 }}
              animate={isVisible ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <p>
                The <strong className="text-gray-900">Arizona 2026 Youth Count</strong> is the state's first dedicated, statewide effort to hear directly from young people (ages 18-24) facing housing challenges. From urban centers to rural communities, we are building a complete picture of youth homelessness.
              </p>
              <p>
                Traditional counts often miss young people because youth homelessness looks different. It's not just sleeping on the street—it's couch surfing, staying in motels, trading labor for a place to sleep, or living in cars.
              </p>
              
              <motion.div 
                className="bg-background-off p-6 rounded-xl border-l-4 border-az-orange"
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
              >
                <p className="text-gray-900 font-bold italic">
                  "We cannot solve a problem we do not understand. Your story helps us secure funding, design better programs, and prove to leaders that youth housing instability is an urgent crisis."
                </p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
