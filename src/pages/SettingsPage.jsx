import React, { useState } from 'react';
import { Settings, Lock, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Server } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function SettingsPage() {
  const { user, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'Password must be at least 6 characters long.' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setFeedback({ type: 'error', message: res.error || 'Failed to update password.' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          System & Account Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Manage your administrator security credentials, API environment, and database settings.
        </p>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 p-4 rounded-xl text-xs font-semibold ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Account Profile Box */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xl font-bold">
            {user?.username?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{user?.username}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase">
              Role: {user?.role || 'admin'}
            </span>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <Lock className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">Change Admin Password</h3>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3.5 py-2 rounded-xl text-sm border border-slate-700 bg-slate-800 text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                Updating Password...
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>
      </div>

      {/* Backend Specs */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <Server className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">System & Architecture Telemetry</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-slate-300">
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
            <span className="text-slate-500 block">CMS Backend API</span>
            <span className="text-indigo-400 font-bold">http://localhost:5000/api</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
            <span className="text-slate-500 block">Database Layer</span>
            <span className="text-emerald-400 font-bold">MongoDB Atlas / Mongoose</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
            <span className="text-slate-500 block">Public Portfolio URL</span>
            <span className="text-white font-bold">http://localhost:5173</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-1">
            <span className="text-slate-500 block">Admin Panel URL</span>
            <span className="text-purple-400 font-bold">http://localhost:5174</span>
          </div>
        </div>
      </div>
    </div>
  );
}
