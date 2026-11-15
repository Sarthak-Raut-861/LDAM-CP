"use client";

import React from 'react';
import { DeviceMap28Led } from '@/components/device/DeviceMap28Led';

export default function DevicePage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          ESP32 &amp; 28-LED Dispenser Control
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Real-time hardware gateway, Wi-Fi sync, and interactive 28-compartment LED activation.
        </p>
      </div>

      {/* 28-LED Physical Hardware Visualizer & Interactive Board */}
      <DeviceMap28Led />
    </div>
  );
}

