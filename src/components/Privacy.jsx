import { motion } from 'framer-motion';

export default function Privacy() {
  return (
    <section className="py-16 bg-gray-900 text-white" id="privacy">
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 mb-6 border border-gray-700"
            whileHover={{ scale: 1.1 }}
          >
            <motion.span
              className="material-symbols-outlined text-3xl text-green-400"
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              shield_lock
            </motion.span>
          </motion.div>

          <h2 className="text-3xl font-black uppercase mb-4">Your Privacy Matters</h2>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
            Your information is kept private and secure. All data is reported in aggregate to protect your identity. We do not share your personal details with law enforcement, parents, or government agencies.
          </p>

          <div className="flex justify-center gap-8 text-sm font-bold uppercase text-gray-500">
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ color: "#4ade80" }}
            >
              <span className="material-symbols-outlined">lock</span>
              Private & Secure
            </motion.div>
            <motion.div
              className="flex items-center gap-2"
              whileHover={{ color: "#4ade80" }}
            >
              <span className="material-symbols-outlined">shield</span>
              Data Protected
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
