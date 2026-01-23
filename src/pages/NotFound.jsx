import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-az-purple via-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* 404 Number */}
          <h1 className="text-9xl font-black text-white/20 mb-4">404</h1>

          {/* Icon */}
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <span className="material-symbols-outlined text-6xl text-white">
              explore_off
            </span>
          </div>

          {/* Message */}
          <h2 className="text-3xl font-black text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-white/70 mb-8 max-w-md mx-auto">
            Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-az-orange text-white font-black uppercase px-8 py-4 rounded-xl shadow-lg hover:bg-orange-600 transition-colors"
            >
              <span className="material-symbols-outlined">home</span>
              Go Home
            </Link>
            <Link
              to="/#participate"
              className="inline-flex items-center gap-2 bg-white/10 text-white font-black uppercase px-8 py-4 rounded-xl hover:bg-white/20 transition-colors"
            >
              <span className="material-symbols-outlined">calendar_today</span>
              Get Started
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
