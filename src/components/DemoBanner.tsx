'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { AlertTriangle, Sparkles } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="w-full bg-amber-50/90 border-b border-amber-200 backdrop-blur-md px-4 py-1.5 text-center text-xs font-semibold text-amber-900 flex items-center justify-center gap-2">
      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
      <span className="tracking-wide">{t.demoBadge}</span>
    </div>
  );
};
