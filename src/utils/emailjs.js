// EmailJS configuration for sending confirmation emails
// Sign up at https://www.emailjs.com/ and get your keys

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

// Load EmailJS SDK dynamically
let emailjsLoaded = false;

const loadEmailJS = () => {
  return new Promise((resolve, reject) => {
    if (emailjsLoaded && window.emailjs) {
      resolve(window.emailjs);
      return;
    }

    if (document.querySelector('script[src*="emailjs"]')) {
      // Script already loading, wait for it
      const checkLoaded = setInterval(() => {
        if (window.emailjs) {
          clearInterval(checkLoaded);
          emailjsLoaded = true;
          resolve(window.emailjs);
        }
      }, 100);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js';
    script.onload = () => {
      emailjsLoaded = true;
      if (window.emailjs && EMAILJS_PUBLIC_KEY) {
        window.emailjs.init(EMAILJS_PUBLIC_KEY);
      }
      resolve(window.emailjs);
    };
    script.onerror = () => reject(new Error('Failed to load EmailJS'));
    document.head.appendChild(script);
  });
};

/**
 * Send confirmation email to registrant
 * @param {Object} params
 * @param {string} params.toEmail - Recipient email
 * @param {string} params.toName - Recipient name
 * @param {string} params.appointmentDate - Formatted date string
 * @param {string} params.appointmentTime - Formatted time string
 * @param {string} params.contactMethod - phone, zoom, or discord
 */
export const sendConfirmationEmail = async ({
  toEmail,
  toName,
  appointmentDate,
  appointmentTime,
  contactMethod,
}) => {
  // Skip if EmailJS is not configured
  if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
    console.log('EmailJS not configured, skipping confirmation email');
    return { success: false, reason: 'not_configured' };
  }

  try {
    const emailjs = await loadEmailJS();

    const templateParams = {
      to_email: toEmail,
      to_name: toName,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      contact_method: contactMethod,
      // For the template
      reply_to: 'noreply@azyouthcount.org',
    };

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log('Confirmation email sent:', result);
    return { success: true, result };
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    return { success: false, error };
  }
};

export default { sendConfirmationEmail };
