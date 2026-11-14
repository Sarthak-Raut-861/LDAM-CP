"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { DayOfWeek, SlotName, DAYS_OF_WEEK, SLOT_NAMES, SLOT_LABELS } from '@/types';
import { X, Check, SlidersHorizontal, Pill, Clock, CheckCircle2 } from 'lucide-react';

interface BulkConfigureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BulkConfigureModal: React.FC<BulkConfigureModalProps> = ({ isOpen, onClose }) => {
  const { bulkConfigureSchedule, medicines } = useApp();

  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [selectedSlots, setSelectedSlots] = useState<SlotName[]>(['morning']);
  const [enabled, setEnabled] = useState(true);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [selectedMedId, setSelectedMedId] = useState('');
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');

  if (!isOpen) return null;

  const toggleDay = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter(d => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const toggleSlot = (slot: SlotName) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const handleMedSelect = (medId: string) => {
    setSelectedMedId(medId);
    const m = medicines.find(item => item.id === medId);
    if (m) {
      setMedicineName(m.name);
      setDosage(m.dosage);
      setInstructions(m.instructions);
    }
  };

  const totalAffectedSlots = selectedDays.length * selectedSlots.length;

  const handleApply = () => {
    if (totalAffectedSlots === 0) return;
    bulkConfigureSchedule(selectedDays, selectedSlots, {
      enabled,
      reminderTime: enabled ? reminderTime : undefined,
      medicineId: enabled ? selectedMedId || undefined : undefined,
      medicineName: enabled ? medicineName : undefined,
      dosage: enabled ? dosage : undefined,
      instructions: enabled ? instructions : undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Bulk Configure Schedule
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Update multiple day slots and hardware LEDs simultaneously
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

        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Target Days Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                1. Select Days ({selectedDays.length} of 7):
              </label>
              <div className="flex items-center gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setSelectedDays(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])}
                  className="text-teal-600 dark:text-teal-400 font-medium hover:underline"
                >
                  Weekdays
                </button>
                <span>&bull;</span>
                <button
                  type="button"
                  onClick={() => setSelectedDays(['Saturday', 'Sunday'])}
                  className="text-teal-600 dark:text-teal-400 font-medium hover:underline"
                >
                  Weekends
                </button>
                <span>&bull;</span>
                <button
                  type="button"
                  onClick={() => setSelectedDays([...DAYS_OF_WEEK])}
                  className="text-teal-600 dark:text-teal-400 font-medium hover:underline"
                >
                  All Days
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {DAYS_OF_WEEK.map(d => {
                const selected = selectedDays.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      selected
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {d.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Slots Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              2. Select Compartment Slots ({selectedSlots.length} of 4):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SLOT_NAMES.map(slot => {
                const selected = selectedSlots.includes(slot);
                const meta = SLOT_LABELS[slot];
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => toggleSlot(slot)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold capitalize text-center transition-all ${
                      selected
                        ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-800 dark:text-teal-200'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slot Settings */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Slot Status
              </span>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                />
                <span>Enable Selected Slots</span>
              </label>
            </div>

            {enabled && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Scheduled Time
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assign Medication
                  </label>
                  <select
                    value={selectedMedId}
                    onChange={(e) => handleMedSelect(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm"
                  >
                    <option value="">-- Choose medication --</option>
                    {medicines.filter(m => !m.isArchived).map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.dosage})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Medication Name
                    </label>
                    <input
                      type="text"
                      value={medicineName}
                      onChange={(e) => setMedicineName(e.target.value)}
                      placeholder="e.g. Metformin"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Dosage
                    </label>
                    <input
                      type="text"
                      value={dosage}
                      onChange={(e) => setDosage(e.target.value)}
                      placeholder="e.g. 500 mg"
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Instructions
                  </label>
                  <input
                    type="text"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g. Take with water after meal"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 px-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <span className="text-xs font-medium text-slate-500">
            Affects <strong className="text-teal-600 dark:text-teal-400">{totalAffectedSlots}</strong> slot LEDs
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={totalAffectedSlots === 0}
              onClick={handleApply}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-semibold shadow-md shadow-teal-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              Apply Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

