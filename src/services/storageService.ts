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
import { 
  INITIAL_MEDICINES, 
  createDefaultWeeklySchedule, 
  INITIAL_REMINDER_HISTORY, 
  INITIAL_DEVICE_STATUS, 
  INITIAL_USER_SETTINGS 
} from '@/lib/defaultData';
import { database, isRealFirebaseConfigured } from '@/lib/firebase';
import { ref, set, get, onValue } from 'firebase/database';
import { formatScheduleForEsp32 } from '@/services/esp32Contract';

const KEYS = {
  MEDICINES: 'mediglow_medicines_v1',
  SCHEDULE: 'mediglow_schedule_v1',
  REMINDERS: 'mediglow_reminders_v1',
  DEVICE: 'mediglow_device_status_v1',
  SETTINGS: 'mediglow_settings_v1',
  PROFILE: 'mediglow_user_profile_v1',
};

class StorageService {
  private isClient(): boolean {
    return typeof window !== 'undefined';
  }

  // --- MEDICINES ---
  getMedicines(): Medicine[] {
    if (!this.isClient()) return INITIAL_MEDICINES;
    try {
      const stored = localStorage.getItem(KEYS.MEDICINES);
      if (stored) {
        return JSON.parse(stored);
      }
      this.saveMedicines(INITIAL_MEDICINES);
      return INITIAL_MEDICINES;
    } catch {
      return INITIAL_MEDICINES;
    }
  }

