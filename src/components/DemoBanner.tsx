'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n/context';
import { AlertTriangle } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="bg-amberGold-600 text-amberGold-50 px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-center gap-2 shadow-inner">
      <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0" />
      <span>{t.demoBadge}</span>
    </div>
  );
};
