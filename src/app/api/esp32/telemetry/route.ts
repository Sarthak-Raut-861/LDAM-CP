import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { deviceId, lastSyncedVersion, wifiSignalDbm, rtcTime } = body;

    return NextResponse.json({
      success: true,
      receivedAt: new Date().toISOString(),
      ackDeviceId: deviceId,
      status: 'telemetry_acknowledged',
      serverScheduleVersion: 3,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: 'Invalid telemetry payload' },
      { status: 400 }
    );
  }
}

