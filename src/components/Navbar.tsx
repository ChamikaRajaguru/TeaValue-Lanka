'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import { Sprout, Globe, Menu, X, User, LogOut, Shield } from 'lucide-react';
import { UserRecord } from '@/lib/db/client';

export const Navbar: React.FC = () => {
  const { t, language, setLanguage } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<UserRecord | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  const navLinks = [
    { href: '/', label: t.nav.home },
    { href: '/estimate', label: t.nav.estimate },
    { href: '/factories', label: t.nav.factories },
    ...(user
      ? [
          { href: '/dashboard', label: t.nav.dashboard },
          { href: '/estimates', label: t.nav.history },
        ]
      : []),
    ...(user?.role === 'admin' ? [{ href: '/admin', label: t.nav.admin, isAdmin: true }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-cream-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-tea-800 text-tea-100 flex items-center justify-center shadow-md group-hover:bg-tea-900 transition-colors">
              <Sprout className="w-6 h-6 text-leaf-400" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-tea-900 block leading-tight">
                {t.appName}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-tea-600 font-semibold block">
                Green Leaf Valuation
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-tea-50 text-tea-800 font-semibold border border-tea-200'
                      : 'text-stone-600 hover:text-tea-900 hover:bg-cream-100'
                  }`}
                >
                  {link.isAdmin && <Shield className="w-3.5 h-3.5 text-amber-600" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Language Switcher & Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-cream-100 rounded-lg p-0.5 border border-cream-300">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  language === 'en'
                    ? 'bg-tea-800 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Switch to English"
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('si')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all ${
                  language === 'si'
                    ? 'bg-tea-800 text-white shadow-sm'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="සිංහල භාෂාවට මාරු වන්න"
              >
                සිං
              </button>
            </div>

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-cream-200">
                <Link
                  href="/profile"
                  className="flex items-center gap-1.5 text-xs font-medium text-tea-900 bg-tea-50 hover:bg-tea-100 border border-tea-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-tea-700" />
                  <span className="max-w-[120px] truncate">{user.name}</span>
                  {user.role === 'admin' && (
                    <span className="ml-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.2 rounded">
                      Admin
                    </span>
                  )}
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-stone-500 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                  title={t.nav.logout}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 text-xs font-medium text-tea-900 hover:bg-cream-100 rounded-lg transition-colors"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-tea-800 hover:bg-tea-900 rounded-lg shadow-sm transition-colors"
                >
                  {t.nav.register}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setLanguage(language === 'en' ? 'si' : 'en')}
              className="px-2 py-1 bg-cream-100 border border-cream-300 text-xs font-bold rounded text-tea-900"
            >
              {language === 'en' ? 'සිං' : 'EN'}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-stone-600 hover:text-tea-900 hover:bg-cream-100 rounded-lg"
              aria-label="Toggle navigation"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-cream-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                  pathname === link.href
                    ? 'bg-tea-50 text-tea-800 font-semibold'
                    : 'text-stone-700 hover:bg-cream-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-cream-200">
            {user ? (
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium text-stone-900">
                  {user.name} ({user.role})
                </div>
                <button
                  onClick={handleLogout}
                  className="text-xs text-red-600 font-semibold hover:underline"
                >
                  {t.nav.logout}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-medium text-tea-900 bg-cream-100 rounded-lg"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 text-center py-2 text-sm font-semibold text-white bg-tea-800 rounded-lg"
                >
                  {t.nav.register}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
