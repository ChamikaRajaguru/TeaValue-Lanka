'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { FactoryComparisonItem } from '@/lib/engine/types';
import {
  Building2,
  MapPin,
  Calendar,
  Truck,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Scale,
  ArrowRight,
  Filter,
} from 'lucide-react';
import Link from 'next/link';

export default function FactoriesPage() {
  const { t, language } = useI18n();

  const [district, setDistrict] = useState<string>('Galle');
  const [weightKg, setWeightKg] = useState<number>(100);
  const [factories, setFactories] = useState<FactoryComparisonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rankingExplanation, setRankingExplanation] = useState('');

  useEffect(() => {
    setLoading(true);
    fetch(`/api/factories?district=${district}&weightKg=${weightKg}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.comparisonList) {
          setFactories(data.comparisonList);
          setRankingExplanation(data.rankingExplanation);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [district, weightKg]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs tracking-wider uppercase">
          <Building2 className="w-4 h-4 text-emerald-600" />
          <span>Regional Factory Directory</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-emerald-950">
          {t.factoriesPage.title}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base max-w-2xl leading-relaxed">
          {t.factoriesPage.subtitle}
        </p>
      </div>

      {/* Filter and Quantity Bar */}
      <div className="bg-white rounded-2xl p-6 border border-emerald-100 shadow-[0_4px_20px_-4px_rgba(6,78,59,0.06)] flex flex-col md:flex-row gap-6 items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              {t.factoriesPage.filterDistrict}
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm font-medium focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            >
              <option value="Galle">Galle (ගාල්ල)</option>
              <option value="Matara">Matara (මාතර)</option>
              <option value="Ratnapura">Ratnapura (රත්නපුර)</option>
              <option value="Kandy">Kandy (මහනුවර)</option>
              <option value="Nuwara Eliya">Nuwara Eliya (නුවරඑළිය)</option>
              <option value="Badulla">Badulla (බදුල්ල)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Sample Quantity for Comparison (kg)
            </label>
            <input
              type="number"
              min="10"
              step="10"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value) || 100)}
              className="px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm font-medium w-40 focus:ring-2 focus:ring-emerald-600 focus:bg-white"
            />
          </div>
        </div>

        <div className="text-xs text-emerald-900 bg-emerald-50 p-3 rounded-xl border border-emerald-200 max-w-sm">
          <strong>Ranking Standard:</strong> {t.factoriesPage.rankByRevenue} Overlapping ranges indicate price variance based on tender leaf grade.
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-stone-500 text-sm">{t.common.loading}</div>
      ) : factories.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-emerald-100 text-stone-500 text-sm">
          {t.factoriesPage.noEligible}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {factories.map((fac, idx) => (
            <div
              key={fac.factoryId}
              className={`bg-white rounded-2xl p-6 border shadow-[0_4px_20px_-4px_rgba(6,78,59,0.06)] transition-all flex flex-col justify-between space-y-4 hover:shadow-md ${
                fac.hasEligiblePrice
                  ? 'border-emerald-200 hover:border-emerald-400'
                  : 'border-dashed border-stone-200 opacity-75'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Rank #{idx + 1} in {fac.district}
                    </span>
                    <h3 className="text-lg font-bold text-emerald-950 mt-1">
                      {fac.factoryName}
                    </h3>
                    <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{fac.locality}, {fac.district}</span>
                    </div>
                  </div>

                  {fac.hasEligiblePrice ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                      Active Price
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-500 shrink-0">
                      No Verified Quote
                    </span>
                  )}
                </div>

                {fac.hasEligiblePrice ? (
                  <div className="bg-emerald-50/70 rounded-xl p-4 border border-emerald-100 space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-stone-600">Base Price Range:</span>
                      <strong className="text-lg font-extrabold text-emerald-950">
                        Rs. {fac.priceMin} – {fac.priceMax} / kg
                      </strong>
                    </div>

                    <div className="flex justify-between items-baseline pt-1 border-t border-emerald-100 text-xs">
                      <span className="text-stone-600">Net Revenue for {weightKg} kg:</span>
                      <strong className="text-emerald-800 font-bold">
                        Rs. {fac.netRevenueMin?.toLocaleString()} – {fac.netRevenueMax?.toLocaleString()}
                      </strong>
                    </div>

                    <div className="text-[11px] text-stone-500 pt-1">
                      Quality basis: <em>{fac.qualityCategory || 'Standard'}</em>
                    </div>
                  </div>
                ) : (
                  <div className="bg-stone-50 rounded-xl p-4 text-xs text-stone-500 italic">
                    Current month verified green leaf price not published by this factory yet.
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 pt-1">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase">Collection Service:</span>
                    <strong>{fac.collectionAvailable ? 'Yes (Available)' : 'Unknown / Shed drop-off'}</strong>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase">Payment Timing:</span>
                    <strong>{fac.paymentCycle || 'Monthly standard'}</strong>
                  </div>
                </div>

                {fac.sourceName && (
                  <div className="text-[11px] text-stone-400">
                    Source: {fac.sourceName} ({fac.sourceDate})
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-stone-100">
                <Link
                  href={`/estimate?targetFactory=${fac.factoryId}&district=${fac.district}`}
                  className="w-full py-2.5 glow-btn text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors font-bold shadow-sm"
                >
                  <span>Select for My Assessment</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
