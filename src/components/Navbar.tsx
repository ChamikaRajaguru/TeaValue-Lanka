'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useI18n } from '@/lib/i18n/context';
import {
  Sprout,
  Menu,
  X,
  User,
  LogOut,
  Shield,
  ChevronDown,
  LayoutDashboard,
  FileText,
  Activity,
  Calculator,
  Building2,
} from 'lucide-react';
import { UserRecord } from '@/lib/db/client';

export const Navbar: React.FC = () => {
  const { t, language, setLanguage } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [user, setUser] = useState<UserRecord | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const syncAuth = () => {
    try {
      const cached = localStorage.getItem('teavalue_user');
      if (cached) setUser(JSON.parse(cached));
    } catch (e) {}

    fetch('/api/auth/me', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
          try {
            localStorage.setItem('teavalue_user', JSON.stringify(data.user));
          } catch (e) {}
        } else {
          setUser(null);
          try {
            localStorage.removeItem('teavalue_user');
          } catch (e) {}
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    syncAuth();

    const handleAuthChange = () => syncAuth();
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [pathname]);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    await fetch('/api/auth/logout', { method: 'POST' });
    try {
      localStorage.removeItem('teavalue_user');
    } catch (e) {}
    setUser(null);
    window.dispatchEvent(new Event('auth-change'));
    router.push('/login');
    router.refresh();
  };

  const navLinks =
    user?.role === 'admin'
      ? [{ href: '/admin', label: t.nav.admin, isAdmin: true }]
      : [
          { href: '/', label: t.nav.home },
          { href: '/estimate', label: t.nav.estimate },
          { href: '/factories', label: t.nav.factories },
          ...(user
            ? [
                { href: '/dashboard', label: t.nav.dashboard },
                { href: '/estimates', label: t.nav.history },
              ]
            : []),
        ];

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-emerald-100/90 bg-white/90 backdrop-blur-xl shadow-[0_2px_15px_-3px_rgba(6,78,59,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Futuristic Glowing Brand Logo */}
          <Link href={user?.role === 'admin' ? '/admin' : '/'} className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 border border-emerald-400/40 flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:scale-105 group-hover:shadow-emerald-600/30 transition-all">
                <Sprout className="w-6 h-6 text-white group-hover:rotate-6 transition-transform" />
              </div>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white animate-pulse" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-emerald-950 block leading-tight font-sans">
                TeaValue <span className="text-emerald-600">Lanka</span>
              </span>
              <span className="text-[10px] uppercase tracking-widest text-emerald-700 font-bold block">
                Agri-Intelligence • අමු දළු
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-emerald-50/70 border border-emerald-100">
            {navLinks.map((link) => {
              const isActive = link.isAdmin ? pathname.startsWith('/admin') : pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-white text-emerald-800 font-bold shadow-sm border border-emerald-200/70'
                      : 'text-stone-600 hover:text-emerald-900 hover:bg-white/60'
                  }`}
                >
                  {link.isAdmin && <Shield className="w-3.5 h-3.5 text-amber-600" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Controls: Language & Profile Avatar */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center bg-emerald-50/80 rounded-xl p-1 border border-emerald-200/80">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  language === 'en'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-stone-600 hover:text-emerald-900'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage('si')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  language === 'si'
                    ? 'bg-emerald-700 text-white shadow-sm'
                    : 'text-stone-600 hover:text-emerald-900'
                }`}
              >
                සිං
              </button>
            </div>

            {/* User Profile Avatar / Dropdown OR Login/Register */}
            {user ? (
              <div className="relative pl-2 border-l border-emerald-100" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 py-1.5 px-3 rounded-full bg-white border border-emerald-200 hover:border-emerald-400 hover:shadow-sm transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                    {getInitials(user.name)}
                  </div>

                  <div className="text-left hidden lg:block">
                    <span className="text-xs font-bold text-stone-900 block leading-tight max-w-[120px] truncate">
                      {user.name}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-emerald-600 block leading-none">
                      {user.role === 'admin' ? 'Admin' : 'Farmer'}
                    </span>
                  </div>

                  <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Glassmorphic Profile Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-md rounded-2xl py-2 z-50 border border-emerald-100 shadow-xl animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-emerald-100 bg-emerald-50/50">
                      <div className="font-bold text-sm text-stone-900 truncate">{user.name}</div>
                      <div className="text-xs text-stone-500 truncate">{user.email}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {user.role}
                        </span>
                        <span className="text-[11px] text-stone-500">{user.district || 'Galle'}</span>
                      </div>
                    </div>

                    <div className="py-1.5 space-y-0.5">
                      {user.role === 'admin' ? (
                        <>
                          <Link
                            href="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-amber-700 hover:bg-amber-50 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-amber-600" />
                            <span>Admin Portal Deck</span>
                          </Link>

                          <Link
                            href="/admin/prices"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
                          >
                            <Activity className="w-4 h-4 text-emerald-600" />
                            <span>Market Price Telemetry</span>
                          </Link>

                          <Link
                            href="/admin/factories"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
                          >
                            <Building2 className="w-4 h-4 text-emerald-600" />
                            <span>Factory Network</span>
                          </Link>

                          <Link
                            href="/admin/users"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
                          >
                            <User className="w-4 h-4 text-emerald-600" />
                            <span>User Management</span>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            href="/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
                          >
                            <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                            <span>Command Dashboard</span>
                          </Link>

                          <Link
                            href="/profile"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
                          >
                            <User className="w-4 h-4 text-emerald-600" />
                            <span>Estate Parameters</span>
                          </Link>

                          <Link
                            href="/estimates"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors"
                          >
                            <FileText className="w-4 h-4 text-emerald-600" />
                            <span>Historical Telemetry</span>
                          </Link>
                        </>
                      )}
                    </div>

                    <div className="border-t border-emerald-100 pt-1.5">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t.nav.logout}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-semibold text-stone-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-xl transition-colors"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-bold glow-btn rounded-xl transition-all"
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
              className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-xs font-bold rounded-lg text-emerald-800"
            >
              {language === 'en' ? 'සිං' : 'EN'}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-stone-600 hover:text-emerald-800 rounded-lg"
              aria-label="Toggle navigation"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden border-t border-emerald-100 bg-white/95 backdrop-blur-2xl px-4 pt-4 pb-8 space-y-4 shadow-xl">
          <nav className="flex flex-col space-y-1.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold ${
                  pathname === link.href
                    ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                    : 'text-stone-700 hover:bg-emerald-50/50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-emerald-100">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-emerald-50/70 rounded-xl border border-emerald-200">
                  <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-stone-900">{user.name}</div>
                    <div className="text-xs text-emerald-700 capitalize">{user.role} • {user.district || 'Galle'}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 text-center py-2 text-xs font-bold text-stone-800 bg-emerald-50 rounded-xl border border-emerald-200"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="flex-1 text-center py-2 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl"
                  >
                    {t.nav.logout}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 text-center py-2.5 text-sm font-semibold text-stone-700 bg-emerald-50 rounded-xl border border-emerald-100"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 text-center py-2.5 text-sm font-bold glow-btn rounded-xl"
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
