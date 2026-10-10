'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import { AuditLogEntry } from '@/lib/db/client';
import { ArrowLeft, ClipboardList, Shield, Clock, CheckCircle2 } from 'lucide-react';

export default function AdminAuditPage() {
  const { t } = useI18n();

  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/audit')
      .then((r) => r.json())
      .then((d) => {
        if (d.logs) setLogs(d.logs);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
          Verification & Security Audit Logs
        </h1>
        <p className="text-xs sm:text-sm text-stone-600">
          Immutable trail of administrative operations, price approvals, and system promotions.
        </p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-stone-500 text-sm">{t.common.loading}</div>
      ) : logs.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-cream-200 text-stone-500 text-xs">
          No audit entries recorded yet.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream-100 text-stone-700 font-semibold border-b border-cream-200">
                <tr>
                  <th className="p-3.5">Timestamp (UTC / Colombo)</th>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Action</th>
                  <th className="p-3.5">Target Type & ID</th>
                  <th className="p-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cream-200">
                {logs.map((log) => {
                  const dateStr = new Date(log.timestamp).toLocaleString('en-GB', {
                    timeZone: 'Asia/Colombo',
                    dateStyle: 'short',
                    timeStyle: 'medium',
                  });

                  return (
                    <tr key={log.id} className="hover:bg-cream-50/50">
                      <td className="p-3.5 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                        {dateStr}
                      </td>
                      <td className="p-3.5 font-medium text-stone-900">
                        {log.userEmail}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-tea-50 text-tea-900 border border-tea-200">
                          {log.action.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-600">
                        {log.targetType} <code className="text-[10px] bg-cream-100 px-1 rounded">{log.targetId}</code>
                      </td>
                      <td className="p-3.5 text-[11px] text-stone-500 font-mono">
                        {JSON.stringify(log.details)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
