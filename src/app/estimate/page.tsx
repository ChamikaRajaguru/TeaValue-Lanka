'use client';

import React, { useState, useEffect } from 'react';
import { useI18n } from '@/lib/i18n/context';
import { FactoryProfile, CalculationResult } from '@/lib/engine/types';
import {
  Sprout,
  Calculator,
  Building2,
  Calendar,
  Clock,
  Scale,
  Truck,
  AlertCircle,
  CheckCircle2,
  BookmarkCheck,
  Info,
  ArrowRight,
  TrendingUp,
  Zap,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

export default function EstimatePage() {
  const { t, language } = useI18n();

  // Form states
  const [district, setDistrict] = useState('Galle');
  const [locality, setLocality] = useState('');
  const [growingRegion, setGrowingRegion] = useState('Ruhuna (Low Country)');
  const [elevationCategory, setElevationCategory] = useState<'low' | 'mid' | 'high' | 'unknown'>('low');
  const [targetFactoryId, setTargetFactoryId] = useState('');
  const [factories, setFactories] = useState<any[]>([]);

  // Quantity
  const [harvestedWeightKg, setHarvestedWeightKg] = useState<number>(100);
  const [expectedAcceptedWeightKg, setExpectedAcceptedWeightKg] = useState<string>('');

  // Timestamps
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 16);
  const fourHoursLaterStr = new Date(now.getTime() + 4 * 3600 * 1000).toISOString().slice(0, 16);

  const [harvestTimestamp, setHarvestTimestamp] = useState(todayStr);
  const [deliveryTimestamp, setDeliveryTimestamp] = useState(fourHoursLaterStr);

  // Quality
  const [goodLeafPercentage, setGoodLeafPercentage] = useState<string>('72');
  const [coarseLeafPercentage, setCoarseLeafPercentage] = useState<string>('15');
  const [damagedLeafPercentage, setDamagedLeafPercentage] = useState<string>('5');
  const [surfaceCondition, setSurfaceCondition] = useState<'dry' | 'wet' | 'unknown'>('dry');
  const [packagingCondition, setPackagingCondition] = useState<'loosely_packed' | 'tightly_compressed' | 'unknown'>('loosely_packed');
  const [isMeasuredSample, setIsMeasuredSample] = useState(false);

  // Transport & Costs
  const [transportCostPerKg, setTransportCostPerKg] = useState<string>('4');
  const [totalTransportCost, setTotalTransportCost] = useState<string>('');
  const [otherDeductions, setOtherDeductions] = useState<string>('0');
  const [isTransportCostConfirmed, setIsTransportCostConfirmed] = useState(true);
  const [notes, setNotes] = useState('');

  // Calculation and status states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/factories?district=${district}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.comparisonList) {
          setFactories(data.comparisonList);
        }
      })
      .catch(() => {});
  }, [district]);

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSavedSuccess(false);

    try {
      const payload = {
        input: {
          district,
          locality: locality || undefined,
          growingRegion: growingRegion || undefined,
          elevationCategory,
          targetFactoryId: targetFactoryId || undefined,
          harvestedWeightKg: Number(harvestedWeightKg),
          expectedAcceptedWeightKg: expectedAcceptedWeightKg ? Number(expectedAcceptedWeightKg) : undefined,
          harvestTimestamp: new Date(harvestTimestamp).toISOString(),
          deliveryTimestamp: new Date(deliveryTimestamp).toISOString(),
          goodLeafPercentage: goodLeafPercentage ? Number(goodLeafPercentage) : undefined,
          coarseLeafPercentage: coarseLeafPercentage ? Number(coarseLeafPercentage) : undefined,
          damagedLeafPercentage: damagedLeafPercentage ? Number(damagedLeafPercentage) : undefined,
          surfaceCondition,
          packagingCondition,
          isMeasuredSample,
          transportCostPerKg: transportCostPerKg ? Number(transportCostPerKg) : undefined,
          totalTransportCost: totalTransportCost ? Number(totalTransportCost) : undefined,
          otherDeductions: otherDeductions ? Number(otherDeductions) : undefined,
          isTransportCostConfirmed,
          notes: notes || undefined,
        },
        save: false,
      };

      const res = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to calculate estimate');
      }

      setResult(data.result);
      setTimeout(() => {
        const resultsEl = document.getElementById('results-section');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } catch (err: any) {
      setError(err.message || 'An error occurred during calculation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEstimate = async () => {
    if (!result) return;
    setIsSaving(true);

    try {
      const payload = {
        input: {
          district,
          locality: locality || undefined,
          growingRegion: growingRegion || undefined,
          elevationCategory,
          targetFactoryId: targetFactoryId || undefined,
          harvestedWeightKg: Number(harvestedWeightKg),
          expectedAcceptedWeightKg: expectedAcceptedWeightKg ? Number(expectedAcceptedWeightKg) : undefined,
          harvestTimestamp: new Date(harvestTimestamp).toISOString(),
          deliveryTimestamp: new Date(deliveryTimestamp).toISOString(),
          goodLeafPercentage: goodLeafPercentage ? Number(goodLeafPercentage) : undefined,
          coarseLeafPercentage: coarseLeafPercentage ? Number(coarseLeafPercentage) : undefined,
          damagedLeafPercentage: damagedLeafPercentage ? Number(damagedLeafPercentage) : undefined,
          surfaceCondition,
          packagingCondition,
          isMeasuredSample,
          transportCostPerKg: transportCostPerKg ? Number(transportCostPerKg) : undefined,
          totalTransportCost: totalTransportCost ? Number(totalTransportCost) : undefined,
          otherDeductions: otherDeductions ? Number(otherDeductions) : undefined,
          isTransportCostConfirmed,
          notes: notes || undefined,
        },
        save: true,
      };

      const res = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Please log in to save this estimate to your history.');
        }
        throw new Error(data.error || 'Failed to save estimate.');
      }

      setSavedSuccess(true);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-widest border border-emerald-200">
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          <span>Real-Time Valuation Telemetry</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-emerald-950 tracking-tight">
          {t.assessment.title}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base max-w-2xl leading-relaxed">
          {t.assessment.subtitle}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-red-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <strong className="text-red-900">Assessment Validation Error:</strong> {error}
          </div>
        </div>
      )}

      {/* Main Assessment Form */}
      <form onSubmit={handleCalculate} className="space-y-6">
        {/* Step 1: Location & Destination */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 border border-emerald-100 shadow-[0_4px_20px_-4px_rgba(6,78,59,0.06)]">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-950 uppercase tracking-wide">
                {t.assessment.steps.location}
              </h2>
              <span className="text-xs text-stone-500">Target district & processing factory</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.assessment.fields.district} *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
                required
              >
                <option value="Galle">Galle (ගාල්ල)</option>
                <option value="Matara">Matara (මාතර)</option>
                <option value="Ratnapura">Ratnapura (රත්නපුර)</option>
                <option value="Kandy">Kandy (මහනුවර)</option>
                <option value="Nuwara Eliya">Nuwara Eliya (නුවරඑළිය)</option>
                <option value="Badulla">Badulla (බදුල්ල)</option>
                <option value="Kegalle">Kegalle (කෑගල්ල)</option>
                <option value="Kalutara">Kalutara (කළුතර)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.assessment.fields.locality}
              </label>
              <input
                type="text"
                placeholder="e.g. Neluwa, Deniyaya"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.assessment.fields.elevation}
              </label>
              <select
                value={elevationCategory}
                onChange={(e) => setElevationCategory(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
              >
                <option value="low">{t.elevation.low}</option>
                <option value="mid">{t.elevation.mid}</option>
                <option value="high">{t.elevation.high}</option>
                <option value="unknown">{t.elevation.unknown}</option>
              </select>
            </div>

            <div className="sm:col-span-2 md:col-span-3">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.assessment.fields.targetFactory}
              </label>
              <select
                value={targetFactoryId}
                onChange={(e) => setTargetFactoryId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
              >
                <option value="">-- Compare all eligible verified factories in {district} --</option>
                {factories.map((f) => (
                  <option key={f.factoryId || f.id} value={f.factoryId || f.id}>
                    {f.factoryName || f.name} — {f.locality} ({f.hasEligiblePrice ? 'Active Price Verified' : 'Registered'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Quantity & Weights */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 border border-emerald-100 shadow-[0_4px_20px_-4px_rgba(6,78,59,0.06)]">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-950 uppercase tracking-wide">
                {t.assessment.steps.quantity}
              </h2>
              <span className="text-xs text-stone-500">Harvest and expected payable weights</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.assessment.fields.harvestedWeight} *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={harvestedWeightKg}
                  onChange={(e) => setHarvestedWeightKg(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm font-bold focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
                  required
                />
                <span className="absolute right-4 top-3 text-xs text-emerald-700 font-bold">kg</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">
                {t.assessment.fields.harvestedWeightHelp}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.assessment.fields.expectedAcceptedWeight}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  placeholder="Optional accepted weight"
                  value={expectedAcceptedWeightKg}
                  onChange={(e) => setExpectedAcceptedWeightKg(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
                />
                <span className="absolute right-4 top-3 text-xs text-stone-400 font-bold">kg</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">
                {t.assessment.fields.expectedAcceptedWeightHelp}
              </p>
            </div>
          </div>
        </div>

        {/* Step 3: Harvest and Delivery Timings */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 border border-emerald-100 shadow-[0_4px_20px_-4px_rgba(6,78,59,0.06)]">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-950 uppercase tracking-wide">
                {t.assessment.steps.harvest}
              </h2>
              <span className="text-xs text-stone-500">Transit duration telemetry (server calculated)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.assessment.fields.harvestTime} *
              </label>
              <input
                type="datetime-local"
                value={harvestTimestamp}
                onChange={(e) => setHarvestTimestamp(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.assessment.fields.deliveryTime} *
              </label>
              <input
                type="datetime-local"
                value={deliveryTimestamp}
                onChange={(e) => setDeliveryTimestamp(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Step 4: Quality Observations */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 border border-emerald-100 shadow-[0_4px_20px_-4px_rgba(6,78,59,0.06)]">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-sm">
              04
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-950 uppercase tracking-wide">
                {t.assessment.steps.quality}
              </h2>
              <span className="text-xs text-stone-500">Leaf grade, coarse matter, and packing</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.assessment.fields.goodLeaf}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="70"
                  value={goodLeafPercentage}
                  onChange={(e) => setGoodLeafPercentage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
                />
                <span className="absolute right-4 top-3 text-xs text-emerald-700 font-bold">%</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">{t.assessment.fields.goodLeafHelp}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.assessment.fields.coarseLeaf}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="15"
                  value={coarseLeafPercentage}
                  onChange={(e) => setCoarseLeafPercentage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
                />
                <span className="absolute right-4 top-3 text-xs text-stone-400 font-bold">%</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">{t.assessment.fields.coarseLeafHelp}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.assessment.fields.damagedLeaf}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="5"
                  value={damagedLeafPercentage}
                  onChange={(e) => setDamagedLeafPercentage(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
                />
                <span className="absolute right-4 top-3 text-xs text-stone-400 font-bold">%</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">{t.assessment.fields.damagedLeafHelp}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.assessment.fields.surfaceCondition}
              </label>
              <select
                value={surfaceCondition}
                onChange={(e) => setSurfaceCondition(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
              >
                <option value="dry">{t.assessment.fields.surfaceDry}</option>
                <option value="wet">{t.assessment.fields.surfaceWet}</option>
                <option value="unknown">{t.assessment.fields.surfaceUnknown}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.assessment.fields.packagingCondition}
              </label>
              <select
                value={packagingCondition}
                onChange={(e) => setPackagingCondition(e.target.value as any)}
                className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
              >
                <option value="loosely_packed">{t.assessment.fields.packagingLoosely}</option>
                <option value="tightly_compressed">{t.assessment.fields.packagingCompressed}</option>
                <option value="unknown">{t.assessment.fields.packagingUnknown}</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={isMeasuredSample}
                  onChange={(e) => setIsMeasuredSample(e.target.checked)}
                  className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>{t.assessment.fields.isMeasuredSample}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Step 5: Transport & Costs */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 border border-emerald-100 shadow-[0_4px_20px_-4px_rgba(6,78,59,0.06)]">
          <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold text-sm">
              05
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-950 uppercase tracking-wide">
                {t.assessment.steps.transport}
              </h2>
              <span className="text-xs text-stone-500">Local vehicle hire or route collection deductions</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.assessment.fields.transportCostPerKg}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={transportCostPerKg}
                  onChange={(e) => {
                    setTransportCostPerKg(e.target.value);
                    if (e.target.value) setTotalTransportCost('');
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
                />
                <span className="absolute right-4 top-3 text-xs text-emerald-700 font-bold">Rs/kg</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.assessment.fields.totalTransportCost}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="10"
                  placeholder="Total hire cost"
                  value={totalTransportCost}
                  onChange={(e) => {
                    setTotalTransportCost(e.target.value);
                    if (e.target.value) setTransportCostPerKg('');
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
                />
                <span className="absolute right-4 top-3 text-xs text-stone-400 font-bold">LKR</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.assessment.fields.otherDeductions}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={otherDeductions}
                  onChange={(e) => setOtherDeductions(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
                />
                <span className="absolute right-4 top-3 text-xs text-stone-400 font-bold">LKR</span>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.assessment.fields.notes}
              </label>
              <textarea
                rows={2}
                placeholder="Plucking condition, estate weather, or gate arrangements..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm focus:border-emerald-600 focus:bg-white focus:ring-1 focus:ring-emerald-600 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="text-center pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-12 py-4 rounded-2xl glow-btn font-extrabold text-sm tracking-wider uppercase transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50 shadow-glow"
          >
            <Calculator className="w-5 h-5 text-white" />
            <span>{isLoading ? t.assessment.calculating : t.assessment.submitButton}</span>
          </button>
        </div>
      </form>

      {/* Results HUD Display */}
      {result && (
        <div id="results-section" className="space-y-8 pt-8">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-emerald-200/90 shadow-[0_10px_35px_-10px_rgba(6,78,59,0.08)] space-y-8 relative overflow-hidden">
            {/* Header Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6">
              <div>
                <span
                  className={`inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider mb-2 ${
                    result.status === 'personalized_estimate'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-sm'
                      : result.status === 'market_reference_only'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                  {result.status === 'personalized_estimate'
                    ? t.results.personalizedNotice
                    : result.status === 'market_reference_only'
                    ? t.results.referenceNotice
                    : t.results.unavailableNotice}
                </span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-emerald-950 tracking-tight">
                  {t.results.title}
                </h2>
              </div>

              <button
                type="button"
                onClick={handleSaveEstimate}
                disabled={isSaving || savedSuccess}
                className={`px-5 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all ${
                  savedSuccess
                    ? 'bg-emerald-600 text-white shadow-glow'
                    : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 shadow-sm'
                }`}
              >
                <BookmarkCheck className="w-4 h-4 text-emerald-700" />
                <span>{savedSuccess ? t.results.savedSuccess : t.results.saveEstimate}</span>
              </button>
            </div>

            {/* Telemetry Readout Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Estimated Price per kg */}
              <div className="bg-emerald-50/60 rounded-2xl p-6 border border-emerald-200/80 space-y-2 relative overflow-hidden">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-widest block">
                  {t.results.estPricePerKg}
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-950 tracking-tight">
                  {result.estimatedPriceMin === result.estimatedPriceMax ? (
                    <span>Rs. {result.estimatedPriceMin}</span>
                  ) : (
                    <span>Rs. {result.estimatedPriceMin} – {result.estimatedPriceMax}</span>
                  )}
                  <span className="text-xs font-normal text-stone-500 ml-1.5">/ kg</span>
                </div>
                <div className="text-xs text-stone-500">
                  Base rate: Rs. {result.basePriceMin} – {result.basePriceMax}/kg
                </div>
              </div>

              {/* Gross Revenue */}
              <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 space-y-2">
                <span className="text-xs font-bold text-stone-600 uppercase tracking-widest block">
                  {t.results.grossRevenue}
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
                  Rs. {result.grossRevenueMin.toLocaleString()} – {result.grossRevenueMax.toLocaleString()}
                </div>
                <div className="text-xs text-stone-500">
                  For {result.payableWeightKg} kg {result.isPayableWeightAssumed ? t.results.payableWeightAssumed : t.results.payableWeightConfirmed}
                </div>
              </div>

              {/* Net Revenue */}
              <div
                className={`rounded-2xl p-6 border space-y-2 ${
                  result.netRevenueMin < 0
                    ? 'border-red-200 bg-red-50/60'
                    : 'border-emerald-200 bg-emerald-100/50'
                }`}
              >
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-widest block">
                  {t.results.netRevenue}
                </span>
                <div
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                    result.netRevenueMin < 0 ? 'text-red-600' : 'text-emerald-800'
                  }`}
                >
                  Rs. {result.netRevenueMin.toLocaleString()} – {result.netRevenueMax.toLocaleString()}
                </div>
                <div className="text-xs text-stone-500">
                  Deductions: Rs. {result.costBreakdown.totalDeductions.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Applied Rules */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{t.results.appliedRulesTitle}</span>
              </h3>

              {result.appliedRules.length > 0 ? (
                <div className="space-y-2">
                  {result.appliedRules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl p-4 border border-emerald-100 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-2 hover:border-emerald-300 transition-colors"
                    >
                      <div>
                        <span className="text-xs font-bold text-emerald-800 uppercase block">
                          {rule.ruleCode} — {rule.ruleName}
                        </span>
                        <p className="text-xs text-stone-600">
                          {language === 'si' ? rule.explanationSi : rule.explanationEn}
                        </p>
                      </div>
                      <div className="text-sm font-extrabold text-emerald-700 sm:text-right shrink-0">
                        {rule.effectiveAdjustmentPerKg > 0 ? '+' : ''}Rs. {rule.effectiveAdjustmentPerKg}/kg
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-500 italic bg-stone-50 p-3 rounded-xl border border-stone-200">
                  {t.results.noRulesApplied}
                </p>
              )}
            </div>

            {/* Unused Quality Observations (Advisory) */}
            {result.unusedObservations.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-stone-700 uppercase tracking-wider flex items-center gap-2">
                  <Info className="w-4 h-4 text-amber-600" />
                  <span>{t.results.unusedObservationsTitle}</span>
                </h3>

                <div className="space-y-2">
                  {result.unusedObservations.map((obs, idx) => (
                    <div
                      key={idx}
                      className="bg-amber-50/70 rounded-xl p-4 border border-amber-200 text-xs text-stone-700"
                    >
                      <strong className="text-amber-900">{obs.field}: {obs.value}</strong> —{' '}
                      {language === 'si' ? obs.reasonSi : obs.reasonEn}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Records Used & Source Verification */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>{t.results.marketRecordsTitle}</span>
              </h3>

              <div className="overflow-x-auto rounded-xl border border-emerald-100 shadow-sm">
                <table className="w-full text-left text-xs bg-white">
                  <thead className="bg-emerald-50 text-emerald-950 font-semibold border-b border-emerald-100">
                    <tr>
                      <th className="p-3.5">Source & Circular</th>
                      <th className="p-3.5">Location</th>
                      <th className="p-3.5">Verified Rate</th>
                      <th className="p-3.5">Validity</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {result.recordsUsed.map((rec) => (
                      <tr key={rec.id} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="p-3.5 font-semibold text-stone-900">
                          {rec.sourceName}
                          {rec.sourceRef && (
                            <span className="text-[10px] text-stone-500 block font-normal">{rec.sourceRef}</span>
                          )}
                        </td>
                        <td className="p-3.5 text-stone-700">
                          {rec.locality ? `${rec.locality}, ` : ''}{rec.district}
                        </td>
                        <td className="p-3.5 font-bold text-emerald-700">
                          Rs. {rec.minPrice} – {rec.maxPrice} / kg
                        </td>
                        <td className="p-3.5 text-stone-500">
                          {rec.validFrom} to {rec.validTo}
                        </td>
                        <td className="p-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px] uppercase">
                            {rec.verificationStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Limitations Notice */}
            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 space-y-2">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
                {t.results.limitationsTitle}
              </h4>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-stone-600 leading-relaxed">
                {(language === 'si' ? result.limitations.si : result.limitations.en).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
