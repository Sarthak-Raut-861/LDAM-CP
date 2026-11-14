"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  Cpu, 
  Wifi, 
  WifiOff, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  ShieldCheck, 
  Power,
  ZapOff
} from 'lucide-react';

export const DeviceTelemetryCard: React.FC = () => {
  const { deviceStatus, schedule, syncScheduleToDevice, toggleDevicePower } = useApp();
  const [syncing, setSyncing] = useState(false);

  const isScheduleOutOfDate = schedule.version > deviceStatus.lastSyncedVersion;

  const handleSync = async () => {
    setSyncing(true);
    await syncScheduleToDevice();
    setSyncing(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-100 dark:border-slate-800 gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {deviceStatus.deviceName}
              </h2>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                deviceStatus.isOnline 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                {deviceStatus.isOnline ? 'Online & Communicating' : 'Offline / Standalone RTC Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              ID: <span className="font-mono text-slate-700 dark:text-slate-300">{deviceStatus.deviceId}</span> &bull; Firmware: <span className="font-mono">{deviceStatus.firmwareVersion}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleDevicePower}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Power className="w-3.5 h-3.5" />
            {deviceStatus.isOnline ? 'Simulate Link Drop' : 'Reconnect Wi-Fi'}
          </button>
          <button
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-500/20 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Synchronizing Flash...' : 'Sync Schedule Now'}
          </button>
        </div>
      </div>

      {/* Telemetry Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Wi-Fi Radio */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Wi-Fi Network</span>
            <Radio className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <p className="font-bold text-sm text-slate-900 dark:text-white truncate">
            {deviceStatus.isOnline ? deviceStatus.wifiSSID : 'Not Connected'}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono">
            RSSI: {deviceStatus.isOnline ? `${deviceStatus.wifiSignalDbm} dBm` : '0 dBm'}
          </p>
        </div>

        {/* DS3231 RTC Module */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>DS3231 RTC Module</span>
            <Clock className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <p className="font-bold text-sm text-slate-900 dark:text-white capitalize">
            {deviceStatus.rtcStatus} (Hardware Clkd)
          </p>
          <p className="text-[11px] text-slate-400 mt-1 font-mono truncate">
            {new Date(deviceStatus.rtcTime).toLocaleTimeString()}
          </p>
        </div>

        {/* Schedule Version Tracking */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Version Synchronization</span>
            <RefreshCw className="w-3.5 h-3.5 text-teal-600" />
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            {isScheduleOutOfDate ? (
              <span className="text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Hardware v{deviceStatus.lastSyncedVersion} &lt; Cloud v{schedule.version}
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Synchronized (v{deviceStatus.lastSyncedVersion})
              </span>
            )}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            Last sync: {new Date(deviceStatus.lastSeen).toLocaleTimeString()}
          </p>
        </div>

        {/* Power / Telemetry Note (No false battery readings) */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>Power &amp; Supply Telemetry</span>
            <ZapOff className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="font-bold text-sm text-slate-800 dark:text-slate-200">
            5V DC Mains / USB
          </p>
          <p className="text-[10px] text-slate-400 mt-1">
            No battery telemetry pin equipped. DS3231 coin cell backed.
          </p>
        </div>
      </div>

      {/* Network Interface Specs */}
      <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/30 border border-slate-200/60 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div>
          <span className="text-slate-400 block text-[11px]">Assigned Local IP</span>
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
            {deviceStatus.ipAddress}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Hardware MAC Address</span>
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
            {deviceStatus.macAddress}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[11px]">Simulation Status</span>
          <span className="font-semibold text-teal-600 dark:text-teal-400">
            {deviceStatus.isSimulated ? 'Active Interactive Demo Gateway' : 'Hardware Connected'}
          </span>
        </div>
      </div>
    </div>
  );
};

