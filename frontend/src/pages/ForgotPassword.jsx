import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setSent(true); // Demo success feedback
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 border border-gray-800 shadow-2xl space-y-6">
        <Link to="/login" className="inline-flex items-center text-xs text-gray-400 hover:text-white space-x-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
        </Link>

        <div>
          <h2 className="text-xl font-bold text-white">Reset Admin Password</h2>
          <p className="text-xs text-gray-400 mt-1">Enter your registered email to receive password recovery instructions.</p>
        </div>

        {sent ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs text-center space-y-2">
            <p className="font-bold">Password Reset Dispatched!</p>
            <p className="text-[11px] text-gray-300">Check your email inbox for password recovery links.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-gray-400 mb-1">Admin Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-9 pr-4 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  placeholder="admin@company.com"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all text-xs"
            >
              <Send className="w-3.5 h-3.5" /> Send Reset Link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
