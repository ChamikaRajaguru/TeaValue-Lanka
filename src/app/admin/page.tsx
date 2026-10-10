'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import {
  ShieldCheck,
  Building2,
  DollarSign,
  Scale,
  Sparkles,
  ClipboardList,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Search,
} from 'lucide-react';
import { MarketPriceRecord } from '@/lib/engine/types';

export default function AdminDashboardPage() {
  const { t } = useI18n();

  const [prices, setPrices] = useState<MarketPriceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Gemini discovery state
  const [discoverDistrict, setDiscoverDistrict] = useState('Galle');
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoverMessage, setDiscoverMessage] = useState<string | null>(null);

  const fetchAdminData = () => {
    fetch('/api/admin/prices')
      .then((res) => {
        if (!res.ok) throw new Error('Administrative authorization required.');
        return res.json();
      })
      .then((data) => {
        if (data.prices) setPrices(data.prices);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDiscover = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDiscovering(true);
    setDiscoverMessage(null);

    try {
      const res = await fetch('/api/admin/gemini-discover', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ district: discoverDistrict }),
      });
      const data = await res.json();
      setDiscoverMessage(data.message || 'Discovery run finished.');
      fetchAdminData();
    } catch (err: any) {
      setDiscoverMessage(err.message || 'Discovery failed.');
    } finally {
      setIsDiscovering(false);
    }
  };

  const verifiedCount = prices.filter((p) => p.verificationStatus === 'verified').length;
  const pendingCount = prices.filter((p) => p.verificationStatus === 'pending').length;
  const retiredCount = prices.filter((p) => p.verificationStatus === 'retired').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
            <span>Administrative Control Portal</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-emerald-950">
            {t.admin.title}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            {t.admin.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/prices"
            className="px-4 py-2 glow-btn text-white font-bold text-xs rounded-xl shadow-glow transition-all"
          >
            Manage Prices ({pendingCount} Pending)
          </Link>
          <Link
            href="/admin/factories"
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs rounded-xl transition-colors"
          >
            Factories
          </Link>
          <Link
            href="/admin/rules"
            className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold text-xs rounded-xl transition-colors"
          >
            Pricing Rules
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 p-6 rounded-2xl border border-red-200 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-red-900 font-bold text-sm">{error}</p>
          <p className="text-xs text-stone-600">
            Make sure you are logged in with an account that has the administrator role.
          </p>
          <Link
            href="/login"
            className="inline-block px-4 py-2 glow-btn text-white font-bold text-xs rounded-xl"
          >
            Sign in as Admin
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-[0_4px_20px_-4px_rgba(6,78,59,0.06)] space-y-1">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Verified Price Records
          </span>
          <div className="text-3xl font-extrabold text-emerald-700">{verifiedCount}</div>
          <span className="text-[11px] text-stone-400">Available to farmer calculators</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
            Pending Candidates
          </span>
          <div className="text-3xl font-extrabold text-amber-700">{pendingCount}</div>
          <span className="text-[11px] text-amber-800">Awaiting admin verification</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-[0_4px_20px_-4px_rgba(6,78,59,0.06)] space-y-1">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Retired Records
          </span>
          <div className="text-3xl font-extrabold text-stone-500">{retiredCount}</div>
          <span className="text-[11px] text-stone-400">Archived from active engines</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-emerald-100 shadow-[0_4px_20px_-4px_rgba(6,78,59,0.06)] space-y-1">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Data Freshness
          </span>
          <div className="text-xl font-bold text-emerald-950 pt-1">October 2026</div>
          <span className="text-[11px] text-stone-400">Current season benchmark active</span>
        </div>
      </div>

      {/* Gemini Price Discovery Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-emerald-100 shadow-[0_4px_25px_-4px_rgba(6,78,59,0.06)] space-y-6">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-emerald-950">
                Discover Market Price Candidates (Gemini)
              </h2>
              <p className="text-xs text-stone-500">
                Search external publications for published Sri Lankan raw green leaf rates.
              </p>
            </div>
          </div>
          <div className="text-[11px] text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
            External candidates enter <strong>Pending</strong> state. Zero hallucinated data.
          </div>
        </div>

        <form onSubmit={handleDiscover} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Select District to Discover
            </label>
            <select
              value={discoverDistrict}
              onChange={(e) => setDiscoverDistrict(e.target.value)}
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

          <button
            type="submit"
            disabled={isDiscovering}
            className="w-full sm:w-auto px-6 py-2.5 glow-btn text-white font-bold text-xs rounded-xl shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Search className="w-4 h-4 text-white" />
            <span>{isDiscovering ? 'Searching Publications...' : t.admin.discoverAction}</span>
          </button>
        </form>

        {discoverMessage && (
          <div className="p-4 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 text-xs font-medium">
            {discoverMessage}
          </div>
        )}
      </div>

      {/* Navigation Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Link
          href="/admin/prices"
          className="bg-white p-6 rounded-2xl border border-emerald-100 hover:border-emerald-300 shadow-[0_4px_20px_-4px_rgba(6,78,59,0.06)] hover:shadow-md transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            <DollarSign className="w-5 h-5 text-emerald-700" />
          </div>
          <h3 className="font-bold text-emerald-950 text-base">Market Price Records</h3>
          <p className="text-xs text-stone-500">
            Review Gemini candidates, verify factory quotes, and retire outdated records.
          </p>
        </Link>

        <Link
          href="/admin/factories"
          className="bg-white p-6 rounded-2xl border border-emerald-100 hover:border-emerald-300 shadow-[0_4px_20px_-4px_rgba(6,78,59,0.06)] hover:shadow-md transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            <Building2 className="w-5 h-5 text-emerald-700" />
          </div>
          <h3 className="font-bold text-emerald-950 text-base">Factory Registry</h3>
          <p className="text-xs text-stone-500">
            Register processing factories, collection route services, and payment terms.
          </p>
        </Link>

        <Link
          href="/admin/audit"
          className="bg-white p-6 rounded-2xl border border-emerald-100 hover:border-emerald-300 shadow-[0_4px_20px_-4px_rgba(6,78,59,0.06)] hover:shadow-md transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
            <ClipboardList className="w-5 h-5 text-emerald-700" />
          </div>
          <h3 className="font-bold text-emerald-950 text-base">Audit Trail & Security</h3>
          <p className="text-xs text-stone-500">
            Inspect timestamps and user identities for price verifications and promotions.
          </p>
        </Link>
      </div>
    </div>
  );
}
