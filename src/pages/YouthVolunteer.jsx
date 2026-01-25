import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// Count period configuration
const COUNT_START = new Date('2026-01-28');
const COUNT_END = new Date('2026-02-13');

// Generate time slots (30-minute intervals from 6am to 6pm)
const TIME_SLOTS = [];
for (let hour = 6; hour < 18; hour++) {
  TIME_SLOTS.push(`${hour.toString().padStart(2, '0')}:00`);
  TIME_SLOTS.push(`${hour.toString().padStart(2, '0')}:30`);
}

// Volunteer colors for display
const VOLUNTEER_COLORS = [
  'bg-pink-100 border-pink-300 text-pink-800',
  'bg-purple-100 border-purple-300 text-purple-800',
  'bg-blue-100 border-blue-300 text-blue-800',
  'bg-green-100 border-green-300 text-green-800',
  'bg-yellow-100 border-yellow-300 text-yellow-800',
  'bg-orange-100 border-orange-300 text-orange-800',
  'bg-teal-100 border-teal-300 text-teal-800',
  'bg-red-100 border-red-300 text-red-800',
  'bg-indigo-100 border-indigo-300 text-indigo-800',
  'bg-cyan-100 border-cyan-300 text-cyan-800',
];

export default function YouthVolunteer() {
  // Auth state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null); // { username, name, isAdmin }

  // Volunteer state
  const [volunteers, setVolunteers] = useState([]);
  const [allBookings, setAllBookings] = useState([]);

  // UI state
  const [activeTab, setActiveTab] = useState('availability'); // 'availability', 'bookings', 'instructions'
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  // Check session storage for existing auth
  useEffect(() => {
    const auth = sessionStorage.getItem('youth_volunteer_auth');
    const storedUser = sessionStorage.getItem('youth_volunteer_user');

    if (auth === 'true' && storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (e) {
        // Invalid stored data, clear it
        sessionStorage.removeItem('youth_volunteer_auth');
        sessionStorage.removeItem('youth_volunteer_user');
        sessionStorage.removeItem('youth_volunteer_token');
      }
    }
  }, []);

  // Fetch data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem('youth_volunteer_token');
      const storedUser = sessionStorage.getItem('youth_volunteer_user');
      const user = storedUser ? JSON.parse(storedUser) : null;

      if (!user) return;

      const response = await fetch('/api/youth-volunteers', {
        headers: {
          'X-Youth-Secret': token,
          'X-Youth-Username': user.username,
        },
      });
      const data = await response.json();

      if (data.authenticated) {
        setVolunteers(data.volunteers || []);
        setAllBookings(data.allDiscordBookings || []);
        if (data.user) {
          setCurrentUser(data.user);
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/youth-volunteers', {
        headers: {
          'X-Youth-Secret': password,
          'X-Youth-Username': username.toLowerCase().trim(),
        },
      });
      const data = await response.json();

      if (data.authenticated) {
        setIsAuthenticated(true);
        setCurrentUser(data.user);
        sessionStorage.setItem('youth_volunteer_auth', 'true');
        sessionStorage.setItem('youth_volunteer_token', password);
        sessionStorage.setItem('youth_volunteer_user', JSON.stringify(data.user));
        setVolunteers(data.volunteers || []);
        setAllBookings(data.allDiscordBookings || []);
      } else {
        setError(data.error || 'Invalid username or password');
      }
    } catch (err) {
      setError('Error authenticating');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSlot = async (slotKey) => {
    if (!currentUser || isUpdating) return;

    setIsUpdating(true);
    const myVolunteer = volunteers.find(v => v.id === currentUser.username);
    const hasSlot = myVolunteer?.availability?.includes(slotKey);

    try {
      const token = sessionStorage.getItem('youth_volunteer_token');
      const response = await fetch('/api/youth-volunteers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Youth-Secret': token,
          'X-Youth-Username': currentUser.username,
        },
        body: JSON.stringify({
          action: hasSlot ? 'removeSlot' : 'addSlot',
          volunteerId: currentUser.username,
          slotKey,
        }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (err) {
      showMessage('error', 'Error updating availability');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setVolunteers([]);
    setAllBookings([]);
    sessionStorage.removeItem('youth_volunteer_auth');
    sessionStorage.removeItem('youth_volunteer_token');
    sessionStorage.removeItem('youth_volunteer_user');
    setUsername('');
    setPassword('');
  };

  const showMessage = (type, text) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
  };

  // Generate calendar weeks
  const calendarWeeks = useMemo(() => {
    const weeks = [];
    let currentDate = new Date(COUNT_START);

    // Week 1: Jan 28-31
    weeks.push({ label: 'Week 1 (Jan 28-31)', dates: [] });
    while (currentDate <= COUNT_END && currentDate.getDate() <= 31 && currentDate.getMonth() === 0) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        weeks[0].dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Week 2: Feb 2-6
    weeks.push({ label: 'Week 2 (Feb 2-6)', dates: [] });
    while (currentDate <= COUNT_END && currentDate.getDate() <= 6 && currentDate.getMonth() === 1) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        weeks[1].dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Week 3: Feb 9-13
    weeks.push({ label: 'Week 3 (Feb 9-13)', dates: [] });
    while (currentDate <= COUNT_END) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        weeks[2].dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return weeks;
  }, []);

  // Get slot key from date and time
  const getSlotKey = (date, time) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}-${time}`;
  };

  // Get volunteers who have this slot
  const getVolunteersForSlot = (slotKey) => {
    return volunteers.filter(v => v.availability?.includes(slotKey));
  };

  // Check if slot has a booking
  const getBookingForSlot = (slotKey) => {
    return allBookings.find(b => b.slotKey === slotKey);
  };

  // Get my bookings
  const myBookings = currentUser ? allBookings.filter(b => b.assignedVolunteer === currentUser.username) : [];

  // Format time for display
  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get volunteer color by index
  const getVolunteerColor = (volunteerId) => {
    const index = volunteers.findIndex(v => v.id === volunteerId);
    return VOLUNTEER_COLORS[index % VOLUNTEER_COLORS.length];
  };

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 flex items-center justify-center p-4">
        <motion.div
          className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-az-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-az-purple">group</span>
            </div>
            <h1 className="text-2xl font-black text-gray-900">Youth Board Portal</h1>
            <p className="text-gray-500 text-sm mt-2">Sign in to manage your availability</p>
          </div>

          <form onSubmit={handleLogin}>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-az-purple focus:ring-0 outline-none mb-4"
              placeholder="Enter your username"
              autoFocus
              autoCapitalize="none"
              autoCorrect="off"
            />

            <label className="block text-sm font-bold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-az-purple focus:ring-0 outline-none mb-4"
              placeholder="Enter portal password"
            />

            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading || !password || !username.trim()}
              className="w-full py-3 bg-az-purple text-white font-bold rounded-xl disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <Link
            to="/"
            className="block text-center text-sm text-gray-500 hover:text-az-purple mt-4"
          >
            Back to main site
          </Link>
        </motion.div>
      </div>
    );
  }

  // Main portal
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black text-gray-900">Youth Board Portal</h1>
            <p className="text-sm text-gray-500">
              Welcome, {currentUser?.name}
              {currentUser?.isAdmin && (
                <span className="ml-2 bg-az-purple text-white text-xs px-2 py-0.5 rounded-full">Admin</span>
              )}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-700 font-medium text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-1">
            {[
              { id: 'availability', label: 'My Availability', icon: 'calendar_month' },
              { id: 'bookings', label: 'My Bookings', icon: 'event_available' },
              { id: 'instructions', label: 'Instructions', icon: 'menu_book' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-az-purple text-az-purple'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                {tab.label}
                {tab.id === 'bookings' && myBookings.length > 0 && (
                  <span className="bg-az-purple text-white text-xs px-2 py-0.5 rounded-full">
                    {myBookings.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {actionMessage.text && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${
            actionMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {actionMessage.text}
          </div>
        )}

        {/* Availability Tab */}
        {activeTab === 'availability' && (
          <div className="space-y-6">
            {/* Volunteer Legend */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <h3 className="font-bold text-gray-900 mb-3">Team Availability</h3>
              <div className="flex flex-wrap gap-2">
                {volunteers.map((volunteer) => (
                  <div
                    key={volunteer.id}
                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getVolunteerColor(volunteer.id)} ${
                      volunteer.id === currentUser?.username ? 'ring-2 ring-az-purple ring-offset-1' : ''
                    }`}
                  >
                    {volunteer.name}
                    {volunteer.id === currentUser?.username && ' (You)'}
                  </div>
                ))}
              </div>
            </div>

            {/* Week Navigation */}
            <div className="bg-white rounded-xl shadow-sm border p-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setSelectedWeek(w => Math.max(0, w - 1))}
                  disabled={selectedWeek === 0}
                  className="px-3 py-2 bg-gray-100 rounded-lg disabled:opacity-30"
                >
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <h3 className="font-bold text-gray-900">{calendarWeeks[selectedWeek]?.label}</h3>
                <button
                  onClick={() => setSelectedWeek(w => Math.min(calendarWeeks.length - 1, w + 1))}
                  disabled={selectedWeek === calendarWeeks.length - 1}
                  className="px-3 py-2 bg-gray-100 rounded-lg disabled:opacity-30"
                >
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Click on time slots to toggle your availability. Colored slots show other volunteers' availability.
              </p>

              {/* Calendar Grid */}
              <div className="border rounded-lg overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Header row */}
                  <div className="grid bg-gray-50 border-b" style={{ gridTemplateColumns: '80px repeat(5, 1fr)' }}>
                    <div className="p-2 border-r text-xs font-medium text-gray-500">Time</div>
                    {calendarWeeks[selectedWeek]?.dates.map((date) => (
                      <div key={date.toISOString()} className="p-2 border-r last:border-r-0 text-center">
                        <div className="text-xs text-gray-500">
                          {date.toLocaleDateString('en-US', { weekday: 'short' })}
                        </div>
                        <div className="font-bold text-gray-900">
                          {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                    ))}
                    {Array.from({ length: Math.max(0, 5 - (calendarWeeks[selectedWeek]?.dates.length || 0)) }).map((_, i) => (
                      <div key={`empty-header-${i}`} className="p-2 border-r last:border-r-0 bg-gray-100"></div>
                    ))}
                  </div>

                  {/* Time rows */}
                  {TIME_SLOTS.map((time) => (
                    <div key={time} className="grid border-b last:border-b-0" style={{ gridTemplateColumns: '80px repeat(5, 1fr)' }}>
                      <div className="p-2 border-r text-xs font-medium text-gray-500 flex items-center">
                        {formatTime(time)}
                      </div>
                      {calendarWeeks[selectedWeek]?.dates.map((date) => {
                        const slotKey = getSlotKey(date, time);
                        const slotVolunteers = getVolunteersForSlot(slotKey);
                        const booking = getBookingForSlot(slotKey);
                        const isMySlot = slotVolunteers.some(v => v.id === currentUser?.username);
                        const hasOthers = slotVolunteers.some(v => v.id !== currentUser?.username);

                        return (
                          <button
                            key={date.toISOString()}
                            onClick={() => handleToggleSlot(slotKey)}
                            disabled={isUpdating || booking}
                            className={`p-1 border-r last:border-r-0 min-h-[40px] text-left transition-all hover:bg-gray-50 disabled:cursor-not-allowed ${
                              isMySlot ? 'bg-az-purple/10' : ''
                            } ${booking ? 'bg-green-50' : ''}`}
                          >
                            {booking ? (
                              <div className="text-xs p-1 bg-green-100 border border-green-300 rounded">
                                <div className="font-medium text-green-800 truncate">{booking.name}</div>
                                <div className="text-green-600">Booked</div>
                              </div>
                            ) : (
                              <div className="flex flex-wrap gap-0.5">
                                {slotVolunteers.map((v) => (
                                  <div
                                    key={v.id}
                                    className={`w-2 h-2 rounded-full ${
                                      v.id === currentUser?.username ? 'bg-az-purple' : 'bg-gray-400'
                                    }`}
                                    title={v.name}
                                  />
                                ))}
                                {isMySlot && (
                                  <span className="text-[10px] text-az-purple font-medium ml-1">You</span>
                                )}
                              </div>
                            )}
                          </button>
                        );
                      })}
                      {Array.from({ length: Math.max(0, 5 - (calendarWeeks[selectedWeek]?.dates.length || 0)) }).map((_, i) => (
                        <div key={`empty-${time}-${i}`} className="p-1 border-r last:border-r-0 min-h-[40px] bg-gray-50"></div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-az-purple/10 border border-az-purple"></div>
                  <span className="text-gray-600">Your availability</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                  <span className="text-gray-600">Other volunteer</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-100 border border-green-300"></div>
                  <span className="text-gray-600">Booked slot</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-4 border-b">
              <h3 className="font-bold text-gray-900">Your Assigned Bookings</h3>
              <p className="text-sm text-gray-500">These are the Discord calls you need to make</p>
            </div>

            {myBookings.length === 0 ? (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">event_busy</span>
                <p className="text-gray-500">No bookings assigned to you yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  When someone books a Discord call during your available times, it will appear here.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {myBookings.sort((a, b) => a.slotKey.localeCompare(b.slotKey)).map((booking) => {
                  const parts = booking.slotKey.split('-');
                  const dateStr = `${parts[0]}-${parts[1]}-${parts[2]}`;
                  const timeStr = parts[3];

                  return (
                    <div key={booking.slotKey} className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-bold text-gray-900 text-lg">{booking.name}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            <span className="material-symbols-outlined text-sm align-middle mr-1">calendar_today</span>
                            {formatDate(dateStr)} at {formatTime(timeStr)}
                          </div>
                          {booking.contactInfo && (
                            <div className="text-sm text-gray-500 mt-1">
                              <span className="material-symbols-outlined text-sm align-middle mr-1">alternate_email</span>
                              Discord: {booking.contactInfo}
                            </div>
                          )}
                        </div>
                        <div className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">headset_mic</span>
                          Discord Call
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Instructions Tab */}
        {activeTab === 'instructions' && (
          <div className="space-y-6">
            {/* Discord Login */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-[#5865F2] p-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                  </svg>
                  Discord Setup
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">1. Join the AZ Youth Count Discord Server</h4>
                  <p className="text-gray-600 text-sm mb-2">
                    If you haven't already, join our Discord server using the link below:
                  </p>
                  <a
                    href="https://discord.gg/azyouthcount"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-[#5865F2] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#4752C4] transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                    </svg>
                    Join Discord Server
                  </a>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">2. Look for the #youth-board channel</h4>
                  <p className="text-gray-600 text-sm">
                    This is where you'll coordinate with other youth board members and receive updates.
                  </p>
                </div>
              </div>
            </div>

            {/* Survey Instructions */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-az-purple p-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined">assignment</span>
                  Conducting the Survey
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Before the Call</h4>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
                      Review the participant's information from your bookings tab
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
                      Make sure you're in a quiet place with good internet
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
                      Have the survey questions ready (link will be provided)
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">During the Call</h4>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-az-purple font-bold">1.</span>
                      Introduce yourself and thank them for participating
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-az-purple font-bold">2.</span>
                      Explain that the survey takes about 10-15 minutes
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-az-purple font-bold">3.</span>
                      Remind them their responses are confidential
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-az-purple font-bold">4.</span>
                      Go through each question, giving them time to respond
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-az-purple font-bold">5.</span>
                      Thank them and explain how they'll receive their gift card
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">After the Call</h4>
                  <ul className="text-gray-600 text-sm space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
                      Submit the survey responses
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="material-symbols-outlined text-green-500 text-lg mt-0.5">check_circle</span>
                      Log the completed call in the #completed-surveys channel
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
              <div className="bg-az-orange p-4">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <span className="material-symbols-outlined">lightbulb</span>
                  Tips for Success
                </h3>
              </div>
              <div className="p-4">
                <ul className="text-gray-600 text-sm space-y-3">
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-az-orange">volunteer_activism</span>
                    <span>Be patient and understanding - some participants may be nervous or hesitant</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-az-orange">hearing</span>
                    <span>Listen actively and don't rush through questions</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-az-orange">psychology</span>
                    <span>Remember that you're sharing a peer-to-peer experience</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-az-orange">support</span>
                    <span>If someone shares something difficult, acknowledge it and remind them of available resources</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact */}
            <div className="bg-gray-100 rounded-xl p-4 text-center">
              <p className="text-gray-600 text-sm">
                Questions? Reach out in the <strong>#youth-board</strong> Discord channel or contact your coordinator.
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
