"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DAYS_OF_WEEK, SLOT_NAMES, SLOT_LABELS, getLedId, DayOfWeek, SlotName } from '@/types';
import { formatTimeDisplay, getLedDetails } from '@/lib/utils';
import { 
  Sparkles, 
  Power, 
  Layers, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2,
  Clock,
  Play
} from 'lucide-react';

export const DispenserMatrix: React.FC = () => {
  const { schedule, deviceStatus, toggleSimulatedActiveLed, settings } = useApp();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek | 'All'>('All');

  const activeLed = deviceStatus.activeLed;

  const isSlotActive = (ledId: number, day: DayOfWeek): boolean => {
    if (activeLed === ledId) return true;
    if (activeLed && activeLed >= 30 && activeLed <= 36) {
      const activeDayIdx = activeLed - 30;
      return DAYS_OF_WEEK.indexOf(day) === activeDayIdx;
    }
    return false;
  };

  const daysToShow = selectedDay === 'All' ? DAYS_OF_WEEK : [selectedDay];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Live Dispenser Matrix (28 Compartments)
              </h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300">
                4x 74HC595
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Physical mirror of your 7-day medication dispenser. Click any LED to trigger on ESP32.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeLed ? (
            <button
              onClick={() => toggleSimulatedActiveLed(null)}
              className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 animate-pulse"
            >
              <Power className="w-3.5 h-3.5" />
              Turn Off All LEDs
            </button>
          ) : (
            <button
              onClick={() => toggleSimulatedActiveLed(99)}
              className="px-3 py-1.5 rounded-xl border border-amber-400/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-semibold shadow-2xs flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Test 7-Day Sequence
            </button>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title={isCollapsed ? 'Expand Dispenser Matrix' : 'Collapse Dispenser Matrix'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="mt-4 space-y-4">
          {/* Day Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedDay('All')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedDay === 'All'
                  ? 'bg-teal-600 text-white shadow-2xs'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All 7 Days (28 LEDs)
            </button>
            {DAYS_OF_WEEK.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedDay === d
                    ? 'bg-teal-600 text-white shadow-2xs'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {d.slice(0, 3)}
              </button>
            ))}
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {daysToShow.map((day) => {
              const dayIndex = DAYS_OF_WEEK.indexOf(day);
              const isDayActive = activeLed === (30 + dayIndex);

              return (
                <div 
                  key={day}
                  className={`rounded-xl border p-3 flex flex-col justify-between transition-all ${
                    isDayActive
                      ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800 ring-1 ring-rose-400/30'
                      : 'bg-slate-50/60 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  {/* Day Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60 mb-2">
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {day.slice(0, 3)}
                    </span>
                    <button
                      onClick={() => toggleSimulatedActiveLed(isDayActive ? null : (30 + dayIndex))}
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold transition-colors ${
                        isDayActive
                          ? 'bg-rose-500 text-white'
                          : 'text-slate-400 hover:text-teal-600 dark:hover:text-teal-400'
                      }`}
                      title={`Turn on all 4 LEDs for ${day}`}
                    >
                      {isDayActive ? 'All ON' : 'Light 4'}
                    </button>
                  </div>

                  {/* 4 Compartment Slots */}
                  <div className="space-y-1.5">
                    {SLOT_NAMES.map((slot) => {
                      const ledId = getLedId(day, slot);
                      const slotKey = `${day}_${slot}`;
                      const slotData = schedule.slots[slotKey];
                      const active = isSlotActive(ledId, day);
                      const isEnabled = Boolean(slotData?.enabled);

                      return (
                        <button
                          key={slot}
                          onClick={() => toggleSimulatedActiveLed(active ? null : ledId)}
                          className={`w-full p-2 rounded-lg border text-left transition-all flex items-center justify-between ${
                            active
                              ? 'bg-rose-500 text-white border-rose-600 shadow-glow-red animate-pulse'
                              : isEnabled
                              ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-teal-400'
                              : 'bg-slate-100/60 dark:bg-slate-900/40 border-slate-200/40 dark:border-slate-800 text-slate-400 opacity-60'
                          }`}
                          title={`LED #${ledId} (${day} ${slot}): ${slotData?.medicineName || 'Disabled'}`}
                        >
                          <div className="truncate mr-1">
                            <div className="flex items-center gap-1">
                              <span className={`text-[10px] font-mono font-bold ${active ? 'text-white' : 'text-slate-400'}`}>
                                #{ledId}
                              </span>
                              <span className={`text-[11px] font-semibold truncate ${active ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                                {SLOT_LABELS[slot].label}
                              </span>
                            </div>
                            <span className={`text-[10px] block truncate ${active ? 'text-rose-100' : 'text-slate-400'}`}>
                              {isEnabled ? slotData?.medicineName : 'Empty'}
                            </span>
                          </div>

                          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            active 
                              ? 'bg-white shadow-sm' 
                              : isEnabled 
                              ? 'bg-teal-500' 
                              : 'bg-slate-300 dark:bg-slate-700'
                          }`} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Legend */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>Active Physical Alert</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-teal-500" />
                <span>Scheduled Dose</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />
                <span>Empty Slot</span>
              </span>
            </div>

            <span className="font-mono text-[10px]">
              Cascaded: 4x 74HC595 &bull; GPIO 19 (DATA), 18 (CLK), 23 (LATCH)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
