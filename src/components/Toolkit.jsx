import { motion } from 'framer-motion';

const resources = [
  {
    icon: 'picture_as_pdf',
    title: 'Official Flyer',
    description: 'Print-ready flyer for posting and distribution',
    action: 'Download PDF',
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-600',
    hoverBorder: 'hover:border-az-purple',
    // Place your PDF in: public/downloads/youth-count-flyer.pdf
    href: '/downloads/youth-count-flyer.pdf',
    download: 'Arizona-Youth-Count-Flyer.pdf',
  },
  {
    icon: 'share',
    title: 'Social Media Kit',
    description: 'Graphics and captions for Instagram, Facebook, X',
    action: 'Download ZIP',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-az-blue',
    hoverBorder: 'hover:border-az-blue',
    // Place your ZIP in: public/downloads/social-media-kit.zip
    href: '/downloads/social-media-kit.zip',
    download: 'Arizona-Youth-Count-Social-Kit.zip',
  },
  {
    icon: 'storefront',
    title: 'Magnet Site Host Guide',
    description: 'Everything you need to host a survey location',
    action: 'Download PDF',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-az-orange',
    hoverBorder: 'hover:border-az-orange',
    // Place your PDF in: public/downloads/host-guide.pdf
    href: '/downloads/host-guide.pdf',
    download: 'Magnet-Site-Host-Guide.pdf',
  },
];

export default function Toolkit() {
  return (
    <section className="py-20 lg:py-24 bg-white border-t border-gray-200" id="toolkit">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-az-blue font-black uppercase tracking-widest text-sm mb-2 block">
            Partner Toolkit
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 uppercase">
            Spread the Word
          </h2>
          <p className="text-xl text-gray-600 font-medium max-w-2xl mx-auto mb-12">
            Help us reach more young people across Arizona. Download these resources to share with your community.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {resources.map((resource, index) => (
            <motion.a
              key={resource.title}
              href={resource.href}
              download={resource.download}
              className={`group flex flex-col items-center p-8 bg-background-off rounded-3xl shadow-lg border-2 border-transparent ${resource.hoverBorder} transition-all`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <motion.div 
                className={`w-16 h-16 rounded-2xl ${resource.bgColor} ${resource.textColor} flex items-center justify-center mb-4`}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <span className="material-symbols-outlined text-4xl">{resource.icon}</span>
              </motion.div>
              
              <h3 className="text-xl font-black text-gray-900 uppercase mb-2">
                {resource.title}
              </h3>
              
              <p className="text-gray-500 font-medium text-sm mb-4">
                {resource.description}
              </p>
              
              <span className={`text-sm font-bold ${resource.textColor} uppercase tracking-wide flex items-center`}>
                {resource.action} 
                <motion.span 
                  className="material-symbols-outlined text-lg ml-1"
                  initial={{ y: 0 }}
                  whileHover={{ y: 2 }}
                >
                  download
                </motion.span>
              </span>
            </motion.a>
          ))}
        </div>
        
        {/* Note for developers */}
        <p className="mt-8 text-sm text-gray-400">
          Resources coming soon
        </p>
      </div>
    </section>
  );
}
