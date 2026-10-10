'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { Sprout, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { t } = useI18n();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [district, setDistrict] = useState('Galle');
  const [locality, setLocality] = useState('');
  const [elevationCategory, setElevationCategory] = useState('low');
  const [preferredLanguage, setPreferredLanguage] = useState<'en' | 'si'>('en');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          district,
          locality,
          elevationCategory,
          preferredLanguage,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-emerald-700/20">
          <Sprout className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl font-extrabold text-emerald-950">Farmer Account Registration</h1>
        <p className="text-xs text-stone-600">
          Create your Sri Lankan smallholder profile to save estimates and compare regional factories.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-[0_4px_25px_-4px_rgba(6,78,59,0.06)] space-y-6">
        {error && (
          <div className="bg-red-50 text-red-800 text-xs p-3 rounded-xl border border-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 text-emerald-900 text-xs p-4 rounded-xl border border-emerald-300 flex items-center gap-2 font-medium">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Account created successfully! Redirecting to login...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sunil Rajapaksa"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="sunil@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Password (Min 8 characters) *
            </label>
            <input
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Primary Tea District *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
              >
                <option value="Galle">Galle</option>
                <option value="Matara">Matara</option>
                <option value="Ratnapura">Ratnapura</option>
                <option value="Kandy">Kandy</option>
                <option value="Nuwara Eliya">Nuwara Eliya</option>
                <option value="Badulla">Badulla</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Village / Locality
              </label>
              <input
                type="text"
                placeholder="e.g. Hiniduma"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Preferred Language
            </label>
            <div className="flex gap-4 text-xs font-medium text-stone-700">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="prefLang"
                  checked={preferredLanguage === 'en'}
                  onChange={() => setPreferredLanguage('en')}
                  className="text-emerald-700 focus:ring-emerald-600"
                />
                English
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="prefLang"
                  checked={preferredLanguage === 'si'}
                  onChange={() => setPreferredLanguage('si')}
                  className="text-emerald-700 focus:ring-emerald-600"
                />
                සිංහල (Sinhala)
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="w-full py-3 glow-btn text-white font-bold text-sm rounded-xl shadow-glow transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Creating Account...' : 'Register as Farmer'}</span>
          </button>
        </form>

        <div className="pt-4 border-t border-stone-100 text-center text-xs text-stone-600">
          Already registered?{' '}
          <Link href="/login" className="text-emerald-800 font-bold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
