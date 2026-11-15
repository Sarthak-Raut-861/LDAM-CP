"use client";

import React, { useState, useEffect } from 'react';
import { Medicine, MedicineForm, FoodTiming } from '@/types';
import { X, Pill, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';

interface MedicineFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (med: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialMedicine?: Medicine | null;
}

const FORMS: MedicineForm[] = ['tablet', 'capsule', 'syrup', 'injection', 'drops', 'inhaler', 'powder', 'other'];

const FOOD_TIMINGS: { id: FoodTiming; label: string }[] = [
  { id: 'after_meal', label: 'After Meal (Post-prandial)' },
  { id: 'before_meal', label: 'Before Meal (Pre-prandial)' },
  { id: 'with_meal', label: 'With Meal / Food' },
  { id: 'empty_stomach', label: 'On an Empty Stomach' },
  { id: 'anytime', label: 'Anytime / As Directed' },
];

const COLORS = [
  '#0d9488', // Teal
  '#0284c7', // Sky
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#ec4899', // Pink
  '#6366f1', // Indigo
];

export const MedicineFormModal: React.FC<MedicineFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialMedicine,
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState<MedicineForm>('tablet');
  const [foodTiming, setFoodTiming] = useState<FoodTiming>('after_meal');
  const [instructions, setInstructions] = useState('');
  const [color, setColor] = useState('#0d9488');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialMedicine) {
      setName(initialMedicine.name);
      setDosage(initialMedicine.dosage);
      setForm(initialMedicine.form);
      setFoodTiming(initialMedicine.foodTiming);
      setInstructions(initialMedicine.instructions);
      setColor(initialMedicine.color || '#0d9488');
      setNotes(initialMedicine.notes || '');
    } else {
      setName('');
      setDosage('');
      setForm('tablet');
      setFoodTiming('after_meal');
      setInstructions('');
      setColor('#0d9488');
      setNotes('');
    }
    setErrors({});
  }, [initialMedicine, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Medicine name is required';
    if (!dosage.trim()) errs.dosage = 'Dosage is required (e.g. 500 mg)';
    if (!instructions.trim()) errs.instructions = 'Patient instructions are required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      name: name.trim(),
      dosage: dosage.trim(),
      form,
      foodTiming,
      instructions: instructions.trim(),
      color,
      notes: notes.trim() || undefined,
      isArchived: false,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {initialMedicine ? 'Edit Medication Profile' : 'Register New Medication'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define drug name, dosage, schedule form and patient intake guidelines
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Medical Notice */}
          <div className="p-3 rounded-2xl bg-teal-50/60 dark:bg-teal-950/30 border border-teal-200/80 dark:border-teal-800/60 text-teal-900 dark:text-teal-200 text-xs flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Always enter exact formulations according to the prescribing physician&apos;s label. MediGlow does not offer or modify medical prescriptions.
            </p>
          </div>

          {/* Name & Dosage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Medication Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Metformin Hydrochloride"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                  errors.name ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                }`}
              />
              {errors.name && <p className="text-[10px] text-rose-500 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Dosage / Strength *
              </label>
              <input
                type="text"
                placeholder="e.g. 500 mg or 10 ml"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                  errors.dosage ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                }`}
              />
              {errors.dosage && <p className="text-[10px] text-rose-500 mt-1">{errors.dosage}</p>}
            </div>
          </div>

          {/* Form & Food Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Medication Form
              </label>
              <select
                value={form}
                onChange={(e) => setForm(e.target.value as MedicineForm)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm capitalize"
              >
                {FORMS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Food Relation
              </label>
              <select
                value={foodTiming}
                onChange={(e) => setFoodTiming(e.target.value as FoodTiming)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
              >
                {FOOD_TIMINGS.map(t => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Patient Instructions *
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Take immediately after meals to reduce gastric discomfort. Swallow whole with water."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className={`w-full px-3.5 py-2 rounded-xl border text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white ${
                errors.instructions ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
              }`}
            />
            {errors.instructions && <p className="text-[10px] text-rose-500 mt-1">{errors.instructions}</p>}
          </div>

          {/* Color Identification */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Color Tag (Visual Identification)
            </label>
            <div className="flex items-center gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c ? 'scale-115 border-slate-900 dark:border-white shadow-sm' : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Prescriber / Pharmacy Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Rx #92019 - Refill by Dec 2026. Avoid grapefruit."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-md shadow-teal-500/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              {initialMedicine ? 'Save Changes' : 'Register Medication'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

