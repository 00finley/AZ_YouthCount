import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Old registration page - redirects to new secure page
// This prevents bots from continuing to attack the old URL

export default function RegisterDisabled() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate('/virtual', { replace: true });
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 md:p-12 max-w-lg w-full text-center shadow-2xl">
        <div className="w-20 h-20 bg-az-blue/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-5xl text-az-blue">swap_horiz</span>
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-4">Registration Has Moved</h2>
        <p className="text-gray-600 mb-6">
          We've upgraded our registration system. You'll be redirected automatically in a few seconds.
        </p>
        <Link
          to="/virtual"
          className="inline-flex items-center gap-2 bg-az-purple text-white font-bold px-8 py-4 rounded-xl"
        >
          Go to New Registration
          <span className="material-symbols-outlined">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
}
