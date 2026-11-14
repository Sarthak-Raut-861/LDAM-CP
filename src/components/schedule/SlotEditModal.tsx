"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { DayOfWeek, SlotName, getLedId, SLOT_LABELS } from '@/types';
import { getLedDetails, formatTimeDisplay } from '@/lib/utils';
import { X, Clock, Pill, FileText, CheckCircle2, Layers, AlertCircle } from 'lucide-react';

interface SlotEditModalProps {
  day: DayOfWeek;
  slot: SlotName;
  isOpen: boolean;
  onClose: () => void;
}

export const SlotEditModal: React.FC<SlotEditModalProps> = ({ day, slot, isOpen, onClose }) => {
  const { schedule, medicines, updateScheduleSlot, settings } = useApp();
  const slotKey = `${day}_${slot}`;
  const currentSlot = schedule.slots[slotKey];
  const ledId = getLedId(day, slot);
  const hardware = getLedDetails(day, slot);
  const meta = SLOT_LABELS[slot];

  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState('08:00');
  const [selectedMedId, setSelectedMedId] = useState<string>('');
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (currentSlot) {
      setEnabled(currentSlot.enabled);
      setTime(currentSlot.reminderTime || '08:00');
      setSelectedMedId(currentSlot.medicineId || '');
      setMedicineName(currentSlot.medicineName || '');
      setDosage(currentSlot.dosage || '');
      setInstructions(currentSlot.instructions || '');
      setNotes(currentSlot.notes || '');
    }
  }, [currentSlot, isOpen]);

  // When user selects a medicine from dropdown, autofill name, dosage, instructions
  const handleMedicineSelect = (medId: string) => {
    setSelectedMedId(medId);
    const med = medicines.find(m => m.id === medId);
    if (med) {
      setMedicineName(med.name);
      setDosage(med.dosage);
      setInstructions(med.instructions);
    } else {
      setMedicineName('');
      setDosage('');
      setInstructions('');
    }
  };

  const handleSave = () => {
    updateScheduleSlot(day, slot, {
      enabled,
      reminderTime: time,
      medicineId: selectedMedId || undefined,
      medicineName: medicineName.trim() || undefined,
      dosage: dosage.trim() || undefined,
      instructions: instructions.trim() || undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                LED #{ledId}
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Configure {day} &bull; {meta.label} Slot
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Shift Register 74HC595 #{hardware.shiftRegisterIndex} &bull; Output Bit {hardware.pinIndex}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Enable / Disable toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <div>
              <label className="text-sm font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                Slot Active in Hardware Schedule
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {enabled ? 'ESP32 will light LED #' + ledId + ' at the scheduled time' : 'LED #' + ledId + ' disabled and omitted from triggers'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500 cursor-pointer"
            />
          </div>

          {/* Time Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-teal-600" />
              Reminder Time (24h or 12h: {formatTimeDisplay(time, settings.timeFormat)})
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={!enabled}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              DS3231 Real-Time Clock matches this exact HH:MM timestamp.
            </p>
          </div>

          {/* Select Medicine from Catalog */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-teal-600" />
              Choose from Medicine Catalog
            </label>
            <select
              value={selectedMedId}
              onChange={(e) => handleMedicineSelect(e.target.value)}
              disabled={!enabled}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            >
              <option value="">-- Select from existing medicines --</option>
              {medicines.filter(m => !m.isArchived).map((med) => (
                <option key={med.id} value={med.id}>
                  {med.name} ({med.dosage}) - {med.form}
                </option>
              ))}
            </select>
          </div>

          {/* Medicine Name (manual or prefilled) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Medication Label
              </label>
              <input
                type="text"
                placeholder="e.g. Metformin Hydrochloride"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                disabled={!enabled}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Dosage
              </label>
              <input
                type="text"
                placeholder="e.g. 500 mg, 1 Tablet"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                disabled={!enabled}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
              />
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-teal-600" />
              Patient Instructions
            </label>
            <input
              type="text"
              placeholder="e.g. Take after breakfast with a full glass of water."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              disabled={!enabled}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            />
          </div>

          {/* Slot Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Slot Notes / Dispenser Compartment Label
            </label>
            <input
              type="text"
              placeholder="e.g. Pillbox Row 1, Slot A"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={!enabled}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
            />
          </div>
        </div>

        {/* Footer */}
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
            onClick={handleSave}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md shadow-teal-500/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            Save Slot Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

