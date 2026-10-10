'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { KeyRound, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      router.push('/login');
    }, 1500);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-emerald-700/20">
          <KeyRound className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-emerald-950">Set New Password</h1>
        <p className="text-xs text-stone-600">
          Enter a new secure password for your smallholder tea account.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-[0_4px_25px_-4px_rgba(6,78,59,0.06)] space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-4 bg-emerald-50 text-emerald-900 text-xs rounded-2xl border border-emerald-200 text-center font-medium">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
            Password reset successfully! Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                New Password (min 8 characters)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 glow-btn text-white font-bold text-sm rounded-xl shadow-glow transition-all"
            >
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
