"use client";

import React from 'react';
import { ShieldAlert, HeartPulse } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-white/[0.06] bg-slate-950/70 backdrop-blur-xl py-5 px-4 md:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px]">
        <div className="flex items-center gap-1.5 text-slate-400">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400/80 shrink-0" />
          <span>Clinical Notice: Online acknowledgement confirms dose logging, not biological ingestion.</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <HeartPulse className="w-3.5 h-3.5 text-teal-400" />
          <span>MediGlow IoT &bull; ESP32 DevKit V1 &bull; 4x 74HC595 &bull; DS3231 RTC</span>
        </div>
      </div>
    </footer>
  );
};
