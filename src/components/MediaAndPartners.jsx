import { motion } from 'framer-motion';
import { CONFIG } from '../config';

export default function MediaAndPartners() {
  return (
    <section className="py-20 lg:py-24 bg-az-blue relative overflow-hidden" id="media-partners">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-grit-pattern mix-blend-overlay opacity-10 pointer-events-none" />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
          {/* Media Section */}
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 lg:p-10 border border-white/20"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-white">newsmode</span>
              </div>
              <div>
                <span className="text-white/70 font-bold uppercase tracking-widest text-xs">For</span>
                <h3 className="text-2xl font-black text-white uppercase">Media</h3>
              </div>
            </div>

            <p className="text-white/80 font-medium mb-8 leading-relaxed">
              Interested in covering the Arizona 2026 Youth Count? We welcome media inquiries and can provide interviews, data, and background information.
            </p>

            <div className="space-y-4">
              <p className="text-white/60 text-sm font-bold uppercase tracking-wide">Media Contact</p>
              <motion.a
                href={`mailto:${CONFIG.CONTACT_EMAIL}?subject=Media Inquiry - Arizona Youth Count`}
                className="inline-flex items-center gap-3 bg-white text-az-blue px-6 py-4 rounded-xl font-black hover:bg-gray-100 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="material-symbols-outlined">mail</span>
                Contact for Media Inquiries
              </motion.a>
            </div>
          </motion.div>

          {/* Partner Resources Section */}
          <motion.div
            className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 lg:p-10 border border-white/20"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl text-white">handshake</span>
              </div>
              <div>
                <span className="text-white/70 font-bold uppercase tracking-widest text-xs">For</span>
                <h3 className="text-2xl font-black text-white uppercase">Partners</h3>
              </div>
            </div>

            <p className="text-white/80 font-medium mb-8 leading-relaxed">
              Help spread the word about the Youth Count! Download our official flyer to share with your organization, post in your community, or distribute to youth you serve.
            </p>

            <div className="space-y-4">
              <p className="text-white/60 text-sm font-bold uppercase tracking-wide">Download Resources</p>
              <motion.a
                href="/downloads/youth-count-flyer.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-az-orange text-white px-6 py-4 rounded-xl font-black hover:bg-orange-600 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="material-symbols-outlined">download</span>
                Download Official Flyer
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
