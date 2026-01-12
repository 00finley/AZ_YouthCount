import { useState } from 'react';
import { motion } from 'framer-motion';
import { CONFIG } from '../config';

const involvementOptions = [
  {
    icon: 'meeting_room',
    title: 'Host a Magnet Site',
    description: 'Provide a safe, welcoming space for young people to take the survey. We\'ll provide the training, materials, and gift cards.',
    color: 'bg-az-purple',
  },
  {
    icon: 'diversity_3',
    title: 'Support Outreach',
    description: 'Assist with street-level engagement or help promote the count within your existing networks and programs.',
    color: 'bg-az-blue',
  },
];

export default function GetInvolved() {
  const [formData, setFormData] = useState({
    organization: '',
    contact: '',
    email: '',
    interest: 'Host a Magnet Site',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(CONFIG.FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          _subject: `Partner Inquiry: ${formData.organization}`,
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({ organization: '', contact: '', email: '', interest: 'Host a Magnet Site' });
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section className="py-20 lg:py-24 bg-background-off border-t border-gray-200 relative overflow-hidden" id="get-involved">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Left - Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-az-orange font-black uppercase tracking-widest text-sm mb-2 block">
              For Organizations
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 uppercase">
              Get Involved
            </h2>
            <p className="text-xl text-gray-600 font-medium mb-10">
              We can't do this alone. We need community partners to help ensure every young person is counted.
            </p>

            <div className="space-y-8">
              {involvementOptions.map((option, index) => (
                <motion.div 
                  key={option.title}
                  className="flex gap-6"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                >
                  <motion.div 
                    className={`flex-shrink-0 w-14 h-14 ${option.color} text-white rounded-xl flex items-center justify-center shadow-lg`}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <span className="material-symbols-outlined text-3xl">{option.icon}</span>
                  </motion.div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{option.title}</h3>
                    <p className="text-gray-600 font-medium leading-relaxed">
                      {option.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - Form */}
          <motion.div
            className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-black text-gray-900 uppercase mb-6">Partner Inquiry</h3>

            {isSubmitted ? (
              <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <motion.div
                  className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  <span className="material-symbols-outlined text-4xl text-green-600">check_circle</span>
                </motion.div>
                <h4 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h4>
                <p className="text-gray-600">We've received your inquiry and will be in touch soon.</p>
                <button
                  onClick={() => setIsSubmitted(false)}
                  className="mt-6 text-az-purple font-bold hover:underline"
                >
                  Submit another inquiry
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-az-purple focus:border-transparent outline-none transition-all font-medium"
                    placeholder="Your organization"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">
                      Contact Person
                    </label>
                    <input
                      type="text"
                      name="contact"
                      value={formData.contact}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-az-purple focus:border-transparent outline-none transition-all font-medium"
                      placeholder="Full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-az-purple focus:border-transparent outline-none transition-all font-medium"
                      placeholder="email@org.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1 uppercase tracking-wide">
                    Interest Area
                  </label>
                  <select
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-az-purple focus:border-transparent outline-none transition-all font-medium"
                  >
                    <option>Host a Magnet Site</option>
                    <option>Support Outreach</option>
                    <option>General Partnership</option>
                  </select>
                </div>

                <motion.button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 mt-2 bg-az-purple text-white font-black uppercase tracking-widest rounded-xl hover:bg-purple-800 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                  whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span
                        className="material-symbols-outlined"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        sync
                      </motion.span>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Inquiry'
                  )}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
