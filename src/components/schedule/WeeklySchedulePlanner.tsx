"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  DayOfWeek, 
  SlotName, 
  DAYS_OF_WEEK, 
  SLOT_NAMES, 
  SLOT_LABELS, 
  getLedId 
} from '@/types';
import { formatTimeDisplay, getLedDetails } from '@/lib/utils';
import { 
  CalendarDays, 
  Copy, 
  SlidersHorizontal, 
  RefreshCw, 
  Clock, 
  Edit3, 
  CheckCircle2, 
  Sunrise, 
  Sun, 
  Sunset, 
  Moon,
  Info,
  Layers,
  Power
} from 'lucide-react';
import { SlotEditModal } from './SlotEditModal';
import { CopyDayModal } from './CopyDayModal';
import { BulkConfigureModal } from './BulkConfigureModal';

export const WeeklySchedulePlanner: React.FC = () => {
  const { schedule, updateScheduleSlot, syncScheduleToDevice, deviceStatus, toggleSimulatedActiveLed, settings } = useApp();

  const [activeDayFilter, setActiveDayFilter] = useState<'All' | DayOfWeek>('All');
  const [editingSlot, setEditingSlot] = useState<{ day: DayOfWeek; slot: SlotName } | null>(null);
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [copySourceDay, setCopySourceDay] = useState<DayOfWeek>('Monday');
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const getSlotIcon = (slot: SlotName) => {
    switch (slot) {
      case 'morning': return <Sunrise className="w-4 h-4 text-amber-500" />;
      case 'noon': return <Sun className="w-4 h-4 text-yellow-500" />;
      case 'evening': return <Sunset className="w-4 h-4 text-orange-500" />;
      case 'night': return <Moon className="w-4 h-4 text-indigo-500" />;
    }
  };

  const handleToggleEnabled = (day: DayOfWeek, slot: SlotName, currentVal: boolean) => {
    updateScheduleSlot(day, slot, { enabled: !currentVal });
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await syncScheduleToDevice();
    setIsSyncing(false);
  };

  const daysToRender = activeDayFilter === 'All' ? DAYS_OF_WEEK : [activeDayFilter];

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Weekly 28-Slot Schedule Planner
            </h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              v{schedule.version}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure 7 days &times; 4 compartment slots. Directly mapped to 28 LEDs across four 74HC595 shift registers.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setCopySourceDay(activeDayFilter === 'All' ? 'Monday' : activeDayFilter);
              setCopyModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Copy className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            Replicate Day
          </button>

          <button
            onClick={() => setBulkModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            Bulk Configure
          </button>

          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Writing ESP32 Flash...' : 'Sync to Device'}
          </button>
        </div>
      </div>

      {/* Day Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200/80 dark:border-slate-800">
        <button
          onClick={() => setActiveDayFilter('All')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeDayFilter === 'All'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All 7 Days (28 Slots)
        </button>

        {DAYS_OF_WEEK.map((day) => {
          const isActive = activeDayFilter === day;
          return (
            <button
              key={day}
              onClick={() => setActiveDayFilter(day)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* 28-Slot Planner Grid */}
      <div className="space-y-6">
        {daysToRender.map((day) => {
          return (
            <div 
              key={day} 
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-800 dark:text-slate-200">
                    {day.slice(0, 3)}
                  </div>
                  <div>
                    <h2 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                      {day}
                    </h2>
                    <p className="text-[11px] text-slate-400">
                      LEDs #{getLedId(day, 'morning')} &mdash; #{getLedId(day, 'night')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const dayIdx = DAYS_OF_WEEK.indexOf(day);
                      const targetCode = 30 + dayIdx;
                      toggleSimulatedActiveLed(deviceStatus.activeLed === targetCode ? null : targetCode);
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border font-semibold flex items-center gap-1 transition-all ${
                      deviceStatus.activeLed === (30 + DAYS_OF_WEEK.indexOf(day))
                        ? 'bg-rose-500/10 border-rose-500/40 text-rose-500'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Layers className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                    {deviceStatus.activeLed === (30 + DAYS_OF_WEEK.indexOf(day)) ? 'Turn Off' : 'Light All 4'}
                  </button>

                  <button
                    onClick={() => {
                      setCopySourceDay(day);
                      setCopyModalOpen(true);
                    }}
                    className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    Copy {day.slice(0, 3)} to...
                  </button>
                </div>
              </div>

              {/* 4 Slots for this day */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
                {SLOT_NAMES.map((slot) => {
                  const slotKey = `${day}_${slot}`;
                  const slotData = schedule.slots[slotKey];
                  const ledId = getLedId(day, slot);
                  const hardware = getLedDetails(day, slot);
                  const isEnabled = Boolean(slotData?.enabled);
                  const isLedActiveOnDevice = deviceStatus.activeLed === ledId;
                  const meta = SLOT_LABELS[slot];

                  return (
                    <div
                      key={slot}
                      className={`relative rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                        isLedActiveOnDevice
                          ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-400 dark:border-rose-700 shadow-glow-red ring-2 ring-rose-500/40'
                          : isEnabled
                          ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-teal-400'
                          : 'bg-slate-50/20 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 opacity-60'
                      }`}
                    >
                      {/* Top Header inside Slot */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="p-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                            {getSlotIcon(slot)}
                          </span>
                          <div>
                            <span className="font-bold text-xs capitalize text-slate-800 dark:text-slate-200">
                              {meta.label}
                            </span>
                            <span className="block text-[10px] text-slate-400 font-mono">
                              LED #{ledId}
                            </span>
                          </div>
                        </div>

                        {/* Inline enable toggle */}
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isEnabled}
                            onChange={() => handleToggleEnabled(day, slot, isEnabled)}
                            className="sr-only peer"
                          />
                          <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all dark:border-slate-600 peer-checked:bg-teal-600"></div>
                        </label>
                      </div>

                      {/* Middle Details */}
                      <div className="my-3 min-h-[55px]">
                        {isEnabled ? (
                          <>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-1">
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span className="font-mono font-bold text-slate-900 dark:text-white">
                                {formatTimeDisplay(slotData?.reminderTime || '08:00', settings.timeFormat)}
                              </span>
                            </div>
                            <p className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">
                              {slotData?.medicineName || 'Medication Configured'}
                            </p>
                            <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">
                              {slotData?.dosage || 'Standard Dose'}
                            </p>
                          </>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <span className="text-[11px] text-slate-400 italic">Disabled</span>
                          </div>
                        )}
                      </div>

                      {/* Footer: Hardware Pin Info & Edit Button */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] gap-2">
                        <button
                          type="button"
                          onClick={() => toggleSimulatedActiveLed(isLedActiveOnDevice ? null : ledId)}
                          className={`px-2 py-1 rounded-lg font-bold transition-all flex items-center gap-1 ${
                            isLedActiveOnDevice
                              ? 'bg-rose-500 text-white shadow-xs animate-pulse'
                              : 'bg-slate-100 hover:bg-teal-50 hover:text-teal-700 dark:bg-slate-800 dark:text-slate-300 text-slate-700'
                          }`}
                          title="Simulate ESP32 activating this LED"
                        >
                          <Power className="w-3 h-3" />
                          <span>{isLedActiveOnDevice ? 'LED ON' : 'Turn ON'}</span>
                        </button>

                        <button
                          onClick={() => setEditingSlot({ day, slot })}
                          className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-bold hover:underline"
                        >
                          <Edit3 className="w-3 h-3" />
                          Edit
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Slot Modal */}
      {editingSlot && (
        <SlotEditModal
          day={editingSlot.day}
          slot={editingSlot.slot}
          isOpen={Boolean(editingSlot)}
          onClose={() => setEditingSlot(null)}
        />
      )}

      {/* Replicate Schedule Modal */}
      <CopyDayModal
        isOpen={copyModalOpen}
        onClose={() => setCopyModalOpen(false)}
        initialSourceDay={copySourceDay}
      />

      {/* Bulk Configure Modal */}
      <BulkConfigureModal
        isOpen={bulkModalOpen}
        onClose={() => setBulkModalOpen(false)}
      />
    </div>
  );
};

