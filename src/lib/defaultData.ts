import { 
  Medicine, 
  WeeklySchedule, 
  ScheduleSlot, 
  DAYS_OF_WEEK, 
  SLOT_NAMES, 
  DEFAULT_SLOT_TIMES, 
  getLedId,
  ReminderEvent,
  DeviceTelemetry,
  UserSettings
} from '@/types';

export const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 'med_metformin',
    name: 'Metformin Hydrochloride',
    dosage: '500 mg',
    form: 'tablet',
    instructions: 'Take with or immediately after meals to reduce GI irritation.',
    foodTiming: 'after_meal',
    color: '#0d9488', // Teal
    notes: 'Prescribed for blood sugar management (Endocrinology). Do not crush.',
    isArchived: false,
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
  },
  {
    id: 'med_atorvastatin',
    name: 'Atorvastatin Calcium',
    dosage: '20 mg',
    form: 'tablet',
    instructions: 'Take once daily at bedtime with a glass of water.',
    foodTiming: 'anytime',
    color: '#0284c7', // Sky Blue
    notes: 'Lipid profile control. Avoid grapefruit juice.',
    isArchived: false,
    createdAt: '2026-11-01T08:00:00Z',
    updatedAt: '2026-11-01T08:00:00Z',
  },
  {
    id: 'med_lisinopril',
    name: 'Lisinopril',
    dosage: '10 mg',
    form: 'tablet',
    instructions: 'Take in the morning with or without food. Monitor blood pressure.',
    foodTiming: 'before_meal',
    color: '#8b5cf6', // Purple
    notes: 'Hypertension management. Report dry cough if persistent.',
    isArchived: false,
    createdAt: '2026-11-02T09:00:00Z',
    updatedAt: '2026-11-02T09:00:00Z',
  },
  {
    id: 'med_pantoprazole',
    name: 'Pantoprazole Sodium',
    dosage: '40 mg',
    form: 'capsule',
    instructions: 'Take 30 minutes before morning breakfast with plain water.',
    foodTiming: 'empty_stomach',
    color: '#f59e0b', // Amber
    notes: 'GERD / Gastric protection. Swallow whole.',
    isArchived: false,
    createdAt: '2026-11-02T09:00:00Z',
    updatedAt: '2026-11-02T09:00:00Z',
  },
  {
    id: 'med_multivitamin',
    name: 'CoQ10 & Multivitamin Complex',
    dosage: '1 Capsule',
    form: 'capsule',
    instructions: 'Take with lunch meal for optimal fat-soluble absorption.',
    foodTiming: 'with_meal',
    color: '#10b981', // Emerald
    notes: 'Dietary supplement for vitality & heart wellness.',
    isArchived: false,
    createdAt: '2026-11-03T11:00:00Z',
    updatedAt: '2026-11-03T11:00:00Z',
  },
  {
    id: 'med_melatonin',
    name: 'Melatonin Sleep Support',
    dosage: '3 mg',
    form: 'tablet',
    instructions: 'Take 30 minutes before desired bedtime in a darkened room.',
    foodTiming: 'anytime',
    color: '#6366f1', // Indigo
    notes: 'Circadian rhythm support. As needed.',
    isArchived: false,
    createdAt: '2026-11-04T12:00:00Z',
    updatedAt: '2026-11-04T12:00:00Z',
  }
];

