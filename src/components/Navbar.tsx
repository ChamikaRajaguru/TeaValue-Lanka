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
  Settings,
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

  // Sync auth state from localStorage and /api/auth/me
  const syncAuth = () => {
    // Immediate fallback from localStorage
    try {
      const cached = localStorage.getItem('teavalue_user');
      if (cached) {
        setUser(JSON.parse(cached));
      }
    } catch (e) {}

    // Authoritative check from server
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

    // Listen for custom auth events
    const handleAuthChange = () => syncAuth();
    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    // Click outside to close dropdown
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

  // User initials for avatar
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

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
              <span className="text-xl font-bold tracking-tight text-tea-950 block leading-tight">
                {t.appName}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-tea-700 font-bold block">
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
                      ? 'bg-tea-50 text-tea-900 font-semibold border border-tea-200'
                      : 'text-stone-600 hover:text-tea-900 hover:bg-cream-100'
                  }`}
                >
                  {link.isAdmin && <Shield className="w-3.5 h-3.5 text-amber-600" />}
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Controls */}
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

            {/* User Profile Avatar / Dropdown OR Login/Register */}
            {user ? (
              <div className="relative pl-2 border-l border-cream-200" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 py-1.5 px-2.5 rounded-full bg-cream-100 hover:bg-cream-200 border border-cream-300 transition-colors focus:ring-2 focus:ring-tea-600"
                >
                  {/* Avatar circle */}
                  <div className="w-8 h-8 rounded-full bg-tea-800 text-leaf-300 font-bold text-xs flex items-center justify-center shadow-inner">
                    {getInitials(user.name)}
                  </div>

                  <div className="text-left hidden lg:block">
                    <span className="text-xs font-bold text-tea-950 block leading-tight max-w-[110px] truncate">
                      {user.name}
                    </span>
                    <span className="text-[10px] uppercase font-semibold text-tea-700 block leading-none">
                      {user.role === 'admin' ? 'Administrator' : 'Farmer'}
                    </span>
                  </div>

                  <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform ${userDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-cream-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-3 border-b border-cream-200 bg-cream-50/50">
                      <div className="font-bold text-sm text-tea-950 truncate">{user.name}</div>
                      <div className="text-xs text-stone-500 truncate">{user.email}</div>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-tea-100 text-tea-800">
                          {user.role}
                        </span>
                        <span className="text-[11px] text-stone-500">{user.district || 'Galle'}</span>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-cream-100 hover:text-tea-900 transition-colors"
                      >
                        <User className="w-4 h-4 text-tea-700" />
                        <span>Estate Profile</span>
                      </Link>

                      <Link
                        href="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-cream-100 hover:text-tea-900 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-tea-700" />
                        <span>My Dashboard</span>
                      </Link>

                      <Link
                        href="/estimates"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-stone-700 hover:bg-cream-100 hover:text-tea-900 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-tea-700" />
                        <span>Saved Estimates</span>
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          href="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-amber-800 bg-amber-50/50 hover:bg-amber-100/70 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-amber-700" />
                          <span>Admin Control Portal</span>
                        </Link>
                      )}
                    </div>

                    <div className="border-t border-cream-200 pt-1">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors text-left"
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
                  className="px-3 py-1.5 text-xs font-medium text-tea-900 hover:bg-cream-100 rounded-lg transition-colors"
                >
                  {t.nav.login}
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-tea-800 hover:bg-tea-900 rounded-lg shadow-sm transition-colors"
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
                    ? 'bg-tea-50 text-tea-900 font-semibold'
                    : 'text-stone-700 hover:bg-cream-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-cream-200">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-cream-50 rounded-xl border border-cream-200">
                  <div className="w-9 h-9 rounded-full bg-tea-800 text-leaf-300 font-bold text-xs flex items-center justify-center">
                    {getInitials(user.name)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-tea-950">{user.name}</div>
                    <div className="text-xs text-stone-500 capitalize">{user.role} • {user.district || 'Galle'}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Link
                    href="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 text-center py-2 text-xs font-semibold text-tea-900 bg-cream-100 rounded-lg"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    className="flex-1 text-center py-2 text-xs font-semibold text-red-600 bg-red-50 rounded-lg"
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
