"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { 
  RefreshCw, 
  Bell, 
  Cpu, 
  Menu, 
  ShieldCheck, 
  LogOut, 
  Lock, 
  Layers,
  ArrowRight,
  ArrowLeft,
  User
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { 
    deviceStatus, 
    schedule, 
    syncScheduleToDevice, 
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

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 bg-slate-950/80 backdrop-blur-2xl border-b border-white/[0.08] shadow-sm transition-all">
      {/* Brand & Left Navigation */}
      <div className="flex items-center gap-3">
        {user && onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 -ml-1 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 md:hidden transition-colors"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-3 group">
          <img 
            src="/mediglow-icon.png" 
            alt="MediGlow Logo" 
            className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-[0_2px_14px_rgba(20,184,166,0.4)]" 
          />
          <div className="flex flex-col">
            <span className="font-black text-lg sm:text-xl tracking-tight text-white leading-none">
              Medi<span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent group-hover:from-teal-300 group-hover:to-cyan-300 transition-colors">Glow</span>
            </span>
            <span className="text-[9px] sm:text-[10px] text-teal-300/90 font-medium tracking-wide mt-1 leading-none">
              Your Health, Right on Time.
            </span>
          </div>
        </Link>

        {user && (
          <span className="hidden lg:inline-flex items-center gap-1 ml-2 px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-[10px] font-bold text-teal-300">
            <ShieldCheck className="w-3 h-3" />
            Clinical Portal
          </span>
        )}
      </div>

      {/* Center Section */}
      <div className="flex items-center gap-4">
        {user ? (
          <>
            {Boolean(deviceStatus.activeLed || (deviceStatus.activeLeds && deviceStatus.activeLeds.length > 0)) && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-bold text-rose-300 animate-pulse shadow-sm">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-glow-red" />
                <span>
                  {deviceStatus.activeLeds && deviceStatus.activeLeds.length > 1
                    ? `${deviceStatus.activeLeds.length} LEDs ACTIVE`
                    : `LED #${deviceStatus.activeLed || deviceStatus.activeLeds?.[0]} ACTIVE`}
                </span>
                <button
                  onClick={() => toggleSimulatedActiveLed(null)}
                  className="ml-1 px-2 py-0.5 rounded-md bg-rose-900/80 text-rose-100 hover:bg-rose-800 text-[10px] font-semibold transition-colors"
                >
                  Turn Off
                </button>
              </div>
            )}

            <Link 
              href="/device"
              className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border bg-white/5 border-white/10 text-slate-300 hover:border-teal-500/50 hover:bg-white/10 transition-colors"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${deviceStatus.isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              <span>{deviceStatus.isOnline ? 'ESP32 Linked' : 'Offline'}</span>
            </Link>
          </>
        ) : pathname === '/login' ? (
          /* Public Header Status for Login View */
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-xl border border-white/10 text-xs text-slate-300 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-white">User Portal</span>
            <span className="text-slate-500">•</span>
            <span className="text-teal-300 font-medium">Single Patient Gateway</span>
          </div>
        ) : (
          /* Public Center Nav Links on Landing Page */
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-300">
            <Link href="/#overview" className="hover:text-teal-300 transition-colors">
              Overview
            </Link>
            <Link href="/#architecture" className="hover:text-teal-300 transition-colors">
              Architecture
            </Link>
            <Link href="/#workflow" className="hover:text-teal-300 transition-colors">
              Workflow
            </Link>
          </nav>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {user ? (
          <>
            <button
              onClick={handleSync}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                hasUnsyncedChanges 
                  ? 'bg-teal-500 text-white shadow-md shadow-teal-500/25 hover:bg-teal-400' 
                  : 'text-slate-300 hover:bg-white/5 border border-white/10'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isSyncing ? 'Syncing...' : hasUnsyncedChanges ? `Sync (v${schedule.version})` : 'Synced'}
              </span>
            </button>

            <Link
              href="/reminders"
              className="relative p-2 rounded-xl text-slate-300 hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {activeRemindersCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              )}
            </Link>

            <div className="relative ml-1">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white text-xs font-black shadow-xs">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              </button>

              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-60 rounded-2xl bg-slate-900/95 backdrop-blur-2xl border border-white/10 shadow-2xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-150"
                  onMouseLeave={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-4 py-2.5 border-b border-white/10">
                    <p className="font-bold text-white truncate">
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
                      className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-white/5 transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>Clinical Dashboard</span>
                    </Link>
                    <Link
                      href="/device"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-slate-300 hover:bg-white/5 transition-colors"
                    >
                      <Cpu className="w-3.5 h-3.5 text-slate-400" />
                      <span>ESP32 Hardware Diagnostics</span>
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-rose-400 hover:bg-rose-500/10 text-left font-semibold transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : pathname === '/login' ? (
          <Link
            href="/"
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-teal-500/40 text-slate-200 hover:text-white font-semibold text-xs transition-all hover:scale-[1.02] shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-teal-400" />
            <span>Back to Home</span>
          </Link>
        ) : (
          <Link
            href="/login"
            className="group flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-400 hover:from-teal-400 hover:to-emerald-400 text-white font-bold text-xs shadow-md shadow-teal-500/25 hover:shadow-teal-500/40 border border-teal-300/30 transition-all hover:scale-[1.03] active:scale-[0.98]"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </div>
    </header>
  );
};