export function createDefaultWeeklySchedule(userId: string = 'demo_user_1'): WeeklySchedule {
  const slots: Record<string, ScheduleSlot> = {};

  DAYS_OF_WEEK.forEach((day) => {
    SLOT_NAMES.forEach((slot) => {
      const ledId = getLedId(day, slot);
      const slotKey = `${day}_${slot}`;

      // Set up a realistic medical regimen
      let enabled = false;
      let medId: string | undefined = undefined;
      let medName: string | undefined = undefined;
      let dosage: string | undefined = undefined;
      let instructions: string | undefined = undefined;
      let notes: string | undefined = undefined;

      if (slot === 'morning') {
        enabled = true;
        medId = 'med_pantoprazole';
        medName = 'Pantoprazole Sodium';
        dosage = '40 mg';
        instructions = 'Take before breakfast with water.';
        notes = 'Slot 1 of day: LED ' + ledId;
      } else if (slot === 'noon') {
        // Mon, Wed, Fri, Sun have lunch multivitamins
        if (day === 'Monday' || day === 'Wednesday' || day === 'Friday' || day === 'Sunday') {
          enabled = true;
          medId = 'med_multivitamin';
          medName = 'CoQ10 & Multivitamin Complex';
          dosage = '1 Capsule';
          instructions = 'Take with lunch.';
          notes = 'LED ' + ledId;
        }
      } else if (slot === 'evening') {
        // Daily evening Metformin
        enabled = true;
        medId = 'med_metformin';
        medName = 'Metformin Hydrochloride';
        dosage = '500 mg';
        instructions = 'Take with dinner.';
        notes = 'LED ' + ledId;
      } else if (slot === 'night') {
        // Nightly Atorvastatin
        enabled = true;
        medId = 'med_atorvastatin';
        medName = 'Atorvastatin Calcium';
        dosage = '20 mg';
        instructions = 'Take at bedtime.';
        notes = 'LED ' + ledId;
      }

      slots[slotKey] = {
        id: slotKey,
        ledId,
        dayOfWeek: day,
        slot,
        enabled,
        reminderTime: DEFAULT_SLOT_TIMES[slot],
        medicineId: medId,
        medicineName: medName,
        dosage,
        instructions,
        notes,
        updatedAt: '2026-11-14T08:00:00Z',
      };
    });
  });

  return {
    userId,
    version: 3,
    timezone: 'Asia/Kolkata',
    slots,
    updatedAt: '2026-11-14T08:00:00Z',
    lastSyncedVersion: 3,
  };
}

