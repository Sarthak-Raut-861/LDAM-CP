"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { 
  Home,
  LayoutDashboard, 
  CalendarDays, 
  Pill, 
  BellRing, 
  Cpu, 
  BarChart3, 
  X
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const pathname = usePathname();
  const { deviceStatus, activeRemindersCount } = useApp();

  const navItems = [
    {
      label: 'Home (Landing)',
      href: '/',
      icon: Home,
    },
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      label: 'Weekly Schedule',
      href: '/schedule',
      icon: CalendarDays,
      badge: '28 LEDs'
    },
    {
      label: 'Medicine Library',
      href: '/medicines',
      icon: Pill,
    },
    {
      label: 'Reminders & Logs',
      href: '/reminders',
      icon: BellRing,
      count: activeRemindersCount > 0 ? activeRemindersCount : undefined
    },
    {
      label: 'ESP32 & 28-LED Map',
      href: '/device',
      icon: Cpu,
      onlineBadge: deviceStatus.isOnline
    },
    {
      label: 'Reports & Adherence',
      href: '/reports',
      icon: BarChart3,
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950/90 backdrop-blur-2xl border-r border-white/[0.08] flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header Close */}
        <div className="flex items-center justify-between p-4 md:hidden border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <img 
              src="/mediglow-icon.png" 
              alt="MediGlow Logo" 
              className="h-7 w-auto object-contain drop-shadow-xs" 
            />
            <span className="font-bold text-sm text-white">MediGlow</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Nav items */}
        <div className="flex-1 px-3 py-6 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Menu
          </div>

          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-500/15 border border-teal-500/30 text-teal-300 font-semibold shadow-xs'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10">
                      {item.badge}
                    </span>
                  )}

                  {item.count && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                      {item.count}
                    </span>
                  )}

                  {item.onlineBadge !== undefined && (
                    <span className={`w-1.5 h-1.5 rounded-full ${item.onlineBadge ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
};
