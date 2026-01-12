import { motion } from 'framer-motion';

const eligibilityItems = [
  {
    icon: 'cake',
    title: 'Ages 18-24',
    description: 'You are a young adult currently between the ages of 18 and 24.',
  },
  {
    icon: 'night_shelter',
    title: 'Housing Challenges',
    description: 'You are facing unstable housing, couch surfing, or don\'t have a permanent home.',
  },
  {
    icon: 'location_on',
    title: 'Living in Arizona',
    description: 'You are currently located anywhere within the state of Arizona.',
  },
];

export default function Eligibility() {
  return (
    <section className="py-20 lg:py-28 bg-az-orange text-white relative overflow-hidden shadow-2xl" id="eligibility">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grit-pattern mix-blend-overlay opacity-20 pointer-events-none" />
      <motion.div 
        className="absolute -top-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl mix-blend-overlay"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Infinity }}
      />
      <motion.div 
        className="absolute -bottom-40 -right-40 w-96 h-96 bg-az-purple/30 rounded-full blur-3xl mix-blend-multiply"
        animate={{ scale: [1.2, 1, 1.2] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div 
          className="text-center mb-16 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-5xl md:text-6xl font-black uppercase mb-6 tracking-tight drop-shadow-md">
            Is This For Me?
          </h2>
          <p className="text-xl md:text-3xl font-bold opacity-95 leading-tight">
            Couch surfing? Between places? Not sure where you'll stay?
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {eligibilityItems.map((item, index) => (
            <motion.div
              key={item.title}
              className="bg-white/10 backdrop-blur-md border border-white/30 rounded-3xl p-8 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ 
                backgroundColor: "rgba(255,255,255,0.2)",
                y: -8,
                transition: { duration: 0.3 }
              }}
            >
              <motion.div 
                className="w-20 h-20 rounded-full bg-white text-az-orange flex items-center justify-center mb-6 shadow-lg"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <span className="material-symbols-outlined text-5xl">{item.icon}</span>
              </motion.div>
              
              <h3 className="text-2xl font-black uppercase mb-3 tracking-wide">
                {item.title}
              </h3>
              
              <p className="font-medium text-lg leading-relaxed text-white/90">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
