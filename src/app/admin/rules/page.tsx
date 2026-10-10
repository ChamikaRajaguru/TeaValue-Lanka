'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { QualityRule } from '@/lib/engine/types';
import { ArrowLeft, Plus, CheckCircle2, Scale } from 'lucide-react';

export default function AdminRulesPage() {
  const { t, language } = useI18n();

  const [rules, setRules] = useState<QualityRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [district, setDistrict] = useState('Galle');
  const [adjustmentType, setAdjustmentType] = useState<'fixed_per_kg' | 'percentage'>('fixed_per_kg');
  const [adjustmentValue, setAdjustmentValue] = useState('10');
  const [effectiveFrom, setEffectiveFrom] = useState('2026-10-01');
  const [effectiveTo, setEffectiveTo] = useState('2026-10-31');
  const [priority, setPriority] = useState('1');
  const [exclusiveGroup, setExclusiveGroup] = useState('QUALITY_BONUS');
  const [explanationEn, setExplanationEn] = useState('');
  const [explanationSi, setExplanationSi] = useState('');

  const fetchRules = () => {
    setLoading(true);
    fetch('/api/admin/rules')
      .then((r) => r.json())
      .then((d) => {
        if (d.rules) setRules(d.rules);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          code,
          district,
          adjustmentType,
          adjustmentValue: Number(adjustmentValue),
          effectiveFrom,
          effectiveTo,
          priority: Number(priority),
          exclusiveGroup,
          explanationEn,
          explanationSi,
        }),
      });

      if (!res.ok) throw new Error('Failed to create rule');
      setShowAdd(false);
      setName('');
      setCode('');
      fetchRules();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-tea-800 hover:text-tea-950 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Portal Overview</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-tea-950">
            {t.admin.tabRules}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Configure verified pricing adjustments for leaf quality, packaging, and transit.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 bg-tea-800 hover:bg-tea-900 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{t.admin.addNewRule}</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-stone-500 text-sm">{t.common.loading}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule) => (
            <div
              key={rule.id}
              className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold text-tea-800 bg-tea-50 px-2 py-0.5 rounded border border-tea-200">
                    {rule.code} (Priority {rule.priority})
                  </span>
                  <h3 className="font-bold text-tea-950 text-base mt-1">{rule.name}</h3>
                </div>

                <div className="text-right">
                  <span className="text-base font-extrabold text-leaf-700">
                    {rule.adjustmentValue > 0 ? '+' : ''}{rule.adjustmentValue}{' '}
                    {rule.adjustmentType === 'percentage' ? '%' : 'Rs/kg'}
                  </span>
                </div>
              </div>

              <div className="text-xs text-stone-600 space-y-1 bg-cream-50 p-3 rounded-xl border border-cream-200">
                <p><strong>EN:</strong> {rule.explanationEn}</p>
                <p><strong>සිං:</strong> {rule.explanationSi}</p>
              </div>

              <div className="text-[11px] text-stone-400 flex justify-between items-center pt-1 border-t border-cream-100">
                <span>Scope: {rule.scope} {rule.district ? `(${rule.district})` : ''}</span>
                <span>Valid: {rule.effectiveFrom} to {rule.effectiveTo}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-cream-200 pb-2">
              <h3 className="font-extrabold text-tea-950 text-base">New Pricing Rule</h3>
              <button onClick={() => setShowAdd(false)}>✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Rule Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tender Flush Incentive"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Rule Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="TENDER_FLUSH"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">District</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                  >
                    <option value="Galle">Galle</option>
                    <option value="Matara">Matara</option>
                    <option value="Ratnapura">Ratnapura</option>
                    <option value="Kandy">Kandy</option>
                    <option value="Nuwara Eliya">Nuwara Eliya</option>
                    <option value="Badulla">Badulla</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Adjustment Type</label>
                  <select
                    value={adjustmentType}
                    onChange={(e) => setAdjustmentType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                  >
                    <option value="fixed_per_kg">Fixed (LKR/kg)</option>
                    <option value="percentage">Percentage (%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Value (+/-) *</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={adjustmentValue}
                    onChange={(e) => setAdjustmentValue(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">English Explanation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 10 LKR bonus for >= 70% tender buds"
                  value={explanationEn}
                  onChange={(e) => setExplanationEn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Sinhala Explanation</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 70% ට වැඩි ළපටි දළු සඳහා රු. 10 ක ප්‍රසාද මුදලක්"
                  value={explanationSi}
                  onChange={(e) => setExplanationSi(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 bg-cream-100 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-tea-800 text-white text-xs font-bold rounded-xl"
                >
                  Save Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
