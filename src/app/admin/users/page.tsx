'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { UserRecord } from '@/lib/db/client';
import { ArrowLeft, Users, Shield, ShieldCheck } from 'lucide-react';

export default function AdminUsersPage() {
  const { t } = useI18n();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoteEmail, setPromoteEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((d) => {
        if (d.users) setUsers(d.users);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handlePromote = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: promoteEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Promotion failed');
      setMessage(data.message);
      setPromoteEmail('');
      fetchUsers();
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-tea-800 hover:text-tea-950 mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Portal Overview</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-tea-950">
          User Account Management
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          View registered smallholders and securely promote accounts to Administrator role.
        </p>
      </div>

      {/* Promotion Form */}
      <div className="bg-white rounded-2xl p-6 border border-cream-200 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-tea-950">Promote Registered User to Admin</h3>
        <p className="text-xs text-stone-500">
          Enforces server-side authorization. Default registrations are strictly farmers.
        </p>

        <form onSubmit={handlePromote} className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            placeholder="farmer@teavalue.lk"
            value={promoteEmail}
            onChange={(e) => setPromoteEmail(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl border border-cream-300 text-xs"
          />
          <button
            type="submit"
            className="px-5 py-2 bg-tea-800 hover:bg-tea-900 text-white font-bold text-xs rounded-xl transition-colors"
          >
            Promote to Admin
          </button>
        </form>

        {message && (
          <div className="text-xs p-3 bg-tea-50 text-tea-900 rounded-xl border border-tea-200">
            {message}
          </div>
        )}
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-20 text-center text-stone-500 text-sm">{t.common.loading}</div>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream-100 text-stone-700 font-semibold border-b border-cream-200">
              <tr>
                <th className="p-3.5">Name</th>
                <th className="p-3.5">Email</th>
                <th className="p-3.5">Role</th>
                <th className="p-3.5">District</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cream-200">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-cream-50/50">
                  <td className="p-3.5 font-bold text-tea-950">{u.name}</td>
                  <td className="p-3.5 text-stone-600">{u.email}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-amberGold-100 text-amberGold-800'
                          : 'bg-leaf-100 text-leaf-800'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3.5 text-stone-500">{u.district || 'Unset'}</td>
                  <td className="p-3.5">
                    <span className="capitalize text-stone-600">{u.status || 'Active'}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
