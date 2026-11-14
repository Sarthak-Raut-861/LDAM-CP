"use client";

import React from 'react';
import { WeeklySchedulePlanner } from '@/components/schedule/WeeklySchedulePlanner';

export default function SchedulePage() {
  return (
    <div className="animate-in fade-in duration-300">
      <WeeklySchedulePlanner />
    </div>
  );
}

