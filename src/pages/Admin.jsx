import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Configuration matching slots API
const COUNT_START = new Date('2026-01-28');
const COUNT_END = new Date('2026-02-13');
const DOUBLE_SLOTS_START = new Date('2026-02-06');
const SLOTS_BEFORE_FEB_6 = 1;
const SLOTS_FROM_FEB_6 = 2;

export default function Admin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [legacySlots, setLegacySlots] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' });
  const [viewMode, setViewMode] = useState('date'); // 'date', 'method', or 'volunteer'
  const [showAddForm, setShowAddForm] = useState(false);
  const [showVolunteerModal, setShowVolunteerModal] = useState(null); // volunteer id to show
  const [newBooking, setNewBooking] = useState({
    date: '',
    time: '',
    name: '',
    contactMethod: 'phone',
    contactInfo: '',
  });

  // Check if already authenticated (session storage)
  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch slots when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  const fetchBookings = async () => {
    setIsLoadingSlots(true);
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch('/api/slots', {
        headers: { 'X-Admin-Secret': token },
      });
      const data = await response.json();
      setBookings(data.bookings || []);
      setLegacySlots(data.bookedSlots || []);
      setVolunteers(data.volunteers || []);
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_auth', 'true');
        sessionStorage.setItem('admin_token', password);
      } else {
        setError('Incorrect password');
      }
    } catch (err) {
      setError('Error authenticating');
    } finally {
      setIsLoading(false);
    }
  };

  const showMessage = (type, text) => {
    setActionMessage({ type, text });
    setTimeout(() => setActionMessage({ type: '', text: '' }), 3000);
  };

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear ALL booked slots? This cannot be undone.')) return;

    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch('/api/slots', {
        method: 'DELETE',
        headers: { 'X-Admin-Secret': token },
      });

      if (response.ok) {
        showMessage('success', 'All slots cleared!');
        setBookings([]);
        setLegacySlots([]);
      } else {
        showMessage('error', 'Error clearing slots');
      }
    } catch (err) {
      showMessage('error', 'Error clearing slots');
    }
  };

  const handleClearDate = async (date) => {
    if (!confirm(`Clear all bookings for ${formatDate(date)}?`)) return;

    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch('/api/slots', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': token,
        },
        body: JSON.stringify({ action: 'clearDate', date }),
      });

      if (response.ok) {
        showMessage('success', `All bookings for ${date} cleared!`);
        await fetchBookings();
      } else {
        showMessage('error', 'Error clearing date');
      }
    } catch (err) {
      showMessage('error', 'Error clearing date');
    }
  };

  const handleRemoveBooking = async (slotKey) => {
    const booking = bookings.find(b => b.slotKey === slotKey);
    const displayName = booking?.name || slotKey;
    if (!confirm(`Remove booking for ${displayName}?`)) return;

    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch('/api/slots', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': token,
        },
        body: JSON.stringify({ action: 'removeBooking', slotKey }),
      });

      if (response.ok) {
        showMessage('success', 'Booking removed!');
        await fetchBookings();
      } else {
        showMessage('error', 'Error removing booking');
      }
    } catch (err) {
      showMessage('error', 'Error removing booking');
    }
  };

  const handleAddBooking = async (e) => {
    e.preventDefault();

    if (!newBooking.date || !newBooking.time) {
      showMessage('error', 'Please select date and time');
      return;
    }

    const slotKey = `${newBooking.date}-${newBooking.time}`;

    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch('/api/slots', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': token,
        },
        body: JSON.stringify({
          action: 'addBooking',
          booking: {
            slotKey,
            name: newBooking.name || 'Admin Added',
            contactMethod: newBooking.contactMethod,
            contactInfo: newBooking.contactInfo,
          },
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage('success', 'Booking added!');
        setShowAddForm(false);
        setNewBooking({
          date: '',
          time: '',
          name: '',
          contactMethod: 'phone',
          contactInfo: '',
        });
        await fetchBookings();
      } else {
        showMessage('error', data.error || 'Error adding booking');
      }
    } catch (err) {
      showMessage('error', 'Error adding booking');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    sessionStorage.removeItem('admin_token');
    setPassword('');
  };

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format time for display
  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  };

  // Format slot key for display
  const formatSlot = (slotKey) => {
    const parts = slotKey.split('-');
    const date = new Date(parts[0], parseInt(parts[1]) - 1, parseInt(parts[2]));
    const time = parts[3];

    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    return `${dateStr} at ${formatTime(time)}`;
  };

  // Get contact method icon
  const getMethodIcon = (method) => {
    switch (method) {
      case 'phone': return 'call';
      case 'zoom': return 'videocam';
      case 'discord': return 'headset_mic';
      default: return 'person';
    }
  };

  // Get contact method color
  const getMethodColor = (method) => {
    switch (method) {
      case 'phone': return 'bg-green-100 text-green-700';
      case 'zoom': return 'bg-blue-100 text-blue-700';
      case 'discord': return 'bg-indigo-100 text-indigo-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Group bookings by date
  const groupedByDate = bookings.reduce((acc, booking) => {
    const date = booking.slotKey.substring(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(booking);
    return acc;
  }, {});

  // Group bookings by contact method
  const groupedByMethod = bookings.reduce((acc, booking) => {
    const method = booking.contactMethod || 'unknown';
    if (!acc[method]) acc[method] = [];
    acc[method].push(booking);
    return acc;
  }, {});

  // Generate available dates for the date picker
  const availableDates = [];
  let current = new Date(COUNT_START);
  while (current <= COUNT_END) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const year = current.getFullYear();
      const month = (current.getMonth() + 1).toString().padStart(2, '0');
      const day = current.getDate().toString().padStart(2, '0');
      availableDates.push(`${year}-${month}-${day}`);
    }
    current.setDate(current.getDate() + 1);
  }

  // Generate time slots
  const timeSlots = [];
  for (let hour = 6; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(timeStr);
    }
  }

  // Count bookings by method
  const methodCounts = {
    phone: groupedByMethod.phone?.length || 0,
    zoom: groupedByMethod.zoom?.length || 0,
    discord: groupedByMethod.discord?.length || 0,
  };

  // Group bookings by volunteer
  const groupedByVolunteer = bookings.reduce((acc, booking) => {
    const volunteerId = booking.assignedVolunteer || 'unassigned';
    if (!acc[volunteerId]) acc[volunteerId] = [];
    acc[volunteerId].push(booking);
    return acc;
  }, {});

  // Count bookings per volunteer
  const volunteerCounts = volunteers.reduce((acc, v) => {
    acc[v.id] = groupedByVolunteer[v.id]?.length || 0;
    return acc;
  }, {});

  // Format volunteer availability time
  const formatAvailTime = (hour) => {
    const h = Math.floor(hour);
    const m = (hour - h) * 60;
    const period = h >= 12 ? 'PM' : 'AM';
    const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return m > 0 ? `${displayH}:${m.toString().padStart(2, '0')} ${period}` : `${displayH} ${period}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 flex items-center justify-center p-4">
        <motion.div
          className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <h1 className="text-2xl font-black text-gray-900 mb-6 text-center">Admin Login</h1>

          <form onSubmit={handleLogin}>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-az-purple focus:ring-0 outline-none mb-4"
              placeholder="Enter admin password"
              autoFocus
            />

            {error && (
              <p className="text-red-500 text-sm mb-4">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full py-3 bg-az-purple text-white font-bold rounded-xl disabled:opacity-50"
            >
              {isLoading ? 'Checking...' : 'Login'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-black text-gray-900">Booking Admin</h1>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-700 font-medium text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="text-3xl font-black text-gray-900">{bookings.length}</div>
            <div className="text-sm text-gray-500">Total Bookings</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-green-600">call</span>
              <span className="text-2xl font-bold text-gray-900">{methodCounts.phone}</span>
            </div>
            <div className="text-sm text-gray-500">Phone</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600">videocam</span>
              <span className="text-2xl font-bold text-gray-900">{methodCounts.zoom}</span>
            </div>
            <div className="text-sm text-gray-500">Zoom</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border p-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-indigo-600">headset_mic</span>
              <span className="text-2xl font-bold text-gray-900">{methodCounts.discord}</span>
            </div>
            <div className="text-sm text-gray-500">Discord</div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-500">View by:</span>
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('date')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'date' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                  }`}
                >
                  Date
                </button>
                <button
                  onClick={() => setViewMode('method')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'method' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                  }`}
                >
                  Contact Method
                </button>
                <button
                  onClick={() => setViewMode('volunteer')}
                  className={`px-3 py-1 text-sm font-medium rounded-md transition-all ${
                    viewMode === 'volunteer' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'
                  }`}
                >
                  Volunteer
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-az-purple text-white font-medium rounded-lg hover:bg-az-purple/90 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Add Booking
              </button>
              <button
                onClick={fetchBookings}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200"
              >
                Refresh
              </button>
              <button
                onClick={handleClearAll}
                disabled={bookings.length === 0}
                className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                Clear All
              </button>
            </div>
          </div>

          {actionMessage.text && (
            <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
              actionMessage.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {actionMessage.text}
            </div>
          )}
        </div>

        {/* Add Booking Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-md w-full"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h2 className="text-xl font-bold text-gray-900 mb-4">Add New Booking</h2>
              <form onSubmit={handleAddBooking} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <select
                    value={newBooking.date}
                    onChange={(e) => setNewBooking({ ...newBooking, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-az-purple"
                  >
                    <option value="">Select a date</option>
                    {availableDates.map(date => (
                      <option key={date} value={date}>{formatDate(date)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <select
                    value={newBooking.time}
                    onChange={(e) => setNewBooking({ ...newBooking, time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-az-purple"
                  >
                    <option value="">Select a time</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{formatTime(time)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={newBooking.name}
                    onChange={(e) => setNewBooking({ ...newBooking, name: e.target.value })}
                    placeholder="Participant name"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-az-purple"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Method</label>
                  <select
                    value={newBooking.contactMethod}
                    onChange={(e) => setNewBooking({ ...newBooking, contactMethod: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-az-purple"
                  >
                    <option value="phone">Phone</option>
                    <option value="zoom">Zoom</option>
                    <option value="discord">Discord</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Info</label>
                  <input
                    type="text"
                    value={newBooking.contactInfo}
                    onChange={(e) => setNewBooking({ ...newBooking, contactInfo: e.target.value })}
                    placeholder={newBooking.contactMethod === 'phone' ? 'Phone number' : newBooking.contactMethod === 'zoom' ? 'Email' : 'Discord username'}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-az-purple"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 py-2 border-2 border-gray-200 rounded-lg font-medium text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-az-purple text-white rounded-lg font-medium"
                  >
                    Add Booking
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Bookings List */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {isLoadingSlots ? (
            <div className="p-8 text-center text-gray-500">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-gray-300 mb-2">event_busy</span>
              <p className="text-gray-500">No bookings yet</p>
              {legacySlots.length > 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  ({legacySlots.length} legacy slot{legacySlots.length !== 1 ? 's' : ''} without details)
                </p>
              )}
            </div>
          ) : viewMode === 'date' ? (
            // View by Date
            <div className="divide-y">
              {Object.entries(groupedByDate)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, dateBookings]) => (
                  <div key={date} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-gray-900">{formatDate(date)}</h3>
                      <button
                        onClick={() => handleClearDate(date)}
                        className="text-sm text-red-500 hover:text-red-700 font-medium"
                      >
                        Clear Day
                      </button>
                    </div>
                    <div className="space-y-2">
                      {dateBookings.sort((a, b) => a.slotKey.localeCompare(b.slotKey)).map((booking) => (
                        <div
                          key={booking.id || booking.slotKey}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getMethodColor(booking.contactMethod)}`}>
                              <span className="material-symbols-outlined text-sm">{getMethodIcon(booking.contactMethod)}</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{booking.name || 'Unknown'}</div>
                              <div className="text-sm text-gray-500">
                                {formatTime(booking.slotKey.split('-')[3])}
                                {booking.contactInfo && ` - ${booking.contactInfo}`}
                              </div>
                              {booking.assignedVolunteerName && (
                                <div className="text-xs text-az-purple font-medium mt-1">
                                  Volunteer: {booking.assignedVolunteerName}
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveBooking(booking.slotKey)}
                            className="px-3 py-1 text-red-600 hover:bg-red-50 rounded font-medium text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ) : viewMode === 'method' ? (
            // View by Contact Method
            <div className="divide-y">
              {['phone', 'zoom', 'discord'].map((method) => {
                const methodBookings = groupedByMethod[method] || [];
                if (methodBookings.length === 0) return null;
                return (
                  <div key={method} className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getMethodColor(method)}`}>
                        <span className="material-symbols-outlined text-sm">{getMethodIcon(method)}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 capitalize">{method}</h3>
                      <span className="text-sm text-gray-500">({methodBookings.length})</span>
                    </div>
                    <div className="space-y-2">
                      {methodBookings.sort((a, b) => a.slotKey.localeCompare(b.slotKey)).map((booking) => (
                        <div
                          key={booking.id || booking.slotKey}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <div className="font-medium text-gray-900">{booking.name || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">
                              {formatSlot(booking.slotKey)}
                              {booking.contactInfo && ` - ${booking.contactInfo}`}
                            </div>
                            {booking.assignedVolunteerName && (
                              <div className="text-xs text-az-purple font-medium mt-1">
                                Volunteer: {booking.assignedVolunteerName}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => handleRemoveBooking(booking.slotKey)}
                            className="px-3 py-1 text-red-600 hover:bg-red-50 rounded font-medium text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // View by Volunteer
            <div className="divide-y">
              {volunteers.map((volunteer) => {
                const volunteerBookings = groupedByVolunteer[volunteer.id] || [];
                return (
                  <div key={volunteer.id} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-az-purple/10 flex items-center justify-center">
                          <span className="material-symbols-outlined text-sm text-az-purple">person</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{volunteer.name}</h3>
                          <span className="text-xs text-gray-500">{volunteerBookings.length} booking{volunteerBookings.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowVolunteerModal(volunteer.id)}
                        className="text-sm text-az-blue hover:text-az-purple font-medium"
                      >
                        View Availability
                      </button>
                    </div>
                    {volunteerBookings.length > 0 ? (
                      <div className="space-y-2">
                        {volunteerBookings.sort((a, b) => a.slotKey.localeCompare(b.slotKey)).map((booking) => (
                          <div
                            key={booking.id || booking.slotKey}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getMethodColor(booking.contactMethod)}`}>
                                <span className="material-symbols-outlined text-sm">{getMethodIcon(booking.contactMethod)}</span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{booking.name || 'Unknown'}</div>
                                <div className="text-sm text-gray-500">
                                  {formatSlot(booking.slotKey)}
                                  {booking.contactInfo && ` - ${booking.contactInfo}`}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveBooking(booking.slotKey)}
                              className="px-3 py-1 text-red-600 hover:bg-red-50 rounded font-medium text-sm"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No bookings assigned yet</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Volunteer Availability Modal */}
        {showVolunteerModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-auto"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {(() => {
                const volunteer = volunteers.find(v => v.id === showVolunteerModal);
                if (!volunteer) return null;
                return (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-900">{volunteer.name}'s Availability</h2>
                      <button
                        onClick={() => setShowVolunteerModal(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                    <div className="space-y-2">
                      {volunteer.availability.map((slot) => (
                        <div key={slot.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-gray-900">{formatDate(slot.date)}</span>
                          <span className="text-sm text-gray-600">
                            {formatAvailTime(slot.start)} - {formatAvailTime(slot.end)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}

        {/* Legacy slots notice */}
        {legacySlots.length > bookings.length && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-700">
              <strong>Note:</strong> There are {legacySlots.length - bookings.length} booking(s) from before the system upgrade that don't have participant details.
              These slots are still reserved but won't show detailed information.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
