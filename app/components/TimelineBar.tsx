'use client';
import React, { useEffect, useRef, useState } from 'react';

interface Slot {
  start: string; // "09:00"
  end: string;   // "10:30"
}

interface TimelineBarProps {
  schedule: Slot[]; // busy slots for the day
}

const TimelineBar: React.FC<TimelineBarProps> = ({ schedule }) => {
  // 8:00-20:00
  const dayStart = 8 * 60;
  const dayEnd = 20 * 60;
  const totalMinutes = dayEnd - dayStart;

  const toMin = (hhmm: string) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };
  const toLabel = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}:${String(m).padStart(2, '0')}`;
  };

  // busy slots normalized and sorted
  const busySlots = schedule
    .map(slot => ({ start: Math.max(dayStart, toMin(slot.start)), end: Math.min(dayEnd, toMin(slot.end)) }))
    .filter(s => s.end > s.start)
    .sort((a, b) => a.start - b.start);

  // merge overlapping busy slots
  const merged: { start: number; end: number }[] = [];
  for (const s of busySlots) {
    if (merged.length === 0 || s.start > merged[merged.length - 1].end) {
      merged.push({ ...s });
    } else {
      merged[merged.length - 1].end = Math.max(merged[merged.length - 1].end, s.end);
    }
  }

  // compute free windows (in minutes) between busy ranges within 8:00-20:00
  const freeWindows: { start: number; end: number }[] = [];
  let lastBusyEnd = dayStart;
  merged.forEach(busy => {
    if (busy.start > lastBusyEnd) {
      freeWindows.push({ start: lastBusyEnd, end: busy.start });
    }
    lastBusyEnd = Math.max(lastBusyEnd, busy.end);
  });
  if (merged.length === 0) {
    freeWindows.push({ start: dayStart, end: dayEnd });
  } else if (lastBusyEnd < dayEnd) {
    freeWindows.push({ start: lastBusyEnd, end: dayEnd });
  }

  // map free windows to percentage widths for rendering
  const freeSlots = freeWindows.map(w => ({
    left: ((w.start - dayStart) / totalMinutes) * 100,
    width: ((w.end - w.start) / totalMinutes) * 100,
  }));

  // boundary labels positions (busy starts/ends within the range)
  const boundariesSet = new Set<number>();
  for (const b of merged) {
    if (b.start > dayStart && b.start < dayEnd) boundariesSet.add(b.start);
    if (b.end > dayStart && b.end < dayEnd) boundariesSet.add(b.end);
  }

  // measure container width to decide if it's "narrow"
  const barRef = useRef<HTMLDivElement | null>(null);
  const [barWidth, setBarWidth] = useState<number>(0);
  useEffect(() => {
    if (!barRef.current) return;
    const el = barRef.current;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const cr = entry.contentRect;
        setBarWidth(cr.width);
      }
    });
    ro.observe(el);
    setBarWidth(el.getBoundingClientRect().width);
    return () => ro.disconnect();
  }, []);
  const isNarrow = barWidth > 0 && barWidth < 560; // tweak threshold as needed

  // Hide labels for very short breaks (<= 10 minutes) only when width is narrow
  const hideLabelForBreakMinutes = 10;
  const hiddenBoundaries = new Set<number>();
  if (isNarrow) {
    for (const w of freeWindows) {
      const dur = w.end - w.start;
      if (dur > 0 && dur <= hideLabelForBreakMinutes) {
        if (w.start > dayStart && w.start < dayEnd) hiddenBoundaries.add(w.start);
        if (w.end > dayStart && w.end < dayEnd) hiddenBoundaries.add(w.end);
      }
    }
  }

  const boundaries = Array.from(boundariesSet)
    .filter(t => !hiddenBoundaries.has(t))
    .sort((a, b) => a - b);

  return (
    <div className="relative pt-5">
      {/* boundary times above bar */}
      <div className="absolute inset-x-0 top-0 h-5 pointer-events-none">
        {boundaries.map((t) => {
          const leftPct = ((t - dayStart) / totalMinutes) * 100;
          const clampedLeft = Math.min(98, Math.max(2, leftPct));
          return (
            <span
              key={t}
              className="absolute -translate-x-1/2 text-[10px] leading-none text-[var(--text-secondary)]"
              style={{ left: `${clampedLeft}%` }}
            >
              {toLabel(t)}
            </span>
          );
        })}
      </div>

      {/* bar */}
      <div ref={barRef} className="w-full h-6 bg-[var(--timeline-bg)] rounded-md flex relative overflow-hidden">
        {freeSlots.map((slot, i) => (
          <div
            key={i}
            className="absolute h-full"
            style={{ left: `${slot.left}%`, width: `${slot.width}%`, backgroundColor: 'var(--timeline-bar-bg)' }}
          />
        ))}
      </div>
    </div>
  );
};

export default TimelineBar;