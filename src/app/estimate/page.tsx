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
  Sparkles,
  ChevronDown,
  ChevronUp,
  Sun,
  CloudRain,
  Star,
  Check,
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

  // Simple Mode Helpers
  const [qualityPreset, setQualityPreset] = useState<'super' | 'standard' | 'coarse'>('super');
  const [showAdvanced, setShowAdvanced] = useState(false);

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
  const [goodLeafPercentage, setGoodLeafPercentage] = useState<string>('75');
  const [coarseLeafPercentage, setCoarseLeafPercentage] = useState<string>('10');
  const [damagedLeafPercentage, setDamagedLeafPercentage] = useState<string>('3');
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
  const [useGemini, setUseGemini] = useState(true);
  const [geminiNotice, setGeminiNotice] = useState<string | null>(null);

  const handleSelectQualityPreset = (preset: 'super' | 'standard' | 'coarse') => {
    setQualityPreset(preset);
    if (preset === 'super') {
      setGoodLeafPercentage('75');
      setCoarseLeafPercentage('10');
      setDamagedLeafPercentage('3');
    } else if (preset === 'standard') {
      setGoodLeafPercentage('65');
      setCoarseLeafPercentage('15');
      setDamagedLeafPercentage('5');
    } else {
      setGoodLeafPercentage('48');
      setCoarseLeafPercentage('25');
      setDamagedLeafPercentage('10');
    }
  };

  const handleDistrictChange = (d: string) => {
    setDistrict(d);
    if (['Galle', 'Matara', 'Kalutara'].includes(d)) {
      setGrowingRegion('Ruhuna (Low Country)');
      setElevationCategory('low');
    } else if (['Ratnapura', 'Kegalle'].includes(d)) {
      setGrowingRegion('Sabaragamuwa');
      setElevationCategory('low');
    } else if (d === 'Kandy') {
      setGrowingRegion('Kandy (Mid Country)');
      setElevationCategory('mid');
    } else if (d === 'Nuwara Eliya') {
      setGrowingRegion('Nuwara Eliya (Up Country)');
      setElevationCategory('high');
    } else if (d === 'Badulla') {
      setGrowingRegion('Uva (High / Mid Country)');
      setElevationCategory('high');
    }
  };

  const quickAddWeight = (amount: number) => {
    setHarvestedWeightKg((prev) => Math.max(1, (Number(prev) || 0) + amount));
  };

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
    setGeminiNotice(null);
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
        useGemini,
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
      if (data.geminiNotice) {
        setGeminiNotice(data.geminiNotice);
      }
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
        useGemini,
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
        {/* Quick & User-Friendly Assessment Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-6 border border-emerald-100 shadow-[0_4px_25px_-4px_rgba(6,78,59,0.06)]">
          <div className="border-b border-stone-100 pb-4">
            <h2 className="text-lg font-bold text-emerald-950 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-emerald-600" />
              <span>{t.assessment.fields.easyModeTitle}</span>
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              {t.assessment.fields.easyModeSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. District Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide">
                {t.assessment.fields.district} *
              </label>
              <select
                value={district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full px-4 py-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-sm font-semibold focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all cursor-pointer"
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
              <span className="text-[11px] text-stone-500 block">
                Region: <strong className="text-stone-700">{growingRegion}</strong>
              </span>
            </div>

            {/* 2. Harvested Weight in KG with Quick Add Chips */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide">
                {t.assessment.fields.harvestedWeight} *
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={harvestedWeightKg || ''}
                  onChange={(e) => setHarvestedWeightKg(Number(e.target.value) || 0)}
                  className="w-full px-4 py-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-base font-extrabold focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all pr-12"
                  placeholder="e.g. 100"
                  required
                />
                <span className="absolute right-4 top-3.5 text-xs text-emerald-800 font-bold">KG</span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-stone-400 font-medium mr-1">{t.assessment.fields.quickWeightAdd}</span>
                <button
                  type="button"
                  onClick={() => quickAddWeight(25)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                >
                  +25 kg
                </button>
                <button
                  type="button"
                  onClick={() => quickAddWeight(50)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                >
                  +50 kg
                </button>
                <button
                  type="button"
                  onClick={() => quickAddWeight(100)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 transition-colors cursor-pointer"
                >
                  +100 kg
                </button>
                <button
                  type="button"
                  onClick={() => setHarvestedWeightKg(100)}
                  className="px-2 py-1 text-[11px] font-medium rounded-lg text-stone-500 hover:text-stone-800 cursor-pointer"
                >
                  Reset (100kg)
                </button>
              </div>
            </div>
          </div>

          {/* 3. Overall Leaf Quality Level (3 Interactive Cards) */}
          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide">
              {t.assessment.fields.qualityLabel}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Preset: Super / Grade A */}
              <button
                type="button"
                onClick={() => handleSelectQualityPreset('super')}
                className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  qualityPreset === 'super'
                    ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/30 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/20'
                }`}
              >
                {qualityPreset === 'super' && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                </div>
                <strong className="block text-sm font-bold text-emerald-950">
                  {t.assessment.fields.qualitySuperTitle}
                </strong>
                <p className="text-xs text-stone-600 mt-1 leading-snug">
                  {t.assessment.fields.qualitySuperDesc}
                </p>
                <span className="inline-block mt-2.5 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                  + Incentive Bonus
                </span>
              </button>

              {/* Preset: Standard / Grade B */}
              <button
                type="button"
                onClick={() => handleSelectQualityPreset('standard')}
                className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  qualityPreset === 'standard'
                    ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/30 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/20'
                }`}
              >
                {qualityPreset === 'standard' && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                </div>
                <strong className="block text-sm font-bold text-stone-900">
                  {t.assessment.fields.qualityStandardTitle}
                </strong>
                <p className="text-xs text-stone-600 mt-1 leading-snug">
                  {t.assessment.fields.qualityStandardDesc}
                </p>
                <span className="inline-block mt-2.5 text-[11px] font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded-md">
                  Benchmark Rate
                </span>
              </button>

              {/* Preset: Coarse / Grade C */}
              <button
                type="button"
                onClick={() => handleSelectQualityPreset('coarse')}
                className={`p-4 rounded-2xl border text-left transition-all relative cursor-pointer ${
                  qualityPreset === 'coarse'
                    ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/30 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/20'
                }`}
              >
                {qualityPreset === 'coarse' && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
                <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                </div>
                <strong className="block text-sm font-bold text-stone-900">
                  {t.assessment.fields.qualityCoarseTitle}
                </strong>
                <p className="text-xs text-stone-600 mt-1 leading-snug">
                  {t.assessment.fields.qualityCoarseDesc}
                </p>
                <span className="inline-block mt-2.5 text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md">
                  Base / Penalty Deductions
                </span>
              </button>
            </div>
          </div>

          {/* 4. Surface Moisture (Dry vs Wet) */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-bold text-stone-800 uppercase tracking-wide">
              {t.assessment.fields.leafConditionLabel}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <button
                type="button"
                onClick={() => setSurfaceCondition('dry')}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  surfaceCondition === 'dry'
                    ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/30 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-emerald-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <Sun className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-sm font-bold text-stone-900">
                      {t.assessment.fields.leafConditionDry}
                    </strong>
                    <span className="text-[11px] text-stone-500">Normal weight accepted (No water tare)</span>
                  </div>
                </div>
                {surfaceCondition === 'dry' && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setSurfaceCondition('wet')}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  surfaceCondition === 'wet'
                    ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/30 shadow-sm'
                    : 'border-stone-200 bg-white hover:border-emerald-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center">
                    <CloudRain className="w-5 h-5" />
                  </div>
                  <div>
                    <strong className="block text-sm font-bold text-stone-900">
                      {t.assessment.fields.leafConditionWet}
                    </strong>
                    <span className="text-[11px] text-stone-500">Factory water tare deduction (~5%)</span>
                  </div>
                </div>
                {surfaceCondition === 'wet' && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Advanced Settings (Optional for Power Users) */}
        <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm transition-all">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full p-5 sm:px-8 flex items-center justify-between bg-stone-50/70 hover:bg-stone-100/70 text-left transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-lg bg-stone-200/80 text-stone-700 flex items-center justify-center text-xs font-bold">
                ⚙️
              </span>
              <div>
                <span className="text-xs sm:text-sm font-bold text-stone-800">
                  {showAdvanced ? t.assessment.fields.advancedToggleHide : t.assessment.fields.advancedToggleShow}
                </span>
                <span className="text-[11px] text-stone-500 block">
                  Target factory, exact percentages, transit duration, transport deductions
                </span>
              </div>
            </div>
            {showAdvanced ? (
              <ChevronUp className="w-5 h-5 text-stone-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-stone-500" />
            )}
          </button>

          {showAdvanced && (
            <div className="p-6 sm:p-8 space-y-6 border-t border-stone-100">
              {/* Target Factory & Locality */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    {t.assessment.fields.targetFactory}
                  </label>
                  <select
                    value={targetFactoryId}
                    onChange={(e) => setTargetFactoryId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-xs focus:border-emerald-600 focus:bg-white transition-all"
                  >
                    <option value="">-- Auto-benchmark all factories in {district} --</option>
                    {factories.map((f) => (
                      <option key={f.factoryId || f.id} value={f.factoryId || f.id}>
                        {f.factoryName || f.name} — {f.locality}
                      </option>
                    ))}
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
                    className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50/30 text-stone-900 text-xs focus:border-emerald-600 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Exact Quality Percentages */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-stone-50/50 p-4 rounded-2xl border border-stone-200">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    {t.assessment.fields.goodLeaf}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={goodLeafPercentage}
                    onChange={(e) => {
                      setGoodLeafPercentage(e.target.value);
                      setQualityPreset('standard');
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    {t.assessment.fields.coarseLeaf}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={coarseLeafPercentage}
                    onChange={(e) => setCoarseLeafPercentage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 mb-1">
                    {t.assessment.fields.damagedLeaf}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={damagedLeafPercentage}
                    onChange={(e) => setDamagedLeafPercentage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold"
                  />
                </div>
              </div>

              {/* Transport Costs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.assessment.fields.transportCostPerKg}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={transportCostPerKg}
                    onChange={(e) => setTransportCostPerKg(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 bg-white text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    {t.assessment.fields.otherDeductions}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={otherDeductions}
                    onChange={(e) => setOtherDeductions(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 bg-white text-xs font-bold"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  {t.assessment.fields.notes}
                </label>
                <textarea
                  rows={2}
                  placeholder="Plucking condition, estate weather, notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 bg-white text-xs"
                />
              </div>
            </div>
          )}
        </div>

        {/* Google Gemini AI Valuation Toggle */}
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-stone-900 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold uppercase tracking-wider border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Google Gemini AI</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-emerald-100">
              {t.assessment.fields.geminiToggle}
            </h3>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              {t.assessment.fields.geminiToggleHelp}
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={useGemini}
              onChange={(e) => setUseGemini(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-8 bg-stone-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500 shadow-inner"></div>
          </label>
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
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`inline-flex items-center gap-2 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider ${
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

                  {result.valuationEngine === 'gemini_ai' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold text-xs shadow-sm uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5" />
                      {t.results.geminiPowered}
                    </span>
                  )}
                </div>

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

            {/* Gemini System Notice if present */}
            {geminiNotice && (
              <div className="bg-amber-50/90 border border-amber-200/90 p-4 rounded-2xl text-amber-900 text-xs flex items-start gap-3 shadow-sm">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-bold">Gemini API Status:</strong> {geminiNotice}
                </div>
              </div>
            )}

            {/* Google Gemini AI Market Intelligence HUD Card */}
            {result.geminiAnalysis && (
              <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white rounded-2xl p-6 sm:p-7 border border-emerald-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100/90 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                      <Sparkles className="w-4 h-4 text-emerald-100" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wide">
                        {t.results.geminiAnalysisTitle}
                      </h3>
                      <span className="text-[11px] text-stone-500">
                        {result.geminiAnalysis.benchmarkSource || 'Sri Lanka Tea Board Market Framework'}
                      </span>
                    </div>
                  </div>
                  {result.geminiAnalysis.confidenceScore && (
                    <span className="self-start sm:self-auto text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                      {t.results.geminiConfidence}: {result.geminiAnalysis.confidenceScore}
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <p className="text-xs sm:text-sm text-stone-800 leading-relaxed font-medium">
                    {language === 'si' ? result.geminiAnalysis.summarySi : result.geminiAnalysis.summaryEn}
                  </p>

                  {result.geminiAnalysis.qualityAdviceEn && (
                    <div className="bg-white/80 rounded-xl p-4 border border-emerald-100 text-xs space-y-1.5 shadow-[0_2px_10px_-4px_rgba(6,78,59,0.06)]">
                      <strong className="text-emerald-950 font-bold flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        {t.results.geminiAdviceTitle}
                      </strong>
                      <p className="text-stone-600 leading-relaxed">
                        {language === 'si' ? result.geminiAnalysis.qualityAdviceSi : result.geminiAnalysis.qualityAdviceEn}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

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
