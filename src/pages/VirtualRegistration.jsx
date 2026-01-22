import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CONFIG } from '../config';
import {
  formatDateDisplay,
  DISCORD_INVITE_LINK
} from '../slotsConfig';

// Spanish translations
const translations = {
  english: {
    scheduleTitle: "Schedule Your Virtual Survey",
    scheduleDescription: "Can't make it to a magnet site? No problem. Complete your survey via phone, Zoom, or Discord and still receive your",
    giftCard: "gift card",
    takesAbout: "Takes about 2 minutes to register",
    letsGo: "Let's Go",
    whatToCallYou: "What should we call you?",
    preferredNameHint: "Just your preferred name – doesn't need to be your full or legal name.",
    preferredNamePlaceholder: "Your preferred name",
    back: "Back",
    continue: "Continue",
    preferredLanguage: "Preferred language?",
    languageHint: "We'll conduct your survey in this language.",
    howToConnect: "How would you like to connect?",
    connectHint: "Choose whichever works best for you.",
    phoneCall: "Phone Call",
    phoneDesc: "We'll call you",
    zoomCall: "Zoom Video Call",
    zoomDesc: "Video chat link sent to email",
    discordCall: "Discord Call",
    discordDesc: "Voice call via Discord",
    phoneNumber: "What's your phone number?",
    phoneHint: "We'll call this number at your scheduled time.",
    phonePlaceholder: "(555) 123-4567",
    emailAddress: "What's your email?",
    emailHint: "We'll send the Zoom link here before your appointment.",
    emailPlaceholder: "your@email.com",
    discordConnect: "Connect with us on Discord",
    discordHint: "Click the button below to join our Discord server. Send us a friend request so we can call you at your scheduled time.",
    joinDiscord: "Join AZ Youth Count Discord",
    discordConfirm: "I've joined/sent a friend request",
    pickDate: "Pick a date",
    dateRange: "Weekdays from January 28 – February 13",
    pickTime: "Pick a time",
    availableSlots: "Available slots shown",
    taken: "Taken",
    changeDate: "Change date",
    confirmAppointment: "Confirm Your Appointment",
    name: "Name",
    language: "Language",
    method: "Method",
    phone: "Phone",
    email: "Email",
    dateTime: "Date & Time",
    goBack: "Go Back",
    confirmButton: "Confirm Appointment",
    registering: "Registering...",
    registered: "You're Registered!",
    weGotYou: "we've got you down for:",
    wellCallYou: "We'll call you at",
    wellSendZoom: "We'll send a Zoom link to",
    discordWillConnect: "Connect with us on Discord and we'll call you at your scheduled time",
    backToSite: "Back to main site",
    loadingSlots: "Loading available slots...",
    errorLoading: "Error loading slots. Please refresh.",
  },
  spanish: {
    scheduleTitle: "Programa Tu Encuesta Virtual",
    scheduleDescription: "¿No puedes ir a un sitio imán? No hay problema. Completa tu encuesta por teléfono, Zoom o Discord y aún recibirás tu",
    giftCard: "tarjeta de regalo",
    takesAbout: "Toma aproximadamente 2 minutos para registrarte",
    letsGo: "Vamos",
    whatToCallYou: "¿Cómo te gustaría que te llamemos?",
    preferredNameHint: "Solo tu nombre preferido – no necesita ser tu nombre completo o legal.",
    preferredNamePlaceholder: "Tu nombre preferido",
    back: "Atrás",
    continue: "Continuar",
    preferredLanguage: "¿Idioma preferido?",
    languageHint: "Realizaremos tu encuesta en este idioma.",
    howToConnect: "¿Cómo te gustaría conectarte?",
    connectHint: "Elige lo que funcione mejor para ti.",
    phoneCall: "Llamada Telefónica",
    phoneDesc: "Te llamaremos",
    zoomCall: "Videollamada por Zoom",
    zoomDesc: "Enlace de video enviado por correo",
    discordCall: "Llamada por Discord",
    discordDesc: "Llamada de voz por Discord",
    phoneNumber: "¿Cuál es tu número de teléfono?",
    phoneHint: "Te llamaremos a este número a la hora programada.",
    phonePlaceholder: "(555) 123-4567",
    emailAddress: "¿Cuál es tu correo electrónico?",
    emailHint: "Te enviaremos el enlace de Zoom aquí antes de tu cita.",
    emailPlaceholder: "tu@correo.com",
    discordConnect: "Conéctate con nosotros en Discord",
    discordHint: "Haz clic en el botón de abajo para unirte a nuestro servidor de Discord. Envíanos una solicitud de amistad para que podamos llamarte a la hora programada.",
    joinDiscord: "Únete al Discord de AZ Youth Count",
    discordConfirm: "Ya me uní/envié solicitud de amistad",
    pickDate: "Elige una fecha",
    dateRange: "Días laborables del 28 de enero al 13 de febrero",
    pickTime: "Elige una hora",
    availableSlots: "Se muestran los horarios disponibles",
    taken: "Ocupado",
    changeDate: "Cambiar fecha",
    confirmAppointment: "Confirma Tu Cita",
    name: "Nombre",
    language: "Idioma",
    method: "Método",
    phone: "Teléfono",
    email: "Correo",
    dateTime: "Fecha y Hora",
    goBack: "Regresar",
    confirmButton: "Confirmar Cita",
    registering: "Registrando...",
    registered: "¡Estás Registrado!",
    weGotYou: "te hemos anotado para:",
    wellCallYou: "Te llamaremos al",
    wellSendZoom: "Te enviaremos un enlace de Zoom a",
    discordWillConnect: "Conéctate con nosotros en Discord y te llamaremos a la hora programada",
    backToSite: "Volver al sitio principal",
    loadingSlots: "Cargando horarios disponibles...",
    errorLoading: "Error al cargar horarios. Por favor actualiza.",
  }
};

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
  const [availableDates, setAvailableDates] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [slotsError, setSlotsError] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);

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

  // Get translations based on selected language (default to English for early steps)
  const t = translations[formData.language] || translations.english;

  // Fetch booked slots from API
  const fetchBookedSlots = useCallback(async () => {
    try {
      setIsLoadingSlots(true);
      setSlotsError(null);
      const response = await fetch('/api/slots');
      if (response.ok) {
        const data = await response.json();
        setBookedSlots(data.bookedSlots || []);
      } else {
        // Fallback to empty array if API not available
        setBookedSlots([]);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
      // Fallback to empty array
      setBookedSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, []);

  useEffect(() => {
    fetchBookedSlots();
  }, [fetchBookedSlots]);

  // Generate available dates (weekdays only, Jan 28 - Feb 13)
  // Must be at least 24 hours in advance
  useEffect(() => {
    // Use local dates to avoid timezone issues
    const COUNT_START = new Date(2026, 0, 28); // January 28, 2026 (month is 0-indexed)
    const COUNT_END = new Date(2026, 1, 13);   // February 13, 2026

    // Calculate 24 hours from now
    const now = new Date();
    const minBookingTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const dates = [];
    let current = new Date(COUNT_START);

    while (current <= COUNT_END) {
      const dayOfWeek = current.getDay();
      // Only include weekdays (not Saturday=6 or Sunday=0)
      // And only dates that are at least 24 hours away
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Check if this date has any slots available (at least 24hrs from now)
        const endOfDay = new Date(current);
        endOfDay.setHours(18, 0, 0, 0); // Last slot is at 6 PM

        if (endOfDay > minBookingTime) {
          dates.push(new Date(current));
        }
      }
      current.setDate(current.getDate() + 1);
    }

    setAvailableDates(dates);
  }, []);

  // Generate time slots for selected date
  // Only show slots that are at least 24 hours away
  useEffect(() => {
    if (!formData.selectedDate) {
      setTimeSlots([]);
      return;
    }

    const DOUBLE_SLOTS_START = new Date(2026, 1, 6); // February 6, 2026
    const START_HOUR = 6;
    const END_HOUR = 18;
    const SLOT_DURATION_MINUTES = 30;
    const SLOTS_BEFORE_FEB_6 = 1;
    const SLOTS_FROM_FEB_6 = 2;

    // Calculate 24 hours from now
    const now = new Date();
    const minBookingTime = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const date = formData.selectedDate;
    const isDoubleSlotDay = date >= DOUBLE_SLOTS_START;
    const maxSlots = isDoubleSlotDay ? SLOTS_FROM_FEB_6 : SLOTS_BEFORE_FEB_6;

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const slots = [];
    for (let hour = START_HOUR; hour < END_HOUR; hour++) {
      for (let minute = 0; minute < 60; minute += SLOT_DURATION_MINUTES) {
        // Create a date object for this specific slot
        const slotDateTime = new Date(date);
        slotDateTime.setHours(hour, minute, 0, 0);

        // Skip slots that are less than 24 hours away
        if (slotDateTime <= minBookingTime) {
          continue;
        }

        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const slotKey = `${dateStr}-${timeStr}`;

        const bookedCount = bookedSlots.filter(s => s === slotKey).length;
        const isAvailable = bookedCount < maxSlots;

        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const displayMinute = minute.toString().padStart(2, '0');
        const displayTime = `${displayHour}:${displayMinute} ${period}`;

        slots.push({
          time: timeStr,
          displayTime,
          slotKey,
          isAvailable,
          spotsLeft: maxSlots - bookedCount,
        });
      }
    }

    setTimeSlots(slots);
  }, [formData.selectedDate, bookedSlots]);

  const variants = isMobile ? mobilePageVariants : pageVariants;

  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Format phone number as (xxx) xxx-xxxx
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Limit to 10 digits
    const limited = digits.slice(0, 10);

    // Format based on length
    if (limited.length === 0) return '';
    if (limited.length <= 3) return `(${limited}`;
    if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`;
    return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    updateForm('phoneNumber', formatted);
  };

  // Validate email address
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check if phone is complete (10 digits)
  const isValidPhone = (phone) => {
    const digits = phone.replace(/\D/g, '');
    return digits.length === 10;
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);

  // Execute reCAPTCHA
  const executeRecaptcha = async () => {
    return new Promise((resolve) => {
      if (window.grecaptcha && window.grecaptcha.ready) {
        window.grecaptcha.ready(async () => {
          try {
            const token = await window.grecaptcha.execute(CONFIG.RECAPTCHA_SITE_KEY, { action: 'submit_registration' });
            resolve(token);
          } catch (error) {
            console.error('reCAPTCHA error:', error);
            resolve(null);
          }
        });
      } else {
        // reCAPTCHA not loaded, proceed without it
        resolve(null);
      }
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Execute reCAPTCHA
      const recaptchaToken = await executeRecaptcha();

      // First, book the slot in the backend
      const slotKey = formData.selectedTime?.slotKey;
      if (slotKey) {
        try {
          const bookResponse = await fetch('/api/slots', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              slotKey,
              recaptchaToken
            }),
          });

          if (!bookResponse.ok) {
            const errorData = await bookResponse.json();
            if (errorData.error === 'Slot is already fully booked') {
              alert('Sorry, this time slot was just booked by someone else. Please select a different time.');
              // Refresh available slots
              await fetchBookedSlots();
              setStep(5); // Go back to date selection
              setIsSubmitting(false);
              return;
            }
          }
        } catch (error) {
          console.error('Error booking slot:', error);
          // Continue with form submission even if slot booking fails
        }
      }

      // Submit form data
      const response = await fetch(CONFIG.FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
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
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Formspree error:', response.status, errorData);
        alert(`Submission failed: ${errorData.error || 'Please try again.'}`);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Large faded background logo - positioned left */}
        <div className="absolute inset-y-0 -left-24 md:-left-12 lg:left-8 flex items-center pointer-events-none" aria-hidden="true">
          <img
            src="/logo.png"
            alt=""
            className="w-[350px] md:w-[450px] lg:w-[550px] h-auto opacity-15 select-none"
          />
        </div>
        <motion.div
          className="bg-white rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-2xl relative z-10"
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
          <h2 className="text-3xl font-black text-gray-900 mb-4">{t.registered}</h2>
          <p className="text-gray-600 mb-2">
            <strong>{formData.preferredName}</strong>, {t.weGotYou}
          </p>
          <p className="text-xl font-bold text-az-purple mb-6">
            {formData.selectedDate && formatDateDisplay(formData.selectedDate)} at {formData.selectedTime?.displayTime}
          </p>
          <p className="text-gray-500 text-sm mb-8">
            {formData.contactMethod === 'phone' && `${t.wellCallYou} ${formData.phoneNumber}`}
            {formData.contactMethod === 'zoom' && `${t.wellSendZoom} ${formData.email}`}
            {formData.contactMethod === 'discord' && t.discordWillConnect}
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-az-blue font-bold hover:underline"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            {t.backToSite}
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 relative overflow-hidden">
      {/* Large faded background logo - positioned left */}
      <div className="absolute inset-y-0 -left-24 md:-left-12 lg:left-8 flex items-center pointer-events-none" aria-hidden="true">
        <img
          src="/logo.png"
          alt=""
          className="w-[350px] md:w-[450px] lg:w-[550px] h-auto opacity-15 select-none"
        />
      </div>

      {/* Header */}
      <header className="bg-white/10 backdrop-blur-md border-b border-white/10 relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="Arizona Youth Count" className="h-12 w-auto" />
          </Link>
          <Link
            to="/"
            className="text-white/80 hover:text-white font-bold text-sm flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            {t.back}
          </Link>
        </div>
      </header>

      {/* Main content */}
      <div className="max-w-2xl mx-auto px-4 py-8 md:py-16 relative z-10">
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
                    {t.scheduleTitle}
                  </h2>
                  <p className="text-gray-600 mb-8 max-w-md mx-auto">
                    {t.scheduleDescription} <strong className="text-az-purple">${CONFIG.GIFT_CARD_AMOUNT} {t.giftCard}</strong>.
                  </p>
                  <p className="text-sm text-gray-500 mb-8">{t.takesAbout}</p>
                  <motion.button
                    onClick={nextStep}
                    className="inline-flex items-center gap-2 bg-az-purple text-white font-black uppercase px-8 py-4 rounded-xl shadow-lg"
                    whileHover={!isMobile ? { scale: 1.02, y: -2 } : {}}
                    whileTap={{ scale: 0.98 }}
                  >
                    {t.letsGo} <span className="material-symbols-outlined">arrow_forward</span>
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
                  role="form"
                  aria-labelledby="name-heading"
                >
                  <label htmlFor="name-input" className="block">
                    <h2 id="name-heading" className="text-2xl font-black text-gray-900 mb-2">{t.whatToCallYou}</h2>
                    <p id="name-hint" className="text-gray-500 mb-6">
                      {t.preferredNameHint}
                    </p>
                  </label>
                  <input
                    id="name-input"
                    type="text"
                    value={formData.preferredName}
                    onChange={(e) => updateForm('preferredName', e.target.value)}
                    placeholder={t.preferredNamePlaceholder}
                    aria-describedby="name-hint"
                    aria-required="true"
                    className="w-full px-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-az-purple focus:ring-2 focus:ring-az-purple/20 outline-none transition-all text-lg font-medium"
                    autoFocus
                  />
                  <div className="flex justify-between mt-8">
                    <button
                      onClick={prevStep}
                      aria-label={t.back}
                      className="text-gray-500 font-bold flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-az-purple/50 rounded-lg px-2 py-1"
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span> {t.back}
                    </button>
                    <motion.button
                      onClick={nextStep}
                      disabled={!formData.preferredName.trim()}
                      aria-label={t.continue}
                      className="bg-az-purple text-white font-black px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-az-purple/50 focus:ring-offset-2"
                      whileHover={!isMobile && formData.preferredName.trim() ? { scale: 1.02 } : {}}
                      whileTap={{ scale: 0.98 }}
                    >
                      {t.continue} <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
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
                  role="radiogroup"
                  aria-labelledby="language-heading"
                >
                  <h2 id="language-heading" className="text-2xl font-black text-gray-900 mb-2">{t.preferredLanguage}</h2>
                  <p className="text-gray-500 mb-6">{t.languageHint}</p>
                  <div className="grid grid-cols-2 gap-4" role="group">
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
                        aria-label={`Select ${lang.label}`}
                        aria-pressed={formData.language === lang.value}
                        className={`p-6 rounded-xl border-2 text-center transition-all focus:outline-none focus:ring-2 focus:ring-az-purple/50 focus:ring-offset-2 ${
                          formData.language === lang.value
                            ? 'border-az-purple bg-az-purple/5'
                            : 'border-gray-200 hover:border-az-blue'
                        }`}
                        whileHover={!isMobile ? { scale: 1.02, y: -2 } : {}}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="text-4xl mb-2 block" aria-hidden="true">{lang.icon}</span>
                        <span className="font-bold text-gray-900">{lang.label}</span>
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex justify-start mt-8">
                    <button
                      onClick={prevStep}
                      aria-label={t.back}
                      className="text-gray-500 font-bold flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-az-purple/50 rounded-lg px-2 py-1"
                    >
                      <span className="material-symbols-outlined" aria-hidden="true">arrow_back</span> {t.back}
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
                  <h2 className="text-2xl font-black text-gray-900 mb-2">{t.howToConnect}</h2>
                  <p className="text-gray-500 mb-6">{t.connectHint}</p>
                  <div className="space-y-3">
                    {[
                      { value: 'phone', label: t.phoneCall, icon: 'call', desc: t.phoneDesc },
                      { value: 'zoom', label: t.zoomCall, icon: 'videocam', desc: t.zoomDesc },
                      { value: 'discord', label: t.discordCall, icon: 'headset_mic', desc: t.discordDesc },
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
                      <span className="material-symbols-outlined">arrow_back</span> {t.back}
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
                      <label htmlFor="phone-input" className="block">
                        <h2 className="text-2xl font-black text-gray-900 mb-2">{t.phoneNumber}</h2>
                        <p className="text-gray-500 mb-6">{t.phoneHint}</p>
                      </label>
                      <input
                        id="phone-input"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder="(555) 123-4567"
                        aria-label={t.phoneNumber}
                        aria-describedby="phone-hint"
                        className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-xl focus:border-az-purple focus:ring-0 outline-none transition-all text-lg font-medium ${
                          formData.phoneNumber && !isValidPhone(formData.phoneNumber)
                            ? 'border-red-300'
                            : 'border-gray-200'
                        }`}
                        autoFocus
                      />
                      {formData.phoneNumber && !isValidPhone(formData.phoneNumber) && (
                        <p className="text-red-500 text-sm mt-2" role="alert">
                          {formData.language === 'spanish'
                            ? 'Por favor ingresa un número de 10 dígitos'
                            : 'Please enter a 10-digit phone number'}
                        </p>
                      )}
                    </>
                  )}

                  {formData.contactMethod === 'zoom' && (
                    <>
                      <label htmlFor="email-input" className="block">
                        <h2 className="text-2xl font-black text-gray-900 mb-2">{t.emailAddress}</h2>
                        <p className="text-gray-500 mb-6">{t.emailHint}</p>
                      </label>
                      <input
                        id="email-input"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateForm('email', e.target.value)}
                        placeholder={t.emailPlaceholder}
                        aria-label={t.emailAddress}
                        aria-invalid={formData.email && !isValidEmail(formData.email)}
                        className={`w-full px-4 py-4 bg-gray-50 border-2 rounded-xl focus:border-az-purple focus:ring-0 outline-none transition-all text-lg font-medium ${
                          formData.email && !isValidEmail(formData.email)
                            ? 'border-red-300'
                            : 'border-gray-200'
                        }`}
                        autoFocus
                      />
                      {formData.email && !isValidEmail(formData.email) && (
                        <p className="text-red-500 text-sm mt-2" role="alert">
                          {formData.language === 'spanish'
                            ? 'Por favor ingresa un correo electrónico válido'
                            : 'Please enter a valid email address'}
                        </p>
                      )}
                    </>
                  )}

                  {formData.contactMethod === 'discord' && (
                    <>
                      <h2 className="text-2xl font-black text-gray-900 mb-2">{t.discordConnect}</h2>
                      <p className="text-gray-500 mb-6">
                        {t.discordHint}
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
                        {t.joinDiscord}
                      </a>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.discordConfirmed}
                          onChange={(e) => updateForm('discordConfirmed', e.target.checked)}
                          className="w-5 h-5 rounded border-gray-300 text-az-purple focus:ring-az-purple"
                        />
                        <span className="text-gray-700">{t.discordConfirm}</span>
                      </label>
                    </>
                  )}

                  <div className="flex justify-between mt-8">
                    <button onClick={prevStep} className="text-gray-500 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined">arrow_back</span> {t.back}
                    </button>
                    <motion.button
                      onClick={nextStep}
                      disabled={
                        (formData.contactMethod === 'phone' && !isValidPhone(formData.phoneNumber)) ||
                        (formData.contactMethod === 'zoom' && !isValidEmail(formData.email)) ||
                        (formData.contactMethod === 'discord' && !formData.discordConfirmed)
                      }
                      aria-label={t.continue}
                      className="bg-az-purple text-white font-black px-6 py-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      whileHover={!isMobile ? { scale: 1.02 } : {}}
                      whileTap={{ scale: 0.98 }}
                    >
                      {t.continue} <span className="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
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
                  <h2 className="text-2xl font-black text-gray-900 mb-2">{t.pickDate}</h2>
                  <p className="text-gray-500 mb-6">{t.dateRange}</p>
                  {isLoadingSlots ? (
                    <div className="flex items-center justify-center py-12">
                      <motion.span
                        className="material-symbols-outlined text-4xl text-az-purple"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        sync
                      </motion.span>
                      <span className="ml-3 text-gray-500">{t.loadingSlots}</span>
                    </div>
                  ) : slotsError ? (
                    <div className="text-center py-12">
                      <span className="material-symbols-outlined text-4xl text-red-500 mb-2">error</span>
                      <p className="text-red-500">{t.errorLoading}</p>
                    </div>
                  ) : (
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
                            {date.toLocaleDateString(formData.language === 'spanish' ? 'es-MX' : 'en-US', { weekday: 'short' })}
                          </span>
                          <span className="font-bold text-gray-900">
                            {date.toLocaleDateString(formData.language === 'spanish' ? 'es-MX' : 'en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  )}
                  <div className="flex justify-start mt-8">
                    <button onClick={prevStep} className="text-gray-500 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined">arrow_back</span> {t.back}
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
                  <h2 className="text-2xl font-black text-gray-900 mb-2">{t.pickTime}</h2>
                  <p className="text-gray-500 mb-6">
                    {formData.selectedDate && formatDateDisplay(formData.selectedDate)} – {t.availableSlots}
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
                          <span className="text-xs text-gray-400 block">{t.taken}</span>
                        )}
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex justify-between mt-8">
                    <button onClick={prevStep} className="text-gray-500 font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined">arrow_back</span> {t.back}
                    </button>
                    <button
                      onClick={() => {
                        updateForm('selectedDate', null);
                        prevStep();
                      }}
                      className="text-az-blue font-bold text-sm"
                    >
                      {t.changeDate}
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
                  <h2 className="text-2xl font-black text-gray-900 mb-6">{t.confirmAppointment}</h2>

                  <div className="bg-gray-50 rounded-xl p-6 mb-6 text-left space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t.name}</span>
                      <span className="font-bold text-gray-900">{formData.preferredName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t.language}</span>
                      <span className="font-bold text-gray-900">
                        {formData.language === 'english' ? 'English' : 'Español'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">{t.method}</span>
                      <span className="font-bold text-gray-900 capitalize">{formData.contactMethod}</span>
                    </div>
                    {formData.contactMethod === 'phone' && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t.phone}</span>
                        <span className="font-bold text-gray-900">{formData.phoneNumber}</span>
                      </div>
                    )}
                    {formData.contactMethod === 'zoom' && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t.email}</span>
                        <span className="font-bold text-gray-900">{formData.email}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500">{t.dateTime}</span>
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
                      {t.goBack}
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
                          {t.registering}
                        </>
                      ) : (
                        <>
                          {t.confirmButton}
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

      {/* reCAPTCHA badge notice */}
      <div className="text-center pb-4 relative z-10">
        <p className="text-white/50 text-xs">
          This site is protected by reCAPTCHA and the Google{' '}
          <a href="https://policies.google.com/privacy" className="underline">Privacy Policy</a> and{' '}
          <a href="https://policies.google.com/terms" className="underline">Terms of Service</a> apply.
        </p>
      </div>
    </div>
  );
}
