import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DayOfWeek, SlotName, getLedId } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTimeDisplay(timeStr: string, format: '12h' | '24h' = '12h'): string {
  if (!timeStr) return '--:--';
  const [hourStr, minuteStr] = timeStr.split(':');
  const hours = parseInt(hourStr, 10);
  const minutes = parseInt(minuteStr, 10);

  if (isNaN(hours) || isNaN(minutes)) return timeStr;

  if (format === '24h') {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function getTodayDayOfWeek(): DayOfWeek {
  const dayIndex = new Date().getDay(); // 0 is Sunday
  // Mapping: 0 -> Sunday, 1 -> Monday, etc.
  const map: DayOfWeek[] = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];
  return map[dayIndex];
}

export function getLedDetails(day: DayOfWeek, slot: SlotName) {
  const ledId = getLedId(day, slot);
  return {
    ledId,
    shiftRegisterIndex: Math.floor((ledId - 1) / 8) + 1, // 1 to 4
    pinIndex: (ledId - 1) % 8, // 0 to 7 on that 74HC595
  };
}

export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
}

