'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { Sprout, LogIn, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-tea-800 text-tea-100 rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <Sprout className="w-7 h-7 text-leaf-400" />
        </div>
        <h1 className="text-2xl font-extrabold text-tea-950">Farmer & Admin Login</h1>
        <p className="text-xs text-stone-600">
          Access your saved estimates, farm profile, and regional price history.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-cream-200 shadow-md space-y-6">
        {error && (
          <div className="bg-red-50 text-red-800 text-xs p-3 rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="e.g. farmer@teavalue.lk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-stone-700">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] text-tea-700 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-tea-800 hover:bg-tea-900 text-white font-bold text-sm rounded-xl shadow-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-cream-200 text-center text-xs text-stone-600">
          New smallholder grower?{' '}
          <Link href="/register" className="text-tea-800 font-bold hover:underline">
            Register your estate
          </Link>
        </div>

        {/* Quick Demo Credentials Guide */}
        <div className="bg-cream-100 p-3 rounded-xl border border-cream-300 text-[11px] text-stone-600 space-y-1">
          <strong className="block text-stone-800">Demo Accounts Available:</strong>
          <div>Admin: <code>admin@teavalue.lk</code> / <code>AdminPass2026!</code></div>
          <div>Farmer: <code>farmer@teavalue.lk</code> / <code>FarmerPass2026!</code></div>
        </div>
      </div>
    </div>
  );
}
