'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { SavedEstimate } from '@/lib/engine/types';
import {
  FileText,
  Calendar,
  Trash2,
  ArrowRight,
  Calculator,
  AlertCircle,
  Building2,
} from 'lucide-react';

export default function EstimatesHistoryPage() {
  const { t, language } = useI18n();
  const [estimates, setEstimates] = useState<SavedEstimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/estimates')
      .then((res) => {
        if (res.status === 401) {
          throw new Error('Please log in to view your estimate history.');
        }
        return res.json();
      })
      .then((data) => {
        if (data.estimates) {
          setEstimates(data.estimates);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this saved estimate?')) return;

    try {
      const res = await fetch(`/api/estimates/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      setEstimates((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      alert(err.message || 'Deletion failed');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-tea-950">
            {t.nav.history}
          </h1>
          <p className="text-stone-600 text-sm">
            Review and compare your past tea leaf price calculations.
          </p>
        </div>
        <Link
          href="/estimate"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-tea-800 hover:bg-tea-900 text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
        >
          <Calculator className="w-4 h-4 text-leaf-400" />
          <span>{t.results.newEstimate}</span>
        </Link>
      </div>

      {loading && (
        <div className="text-center py-12 text-stone-500 text-sm">
          {t.common.loading}
        </div>
      )}

      {error && (
        <div className="bg-amberGold-50 border border-amberGold-300 p-6 rounded-2xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-amberGold-600 mx-auto" />
          <p className="text-stone-800 text-sm font-medium">{error}</p>
          <div className="flex justify-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 bg-tea-800 text-white text-xs font-bold rounded-lg"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-cream-200 text-tea-950 text-xs font-bold rounded-lg"
            >
              Register
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && estimates.length === 0 && (
        <div className="bg-white rounded-2xl p-10 text-center border border-cream-200 space-y-4">
          <FileText className="w-12 h-12 text-stone-300 mx-auto" />
          <h3 className="text-base font-bold text-stone-700">No saved estimates yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            You haven&apos;t saved any tea leaf valuation records. Run a price calculation and click &quot;Save This Estimate&quot;.
          </p>
          <Link
            href="/estimate"
            className="inline-block px-5 py-2.5 bg-tea-800 text-white text-xs font-bold rounded-xl"
          >
            Start Valuation
          </Link>
        </div>
      )}

      {!loading && !error && estimates.length > 0 && (
        <div className="grid grid-cols-1 gap-4">
          {estimates.map((est) => {
            const res = est.resultSnapshot;
            const inp = est.inputSnapshot;
            const dateStr = new Date(est.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={est.id}
                className="bg-white rounded-2xl p-5 border border-cream-200 shadow-sm hover:border-tea-300 transition-all flex flex-col md:flex-row justify-between md:items-center gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-tea-800 bg-tea-50 px-2 py-0.5 rounded border border-tea-200">
                      {inp.district} {inp.locality ? `• ${inp.locality}` : ''}
                    </span>
                    <span className="text-[11px] text-stone-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {dateStr}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="text-xl font-extrabold text-tea-950">
                      Rs. {res.estimatedPriceMin} – {res.estimatedPriceMax} / kg
                    </span>
                    <span className="text-xs text-stone-500">
                      Weight: {res.payableWeightKg} kg
                    </span>
                  </div>

                  <div className="text-xs text-stone-600">
                    Net Payout: <strong className="text-tea-900">Rs. {res.netRevenueMin.toLocaleString()} – {res.netRevenueMax.toLocaleString()}</strong>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  <Link
                    href={`/estimates/${est.id}`}
                    className="px-3.5 py-2 text-xs font-semibold text-tea-900 bg-cream-100 hover:bg-cream-200 rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <span>View Snapshot</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(est.id)}
                    className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
