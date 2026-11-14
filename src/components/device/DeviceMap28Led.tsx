"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DAYS_OF_WEEK, SLOT_NAMES, SlotName, DayOfWeek, getLedId, SLOT_LABELS } from '@/types';
import { getLedDetails, formatTimeDisplay } from '@/lib/utils';
import { calculateShiftRegisterBytes } from '@/services/esp32Contract';
import { 
  Layers, 
  Cpu, 
  Power, 
  Clock, 
  CheckCircle2, 
  Play, 
  RotateCcw,
  Sparkles,
  Zap
} from 'lucide-react';

export const DeviceMap28Led: React.FC = () => {
  const { schedule, deviceStatus, toggleSimulatedActiveLed, settings, reminders } = useApp();

  const activeLed = deviceStatus.activeLed;
  const shiftBytes = calculateShiftRegisterBytes(activeLed);

  const activeLedInfo = activeLed
    ? {
        ledId: activeLed,
        shiftRegister: Math.floor((activeLed - 1) / 8) + 1,
        pinIndex: (activeLed - 1) % 8,
      }
    : null;

  return (
    <div className="space-y-6">
      {/* Interactive ESP32 DevKit V1 Live Hardware Board */}
      <div className="bg-slate-950 text-white rounded-3xl border border-slate-800 p-5 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Glow backdrop */}
        {activeLed && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        )}

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center border border-teal-500/30">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  ESP32 DevKit V1 Hardware Board
                  {activeLed ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                      LED #{activeLed} ACTIVE
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      Standby (All Low)
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-slate-400">
                  4x 74HC595 Cascaded Shift Registers &bull; DS3231 RTC
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {activeLed ? (
                <button
                  type="button"
                  onClick={() => toggleSimulatedActiveLed(null)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Power className="w-3.5 h-3.5" />
                  Turn Off LED #{activeLed}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => toggleSimulatedActiveLed(1)}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" />
                  Test LED #1
                </button>
              )}
            </div>
          </div>

          {/* Graphical Board Layout */}
          <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* MCU Box */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between min-h-[120px]">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">ESP32-WROOM-32</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm" title="3.3V Power ON" />
              </div>

              <div className="my-2">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Microcontroller</div>
                <div className="font-mono font-bold text-sm text-teal-400">ESP32 DevKit V1</div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                <span>GPIO 23 (DATA)</span>
                <span className={activeLed ? 'text-teal-400 font-bold' : 'text-slate-600'}>
                  {activeLed ? 'SIGNAL HIGH' : 'LOW'}
                </span>
              </div>
            </div>

            {/* 4 Shift Registers visual */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between min-h-[120px]">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono">Cascaded Bus</span>
                <span className="font-mono text-[10px] text-teal-400">32-Bit Serial</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5 my-2">
                {[1, 2, 3, 4].map(regIdx => {
                  const isRegActive = activeLedInfo?.shiftRegister === regIdx;
                  return (
                    <div
                      key={regIdx}
                      className={`p-1.5 rounded-lg border text-center transition-all ${
                        isRegActive
                          ? 'bg-rose-950/80 border-rose-500 text-rose-300 font-bold shadow-glow-red'
                          : 'bg-slate-800/60 border-slate-700/60 text-slate-400 text-[10px]'
                      }`}
                    >
                      <div className="text-[9px]">SR#{regIdx}</div>
                      <div className="font-mono text-[10px]">74HC595</div>
                    </div>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-400 font-mono pt-1">
                {activeLedInfo ? (
                  <span className="text-amber-400 font-bold">
                    SR #{activeLedInfo.shiftRegister} &bull; Output Pin Q{activeLedInfo.pinIndex} (HIGH)
                  </span>
                ) : (
                  <span>All Shift Register Bits = 0</span>
                )}
              </div>
            </div>

            {/* Active LED Target Visualizer */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between min-h-[120px] text-center">
              <div className="text-xs text-slate-400 text-left font-mono">
                Dispenser Indicator
              </div>

              <div className="my-2 flex flex-col items-center justify-center">
                <div
                  className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                    activeLed
                      ? 'bg-rose-500 border-rose-300 shadow-glow-red animate-led-blink'
                      : 'bg-slate-800 border-slate-700 text-slate-600'
                  }`}
                >
                  <Power className={`w-5 h-5 ${activeLed ? 'text-white' : 'text-slate-600'}`} />
                </div>
                <span className="font-mono text-xs font-bold mt-1.5 text-white">
                  {activeLed ? `Physical LED #${activeLed} ON` : 'All LEDs Standby'}
                </span>
              </div>

              <div className="text-[10px] text-slate-500">
                Click any slot in the 28-LED matrix below to toggle
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 28-LED Dispenser Pillbox Grid (7 Days x 4 Slots) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              28-LED Dispenser Pillbox (Click to Turn ON/OFF)
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Monday LEDs 1&ndash;4 &bull; Tuesday 5&ndash;8 &bull; Wednesday 9&ndash;12 &bull; Thursday 13&ndash;16 &bull; Friday 17&ndash;20 &bull; Saturday 21&ndash;24 &bull; Sunday 25&ndash;28
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-glow-red animate-pulse" />
              Active LED
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              Configured
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700" />
              Off
            </span>
          </div>
        </div>

        {/* 28-Slot Responsive Table */}
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[680px]">
            {/* Column Headers (Days) */}
            <div className="grid grid-cols-8 gap-2 mb-2 text-center text-xs font-bold text-slate-400">
              <div className="p-1">Slot</div>
              {DAYS_OF_WEEK.map(d => (
                <div key={d} className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {d.slice(0, 3)}
                </div>
              ))}
            </div>

            {/* 4 Rows */}
            {SLOT_NAMES.map(slot => {
              const meta = SLOT_LABELS[slot];

              return (
                <div key={slot} className="grid grid-cols-8 gap-2 mb-2 items-center">
                  {/* Slot Label */}
                  <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs font-bold text-slate-700 dark:text-slate-300 capitalize text-left">
                    {meta.label}
                  </div>

                  {/* 7 Days in this slot */}
                  {DAYS_OF_WEEK.map(day => {
                    const ledId = getLedId(day, slot);
                    const slotKey = `${day}_${slot}`;
                    const slotData = schedule.slots[slotKey];
                    const isEnabled = Boolean(slotData?.enabled);
                    const isLit = activeLed === ledId;

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleSimulatedActiveLed(isLit ? null : ledId)}
                        className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-between min-h-[72px] ${
                          isLit
                            ? 'bg-rose-50 dark:bg-rose-950/80 border-rose-500 shadow-glow-red ring-2 ring-rose-400 scale-102 z-10'
                            : isEnabled
                            ? 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-teal-400 hover:shadow-xs'
                            : 'bg-slate-50/40 dark:bg-slate-900 border-slate-100 dark:border-slate-800 opacity-60'
                        }`}
                        title={`Click to turn ${isLit ? 'OFF' : 'ON'} LED #${ledId} (${day} ${slot})`}
                      >
                        {/* LED Dot Indicator */}
                        <div
                          className={`w-3.5 h-3.5 rounded-full border transition-all ${
                            isLit
                              ? 'bg-rose-500 border-rose-300 shadow-glow-red animate-led-blink'
                              : isEnabled
                              ? 'bg-teal-500 border-teal-300'
                              : 'bg-slate-300 dark:bg-slate-700 border-slate-400'
                          }`}
                        />

                        {/* LED ID */}
                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">
                          #{ledId}
                        </span>

                        <span className="text-[9px] text-slate-400 truncate w-full block">
                          {isLit ? 'ON' : isEnabled ? slotData?.reminderTime : 'Off'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
