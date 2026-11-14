"use client";

import React from 'react';
import { MedicineList } from '@/components/medicines/MedicineList';

export default function MedicinesPage() {
  return (
    <div className="animate-in fade-in duration-300">
      <MedicineList />
    </div>
  );
}

