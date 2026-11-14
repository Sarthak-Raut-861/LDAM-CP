"use client";

import React from 'react';
import Link from 'next/link';
import { 
  PlusCircle, 
  CalendarDays, 
  Layers, 
  DownloadCloud, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';

export const QuickActions: React.FC<{ onOpenAddMedicine?: () => void }> = ({ onOpenAddMedicine }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {onOpenAddMedicine ? (
        <button
          onClick={onOpenAddMedicine}
          className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 transition-all text-left shadow-2xs hover:shadow-md"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
            <PlusCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Add Medicine</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Register new dosage & instructions</p>
        </button>
      ) : (
        <Link
          href="/medicines"
          className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 transition-all text-left shadow-2xs hover:shadow-md"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
            <PlusCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Add Medicine</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Register new dosage & instructions</p>
        </Link>
      )}

      <Link
        href="/schedule"
        className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 transition-all text-left shadow-2xs hover:shadow-md"
      >
        <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
          <CalendarDays className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Configure 28 Slots</h3>
        <p className="text-[11px] text-slate-400 mt-0.5">Edit 7-day dispenser plan</p>
      </Link>

      <Link
        href="/device"
        className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 transition-all text-left shadow-2xs hover:shadow-md"
      >
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
          <Layers className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">28-LED Hardware Map</h3>
        <p className="text-[11px] text-slate-400 mt-0.5">Preview shift register channels</p>
      </Link>

      <Link
        href="/reports"
        className="group p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-teal-400 dark:hover:border-teal-600 transition-all text-left shadow-2xs hover:shadow-md"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform mb-3">
          <DownloadCloud className="w-5 h-5" />
        </div>
        <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">Compliance Audit</h3>
        <p className="text-[11px] text-slate-400 mt-0.5">Export logs &amp; adherence trends</p>
      </Link>
    </div>
  );
};

