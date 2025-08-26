# Next.js 連携ガイド（rooms_in_use.json を用いたサーバーサイド検索）

目的
- FastAPI を介さずに、Next.js 側だけで空き教室検索 API を提供する。
- 元データは Python 側で生成済みの `rooms_in_use.json` を使用。
- データはサーバー側でのみ読み込み、クライアント（ブラウザ）から直接アクセスできないようにする。

全体像
- データ: `rooms_in_use.json`（修正版。複数教室表記をカンマ区切りで分配済み）
- 形式: グローバルインデックス（教室 → 日 → 6bit）
  - Top-level key: 教室名（例: "全学A201"）
  - 値: `{ "1": bits, "2": bits, ... }` の辞書（存在しない日は 0=空き扱い）
- Next.js 側の API Route: `GET /api/availability`
  - クエリ: `day(1..6)`, `start(HH:MM)`, `end(HH:MM)`, `room_regex(任意)`
  - 返却: `{ rooms: string[]; count: number; error?: string }`

データ仕様（rooms_in_use.json）
- 場所: このリポジトリでは `rooms_in_use.json`
- スキーマ（例）:
  ```json
  {
    "全学A201": { "1": 1, "3": 4 },
    "基/B102":  { "2": 2 },
    "理/D403":  { }
  }
  ```
  - 値の数値は 6bit のビットマスク（0..63）
    - bit0=1限, bit1=2限, …, bit5=6限
    - 例: `0b001001` (= 9) は 1限・3限が使用中
  - 指定日のキー（"1".."6"）が存在しない場合、その日は `0`（終日空き）として扱う

時限と時間
- 大阪大学の授業時間帯（半開区間 [start, end)）
  1. 08:50-10:20
  2. 10:30-12:00
  3. 13:30-15:00
  4. 15:10-16:40
  5. 16:50-18:20
  6. 18:30-20:00
- 休み時間は空きとみなす（例: 10:25-10:30 → どの時限とも重ならない → 全室空き）

Next.js 実装設計（API Route）
- 置き場所（App Router）: `app/api/availability/route.ts`
- データファイルの配置:
  - 最も簡単: Next.js プロジェクト直下に `rooms_in_use.json` を配置（`process.cwd()/rooms_in_use.json`）
  - または、環境変数 `DATA_PATH` で外部パスを指定して `fs.readFileSync(DATA_PATH)` で読む
- セキュリティ: public 配下には置かない（public に置くと誰でもダウンロード可能）
- キャッシュ: モジュールスコープに読み込み済みデータをキャッシュ。`export const dynamic = 'force-dynamic'` でルートのビルド時キャッシュを無効化

API 仕様
- リクエスト
  - `GET /api/availability?day=1&start=08:50&end=10:20&room_regex=全学A|理学`
- レスポンス
  - `{"rooms":["全学A201",...],"count":123}`

実装の要点（TypeScript サンプル）
- 型
  ```ts
  type GlobalIndex = Record<string, Record<string, number>>; // room -> day -> bits
  type AvailabilityResponse = { rooms: string[]; count: number; error?: string };
  ```
- 定数（時限）
  ```ts
  const PERIODS: Record<number, [number,number]> = {
    1: [8*60+50, 10*60+20],
    2: [10*60+30, 12*60+0],
    3: [13*60+30, 15*60+0],
    4: [15*60+10, 16*60+40],
    5: [16*60+50, 18*60+20],
    6: [18*60+30, 20*60+0],
  };
  ```
- ユーティリティ
  ```ts
  const toMin = (hhmm: string) => { const [h,m] = hhmm.split(':').map(Number); return h*60+m; };
  const overlap = (a:[number,number], b:[number,number]) => !(a[1] <= b[0] || a[0] >= b[1]);
  const buildQueryBits = (start:string, end:string) => {
    const s = toMin(start), e = toMin(end);
    if (e <= s) throw new Error('end は start より後にしてください');
    let bits = 0;
    for (const p of [1,2,3,4,5,6] as const) {
      const [ps,pe] = PERIODS[p];
      if (overlap([s,e],[ps,pe])) bits |= (1 << (p-1));
    }
    return bits;
  };
  ```
- 検索（インデックス形式に合わせる）
  ```ts
  function findAvailableRooms(day:number, start:string, end:string, index:GlobalIndex, roomRegex?:string): string[] {
    const qbits = buildQueryBits(start, end);
    const re = roomRegex ? new RegExp(roomRegex) : null;
    const dayKey = String(day);
    // 休み時間のみなら全室（正規表現があればフィルタ）
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
  ```
- API Route（概略）
  ```ts
  // app/api/availability/route.ts
  import { NextRequest } from 'next/server';
  import fs from 'node:fs';
  import path from 'node:path';

  export const runtime = 'nodejs';
  export const dynamic = 'force-dynamic';

  let INDEX: GlobalIndex | null = null;
  function loadIndex(): GlobalIndex {
    if (INDEX) return INDEX;
    const dataPath = process.env.DATA_PATH
      ?? path.join(process.cwd(), 'rooms_in_use.json');
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
      } catch (e:any) {
        return Response.json({ rooms: [], count: 0, error: e?.message || String(e) }, { status: 400 });
      }
      return Response.json({ rooms, count: rooms.length });
    } catch (e:any) {
      return Response.json({ rooms: [], count: 0, error: e?.message || String(e) }, { status: 500 });
    }
  }
  ```

UI 側（参考: 本リポジトリの `/availability/ui`）
- 入力: 曜日(1..6), 開始, 終了, 正規表現
- クイックプリセット: 1限〜6限のボタンで `PERIODS` から値をセット
- フロントの fetch 例
  ```ts
  const p = new URLSearchParams({ day: String(day), start, end });
  if (roomRegex) p.append('room_regex', roomRegex);
  const res = await fetch(`/api/availability?${p.toString()}`, { cache: 'no-store' });
  const json = await res.json();
  // json.rooms をテーブル等で描画
  ```

運用・更新
- `rooms_in_use.json` を更新したら Next.js を再デプロイ
  - もしくは API Route で一定間隔で再読み込みする仕組みを入れる（必要になったら検討）
- ファイルサイズが大きくなる場合は、別プロセスでインデックスをHTTP配信し、API Route で起動時に一度だけ取得して保持する方法もあり

セキュリティ注意
- JSON は public 下に置かない（誰でもダウンロードできます）
- API Route は同一オリジンで提供されるため、利用者は Next.js だけを叩く形になります
- さらに制限が必要なら、認証・レート制限・IP 制限などを API Route に追加

テスト
- 最低限のユニットテスト（buildQueryBits, findAvailableRooms）を TS でも用意すると安心
- 代表ケース: 休み時間のみ、時限内、時限またぎ、正規表現フィルタ

補足
- Python 側の `data_processor.py` とロジックは同等です（[start,end) 半開区間、休み時間は空き）。
- `rooms_in_use.json` は本リポジトリの生成スクリプトで随時更新してください。