  saveMedicines(medicines: Medicine[]): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(KEYS.MEDICINES, JSON.stringify(medicines));
      if (isRealFirebaseConfigured && database) {
        set(ref(database, 'medicines'), medicines).catch(console.error);
      }
    } catch (err) {
      console.error('Failed to save medicines to local storage', err);
    }
  }

  addMedicine(medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>): Medicine {
    const medicines = this.getMedicines();
    const newMed: Medicine = {
      ...medicine,
      id: `med_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    medicines.unshift(newMed);
    this.saveMedicines(medicines);
    return newMed;
  }

  updateMedicine(id: string, updates: Partial<Medicine>): Medicine | null {
    const medicines = this.getMedicines();
    const index = medicines.findIndex(m => m.id === id);
    if (index === -1) return null;

    medicines[index] = {
      ...medicines[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveMedicines(medicines);

    // Also update any schedule slots that use this medicine
    const schedule = this.getSchedule();
    let scheduleUpdated = false;
    Object.values(schedule.slots).forEach(slot => {
      if (slot.medicineId === id) {
        if (updates.name) slot.medicineName = updates.name;
        if (updates.dosage) slot.dosage = updates.dosage;
        if (updates.instructions) slot.instructions = updates.instructions;
        scheduleUpdated = true;
      }
    });
    if (scheduleUpdated) {
      this.saveSchedule(schedule, false);
    }

    return medicines[index];
  }

  deleteMedicine(id: string): boolean {
    const medicines = this.getMedicines();
    const filtered = medicines.filter(m => m.id !== id);
    if (filtered.length !== medicines.length) {
      this.saveMedicines(filtered);
      return true;
    }
    return false;
  }

  // --- SCHEDULE ---
  getSchedule(): WeeklySchedule {
    if (!this.isClient()) return createDefaultWeeklySchedule();
    try {
      const stored = localStorage.getItem(KEYS.SCHEDULE);
      if (stored) {
        return JSON.parse(stored);
      }
      const defaultSched = createDefaultWeeklySchedule();
      this.saveSchedule(defaultSched, false);
      return defaultSched;
    } catch {
      return createDefaultWeeklySchedule();
    }
  }

  saveSchedule(schedule: WeeklySchedule, incrementVersion: boolean = true): WeeklySchedule {
    if (!this.isClient()) return schedule;
    try {
      const updated: WeeklySchedule = {
        ...schedule,
        version: incrementVersion ? schedule.version + 1 : schedule.version,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(KEYS.SCHEDULE, JSON.stringify(updated));

      // Update Device target version so sync badge knows schedule is ahead
      const device = this.getDeviceStatus();
      this.saveDeviceStatus({
        ...device,
        currentCloudVersion: updated.version,
      });

      if (isRealFirebaseConfigured && database) {
        const esp32Payload = formatScheduleForEsp32(updated);
        set(ref(database, 'weeklySchedule'), esp32Payload).catch(console.error);
        set(ref(database, 'weeklyScheduleRaw'), updated).catch(console.error);
        set(ref(database, 'deviceSyncStatus/currentCloudVersion'), updated.version).catch(console.error);
      }

      return updated;
    } catch (err) {
      console.error('Failed to save schedule', err);
      return schedule;
    }
  }

  updateSlot(
    day: DayOfWeek, 
    slot: SlotName, 
    updates: Partial<ScheduleSlot>
  ): WeeklySchedule {
    const schedule = this.getSchedule();
    const slotKey = `${day}_${slot}`;
    const ledId = getLedId(day, slot);

    const existingSlot = schedule.slots[slotKey] || {
      id: slotKey,
      ledId,
      dayOfWeek: day,
      slot,
      enabled: false,
      reminderTime: '08:00',
      updatedAt: new Date().toISOString(),
    };

    schedule.slots[slotKey] = {
      ...existingSlot,
      ...updates,
      ledId, // immutable LED mapping!
      dayOfWeek: day,
      slot,
      updatedAt: new Date().toISOString(),
    };

    return this.saveSchedule(schedule, true);
  }

  copyDaySchedule(sourceDay: DayOfWeek, targetDays: DayOfWeek[]): WeeklySchedule {
    const schedule = this.getSchedule();
    const slots = ['morning', 'noon', 'evening', 'night'] as SlotName[];

    targetDays.forEach(targetDay => {
      slots.forEach(slot => {
        const sourceKey = `${sourceDay}_${slot}`;
        const targetKey = `${targetDay}_${slot}`;
        const sourceSlot = schedule.slots[sourceKey];
        const targetLedId = getLedId(targetDay, slot);

        if (sourceSlot) {
          schedule.slots[targetKey] = {
            ...sourceSlot,
            id: targetKey,
            ledId: targetLedId,
            dayOfWeek: targetDay,
            slot,
            updatedAt: new Date().toISOString(),
          };
        }
      });
    });

    return this.saveSchedule(schedule, true);
  }

  bulkConfigure(
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
  ): WeeklySchedule {
    const schedule = this.getSchedule();

    days.forEach(day => {
      slots.forEach(slot => {
        const slotKey = `${day}_${slot}`;
        const ledId = getLedId(day, slot);
        const existing = schedule.slots[slotKey];

        schedule.slots[slotKey] = {
          ...(existing || {}),
          id: slotKey,
          ledId,
          dayOfWeek: day,
          slot,
          enabled: config.enabled,
          reminderTime: config.reminderTime || existing?.reminderTime || '08:00',
          medicineId: config.medicineId ?? existing?.medicineId,
          medicineName: config.medicineName ?? existing?.medicineName,
          dosage: config.dosage ?? existing?.dosage,
          instructions: config.instructions ?? existing?.instructions,
          updatedAt: new Date().toISOString(),
        };
      });
    });

    return this.saveSchedule(schedule, true);
  }

  // --- REMINDERS & AUDIT HISTORY ---
  getReminders(): ReminderEvent[] {
    if (!this.isClient()) return INITIAL_REMINDER_HISTORY;
    try {
      const stored = localStorage.getItem(KEYS.REMINDERS);
      if (stored) {
        return JSON.parse(stored);
      }
      this.saveReminders(INITIAL_REMINDER_HISTORY);
      return INITIAL_REMINDER_HISTORY;
    } catch {
      return INITIAL_REMINDER_HISTORY;
    }
  }

  saveReminders(reminders: ReminderEvent[]): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(KEYS.REMINDERS, JSON.stringify(reminders));
      if (isRealFirebaseConfigured && database) {
        set(ref(database, 'reminders'), reminders).catch(console.error);
      }
    } catch (err) {
      console.error('Failed to save reminders', err);
    }
  }

  acknowledgeReminder(id: string, notes?: string): ReminderEvent | null {
    const reminders = this.getReminders();
    const index = reminders.findIndex(r => r.id === id);
    if (index === -1) return null;

    reminders[index] = {
      ...reminders[index],
      status: 'acknowledged',
      acknowledgedAt: new Date().toISOString(),
      source: 'web_ui',
      notes: notes || reminders[index].notes,
      ingestionVerified: false, // Critical medical disclaimer remains false
    };

    this.saveReminders(reminders);

    // If this reminder is the one currently active on the device, turn off active LED
    const device = this.getDeviceStatus();
    if (device.activeLed === reminders[index].ledId) {
      this.saveDeviceStatus({
        ...device,
        activeLed: null,
      });
    }

    return reminders[index];
  }

  snoozeReminder(id: string, minutes: number = 10): ReminderEvent | null {
    const reminders = this.getReminders();
    const index = reminders.findIndex(r => r.id === id);
    if (index === -1) return null;

    const snoozeTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    reminders[index] = {
      ...reminders[index],
      status: 'snoozed',
      snoozedUntil: snoozeTime,
    };

    this.saveReminders(reminders);
    return reminders[index];
  }

  // --- DEVICE TELEMETRY & SYNC ---
  getDeviceStatus(): DeviceTelemetry {
    if (!this.isClient()) return INITIAL_DEVICE_STATUS;
    try {
      const stored = localStorage.getItem(KEYS.DEVICE);
      if (stored) {
        return JSON.parse(stored);
      }
      this.saveDeviceStatus(INITIAL_DEVICE_STATUS);
      return INITIAL_DEVICE_STATUS;
    } catch {
      return INITIAL_DEVICE_STATUS;
    }
  }

  saveDeviceStatus(status: DeviceTelemetry): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(KEYS.DEVICE, JSON.stringify(status));
      if (isRealFirebaseConfigured && database) {
        set(ref(database, 'deviceSyncStatus'), status).catch(console.error);
        set(ref(database, 'deviceSyncStatus/activeLed'), status.activeLed).catch(console.error);
      }
    } catch (err) {
      console.error('Failed to save device status', err);
    }
  }

  triggerDeviceScheduleSync(): Promise<DeviceTelemetry> {
    const currentSchedule = this.getSchedule();
    const currentDevice = this.getDeviceStatus();

    // Push normalized ESP32 28-slot payload to Firebase
    if (isRealFirebaseConfigured && database) {
      const esp32Payload = formatScheduleForEsp32(currentSchedule);
      set(ref(database, 'weeklySchedule'), esp32Payload).catch(console.error);
      set(ref(database, 'weeklyScheduleRaw'), currentSchedule).catch(console.error);
      set(ref(database, 'deviceSyncStatus/currentCloudVersion'), currentSchedule.version).catch(console.error);
    }

    return new Promise((resolve) => {
      // Simulate network round-trip to ESP32 DevKit V1
      setTimeout(() => {
        const updated: DeviceTelemetry = {
          ...currentDevice,
          lastSeen: new Date().toISOString(),
          lastSyncedVersion: currentSchedule.version,
          currentCloudVersion: currentSchedule.version,
          syncSuccess: true,
          lastSyncAttempt: new Date().toISOString(),
          rtcTime: new Date().toISOString(),
        };
        this.saveDeviceStatus(updated);
        resolve(updated);
      }, 900);
    });
  }

  simulateHardwareTrigger(ledId: number): void {
    const device = this.getDeviceStatus();
    device.activeLed = ledId;
    device.lastSeen = new Date().toISOString();
    this.saveDeviceStatus(device);
  }

  clearHardwareTrigger(): void {
    const device = this.getDeviceStatus();
    device.activeLed = null;
    this.saveDeviceStatus(device);
  }

  // --- SETTINGS ---
  getSettings(): UserSettings {
    if (!this.isClient()) return INITIAL_USER_SETTINGS;
    try {
      const stored = localStorage.getItem(KEYS.SETTINGS);
      if (stored) {
        return JSON.parse(stored);
      }
      this.saveSettings(INITIAL_USER_SETTINGS);
      return INITIAL_USER_SETTINGS;
    } catch {
      return INITIAL_USER_SETTINGS;
    }
  }

  saveSettings(settings: UserSettings): void {
    if (!this.isClient()) return;
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (err) {
      console.error('Failed to save settings', err);
    }
  }

  resetAllToDemoData(): void {
    if (!this.isClient()) return;
    localStorage.removeItem(KEYS.MEDICINES);
    localStorage.removeItem(KEYS.SCHEDULE);
    localStorage.removeItem(KEYS.REMINDERS);
    localStorage.removeItem(KEYS.DEVICE);
    localStorage.removeItem(KEYS.SETTINGS);
    this.saveMedicines(INITIAL_MEDICINES);
    this.saveSchedule(createDefaultWeeklySchedule(), false);
    this.saveReminders(INITIAL_REMINDER_HISTORY);
    this.saveDeviceStatus(INITIAL_DEVICE_STATUS);
    this.saveSettings(INITIAL_USER_SETTINGS);
  }
}

export const storageService = new StorageService();

