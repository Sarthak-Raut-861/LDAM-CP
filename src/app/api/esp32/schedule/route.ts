import { NextResponse } from 'next/server';
import { createDefaultWeeklySchedule } from '@/lib/defaultData';
import { formatScheduleForEsp32 } from '@/services/esp32Contract';

export async function GET() {
  // Returns normalized 28-slot schedule for ESP32 DevKit V1
  const defaultSchedule = createDefaultWeeklySchedule();
  const payload = formatScheduleForEsp32(defaultSchedule);

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Content-Type': 'application/json',
      'X-SmartDose-Protocol': '1.2.0',
    },
  });
}

