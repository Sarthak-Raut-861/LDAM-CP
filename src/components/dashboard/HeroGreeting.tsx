"use client";

import React from 'react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Clock, Cpu, Power, CheckCircle2, Play, AlertCircle } from 'lucide-react';
import { formatTimeDisplay, getLedDetails } from '@/lib/utils';
import Link from 'next/link';

export const HeroGreeting: React.FC = () => {
  const { user } = useAuth();
  const { currentTime, todayDay, schedule, deviceStatus, toggleSimulatedActiveLed, settings } = useApp();

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const currentTotalMins = currentHour * 60 + currentMinute;

  const todaySlots = ['morning', 'noon', 'evening', 'night']
    .map(slot => {
      const slotData = schedule.slots[`${todayDay}_${slot}`];
      if (!slotData || !slotData.enabled) return null;
      const [h, m] = slotData.reminderTime.split(':').map(Number);
      return {
        ...slotData,
        totalMins: h * 60 + m,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a!.totalMins - b!.totalMins);

  const nextSlot = todaySlots.find(s => s!.totalMins >= currentTotalMins) || todaySlots[0];
  const greetingTime = currentHour < 12 ? 'Good morning' : currentHour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.displayName ? user.displayName.split(' ')[0] : 'Patient';

  // Details if an LED is active
  const activeDetails = deviceStatus.activeLed 
    ? {
        ledId: deviceStatus.activeLed,
        sr: Math.floor((deviceStatus.activeLed - 1) / 8) + 1,
        pin: (deviceStatus.activeLed - 1) % 8,
      }
    : null;

  return (
    <div className="space-y-4">
      {/* Top Greeting & Next Slot Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <span>{todayDay}, {currentTime.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span>&bull;</span>
            <span className="font-mono text-slate-600 dark:text-slate-300 font-medium">
              RTC: {formatTimeDisplay(
                `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`,
                settings.timeFormat
              )}
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {greetingTime}, {firstName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            28-LED Smart Dispenser &bull; DS3231 Real-Time Clock &bull; 4x 74HC595
          </p>
        </div>

        {/* Next Slot pill */}
        {nextSlot ? (
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              #{nextSlot.ledId}
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-medium block">
                Next: {nextSlot.dayOfWeek} {nextSlot.slot}
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {nextSlot.medicineName} ({formatTimeDisplay(nextSlot.reminderTime, settings.timeFormat)})
              </span>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>No upcoming slots today</span>
          </div>
        )}
      </div>

      {/* ESP32 Interactive Demo Bar */}
      <div className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        activeDetails
          ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700 shadow-glow-red ring-1 ring-rose-400/40'
          : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-xs'
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            activeDetails ? 'bg-rose-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }`}>
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                ESP32 Hardware Simulation
              </span>
              {activeDetails ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
                  LED #{activeDetails.ledId} ACTIVE
                </span>
              ) : (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  Ready
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {activeDetails
                ? `Physical Output: Shift Register #${activeDetails.sr}, Bit Q${activeDetails.pin} is HIGH.`
                : 'Click "Turn ON" on any slot below to simulate lighting that dispenser LED.'}
            </p>
          </div>
        </div>

        {/* Demo action buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {activeDetails ? (
            <button
              onClick={() => toggleSimulatedActiveLed(null)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-xs font-bold shadow-xs hover:opacity-90 flex items-center gap-1.5"
            >
              <Power className="w-3.5 h-3.5" />
              Turn Off LED #{activeDetails.ledId}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px] mr-1 hidden md:inline">Quick Test:</span>
              {todaySlots.slice(0, 3).map((slot) => (
                <button
                  key={slot!.ledId}
                  onClick={() => toggleSimulatedActiveLed(slot!.ledId)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors flex items-center gap-1"
                >
                  <Play className="w-3 h-3 text-teal-600" />
                  LED #{slot!.ledId} ({slot!.slot})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
