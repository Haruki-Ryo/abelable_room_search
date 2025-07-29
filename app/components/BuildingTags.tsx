import React, { useRef, useEffect } from 'react';

interface BuildingTagsProps {
  buildings: string[];
  selected: Set<string>;
  onChange: (b: string) => void;
}

const BuildingTags: React.FC<BuildingTagsProps> = ({ buildings, selected, onChange }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateScrollbar = () => {
      if (!scrollRef.current || !trackRef.current || !thumbRef.current) return;
      const scrollWidth = scrollRef.current.scrollWidth;
      const clientWidth = scrollRef.current.clientWidth;
      if (scrollWidth <= clientWidth) {
        trackRef.current.style.display = 'none';
        return;
      }
      trackRef.current.style.display = '';
      const thumbWidth = (clientWidth / scrollWidth) * 100;
      thumbRef.current.style.width = `${thumbWidth}%`;
      const scrollLeft = scrollRef.current.scrollLeft;
      const maxScrollLeft = scrollWidth - clientWidth;
      const scrollPercent = scrollLeft / maxScrollLeft;
      const maxThumbLeft = 100 - thumbWidth;
      thumbRef.current.style.left = `${scrollPercent * maxThumbLeft}%`;
    };
    updateScrollbar();
    scrollRef.current?.addEventListener('scroll', updateScrollbar);
    window.addEventListener('resize', updateScrollbar);
    return () => {
      scrollRef.current?.removeEventListener('scroll', updateScrollbar);
      window.removeEventListener('resize', updateScrollbar);
    };
  }, []);

  return (
    <div className="mb-2">
      <div ref={scrollRef} className="flex gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap pb-2">
        {buildings.map(b => (
          <button
            key={b}
            className={`building-tag flex-shrink-0 border border-[var(--border-color)] bg-[var(--bg-primary)] px-4 py-1.5 rounded-full text-sm font-medium text-[var(--text-secondary)]${selected.has(b) ? ' active' : ''}`}
            onClick={() => onChange(b)}
          >
            {b === 'all' ? 'すべて' : b}
          </button>
        ))}
      </div>
      <div ref={trackRef} className="w-full h-1 bg-[var(--bg-tertiary)] rounded-full mt-1 relative">
        <div ref={thumbRef} className="h-1 bg-[var(--text-tertiary)] rounded-full absolute top-0 left-0"></div>
      </div>
    </div>
  );
};

export default BuildingTags; 