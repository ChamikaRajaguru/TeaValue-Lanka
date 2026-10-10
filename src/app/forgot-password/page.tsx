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
        <div className="w-12 h-12 bg-tea-800 text-tea-100 rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <KeyRound className="w-6 h-6 text-leaf-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-tea-950">Password Recovery</h1>
        <p className="text-xs text-stone-600">
          Enter your registered email address to receive password reset guidance.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-cream-200 shadow-md space-y-6">
        {submitted ? (
          <div className="space-y-4 text-center">
            <div className="p-4 bg-leaf-50 text-tea-900 rounded-2xl border border-leaf-300 text-xs leading-relaxed">
              <CheckCircle2 className="w-6 h-6 text-leaf-600 mx-auto mb-2" />
              If an account with <strong>{email}</strong> exists, password reset instructions have been logged to the server console (Safe local development mode).
            </div>
            <Link
              href="/login"
              className="inline-block px-5 py-2.5 bg-tea-800 text-white font-bold text-xs rounded-xl"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-tea-800 hover:bg-tea-900 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
            >
              Send Reset Request
            </button>
          </form>
        )}

        <div className="pt-4 border-t border-cream-200 text-center text-xs text-stone-600">
          Remember your password?{' '}
          <Link href="/login" className="text-tea-800 font-bold hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
