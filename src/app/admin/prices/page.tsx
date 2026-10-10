'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { MarketPriceRecord } from '@/lib/engine/types';
import {
  ArrowLeft,
  Plus,
  CheckCircle2,
  XCircle,
  Archive,
  AlertCircle,
  Building2,
  DollarSign,
  Calendar,
  Globe,
} from 'lucide-react';

export default function AdminPricesPage() {
  const { t } = useI18n();

  const [prices, setPrices] = useState<MarketPriceRecord[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New Price Modal form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [district, setDistrict] = useState('Galle');
  const [locality, setLocality] = useState('');
  const [factoryName, setFactoryName] = useState('');
  const [priceBasis, setPriceBasis] = useState<'generic' | 'factory-base' | 'quality-specific'>('factory-base');
  const [qualityCategoryRef, setQualityCategoryRef] = useState('');
  const [minPrice, setMinPrice] = useState('245');
  const [maxPrice, setMaxPrice] = useState('255');
  const [validFrom, setValidFrom] = useState('2026-10-01');
  const [validTo, setValidTo] = useState('2026-10-31');
  const [sourceName, setSourceName] = useState('');
  const [sourceRef, setSourceRef] = useState('');
  const [sourceExcerpt, setSourceExcerpt] = useState('');

  const fetchPrices = () => {
    setLoading(true);
    fetch('/api/admin/prices')
      .then((res) => {
        if (!res.ok) throw new Error('Unauthorized');
        return res.json();
      })
      .then((data) => {
        if (data.prices) setPrices(data.prices);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPrices();
  }, []);

  const handleStatusChange = async (id: string, status: 'verified' | 'rejected' | 'retired') => {
    try {
      const res = await fetch('/api/admin/prices', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error('Status update failed');
      fetchPrices();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district,
          locality: locality || undefined,
          factoryName: factoryName || undefined,
          priceBasis,
          qualityCategoryRef: qualityCategoryRef || undefined,
          minPrice: Number(minPrice),
          maxPrice: Number(maxPrice),
          validFrom,
          validTo,
          sourceName,
          sourceRef,
          sourceExcerpt,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save');
      }

      setShowAddModal(false);
      fetchPrices();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = prices.filter((p) => {
    if (filterStatus === 'all') return true;
    return p.verificationStatus === filterStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
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
            {t.admin.tabPrices}
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Review, verify, and retire published green leaf prices.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-tea-800 hover:bg-tea-900 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>{t.admin.addNewPrice}</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-cream-200 pb-3">
        {['all', 'pending', 'verified', 'retired', 'rejected'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-colors ${
              filterStatus === st
                ? 'bg-tea-800 text-white shadow-sm'
                : 'text-stone-600 hover:bg-cream-100'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center text-stone-500 text-sm">{t.common.loading}</div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-cream-200 text-stone-500 text-xs">
          No market price records found in this category.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100 text-stone-700 font-semibold border-b border-cream-200">
                <tr>
                  <th className="p-3.5">Source & Reference</th>
                  <th className="p-3.5">District / Locality</th>
                  <th className="p-3.5">Price (LKR/kg)</th>
                  <th className="p-3.5">Basis</th>
                  <th className="p-3.5">Validity Range</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-cream-50/50">
                    <td className="p-3.5">
                      <div className="font-bold text-tea-950">{item.sourceName}</div>
                      {item.sourceExcerpt && (
                        <div className="text-[11px] text-stone-500 line-clamp-1 max-w-xs">
                          {item.sourceExcerpt}
                        </div>
                      )}
                      <div className="text-[10px] text-stone-400 capitalize">Method: {item.discoveryMethod}</div>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-stone-900">{item.district}</span>
                      {item.locality && <span className="text-stone-500 block">{item.locality}</span>}
                    </td>
                    <td className="p-3.5 font-bold text-tea-900 text-sm">
                      Rs. {item.minPrice} – {item.maxPrice}
                    </td>
                    <td className="p-3.5">
                      <span className="capitalize">{item.priceBasis}</span>
                      {item.qualityCategoryRef && (
                        <span className="block text-[10px] text-tea-700 font-medium">
                          {item.qualityCategoryRef}
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-stone-500">
                      {item.validFrom} to {item.validTo}
                    </td>
                    <td className="p-3.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.verificationStatus === 'verified'
                            ? 'bg-leaf-100 text-leaf-800'
                            : item.verificationStatus === 'pending'
                            ? 'bg-amberGold-100 text-amberGold-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {item.verificationStatus}
                      </span>
                    </td>
                    <td className="p-3.5 text-right space-x-1 whitespace-nowrap">
                      {item.verificationStatus !== 'verified' && (
                        <button
                          onClick={() => handleStatusChange(item.id, 'verified')}
                          className="px-2 py-1 bg-leaf-600 hover:bg-leaf-700 text-white text-[11px] font-bold rounded"
                          title="Verify and make active"
                        >
                          Verify
                        </button>
                      )}
                      {item.verificationStatus === 'pending' && (
                        <button
                          onClick={() => handleStatusChange(item.id, 'rejected')}
                          className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded"
                          title="Reject candidate"
                        >
                          Reject
                        </button>
                      )}
                      {item.verificationStatus === 'verified' && (
                        <button
                          onClick={() => handleStatusChange(item.id, 'retired')}
                          className="px-2 py-1 bg-stone-500 hover:bg-stone-600 text-white text-[11px] font-bold rounded"
                          title="Retire record"
                        >
                          Retire
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Price Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center border-b border-cream-200 pb-3">
              <h3 className="font-extrabold text-tea-950 text-lg">
                Record New Market Price
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-stone-400 hover:text-stone-700 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPrice} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    District *
                  </label>
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

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Locality
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hiniduma"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Min Price (LKR/kg) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Max Price (LKR/kg) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Valid From *
                  </label>
                  <input
                    type="date"
                    required
                    value={validFrom}
                    onChange={(e) => setValidFrom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Valid To *
                  </label>
                  <input
                    type="date"
                    required
                    value={validTo}
                    onChange={(e) => setValidTo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Source Publisher Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Factory Notice Board / TSHDA Monthly Bulletin"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Supporting Excerpt / Evidence Quote *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Text excerpt verifying raw green leaf price and applicability"
                  value={sourceExcerpt}
                  onChange={(e) => setSourceExcerpt(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-cream-100 text-stone-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-tea-800 text-white text-xs font-bold rounded-xl shadow-sm"
                >
                  Save & Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
