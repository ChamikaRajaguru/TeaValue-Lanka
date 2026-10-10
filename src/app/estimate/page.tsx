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
  HelpCircle,
  ArrowRight,
  TrendingUp,
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

  // Load factories when district changes
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
      // Smooth scroll to results
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
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-tea-700 font-semibold text-xs tracking-wider uppercase">
          <Sprout className="w-4 h-4 text-leaf-500" />
          <span>Agricultural Valuation Tool</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-tea-950">
          {t.assessment.title}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          {t.assessment.subtitle}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl text-red-800 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Assessment Input Error: </span>
            {error}
          </div>
        </div>
      )}

      {/* Assessment Form */}
      <form onSubmit={handleCalculate} className="space-y-8">
        {/* Section 1: Location & Destination */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-cream-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
            <div className="w-7 h-7 rounded-lg bg-tea-100 text-tea-800 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h2 className="text-lg font-bold text-tea-950">
              {t.assessment.steps.location}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.assessment.fields.district} *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm font-medium focus:ring-2 focus:ring-tea-600 focus:bg-white transition-all"
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
                placeholder="e.g. Neluwa, Deniyaya, Kuruwita"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.assessment.fields.elevation}
              </label>
              <select
                value={elevationCategory}
                onChange={(e) => setElevationCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white transition-all"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white transition-all"
              >
                <option value="">-- Any verified factory in {district} (Compare all) --</option>
                {factories.map((f) => (
                  <option key={f.factoryId || f.id} value={f.factoryId || f.id}>
                    {f.factoryName || f.name} — {f.locality} ({f.hasEligiblePrice ? 'Active Price Verified' : 'Registered'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Quantity & Weights */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-cream-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
            <div className="w-7 h-7 rounded-lg bg-tea-100 text-tea-800 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h2 className="text-lg font-bold text-tea-950">
              {t.assessment.steps.quantity}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm font-semibold focus:ring-2 focus:ring-tea-600 focus:bg-white transition-all"
                  required
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-stone-400 font-bold">kg</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
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
                  placeholder="Leave blank if unknown"
                  value={expectedAcceptedWeightKg}
                  onChange={(e) => setExpectedAcceptedWeightKg(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white transition-all"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-stone-400 font-bold">kg</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                {t.assessment.fields.expectedAcceptedWeightHelp}
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Harvest and Delivery Timings */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-cream-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
            <div className="w-7 h-7 rounded-lg bg-tea-100 text-tea-800 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h2 className="text-lg font-bold text-tea-950">
              {t.assessment.steps.harvest}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.assessment.fields.harvestTime} *
              </label>
              <input
                type="datetime-local"
                value={harvestTimestamp}
                onChange={(e) => setHarvestTimestamp(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white transition-all"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white transition-all"
                required
              />
            </div>
          </div>
        </div>

        {/* Section 4: Quality Observations */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-cream-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
            <div className="w-7 h-7 rounded-lg bg-tea-100 text-tea-800 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h2 className="text-lg font-bold text-tea-950">
              {t.assessment.steps.quality}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                {t.assessment.fields.goodLeaf}
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="e.g. 70"
                  value={goodLeafPercentage}
                  onChange={(e) => setGoodLeafPercentage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white transition-all"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-stone-400 font-bold">%</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                {t.assessment.fields.goodLeafHelp}
              </p>
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
                  placeholder="e.g. 15"
                  value={coarseLeafPercentage}
                  onChange={(e) => setCoarseLeafPercentage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white transition-all"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-stone-400 font-bold">%</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                {t.assessment.fields.coarseLeafHelp}
              </p>
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
                  placeholder="e.g. 5"
                  value={damagedLeafPercentage}
                  onChange={(e) => setDamagedLeafPercentage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white transition-all"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-stone-400 font-bold">%</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1">
                {t.assessment.fields.damagedLeafHelp}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.assessment.fields.surfaceCondition}
              </label>
              <select
                value={surfaceCondition}
                onChange={(e) => setSurfaceCondition(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white transition-all"
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
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white transition-all"
              >
                <option value="loosely_packed">{t.assessment.fields.packagingLoosely}</option>
                <option value="tightly_compressed">{t.assessment.fields.packagingCompressed}</option>
                <option value="unknown">{t.assessment.fields.packagingUnknown}</option>
              </select>
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-stone-700">
                <input
                  type="checkbox"
                  checked={isMeasuredSample}
                  onChange={(e) => setIsMeasuredSample(e.target.checked)}
                  className="rounded border-cream-400 text-tea-700 focus:ring-tea-600 w-4 h-4"
                />
                <span>{t.assessment.fields.isMeasuredSample}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 5: Transport & Costs */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-cream-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
            <div className="w-7 h-7 rounded-lg bg-tea-100 text-tea-800 flex items-center justify-center font-bold text-sm">
              5
            </div>
            <h2 className="text-lg font-bold text-tea-950">
              {t.assessment.steps.transport}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white transition-all"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-stone-400 font-bold">Rs/kg</span>
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
                  placeholder="Optional total vehicle hire"
                  value={totalTransportCost}
                  onChange={(e) => {
                    setTotalTransportCost(e.target.value);
                    if (e.target.value) setTransportCostPerKg('');
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white transition-all"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-stone-400 font-bold">LKR</span>
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
                  className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white transition-all"
                />
                <span className="absolute right-3.5 top-2.5 text-xs text-stone-400 font-bold">LKR</span>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                {t.assessment.fields.notes}
              </label>
              <textarea
                rows={2}
                placeholder="Plucking batch notes, weather, or factory gate agreements..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-cream-300 bg-cream-50/50 text-sm focus:ring-2 focus:ring-tea-600 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="text-center pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto px-10 py-4 rounded-xl bg-tea-800 hover:bg-tea-900 text-white font-bold text-base shadow-lg hover:shadow-tea-900/25 transition-all flex items-center justify-center gap-2 mx-auto disabled:opacity-50"
          >
            <Calculator className="w-5 h-5 text-leaf-400" />
            <span>{isLoading ? t.assessment.calculating : t.assessment.submitButton}</span>
          </button>
        </div>
      </form>

      {/* Results Section */}
      {result && (
        <div id="results-section" className="space-y-8 pt-8 border-t-2 border-cream-300">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-tea-200 shadow-xl space-y-8">
            {/* Header Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cream-200 pb-6">
              <div>
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2 ${
                    result.status === 'personalized_estimate'
                      ? 'bg-leaf-100 text-tea-900 border border-leaf-300'
                      : result.status === 'market_reference_only'
                      ? 'bg-amberGold-100 text-amberGold-900 border border-amberGold-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {result.status === 'personalized_estimate'
                    ? t.results.personalizedNotice
                    : result.status === 'market_reference_only'
                    ? t.results.referenceNotice
                    : t.results.unavailableNotice}
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-tea-950">
                  {t.results.title}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveEstimate}
                  disabled={isSaving || savedSuccess}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all ${
                    savedSuccess
                      ? 'bg-leaf-500 text-white'
                      : 'bg-cream-100 hover:bg-cream-200 text-tea-900 border border-cream-300'
                  }`}
                >
                  <BookmarkCheck className="w-4 h-4" />
                  <span>{savedSuccess ? t.results.savedSuccess : t.results.saveEstimate}</span>
                </button>
              </div>
            </div>

            {/* Core Values Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Estimated Price per kg */}
              <div className="bg-tea-50/80 rounded-2xl p-6 border border-tea-200 space-y-2">
                <span className="text-xs font-bold text-tea-800 uppercase tracking-wider block">
                  {t.results.estPricePerKg}
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold text-tea-950">
                  {result.estimatedPriceMin === result.estimatedPriceMax ? (
                    <span>Rs. {result.estimatedPriceMin}</span>
                  ) : (
                    <span>Rs. {result.estimatedPriceMin} – {result.estimatedPriceMax}</span>
                  )}
                  <span className="text-xs font-normal text-stone-500 ml-1.5">/ kg</span>
                </div>
                <div className="text-xs text-stone-600">
                  Base rate: Rs. {result.basePriceMin} – {result.basePriceMax}/kg
                </div>
              </div>

              {/* Gross Revenue */}
              <div className="bg-white rounded-2xl p-6 border border-cream-300 space-y-2">
                <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                  {t.results.grossRevenue}
                </span>
                <div className="text-2xl sm:text-3xl font-bold text-stone-900">
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
                    ? 'bg-red-50 border-red-200'
                    : 'bg-leaf-50/80 border-leaf-200'
                }`}
              >
                <span className="text-xs font-bold text-tea-900 uppercase tracking-wider block">
                  {t.results.netRevenue}
                </span>
                <div
                  className={`text-2xl sm:text-3xl font-extrabold ${
                    result.netRevenueMin < 0 ? 'text-red-700' : 'text-tea-900'
                  }`}
                >
                  Rs. {result.netRevenueMin.toLocaleString()} – {result.netRevenueMax.toLocaleString()}
                </div>
                <div className="text-xs text-stone-600">
                  Total deductions: Rs. {result.costBreakdown.totalDeductions.toLocaleString()}
                  {result.netRevenueMin < 0 && (
                    <span className="text-red-600 font-bold block mt-1">
                      (Deductions exceed gross payout!)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Rules Applied */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-tea-950 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-leaf-500" />
                <span>{t.results.appliedRulesTitle}</span>
              </h3>

              {result.appliedRules.length > 0 ? (
                <div className="space-y-2">
                  {result.appliedRules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="bg-cream-50 rounded-xl p-4 border border-cream-200 flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                    >
                      <div>
                        <span className="text-xs font-bold text-tea-800 uppercase block">
                          {rule.ruleCode} — {rule.ruleName}
                        </span>
                        <p className="text-xs text-stone-600">
                          {language === 'si' ? rule.explanationSi : rule.explanationEn}
                        </p>
                      </div>
                      <div className="text-sm font-bold text-leaf-700 sm:text-right shrink-0">
                        {rule.effectiveAdjustmentPerKg > 0 ? '+' : ''}Rs. {rule.effectiveAdjustmentPerKg}/kg
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-500 italic bg-cream-50 p-3 rounded-xl border border-cream-200">
                  {t.results.noRulesApplied}
                </p>
              )}
            </div>

            {/* Unused Quality Observations (Advisory) */}
            {result.unusedObservations.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Info className="w-5 h-5 text-amber-500" />
                  <span>{t.results.unusedObservationsTitle}</span>
                </h3>

                <div className="space-y-2">
                  {result.unusedObservations.map((obs, idx) => (
                    <div
                      key={idx}
                      className="bg-amberGold-50/50 rounded-xl p-4 border border-amberGold-200 text-xs text-stone-700"
                    >
                      <span className="font-bold text-amberGold-900">
                        {obs.field}: {obs.value}
                      </span>{' '}
                      — {language === 'si' ? obs.reasonSi : obs.reasonEn}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Records Used & Traceability */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-tea-950 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-tea-700" />
                <span>{t.results.marketRecordsTitle}</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-cream-200 rounded-xl overflow-hidden">
                  <thead className="bg-cream-100 text-stone-700 font-semibold border-b border-cream-200">
                    <tr>
                      <th className="p-3">Source & Publisher</th>
                      <th className="p-3">Location Match</th>
                      <th className="p-3">Applicable Range</th>
                      <th className="p-3">Validity</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cream-200">
                    {result.recordsUsed.map((rec) => (
                      <tr key={rec.id} className="hover:bg-cream-50">
                        <td className="p-3 font-medium">
                          {rec.sourceName}
                          {rec.sourceRef && (
                            <span className="text-[10px] text-stone-400 block">{rec.sourceRef}</span>
                          )}
                        </td>
                        <td className="p-3 text-stone-600">
                          {rec.locality ? `${rec.locality}, ` : ''}{rec.district}
                        </td>
                        <td className="p-3 font-bold text-tea-900">
                          Rs. {rec.minPrice} – {rec.maxPrice} / kg
                        </td>
                        <td className="p-3 text-stone-500">
                          {rec.validFrom} to {rec.validTo}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-leaf-100 text-leaf-800 font-bold text-[10px]">
                            {rec.verificationStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Limitations & Disclaimers */}
            <div className="bg-cream-100 rounded-2xl p-6 border border-cream-200 space-y-3">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                {t.results.limitationsTitle}
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-xs text-stone-600 leading-relaxed">
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
