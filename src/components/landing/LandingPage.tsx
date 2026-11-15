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
  Lock
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="space-y-16 py-6 sm:py-10 animate-in fade-in duration-500">
      {/* 1. Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto px-4 space-y-6">
        {/* Hardware Status Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs font-semibold text-teal-700 dark:text-teal-300 shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>IoT Dispenser &bull; ESP32 DevKit V1 &bull; 4x 74HC595 &bull; DS3231 RTC</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
          Never Miss a Critical Dose. <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
            Precision Smart Medication Dispenser.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          An automated 28-compartment healthcare solution pairing an ESP32 microcontroller, 
          cascaded shift registers, and autonomous real-time clock synchronization for zero missed doses.
        </p>

        {/* Hero Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-lg shadow-teal-500/25 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Launch Patient Portal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/login"
            className="px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-bold text-sm shadow-xs flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Lock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Sign In to Portal</span>
          </Link>
        </div>

        {/* Live Hardware Banner */}
        <div className="pt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>28 Cascaded LEDs</span>
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Offline RTC Backup</span>
          </span>
          <span>&bull;</span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Firebase Realtime Bridge</span>
          </span>
        </div>
      </section>

      {/* 2. Core System Architecture Grid */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Engineering Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Built for Medical Precision &amp; Reliability
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              4x 74HC595 Shift Registers
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Controls 28 discrete output channels (7 days &times; 4 slots) using only 3 ESP32 GPIO pins 
              (DATA 19, CLK 18, LATCH 23) via cascaded serial-in, parallel-out architecture.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Autonomous DS3231 RTC
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Precision temperature-compensated I2C Real-Time Clock with coin cell backup. Alarms fire on schedule 
              even during router disconnects or cloud downtime.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
              <Wifi className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Firebase Realtime Database
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Sub-second bi-directional synchronization. Web schedule updates automatically push to ESP32 Flash (NVS), 
              and physical button clicks sync back to caregiver screens.
            </p>
          </div>

          {/* Card 4 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Multi-Sensory Alerts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              High-visibility flashing LED on the specific compartment accompanied by audible piezo buzzer chime 
              ensures elderly or hearing-impaired patients notice medication times.
            </p>
          </div>

          {/* Card 5 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Tactile Button Acknowledgement
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              A tactile button on GPIO 4 acknowledges doses, immediately silencing alerts, clearing active LEDs, 
              and recording compliance timestamps in the cloud.
            </p>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
              Caregiver Escalation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              If an alarm is unacknowledged within 45 minutes, the system logs a missed dose event and triggers 
              caregiver notification protocols to safeguard patient health.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Workflow Protocol (3 Steps) */}
      <section className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
            Workflow Protocol
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            How MediGlow Operates
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-black text-sm flex items-center justify-center mb-4 shadow-sm">
              1
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              Caregiver Configures 28 Slots
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Prescription times and dosages are configured in the weekly planner and synced to Firebase.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-black text-sm flex items-center justify-center mb-4 shadow-sm">
              2
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              ESP32 Flashes to NVS
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              The microcontroller downloads schedule version, saves slots to non-volatile flash, and monitors RTC time.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
            <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-black text-sm flex items-center justify-center mb-4 shadow-sm">
              3
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1">
              LED Shifting &amp; Patient Take
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              At dosage time, the exact 74HC595 bit goes HIGH, blinking the compartment LED until acknowledged.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
