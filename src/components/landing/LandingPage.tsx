"use client";

import React from 'react';
import Link from 'next/link';
import { 
  Layers, 
  Clock, 
  ShieldCheck, 
  Wifi, 
  Bell, 
  ArrowRight, 
  CheckCircle2, 
  HeartPulse,
  Lock,
  Sparkles,
  Cpu,
  ChevronDown
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div id="overview" className="relative space-y-16 sm:space-y-24 pt-1 sm:pt-2 pb-16 overflow-hidden">
      {/* Ambient Radial Glass Glow Orbs */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-tr from-teal-500/15 via-emerald-500/10 to-cyan-500/10 blur-[120px] rounded-full pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-[450px] -left-36 w-[400px] h-[400px] bg-teal-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[900px] -right-36 w-[450px] h-[450px] bg-cyan-600/10 blur-[110px] rounded-full pointer-events-none -z-10" />

      {/* 1. Hero Section - Shifted Upwards & Clean */}
      <section className="relative text-center max-w-3xl mx-auto px-4 space-y-5 pt-1">
        {/* Subtle Announcement Pill with Logo Tagline */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/10 text-xs font-semibold text-slate-300 shadow-sm hover:border-teal-500/40 transition-colors">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-teal-300 font-bold">Your Health, Right on Time.</span>
          <span className="text-slate-500">&bull;</span>
          <span>IoT Dispenser &bull; ESP32 &bull; DS3231 RTC</span>
        </div>

        {/* Clean, Punchy Typography */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.12]">
            Smart Medication Care, <br />
            <span className="bg-gradient-to-r from-teal-300 via-emerald-300 to-cyan-300 bg-clip-text text-transparent">
              Engineered for Precision.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
            An automated 28-compartment system combining an autonomous DS3231 Real-Time Clock, 
            shift-register LED matrix, and instant cloud compliance telemetry.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-1">
          <Link
            href="/dashboard"
            className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold text-xs shadow-lg shadow-teal-500/25 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Launch Patient Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="#architecture"
            className="px-6 py-3.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] backdrop-blur-xl border border-white/10 text-slate-300 hover:text-white font-medium text-xs flex items-center gap-1.5 transition-all"
          >
            <span>View Architecture</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Sleek Glassmorphic Telemetry Showcase Card */}
        <div className="pt-6">
          <div className="max-w-2xl mx-auto rounded-3xl bg-slate-900/40 backdrop-blur-2xl border border-white/[0.08] p-6 shadow-2xl text-left relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header row */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-glow animate-pulse" />
                <span className="text-xs font-bold text-white tracking-wide">
                  ESP32 Bedside Unit Online
                </span>
              </div>
              <span className="text-[11px] font-mono text-teal-400/90 font-medium px-2 py-0.5 rounded-md bg-teal-500/10 border border-teal-500/20">
                v2.4.1 Active
              </span>
            </div>

            {/* 3 Telemetry Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 block font-medium">Shift Registers</span>
                <p className="font-bold text-white text-sm">4x 74HC595</p>
                <p className="text-[11px] text-slate-400">28 Discrete Compartments</p>
              </div>

              <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/[0.06] pt-3 sm:pt-0 sm:pl-4">
                <span className="text-[11px] text-slate-400 block font-medium">Hardware RTC</span>
                <p className="font-bold text-white text-sm">DS3231 I2C</p>
                <p className="text-[11px] text-slate-400">Autonomous Offline Alarms</p>
              </div>

              <div className="space-y-1 border-t sm:border-t-0 sm:border-l border-white/[0.06] pt-3 sm:pt-0 sm:pl-4">
                <span className="text-[11px] text-slate-400 block font-medium">Telemetry Sync</span>
                <p className="font-bold text-white text-sm">Firebase RTDB</p>
                <p className="text-[11px] text-slate-400">Sub-second Cloud Link</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Engineering Architecture Section */}
      <section id="architecture" className="max-w-6xl mx-auto px-4 scroll-mt-24">
        <div className="text-center mb-14 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 inline-block">
            Engineering Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Built for Medical Precision &amp; Reliability
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            Each subsystem is purpose-built to eliminate missed dosages and maintain continuous operation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-7 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/[0.08] hover:border-teal-500/40 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white group-hover:text-teal-300 transition-colors mb-2">
              4x 74HC595 Shift Registers
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Controls 28 discrete output channels (7 days &times; 4 slots) using only 3 ESP32 GPIO pins 
              (DATA 19, CLK 18, LATCH 23) via cascaded serial-in, parallel-out architecture.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-7 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/[0.08] hover:border-sky-500/40 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white group-hover:text-sky-300 transition-colors mb-2">
              Autonomous DS3231 RTC
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Precision temperature-compensated I2C Real-Time Clock with coin cell backup. Alarms fire on schedule 
              even during router disconnects or cloud downtime.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-7 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/[0.08] hover:border-indigo-500/40 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Wifi className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors mb-2">
              Firebase Realtime Database
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sub-second bi-directional synchronization. Web schedule updates automatically push to ESP32 Flash (NVS), 
              and physical button clicks sync back to the user portal.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-7 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/[0.08] hover:border-amber-500/40 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors mb-2">
              Multi-Sensory Alerts
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-visibility flashing LED on the specific compartment accompanied by audible piezo buzzer chime 
              ensures medication times are never missed.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-7 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/[0.08] hover:border-emerald-500/40 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white group-hover:text-emerald-300 transition-colors mb-2">
              Tactile Button Acknowledgement
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              A tactile button on GPIO 4 acknowledges doses, immediately silencing alerts, clearing active LEDs, 
              and recording compliance timestamps in the cloud.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-7 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/[0.08] hover:border-rose-500/40 hover:bg-slate-900/60 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white group-hover:text-rose-300 transition-colors mb-2">
              Missed-Dose Safeguards
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If an alarm is unacknowledged within 45 minutes, the system logs a missed dose event and triggers 
              adherence safeguards to protect patient health.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Workflow Protocol Section */}
      <section id="workflow" className="max-w-5xl mx-auto px-4 scroll-mt-24">
        <div className="text-center mb-14 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 inline-block">
            Workflow Protocol
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How MediGlow Operates
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
            A seamless three-step loop between the user portal and physical bedside hardware.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="p-7 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/[0.08] hover:border-teal-500/40 transition-all duration-300 flex flex-col items-center text-center group">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-300 font-black text-sm flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              1
            </div>
            <h4 className="font-bold text-sm text-white mb-2 group-hover:text-teal-300 transition-colors">
              User Configures Schedule
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Medication times and compartment slots are configured in the planner and synced to Firebase.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-7 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/[0.08] hover:border-teal-500/40 transition-all duration-300 flex flex-col items-center text-center group">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-300 font-black text-sm flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              2
            </div>
            <h4 className="font-bold text-sm text-white mb-2 group-hover:text-teal-300 transition-colors">
              ESP32 Flashes to NVS
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              The microcontroller downloads schedule version, saves slots to non-volatile flash, and monitors RTC time.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-7 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-white/[0.08] hover:border-teal-500/40 transition-all duration-300 flex flex-col items-center text-center group">
            <div className="w-11 h-11 rounded-2xl bg-teal-500/15 border border-teal-500/30 text-teal-300 font-black text-sm flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
              3
            </div>
            <h4 className="font-bold text-sm text-white mb-2 group-hover:text-teal-300 transition-colors">
              LED Shifting &amp; Patient Take
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              At dosage time, the exact 74HC595 bit goes HIGH, blinking the compartment LED until acknowledged.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
