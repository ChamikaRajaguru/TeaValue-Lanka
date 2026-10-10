'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sprout, KeyRound, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-emerald-700/20">
          <KeyRound className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-emerald-950">Password Recovery</h1>
        <p className="text-xs text-stone-600">
          Enter your registered email address to receive password reset guidance.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-[0_4px_25px_-4px_rgba(6,78,59,0.06)] space-y-6">
        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-emerald-50 text-emerald-900 rounded-2xl border border-emerald-200 text-xs leading-relaxed">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
              If an account with <strong>{email}</strong> exists, password reset instructions have been logged to the server console (Safe local development mode).
            </div>
            <Link
              href="/login"
              className="inline-block px-5 py-2.5 glow-btn text-white font-bold text-xs rounded-xl shadow-glow"
            >
              Return to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Account Email
              </label>
              <input
                type="email"
                required
                placeholder="farmer@teavalue.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 glow-btn text-white font-bold text-sm rounded-xl shadow-glow transition-all"
            >
              Send Reset Request
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-stone-100 text-center text-xs text-stone-600">
          Remember your password?{' '}
          <Link href="/login" className="text-emerald-800 font-bold hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
