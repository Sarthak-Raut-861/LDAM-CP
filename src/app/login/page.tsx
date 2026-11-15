"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import { 
  Lock, 
  Mail, 
  User, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Stethoscope, 
  HeartPulse,
  Eye,
  EyeOff
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, signup, resetPassword, isFirebaseActive } = useAuth();
  const { addToast } = useApp();

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === 'login') {
        await login(email, password);
        addToast({
          type: 'success',
          title: 'Welcome Back!',
          message: 'Signed in to MediGlow Clinical Cloud.',
        });
        router.push('/dashboard');
      } else if (mode === 'signup') {
        if (!name.trim()) throw new Error('Please enter your full name');
        await signup(name, email, password);
        addToast({
          type: 'success',
          title: 'Account Created',
          message: `Welcome to MediGlow, ${name}!`,
        });
        router.push('/dashboard');
      } else if (mode === 'reset') {
        await resetPassword(email);
        setMessage({ type: 'success', text: 'Password reset link sent to your email.' });
      }
    } catch (err: unknown) {
      const error = err as Error;
      setMessage({ type: 'error', text: error.message || 'Authentication failed' });
    } finally {
      setLoading(false);
    }
  };

  const loginAsPatient = async () => {
    setLoading(true);
    setEmail('patient.care@mediglow.health');
    setPassword('MediGlow@2026');
    try {
      await login('patient.care@mediglow.health', 'MediGlow@2026');
      addToast({
        type: 'success',
        title: 'Patient Access Granted',
        message: 'Signed in as Robert Vance (Patient #MG-83921)',
      });
      router.push('/dashboard');
    } catch {
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center py-10 px-4 overflow-hidden">
      {/* Background ambient glow orb */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      <div className="w-full max-w-md rounded-3xl bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Top Header Banner */}
        <div className="p-6 bg-gradient-to-br from-slate-950 via-teal-950/70 to-slate-900 text-white border-b border-white/[0.08] relative">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-teal-300 hover:text-white mb-3 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>

          <div className="mb-3">
            <img 
              src="/mediglow-logo-dark.png" 
              alt="MediGlow Logo" 
              className="h-14 w-auto object-contain drop-shadow-md"
            />
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white">
            {mode === 'login' ? 'Sign In to User Portal' : mode === 'signup' ? 'Create User Account' : 'Reset Password'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Your Health, Right on Time. &bull; Personal Medication System
          </p>
        </div>

        {/* Single User Portal Fast Access */}
        <div className="p-4 bg-white/[0.02] border-b border-white/[0.08]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Single User Portal
            </span>
            <span className="text-[10px] text-teal-400 font-semibold px-2.5 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20">
              Patient Access Only
            </span>
          </div>

          <button
            type="button"
            onClick={loginAsPatient}
            disabled={loading}
            className="w-full p-3 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-teal-500/10 hover:border-teal-500/40 text-left transition-all group flex items-center justify-between shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/15 border border-teal-500/30 text-teal-400 flex items-center justify-center group-hover:scale-105 transition-transform shadow-xs">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-white font-bold text-sm group-hover:text-teal-300 transition-colors">
                    Patient Portal
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-mono">
                    ID #MG-83921
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">Robert Vance &bull; patient.care@mediglow.health</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-teal-400 font-bold group-hover:translate-x-1 transition-transform pr-1">
              <span>Quick Login</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex border-b border-white/[0.08] text-xs font-bold text-center">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-3 transition-colors ${
              mode === 'login'
                ? 'border-b-2 border-teal-400 text-teal-300'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-3 transition-colors ${
              mode === 'signup'
                ? 'border-b-2 border-teal-400 text-teal-300'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {message && (
            <div className={`p-3 rounded-xl text-xs ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' 
                : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
            }`}>
              {message.text}
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. Robert Vance"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                placeholder="patient@mediglow.health"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300">
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-[11px] text-teal-400 hover:underline font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-white/10 bg-white/[0.04] text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 hover:from-teal-400 hover:via-emerald-400 hover:to-cyan-400 disabled:opacity-50 text-white font-extrabold text-sm shadow-xl shadow-teal-500/25 hover:shadow-teal-500/45 border border-teal-300/30 flex items-center justify-center gap-2.5 transition-all hover:scale-[1.01] active:scale-[0.99] group"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Authenticating User...</span>
              </span>
            ) : mode === 'login' ? (
              <>
                <span>Sign In to MediGlow</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            ) : mode === 'signup' ? (
              <>
                <span>Create User Account</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            ) : (
              <span>Send Reset Instructions</span>
            )}
          </button>
        </form>

        {/* Security badge footer */}
        <div className="p-4 bg-white/[0.02] border-t border-white/[0.08] flex items-center justify-center gap-2 text-slate-400 text-[11px]">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
          <span>256-Bit Encrypted Healthcare Gateway</span>
        </div>
      </div>
    </div>
  );
}
