import { WeeklySchedule, DAYS_OF_WEEK, SLOT_NAMES, DayOfWeek, SlotName, getLedId } from '@/types';

export interface Esp32SlotPayload {
  ledId: number; // 1 - 28
  day: DayOfWeek;
  dayIndex: number; // 0 = Mon, 6 = Sun
  slot: SlotName;
  slotIndex: number; // 0 = Morn, 1 = Noon, 2 = Eve, 3 = Night
  enabled: boolean;
  time: string; // "08:00"
  hour: number;
  minute: number;
  shiftRegister: number; // 1 to 4
  bitIndex: number; // 0 to 7
  medicine: string;
  dosage: string;
  instructions: string;
}

export interface Esp32SyncPayload {
  protocolVersion: string;
  scheduleVersion: number;
  timezone: string;
  tzOffsetMinutes: number; // e.g. +330 for Asia/Kolkata
  totalLeds: number;
  shiftRegistersCount: number;
  slotsCount: number;
  timestamp: string;
  slots: Esp32SlotPayload[];
}

export function formatScheduleForEsp32(schedule: WeeklySchedule): Esp32SyncPayload {
  const slotsPayload: Esp32SlotPayload[] = [];

  DAYS_OF_WEEK.forEach((day, dayIndex) => {
    SLOT_NAMES.forEach((slot, slotIndex) => {
      const ledId = getLedId(day, slot);
      const slotKey = `${day}_${slot}`;
      const slotData = schedule.slots[slotKey];

      const timeStr = slotData?.reminderTime || '08:00';
      const [h, m] = timeStr.split(':').map(Number);

      const shiftRegister = Math.floor((ledId - 1) / 8) + 1; // 1 to 4
      const bitIndex = (ledId - 1) % 8; // 0 to 7

      slotsPayload.push({
        ledId,
        day,
        dayIndex,
        slot,
        slotIndex,
        enabled: Boolean(slotData?.enabled),
        time: timeStr,
        hour: isNaN(h) ? 8 : h,
        minute: isNaN(m) ? 0 : m,
        shiftRegister,
        bitIndex,
        medicine: slotData?.medicineName || '',
        dosage: slotData?.dosage || '',
        instructions: slotData?.instructions || '',
      });
    });
  });

  // Calculate timezone offset for Asia/Kolkata or chosen tz
  let tzOffset = 330; // Default +5:30 in minutes
  if (schedule.timezone === 'UTC') tzOffset = 0;
  else if (schedule.timezone === 'America/New_York') tzOffset = -300;
  else if (schedule.timezone === 'Europe/London') tzOffset = 0;

  return {
    protocolVersion: '1.2.0',
    scheduleVersion: schedule.version,
    timezone: schedule.timezone,
    tzOffsetMinutes: tzOffset,
    totalLeds: 28,
    shiftRegistersCount: 4,
    slotsCount: slotsPayload.length,
    timestamp: new Date().toISOString(),
    slots: slotsPayload,
  };
}

/**
 * Calculates the 4 bytes shifted out to the four 74HC595 shift registers
 * for one or multiple active LEDs (1-28). Returns [byte1, byte2, byte3, byte4]
 */
export function calculateShiftRegisterBytes(activeLedIds: number | number[] | null | undefined): [number, number, number, number] {
  const bytes: [number, number, number, number] = [0, 0, 0, 0];
  if (!activeLedIds) {
    return bytes;
  }

  const ids = Array.isArray(activeLedIds) ? activeLedIds : [activeLedIds];

  ids.forEach(id => {
    if (id >= 1 && id <= 28) {
      const index = id - 1; // 0 to 27
      const regIndex = Math.floor(index / 8); // 0 to 3
      const bitPos = index % 8; // 0 to 7
      bytes[regIndex] |= (1 << bitPos);
    } else if (id >= 30 && id <= 36) {
      // Day codes: 30 = Mon, 31 = Tue ... 36 = Sun
      const dayIndex = id - 30;
      const ic = Math.floor(dayIndex / 2);
      const isUpper = (dayIndex % 2 === 1);
      bytes[ic] |= isUpper ? 0xF0 : 0x0F;
    }
  });

  return bytes;
}

