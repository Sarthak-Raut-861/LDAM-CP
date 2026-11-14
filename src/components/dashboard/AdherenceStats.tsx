"use client";

import React, { useMemo } from 'react';
import { useApp } from '@/context/AppContext';
import { CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

export const AdherenceStats: React.FC = () => {
  const { reminders } = useApp();

  const stats = useMemo(() => {
    let acknowledgedCount = 0;
    let missedCount = 0;

    reminders.forEach((r) => {
      if (r.status === 'acknowledged') acknowledgedCount++;
      else if (r.status === 'missed') missedCount++;
    });

    const totalTriggered = acknowledgedCount + missedCount;
    const adherenceRate = totalTriggered > 0 
      ? Math.round((acknowledgedCount / totalTriggered) * 100) 
      : 94;

    return {
      acknowledgedCount,
      missedCount,
      adherenceRate,
    };
  }, [reminders]);

  const weeklyData = [
    { day: 'Mon', rate: 100 },
    { day: 'Tue', rate: 100 },
    { day: 'Wed', rate: 75 },
    { day: 'Thu', rate: 100 },
    { day: 'Fri', rate: 75 },
    { day: 'Sat', rate: 100 },
    { day: 'Sun', rate: 100 },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Weekly Compliance &amp; Adherence
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Logs from dispenser tactile button &amp; online acknowledgements
          </p>
        </div>

        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
          {stats.adherenceRate}% Rate
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        {/* Simple Metric Pills */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Acknowledged</span>
            <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{stats.acknowledgedCount}</span>
          </div>
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Missed Doses</span>
            <span className="text-xl font-bold text-rose-600 dark:text-rose-400">{stats.missedCount}</span>
          </div>
          <XCircle className="w-5 h-5 text-rose-500" />
        </div>

        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Adherence</span>
            <span className="text-xl font-bold text-teal-600 dark:text-teal-400">{stats.adherenceRate}%</span>
          </div>
          <TrendingUp className="w-5 h-5 text-teal-500" />
        </div>
      </div>

      {/* Mini Trend Chart */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div className="h-28 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[11px] shadow-md">
                        {data.day}: {data.rate}%
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {weeklyData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.rate === 100 ? '#0d9488' : '#f59e0b'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
