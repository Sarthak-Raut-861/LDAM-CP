import { NextResponse } from 'next/server';

// In-memory active LED state for the demo
let currentActiveLed: number | null = null;
let lastActivatedAt: string | null = null;

export async function GET() {
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
    } else {
      const id = Number(ledId);
      if (id >= 1 && id <= 28) {
        currentActiveLed = id;
        lastActivatedAt = new Date().toISOString();
      } else {
        currentActiveLed = null;
      }
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

