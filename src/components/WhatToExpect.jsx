import { motion } from 'framer-motion';

const steps = [
  {
    number: 1,
    title: 'Connect',
    description: 'Meet with a real person at a magnet site, on the street, or virtually via Zoom.',
    color: 'az-blue',
  },
  {
    number: 2,
    title: 'Share',
    description: 'Take a 15-20 minute anonymous survey about your housing experience.',
    color: 'az-purple',
  },
  {
    number: 3,
    title: 'Get Paid',
    description: 'Receive a $25 gift card for your time plus info on local resources.',
    color: 'az-orange',
  },
];

export default function WhatToExpect() {
  return (
    <section className="py-20 lg:py-28 bg-white border-b border-gray-100" id="expect">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-az-blue font-black uppercase tracking-widest text-sm mb-2 block">
            Step-by-Step
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 uppercase">
            What to Expect
          </h2>
          <p className="text-xl text-gray-600 font-medium mt-4">
            Participating is simple, safe, and confidential. Here is how it works.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-2 bg-gray-100 rounded-full -z-0" />
          
          {/* Animated progress line */}
          <motion.div 
            className="hidden md:block absolute top-12 left-[16%] h-2 bg-gradient-to-r from-az-blue via-az-purple to-az-orange rounded-full -z-0"
            initial={{ width: 0 }}
            whileInView={{ width: "68%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
          />

          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="relative z-10 flex flex-col items-center text-center group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
            >
              {/* Number circle */}
              <motion.div 
                className={`w-24 h-24 bg-white rounded-full border-[6px] border-${step.color} flex items-center justify-center shadow-xl mb-8`}
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.3 }}
                style={{ 
                  borderColor: step.color === 'az-blue' ? '#00B2E3' : 
                               step.color === 'az-purple' ? '#5C2D91' : '#FF7500' 
                }}
              >
                <span 
                  className="text-4xl font-black"
                  style={{ 
                    color: step.color === 'az-blue' ? '#00B2E3' : 
                           step.color === 'az-purple' ? '#5C2D91' : '#FF7500' 
                  }}
                >
                  {step.number}
                </span>
              </motion.div>

              {/* Content */}
              <motion.h3 
                className="text-2xl font-black uppercase mb-3 text-gray-900 transition-colors"
                whileHover={{ 
                  color: step.color === 'az-blue' ? '#00B2E3' : 
                         step.color === 'az-purple' ? '#5C2D91' : '#FF7500' 
                }}
              >
                {step.title}
              </motion.h3>
              
              <p className="text-lg text-gray-600 font-medium leading-relaxed px-4">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
