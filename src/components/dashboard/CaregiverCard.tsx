"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { ShieldCheck, PhoneCall, Stethoscope, AlertTriangle, Send, Check } from 'lucide-react';

export const CaregiverCard: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useApp();
  const [alertSent, setAlertSent] = useState(false);

  const handleSimulateAlert = () => {
    setAlertSent(true);
    addToast({
      type: 'warning',
      title: 'Caregiver Notification Dispatched',
      message: `Emergency SMS & App Push sent to ${user?.emergencyContact || '+91 98765 43210'}.`,
      duration: 4000,
    });
    setTimeout(() => setAlertSent(false), 5000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Caregiver &amp; Clinical Safety Link
              </h3>
              <p className="text-[11px] text-slate-400">Escalation protocol for missed doses</p>
            </div>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            Active Guard
          </span>
        </div>

        <div className="space-y-3 mt-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider mb-1">
              Primary Care Physician
            </span>
            <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200">
              <Stethoscope className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
              <span className="truncate">{user?.doctorName || 'Dr. Anita Roy (Cardiologist, Apollo Health)'}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider mb-1">
              Designated Emergency Caregiver
            </span>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200 truncate">
                <PhoneCall className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">{user?.emergencyContact || '+91 98765 43210 (Dr. Vance - Son)'}</span>
              </div>
              <button
                onClick={handleSimulateAlert}
                disabled={alertSent}
                className="shrink-0 px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-[10px] font-bold flex items-center gap-1 transition-all"
              >
                {alertSent ? <Check className="w-3 h-3" /> : <Send className="w-3 h-3" />}
                <span>{alertSent ? 'Sent' : 'Ping Caregiver'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-start gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
        <span>
          Compliance Disclaimer: Dispenser logs button acknowledgement and slot LED triggers. Ingestion must be observed for critical medications.
        </span>
      </div>
    </div>
  );
};

