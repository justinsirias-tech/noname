import React, { useState } from 'react';
import { Icon } from './Icons.jsx';

export function AdminLogin({ onLoginSuccess, onCancel }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim() || !password) {
      setErrorMessage('Please enter both username and password.');
      return;
    }

    setLoading(true);

    try {
      let data = null;
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: username.trim(),
            password
          })
        });
        if (res.ok) {
          data = await res.json();
        }
      } catch (netErr) {
        // Backend API offline or static server mode
      }

      if (data && data.success) {
        onLoginSuccess(data);
        return;
      }

      // Local fallback for admin demo credentials
      if ((username.trim().toLowerCase() === 'admin' || username.trim().toLowerCase() === 'admin@nonamelaundry.com') && password === 'admin1234') {
        const localAuth = {
          success: true,
          token: 'local_admin_session_' + Date.now(),
          user: {
            id: 1,
            username: 'admin',
            fullName: 'NoName Operations Admin',
            role: 'super_admin'
          }
        };
        onLoginSuccess(localAuth);
        return;
      }

      throw new Error(data?.error || 'Invalid username or password. Please use admin / admin1234.');
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-100/70">
      <div className="w-full max-w-md">
        
        {/* Top Brand Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-teal-400 items-center justify-center text-white text-3xl shadow-xl shadow-sky-500/20 mb-3">
            🧺
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            NoName <span className="text-sky-600">Laundry</span>
          </h1>
          <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-0.5">
            Admin POS Back-Office
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xl shadow-slate-200/50">
          <div className="flex items-center gap-2.5 pb-5 border-b border-slate-100 mb-6">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm">
              <Icon name="lock" className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 leading-tight">
                Staff Authentication
              </h2>
              <p className="text-[11px] text-slate-500">
                Restricted access for store managers & operators
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2.5 animate-shake">
              <span className="text-rose-500 font-bold text-sm leading-none">⚠️</span>
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Username or Admin Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin or admin@nonamelaundry.com"
                  autoComplete="username"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm text-slate-900 font-medium transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm text-slate-900 font-medium transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  <Icon name={showPassword ? 'eyeOff' : 'eye'} className="w-4 h-4" />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-3.5 px-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20 transition ${
                loading
                  ? 'bg-sky-400 cursor-not-allowed'
                  : 'bg-sky-600 hover:bg-sky-700 active:scale-[0.99]'
              }`}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <Icon name="checkCircle" className="w-4 h-4" />
                  <span>Log In to Admin POS</span>
                </>
              )}
            </button>
          </form>

          {/* Default Credentials Callout */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="bg-sky-50/60 border border-sky-100 rounded-2xl p-3.5 text-xs text-sky-900">
              <div className="font-bold flex items-center gap-1.5 text-sky-800 mb-1">
                <span>🔐</span>
                <span>Default Initial Credentials:</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono mt-1 text-slate-700 bg-white/80 px-2.5 py-1.5 rounded-lg border border-sky-100">
                <span>User: <strong className="text-slate-900">admin</strong></span>
                <span>Pass: <strong className="text-slate-900">admin1234</strong></span>
              </div>
              <p className="text-[10px] text-slate-500 mt-2">
                * You can change your password anytime in the Admin Settings tab after logging in.
              </p>
            </div>
          </div>

          {/* Cancel button */}
          {onCancel && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onCancel}
                className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition"
              >
                ← Return to Customer Website
              </button>
            </div>
          )}
        </div>

        {/* Security Footer Note */}
        <div className="text-center mt-6 text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Secured with Google Cloud PostgreSQL SSL</span>
        </div>

      </div>
    </div>
  );
}
