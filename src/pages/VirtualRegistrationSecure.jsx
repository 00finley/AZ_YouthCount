import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { CONFIG } from '../config';
import { formatDateDisplay } from '../slotsConfig';
import { sendConfirmationEmail } from '../utils/emailjs';

// SECURE Virtual Registration Form
// Security layers:
// 1. reCAPTCHA v3 (invisible, score-based) - runs in background
// 2. reCAPTCHA v2 (checkbox) - user interaction required
// 3. Origin header check (server-side)
// 4. Honeypot field
// 5. Timing check (>10 seconds)
// 6. Rate limiting
// 7. Geo-restriction (Arizona only)
// 8. No Formspree - all data goes to secured /api/slots

export default function VirtualRegistrationSecure() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCheckingGeo, setIsCheckingGeo] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [availableDates, setAvailableDates] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [availableSlots, setAvailableSlots] = useState({});
  const [error, setError] = useState(null);

  // Security: Track form load time
  const [formLoadTime] = useState(Date.now());

  // reCAPTCHA v2 state
  const [recaptchaV2WidgetId, setRecaptchaV2WidgetId] = useState(null);
  const [recaptchaV2Ready, setRecaptchaV2Ready] = useState(false);

  // reCAPTCHA v3 state
  const [recaptchaV3Loaded, setRecaptchaV3Loaded] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    age: null,
    name: '',
    language: 'english',
    contactMethod: '',
    phone: '',
    email: '',
    reminderEmail: '',
    selectedDate: null,
    selectedTime: null,
    website: '', // Honeypot
  });

  // Load reCAPTCHA v3 script
  useEffect(() => {
    if (recaptchaV3Loaded) return;

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${CONFIG.RECAPTCHA_V3_SITE_KEY}`;
    script.async = true;
    script.onload = () => {
      window.grecaptcha.ready(() => {
        setRecaptchaV3Loaded(true);
        console.log('[Security] reCAPTCHA v3 loaded');
      });
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, [recaptchaV3Loaded]);

  // Geo check
  useEffect(() => {
    const checkGeo = async () => {
      try {
        const response = await fetch('/api/geo-check');
        const data = await response.json();
        if (!data.allowed) {
          navigate('/?restricted=geo', { replace: true });
        }
      } catch (err) {
        console.error('Geo check failed:', err);
      } finally {
        setIsCheckingGeo(false);
      }
    };
    checkGeo();
  }, [navigate]);

  // Fetch available slots
  const fetchSlots = useCallback(async () => {
    try {
      setIsLoadingSlots(true);
      const response = await fetch('/api/slots');
      if (response.ok) {
        const data = await response.json();
        setAvailableSlots(data.availableSlots || {});
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  // Generate available dates
  useEffect(() => {
    if (Object.keys(availableSlots).length === 0) return;

    const now = new Date();
    const minBookingTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dates = [];

    for (const dateStr of Object.keys(availableSlots)) {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);

      const dateSlots = availableSlots[dateStr] || [];
      const hasAvailable = dateSlots.some(slot => {
        if (!slot.isAvailable) return false;
        const [hours, minutes] = slot.time.split(':').map(Number);
        const slotDateTime = new Date(date);
        slotDateTime.setHours(hours, minutes, 0, 0);
        return slotDateTime > minBookingTime;
      });

      if (hasAvailable) dates.push(date);
    }

    dates.sort((a, b) => a - b);
    setAvailableDates(dates);
  }, [availableSlots]);

  // Generate time slots for selected date
  useEffect(() => {
    if (!formData.selectedDate || Object.keys(availableSlots).length === 0) {
      setTimeSlots([]);
      return;
    }

    const now = new Date();
    const minBookingTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const date = formData.selectedDate;
    const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;

    const slots = [];
    for (const slotInfo of (availableSlots[dateStr] || [])) {
      const [hours, minutes] = slotInfo.time.split(':').map(Number);
      const slotDateTime = new Date(date);
      slotDateTime.setHours(hours, minutes, 0, 0);

      if (slotDateTime <= minBookingTime) continue;
      if (!slotInfo.hasVolunteer) continue;

      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
      slots.push({
        time: slotInfo.time,
        displayTime: `${displayHour}:${minutes.toString().padStart(2, '0')} ${period}`,
        slotKey: slotInfo.slotKey,
        isAvailable: slotInfo.isAvailable,
      });
    }

    setTimeSlots(slots);
  }, [formData.selectedDate, availableSlots]);

  // Render reCAPTCHA v2 when on confirmation step
  useEffect(() => {
    if (step !== 5 || recaptchaV2WidgetId !== null) return;

    const renderRecaptcha = () => {
      const container = document.getElementById('recaptcha-v2-container');
      if (!container || container.hasChildNodes()) return;

      try {
        // Use the explicit render API for v2
        const widgetId = window.grecaptcha.render(container, {
          sitekey: CONFIG.RECAPTCHA_SITE_KEY,
          callback: () => setRecaptchaV2Ready(true),
          'expired-callback': () => setRecaptchaV2Ready(false),
        });
        setRecaptchaV2WidgetId(widgetId);
        console.log('[Security] reCAPTCHA v2 rendered');
      } catch (e) {
        console.error('reCAPTCHA v2 render error:', e);
      }
    };

    // Wait for grecaptcha to be available (loaded by v3 script with render parameter)
    const interval = setInterval(() => {
      if (window.grecaptcha?.render) {
        clearInterval(interval);
        setTimeout(renderRecaptcha, 300);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [step, recaptchaV2WidgetId]);

  // Form helpers
  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone) => phone.replace(/\D/g, '').length === 10;

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) return digits.length ? `(${digits}` : '';
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  // Submit with dual reCAPTCHA verification
  const handleSubmit = async () => {
    setError(null);

    // Security check 1: Honeypot
    if (formData.website) {
      console.log('[Security] Bot detected: honeypot filled');
      setIsSubmitted(true);
      return;
    }

    // Security check 2: Timing
    if (Date.now() - formLoadTime < 10000) {
      console.log('[Security] Bot detected: too fast');
      setIsSubmitted(true);
      return;
    }

    // Security check 3: Get reCAPTCHA v2 token
    let recaptchaV2Token = null;
    if (window.grecaptcha && typeof recaptchaV2WidgetId === 'number') {
      recaptchaV2Token = window.grecaptcha.getResponse(recaptchaV2WidgetId);
    }

    if (!recaptchaV2Token) {
      setError('Please complete the reCAPTCHA checkbox.');
      return;
    }

    // Security check 4: Get reCAPTCHA v3 token
    let recaptchaV3Token = null;
    try {
      if (window.grecaptcha && recaptchaV3Loaded) {
        recaptchaV3Token = await window.grecaptcha.execute(CONFIG.RECAPTCHA_V3_SITE_KEY, { action: 'register' });
        console.log('[Security] reCAPTCHA v3 token obtained');
      }
    } catch (err) {
      console.error('[Security] reCAPTCHA v3 error:', err);
      // Continue without v3 - v2 is still required
    }

    setIsSubmitting(true);

    try {
      // Security check 5: Rate limit
      const rateLimitRes = await fetch('/api/rate-limit', { method: 'POST' });
      const rateLimitData = await rateLimitRes.json();
      if (!rateLimitData.allowed) {
        setError('Too many submissions. Please try again later.');
        setIsSubmitting(false);
        return;
      }

      // Submit to secured API with both tokens
      const contactInfo = formData.contactMethod === 'phone' ? formData.phone : formData.email;
      const reminderEmail = formData.contactMethod === 'zoom' ? formData.email : formData.reminderEmail || null;

      const response = await fetch('/api/slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotKey: formData.selectedTime.slotKey,
          recaptchaToken: recaptchaV2Token,
          recaptchaV3Token: recaptchaV3Token,
          name: formData.name,
          contactMethod: formData.contactMethod,
          contactInfo,
          reminderEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.includes('reCAPTCHA') || data.error?.includes('security')) {
          setError('Security verification failed. Please try again.');
          window.grecaptcha?.reset(recaptchaV2WidgetId);
          setRecaptchaV2Ready(false);
        } else if (data.error?.includes('Slot') || data.error?.includes('volunteer')) {
          setError('This time slot is no longer available. Please choose another.');
          await fetchSlots();
          setStep(3);
        } else if (data.error?.includes('Origin') || data.error?.includes('Forbidden')) {
          setError('Request blocked. Please refresh and try again.');
        } else {
          setError(data.error || 'Submission failed. Please try again.');
        }
        setIsSubmitting(false);
        return;
      }

      // Success!
      setIsSubmitted(true);

      // Send confirmation email
      if (reminderEmail && isValidEmail(reminderEmail)) {
        sendConfirmationEmail({
          toEmail: reminderEmail,
          toName: formData.name,
          appointmentDate: formatDateDisplay(formData.selectedDate),
          appointmentTime: formData.selectedTime.displayTime,
          contactMethod: formData.contactMethod,
        }).catch(console.error);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError('Network error. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isCheckingGeo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white"></div>
      </div>
    );
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 flex items-center justify-center p-4">
        <motion.div
          className="bg-white rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-5xl text-green-600">check_circle</span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">You're Registered!</h2>
          <p className="text-gray-600 mb-2">
            <strong>{formData.name}</strong>, we've got you down for:
          </p>
          <p className="text-xl font-bold text-az-purple mb-6">
            {formData.selectedDate && formatDateDisplay(formData.selectedDate)} at {formData.selectedTime?.displayTime}
          </p>
          <p className="text-gray-500 text-sm mb-8">
            {formData.contactMethod === 'phone' && `We'll call you at ${formData.phone}`}
            {formData.contactMethod === 'zoom' && `We'll send a Zoom link to ${formData.email}`}
          </p>
          <Link to="/" className="inline-flex items-center gap-2 text-az-blue font-bold hover:underline">
            <span className="material-symbols-outlined">arrow_back</span>
            Back to main site
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Arizona Youth Count" className="h-12 w-auto" />
          </Link>
          <Link to="/" className="text-white/80 hover:text-white font-bold text-sm flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back
          </Link>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-xl mx-auto px-4 py-8 md:py-16">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Progress */}
          <div className="bg-gray-50 px-6 py-4 border-b">
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all ${i <= step ? 'bg-az-purple' : 'bg-gray-200'}`}
                />
              ))}
            </div>
          </div>

          <div className="p-6 md:p-8 min-h-[400px]">
            <AnimatePresence mode="wait">
              {/* Step 0: Age */}
              {step === 0 && (
                <motion.div key="age" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">How old are you?</h2>
                  <p className="text-gray-500 mb-6">This count is for young adults ages 18-24.</p>
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {[18, 19, 20, 21, 22, 23, 24].map((age) => (
                      <button
                        key={age}
                        onClick={() => { updateForm('age', age); setStep(1); }}
                        className="py-4 rounded-xl border-2 font-bold text-lg border-gray-200 hover:border-az-purple/50 transition-all"
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-gray-400 text-center">
                    Not 18-24? <Link to="/resources" className="text-az-blue underline">See resources</Link>
                  </p>
                </motion.div>
              )}

              {/* Step 1: Name */}
              {step === 1 && (
                <motion.div key="name" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">What should we call you?</h2>
                  <p className="text-gray-500 mb-6">Just your preferred name.</p>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => updateForm('name', e.target.value)}
                    placeholder="Your name"
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-az-purple outline-none text-lg"
                    autoFocus
                  />
                  {/* Honeypot */}
                  <input
                    type="text"
                    name="website"
                    value={formData.website}
                    onChange={(e) => updateForm('website', e.target.value)}
                    tabIndex={-1}
                    autoComplete="off"
                    style={{ position: 'absolute', left: '-9999px' }}
                  />
                  <div className="flex justify-between mt-8">
                    <button onClick={() => setStep(0)} className="text-gray-500 font-bold">Back</button>
                    <button
                      onClick={() => setStep(2)}
                      disabled={!formData.name.trim()}
                      className="bg-az-purple text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Contact Method */}
              {step === 2 && (
                <motion.div key="method" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">How would you like to connect?</h2>
                  <p className="text-gray-500 mb-6">Choose what works best for you.</p>
                  <div className="space-y-3">
                    {[
                      { value: 'phone', label: 'Phone Call', icon: 'call', desc: "We'll call you" },
                      { value: 'zoom', label: 'Zoom Video', icon: 'videocam', desc: 'Video link sent to email' },
                    ].map((method) => (
                      <button
                        key={method.value}
                        onClick={() => { updateForm('contactMethod', method.value); setStep(3); }}
                        className="w-full p-4 rounded-xl border-2 border-gray-200 hover:border-az-blue text-left flex items-center gap-4 transition-all"
                      >
                        <div className="w-12 h-12 bg-az-blue/10 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl text-az-blue">{method.icon}</span>
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block">{method.label}</span>
                          <span className="text-sm text-gray-500">{method.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-start mt-8">
                    <button onClick={() => setStep(1)} className="text-gray-500 font-bold">Back</button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Contact Details */}
              {step === 3 && (
                <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-black text-gray-900 mb-2">
                    {formData.contactMethod === 'phone' ? 'Your phone number' : 'Your email'}
                  </h2>
                  <p className="text-gray-500 mb-6">
                    {formData.contactMethod === 'phone' ? "We'll call you at your scheduled time." : "We'll send the Zoom link here."}
                  </p>
                  {formData.contactMethod === 'phone' ? (
                    <>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => updateForm('phone', formatPhone(e.target.value))}
                        placeholder="(555) 123-4567"
                        className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-az-purple outline-none text-lg"
                        autoFocus
                      />
                      <div className="mt-4">
                        <label className="text-sm text-gray-600 block mb-2">Reminder email (optional)</label>
                        <input
                          type="email"
                          value={formData.reminderEmail}
                          onChange={(e) => updateForm('reminderEmail', e.target.value)}
                          placeholder="your@email.com"
                          className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-az-purple outline-none"
                        />
                      </div>
                    </>
                  ) : (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-az-purple outline-none text-lg"
                      autoFocus
                    />
                  )}
                  <div className="flex justify-between mt-8">
                    <button onClick={() => setStep(2)} className="text-gray-500 font-bold">Back</button>
                    <button
                      onClick={() => setStep(4)}
                      disabled={
                        (formData.contactMethod === 'phone' && !isValidPhone(formData.phone)) ||
                        (formData.contactMethod === 'zoom' && !isValidEmail(formData.email))
                      }
                      className="bg-az-purple text-white font-bold px-6 py-3 rounded-xl disabled:opacity-50"
                    >
                      Continue
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Date & Time */}
              {step === 4 && (
                <motion.div key="datetime" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  {!formData.selectedDate ? (
                    <>
                      <h2 className="text-2xl font-black text-gray-900 mb-2">Pick a date</h2>
                      <p className="text-gray-500 mb-6">Weekdays from January 28 – February 13</p>
                      {isLoadingSlots ? (
                        <div className="flex justify-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-4 border-az-purple/20 border-t-az-purple"></div>
                        </div>
                      ) : availableDates.length === 0 ? (
                        <p className="text-center text-gray-500 py-12">No available times. Check back later.</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 max-h-[250px] overflow-y-auto">
                          {availableDates.map((date, i) => (
                            <button
                              key={i}
                              onClick={() => updateForm('selectedDate', date)}
                              className="p-3 rounded-xl border-2 border-gray-200 hover:border-az-blue text-center"
                            >
                              <span className="text-xs text-gray-500 block">
                                {date.toLocaleDateString('en-US', { weekday: 'short' })}
                              </span>
                              <span className="font-bold text-gray-900">
                                {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <h2 className="text-2xl font-black text-gray-900 mb-2">Pick a time</h2>
                      <p className="text-gray-500 mb-6">
                        {formatDateDisplay(formData.selectedDate)}
                        <button
                          onClick={() => { updateForm('selectedDate', null); updateForm('selectedTime', null); }}
                          className="text-az-blue ml-2 underline"
                        >
                          Change
                        </button>
                      </p>
                      {timeSlots.length === 0 ? (
                        <p className="text-center text-gray-500 py-12">No times available for this date.</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2 max-h-[250px] overflow-y-auto">
                          {timeSlots.map((slot, i) => (
                            <button
                              key={i}
                              onClick={() => { if (slot.isAvailable) { updateForm('selectedTime', slot); setStep(5); }}}
                              disabled={!slot.isAvailable}
                              className={`p-3 rounded-xl border-2 text-center ${
                                !slot.isAvailable
                                  ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                                  : 'border-gray-200 hover:border-az-blue'
                              }`}
                            >
                              <span className="font-bold">{slot.displayTime}</span>
                              {!slot.isAvailable && <span className="text-xs block">Taken</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  <div className="flex justify-start mt-8">
                    <button onClick={() => setStep(3)} className="text-gray-500 font-bold">Back</button>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Confirm */}
              {step === 5 && (
                <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <h2 className="text-2xl font-black text-gray-900 mb-6 text-center">Confirm Your Appointment</h2>

                  <div className="bg-gray-50 rounded-xl p-6 mb-6 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name</span>
                      <span className="font-bold">{formData.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Method</span>
                      <span className="font-bold capitalize">{formData.contactMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{formData.contactMethod === 'phone' ? 'Phone' : 'Email'}</span>
                      <span className="font-bold">{formData.contactMethod === 'phone' ? formData.phone : formData.email}</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date & Time</span>
                        <span className="font-bold text-az-purple">
                          {formatDateDisplay(formData.selectedDate)} at {formData.selectedTime?.displayTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* reCAPTCHA v2 checkbox */}
                  <div className="flex justify-center mb-4">
                    <div id="recaptcha-v2-container" className="min-h-[78px]"></div>
                  </div>

                  {error && (
                    <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl mb-4 text-center font-medium">
                      {error}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={() => setStep(4)}
                      className="px-6 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600"
                    >
                      Go Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || !recaptchaV2Ready}
                      className="bg-az-purple text-white font-bold px-8 py-3 rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? 'Submitting...' : 'Confirm Appointment'}
                    </button>
                  </div>

                  <p className="text-xs text-gray-400 text-center mt-4">
                    Protected by reCAPTCHA v2 + v3.{' '}
                    <a href="https://policies.google.com/privacy" className="underline">Privacy</a> &{' '}
                    <a href="https://policies.google.com/terms" className="underline">Terms</a>
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
