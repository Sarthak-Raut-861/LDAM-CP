export type DayOfWeek = 
  | 'Monday' 
  | 'Tuesday' 
  | 'Wednesday' 
  | 'Thursday' 
  | 'Friday' 
  | 'Saturday' 
  | 'Sunday';

export type SlotName = 'morning' | 'noon' | 'evening' | 'night';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const SLOT_NAMES: SlotName[] = ['morning', 'noon', 'evening', 'night'];

export const DEFAULT_SLOT_TIMES: Record<SlotName, string> = {
  morning: '08:00',
  noon: '13:00',
  evening: '18:30',
  night: '21:30'
};

export const SLOT_LABELS: Record<SlotName, { label: string; icon: string; description: string }> = {
  morning: { label: 'Morning', icon: 'Sunrise', description: 'Breakfast & morning medications' },
  noon: { label: 'Noon', icon: 'Sun', description: 'Lunch & mid-day dosages' },
  evening: { label: 'Evening', icon: 'Sunset', description: 'Post-work / evening medications' },
  night: { label: 'Night', icon: 'Moon', description: 'Before sleep / night dosages' }
};

/**
 * Hardware LED mapping:
 * Monday: LEDs 1, 2, 3, 4
 * Tuesday: LEDs 5, 6, 7, 8
 * Wednesday: LEDs 9, 10, 11, 12
 * Thursday: LEDs 13, 14, 15, 16
 * Friday: LEDs 17, 18, 19, 20
 * Saturday: LEDs 21, 22, 23, 24
 * Sunday: LEDs 25, 26, 27, 28
 *
 * Shift Registers: 4 cascaded 74HC595 (8 bits each, 32 output channels, first 28 channels drive the 28 LEDs).
 */
export function getLedId(day: DayOfWeek, slot: SlotName): number {
  const dayIndex = DAYS_OF_WEEK.indexOf(day);
  const slotIndex = SLOT_NAMES.indexOf(slot);
  return dayIndex * 4 + slotIndex + 1;
}

export function getSlotFromLedId(ledId: number): { day: DayOfWeek; slot: SlotName } {
  const index = ledId - 1;
  const dayIndex = Math.floor(index / 4);
  const slotIndex = index % 4;
  return {
    day: DAYS_OF_WEEK[dayIndex],
    slot: SLOT_NAMES[slotIndex]
  };
}

export type MedicineForm = 
  | 'tablet' 
  | 'capsule' 
  | 'syrup' 
  | 'injection' 
  | 'drops' 
  | 'powder' 
  | 'inhaler' 
  | 'other';

export type FoodTiming = 
  | 'before_meal' 
  | 'after_meal' 
  | 'with_meal' 
  | 'empty_stomach' 
  | 'anytime';

export interface Medicine {
  id: string;
  name: string;
  dosage: string; // e.g. "500 mg", "10 ml"
  form: MedicineForm;
  instructions: string;
  foodTiming: FoodTiming;
  color?: string; // hex for pill visual or chip
  notes?: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleSlot {
  id: string; // e.g. "Monday_morning"
  ledId: number; // 1 to 28
  dayOfWeek: DayOfWeek;
  slot: SlotName;
  enabled: boolean;
  reminderTime: string; // "08:00" in 24h format
  medicineId?: string;
  medicineName?: string;
  dosage?: string;
  instructions?: string;
  notes?: string;
  updatedAt: string;
}

export interface WeeklySchedule {
  userId: string;
  version: number;
  timezone: string; // e.g. "Asia/Kolkata"
  slots: Record<string, ScheduleSlot>; // key: `${day}_${slot}`
  updatedAt: string;
  lastSyncedVersion?: number;
}

export type ReminderStatus = 
  | 'scheduled' 
  | 'triggered' 
  | 'acknowledged' 
  | 'missed' 
  | 'snoozed';

export interface ReminderEvent {
  id: string;
  ledId: number;
  dayOfWeek: DayOfWeek;
  slot: SlotName;
  medicineId?: string;
  medicineName: string;
  dosage: string;
  scheduledTime: string; // "08:00"
  date: string; // "2026-11-14"
  status: ReminderStatus;
  triggeredAt?: string;
  acknowledgedAt?: string;
  snoozedUntil?: string;
  source: 'web_ui' | 'esp32_button' | 'auto_timeout' | 'simulated';
  notes?: string;
  // Crucial legal/medical safety disclaimer
  ingestionVerified: false; // Must ALWAYS be false - acknowledgement is never physical proof of ingestion
}

export interface DeviceTelemetry {
  deviceId: string;
  deviceName: string;
  isOnline: boolean;
  lastSeen: string;
  ipAddress: string;
  macAddress: string;
  wifiSSID: string;
  wifiSignalDbm: number; // e.g. -62 dBm
  lastSyncedVersion: number;
  currentCloudVersion: number;
  rtcStatus: 'synced' | 'unsynced' | 'battery_low' | 'error';
  rtcTime: string;
  firmwareVersion: string;
  activeLed: number | null; // 1 to 28, or null
  activeLeds?: number[]; // Array of all currently active LED IDs, e.g. [1, 5, 12]
  shiftRegistersCount: 4;
  ledsCount: 28;
  isSimulated: boolean; // explicitly tells user whether real device is sending packets
  lastSyncAttempt?: string;
  syncSuccess?: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phoneNumber?: string;
  emergencyContact?: string;
  doctorName?: string;
}

export interface UserSettings {
  timezone: string;
  timeFormat: '12h' | '24h';
  theme: 'light' | 'dark' | 'system';
  soundAlerts: boolean;
  browserNotifications: boolean;
  snoozeDurationMinutes: number;
  reminderTone: 'chime' | 'pulse' | 'gentle' | 'none';
  auditLogRetentionDays: number;
  autoSyncIntervalSec: number;
}

