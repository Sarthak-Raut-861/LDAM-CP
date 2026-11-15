"use client";

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { ToastContainer } from '../ui/Toast';
import { useAuth } from '@/context/AuthContext';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  const isPublicPage = pathname === '/' || pathname === '/login';

  useEffect(() => {
    // If user is not authenticated and attempts to view protected routes, redirect to login
    if (!loading && !user && !isPublicPage) {
      router.push('/login');
    }
  }, [loading, user, isPublicPage, router]);

  // Loading spinner during auth initialization
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712]">
        <div className="flex flex-col items-center gap-3">
          <img 
            src="/mediglow-logo-dark.png" 
            alt="MediGlow Logo" 
            className="h-14 w-auto object-contain drop-shadow-[0_4px_24px_rgba(20,184,166,0.3)] animate-pulse"
          />
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
            <span>Verifying MediGlow Access Credentials...</span>
          </div>
        </div>
      </div>
    );
  }

  // If unauthenticated and on a protected route, show clinical security wall
  if (!user && !isPublicPage) {
    return (
      <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 font-sans">
        <Navbar onToggleSidebar={() => {}} />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-8 rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400 mx-auto flex items-center justify-center shadow-xs">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 inline-block px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 mb-1">
                Authorized Personnel Only
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                MediGlow Sign-In Required
              </h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Patient medication plans, 28-LED hardware controls, and adherence logs are protected under clinical compliance standards. Please sign in to view this content.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/login"
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-bold text-xs shadow-lg shadow-teal-500/25 transition-all hover:scale-[1.02]"
              >
                <span>Sign In to Access System</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </main>
        <Footer />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#030712] text-slate-100 font-sans selection:bg-teal-500 selection:text-white">
      {/* Top Navigation Bar */}
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* Main Workspace with Conditional Sidebar */}
      <div className="flex-1 flex">
        {!isPublicPage && user && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        <div className={`flex-1 flex flex-col transition-all ${isPublicPage || !user ? 'w-full' : 'md:pl-64'}`}>
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
          <Footer />
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};
