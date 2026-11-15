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
  Zap,
  Activity
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="relative space-y-20 py-8 sm:py-16 overflow-hidden">
      {/* Ambient Radial Glass Glow Orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-teal-500/20 via-emerald-500/15 to-cyan-500/10 blur-[100px] rounded-full pointer-events-none -z-10 animate-pulse" />
      <div className="absolute top-96 -left-32 w-[450px] h-[450px] bg-teal-600/10 blur-[90px] rounded-full pointer-events-none -z-10" />
      <div className="absolute top-[800px] -right-32 w-[500px] h-[500px] bg-cyan-600/10 blur-[100px] rounded-full pointer-events-none -z-10" />

      {/* 1. Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto px-4 space-y-6">
        {/* Glassmorphic Hardware Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-xl border border-teal-500/30 text-xs font-semibold text-teal-300 shadow-lg shadow-teal-500/10 hover:border-teal-400/50 transition-colors">
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-glow animate-pulse" />
          <span>IoT Dispenser &bull; ESP32 DevKit V1 &bull; 4x 74HC595 &bull; DS3231 RTC</span>
        </div>

        {/* Hero Title with Luminous Glow */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
          Never Miss a Critical Dose. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_4px_30px_rgba(20,184,166,0.35)]">
            Precision Smart Medication Dispenser.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          An automated 28-compartment healthcare solution pairing an ESP32 microcontroller, 
          cascaded shift registers, and autonomous real-time clock synchronization for zero missed doses.
        </p>

        {/* Hero Action Buttons with Glassmorphic Depth */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-3">
          <Link
            href="/dashboard"
            className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-extrabold text-sm shadow-xl shadow-teal-500/30 hover:shadow-teal-400/50 flex items-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            <span>Launch Patient Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="px-7 py-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 backdrop-blur-xl border border-white/10 hover:border-teal-500/40 text-slate-100 hover:text-white font-bold text-sm shadow-xl flex items-center gap-2 transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            <Lock className="w-4 h-4 text-teal-400" />
            <span>Sign In to Portal</span>
          </Link>
        </div>

        {/* Live Hardware Glass Banner */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>28 Cascaded LEDs</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Autonomous RTC Backup</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Firebase Realtime Cloud</span>
          </div>
        </div>
      </section>

      {/* 2. Core System Architecture Grid with Glassmorphic Cards */}
      <section className="max-w-6xl mx-auto px-4 relative">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400 inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 mb-2">
            Engineering Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Built for Medical Precision &amp; Reliability
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            High-reliability embedded hardware meets real-time cloud synchronization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-7 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] shadow-2xl hover:border-teal-500/40 hover:bg-slate-900/75 hover:shadow-teal-500/10 transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-teal-500/20 transition-all" />
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-teal-500/20 transition-all shadow-inner">
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
          <div className="p-7 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] shadow-2xl hover:border-sky-500/40 hover:bg-slate-900/75 hover:shadow-sky-500/10 transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-sky-500/20 transition-all" />
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-sky-500/20 transition-all shadow-inner">
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
          <div className="p-7 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] shadow-2xl hover:border-indigo-500/40 hover:bg-slate-900/75 hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-all" />
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all shadow-inner">
              <Wifi className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors mb-2">
              Firebase Realtime Database
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sub-second bi-directional synchronization. Web schedule updates automatically push to ESP32 Flash (NVS), 
              and physical button clicks sync back to caregiver screens.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-7 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] shadow-2xl hover:border-amber-500/40 hover:bg-slate-900/75 hover:shadow-amber-500/10 transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/20 transition-all" />
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all shadow-inner">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors mb-2">
              Multi-Sensory Alerts
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-visibility flashing LED on the specific compartment accompanied by audible piezo buzzer chime 
              ensures elderly or hearing-impaired patients notice medication times.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-7 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] shadow-2xl hover:border-emerald-500/40 hover:bg-slate-900/75 hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all shadow-inner">
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
          <div className="p-7 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] shadow-2xl hover:border-rose-500/40 hover:bg-slate-900/75 hover:shadow-rose-500/10 transition-all duration-300 hover:-translate-y-1.5 group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/20 transition-all" />
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-rose-500/20 transition-all shadow-inner">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white group-hover:text-rose-300 transition-colors mb-2">
              Caregiver Escalation
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              If an alarm is unacknowledged within 45 minutes, the system logs a missed dose event and triggers 
              caregiver notification protocols to safeguard patient health.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Workflow Protocol (3 Steps) with Glass Panels */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-400 inline-block px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 mb-2">
            Workflow Protocol
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            How MediGlow Operates
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center p-7 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] shadow-xl hover:border-teal-500/40 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-black text-sm flex items-center justify-center mb-4 shadow-lg shadow-teal-500/25 group-hover:scale-110 transition-transform">
              1
            </div>
            <h4 className="font-bold text-sm text-white mb-2 group-hover:text-teal-300 transition-colors">
              Caregiver Configures 28 Slots
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Prescription times and dosages are configured in the weekly planner and synced to Firebase.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center p-7 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] shadow-xl hover:border-teal-500/40 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-black text-sm flex items-center justify-center mb-4 shadow-lg shadow-teal-500/25 group-hover:scale-110 transition-transform">
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
          <div className="flex flex-col items-center text-center p-7 rounded-3xl bg-slate-900/50 backdrop-blur-xl border border-white/[0.08] shadow-xl hover:border-teal-500/40 transition-all duration-300 hover:-translate-y-1 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-black text-sm flex items-center justify-center mb-4 shadow-lg shadow-teal-500/25 group-hover:scale-110 transition-transform">
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
