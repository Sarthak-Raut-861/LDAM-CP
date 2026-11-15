import { NextResponse } from 'next/server';

const RTDB_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || 'https://ldam-cp-default-rtdb.firebaseio.com';

// In-memory active LED state for the demo
let currentActiveLed: number | null = null;
let lastActivatedAt: string | null = null;

export async function GET() {
  // Attempt to read latest state from Firebase RTDB if available
  try {
    const res = await fetch(`${RTDB_URL}/deviceSyncStatus/activeLed.json`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const val = await res.json();
      if (typeof val === 'number') {
        currentActiveLed = val;
      } else if (val === null) {
        currentActiveLed = null;
      }
    }
  } catch {
    // Fall back to memory
  }

  return NextResponse.json({
    activeLed: currentActiveLed,
    lastActivatedAt,
    shiftRegister: currentActiveLed ? Math.floor((currentActiveLed - 1) / 8) + 1 : null,
    bitIndex: currentActiveLed ? (currentActiveLed - 1) % 8 : null,
  }, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'Access-Control-Allow-Origin': '*',
    }
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ledId } = body;

    if (ledId === null || ledId === 0 || ledId === undefined) {
      currentActiveLed = null;
      lastActivatedAt = null;
    } else {
      const id = Number(ledId);
      // Valid IDs: 1-28 (individual slots), 30-36 (entire days: 30=Mon ... 36=Sun), 99 (7-day sequence)
      if ((id >= 1 && id <= 28) || (id >= 30 && id <= 36) || id === 99) {
        currentActiveLed = id;
        lastActivatedAt = new Date().toISOString();
      } else {
        currentActiveLed = null;
      }
    }

    // Sync to Firebase Realtime Database via REST
    try {
      await Promise.all([
        fetch(`${RTDB_URL}/deviceSyncStatus/activeLed.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(currentActiveLed),
        }),
        fetch(`${RTDB_URL}/deviceSyncStatus.json`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activeLed: currentActiveLed,
            lastSeen: new Date().toISOString(),
          }),
        }),
      ]);
    } catch (firebaseErr) {
      console.error('[API] Error pushing active-led to Firebase:', firebaseErr);
    }

    return NextResponse.json({
      success: true,
      activeLed: currentActiveLed,
      lastActivatedAt,
      shiftRegister: currentActiveLed ? Math.floor((currentActiveLed - 1) / 8) + 1 : null,
      bitIndex: currentActiveLed ? (currentActiveLed - 1) % 8 : null,
    });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
  }
}

