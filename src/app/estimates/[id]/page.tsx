'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { SavedEstimate } from '@/lib/engine/types';
import {
  ArrowLeft,
  Calendar,
  Building2,
  CheckCircle2,
  Scale,
  Clock,
  Truck,
  BookmarkCheck,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

export default function EstimateDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { t, language } = useI18n();

  const [estimate, setEstimate] = useState<SavedEstimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/estimates/${id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Estimate not found or you are not authorized to view it.');
        }
        return res.json();
      })
      .then((data) => {
        if (data.estimate) {
          setEstimate(data.estimate);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="max-w-4xl mx-auto py-20 text-center text-stone-500">{t.common.loading}</div>;
  }

  if (error || !estimate) {
    return (
      <div className="max-w-xl mx-auto my-20 p-8 bg-white border border-red-200 rounded-3xl text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
        <h2 className="text-xl font-bold text-stone-900">Unable to Load Estimate</h2>
        <p className="text-sm text-stone-600">{error || 'Record does not exist'}</p>
        <Link
          href="/estimates"
          className="inline-block px-5 py-2.5 bg-tea-800 text-white font-bold text-xs rounded-xl"
        >
          Back to History
        </Link>
      </div>
    );
  }

  const res = estimate.resultSnapshot;
  const inp = estimate.inputSnapshot;
  const createdDate = new Date(estimate.createdAt).toLocaleString('en-GB', {
    timeZone: 'Asia/Colombo',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/estimates"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-tea-800 hover:text-tea-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Estimates</span>
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-tea-700 bg-tea-50 border border-tea-200 px-3 py-1 rounded-full font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-leaf-600" />
          <span>Immutable Historical Snapshot</span>
        </div>
      </div>

      {/* Main Snapshot Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-cream-200 shadow-sm space-y-8">
        <div className="border-b border-cream-200 pb-6 space-y-2">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Calendar className="w-4 h-4 text-stone-400" />
            <span>Valuation generated on {createdDate} (Sri Lanka Time)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-tea-950">
            Assessment #{estimate.id}
          </h1>
          <p className="text-xs text-stone-500">
            District: <strong className="text-stone-800">{inp.district}</strong> | Locality: <strong className="text-stone-800">{inp.locality || 'General'}</strong> | Harvest weight: <strong className="text-stone-800">{inp.harvestedWeightKg} kg</strong>
          </p>
        </div>

        {/* Highlight Values */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-tea-50 rounded-2xl p-5 border border-tea-200">
            <span className="text-xs font-bold text-tea-800 uppercase block">Estimated Price</span>
            <div className="text-2xl font-extrabold text-tea-950 mt-1">
              Rs. {res.estimatedPriceMin} – {res.estimatedPriceMax} / kg
            </div>
            <span className="text-[11px] text-stone-500">Base: Rs. {res.basePriceMin} – {res.basePriceMax}/kg</span>
          </div>

          <div className="bg-cream-50 rounded-2xl p-5 border border-cream-200">
            <span className="text-xs font-bold text-stone-700 uppercase block">Gross Revenue</span>
            <div className="text-2xl font-bold text-stone-900 mt-1">
              Rs. {res.grossRevenueMin.toLocaleString()} – {res.grossRevenueMax.toLocaleString()}
            </div>
            <span className="text-[11px] text-stone-500">Weight: {res.payableWeightKg} kg</span>
          </div>

          <div className="bg-leaf-50 rounded-2xl p-5 border border-leaf-200">
            <span className="text-xs font-bold text-tea-900 uppercase block">Net Revenue</span>
            <div className={`text-2xl font-extrabold mt-1 ${res.netRevenueMin < 0 ? 'text-red-700' : 'text-tea-950'}`}>
              Rs. {res.netRevenueMin.toLocaleString()} – {res.netRevenueMax.toLocaleString()}
            </div>
            <span className="text-[11px] text-stone-500">Deductions: Rs. {res.costBreakdown.totalDeductions}</span>
          </div>
        </div>

        {/* Input Parameters Snapshot */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-tea-950 uppercase tracking-wider">
            Farmer Input Parameters Snapshot
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-cream-50 p-4 rounded-2xl border border-cream-200">
            <div>
              <span className="text-stone-500 block">Tender Leaf:</span>
              <strong className="text-stone-900">{inp.goodLeafPercentage !== undefined ? `${inp.goodLeafPercentage}%` : 'Not recorded'}</strong>
            </div>
            <div>
              <span className="text-stone-500 block">Coarse Leaf:</span>
              <strong className="text-stone-900">{inp.coarseLeafPercentage !== undefined ? `${inp.coarseLeafPercentage}%` : 'Not recorded'}</strong>
            </div>
            <div>
              <span className="text-stone-500 block">Surface Condition:</span>
              <strong className="text-stone-900 capitalize">{inp.surfaceCondition}</strong>
            </div>
            <div>
              <span className="text-stone-500 block">Transit Time:</span>
              <strong className="text-stone-900">{res.elapsedHours} hours</strong>
            </div>
          </div>
        </div>

        {/* Applied Pricing Rules */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-tea-950 uppercase tracking-wider">
            Applied Pricing Rules
          </h3>
          {res.appliedRules.length > 0 ? (
            <div className="space-y-2">
              {res.appliedRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-tea-50/50 border border-tea-200 flex justify-between items-center text-xs"
                >
                  <div>
                    <span className="font-bold text-tea-900 block">{rule.ruleName}</span>
                    <span className="text-stone-600">{language === 'si' ? rule.explanationSi : rule.explanationEn}</span>
                  </div>
                  <span className="font-bold text-leaf-700 shrink-0">
                    {rule.effectiveAdjustmentPerKg > 0 ? '+' : ''}Rs. {rule.effectiveAdjustmentPerKg}/kg
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-stone-500 italic">No additional rules modified this price.</p>
          )}
        </div>

        {/* Market Records Used */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-tea-950 uppercase tracking-wider">
            Market Records Used in Snapshot
          </h3>
          <div className="space-y-2">
            {res.recordsUsed.map((rec) => (
              <div
                key={rec.id}
                className="p-3.5 rounded-xl bg-cream-50 border border-cream-200 text-xs flex flex-col sm:flex-row justify-between gap-2"
              >
                <div>
                  <span className="font-bold text-stone-900 block">{rec.sourceName}</span>
                  <span className="text-stone-500">{rec.sourceExcerpt}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-tea-900 block">Rs. {rec.minPrice} – {rec.maxPrice}/kg</span>
                  <span className="text-[10px] text-stone-400">Valid: {rec.validFrom} to {rec.validTo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Immutability Note */}
        <div className="p-4 bg-cream-100 rounded-2xl border border-cream-300 text-xs text-stone-600 leading-relaxed">
          <strong className="text-stone-800">Historical Preservation Policy:</strong> This estimate is stored as an immutable cryptographic snapshot. Any subsequent revisions or retractions of factory market prices will not overwrite or alter this historical calculation.
        </div>
      </div>
    </div>
  );
}
