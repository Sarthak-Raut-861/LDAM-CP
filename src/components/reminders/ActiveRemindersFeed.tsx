"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ReminderEvent, ReminderStatus, getSlotFromLedId } from '@/types';
import { formatTimeDisplay } from '@/lib/utils';
import { 
  Bell, 
  BellRing, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Filter, 
  Search,
  Check,
  Pause,
  Sparkles,
  Layers
} from 'lucide-react';

export const ActiveRemindersFeed: React.FC = () => {
  const { 
    reminders, 
    acknowledgeReminder, 
    snoozeReminder, 
    deviceStatus, 
    triggerTestReminder,
    settings 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'missed' | 'acknowledged'>('all');
  const [selectedReminderForAck, setSelectedReminderForAck] = useState<ReminderEvent | null>(null);
  const [ackNotes, setAckNotes] = useState('');
  const [disclaimerChecked, setDisclaimerChecked] = useState(false);

  // Filter reminders
  const filteredReminders = reminders.filter(r => {
    if (activeTab === 'active') return r.status === 'triggered' || r.status === 'scheduled';
    if (activeTab === 'missed') return r.status === 'missed';
    if (activeTab === 'acknowledged') return r.status === 'acknowledged';
    return true;
  });

  const handleOpenAckModal = (reminder: ReminderEvent) => {
    setSelectedReminderForAck(reminder);
    setAckNotes('');
    setDisclaimerChecked(false);
  };

  const handleConfirmAck = () => {
    if (!selectedReminderForAck) return;
    acknowledgeReminder(selectedReminderForAck.id, ackNotes);
    setSelectedReminderForAck(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Reminders &amp; Notification Audit
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {reminders.length} Events Logged
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Tracks alarms triggered by the DS3231 RTC, shift register activations, and caregiver acknowledgements.
          </p>
        </div>

        {/* Test Alert Button */}
        <button
          onClick={() => triggerTestReminder(deviceStatus.activeLed ? 0 : 21)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-bold shadow-2xs hover:bg-rose-100 transition-colors"
        >
          <BellRing className="w-3.5 h-3.5" />
          Simulate Trigger Alarm (LED #21)
        </button>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
          <p className="font-bold text-amber-950 dark:text-amber-100">
            Medical Disclaimer &amp; Patient Ingestion Verification Rule:
          </p>
          <p className="mt-0.5">
            Marking a reminder as &ldquo;Acknowledged&rdquo; indicates that an alert was received and confirmed on the web interface or hardware button. This system does NOT physically detect pill ingestion or clinical compliance.
          </p>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2">
        {[
          { id: 'all', label: 'All Logged Events', count: reminders.length },
          { id: 'active', label: 'Active & Upcoming', count: reminders.filter(r => r.status === 'scheduled' || r.status === 'triggered').length },
          { id: 'acknowledged', label: 'Acknowledged', count: reminders.filter(r => r.status === 'acknowledged').length },
          { id: 'missed', label: 'Missed Alerts', count: reminders.filter(r => r.status === 'missed').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-teal-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeTab === tab.id ? 'bg-teal-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Reminder List */}
      <div className="space-y-3">
        {filteredReminders.map((reminder) => {
          const isLedFlashing = deviceStatus.activeLed === reminder.ledId;
          const isAck = reminder.status === 'acknowledged';
          const isMissed = reminder.status === 'missed';

          return (
            <div
              key={reminder.id}
              className={`p-4.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isLedFlashing
                  ? 'bg-rose-50/90 dark:bg-rose-950/40 border-rose-400 dark:border-rose-700 shadow-glow-red ring-2 ring-rose-500/40'
                  : isAck
                  ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
                  : isMissed
                  ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200/60 dark:border-rose-900/40'
                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {/* Left Column: Icon & Drug details */}
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
                  isLedFlashing
                    ? 'bg-rose-500 text-white animate-pulse'
                    : isAck
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                    : isMissed
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    : 'bg-teal-100 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400'
                }`}>
                  {isAck ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : isMissed ? (
                    <XCircle className="w-5 h-5" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {reminder.medicineName}
                    </span>
                    <span className="text-xs font-semibold text-teal-600 dark:text-teal-400">
                      {reminder.dosage}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      LED #{reminder.ledId}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {reminder.dayOfWeek} &bull; <span className="capitalize">{reminder.slot}</span> &bull; Scheduled {formatTimeDisplay(reminder.scheduledTime, settings.timeFormat)}
                  </p>

                  {/* Audit details */}
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-400">
                    {reminder.acknowledgedAt && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        Ack at: {new Date(reminder.acknowledgedAt).toLocaleTimeString()} ({reminder.source})
                      </span>
                    )}
                    {reminder.notes && (
                      <span className="italic truncate max-w-xs">&ldquo;{reminder.notes}&rdquo;</span>
                    )}
                    <span className="text-amber-600 dark:text-amber-400 font-medium">
                      &bull; Ingestion: Unverified
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Status & Action */}
              <div className="flex items-center gap-2 shrink-0">
                {isAck ? (
                  <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    Acknowledged
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => snoozeReminder(reminder.id, 10)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      Snooze 10m
                    </button>
                    <button
                      onClick={() => handleOpenAckModal(reminder)}
                      className="px-4 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Acknowledge
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Acknowledgment Modal with Mandatory Disclaimer */}
      {selectedReminderForAck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div 
            className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 animate-in fade-in zoom-in-95 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Acknowledge Medication Reminder
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedReminderForAck.medicineName} ({selectedReminderForAck.dosage})
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
              <strong>Crucial Safety Notice:</strong> This action records that the reminder signal was acknowledged by the user or caregiver. It does not certify that the physical pill was swallowed.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Optional Patient/Caregiver Notes:
              </label>
              <input
                type="text"
                placeholder="e.g. Dispensed from compartment, patient took with water."
                value={ackNotes}
                onChange={(e) => setAckNotes(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* Mandatory checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={disclaimerChecked}
                onChange={(e) => setDisclaimerChecked(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-teal-600 rounded focus:ring-teal-500"
              />
              <span className="leading-tight">
                I understand this acknowledges the notification alert only and does not prove ingestion.
              </span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedReminderForAck(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!disclaimerChecked}
                onClick={handleConfirmAck}
                className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-teal-500/20"
              >
                Confirm Acknowledgment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

