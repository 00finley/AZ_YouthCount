import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Admin() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [slots, setSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [actionMessage, setActionMessage] = useState('');

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
      fetchSlots();
    }
  }, [isAuthenticated]);

  const fetchSlots = async () => {
    setIsLoadingSlots(true);
    try {
      const response = await fetch('/api/slots');
      const data = await response.json();
      setSlots(data.bookedSlots || []);
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

  const handleClearAll = async () => {
    if (!confirm('Are you sure you want to clear ALL booked slots?')) return;

    setActionMessage('Clearing...');
    try {
      const token = sessionStorage.getItem('admin_token');
      const response = await fetch('/api/slots', {
        method: 'DELETE',
        headers: { 'X-Admin-Secret': token },
      });

      if (response.ok) {
        setActionMessage('All slots cleared!');
        setSlots([]);
      } else {
        setActionMessage('Error clearing slots');
      }
    } catch (err) {
      setActionMessage('Error clearing slots');
    }

    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleRemoveSlot = async (slotKey) => {
    if (!confirm(`Remove slot ${slotKey}?`)) return;

    setActionMessage('Removing...');
    try {
      const token = sessionStorage.getItem('admin_token');
      const newSlots = slots.filter(s => s !== slotKey);

      const response = await fetch('/api/slots', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': token,
        },
        body: JSON.stringify({ slots: newSlots }),
      });

      if (response.ok) {
        setActionMessage('Slot removed!');
        setSlots(newSlots);
      } else {
        setActionMessage('Error removing slot');
      }
    } catch (err) {
      setActionMessage('Error removing slot');
    }

    setTimeout(() => setActionMessage(''), 3000);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    sessionStorage.removeItem('admin_token');
    setPassword('');
  };

  // Format slot key for display
  const formatSlot = (slotKey) => {
    // slotKey format: 2026-01-28-14:00
    const parts = slotKey.split('-');
    const date = new Date(parts[0], parseInt(parts[1]) - 1, parseInt(parts[2]));
    const time = parts[3];

    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });

    // Convert 24h to 12h
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const timeStr = `${displayHour}:${minutes} ${period}`;

    return `${dateStr} at ${timeStr}`;
  };

  // Group slots by date
  const groupedSlots = slots.reduce((acc, slot) => {
    const date = slot.substring(0, 10);
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-black text-gray-900">Slot Admin</h1>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-gray-700 font-medium text-sm"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Actions */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Booked Slots</h2>
              <p className="text-gray-500 text-sm">
                {slots.length} slot{slots.length !== 1 ? 's' : ''} currently booked
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchSlots}
                className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200"
              >
                Refresh
              </button>
              <button
                onClick={handleClearAll}
                disabled={slots.length === 0}
                className="px-4 py-2 bg-red-500 text-white font-medium rounded-lg hover:bg-red-600 disabled:opacity-50"
              >
                Clear All
              </button>
            </div>
          </div>

          {actionMessage && (
            <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
              {actionMessage}
            </div>
          )}
        </div>

        {/* Slots List */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {isLoadingSlots ? (
            <div className="p-8 text-center text-gray-500">Loading slots...</div>
          ) : slots.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No slots booked yet
            </div>
          ) : (
            <div className="divide-y">
              {Object.entries(groupedSlots)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, dateSlots]) => (
                  <div key={date} className="p-4">
                    <h3 className="font-bold text-gray-900 mb-3">
                      {new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </h3>
                    <div className="space-y-2">
                      {dateSlots.sort().map((slot) => (
                        <div
                          key={slot}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <span className="font-medium text-gray-700">
                            {formatSlot(slot)}
                          </span>
                          <button
                            onClick={() => handleRemoveSlot(slot)}
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
          )}
        </div>
      </main>
    </div>
  );
}
