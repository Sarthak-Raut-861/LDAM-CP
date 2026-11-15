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
  Layers
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

        <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5 group">
          <img 
            src="/mediglow-icon.png" 
            alt="MediGlow Logo" 
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105 drop-shadow-[0_2px_12px_rgba(20,184,166,0.35)]" 
          />
          <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-teal-300 transition-colors">
            MediGlow
          </span>
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
            {deviceStatus.activeLed && (
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-xs font-bold text-rose-300 animate-pulse shadow-sm">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-glow-red" />
                <span>LED #{deviceStatus.activeLed} ACTIVE</span>
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
        ) : (
          /* Public Center Nav Links */
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
            <a href="#overview" className="hover:text-teal-300 transition-colors">
              Overview
            </a>
            <a href="#architecture" className="hover:text-teal-300 transition-colors">
              Architecture
            </a>
            <a href="#workflow" className="hover:text-teal-300 transition-colors">
              Workflow
            </a>
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
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-teal-500/15 border border-teal-500/30 hover:border-teal-400/50 hover:bg-teal-500/25 text-teal-300 font-bold text-xs shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Lock className="w-3.5 h-3.5 text-teal-400" />
            <span>Sign In</span>
          </Link>
        )}
      </div>
    </header>
  );
};
