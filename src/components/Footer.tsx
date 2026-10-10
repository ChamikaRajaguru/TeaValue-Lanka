'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Sprout, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="bg-emerald-950 text-emerald-100 pt-14 pb-10 border-t border-emerald-900 mt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(#10b98115_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Crucial Product Distinction Warning Box */}
        <div className="bg-emerald-900/60 border border-emerald-700/50 backdrop-blur-md rounded-2xl p-6 mb-10 flex flex-col sm:flex-row gap-4 items-start shadow-sm">
          <div className="p-3 bg-amber-400/20 text-amber-300 rounded-xl shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-bold text-base mb-1">
              {t.hero.distinctionTitle}
            </h4>
            <p className="text-emerald-100/90 text-sm leading-relaxed">
              {t.hero.distinctionText}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-emerald-950 flex items-center justify-center font-bold shadow-md shadow-emerald-500/20">
                <Sprout className="w-5 h-5 text-emerald-950" />
              </div>
              <span className="text-xl font-extrabold text-white">{t.appName}</span>
            </div>
            <p className="text-emerald-200/80 text-sm max-w-md leading-relaxed">
              {t.appTagline}
            </p>
            <div className="text-xs text-emerald-300/60">
              Data synchronized with Tea Small Holdings Development Authority (TSHDA) regional updates and verified factory gate bulletins.
            </div>
          </div>

          <div>
            <h5 className="text-white font-bold text-xs mb-3 uppercase tracking-wider text-emerald-400">
              Quick Links
            </h5>
            <ul className="space-y-2 text-sm text-emerald-200/90">
              <li>
                <Link href="/" className="hover:text-emerald-300 transition-colors">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link href="/estimate" className="hover:text-emerald-300 transition-colors">
                  {t.nav.estimate}
                </Link>
              </li>
              <li>
                <Link href="/factories" className="hover:text-emerald-300 transition-colors">
                  {t.nav.factories}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-300 transition-colors">
                  {t.nav.dashboard}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-bold text-xs mb-3 uppercase tracking-wider text-emerald-400">
              Regional Benchmarks
            </h5>
            <ul className="space-y-1.5 text-xs text-emerald-200/80">
              <li>Ruhuna Low Country (Galle, Matara)</li>
              <li>Sabaragamuwa (Ratnapura, Kegalle)</li>
              <li>Kandy Mid Country</li>
              <li>Uva High/Mid Country (Badulla)</li>
              <li>Nuwara Eliya High Grown</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-emerald-900 text-xs text-emerald-300/60 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} TeaValue Lanka. Built for Sri Lankan Smallholder Tea Growers.</p>
          <p className="text-[11px] text-emerald-300/50">
            Advisory estimates only. Final payable weights and net values determined at factory sheds.
          </p>
        </div>
      </div>
    </footer>
  );
};
