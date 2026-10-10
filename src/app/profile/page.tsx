'use client';

import React, { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { UserRecord } from '@/lib/db/client';
import { User, MapPin, Mail, Globe, Save, CheckCircle2, Shield } from 'lucide-react';

export default function ProfilePage() {
  const { t, language, setLanguage } = useI18n();

  const [user, setUser] = useState<UserRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('Galle');
  const [locality, setLocality] = useState('');
  const [elevationCategory, setElevationCategory] = useState('low');
  const [prefLang, setPrefLang] = useState<'en' | 'si'>('en');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
          setName(data.user.name);
          setDistrict(data.user.district || 'Galle');
          setLocality(data.user.locality || '');
          setElevationCategory(data.user.elevationCategory || 'low');
          setPrefLang(data.user.preferredLanguage || 'en');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setLanguage(prefLang);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto py-20 text-center text-stone-500">{t.common.loading}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-tea-950">
          Farmer Estate Profile
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Manage your smallholder contact details and geographical parameters.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm space-y-6">
        {savedSuccess && (
          <div className="p-4 bg-leaf-50 text-tea-900 rounded-xl border border-leaf-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-leaf-600" />
            <span>Profile settings saved successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-200 bg-cream-100 text-stone-500 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Primary District
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white"
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
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Elevation Category
              </label>
              <select
                value={elevationCategory}
                onChange={(e) => setElevationCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white"
              >
                <option value="low">Low Country (&lt; 600m)</option>
                <option value="mid">Mid Country (600m - 1200m)</option>
                <option value="high">Up Country (&gt; 1200m)</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Interface Language
              </label>
              <select
                value={prefLang}
                onChange={(e) => setPrefLang(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white"
              >
                <option value="en">English (EN)</option>
                <option value="si">සිංහල (Sinhala)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-cream-200 flex justify-between items-center">
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Shield className="w-4 h-4 text-tea-700" />
              <span>Role: <strong className="text-tea-900 uppercase font-bold">{user?.role || 'Farmer'}</strong></span>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-tea-800 hover:bg-tea-900 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>{t.common.save}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
