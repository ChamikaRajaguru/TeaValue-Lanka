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
        <div className="w-12 h-12 bg-tea-800 text-tea-100 rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <KeyRound className="w-6 h-6 text-leaf-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-tea-950">Set New Password</h1>
        <p className="text-xs text-stone-600">
          Enter a new secure password for your smallholder tea account.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-cream-200 shadow-md space-y-6">
        {error && (
          <div className="p-3 bg-red-50 text-red-800 text-xs rounded-xl border border-red-200">
            {error}
          </div>
        )}

        {success ? (
          <div className="p-4 bg-leaf-50 text-tea-900 text-xs rounded-2xl border border-leaf-300 text-center font-medium">
            <CheckCircle2 className="w-6 h-6 text-leaf-600 mx-auto mb-2" />
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-tea-800 hover:bg-tea-900 text-white font-bold text-sm rounded-xl shadow-md transition-colors"
            >
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