export const INITIAL_REMINDER_HISTORY: ReminderEvent[] = [
  {
    id: 'rem_001',
    ledId: 21, // Saturday morning (Saturday: 21, 22, 23, 24)
    dayOfWeek: 'Saturday',
    slot: 'morning',
    medicineId: 'med_pantoprazole',
    medicineName: 'Pantoprazole Sodium',
    dosage: '40 mg',
    scheduledTime: '08:00',
    date: '2026-11-14',
    status: 'acknowledged',
    triggeredAt: '2026-11-14T08:00:01+05:30',
    acknowledgedAt: '2026-11-14T08:06:22+05:30',
    source: 'esp32_button',
    notes: 'Dispenser tactile button pressed by patient.',
    ingestionVerified: false,
  },
  {
    id: 'rem_002',
    ledId: 22, // Saturday noon
    dayOfWeek: 'Saturday',
    slot: 'noon',
    medicineId: 'med_multivitamin',
    medicineName: 'CoQ10 & Multivitamin Complex',
    dosage: '1 Capsule',
    scheduledTime: '13:00',
    date: '2026-11-14',
    status: 'acknowledged',
    triggeredAt: '2026-11-14T13:00:00+05:30',
    acknowledgedAt: '2026-11-14T13:12:45+05:30',
    source: 'web_ui',
    notes: 'Acknowledged via web dashboard.',
    ingestionVerified: false,
  },
  {
    id: 'rem_003',
    ledId: 23, // Saturday evening
    dayOfWeek: 'Saturday',
    slot: 'evening',
    medicineId: 'med_metformin',
    medicineName: 'Metformin Hydrochloride',
    dosage: '500 mg',
    scheduledTime: '18:30',
    date: '2026-11-14',
    status: 'scheduled',
    source: 'simulated',
    ingestionVerified: false,
  },
  {
    id: 'rem_004',
    ledId: 24, // Saturday night
    dayOfWeek: 'Saturday',
    slot: 'night',
    medicineId: 'med_atorvastatin',
    medicineName: 'Atorvastatin Calcium',
    dosage: '20 mg',
    scheduledTime: '21:30',
    date: '2026-11-14',
    status: 'scheduled',
    source: 'simulated',
    ingestionVerified: false,
  },
  {
    id: 'rem_005',
    ledId: 17, // Friday morning
    dayOfWeek: 'Friday',
    slot: 'morning',
    medicineId: 'med_pantoprazole',
    medicineName: 'Pantoprazole Sodium',
    dosage: '40 mg',
    scheduledTime: '08:00',
    date: '2026-11-13',
    status: 'acknowledged',
    triggeredAt: '2026-11-13T08:00:02+05:30',
    acknowledgedAt: '2026-11-13T08:03:10+05:30',
    source: 'esp32_button',
    ingestionVerified: false,
  },
  {
    id: 'rem_006',
    ledId: 18, // Friday noon
    dayOfWeek: 'Friday',
    slot: 'noon',
    medicineId: 'med_multivitamin',
    medicineName: 'CoQ10 & Multivitamin Complex',
    dosage: '1 Capsule',
    scheduledTime: '13:00',
    date: '2026-11-13',
    status: 'missed',
    triggeredAt: '2026-11-13T13:00:00+05:30',
    source: 'auto_timeout',
    notes: 'No acknowledgement detected after 45-minute LED reminder window.',
    ingestionVerified: false,
  },
  {
    id: 'rem_007',
    ledId: 19, // Friday evening
    dayOfWeek: 'Friday',
    slot: 'evening',
    medicineId: 'med_metformin',
    medicineName: 'Metformin Hydrochloride',
    dosage: '500 mg',
    scheduledTime: '18:30',
    date: '2026-11-13',
    status: 'acknowledged',
    triggeredAt: '2026-11-13T18:30:00+05:30',
    acknowledgedAt: '2026-11-13T18:41:19+05:30',
    source: 'esp32_button',
    ingestionVerified: false,
  },
  {
    id: 'rem_008',
    ledId: 20, // Friday night
    dayOfWeek: 'Friday',
    slot: 'night',
    medicineId: 'med_atorvastatin',
    medicineName: 'Atorvastatin Calcium',
    dosage: '20 mg',
    scheduledTime: '21:30',
    date: '2026-11-13',
    status: 'acknowledged',
    triggeredAt: '2026-11-13T21:30:01+05:30',
    acknowledgedAt: '2026-11-13T21:34:00+05:30',
    source: 'esp32_button',
    ingestionVerified: false,
  }
];

export const INITIAL_DEVICE_STATUS: DeviceTelemetry = {
  deviceId: 'ESP32-DISPENSER-01',
  deviceName: 'SmartDose Bedside Dispenser Unit',
  isOnline: true,
  lastSeen: '2026-11-14T17:40:00+05:30',
  ipAddress: '192.168.1.142',
  macAddress: '24:6F:28:B3:9C:E4',
  wifiSSID: 'HomeHealth_5G',
  wifiSignalDbm: -58,
  lastSyncedVersion: 3,
  currentCloudVersion: 3,
  rtcStatus: 'synced',
  rtcTime: '2026-11-14T17:40:02+05:30',
  firmwareVersion: 'v2.4.1-build26',
  activeLed: null, // No LED blinking currently
  shiftRegistersCount: 4,
  ledsCount: 28,
  isSimulated: true, // Clearly indicated as interactive demo device
  syncSuccess: true,
  lastSyncAttempt: '2026-11-14T17:35:00+05:30',
};

export const INITIAL_USER_SETTINGS: UserSettings = {
  timezone: 'Asia/Kolkata',
  timeFormat: '12h',
  theme: 'light',
  soundAlerts: true,
  browserNotifications: false,
  snoozeDurationMinutes: 10,
  reminderTone: 'chime',
  auditLogRetentionDays: 90,
  autoSyncIntervalSec: 60,
};

