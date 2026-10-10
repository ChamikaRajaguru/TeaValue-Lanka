'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { FactoryProfile } from '@/lib/engine/types';
import { ArrowLeft, Plus, Building2, MapPin, CheckCircle2 } from 'lucide-react';

export default function AdminFactoriesPage() {
  const { t } = useI18n();

  const [factories, setFactories] = useState<FactoryProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('Galle');
  const [locality, setLocality] = useState('');
  const [elevationCategory, setElevationCategory] = useState<'low' | 'mid' | 'high' | 'unknown'>('low');
  const [registeredNumber, setRegisteredNumber] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [collectionAvailable, setCollectionAvailable] = useState(true);
  const [paymentCycleDescription, setPaymentCycleDescription] = useState('Monthly on the 10th');

  const fetchFactories = () => {
    setLoading(true);
    fetch('/api/admin/factories')
      .then((r) => r.json())
      .then((d) => {
        if (d.factories) setFactories(d.factories);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFactories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/factories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          district,
          locality,
          elevationCategory,
          registeredNumber,
          contactNumber,
          collectionAvailable,
          paymentCycleDescription,
        }),
      });
      if (!res.ok) throw new Error('Failed to create factory');
      setShowAdd(false);
      setName('');
      setLocality('');
      fetchFactories();
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
            Factory Registry Management
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Registered tea factories receiving raw green leaf from smallholders.
          </p>
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 bg-tea-800 hover:bg-tea-900 text-white font-bold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Factory</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-stone-500 text-sm">{t.common.loading}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {factories.map((f) => (
            <div
              key={f.id}
              className="bg-white p-5 rounded-2xl border border-cream-200 shadow-sm space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-tea-950 text-base">{f.name}</h3>
                  <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{f.locality}, {f.district}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-leaf-100 text-leaf-800">
                  Active
                </span>
              </div>

              <div className="text-xs text-stone-600 space-y-0.5 pt-1">
                <div>Reg No: <strong>{f.registeredNumber || 'TSHDA/Registered'}</strong></div>
                <div>Payment Terms: <strong>{f.paymentCycleDescription}</strong></div>
                <div>Collection: <strong>{f.collectionAvailable ? 'Yes' : 'No'}</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-cream-200 pb-2">
              <h3 className="font-extrabold text-tea-950 text-base">Register New Factory</h3>
              <button onClick={() => setShowAdd(false)}>✕</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Factory Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Neluwa Charitha Factory"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">District *</label>
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
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Locality *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Neluwa"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">TSHDA Registration No.</label>
                <input
                  type="text"
                  placeholder="TSHDA/GAL/..."
                  value={registeredNumber}
                  onChange={(e) => setRegisteredNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-cream-300 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Payment Settlement Cycle</label>
                <input
                  type="text"
                  value={paymentCycleDescription}
                  onChange={(e) => setPaymentCycleDescription(e.target.value)}
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
                  Create Factory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
