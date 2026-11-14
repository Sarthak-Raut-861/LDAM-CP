"use client";

import React from 'react';
import { ActiveRemindersFeed } from '@/components/reminders/ActiveRemindersFeed';

export default function RemindersPage() {
  return (
    <div className="animate-in fade-in duration-300">
      <ActiveRemindersFeed />
    </div>
  );
}

