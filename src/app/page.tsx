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
  ArrowRight,
  Scale,
  ShieldCheck,
  Activity,
  Layers,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function HomePage() {
  const { t } = useI18n();

  return (
    <div className="space-y-20 pb-24">
      {/* Modern Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          {/* Status Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold tracking-widest uppercase shadow-sm">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Next-Gen Sri Lankan Smallholder Intelligence</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-emerald-950 leading-[1.1] font-sans">
            Know the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700">True Value</span> of Your Fresh Tea Leaves
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-stone-600 leading-relaxed font-normal">
            Real-time, deterministic green leaf valuation for Sri Lankan smallholders. Eliminating middleman ambiguity before you arrive at the factory shed.
          </p>

          {/* CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/estimate"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl glow-btn font-extrabold text-sm tracking-wide transition-all flex items-center justify-center gap-2 group shadow-glow"
            >
              <Calculator className="w-5 h-5 text-white" />
              <span>{t.hero.ctaEstimate}</span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/factories"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-emerald-50/70 text-emerald-900 font-bold text-sm border border-emerald-200 shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Building2 className="w-5 h-5 text-emerald-700" />
              <span>{t.hero.ctaFactories}</span>
            </Link>
          </div>

          {/* Modern Telemetry HUD Cards */}
          <div className="pt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-emerald-100 shadow-[0_4px_20px_-4px_rgba(6,78,59,0.06)] relative overflow-hidden group hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between text-xs text-stone-500 font-semibold mb-1">
                <span>Green Leaf Benchmark</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight">
                245 – 275 <span className="text-xs text-emerald-700 font-bold">LKR/kg</span>
              </div>
              <span className="text-[11px] text-stone-500 block mt-1">October 2026 Season Verified</span>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-emerald-100 shadow-[0_4px_20px_-4px_rgba(6,78,59,0.06)] relative overflow-hidden group hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between text-xs text-stone-500 font-semibold mb-1">
                <span>Valuation Model</span>
                <Zap className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-700 tracking-tight">
                Deterministic
              </div>
              <span className="text-[11px] text-stone-500 block mt-1">Zero Predictive Hallucinations</span>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-emerald-100 shadow-[0_4px_20px_-4px_rgba(6,78,59,0.06)] relative overflow-hidden group hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between text-xs text-stone-500 font-semibold mb-1">
                <span>Active Fact. Rules</span>
                <Layers className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight">
                Tender / Transit
              </div>
              <span className="text-[11px] text-stone-500 block mt-1">Tender Flush & Transit Incentives</span>
            </div>

            <div className="bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-emerald-100 shadow-[0_4px_20px_-4px_rgba(6,78,59,0.06)] relative overflow-hidden group hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between text-xs text-stone-500 font-semibold mb-1">
                <span>Key Districts</span>
                <Activity className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-950 tracking-tight">
                Galle & 5 Regions
              </div>
              <span className="text-[11px] text-stone-500 block mt-1">Ruhuna, Uva, Sabaragamuwa</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Agricultural Distinction Console (Raw Leaf vs Made Tea) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-10 border border-emerald-200/80 shadow-[0_10px_30px_-10px_rgba(6,78,59,0.08)] relative overflow-hidden">
          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 shrink-0 shadow-sm">
              <Scale className="w-8 h-8" />
            </div>

            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider border border-amber-200">
                Crucial Agricultural Distinction
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
                Fresh Raw Green Leaf (අමු දළු) vs. Colombo Made Tea Auctions
              </h2>

              <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
                Online news frequently cites <strong>Colombo Tea Auction averages of Rs. 1,200 – 1,800/kg</strong>. That is for <em>finished manufactured black tea</em>. It requires <strong>4.5 to 5 kg of fresh green leaf</strong> to produce 1 kg of made tea.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                    ✓ What TeaValue Calculates:
                  </span>
                  <p className="text-xs text-stone-700 leading-relaxed">
                    The farm-gate and factory collection intake price per kg for raw, fresh green tea leaves supplied by growers.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <span className="text-xs font-bold text-red-600 uppercase tracking-wider block mb-1">
                    ✕ What Is Never Applied:
                  </span>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Retail packet prices, export tariffs, or manufactured factory auction grades (BOP, BOPF) that do not represent smallholder earnings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process - Modern White & Green Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-extrabold text-emerald-800 tracking-widest uppercase px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            Explainable Valuation Engine
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-emerald-950 font-sans">
            How The Intelligence Deck Works
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            Transparent server-side calculations verified against published factory notices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-[0_4px_20px_-4px_rgba(6,78,59,0.06)] hover:border-emerald-300 hover:shadow-md transition-all space-y-5 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-lg flex items-center justify-center shadow-sm">
              01
            </div>
            <h3 className="text-xl font-bold text-emerald-950">Harvest Telemetry</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Enter plucking details: harvested weight, tender flush ratio, transit duration, and local vehicle hire deductions.
            </p>
            <ul className="text-xs text-stone-500 space-y-2 pt-2 border-t border-stone-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Measured sample or self-reported</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Automatic transit hour calculation</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-[0_4px_20px_-4px_rgba(6,78,59,0.06)] hover:border-emerald-300 hover:shadow-md transition-all space-y-5 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-lg flex items-center justify-center shadow-sm">
              02
            </div>
            <h3 className="text-xl font-bold text-emerald-950">Verified Rule Matching</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              The engine matches active, verified pricing records for your district and evaluates quality bonus thresholds.
            </p>
            <ul className="text-xs text-stone-500 space-y-2 pt-2 border-t border-stone-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Dated factory notices only</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Deterministic rule stacking</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-[0_4px_20px_-4px_rgba(6,78,59,0.06)] hover:border-emerald-300 hover:shadow-md transition-all space-y-5 relative overflow-hidden group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-extrabold text-lg flex items-center justify-center shadow-sm">
              03
            </div>
            <h3 className="text-xl font-bold text-emerald-950">Net Payout Range</h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Receive your estimated price per kg alongside gross revenue and true net payout after transport deductions.
            </p>
            <ul className="text-xs text-stone-500 space-y-2 pt-2 border-t border-stone-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Compare regional factory offers</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Immutable cryptographic history</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center pt-6">
          <Link
            href="/estimate"
            className="inline-flex items-center gap-2 px-10 py-4 glow-btn rounded-2xl font-extrabold text-sm shadow-glow transition-all"
          >
            <Calculator className="w-5 h-5 text-white" />
            <span>Launch Tea Leaf Valuation Console</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
