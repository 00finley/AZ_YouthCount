import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Temporary closure notice for virtual registration
export default function VirtualRegistrationClosed() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 flex items-center justify-center p-4">
      {/* Background logo */}
      <div className="absolute inset-y-0 -left-24 md:-left-12 lg:left-8 flex items-center pointer-events-none opacity-10">
        <img src="/logo.png" alt="" className="w-[350px] md:w-[450px] lg:w-[550px] h-auto" />
      </div>

      <motion.div
        className="bg-white rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-2xl relative z-10"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="w-20 h-20 bg-az-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-5xl text-az-orange">engineering</span>
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-4">
          Virtual Registration Temporarily Unavailable
        </h1>

        <p className="text-gray-600 mb-6 text-lg">
          We're experiencing technical difficulties with our online registration system.
          We apologize for the inconvenience.
        </p>

        <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
          <h2 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-az-blue">info</span>
            What you can do:
          </h2>
          <ul className="space-y-3 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
              <span><strong>Check back later</strong> – we're working to restore service soon</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
              <span><strong>Visit a magnet site</strong> – find a location near you to complete your survey in person</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/#map"
            className="inline-flex items-center justify-center gap-2 bg-az-purple text-white font-bold px-6 py-4 rounded-xl shadow-lg hover:bg-purple-700 transition-colors"
          >
            <span className="material-symbols-outlined">location_on</span>
            Find a Magnet Site
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-700 font-bold px-6 py-4 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to Home
          </Link>
        </div>

        <p className="text-sm text-gray-400 mt-8">
          Questions? Contact us at{' '}
          <a href="mailto:mfinley@azmag.gov" className="text-az-blue underline">
            mfinley@azmag.gov
          </a>
        </p>
      </motion.div>
    </div>
  );
}
