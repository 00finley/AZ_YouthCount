import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const navLinks = [
  { href: '#about', label: 'About' },
  { href: '#eligibility', label: 'Am I Eligible?' },
  { href: '#expect', label: 'What to Expect' },
  { href: '#map', label: 'Find a Site' },
  { href: '/resources', label: 'Resources', external: true },
  { href: '#media-partners', label: 'Media & Partners' },
];

export default function Header({ mobileMenuOpen, setMobileMenuOpen }) {
  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <motion.a 
              href="#"
              className="flex items-center gap-3"
              whileTap={{ scale: 0.98 }}
            >
              <img 
                src="/logo.png" 
                alt="Arizona 2026 Youth Count" 
                className="h-16 w-auto"
              />
            </motion.a>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              <nav className="flex gap-5">
                {navLinks.map((link) => (
                  link.external ? (
                    <motion.div key={link.href} whileHover={{ y: -2 }}>
                      <Link
                        to={link.href}
                        className="text-sm font-bold uppercase tracking-wide text-gray-700 hover:text-az-orange transition-colors relative group"
                      >
                        {link.label}
                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-az-orange transition-all duration-300 group-hover:w-full" />
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      className="text-sm font-bold uppercase tracking-wide text-gray-700 hover:text-az-orange transition-colors relative group"
                      whileHover={{ y: -2 }}
                    >
                      {link.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-az-orange transition-all duration-300 group-hover:w-full" />
                    </motion.a>
                  )
                ))}
              </nav>
              
              <motion.a
                href="#participate"
                className="btn-glow inline-flex h-12 items-center justify-center rounded-lg bg-az-blue px-6 text-sm font-black uppercase tracking-wide text-white shadow-lg hover:bg-cyan-600 transition-all"
                whileHover={{ y: -2, boxShadow: "0 10px 30px rgba(0, 178, 227, 0.3)" }}
                whileTap={{ scale: 0.98 }}
              >
                Share Your Story
              </motion.a>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
              className="lg:hidden text-gray-900 hover:text-az-orange p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-3xl">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </motion.button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            />
            
            <motion.div
              className="fixed top-20 left-0 right-0 bg-white z-50 lg:hidden shadow-2xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              <nav className="flex flex-col p-6 gap-2">
                {navLinks.map((link, index) => (
                  link.external ? (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Link
                        to={link.href}
                        className="block text-lg font-bold uppercase tracking-wide text-gray-900 hover:text-az-orange py-3 px-4 rounded-lg hover:bg-gray-50 transition-all"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.a
                      key={link.href}
                      href={link.href}
                      className="text-lg font-bold uppercase tracking-wide text-gray-900 hover:text-az-orange py-3 px-4 rounded-lg hover:bg-gray-50 transition-all"
                      onClick={() => setMobileMenuOpen(false)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {link.label}
                    </motion.a>
                  )
                ))}
                
                <motion.a
                  href="#participate"
                  className="mt-4 inline-flex h-14 items-center justify-center rounded-lg bg-az-blue px-6 text-lg font-black uppercase tracking-wide text-white shadow-lg"
                  onClick={() => setMobileMenuOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Share Your Story
                </motion.a>
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
