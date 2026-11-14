"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DayOfWeek, DAYS_OF_WEEK } from '@/types';
import { X, Copy, Check, ArrowRight } from 'lucide-react';

interface CopyDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSourceDay?: DayOfWeek;
}

export const CopyDayModal: React.FC<CopyDayModalProps> = ({ 
  isOpen, 
  onClose, 
  initialSourceDay = 'Monday' 
}) => {
  const { copyDaySchedule } = useApp();
  const [sourceDay, setSourceDay] = useState<DayOfWeek>(initialSourceDay);
  const [targetDays, setTargetDays] = useState<DayOfWeek[]>([]);

  if (!isOpen) return null;

  const toggleTarget = (day: DayOfWeek) => {
    if (day === sourceDay) return;
    if (targetDays.includes(day)) {
      setTargetDays(targetDays.filter(d => d !== day));
    } else {
      setTargetDays([...targetDays, day]);
    }
  };

  const selectAllWeekdays = () => {
    const weekdays: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    setTargetDays(weekdays.filter(d => d !== sourceDay));
  };

  const selectAllDays = () => {
    setTargetDays(DAYS_OF_WEEK.filter(d => d !== sourceDay));
  };

  const handleCopy = () => {
    if (targetDays.length === 0) return;
    copyDaySchedule(sourceDay, targetDays);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Copy className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Replicate Schedule Across Days
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Copies all 4 slots (LED IDs remapped automatically)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Source Day to Copy From:
            </label>
            <select
              value={sourceDay}
              onChange={(e) => {
                const newSource = e.target.value as DayOfWeek;
                setSourceDay(newSource);
                setTargetDays(targetDays.filter(d => d !== newSource));
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 font-semibold"
            >
              {DAYS_OF_WEEK.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Destination Days:
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={selectAllWeekdays}
                  className="text-teal-600 dark:text-teal-400 font-medium hover:underline"
                >
                  All Weekdays
                </button>
                <span>&bull;</span>
                <button
                  type="button"
                  onClick={selectAllDays}
                  className="text-teal-600 dark:text-teal-400 font-medium hover:underline"
                >
                  All Days
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const isSource = day === sourceDay;
                const isSelected = targetDays.includes(day);

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={isSource}
                    onClick={() => toggleTarget(day)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all ${
                      isSource
                        ? 'opacity-40 bg-slate-100 dark:bg-slate-800 border-slate-200 cursor-not-allowed text-slate-400'
                        : isSelected
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-800 dark:text-teal-200'
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span>{day}</span>
                    {isSelected && <Check className="w-4 h-4 text-teal-600" />}
                    {isSource && <span className="text-[10px] text-slate-400">(Source)</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={targetDays.length === 0}
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-teal-500/20"
          >
            <Copy className="w-4 h-4" />
            Apply to {targetDays.length} {targetDays.length === 1 ? 'Day' : 'Days'}
          </button>
        </div>
      </div>
    </div>
  );
};

