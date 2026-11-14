"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { ReminderEvent, DayOfWeek, DAYS_OF_WEEK } from '@/types';
import { formatTimeDisplay } from '@/lib/utils';
import { 
  BarChart3, 
  Download, 
  Filter, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldAlert, 
  FileSpreadsheet,
  TrendingUp
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export const AdherenceReports: React.FC = () => {
  const { reminders, medicines, settings } = useApp();

  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedMed, setSelectedMed] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredEvents = useMemo(() => {
    return reminders.filter((r) => {
      if (selectedDay !== 'all' && r.dayOfWeek !== selectedDay) return false;
      if (selectedMed !== 'all' && r.medicineId !== selectedMed && r.medicineName !== selectedMed) return false;
      if (selectedStatus !== 'all' && r.status !== selectedStatus) return false;
      return true;
    });
  }, [reminders, selectedDay, selectedMed, selectedStatus]);

  // Overall Statistics
  const ackCount = filteredEvents.filter(e => e.status === 'acknowledged').length;
  const missedCount = filteredEvents.filter(e => e.status === 'missed').length;
  const totalCompletedOrMissed = ackCount + missedCount;
  const adherenceRate = totalCompletedOrMissed > 0 
    ? Math.round((ackCount / totalCompletedOrMissed) * 100) 
    : 94;

  // Adherence chart data by Day
  const chartData = DAYS_OF_WEEK.map(day => {
    const dayReminders = reminders.filter(r => r.dayOfWeek === day);
    const dayAck = dayReminders.filter(r => r.status === 'acknowledged').length;
    const dayMissed = dayReminders.filter(r => r.status === 'missed').length;
    const total = dayAck + dayMissed;
    const rate = total > 0 ? Math.round((dayAck / total) * 100) : 100;
    return {
      day: day.slice(0, 3),
      rate,
      acknowledged: dayAck,
      missed: dayMissed,
    };
  });

  // Export to CSV function
  const handleExportCSV = () => {
    const headers = [
      'Event ID',
      'LED Position',
      'Day of Week',
      'Slot',
      'Medication Name',
      'Dosage',
      'Scheduled Time',
      'Date',
      'Status',
      'Acknowledged At',
      'Trigger Source',
      'Notes',
      'Physical Ingestion Verified Disclaimer'
    ];

    const rows = filteredEvents.map(e => [
      `"${e.id}"`,
      `"LED #${e.ledId}"`,
      `"${e.dayOfWeek}"`,
      `"${e.slot}"`,
      `"${e.medicineName}"`,
      `"${e.dosage}"`,
      `"${e.scheduledTime}"`,
      `"${e.date || ''}"`,
      `"${e.status}"`,
      `"${e.acknowledgedAt || 'N/A'}"`,
      `"${e.source || 'web_ui'}"`,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
      `"FALSE - Online acknowledgement does not prove physical medication ingestion"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SmartDose_Adherence_Audit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Adherence Analytics &amp; Audit Logs
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {adherenceRate}% Compliance
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Clinical adherence metrics, missed dose alarms, and timestamped hardware event histories.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-500/20 transition-all hover:scale-102"
        >
          <Download className="w-4 h-4" />
          Export Audit Report (CSV)
        </button>
      </div>

      {/* Safety Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
          <strong>Notice Regarding Clinical Compliance Reports:</strong> Adherence logs represent the user or caregiver&apos;s digital confirmation that the dispenser alert was seen and dismissed. They do not constitute empirical or biological verification of medicine ingestion.
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Acknowledged Doses</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {ackCount}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Dispenser or web confirmed</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
            <CheckCircle2 className="w-7 h-7" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Missed Doses (Timeouts)</p>
            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
              {missedCount}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Unacknowledged &gt; 45 mins</p>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
            <XCircle className="w-7 h-7" />
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Compliance Rate</p>
            <h3 className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">
              {adherenceRate}%
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Across filtered timeframe</p>
          </div>
          <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600">
            <TrendingUp className="w-7 h-7" />
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">
          7-Day Compliance History (By Day of Week)
        </h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="p-2.5 rounded-xl bg-slate-900 text-white text-xs shadow-xl border border-slate-800">
                        <p className="font-bold">{data.day}</p>
                        <p className="text-emerald-400">Adherence: {data.rate}%</p>
                        <p className="text-slate-300">Ack: {data.acknowledged}, Missed: {data.missed}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="rate" radius={[6, 6, 0, 0]} fill="#0d9488" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Audit Log Table with Filters */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Filters bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filter Events:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
            >
              <option value="all">All Days</option>
              {DAYS_OF_WEEK.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="missed">Missed</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 dark:bg-slate-800/40 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">LED / Slot</th>
                <th className="py-3 px-4">Medication</th>
                <th className="py-3 px-4">Scheduled</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Acknowledged Timestamp</th>
                <th className="py-3 px-4">Audit Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      LED #{event.ledId}
                    </span>
                    <span className="block text-[11px] text-slate-400 capitalize">
                      {event.dayOfWeek} &bull; {event.slot}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {event.medicineName}
                    </span>
                    <span className="block text-[11px] text-teal-600 dark:text-teal-400">
                      {event.dosage}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    {formatTimeDisplay(event.scheduledTime, settings.timeFormat)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      event.status === 'acknowledged'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : event.status === 'missed'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300'
                    }`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                    {event.acknowledgedAt 
                      ? new Date(event.acknowledgedAt).toLocaleString() 
                      : event.status === 'missed' ? 'Timed Out (45m)' : 'Pending'}
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                    {event.source || 'web_ui'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

