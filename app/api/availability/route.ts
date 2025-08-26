import { NextRequest } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Types (kept internal to avoid module shape confusion during type checks)
type GlobalIndex = Record<string, Record<string, number>>; // room -> day -> bits

// Periods (minutes from 00:00)
const PERIODS: Record<number, [number, number]> = {
  1: [8 * 60 + 50, 10 * 60 + 20],
  2: [10 * 60 + 30, 12 * 60 + 0],
  3: [13 * 60 + 30, 15 * 60 + 0],
  4: [15 * 60 + 10, 16 * 60 + 40],
  5: [16 * 60 + 50, 18 * 60 + 20],
  6: [18 * 60 + 30, 20 * 60 + 0],
};

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const overlap = (a: [number, number], b: [number, number]) => !(a[1] <= b[0] || a[0] >= b[1]);

const buildQueryBits = (start: string, end: string) => {
  const s = toMin(start), e = toMin(end);
  if (e <= s) throw new Error('end は start より後にしてください');
  let bits = 0;
  for (const p of [1, 2, 3, 4, 5, 6] as const) {
    const [ps, pe] = PERIODS[p];
    if (overlap([s, e], [ps, pe])) bits |= (1 << (p - 1));
  }
  return bits;
};

function findAvailableRooms(day: number, start: string, end: string, index: GlobalIndex, roomRegex?: string): string[] {
  const qbits = buildQueryBits(start, end);
  const re = roomRegex ? new RegExp(roomRegex) : null;
  const dayKey = String(day);
  if (qbits === 0) {
    return Object.keys(index).filter(r => !re || re.test(r)).sort();
  }
  const result: string[] = [];
  for (const [room, byDay] of Object.entries(index)) {
    const bits = typeof byDay === 'object' ? (byDay[dayKey] ?? 0) : 0;
    if ((bits & qbits) === 0) {
      if (re && !re.test(room)) continue;
      result.push(room);
    }
  }
  return result.sort();
}

let INDEX: GlobalIndex | null = null;
function loadIndex(): GlobalIndex {
  if (INDEX) return INDEX;
  const dataPath = process.env.DATA_PATH ?? path.join(process.cwd(), 'rooms_in_use.json');
  const raw = fs.readFileSync(dataPath, 'utf8');
  INDEX = JSON.parse(raw) as GlobalIndex;
  return INDEX;
}

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const day = Number(sp.get('day'));
    const start = sp.get('start') || '';
    const end = sp.get('end') || '';
    const roomRegex = sp.get('room_regex') || undefined;

    if (!day || day < 1 || day > 6) {
      return Response.json({ rooms: [], count: 0, error: 'day は 1..6 で指定してください' }, { status: 400 });
    }
    if (!/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end)) {
      return Response.json({ rooms: [], count: 0, error: 'start/end は HH:MM で指定してください' }, { status: 400 });
    }

    const idx = loadIndex();
    let rooms: string[] = [];
    try {
      rooms = findAvailableRooms(day, start, end, idx, roomRegex);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return Response.json({ rooms: [], count: 0, error: msg }, { status: 400 });
    }

    return Response.json({ rooms, count: rooms.length });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ rooms: [], count: 0, error: msg }, { status: 500 });
  }
}
