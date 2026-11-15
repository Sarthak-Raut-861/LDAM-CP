"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Cpu, Wifi, WifiOff, Clock, RefreshCw, Layers, ArrowRight, Sparkles, Terminal } from 'lucide-react';
import Link from 'next/link';

export const DeviceQuickStatus: React.FC = () => {
  const { deviceStatus, schedule, syncScheduleToDevice, toggleSimulatedActiveLed } = useApp();
  const [syncing, setSyncing] = useState(false);

  const isOutOfSync = schedule.version > deviceStatus.lastSyncedVersion;

  const handleSync = async () => {
    setSyncing(true);
    await syncScheduleToDevice();
    setSyncing(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              ESP32 DevKit V1
            </h2>
            <p className="text-xs text-slate-400">
              DS3231 RTC &bull; 4x 74HC595 &bull; 28 LEDs
            </p>
          </div>
        </div>

        <Link
          href="/device"
          className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1"
        >
          Inspect Device Map
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 block">Wi-Fi Connection</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5 truncate">
            {deviceStatus.isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-500 shrink-0" /> : <WifiOff className="w-3.5 h-3.5 text-rose-500 shrink-0" />}
            <span className="truncate">{deviceStatus.isOnline ? deviceStatus.wifiSSID : 'Offline'}</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 block">DS3231 RTC</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5 capitalize">
            <Clock className="w-3.5 h-3.5 text-teal-500 shrink-0" />
            <span>{deviceStatus.rtcStatus}</span>
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 block">Schedule Version</span>
          <span className={`text-xs font-bold mt-1 flex items-center gap-1 ${isOutOfSync ? 'text-amber-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
            <span>v{deviceStatus.lastSyncedVersion}</span>
            {isOutOfSync && <span className="text-[10px] font-normal">(Cloud: v{schedule.version})</span>}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
          <span className="text-[11px] text-slate-400 block">Shift Registers</span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <span>4x 74HC595 (28 LEDs)</span>
          </span>
        </div>
      </div>

      {/* Pinout info */}
      <div className="mt-3 py-2 px-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5 font-mono">
          <Terminal className="w-3.5 h-3.5 text-teal-600" />
          <span>DATA: GPIO 19 &bull; CLOCK: GPIO 18 &bull; LATCH: GPIO 23</span>
        </span>
        <span className="hidden sm:inline font-mono text-[10px] text-slate-400">
          RTC I2C: 21, 22 &bull; Button: 4 &bull; Buzzer: 2
        </span>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <button
          onClick={() => toggleSimulatedActiveLed(99)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold shadow-2xs transition-all"
          title="Run Monday to Sunday 7-day LED diagnostic sequence on ESP32"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Test 7-Day Sequence</span>
        </button>

        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-2xs transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Schedule to Device'}
        </button>
      </div>
    </div>
  );
};
