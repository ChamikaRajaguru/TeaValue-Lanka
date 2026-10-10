'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { UserRecord } from '@/lib/db/client';
import { SavedEstimate, MarketPriceRecord } from '@/lib/engine/types';
import {
  Sprout,
  Calculator,
  Building2,
  Calendar,
  ArrowRight,
  TrendingUp,
  FileText,
  User,
  ShieldCheck,
  MapPin,
  Clock,
} from 'lucide-react';

export default function DashboardPage() {
  const { t, language } = useI18n();

  const [user, setUser] = useState<UserRecord | null>(null);
  const [estimates, setEstimates] = useState<SavedEstimate[]>([]);
  const [recentPrices, setRecentPrices] = useState<MarketPriceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => r.json()),
      fetch('/api/estimates').then((r) => r.json()),
      fetch('/api/factories').then((r) => r.json()),
    ])
      .then(([userData, estimatesData]) => {
        if (userData.authenticated) {
          setUser(userData.user);
        }
        if (estimatesData.estimates) {
          setEstimates(estimatesData.estimates);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-tea-900 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-leaf-500/20 text-leaf-300 text-xs font-semibold">
            <Sprout className="w-3.5 h-3.5 text-leaf-400" />
            <span>Sri Lankan Smallholder Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Ayubowan, {user?.name || 'Tea Grower'}!
          </h1>
          <p className="text-xs sm:text-sm text-cream-200">
            Registered District: <strong>{user?.district || 'Galle'}</strong> {user?.locality ? `(${user.locality})` : ''}
          </p>
        </div>

        <div className="flex gap-3 z-10">
          <Link
            href="/estimate"
            className="px-5 py-3 rounded-xl bg-leaf-500 hover:bg-leaf-400 text-tea-950 font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2"
          >
            <Calculator className="w-4 h-4" />
            <span>{t.assessment.submitButton}</span>
          </Link>
          <Link
            href="/factories"
            className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs sm:text-sm border border-white/20 transition-all flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-cream-300" />
            <span>{t.nav.factories}</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-cream-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Saved Estimations
          </span>
          <div className="text-3xl font-extrabold text-tea-950">
            {estimates.length}
          </div>
          <p className="text-[11px] text-stone-400">Total historical snapshots stored</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-cream-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Current District Benchmark
          </span>
          <div className="text-3xl font-extrabold text-leaf-600">
            245 – 270 <span className="text-xs text-stone-400">Rs/kg</span>
          </div>
          <p className="text-[11px] text-stone-400">October 2026 Season Verified</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-cream-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Registered Profile Elevation
          </span>
          <div className="text-3xl font-extrabold text-tea-900 capitalize">
            {user?.elevationCategory || 'Low Country'}
          </div>
          <p className="text-[11px] text-stone-400">Used for regional fallback matching</p>
        </div>
      </div>

      {/* Recent Estimates Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-cream-200 shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-cream-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-tea-950">Recent Leaf Valuations</h2>
            <p className="text-xs text-stone-500">Your latest calculations and factory comparisons.</p>
          </div>
          <Link
            href="/estimates"
            className="text-xs font-semibold text-tea-700 hover:text-tea-900 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {estimates.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <FileText className="w-10 h-10 text-stone-300 mx-auto" />
            <p className="text-xs text-stone-500">No calculations recorded yet.</p>
            <Link
              href="/estimate"
              className="inline-block px-4 py-2 bg-tea-800 text-white text-xs font-bold rounded-xl"
            >
              Start New Valuation
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-cream-200">
            {estimates.slice(0, 4).map((est) => {
              const res = est.resultSnapshot;
              const dateStr = new Date(est.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div
                  key={est.id}
                  className="py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 hover:bg-cream-50/50 rounded-xl px-2 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-tea-800 bg-tea-50 px-2 py-0.5 rounded border border-tea-200">
                        {est.inputSnapshot.district}
                      </span>
                      <span className="text-[11px] text-stone-400">{dateStr}</span>
                    </div>
                    <div className="text-sm font-bold text-tea-950">
                      Rs. {res.estimatedPriceMin} – {res.estimatedPriceMax} / kg
                      <span className="text-xs text-stone-500 font-normal ml-2">
                        ({res.payableWeightKg} kg • Net: Rs. {res.netRevenueMin.toLocaleString()})
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/estimates/${est.id}`}
                    className="px-3.5 py-1.5 text-xs font-semibold text-tea-900 bg-cream-100 hover:bg-cream-200 rounded-lg flex items-center gap-1 self-start sm:self-center transition-colors"
                  >
                    <span>View Snapshot</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
