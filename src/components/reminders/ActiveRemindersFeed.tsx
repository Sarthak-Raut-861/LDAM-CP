"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ReminderEvent } from '@/types';
import { formatTimeDisplay } from '@/lib/utils';
import { 
  BellRing, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  Check,
  Pause,
  Calendar,
  Cpu
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
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight">
              Reminders &amp; Notification Audit
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-500/15 text-teal-300 border border-teal-500/30">
              {reminders.length} Events Logged
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Tracks alarms triggered by the DS3231 RTC, shift register activations, and patient adherence acknowledgements.
          </p>
        </div>

        {/* Test Alert Button */}
        <button
          onClick={() => triggerTestReminder(deviceStatus.activeLed ? 0 : 21)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500/20 to-rose-600/20 hover:from-rose-500/30 hover:to-rose-600/30 border border-rose-500/40 text-rose-300 hover:text-white text-xs font-bold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <BellRing className="w-3.5 h-3.5 text-rose-400" />
          <span>Simulate Trigger Alarm (LED #21)</span>
        </button>
      </div>

      {/* Safety Notice Banner */}
      <div className="p-4 rounded-2xl bg-amber-500/[0.06] backdrop-blur-xl border border-amber-500/25 flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-amber-200">
              Clinical Compliance Notice: Confirmation Rule
            </h4>
            <p className="text-amber-200/80 text-[11px] leading-relaxed mt-0.5">
              Acknowledging a reminder records that the alert was confirmed on the web interface or hardware button. It does not certify empirical pill ingestion.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-bold shrink-0">
          Audit Protocol
        </span>
      </div>

      {/* Segmented Tabs Filter */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/10 w-fit overflow-x-auto">
        {[
          { id: 'all', label: 'All Logged Events', count: reminders.length },
          { id: 'active', label: 'Active & Upcoming', count: reminders.filter(r => r.status === 'scheduled' || r.status === 'triggered').length },
          { id: 'acknowledged', label: 'Acknowledged', count: reminders.filter(r => r.status === 'acknowledged').length },
          { id: 'missed', label: 'Missed Alerts', count: reminders.filter(r => r.status === 'missed').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-teal-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
              activeTab === tab.id ? 'bg-black/25 text-white' : 'bg-white/10 text-slate-300'
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
              className={`p-5 rounded-3xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden ${
                isLedFlashing
                  ? 'bg-rose-950/40 border-rose-500/70 shadow-glow-red ring-2 ring-rose-500/30'
                  : isAck
                  ? 'bg-slate-900/50 backdrop-blur-xl border-white/[0.08] hover:border-white/15'
                  : isMissed
                  ? 'bg-rose-950/20 border-rose-500/30'
                  : 'bg-slate-900/50 backdrop-blur-xl border-white/[0.08] hover:border-teal-500/30'
              }`}
            >
              {/* Left Column: Icon & Drug details */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm mt-0.5 ${
                  isLedFlashing
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                    : isAck
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    : isMissed
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                    : 'bg-teal-500/15 text-teal-400 border border-teal-500/30'
                }`}>
                  {isAck ? (
                    <CheckCircle2 className="w-6 h-6" />
                  ) : isMissed ? (
                    <XCircle className="w-6 h-6" />
                  ) : (
                    <Clock className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  {/* Top Row: Name, Dosage, LED Badge & Scheduled Time */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight truncate">
                        {reminder.medicineName}
                      </h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-500/15 border border-teal-500/30 text-teal-300">
                        {reminder.dosage}
                      </span>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                        LED #{reminder.ledId}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>{reminder.dayOfWeek}</span>
                      <span className="text-slate-600">&bull;</span>
                      <span className="capitalize text-slate-300 font-medium">{reminder.slot}</span>
                      <span className="text-slate-600">&bull;</span>
                      <span className="text-teal-300 font-semibold font-mono">
                        {formatTimeDisplay(reminder.scheduledTime, settings.timeFormat)}
                      </span>
                    </div>
                  </div>

                  {/* Bottom Row: Audit Badges */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    {reminder.acknowledgedAt && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[11px] font-semibold">
                        <Check className="w-3.5 h-3.5" />
                        <span>Ack: {new Date(reminder.acknowledgedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </span>
                    )}

                    {reminder.source && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-medium">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>{reminder.source === 'esp32_button' ? 'Tactile Button (ESP32)' : 'Patient Web Portal'}</span>
                      </span>
                    )}

                    {reminder.notes && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/10 text-slate-300 text-[11px] italic">
                        &ldquo;{reminder.notes}&rdquo;
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-medium sm:ml-auto">
                      <ShieldAlert className="w-3 h-3 text-amber-400" />
                      <span>Ingestion Unverified</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Column: Status & Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-white/[0.06]">
                {isAck ? (
                  <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                    <span>Acknowledged</span>
                  </span>
                ) : isMissed ? (
                  <span className="px-3.5 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Missed Alarm</span>
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => snoozeReminder(reminder.id, 10)}
                      className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <Pause className="w-3.5 h-3.5 text-amber-400" />
                      <span>Snooze 10m</span>
                    </button>
                    <button
                      onClick={() => handleOpenAckModal(reminder)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white text-xs font-bold shadow-md shadow-teal-500/25 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Acknowledge</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div 
            className="w-full max-w-md rounded-3xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-6 animate-in fade-in zoom-in-95 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">
                  Acknowledge Medication Reminder
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedReminderForAck.medicineName} ({selectedReminderForAck.dosage})
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/[0.08] border border-amber-500/25 text-xs text-amber-200 leading-relaxed">
              <strong>Crucial Safety Notice:</strong> This action records that the reminder signal was acknowledged by the user. It does not certify that the physical pill was swallowed.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Optional Patient Notes:
              </label>
              <input
                type="text"
                placeholder="e.g. Dispensed from compartment, taken with meal."
                value={ackNotes}
                onChange={(e) => setAckNotes(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            {/* Mandatory checkbox */}
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none">
              <input
                type="checkbox"
                checked={disclaimerChecked}
                onChange={(e) => setDisclaimerChecked(e.target.checked)}
                className="w-4 h-4 mt-0.5 text-teal-500 rounded border-white/20 bg-white/10 focus:ring-teal-500"
              />
              <span className="leading-tight">
                I understand this acknowledges the notification alert only and does not prove biological ingestion.
              </span>
            </label>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setSelectedReminderForAck(null)}
                className="px-4 py-2 rounded-xl border border-white/10 text-xs font-semibold text-slate-300 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!disclaimerChecked}
                onClick={handleConfirmAck}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-teal-500/25 transition-all"
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
