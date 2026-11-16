"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { SLOT_NAMES, SlotName, getLedId, SLOT_LABELS } from '@/types';
import { formatTimeDisplay, getLedDetails } from '@/lib/utils';
import { 
  Sunrise, 
  Sun, 
  Sunset, 
  Moon, 
  Clock, 
  Power,
  ExternalLink,
  CheckCircle2,
  Play,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export const TodaySlotsCard: React.FC = () => {
  const { todayDay, schedule, reminders, acknowledgeReminder, deviceStatus, toggleSimulatedActiveLed, settings } = useApp();

  const getSlotIcon = (slot: SlotName) => {
    switch (slot) {
      case 'morning': return <Sunrise className="w-4 h-4 text-amber-500" />;
      case 'noon': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'evening': return <Sunset className="w-4 h-4 text-orange-500" />;
      case 'night': return <Moon className="w-4 h-4 text-indigo-500" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Today&apos;s Medication Slots &bull; {todayDay}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            4 Compartments &bull; LEDs #{getLedId(todayDay, 'morning')} &ndash; #{getLedId(todayDay, 'night')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const dayIdx = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(todayDay);
              const targetCode = 30 + dayIdx;
              toggleSimulatedActiveLed(deviceStatus.activeLed === targetCode ? null : targetCode);
            }}
            className={`text-xs px-3 py-1.5 rounded-xl border font-semibold flex items-center gap-1.5 transition-all ${
              deviceStatus.activeLed === (30 + ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(todayDay))
                ? 'bg-rose-500/10 border-rose-500/40 text-rose-500 shadow-2xs'
                : 'border-amber-400/40 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 shadow-2xs'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            {deviceStatus.activeLed === (30 + ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(todayDay))
              ? 'Turn Off All 4'
              : `Light All 4 (${todayDay.slice(0, 3)})`}
          </button>

          <Link
            href="/schedule"
            className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1"
          >
            7-Day Schedule
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
        {SLOT_NAMES.map((slot) => {
          const slotKey = `${todayDay}_${slot}`;
          const slotData = schedule.slots[slotKey];
          const ledId = getLedId(todayDay, slot);
          const hardware = getLedDetails(todayDay, slot);
          const meta = SLOT_LABELS[slot];

          const todayDateStr = new Date().toISOString().split('T')[0];
          const matchingReminder = reminders.find(
            r => r.dayOfWeek === todayDay && r.slot === slot && (r.date === todayDateStr || !r.date)
          );

          const activeLeds = deviceStatus.activeLeds || (deviceStatus.activeLed ? [deviceStatus.activeLed] : []);
          const isLedActive = activeLeds.includes(ledId);
          const isEnabled = Boolean(slotData?.enabled);
          const isAcknowledged = matchingReminder?.status === 'acknowledged';

          return (
            <div
              key={slot}
              className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                isLedActive
                  ? 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-400 shadow-glow-red ring-2 ring-rose-400/40'
                  : isEnabled
                  ? 'bg-white dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/80 hover:border-slate-300'
                  : 'bg-slate-50/40 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800 opacity-60'
              }`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                    {getSlotIcon(slot)}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-slate-800 dark:text-slate-200 capitalize">
                      {meta.label}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      LED #{ledId}
                    </span>
                  </div>
                </div>

                {/* Status Dot */}
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isLedActive
                        ? 'bg-rose-500 shadow-glow-red animate-ping'
                        : isAcknowledged
                        ? 'bg-emerald-500'
                        : isEnabled
                        ? 'bg-teal-500'
                        : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  />
                  <span className="text-[10px] text-slate-400 capitalize">
                    {isLedActive ? 'Flashing' : isAcknowledged ? 'Ack' : isEnabled ? 'Active' : 'Off'}
                  </span>
                </div>
              </div>

              {/* Slot Details */}
              <div className="my-3 min-h-[50px]">
                {isEnabled ? (
                  <>
                    <div className="text-xs font-mono text-slate-400 flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeDisplay(slotData?.reminderTime || '08:00', settings.timeFormat)}</span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white text-xs truncate">
                      {slotData?.medicineName || 'Medication'}
                    </p>
                    <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                      {slotData?.dosage || 'Dose'}
                    </p>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-[11px] text-slate-400 italic">Slot disabled</p>
                  </div>
                )}
              </div>

              {/* Action Buttons: Direct "Turn ON LED" Hardware Trigger */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleSimulatedActiveLed(ledId)}
                  className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    isLedActive
                      ? 'bg-rose-600 text-white shadow-sm hover:bg-rose-700 animate-pulse'
                      : 'bg-slate-100 hover:bg-teal-50 hover:text-teal-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                  title={`Simulate ESP32 activating LED #${ledId}`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{isLedActive ? 'Turn OFF' : 'Turn ON LED'}</span>
                </button>

                {isEnabled && matchingReminder && !isAcknowledged && (
                  <button
                    onClick={() => acknowledgeReminder(matchingReminder.id)}
                    className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 transition-colors"
                    title="Acknowledge Reminder"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
