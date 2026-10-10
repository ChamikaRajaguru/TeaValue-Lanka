'use client';

import React from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n/context';
import {
  Sprout,
  Calculator,
  Building2,
  CheckCircle2,
  TrendingUp,
  FileText,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Scale,
  MapPin,
} from 'lucide-react';

export default function HomePage() {
  const { t } = useI18n();

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden tea-gradient text-white pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#86efac_1px,transparent_1px)] [background-size:16px_16px]" />
        
        <div className="relative max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-leaf-500/20 text-leaf-300 border border-leaf-400/30 text-xs sm:text-sm font-semibold tracking-wide">
            <Sprout className="w-4 h-4 text-leaf-400" />
            <span>{t.hero.badge}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {t.hero.title}
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-xl text-cream-200 leading-relaxed font-normal">
            {t.hero.subtitle}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/estimate"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-leaf-500 hover:bg-leaf-400 text-tea-950 font-bold text-base shadow-lg hover:shadow-leaf-500/25 transition-all flex items-center justify-center gap-2 group"
            >
              <Calculator className="w-5 h-5" />
              <span>{t.hero.ctaEstimate}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/factories"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base border border-white/20 backdrop-blur-sm transition-all flex items-center justify-center gap-2"
            >
              <Building2 className="w-5 h-5 text-cream-300" />
              <span>{t.hero.ctaFactories}</span>
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="pt-10 grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <span className="text-xs text-cream-300 block">Typical Green Leaf Benchmark</span>
              <span className="text-xl sm:text-2xl font-bold text-leaf-300">230 - 275 LKR</span>
              <span className="text-[11px] text-cream-400 block mt-0.5">Per kg (Oct 2026 Season)</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <span className="text-xs text-cream-300 block">Calculation Method</span>
              <span className="text-xl sm:text-2xl font-bold text-white">Deterministic</span>
              <span className="text-[11px] text-cream-400 block mt-0.5">Zero Hallucinations</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <span className="text-xs text-cream-300 block">Quality Rules Supported</span>
              <span className="text-xl sm:text-2xl font-bold text-white">Tender / Stalk / Transit</span>
              <span className="text-[11px] text-cream-400 block mt-0.5">Factory Verified</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
              <span className="text-xs text-cream-300 block">Covered Regions</span>
              <span className="text-xl sm:text-2xl font-bold text-white">Ruhuna, Uva & Sabaragamuwa</span>
              <span className="text-[11px] text-cream-400 block mt-0.5">All 6 Key Tea Districts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Critical Educational Distinction Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-amberGold-50 border-2 border-amberGold-200 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="p-4 bg-amberGold-500 text-white rounded-2xl shrink-0 shadow-md">
              <Scale className="w-8 h-8" />
            </div>
            <div className="space-y-3">
              <div className="inline-block bg-amberGold-200/60 text-amberGold-900 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Farmer Transparency Note
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
                Understanding the Difference: Raw Green Leaf vs. Made Tea
              </h2>
              <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
                Many online sources report <strong>Colombo Tea Auction prices (Rs. 1,200 - 1,800/kg)</strong>. That price is for <em>fully manufactured black tea</em> after withering, rolling, fermenting, drying, and grading. It requires approximately <strong>4.5 to 5 kg of raw green leaf</strong> to produce 1 kg of made tea.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-white p-4 rounded-xl border border-amberGold-200">
                  <span className="text-xs font-bold text-tea-700 uppercase block mb-1">
                    ✓ What TeaValue Lanka Estimates:
                  </span>
                  <p className="text-xs text-stone-600">
                    The direct gate or collection price you receive per kg for your fresh, unmanufactured green leaves (අමු තේ දළු) delivered to processing factories.
                  </p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-amberGold-200">
                  <span className="text-xs font-bold text-red-700 uppercase block mb-1">
                    ✕ What We Never Use:
                  </span>
                  <p className="text-xs text-stone-600">
                    Retail branded tea bags, export prices, or finished auction grades (BOP, BOPF) that do not reflect smallholder farm-gate remuneration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works (3 Steps) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-tea-700 font-bold text-xs uppercase tracking-wider bg-tea-100 px-3 py-1 rounded-full">
            Simple 3-Step Process
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-tea-900">
            How Sri Lankan Farmers Use TeaValue
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            No complicated forms or guessed algorithms. Everything is traceable back to dated factory notices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-cream-200 shadow-sm tea-card-hover space-y-4">
            <div className="w-12 h-12 rounded-xl bg-tea-100 text-tea-800 flex items-center justify-center font-bold text-xl">
              1
            </div>
            <h3 className="text-xl font-bold text-tea-900">Enter Leaf & Transit Info</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Input your harvested weight, tender flush percentage, transit time, and local transport vehicle costs.
            </p>
            <ul className="text-xs text-stone-500 space-y-1.5 pt-2">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-leaf-500" /> Optional tender leaf percentage
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-leaf-500" /> Automatic harvest-to-delivery calculation
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-cream-200 shadow-sm tea-card-hover space-y-4">
            <div className="w-12 h-12 rounded-xl bg-tea-100 text-tea-800 flex items-center justify-center font-bold text-xl">
              2
            </div>
            <h3 className="text-xl font-bold text-tea-900">Verified Rule Evaluation</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              The engine matches active, verified price circulars from your district or chosen factory and tests quality bonus rules.
            </p>
            <ul className="text-xs text-stone-500 space-y-1.5 pt-2">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-leaf-500" /> Strictly verified market records only
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-leaf-500" /> Clear explanations for all adjustments
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-cream-200 shadow-sm tea-card-hover space-y-4">
            <div className="w-12 h-12 rounded-xl bg-tea-100 text-tea-800 flex items-center justify-center font-bold text-xl">
              3
            </div>
            <h3 className="text-xl font-bold text-tea-900">Gross & Net Revenue</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Receive your estimated price range in LKR/kg alongside gross payout and net revenue after fuel or vehicle hire deductions.
            </p>
            <ul className="text-xs text-stone-500 space-y-1.5 pt-2">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-leaf-500" /> Compare eligible factories in your locality
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-leaf-500" /> Save snapshot to your personal dashboard
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link
            href="/estimate"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-tea-800 hover:bg-tea-900 text-white font-bold rounded-xl shadow-md transition-colors"
          >
            <Calculator className="w-5 h-5 text-leaf-400" />
            <span>{t.assessment.submitButton}</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
