import React, { useRef, useEffect, useState, useCallback } from 'react';

interface BuildingTagsProps {
  buildings: string[];
  selected: Set<string>;
  onChange: (b: string) => void;
  onOpenList?: () => void; // open full building list modal
}

const BuildingTags: React.FC<BuildingTagsProps> = ({ buildings, selected, onChange, onOpenList }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);
  const [dragging, setDragging] = useState(false);
  const dragState = useRef<{ startX: number; scrollLeft: number } | null>(null);

  const updateScrollbar = useCallback(() => {
    const container = scrollRef.current;
    const track = trackRef.current;
    const thumb = thumbRef.current;
    if (!container || !track || !thumb) return;
    const { scrollWidth, clientWidth, scrollLeft } = container;
    if (scrollWidth <= clientWidth + 1) {
      track.style.display = 'none';
      setCanScroll(false);
      return;
    }
    setCanScroll(true);
    track.style.display = '';
    const thumbWidthPct = (clientWidth / scrollWidth) * 100;
    thumb.style.width = `${thumbWidthPct}%`;
    const maxScrollLeft = scrollWidth - clientWidth;
    const scrollPercent = maxScrollLeft > 0 ? scrollLeft / maxScrollLeft : 0;
    const maxThumbLeft = 100 - thumbWidthPct;
    thumb.style.left = `${scrollPercent * maxThumbLeft}%`;
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    updateScrollbar();
    container?.addEventListener('scroll', updateScrollbar);
    window.addEventListener('resize', updateScrollbar);
    return () => {
      container?.removeEventListener('scroll', updateScrollbar);
      window.removeEventListener('resize', updateScrollbar);
    };
  }, [updateScrollbar]);

  // Recalculate when the tag list changes
  useEffect(() => {
    updateScrollbar();
  }, [buildings.length, updateScrollbar]);

  // Drag-to-scroll behavior
  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setDragging(true);
    scrollRef.current.classList.add('active-scroll');
    dragState.current = { startX: e.pageX - scrollRef.current.offsetLeft, scrollLeft: scrollRef.current.scrollLeft };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !scrollRef.current || !dragState.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - dragState.current.startX) * 1; // speed factor
    scrollRef.current.scrollLeft = dragState.current.scrollLeft - walk;
  };
  const endDrag = () => {
    setDragging(false);
    scrollRef.current?.classList.remove('active-scroll');
    dragState.current = null;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    setDragging(true);
    scrollRef.current.classList.add('active-scroll');
    dragState.current = { startX: e.touches[0].pageX - scrollRef.current.offsetLeft, scrollLeft: scrollRef.current.scrollLeft };
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging || !scrollRef.current || !dragState.current) return;
    const x = e.touches[0].pageX - scrollRef.current.offsetLeft;
    const walk = (x - dragState.current.startX) * 1;
    scrollRef.current.scrollLeft = dragState.current.scrollLeft - walk;
  };

  const onTouchEnd = () => endDrag();

  // Fallback scroll action if modal opener is not provided
  const scrollNext = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: el.clientWidth, behavior: 'smooth' });
  };

  const handleChevronClick = () => {
    if (onOpenList) onOpenList(); else scrollNext();
  };

  return (
    <div className="mb-2">
      <div className="flex items-center gap-2">
        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap pb-2 flex-1"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseLeave={endDrag}
          onMouseUp={endDrag}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
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
        {buildings.length > 0 && (
          <button
            className="flex-shrink-0 bg-[var(--accent-color)] text-[var(--accent-text)] w-8 h-8 rounded-full text-sm font-medium hover:opacity-90 transition-colors flex items-center justify-center"
            aria-label="建物一覧を開く"
            onClick={handleChevronClick}
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        )}
      </div>
      <div ref={trackRef} className="w-full h-1 bg-[var(--bg-tertiary)] rounded-full mt-1 relative" style={{ display: canScroll ? '' as any : 'none' }}>
        <div ref={thumbRef} className="h-1 bg-[var(--text-tertiary)] rounded-full absolute top-0 left-0"></div>
      </div>
    </div>
  );
};

export default BuildingTags;