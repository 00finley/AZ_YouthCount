import { motion } from 'framer-motion';
import { CONFIG } from '../config';

export default function Footer() {
  return (
    <footer className="bg-background-off pt-16 pb-8 border-t border-gray-200">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="col-span-1">
            <motion.div 
              className="flex items-center gap-2 mb-4"
              whileHover={{ x: 4 }}
            >
              <img 
                src="/logo.png" 
                alt="Arizona 2026 Youth Count" 
                className="h-12 w-auto"
              />
            </motion.div>
            <p className="text-sm text-gray-500 font-medium">
              Empowering Arizona's youth through data, system improvement, and community support.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-black text-gray-900 mb-4 uppercase">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-600 font-medium">
              {[
                { href: '#about', label: 'About the Count' },
                { href: '#participate', label: 'Participate' },
                { href: '#get-involved', label: 'Partner With Us' },
                { href: '#toolkit', label: 'Resource Guide' },
              ].map(link => (
                <li key={link.href}>
                  <motion.a 
                    href={link.href}
                    className="hover:text-az-orange transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-black text-gray-900 mb-4 uppercase">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600 font-medium">
              {['Privacy Policy', 'Terms of Use', 'Data Protection'].map(item => (
                <li key={item}>
                  <motion.a 
                    href="#"
                    className="hover:text-az-orange transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    {item}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-black text-gray-900 mb-4 uppercase">Contact</h4>
            <ul className="space-y-2 text-sm text-gray-600 font-medium">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xs">mail</span>
                <a href={`mailto:${CONFIG.CONTACT_EMAIL}`} className="hover:text-az-orange transition-colors">
                  {CONFIG.CONTACT_EMAIL}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xs">call</span>
                <a href={`tel:${CONFIG.CONTACT_PHONE.replace(/[^\d]/g, '')}`} className="hover:text-az-orange transition-colors">
                  {CONFIG.CONTACT_PHONE}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 text-center md:text-left font-bold uppercase">
            © 2026 Arizona Youth Count. All rights reserved.
          </p>

          {/* Instagram only */}
          <div className="flex gap-4">
            <motion.a
              href={CONFIG.SOCIAL.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-az-blue transition-colors"
              whileHover={{ scale: 1.2, y: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <span className="sr-only">Instagram</span>
              <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.409-.06 3.809-.06zm1.49 11.006a3.292 3.292 0 11-6.61 0 3.292 3.292 0 016.61 0zM17.25 6.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-11.25 6.75a5.25 5.25 0 1010.5 0 5.25 5.25 0 00-10.5 0z" fillRule="evenodd" clipRule="evenodd" />
              </svg>
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
}
