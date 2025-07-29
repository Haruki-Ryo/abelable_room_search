'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { mockUniversities, mockClassrooms } from './lib/data';

// Type definitions
type University = typeof mockUniversities[0];
type Classroom = typeof mockClassrooms[0];

interface TimeSliderProps {
  value: { start: number; end: number };
  onChange: (value: { start: number; end: number }) => void;
}

// Time Slider Component
const TimeSlider: React.FC<TimeSliderProps> = ({ value, onChange }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean | 'start' | 'end'>(false);

  const totalMinutes = (21 - 8) * 60;
  const totalSteps = totalMinutes / 15;

  const valueToPercentage = (val: number) => ((val - 8 * 4) / (totalSteps)) * 100;

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    
    const newStep = Math.round((percentage / 100) * totalSteps);
    const newValue = newStep + 8 * 4;

    if (isDragging === 'start') {
      if (newValue < value.end) onChange({ ...value, start: newValue });
    } else if (isDragging === 'end') {
      if (newValue > value.start) onChange({ ...value, end: newValue });
    } else {
      // If not dragging, decide which handle to move
      if (Math.abs(newValue - value.start) < Math.abs(newValue - value.end)) {
        if (newValue < value.end) onChange({ ...value, start: newValue });
      } else {
        if (newValue > value.start) onChange({ ...value, end: newValue });
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent, handle: 'start' | 'end') => {
    e.preventDefault();
    setIsDragging(handle);
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (isDragging) {
        if (!sliderRef.current) return;
        const rect = sliderRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const x = clientX - rect.left;
        let percentage = (x / rect.width) * 100;
        percentage = Math.max(0, Math.min(100, percentage));
        
        const newStep = Math.round((percentage / 100) * totalSteps);
        const newValue = newStep + 8 * 4;

        if (isDragging === 'start') {
          if (newValue < value.end) onChange({ ...value, start: newValue });
        } else if (isDragging === 'end') {
          if (newValue > value.start) onChange({ ...value, end: newValue });
        }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleMouseMove);
    document.addEventListener('touchend', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleMouseMove);
      document.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, value]);

  const formatTime = (val: number) => {
    const hour = Math.floor(val / 4);
    const min = (val % 4) * 15;
    return `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  };

  const startPercentage = valueToPercentage(value.start);
  const endPercentage = valueToPercentage(value.end);

  return (
    <div className="bg-[var(--bg-tertiary)] p-2 rounded-lg">
      <div className="flex justify-between text-center text-xs text-[var(--text-secondary)] mb-1 px-1">
        {[...Array(13)].map((_, i) => <span key={i}>{8 + i}時</span>)}
      </div>
      <div ref={sliderRef} onClick={handleInteraction} className="relative w-full h-10 bg-[var(--bg-primary)] rounded-md flex items-center border border-[var(--border-color)] cursor-pointer select-none">
        <div 
          className="absolute h-full bg-[var(--accent-color)] bg-opacity-30 border-x-2 border-[var(--accent-color)]"
          style={{ left: `${startPercentage}%`, right: `${100 - endPercentage}%` }}
        >
          <div 
            onMouseDown={(e) => handleMouseDown(e, 'start')} 
            onTouchStart={(e) => handleMouseDown(e, 'start')}
            className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-6 rounded-full bg-[var(--accent-color)] cursor-pointer">
          </div>
          <div 
            onMouseDown={(e) => handleMouseDown(e, 'end')} 
            onTouchStart={(e) => handleMouseDown(e, 'end')}
            className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-6 rounded-full bg-[var(--accent-color)] cursor-pointer">
          </div>
        </div>
      </div>
      <div className="text-center text-sm font-semibold text-[var(--text-primary)] mt-2">
        {formatTime(value.start)} - {formatTime(value.end)}
      </div>
    </div>
  );
};

export default function Home() {
  // State management
  const [isUniversityModalOpen, setIsUniversityModalOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [selectedBuildings, setSelectedBuildings] = useState<Set<string>>(new Set(['all']));
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [timeRange, setTimeRange] = useState({ start: 8 * 4, end: 21 * 4 }); // 8:00 - 21:00
  const [searchResults, setSearchResults] = useState<Classroom[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const buildings = selectedUniversity
    ? ['all', ...Array.from(new Set(mockClassrooms
        .filter(c => c.university === selectedUniversity.name)
        .map(c => c.building)))]
    : [];

  // Handlers
  const handleSearch = () => {
    if (!selectedUniversity || !selectedDay) {
      // Maybe show a toast message here
      return;
    }

    const timeToMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const startMinutes = timeRange.start * 15;
    const endMinutes = timeRange.end * 15;

    const results = mockClassrooms.filter(room => {
      // University and Building check
      const universityMatch = room.university === selectedUniversity.name;
      const buildingMatch = selectedBuildings.has('all') || selectedBuildings.has(room.building);
      if (!universityMatch || !buildingMatch) return false;

      // Availability check
      const isAvailable = !room.schedule.some(slot => {
        if (slot.day !== selectedDay) return false;
        const slotStartMinutes = timeToMinutes(slot.start);
        const slotEndMinutes = timeToMinutes(slot.end);
        // Check for any overlap
        return Math.max(startMinutes, slotStartMinutes) < Math.min(endMinutes, slotEndMinutes);
      });

      return isAvailable;
    });

    setSearchResults(results);
    setHasSearched(true);
  };

  const handleLocationSearch = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert('お使いのブラウザは位置情報取得に対応していません。');
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
          const R = 6371; // km
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        };

        let closestUniversity: University | null = null;
        let minDistance = Infinity;

        mockUniversities.forEach(uni => {
          const distance = getDistance(latitude, longitude, uni.lat, uni.lon);
          if (distance < minDistance) {
            minDistance = distance;
            closestUniversity = uni;
          }
        });

        if (closestUniversity) {
          handleUniversitySelect(closestUniversity);
        } else {
          alert('近くに大学が見つかりませんでした。');
        }
        setIsLocating(false);
      },
      (error) => {
        alert('位置情報を取得できませんでした。ブラウザの設定を確認してください。');
        console.error(error);
        setIsLocating(false);
      }
    );
  };

  const handleUniversitySelect = (university: University) => {
    setSelectedUniversity(university);
    setSelectedBuildings(new Set(['all']));
    setIsUniversityModalOpen(false);
  };

  const handleBuildingChange = (building: string) => {
    const newSelection = new Set(selectedBuildings);
    if (building === 'all') {
      newSelection.clear();
      newSelection.add('all');
    } else {
      newSelection.delete('all');
      if (newSelection.has(building)) {
        newSelection.delete(building);
      } else {
        newSelection.add(building);
      }
      if (newSelection.size === 0) {
        newSelection.add('all');
      }
    }
    setSelectedBuildings(newSelection);
  };

  useEffect(() => {
    const today = new Date().getDay();
    setSelectedDay(today === 0 ? 1 : today); 
  }, []);

  return (
    <div className="container mx-auto max-w-lg bg-[var(--bg-primary)] min-h-screen shadow-xl">
      {/* Header */}
      <header className="bg-[var(--header-bg)] text-[var(--header-text)] p-4 flex items-center justify-between shadow-md sticky top-0 z-20">
        <div className="flex items-center flex-grow">
          <i className="fas fa-home text-2xl mr-3"></i>
          <h1 className="text-xl font-bold tracking-wider">大学空き教室検索</h1>
        </div>
        <button onClick={() => setIsMenuOpen(true)} id="menu-btn" className="text-2xl">
          <i className="fas fa-bars"></i>
        </button>
      </header>

      {/* Main Content */}
      <main className="p-4">
        <div id="search-page">
          <section id="search-criteria" className="bg-[var(--bg-primary)] p-4 rounded-lg shadow-sm mb-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center text-[var(--text-primary)]"><i className="fas fa-search mr-2"></i>検索項目</h2>
            
            <button onClick={handleLocationSearch} disabled={isLocating} id="location-btn" className="w-full bg-[var(--accent-color)] text-[var(--accent-text)] font-bold py-2.5 px-4 rounded-lg hover:opacity-90 transition-all shadow-md flex items-center justify-center text-base mb-4 disabled:opacity-70 disabled:cursor-not-allowed">
              {isLocating ? (
                <><i className="fas fa-spinner fa-spin mr-2"></i>検索中...</>
              ) : (
                <><i className="fas fa-map-marker-alt mr-2"></i>現在地から大学・建物を設定</>
              )}
            </button>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">大学</label>
              <div className="relative flex-grow">
                <button onClick={() => setIsUniversityModalOpen(true)} id="university-select-btn" className="w-full text-left pl-10 pr-4 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] bg-[var(--bg-primary)]">
                  <span id="selected-university-name" className="text-[var(--text-primary)]">{selectedUniversity?.name || '大学を選択してください'}</span>
                </button>
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <i className="fas fa-graduation-cap text-[var(--text-tertiary)]"></i>
                </span>
              </div>
            </div>

            <div id="building-filter-wrapper" className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">建物</label>
              {selectedUniversity ? (
                <div id="building-filter" className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {buildings.map(b => (
                    <label key={b} className="flex items-center bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md px-3 py-1.5 text-sm cursor-pointer hover:bg-[var(--bg-tertiary)]">
                      <input 
                        type="checkbox" 
                        value={b} 
                        checked={selectedBuildings.has(b)}
                        onChange={() => handleBuildingChange(b)}
                        className="form-checkbox h-4 w-4 text-[var(--accent-color)] bg-[var(--bg-primary)] border-[var(--border-color)] rounded focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="ml-2 text-[var(--text-secondary)] truncate">{b === 'all' ? 'すべて' : b}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div id="building-placeholder" className="text-center text-[var(--text-tertiary)] p-4 border border-dashed border-[var(--border-color)] rounded-md">
                  大学を選択してください
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">曜日</label>
              <div id="day-selector" className="grid grid-cols-6 gap-2">
                {['月', '火', '水', '木', '金', '土'].map((day, index) => (
                  <button 
                    key={day} 
                    onClick={() => setSelectedDay(index + 1)}
                    className={`day-btn border border-[var(--border-color)] py-2 rounded-md text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors ${selectedDay === (index + 1) ? 'bg-[var(--accent-color)] text-[var(--accent-text)]' : ''}`}>
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">時間 (15分単位)</label>
              <TimeSlider value={timeRange} onChange={setTimeRange} />
            </div>

            <button onClick={handleSearch} id="search-btn" className="w-full bg-[var(--header-bg)] text-[var(--header-text)] font-bold py-3 rounded-lg hover:opacity-90 transition-all shadow-md flex items-center justify-center text-lg">
              <i className="fas fa-search mr-2"></i>さがす
            </button>
          </section>

          {/* Search Results */}
          <div id="search-results-container">
            {hasSearched ? (
              searchResults.length > 0 ? (
                <section id="results-section">
                  <h2 className="text-lg font-semibold mb-4 flex items-center text-[var(--text-primary)]"><i className="fas fa-chalkboard-teacher mr-2"></i>検索結果: {searchResults.length}件</h2>
                  <div className="space-y-4">
                    {searchResults.map(result => (
                      <div key={result.id} className="bg-[var(--bg-secondary)] p-4 rounded-lg shadow-sm border border-[var(--border-color)]">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-[var(--text-primary)]">{result.name}</h3>
                          <span className="text-xs font-mono text-[var(--text-tertiary)]">ID: {result.id}</span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]"><i className="fas fa-building mr-2"></i>{result.building}</p>
                        <p className="text-sm text-[var(--text-secondary)]"><i className="fas fa-users mr-2"></i>{result.capacity}人</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {result.attributes.map(attr => (
                            <span key={attr} className="bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs font-semibold px-2.5 py-0.5 rounded-full">{attr}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ) : (
                <div id="no-results-message" className="text-center text-[var(--text-tertiary)] py-8">
                  <i className="fas fa-ghost text-4xl mb-3"></i>
                  <p>空き教室が見つかりませんでした</p>
                  <p className="text-sm">条件を変えて再検索してください</p>
                </div>
              )
            ) : (
              <div id="initial-message" className="text-center text-[var(--text-tertiary)] py-8">
                <i className="fas fa-search text-4xl mb-3"></i>
                <p>上の条件で検索してください</p>
              </div>
            )}
          </div>

        </div>

        {/* University Selection Modal */}
        {isUniversityModalOpen && (
          <div id="university-modal" className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-30 p-4 backdrop-blur-sm">
            <div className="bg-[var(--bg-primary)] rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
              <header className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">大学を選択</h2>
                <button onClick={() => setIsUniversityModalOpen(false)} className="text-2xl text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                  <i className="fas fa-times"></i>
                </button>
              </header>
              <div className="p-4 overflow-y-auto">
                <ul className="space-y-2">
                  {mockUniversities.map(uni => (
                    <li key={uni.name}>
                      <button onClick={() => handleUniversitySelect(uni)} className="w-full text-left p-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
                        <span className="font-semibold text-[var(--text-primary)]">{uni.name}</span>
                        <p className="text-sm text-[var(--text-secondary)]">{uni.lat}, {uni.lon}</p>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Menu Modal */}
        {isMenuOpen && (
          <div id="menu-modal" className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 p-4 backdrop-blur-sm">
            <div className="bg-[var(--bg-primary)] rounded-xl shadow-2xl w-full max-w-xs flex flex-col">
                <header className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
                    <h2 className="text-lg font-bold text-[var(--text-primary)]">メニュー</h2>
                    <button onClick={() => setIsMenuOpen(false)} className="text-2xl text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                        <i className="fas fa-times"></i>
                    </button>
                </header>
                <div className="p-4">
                    <nav>
                        <ul className="space-y-2">
                            <li><Link href="/" onClick={() => setIsMenuOpen(false)} className="block py-2 px-4 text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg"><i className="fas fa-search w-6 mr-2"></i>空き教室検索</Link></li>
                            <li><Link href="/how-to-use" onClick={() => setIsMenuOpen(false)} className="block py-2 px-4 text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg"><i className="fas fa-question-circle w-6 mr-2"></i>使い方</Link></li>
                            <li><Link href="/review" onClick={() => setIsMenuOpen(false)} className="block py-2 px-4 text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg"><i className="fas fa-pen-alt w-6 mr-2"></i>レビュー投稿</Link></li>
                        </ul>
                    </nav>
                </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
