"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { 
  RefreshCw, 
  Sun, 
  Moon, 
  Bell, 
  Cpu, 
  Clock, 
  Menu,
  ShieldCheck, 
  User as UserIcon,
  LogOut,
  Power,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';
import { formatTimeDisplay } from '@/lib/utils';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { 
    deviceStatus, 
    schedule, 
    settings, 
    updateSettings, 
    syncScheduleToDevice, 
    currentTime, 
    activeRemindersCount,
    toggleSimulatedActiveLed
  } = useApp();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [isSyncing, setIsSyncing] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const hasUnsyncedChanges = schedule.version > deviceStatus.lastSyncedVersion;

  const handleSync = async () => {
    setIsSyncing(true);
    await syncScheduleToDevice();
    setIsSyncing(false);
  };

  const toggleTheme = () => {
    updateSettings({
      theme: settings.theme === 'dark' ? 'light' : 'dark',
    });
  };

  const isHome = pathname === '/';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-2xs">
      {/* Brand & Left Navigation */}
      <div className="flex items-center gap-3">
        {user && onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-1 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 flex items-center justify-center text-white text-xs font-black shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            MG
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                MediGlow
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shadow-xs" title="System Operational" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium hidden sm:block leading-none">
              IoT Healthcare Dispenser
            </p>
          </div>
        </Link>

        {user && (
          <span className="hidden lg:inline-flex items-center gap-1 ml-2 px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/60 border border-teal-200/70 dark:border-teal-800 text-[10px] font-bold text-teal-700 dark:text-teal-300">
            <ShieldCheck className="w-3 h-3" />
            Clinical Portal
          </span>
        )}
      </div>

      {/* Center Section: Telemetry & Active Status */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active LED Physical Alert Pill (Shown when authenticated) */}
        {user && deviceStatus.activeLed ? (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300 animate-pulse shadow-sm">
            <span className="w-2 h-2 rounded-full bg-rose-500 shadow-glow-red" />
            <span>LED #{deviceStatus.activeLed} ACTIVE</span>
            <button
              onClick={() => toggleSimulatedActiveLed(null)}
              className="ml-1 px-2 py-0.5 rounded-md bg-rose-200 dark:bg-rose-900 text-rose-950 dark:text-rose-100 hover:bg-rose-300 text-[10px] font-semibold"
              title="Acknowledge and turn off active LED"
            >
              Turn Off
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="font-mono font-semibold">
              {formatTimeDisplay(
                `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`,
                settings.timeFormat
              )}
            </span>
          </div>
        )}

        {/* ESP32 Hardware Status Pill */}
        {user && (
          <Link 
            href="/device"
            className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-teal-500 transition-colors"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${deviceStatus.isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span>{deviceStatus.isOnline ? 'ESP32 Linked' : 'Offline Mode'}</span>
          </Link>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* If logged in: Show Sync, Notifications, Theme, Profile */}
        {user ? (
          <>
            {/* Sync Button */}
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                hasUnsyncedChanges 
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-500/20 hover:bg-teal-700' 
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700'
              }`}
              title="Sync Schedule with ESP32 Flash"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isSyncing ? 'Syncing...' : hasUnsyncedChanges ? `Sync (v${schedule.version})` : 'Synced'}
              </span>
            </button>

            {/* Notifications Bell */}
            <Link
              href="/reminders"
              className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Reminders &amp; Alerts"
            >
              <Bell className="w-4 h-4" />
              {activeRemindersCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Light/Dark Theme"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* User Profile Dropdown */}
            <div className="relative ml-1">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center text-white text-xs font-black shadow-xs">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              </button>

              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-60 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-bold text-slate-900 dark:text-white truncate">
                      {user.displayName || 'Authorized User'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {user.email || 'patient@mediglow.health'}
                    </p>
                  </div>

                  <div className="py-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>Clinical Dashboard</span>
                    </Link>
                    <Link
                      href="/device"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                    >
                      <Cpu className="w-3.5 h-3.5 text-slate-400" />
                      <span>ESP32 Hardware Diagnostics</span>
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-left font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Public Unauthenticated State */
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Light/Dark Theme"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>

            {/* Sign In Button */}
            <Link
              href="/login"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};
