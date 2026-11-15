"use client";

import React from 'react';
import { ShieldAlert, HeartPulse } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-100 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 py-4 px-4 md:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span>Patient Notice: Online acknowledgement does not prove physical medicine ingestion.</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <HeartPulse className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>MediGlow IoT &bull; ESP32 &bull; 4x 74HC595 &bull; DS3231 RTC</span>
        </div>
      </div>
    </footer>
  );
};
