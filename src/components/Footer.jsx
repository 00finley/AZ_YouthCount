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
              <div className="text-az-purple">
                <svg fill="currentColor" height="30" viewBox="0 0 100 100" width="30" xmlns="http://www.w3.org/2000/svg">
                  <path d="M25 15 L85 15 L85 95 L15 95 L15 40 Z"></path>
                </svg>
              </div>
              <h3 className="font-black text-lg text-gray-900 uppercase">AZ Youth Count</h3>
            </motion.div>
            <p className="text-sm text-gray-500 font-medium">
              Empowering Arizona's youth through data, advocacy, and community support.
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

          {/* Social links */}
          <div className="flex gap-4">
            {[
              { 
                name: 'Facebook', 
                href: CONFIG.SOCIAL.facebook,
                icon: 'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z'
              },
              { 
                name: 'Twitter', 
                href: CONFIG.SOCIAL.twitter,
                icon: 'M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84'
              },
              { 
                name: 'Instagram', 
                href: CONFIG.SOCIAL.instagram,
                icon: 'M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772 4.902 4.902 0 011.772-1.153c.636-.247 1.363-.416 2.427-.465 1.067-.047 1.409-.06 3.809-.06zm1.49 11.006a3.292 3.292 0 11-6.61 0 3.292 3.292 0 016.61 0zM17.25 6.75a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zm-11.25 6.75a5.25 5.25 0 1010.5 0 5.25 5.25 0 00-10.5 0z'
              },
            ].map(social => (
              <motion.a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-az-blue transition-colors"
                whileHover={{ scale: 1.2, y: -2 }}
                whileTap={{ scale: 0.9 }}
              >
                <span className="sr-only">{social.name}</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d={social.icon} fillRule="evenodd" clipRule="evenodd" />
                </svg>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
