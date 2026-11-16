"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  Medicine, 
  WeeklySchedule, 
  ScheduleSlot, 
  ReminderEvent, 
  DeviceTelemetry, 
  UserSettings, 
  DayOfWeek, 
  SlotName,
  getLedId
} from '@/types';
import { storageService } from '@/services/storageService';
import { formatScheduleForEsp32 } from '@/services/esp32Contract';
import { soundFx } from '@/lib/audio';
import { getTodayDayOfWeek } from '@/lib/utils';
import { database, isRealFirebaseConfigured } from '@/lib/firebase';
import { ref, onValue } from 'firebase/database';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  duration?: number;
}

interface AppContextType {
  medicines: Medicine[];
  schedule: WeeklySchedule;
  reminders: ReminderEvent[];
  deviceStatus: DeviceTelemetry;
  settings: UserSettings;
  currentTime: Date;
  todayDay: DayOfWeek;
  activeRemindersCount: number;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  
  // Medicine methods
  addMedicine: (med: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateMedicine: (id: string, updates: Partial<Medicine>) => void;
  deleteMedicine: (id: string) => void;
  
  // Schedule methods
  updateScheduleSlot: (day: DayOfWeek, slot: SlotName, updates: Partial<ScheduleSlot>) => void;
  copyDaySchedule: (source: DayOfWeek, targets: DayOfWeek[]) => void;
  bulkConfigureSchedule: (days: DayOfWeek[], slots: SlotName[], config: {
    enabled: boolean;
    reminderTime?: string;
    medicineId?: string;
    medicineName?: string;
    dosage?: string;
    instructions?: string;
  }) => void;
  syncScheduleToDevice: () => Promise<void>;
  
  // Reminder methods
  acknowledgeReminder: (id: string, notes?: string) => void;
  snoozeReminder: (id: string, minutes?: number) => void;
  triggerTestReminder: (ledId: number) => void;
  
  // Device & Simulation methods
  toggleSimulatedActiveLed: (ledId: number | null) => void;
  toggleDevicePower: () => void;
  
  // Settings methods
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [schedule, setSchedule] = useState<WeeklySchedule>(storageService.getSchedule());
  const [reminders, setReminders] = useState<ReminderEvent[]>([]);
  const [deviceStatus, setDeviceStatus] = useState<DeviceTelemetry>(storageService.getDeviceStatus());
  const [settings, setSettings] = useState<UserSettings>(storageService.getSettings());
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [todayDay, setTodayDay] = useState<DayOfWeek>(getTodayDayOfWeek());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Load initial data
  useEffect(() => {
    setMedicines(storageService.getMedicines());
    setSchedule(storageService.getSchedule());
    setReminders(storageService.getReminders());
    setDeviceStatus(storageService.getDeviceStatus());
    setSettings(storageService.getSettings());
  }, []);

  // Bi-directional live Firebase Realtime Database listener
  useEffect(() => {
    if (!isRealFirebaseConfigured || !database) return;

    try {
      const activeLedRef = ref(database, 'deviceSyncStatus/activeLed');
      const unsubscribe = onValue(activeLedRef, (snapshot) => {
        const val = snapshot.val();
        let parsedActiveLeds: number[] = [];
        let primaryActiveLed: number | null = null;

        if (Array.isArray(val)) {
          parsedActiveLeds = val.map(Number).filter(n => !isNaN(n));
          primaryActiveLed = parsedActiveLeds.length > 0 ? parsedActiveLeds[parsedActiveLeds.length - 1] : null;
        } else if (typeof val === 'number') {
          primaryActiveLed = val;
          parsedActiveLeds = [val];
        } else {
          primaryActiveLed = null;
          parsedActiveLeds = [];
        }
        
        setDeviceStatus((prev) => {
          return {
            ...prev,
            activeLed: primaryActiveLed,
            activeLeds: parsedActiveLeds,
            lastSeen: new Date().toISOString(),
          };
        });
      });

      return () => unsubscribe();
    } catch (err) {
      console.warn('Realtime database subscription note:', err);
    }
  }, []);

  // Sync theme to document body
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Live RTC Clock tick
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setTodayDay(getTodayDayOfWeek());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Toast manager
  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    const duration = toast.duration || 4500;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Medicine operations
  const handleAddMedicine = (med: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = storageService.addMedicine(med);
    setMedicines(storageService.getMedicines());
    addToast({
      type: 'success',
      title: 'Medicine Added',
      message: `${created.name} (${created.dosage}) is now available in your regimen.`,
    });
  };

  const handleUpdateMedicine = (id: string, updates: Partial<Medicine>) => {
    const updated = storageService.updateMedicine(id, updates);
    if (updated) {
      setMedicines(storageService.getMedicines());
      setSchedule(storageService.getSchedule());
      addToast({
        type: 'success',
        title: 'Medicine Updated',
        message: `Changes to ${updated.name} have been saved and schedule synchronized.`,
      });
    }
  };

  const handleDeleteMedicine = (id: string) => {
    const target = medicines.find(m => m.id === id);
    if (storageService.deleteMedicine(id)) {
      setMedicines(storageService.getMedicines());
      addToast({
        type: 'info',
        title: 'Medicine Removed',
        message: `${target?.name || 'Item'} has been deleted.`,
      });
    }
  };

  // Schedule operations
  const handleUpdateScheduleSlot = (day: DayOfWeek, slot: SlotName, updates: Partial<ScheduleSlot>) => {
    const updated = storageService.updateSlot(day, slot, updates);
    setSchedule(updated);
    setDeviceStatus(storageService.getDeviceStatus());
    addToast({
      type: 'success',
      title: 'Schedule Updated',
      message: `${day} ${slot.toUpperCase()} updated (v${updated.version}). Device sync pending.`,
    });
  };

  const handleCopyDaySchedule = (source: DayOfWeek, targets: DayOfWeek[]) => {
    const updated = storageService.copyDaySchedule(source, targets);
    setSchedule(updated);
    setDeviceStatus(storageService.getDeviceStatus());
    addToast({
      type: 'success',
      title: 'Schedule Cloned',
      message: `Replicated ${source} schedule to ${targets.length} selected days.`,
    });
  };

  const handleBulkConfigure = (
    days: DayOfWeek[], 
    slots: SlotName[], 
    config: {
      enabled: boolean;
      reminderTime?: string;
      medicineId?: string;
      medicineName?: string;
      dosage?: string;
      instructions?: string;
    }
  ) => {
    const updated = storageService.bulkConfigure(days, slots, config);
    setSchedule(updated);
    setDeviceStatus(storageService.getDeviceStatus());
    addToast({
      type: 'success',
      title: 'Bulk Configuration Applied',
      message: `Updated ${days.length * slots.length} slots across your 7-day schedule.`,
    });
  };

  const syncScheduleToDevice = async () => {
    addToast({
      type: 'info',
      title: 'Synchronizing with ESP32...',
      message: `Transmitting schedule v${schedule.version} over local Wi-Fi to DevKit V1.`,
    });

    try {
      const updatedDevice = await storageService.triggerDeviceScheduleSync();
      setDeviceStatus(updatedDevice);
      if (settings.soundAlerts) {
        soundFx.playSuccess();
      }
      addToast({
        type: 'success',
        title: 'Hardware Synchronized!',
        message: `ESP32 DevKit V1 & DS3231 RTC stored schedule v${updatedDevice.lastSyncedVersion}. Offline safe.`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Sync Failed',
        message: 'Could not reach ESP32. Ensure device is powered and connected to Wi-Fi.',
      });
    }
  };

  // Reminder operations
  const handleAcknowledgeReminder = (id: string, notes?: string) => {
    const updated = storageService.acknowledgeReminder(id, notes);
    if (updated) {
      setReminders(storageService.getReminders());
      setDeviceStatus(storageService.getDeviceStatus());
      if (settings.soundAlerts) {
        soundFx.playSuccess();
      }
      addToast({
        type: 'success',
        title: 'Reminder Acknowledged',
        message: `${updated.medicineName} recorded. Note: Physical ingestion remains unverified.`,
      });
    }
  };

  const handleSnoozeReminder = (id: string, minutes: number = 10) => {
    const snoozed = storageService.snoozeReminder(id, minutes);
    if (snoozed) {
      setReminders(storageService.getReminders());
      addToast({
        type: 'info',
        title: 'Reminder Snoozed',
        message: `Alarm deferred for ${minutes} minutes.`,
      });
    }
  };

  const triggerTestReminder = (ledId: number) => {
    storageService.simulateHardwareTrigger(ledId);
    setDeviceStatus(storageService.getDeviceStatus());
    if (settings.soundAlerts) {
      soundFx.playAlert();
    }
    addToast({
      type: 'warning',
      title: `Hardware Alert: LED ${ledId} Active!`,
      message: `Physical LED ${ledId} is flashing on the dispenser unit.`,
    });
  };

  const toggleSimulatedActiveLed = (ledId: number | null) => {
    if (ledId === null) {
      storageService.clearHardwareTrigger();
      // Send to server route for ESP32 polling
      fetch('/api/esp32/active-led', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ledId: null, activeLeds: [] }),
      }).catch(() => {});
      addToast({
        type: 'info',
        title: 'All LEDs Turned Off',
        message: 'All 28 shift register output channels set to LOW.',
        duration: 2500,
      });
    } else {
      storageService.simulateHardwareTrigger(ledId);
      const updated = storageService.getDeviceStatus();
      const currentList = updated.activeLeds || (updated.activeLed ? [updated.activeLed] : []);
      const isNowActive = currentList.includes(ledId);

      // Send to server route for ESP32 polling
      fetch('/api/esp32/active-led', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ledId: updated.activeLed,
          activeLeds: currentList 
        }),
      }).catch(() => {});

      if (settings.soundAlerts && isNowActive) {
        soundFx.playAlert();
      }
      
      const dayNamesList = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      let title = isNowActive ? `LED #${ledId} Turned ON` : `LED #${ledId} Turned OFF`;
      let message = isNowActive 
        ? `${currentList.length} LED${currentList.length === 1 ? '' : 's'} active on dispenser hardware.`
        : `LED #${ledId} turned off. ${currentList.length} LED${currentList.length === 1 ? '' : 's'} remaining active.`;
      
      if (ledId >= 30 && ledId <= 36) {
        const dName = dayNamesList[ledId - 30];
        title = `Physical Alert: ${dName} LEDs Toggled`;
        message = `Compartment LEDs for ${dName} updated on dispenser.`;
      }

      addToast({
        type: isNowActive ? 'warning' : 'info',
        title,
        message,
        duration: 2500,
      });
    }
    setDeviceStatus(storageService.getDeviceStatus());
  };

  const toggleDevicePower = () => {
    const current = storageService.getDeviceStatus();
    const updated: DeviceTelemetry = {
      ...current,
      isOnline: !current.isOnline,
      lastSeen: new Date().toISOString(),
      activeLed: !current.isOnline ? null : current.activeLed,
    };
    storageService.saveDeviceStatus(updated);
    setDeviceStatus(updated);
    addToast({
      type: updated.isOnline ? 'success' : 'warning',
      title: updated.isOnline ? 'ESP32 Device Online' : 'ESP32 Device Offline',
      message: updated.isOnline 
        ? 'Connected to HomeHealth_5G with RTC Synced.' 
        : 'Device offline. Reminders will continue using local DS3231 RTC.',
    });
  };

  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    const updated = { ...settings, ...newSettings };
    storageService.saveSettings(updated);
    setSettings(updated);
    addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Your preferences have been updated.',
    });
  };

  const handleResetToDemoData = () => {
    storageService.resetAllToDemoData();
    setMedicines(storageService.getMedicines());
    setSchedule(storageService.getSchedule());
    setReminders(storageService.getReminders());
    setDeviceStatus(storageService.getDeviceStatus());
    setSettings(storageService.getSettings());
    addToast({
      type: 'info',
      title: 'Default Schedule Restored',
      message: 'Standard 7-day 28-LED medical schedule and device status restored.',
    });
  };

  const activeRemindersCount = reminders.filter(r => r.status === 'triggered').length;

  return (
    <AppContext.Provider
      value={{
        medicines,
        schedule,
        reminders,
        deviceStatus,
        settings,
        currentTime,
        todayDay,
        activeRemindersCount,
        toasts,
        addToast,
        removeToast,
        addMedicine: handleAddMedicine,
        updateMedicine: handleUpdateMedicine,
        deleteMedicine: handleDeleteMedicine,
        updateScheduleSlot: handleUpdateScheduleSlot,
        copyDaySchedule: handleCopyDaySchedule,
        bulkConfigureSchedule: handleBulkConfigure,
        syncScheduleToDevice,
        acknowledgeReminder: handleAcknowledgeReminder,
        snoozeReminder: handleSnoozeReminder,
        triggerTestReminder,
        toggleSimulatedActiveLed,
        toggleDevicePower,
        updateSettings: handleUpdateSettings,
        resetToDemoData: handleResetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

