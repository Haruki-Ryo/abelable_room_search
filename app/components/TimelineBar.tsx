import React from 'react';

interface Slot {
  start: string; // "09:00"
  end: string;   // "10:30"
}

interface TimelineBarProps {
  schedule: Slot[];
}

const TimelineBar: React.FC<TimelineBarProps> = ({ schedule }) => {
  // 8:00-20:00
  const dayStart = 8 * 60;
  const dayEnd = 20 * 60;
  const totalMinutes = dayEnd - dayStart;
  // busy slots: [{start, end}] in minutes
  const busySlots = schedule.map(slot => ({
    start: parseInt(slot.start.split(':')[0], 10) * 60 + parseInt(slot.start.split(':')[1], 10),
    end: parseInt(slot.end.split(':')[0], 10) * 60 + parseInt(slot.end.split(':')[1], 10)
  })).sort((a, b) => a.start - b.start);
  let freeSlots: { left: number; width: number }[] = [];
  let lastBusyEnd = dayStart;
  busySlots.forEach(busy => {
    if (busy.start > lastBusyEnd) {
      freeSlots.push({
        left: ((lastBusyEnd - dayStart) / totalMinutes) * 100,
        width: ((busy.start - lastBusyEnd) / totalMinutes) * 100
      });
    }
    lastBusyEnd = Math.max(lastBusyEnd, busy.end);
  });
  if (lastBusyEnd < dayEnd) {
    freeSlots.push({
      left: ((lastBusyEnd - dayStart) / totalMinutes) * 100,
      width: ((dayEnd - lastBusyEnd) / totalMinutes) * 100
    });
  }
  if (busySlots.length === 0) {
    freeSlots = [{ left: 0, width: 100 }];
  }
  return (
    <div className="w-full h-6 bg-[var(--timeline-bg)] rounded-md flex relative overflow-hidden">
      {freeSlots.map((slot, i) => (
        <div key={i} className="absolute h-full" style={{ left: `${slot.left}%`, width: `${slot.width}%`, backgroundColor: 'var(--timeline-bar-bg)' }}></div>
      ))}
    </div>
  );
};

export default TimelineBar; 