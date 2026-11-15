"use client";

import React, { useState } from 'react';
import { HeroGreeting } from '@/components/dashboard/HeroGreeting';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { TodaySlotsCard } from '@/components/dashboard/TodaySlotsCard';
import { DispenserMatrix } from '@/components/dashboard/DispenserMatrix';
import { AdherenceStats } from '@/components/dashboard/AdherenceStats';
import { DeviceQuickStatus } from '@/components/dashboard/DeviceQuickStatus';
import { CaregiverCard } from '@/components/dashboard/CaregiverCard';
import { MedicineFormModal } from '@/components/medicines/MedicineFormModal';
import { useApp } from '@/context/AppContext';

export default function DashboardPage() {
  const { addMedicine } = useApp();
  const [addMedModalOpen, setAddMedModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Hero Greeting with active status and next upcoming reminder */}
      <HeroGreeting />

      {/* Interactive 28-Compartment Dispenser Visualizer (Directly reflects ESP32) */}
      <DispenserMatrix />

      {/* Today's 4 Medication Compartment Slots (Morning, Noon, Evening, Night) */}
      <TodaySlotsCard />

      {/* 2-Column: Adherence Statistics & Caregiver Safety Link */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdherenceStats />
        <CaregiverCard />
      </div>

      {/* ESP32 Hardware Diagnostics & Pinout */}
      <DeviceQuickStatus />

      {/* Quick Action Tiles */}
      <QuickActions onOpenAddMedicine={() => setAddMedModalOpen(true)} />

      {/* Modal for adding medicine from quick action */}
      <MedicineFormModal
        isOpen={addMedModalOpen}
        onClose={() => setAddMedModalOpen(false)}
        onSubmit={addMedicine}
      />
    </div>
  );
}

