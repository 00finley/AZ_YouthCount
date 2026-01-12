import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CONFIG } from '../config';
import { 
  getAvailableDates, 
  getTimeSlotsForDate, 
  formatDateDisplay,
  DISCORD_INVITE_LINK 
} from '../slotsConfig';

// Hook to detect mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
}

// Step indicator component
function StepIndicator({ currentStep, totalSteps, isMobile }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i < currentStep 
              ? 'bg-az-purple w-8' 
              : i === currentStep 
                ? 'bg-az-blue w-8'
                : 'bg-gray-200 w-4'
          }`}
        />
      ))}
    </div>
  );
}

// Animation variants
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

const mobilePageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export default function VirtualRegistration() {
  const isMobile = useIsMobile();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    preferredName: '',
    language: '',
    contactMethod: '',
    phoneNumber: '',
    email: '',
    discordConfirmed: false,
    selectedDate: null,
    selectedTime: null,
  });

  const availableDates = useMemo(() => getAvailableDates(), []);
  const timeSlots = useMemo(() => 
    formData.selectedDate ? getTimeSlotsForDate(formData.selectedDate) : [],
    [formData.selectedDate]
  );

  const variants = isMobile ? mobilePageVariants : pageVariants;

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(CONFIG.FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          _subject: `Virtual Survey Registration: ${formData.preferredName}`,
          preferredName: formData.preferredName,
          language: formData.language,
          contactMethod: formData.contactMethod,
          phoneNumber: formData.phoneNumber || 'N/A',
          email: formData.email || 'N/A',
          discordUser: formData.contactMethod === 'discord' ? 'Will connect via Discord' : 'N/A',
          appointmentDate: formData.selectedDate ? formatDateDisplay(formData.selectedDate) : '',
          appointmentTime: formData.selectedTime?.displayTime || '',
          slotKey: formData.selectedTime?.slotKey || '',
        }),
      });

      if (response.ok) {
        setIsSubmitted(true);
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert('There was an error submitting your registration. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Total steps: Welcome, Name, Language, Contact Method, Contact Details, Date, Time, Confirm
  const totalSteps = 7;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-az-purple via-indigo-900 to-purple-900 flex items-center justify-center p-4">
        <motion.div 
          className="bg-white rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <motion.div
            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <span className="material-symbols-outlined text-5xl text-green-600">check_circle</span>
          </motion.div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">You're Registered!</h2>
          <p className="text-gray-600 mb-2">
            <strong>{formData.preferredName}</strong>, we've got you down for:
          </p>
          <p className="text-xl font-bold text-az-purple mb-6">
            {formData.selectedDate && formatDateDisplay(formData.selectedDate)} at {formData.selectedTime?.displayTime}
          </p>
          <p className="text-gray-500 text-sm mb-8">
            {formData.contactMethod === 'phone' && `We'll call you at ${formData.phoneNumber}`}
            {formData.contactMethod === 'zoom' && `We'll send a Zoom link to ${formData.email}`}
            {formData.contactMethod === 'discord' && "Connect with us on Discord and we'll call you at your scheduled time"}
          </p>
          <Link 
            to="/"
            className="inline-flex items-center gap-2 text-az-blue font-bold hover:underline"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            Back to main site
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-az-purple via-indigo-900 to-purple-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Arizona Youth Count" className="h-12 w-auto" />
          </Link>
          <Link 
            to="/"
            className="text-white/80 hover:text-white font-bold text-sm flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Progress */}
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <StepIndicator currentStep={step} totalSteps={totalSteps} isMobile={isMobile} />
          </div>

          {/* Form content */}
          <div className="p-6 md:p-10 min-h-[400px]">
            <AnimatePresence mode="wait">
              {/* Step 0: Welcome */}
              {step === 0 && (
                <motion.div
                  key="welcome"
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-center"
                >
                  <motion.div 
                    className="w-20 h-20 bg-az-blue/10 rounded-full flex items-center justify-center mx-auto mb-6"
                    animate={!isMobile ? { scale: [1, 1.05, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <span className="material-symbols-outlined text-5xl text-az-blue">videocam</span>
                  </motion.div>
                  <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                    Schedule Your Virtual Survey
                  </h2>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    Can't make it to a magnet site? No problem. Complete your survey via phone, Zoom, or Discord and still receive your <strong className="text-az-purple">${CONFIG.GIFT_CARD_AMOUNT} gift card</strong>.
                  </p>
                  <p className="text-sm text-gray-500 mb-8">Takes about 2 minutes to register</p>
                  <motion.button
                    onClick={nextStep}
                    className="inline-flex items-center gap-2 bg-az-purple text-white font-black uppercase px-8 py-4 rounded-xl shadow-lg"
                    whileHover={!isMobile ? { scale: 1.02, y: -2 } : {}}
                    whileTap={{ scale: 0.98 }}
                  >
                    Let's Go <span className="material-symbols-outlined">arrow_forward</span>
                  </motion.button>
                </motion.div>
              )}

              {/* Step 1: Name */}
              {step === 1 && (
                <motion.div
                  key="name"
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <h2 className="text-2xl font-black text-gray-900 mb-2">What should we call you?</h2>
                  <p className="text-gray-500 mb-6">
                    Just your preferred name – doesn't need to be your full or legal name.
                  </p>
                  <input
                    type="text"
                    value={formData.preferredName}
                    onChange={(e) => updateForm('preferredName', e.target.value)}
                    placeholder="Your preferred name"
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-az-purple focus:ring-0 outline-none transition-all text-lg font-medium"
                    autoFocus
                  />
                  <div className="flex justify-between mt-8">
                    <button onClick={prevStep} className="text-gray-500 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined">arrow_back</span> Back
                    </button>
                    <motion.button
                      onClick={nextStep}
                      disabled={!formData.preferredName.trim()}
                      className="bg-az-purple text-white font-black px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      whileHover={!isMobile && formData.preferredName.trim() ? { scale: 1.02 } : {}}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continue <span className="material-symbols-outlined">arrow_forward</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Language */}
              {step === 2 && (
                <motion.div
                  key="language"
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Preferred language?</h2>
                  <p className="text-gray-500 mb-6">We'll conduct your survey in this language.</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: 'english', label: 'English', icon: '🇺🇸' },
                      { value: 'spanish', label: 'Español', icon: '🇲🇽' },
                    ].map(lang => (
                      <motion.button
                        key={lang.value}
                        onClick={() => {
                          updateForm('language', lang.value);
                          nextStep();
                        }}
                        className={`p-6 rounded-xl border-2 text-center transition-all ${
                          formData.language === lang.value
                            ? 'border-az-purple bg-az-purple/5'
                            : 'border-gray-200 hover:border-az-blue'
                        }`}
                        whileHover={!isMobile ? { scale: 1.02, y: -2 } : {}}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-4xl mb-2 block">{lang.icon}</span>
                        <span className="font-bold text-gray-900">{lang.label}</span>
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex justify-start mt-8">
                    <button onClick={prevStep} className="text-gray-500 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined">arrow_back</span> Back
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Contact Method */}
              {step === 3 && (
                <motion.div
                  key="contact-method"
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <h2 className="text-2xl font-black text-gray-900 mb-2">How would you like to connect?</h2>
                  <p className="text-gray-500 mb-6">Choose whichever works best for you.</p>
                  <div className="space-y-3">
                    {[
                      { value: 'phone', label: 'Phone Call', icon: 'call', desc: 'We\'ll call you' },
                      { value: 'zoom', label: 'Zoom Video Call', icon: 'videocam', desc: 'Video chat link sent to email' },
                      { value: 'discord', label: 'Discord Call', icon: 'headset_mic', desc: 'Voice call via Discord' },
                    ].map(method => (
                      <motion.button
                        key={method.value}
                        onClick={() => {
                          updateForm('contactMethod', method.value);
                          nextStep();
                        }}
                        className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${
                          formData.contactMethod === method.value
                            ? 'border-az-purple bg-az-purple/5'
                            : 'border-gray-200 hover:border-az-blue'
                        }`}
                        whileHover={!isMobile ? { scale: 1.01, x: 4 } : {}}
                        whileTap={{ scale: 0.99 }}
                      >
                        <div className="w-12 h-12 bg-az-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="material-symbols-outlined text-2xl text-az-blue">{method.icon}</span>
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block">{method.label}</span>
                          <span className="text-sm text-gray-500">{method.desc}</span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex justify-start mt-8">
                    <button onClick={prevStep} className="text-gray-500 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined">arrow_back</span> Back
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Contact Details (conditional) */}
              {step === 4 && (
                <motion.div
                  key="contact-details"
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  {formData.contactMethod === 'phone' && (
                    <>
                      <h2 className="text-2xl font-black text-gray-900 mb-2">What's your phone number?</h2>
                      <p className="text-gray-500 mb-6">We'll call this number at your scheduled time.</p>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => updateForm('phoneNumber', e.target.value)}
                        placeholder="(555) 123-4567"
                        className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-az-purple focus:ring-0 outline-none transition-all text-lg font-medium"
                        autoFocus
                      />
                    </>
                  )}

                  {formData.contactMethod === 'zoom' && (
                    <>
                      <h2 className="text-2xl font-black text-gray-900 mb-2">What's your email?</h2>
                      <p className="text-gray-500 mb-6">We'll send the Zoom link here before your appointment.</p>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateForm('email', e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-az-purple focus:ring-0 outline-none transition-all text-lg font-medium"
                        autoFocus
                      />
                    </>
                  )}

                  {formData.contactMethod === 'discord' && (
                    <>
                      <h2 className="text-2xl font-black text-gray-900 mb-2">Connect with us on Discord</h2>
                      <p className="text-gray-500 mb-6">
                        Click the button below to join our Discord server. Send us a friend request so we can call you at your scheduled time.
                      </p>
                      <a
                        href={DISCORD_INVITE_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 bg-[#5865F2] text-white font-bold px-6 py-4 rounded-xl w-full justify-center mb-4"
                      >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                        </svg>
                        Join AZ Youth Count Discord
                      </a>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.discordConfirmed}
                          onChange={(e) => updateForm('discordConfirmed', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-az-purple focus:ring-az-purple"
                        />
                        <span className="text-gray-700">I've joined/sent a friend request</span>
                      </label>
                    </>
                  )}

                  <div className="flex justify-between mt-8">
                    <button onClick={prevStep} className="text-gray-500 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined">arrow_back</span> Back
                    </button>
                    <motion.button
                      onClick={nextStep}
                      disabled={
                        (formData.contactMethod === 'phone' && !formData.phoneNumber.trim()) ||
                        (formData.contactMethod === 'zoom' && !formData.email.trim()) ||
                        (formData.contactMethod === 'discord' && !formData.discordConfirmed)
                      }
                      className="bg-az-purple text-white font-black px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      whileHover={!isMobile ? { scale: 1.02 } : {}}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continue <span className="material-symbols-outlined">arrow_forward</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 5: Date Selection */}
              {step === 5 && (
                <motion.div
                  key="date"
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Pick a date</h2>
                  <p className="text-gray-500 mb-6">Weekdays from January 28 – February 13</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[300px] overflow-y-auto pr-2">
                    {availableDates.map((date, i) => (
                      <motion.button
                        key={i}
                        onClick={() => {
                          updateForm('selectedDate', date);
                          updateForm('selectedTime', null);
                          nextStep();
                        }}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          formData.selectedDate?.toDateString() === date.toDateString()
                            ? 'border-az-purple bg-az-purple/5'
                            : 'border-gray-200 hover:border-az-blue'
                        }`}
                        whileHover={!isMobile ? { scale: 1.02 } : {}}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-xs text-gray-500 block">
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </span>
                        <span className="font-bold text-gray-900">
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex justify-start mt-8">
                    <button onClick={prevStep} className="text-gray-500 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined">arrow_back</span> Back
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 6: Time Selection */}
              {step === 6 && (
                <motion.div
                  key="time"
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <h2 className="text-2xl font-black text-gray-900 mb-2">Pick a time</h2>
                  <p className="text-gray-500 mb-6">
                    {formData.selectedDate && formatDateDisplay(formData.selectedDate)} – Available slots shown
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto pr-2">
                    {timeSlots.map((slot, i) => (
                      <motion.button
                        key={i}
                        onClick={() => {
                          if (slot.isAvailable) {
                            updateForm('selectedTime', slot);
                            nextStep();
                          }
                        }}
                        disabled={!slot.isAvailable}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          !slot.isAvailable
                            ? 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                            : formData.selectedTime?.slotKey === slot.slotKey
                              ? 'border-az-purple bg-az-purple/5'
                              : 'border-gray-200 hover:border-az-blue'
                        }`}
                        whileHover={!isMobile && slot.isAvailable ? { scale: 1.02 } : {}}
                        whileTap={slot.isAvailable ? { scale: 0.98 } : {}}
                      >
                        <span className={`font-bold ${slot.isAvailable ? 'text-gray-900' : 'text-gray-300'}`}>
                          {slot.displayTime}
                        </span>
                        {!slot.isAvailable && (
                          <span className="text-xs text-gray-400 block">Taken</span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex justify-between mt-8">
                    <button onClick={prevStep} className="text-gray-500 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined">arrow_back</span> Back
                    </button>
                    <button 
                      onClick={() => {
                        updateForm('selectedDate', null);
                        prevStep();
                      }}
                      className="text-az-blue font-bold text-sm"
                    >
                      Change date
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 7: Confirmation */}
              {step === 7 && (
                <motion.div
                  key="confirm"
                  variants={variants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="text-center"
                >
                  <h2 className="text-2xl font-black text-gray-900 mb-6">Confirm Your Appointment</h2>
                  
                  <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Name</span>
                      <span className="font-bold text-gray-900">{formData.preferredName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Language</span>
                      <span className="font-bold text-gray-900">
                        {formData.language === 'english' ? 'English' : 'Español'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Method</span>
                      <span className="font-bold text-gray-900 capitalize">{formData.contactMethod}</span>
                    </div>
                    {formData.contactMethod === 'phone' && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Phone</span>
                        <span className="font-bold text-gray-900">{formData.phoneNumber}</span>
                      </div>
                    )}
                    {formData.contactMethod === 'zoom' && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Email</span>
                        <span className="font-bold text-gray-900">{formData.email}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Date & Time</span>
                        <span className="font-bold text-az-purple">
                          {formData.selectedDate && formatDateDisplay(formData.selectedDate)} at {formData.selectedTime?.displayTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button 
                      onClick={prevStep}
                      className="px-6 py-3 border-2 border-gray-200 rounded-xl font-bold text-gray-600"
                    >
                      Go Back
                    </button>
                    <motion.button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="bg-az-purple text-white font-black px-8 py-3 rounded-xl shadow-lg flex items-center justify-center gap-2"
                      whileHover={!isMobile ? { scale: 1.02 } : {}}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isSubmitting ? (
                        <>
                          <motion.span
                            className="material-symbols-outlined"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            sync
                          </motion.span>
                          Registering...
                        </>
                      ) : (
                        <>
                          Confirm Appointment
                          <span className="material-symbols-outlined">check</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
