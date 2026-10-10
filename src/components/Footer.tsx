'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { Sprout, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer className="bg-tea-950 text-cream-200 pt-12 pb-8 border-t border-tea-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Crucial Product Distinction Warning Box */}
        <div className="bg-tea-900/80 border border-tea-800 rounded-2xl p-6 mb-10 flex flex-col sm:flex-row gap-4 items-start">
          <div className="p-3 bg-amberGold-600/20 text-amberGold-400 rounded-xl shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-white font-bold text-base mb-1">
              {t.hero.distinctionTitle}
            </h4>
            <p className="text-cream-300 text-sm leading-relaxed">
              {t.hero.distinctionText}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-leaf-500 text-tea-950 flex items-center justify-center font-bold">
                <Sprout className="w-5 h-5 text-tea-950" />
              </div>
              <span className="text-xl font-bold text-white">{t.appName}</span>
            </div>
            <p className="text-cream-400 text-sm max-w-md leading-relaxed">
              {t.appTagline}
            </p>
            <div className="text-xs text-cream-500">
              Data synchronized with Tea Small Holdings Development Authority (TSHDA) regional updates and verified factory gate bulletins.
            </div>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">
              Quick Links
            </h5>
            <ul className="space-y-2 text-sm text-cream-300">
              <li>
                <Link href="/" className="hover:text-leaf-300 transition-colors">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link href="/estimate" className="hover:text-leaf-300 transition-colors">
                  {t.nav.estimate}
                </Link>
              </li>
              <li>
                <Link href="/factories" className="hover:text-leaf-300 transition-colors">
                  {t.nav.factories}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-leaf-300 transition-colors">
                  {t.nav.dashboard}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">
              Regional Benchmarks
            </h5>
            <ul className="space-y-1.5 text-xs text-cream-400">
              <li>Ruhuna Low Country (Galle, Matara)</li>
              <li>Sabaragamuwa (Ratnapura, Kegalle)</li>
              <li>Kandy Mid Country</li>
              <li>Uva High/Mid Country (Badulla)</li>
              <li>Nuwara Eliya High Grown</li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-tea-900 text-xs text-cream-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} TeaValue Lanka. Built for Sri Lankan Smallholder Tea Growers.</p>
          <p className="text-[11px] text-cream-500">
            Advisory estimates only. Final payable weights and net values determined at factory sheds.
          </p>
        </div>
      </div>
    </footer>
  );
};
