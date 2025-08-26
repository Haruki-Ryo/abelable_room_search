"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import { mockUniversities, mockClassrooms } from "./lib/data";
import Modal from "./components/Modal";
import Toast from "./components/Toast";
import ThemeMenu from "./components/ThemeMenu";
import BuildingTags from "./components/BuildingTags";
import TimelineBar from "./components/TimelineBar";

// Type definitions

interface TimeSliderProps {
  selectedSlots: Set<number>;
  onChange: (slots: Set<number>) => void;
}

type University = (typeof mockUniversities)[0];

// Time Slider Component (HTMLファイル完全再現版)
const TimeSlider: React.FC<TimeSliderProps> = ({ selectedSlots, onChange }) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartSlot, setDragStartSlot] = useState(-1);
  const [activeHandle, setActiveHandle] = useState<"start" | "end" | null>(
    null,
  );

  const getSlotIndexFromEvent = (
    e: MouseEvent | TouchEvent | React.MouseEvent | React.TouchEvent,
  ) => {
    if (!sliderRef.current) return 0;
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const rect = sliderRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const slotWidth = rect.width / 48; // 48 slots for 15-min intervals
    const index = Math.floor(x / slotWidth);
    return Math.max(0, Math.min(47, index)); // Clamp between 0 and 47
  };

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const newSlots = new Set<number>();
    const index = getSlotIndexFromEvent(e);
    setDragStartSlot(index);
    newSlots.add(index);
    onChange(newSlots);
  };

  const duringDrag = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;

      const currentIndex = getSlotIndexFromEvent(e);
      const newSlots = new Set<number>();

      if (activeHandle) {
        // Adjusting an existing selection
        const slots = [...selectedSlots].sort((a, b) => a - b);
        let minSlot = slots[0];
        let maxSlot = slots[slots.length - 1];

        if (activeHandle === "start") {
          minSlot = Math.min(currentIndex, maxSlot);
        } else {
          // 'end'
          maxSlot = Math.max(currentIndex, minSlot);
        }

        for (let i = minSlot; i <= maxSlot; i++) {
          newSlots.add(i);
        }
      } else {
        // Creating a new selection
        const start = Math.min(dragStartSlot, currentIndex);
        const end = Math.max(dragStartSlot, currentIndex);
        for (let i = start; i <= end; i++) {
          newSlots.add(i);
        }
      }

      onChange(newSlots);
    },
    [isDragging, activeHandle, selectedSlots, dragStartSlot, onChange],
  );

  const endDrag = useCallback(() => {
    setIsDragging(false);
    setActiveHandle(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", duringDrag);
      document.addEventListener("mouseup", endDrag);
      document.addEventListener("touchmove", duringDrag, { passive: false });
      document.addEventListener("touchend", endDrag);
    }

    return () => {
      document.removeEventListener("mousemove", duringDrag);
      document.removeEventListener("mouseup", endDrag);
      document.removeEventListener("touchmove", duringDrag);
      document.removeEventListener("touchend", endDrag);
    };
  }, [isDragging, duringDrag, endDrag]);

  const handleStartHandle = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveHandle("start");
    setIsDragging(true);
  };

  const handleEndHandle = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveHandle("end");
    setIsDragging(true);
  };

  const slotIndexToTime = (slotIndex: number) => {
    const totalMinutes = slotIndex * 15;
    const hours = 8 + Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  };

  const minSlot = selectedSlots.size > 0 ? Math.min(...selectedSlots) : -1;
  const maxSlot = selectedSlots.size > 0 ? Math.max(...selectedSlots) : -1;

  return (
    <div className="bg-[var(--bg-tertiary)] p-2 rounded-lg">
      <div className="flex justify-between text-center text-xs text-[var(--text-secondary)] mb-1 px-1">
        <span>8時</span>
        <span>9時</span>
        <span>10時</span>
        <span>11時</span>
        <span>12時</span>
        <span>13時</span>
        <span>14時</span>
        <span>15時</span>
        <span>16時</span>
        <span>17時</span>
        <span>18時</span>
        <span>19時</span>
        <span>20時</span>
      </div>
      <div className="relative">
        <div
          ref={sliderRef}
          className="w-full h-10 bg-[var(--bg-primary)] rounded-md flex border border-[var(--border-color)] cursor-pointer select-none"
          onMouseDown={startDrag}
          onTouchStart={startDrag}
        >
          {[...Array(48)].map((_, i) => (
            <div
              key={i}
              className={`time-slot flex-1 transition-colors ${selectedSlots.has(i) ? "selected" : ""}`}
              style={{
                borderRight:
                  i < 47 ? "1px solid var(--time-slot-border)" : "none",
                backgroundColor: selectedSlots.has(i)
                  ? "var(--time-slot-selected-bg)"
                  : "transparent",
              }}
            />
          ))}
        </div>

        {/* Start Handle */}
        {minSlot >= 0 && (
          <div
            className="absolute bg-[var(--accent-color)] border-2 border-[var(--bg-primary)] rounded cursor-ew-resize z-10"
            style={{
              position: "absolute",
              top: "-2px",
              bottom: "-2px",
              width: "10px",
              left: `${(minSlot / 48) * 100}%`,
            }}
            onMouseDown={handleStartHandle}
            onTouchStart={handleStartHandle}
          />
        )}

        {/* End Handle */}
        {maxSlot >= 0 && (
          <div
            className="absolute bg-[var(--accent-color)] border-2 border-[var(--bg-primary)] rounded cursor-ew-resize z-10"
            style={{
              position: "absolute",
              top: "-2px",
              bottom: "-2px",
              width: "10px",
              left: `${((maxSlot + 1) / 48) * 100}%`,
              transform: "translateX(-100%)",
            }}
            onMouseDown={handleEndHandle}
            onTouchStart={handleEndHandle}
          />
        )}
      </div>

      {/* Time Display Container */}
      {selectedSlots.size > 0 && (
        <div className="relative h-4 mt-1 text-xs text-[var(--text-secondary)]">
          <span
            className="absolute"
            style={{ left: `${(minSlot / 48) * 100}%` }}
          >
            {slotIndexToTime(minSlot)}
          </span>
          <span
            className="absolute"
            style={{
              left: `${((maxSlot + 1) / 48) * 100}%`,
              transform: "translateX(-100%)",
            }}
          >
            {slotIndexToTime(maxSlot + 1)}
          </span>
        </div>
      )}
    </div>
  );
};

export default function Home() {
  // State management
  const [isUniversityModalOpen, setIsUniversityModalOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] =
    useState<(typeof mockUniversities)[0] | null>(null);
  const [selectedBuildings, setSelectedBuildings] = useState<Set<string>>(
    new Set(["all"]),
  );
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<Set<number>>(
    new Set(),
  );
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  // 検索結果用: 部屋ごとの忙しい時間（講義がある時間）
  const [perRoomBusy, setPerRoomBusy] = useState<Record<string, { start: string; end: string }[]>>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  // 1. State追加（UI維持のため）
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [isClassroomModalOpen, setIsClassroomModalOpen] = useState(false);
  const [buildingSearch, setBuildingSearch] = useState("");
  const [classroomSearch, setClassroomSearch] = useState("");
  // 入力と建物タグの同期制御: ユーザーが入力したらtrue、空に戻したらfalseで自動同期を再開
  const [isClassroomSearchDirty, setIsClassroomSearchDirty] = useState(false);
  const [universitySearch, setUniversitySearch] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    isError: false,
  });
  let toastTimeout: NodeJS.Timeout | null = null;
  const showToast = (message: string, isError = false) => {
    setToast({ show: true, message, isError });
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(
      () => setToast((t) => ({ ...t, show: false })),
      2500,
    );
  };
  const [theme, setTheme] = useState<"light" | "dark" | "system">(() => {
    if (typeof window !== "undefined") {
      return (
        (localStorage.getItem("theme") as "light" | "dark" | "system") ||
        "system"
      );
    }
    return "system";
  });
  useEffect(() => {
    const applyTheme = (t: "light" | "dark" | "system") => {
      if (
        t === "dark" ||
        (t === "system" &&
          window.matchMedia("(prefers-color-scheme: dark)").matches)
      ) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    };
    applyTheme(theme);
    localStorage.setItem("theme", theme);
    const listener = () => {
      if (localStorage.getItem("theme") === "system") applyTheme("system");
    };
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", listener);
    return () =>
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", listener);
  }, [theme]);

  // 大学に紐づく建物一覧（UI用）。検索自体はAPI使用
  const buildings = selectedUniversity
    ? [
        "all",
        "全学共通棟",
        "基礎工学棟",
        "理学棟",
        "工学棟",
      ]
    : [];

  // 2. 建物・教室リスト取得（UI用）
  const filteredBuildings = buildings.filter(
    (b) => b === "all" || b.includes(buildingSearch),
  );
  const classrooms =
    selectedUniversity
      ? mockClassrooms.filter(
          (c) => c.university === selectedUniversity.name,
        )
      : [];
  // 大学は大阪大学のみ表示
  const filteredUniversities = mockUniversities.filter(
    (uni) =>
      uni.name === "大阪大学" &&
      uni.name.toLowerCase().includes(universitySearch.toLowerCase()),
  );
  const filteredClassrooms = classrooms.filter((c) =>
    c.name.includes(classroomSearch),
  );

  // 選択された建物タグから教室名フィルタ用の表示トークンを生成
  const buildingTokensMap: Record<string, string[]> = {
    "全学共通棟": ["共A", "共B", "共C"],
    "基礎工学棟": ["基礎工学", "基/"],
    "理学棟": ["理学", "理/"],
    "工学棟": ["工/"],
  };
  const selectedTokens = useMemo(
    () =>
      Array.from(selectedBuildings)
        .filter((b) => b !== "all")
        .flatMap((b) => buildingTokensMap[b] || [])
        .filter((t): t is string => Boolean(t)),
    [selectedBuildings],
  );

  // 教室名入力欄と建物タグの自動同期: ユーザー未入力のときはトークンをそのまま表示
  useEffect(() => {
    if (!isClassroomSearchDirty) {
      const tokenString = selectedTokens.join(", ");
      setClassroomSearch(tokenString);
    }
  }, [selectedTokens, isClassroomSearchDirty]);

  // 時限の時間帯（/api/availability と同一定義）
  const PERIODS: ReadonlyArray<readonly [string, string]> = [
    ["08:50", "10:20"],
    ["10:30", "12:00"],
    ["13:30", "15:00"],
    ["15:10", "16:40"],
    ["16:50", "18:20"],
    ["18:30", "20:00"],
  ];

  // 指定日の1日スケジュール（忙しい時間帯）を結果の教室分だけ推定
  const buildBusyScheduleForRooms = useCallback(async (rooms: string[], day: number) => {
    if (rooms.length === 0) {
      setPerRoomBusy({});
      return;
    }
    const requests = PERIODS.map(([s, e]) =>
      fetch(`/api/availability?${new URLSearchParams({ day: String(day), start: s, end: e }).toString()}`, { cache: "no-store" })
        .then(async (r) => {
          const j = (await r.json()) as { rooms: string[] };
          return new Set(j.rooms);
        })
        .catch(() => new Set<string>())
    );
    const freeSets = await Promise.all(requests);
    const busyMap: Record<string, { start: string; end: string }[]> = {};
    for (const room of rooms) {
      const busy: { start: string; end: string }[] = [];
      PERIODS.forEach(([s, e], idx) => {
        const freeSet = freeSets[idx];
        if (!freeSet.has(room)) {
          busy.push({ start: s, end: e });
        }
      });
      busyMap[room] = busy;
    }
    setPerRoomBusy(busyMap);
  }, [PERIODS]);

  // Handlers
  const handleSearch = async () => {
    if (!selectedDay || selectedTimeSlots.size === 0) {
      showToast("曜日と時間を選択してください", true);
      return;
    }
    // Compute HH:MM from selected slots (8:00 base, 15-min increments)
    const minSlot = Math.min(...selectedTimeSlots);
    const maxSlot = Math.max(...selectedTimeSlots) + 1; // end is exclusive
    const toHHMM = (mins: number) =>
      `${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(mins % 60).padStart(2, "0")}`;
    const start = toHHMM(480 + 15 * minSlot);
    const end = toHHMM(480 + 15 * maxSlot);

    // helper: escape regex metacharacters for literal tokens
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // helper: transform a token for regex. If it ends with '/', anchor to start
    const toRegexToken = (t: string, treatAsLiteral: boolean) => {
      const trimmed = t.trim();
      if (!trimmed) return "";
      const literal = treatAsLiteral ? escapeRegex(trimmed) : trimmed;
      if (trimmed.endsWith("/")) {
        // Auto front-anchor tokens like 工/, 理/, 基/, 文法経/
        return literal.startsWith("^") ? literal : `^${literal}`;
      }
      return literal;
    };

    try {
      const p = new URLSearchParams({ day: String(selectedDay), start, end });

      // room_regex: ユーザー入力があればそれを優先。なければ建物タグから生成
      const rawText = classroomSearch.trim();
      const hasSep = /[、，,\s]/.test(rawText);
      if (isClassroomSearchDirty && rawText) {
        if (hasSep) {
          // comma/space separated → treat each as literal, then OR
          const parts = rawText.split(/[、，,\s]+/).map((t) => toRegexToken(t, true)).filter(Boolean);
          if (parts.length > 0) p.append("room_regex", parts.join("|"));
        } else {
          // single token → keep regex if any, but auto front-anchor tokens ending with '/'
          const token = toRegexToken(rawText, false);
          p.append("room_regex", token);
        }
      } else {
        if (selectedTokens.length > 0) {
          // Curated tokens are literals; anchor tokens ending with '/'
          const parts = selectedTokens.map((t) => toRegexToken(t, true)).filter(Boolean);
          p.append("room_regex", parts.join("|"));
        }
      }

      const res = await fetch(`/api/availability?${p.toString()}`, {
        cache: "no-store",
      });
      const json = (await res.json()) as { rooms: string[]; count: number; error?: string };
      if (!res.ok) {
        showToast(json.error || "検索に失敗しました", true);
        setSearchResults([]);
        setHasSearched(true);
        return;
      }
      setSearchResults(json.rooms);
      setHasSearched(true);
      // 結果の教室について当日全体のビジースロットを取得してタイムライン表示
      if (selectedDay) {
        buildBusyScheduleForRooms(json.rooms, selectedDay);
      } else {
        setPerRoomBusy({});
      }
    } catch {
      showToast("検索時にエラーが発生しました", true);
      setSearchResults([]);
      setHasSearched(true);
    }
  };

  // 現在地から大阪大学＆最寄り建物（UI設定のみ）
  const handleLocationSearch = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      showToast("お使いのブラウザは位置情報取得に対応していません。", true);
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const getDistance = (
          lat1: number,
          lon1: number,
          lat2: number,
          lon2: number,
        ) => {
          const R = 6371;
          const dLat = ((lat2 - lat1) * Math.PI) / 180;
          const dLon = ((lon1 - lon2) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
              Math.cos((lat2 * Math.PI) / 180) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        };
        // 大学は大阪大学のみ対象
        const ou = mockUniversities.find((u) => u.name === "大阪大学") || null;
        let closestUniversity: University | null = ou;
        if (closestUniversity) {
          setSelectedUniversity(closestUniversity);
          const universityName = closestUniversity.name;
          const buildingsForUni = mockClassrooms.filter(
            (c) => c.university === universityName,
          );
          let closestBuilding: string | null = null;
          let minBldDist = Infinity;
          buildingsForUni.forEach((b) => {
            const dist = getDistance(latitude, longitude, b.lat, b.lon);
            if (dist < minBldDist) {
              minBldDist = dist;
              closestBuilding = b.building;
            }
          });
          // 位置情報の建物は A〜D 等のため、キュレート済みタグとは一致しない。
          // 現仕様ではタグは "すべて" にリセットする。
          setSelectedBuildings(new Set(["all"]));
          if (closestBuilding) {
            showToast(`現在地から${universityName}を適用しました（建物タグは すべて を選択）`);
          } else {
            showToast(`現在地から${universityName}を適用しました`);
          }
        } else {
          showToast("近くに大学が見つかりませんでした。", true);
        }
        setIsLocating(false);
      },
      () => {
        showToast(
          "位置情報を取得できませんでした。ブラウザの設定を確認してください。",
          true,
        );
        setIsLocating(false);
      },
    );
  };

  const handleDaySelect = (day: number) => {
    setSelectedDay(day);
    // Clear time selection when day changes
    setSelectedTimeSlots(new Set());
  };

  const handleUniversitySelect = (university: University) => {
    setSelectedUniversity(university);
    setSelectedBuildings(new Set(["all"]));
    setIsUniversityModalOpen(false);
    setUniversitySearch("");
  };

  const handleBuildingChange = (building: string) => {
    const newSelection = new Set(selectedBuildings);
    if (building === "all") {
      newSelection.clear();
      newSelection.add("all");
    } else {
      newSelection.delete("all");
      if (newSelection.has(building)) {
        newSelection.delete(building);
      } else {
        newSelection.add(building);
      }
      if (newSelection.size === 0) {
        newSelection.add("all");
      }
    }
    setSelectedBuildings(newSelection);
  };

  // On mount: set default day and fix university to Osaka University
  useEffect(() => {
    const today = new Date().getDay();
    setSelectedDay(today === 0 ? 1 : today);
    const ou = mockUniversities.find((u) => u.name === "大阪大学") || null;
    setSelectedUniversity(ou);
  }, []);

  return (
    <>
      {/* Main Content */}
      <main className="p-4">
        <div id="search-page">
          <section
            id="search-criteria"
            className="bg-[var(--bg-primary)] p-4 rounded-lg shadow-sm mb-6"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center text-[var(--text-primary)]">
              <i className="fas fa-search mr-2"></i>検索項目
            </h2>

            <button
              onClick={handleLocationSearch}
              disabled={isLocating}
              id="location-btn"
              className="w-full bg-[var(--accent-color)] text-[var(--accent-text)] font-bold py-2.5 px-4 rounded-lg hover:opacity-90 transition-all shadow-md flex items-center justify-center text-base mb-4 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLocating ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>検索中...
                </>
              ) : (
                <>
                  <i className="fas fa-map-marker-alt mr-2"></i>
                  現在地から大学・建物を設定
                </>
              )}
            </button>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                大学
              </label>
              <div className="relative flex-grow">
                <button
                  onClick={() => setIsUniversityModalOpen(true)}
                  id="university-select-btn"
                  className="w-full text-left pl-10 pr-4 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] bg-[var(--bg-primary)]"
                >
                  <span
                    id="selected-university-name"
                    className="text-[var(--text-primary)]"
                  >
                    {selectedUniversity?.name || "大学を選択してください"}
                  </span>
                </button>
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <i className="fas fa-graduation-cap text-[var(--text-tertiary)]"></i>
                </span>
              </div>
            </div>

            {/* 建物選択UI */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                建物
              </label>
              {selectedUniversity ? (
                <BuildingTags
                  buildings={buildings}
                  selected={selectedBuildings}
                  onChange={handleBuildingChange}
                  onOpenList={() => setIsBuildingModalOpen(true)}
                />
              ) : (
                <div
                  id="building-placeholder"
                  className="text-center text-[var(--text-tertiary)] p-4 border border-dashed border-[var(--border-color)] rounded-md"
                >
                  大学を選択してください
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                教室名フィルタ
              </label>
              <input
                type="text"
                value={classroomSearch}
                onChange={(e) => {
                  const v = e.target.value;
                  setClassroomSearch(v);
                  setIsClassroomSearchDirty(v.trim().length > 0 ? true : false);
                }}
                placeholder="例: 共A, 共B, 共C ／ 基礎工学, 基/ ／ 理学, 理/ ／ 工/ ／ 文法経/（先頭一致）"
                className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md bg-[var(--bg-primary)]"
              />
              {/* 自動表示は入力欄に反映するため、下のヒント表示は削除 */}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                曜日
              </label>
              <div id="day-selector" className="grid grid-cols-6 gap-2">
                {["月", "火", "水", "木", "金", "土"].map((day, index) => (
                  <button
                    key={day}
                    onClick={() => handleDaySelect(index + 1)}
                    className={`day-btn border border-[var(--border-color)] py-2 rounded-md text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] transition-colors ${selectedDay === index + 1 ? "active" : ""}`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
                時間 (15分単位)
              </label>
              {/* TimeSlider remains unchanged */}
              <TimeSlider
                selectedSlots={selectedTimeSlots}
                onChange={setSelectedTimeSlots}
              />
            </div>

            <button
              onClick={handleSearch}
              id="search-btn"
              className="w-full bg-[var(--header-bg)] text-[var(--header-text)] font-bold py-3 rounded-lg hover:opacity-90 transition-all shadow-md flex items-center justify-center text-lg"
            >
              <i className="fas fa-search mr-2"></i>さがす
            </button>

            {hasSearched && (
              <p className="mt-3 text-xs text-[var(--text-tertiary)]">
                検索結果は選択した時間帯に以下の教室で大学公式シラバスに掲載された講義が行われていないことを意味するものであり、イベントや研究室の活動、自主活動等は含まれません。正確な情報は確認し、社会の規範に反する行為は控えてください。
              </p>
            )}
          </section>

          {/* Search Results */}
          <div id="search-results-container">
            {hasSearched ? (
              searchResults.length > 0 ? (
                <section id="results-section">
                  <h2 className="text-lg font-semibold mb-4 flex items-center text-[var(--text-primary)]">
                    <i className="fas fa-chalkboard-teacher mr-2"></i>検索結果: {searchResults.length}件
                  </h2>
                  <div className="space-y-4">
                    {searchResults.map((room) => (
                      <div key={room} className="bg-[var(--bg-secondary)] p-4 rounded-lg border border-[var(--border-color)]">
                        {/* 建物ピルはデータ未整備のため非表示（将来対応） */}
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-extrabold text-lg leading-tight text-[var(--text-primary)]">{room}</h3>
                          {/* 将来の属性タグ置き場（会話OK、コンセントなど） */}
                        </div>
                        {/* タイムライン（8:00 - 20:00） */}
                        <div className="mt-2">
                          <div className="flex justify-between text-sm text-[var(--text-secondary)] mb-1">
                            <span>8:00</span>
                            <span>20:00</span>
                          </div>
                          <TimelineBar schedule={perRoomBusy[room] || []} />
                          <div className="flex justify-end mt-1">
                            <span className="text-sm text-[var(--text-tertiary)]">空き時間（{["", "月", "火", "水", "木", "金", "土"][selectedDay || 0]}曜）</span>
                          </div>
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

        {/* Menu Modal (unchanged) */}
        {isMenuOpen && (
          <div
            id="menu-modal"
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40 p-4 backdrop-blur-sm"
          >
            <div className="bg-[var(--bg-primary)] rounded-xl shadow-2xl w-full max-w-xs flex flex-col">
              <header className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
                <h2 className="text-lg font-bold text-[var(--text-primary)]">メニュー</h2>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-2xl text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                >
                  <i className="fas fa-times"></i>
                </button>
              </header>
              <div className="p-4">
                <nav>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/"
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-2 px-4 text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg"
                      >
                        <i className="fas fa-search w-6 mr-2"></i>空き教室検索
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/howto"
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-2 px-4 text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg"
                      >
                        <i className="fas fa-question-circle w-6 mr-2"></i>使い方
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/review"
                        onClick={() => setIsMenuOpen(false)}
                        className="block py-2 px-4 text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] rounded-lg"
                      >
                        <i className="fas fa-comment-dots w-6 mr-2"></i>教室レビュー
                      </Link>
                    </li>
                    <li className="mb-4">
                      <div className="flex items-center p-2 rounded-md">
                        <i className="fas fa-palette w-6 text-center mr-3"></i>
                        <span>モード</span>
                      </div>
                      <ThemeMenu current={theme} onChange={setTheme} />
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        )}
      </main>
      <Toast message={toast.message} show={toast.show} isError={toast.isError} />

      {/* University Selection Modal（大阪大学のみ表示） */}
      <Modal
        isOpen={isUniversityModalOpen}
        onClose={() => {
          setIsUniversityModalOpen(false);
          setUniversitySearch("");
        }}
      >
        <header className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
          <h3 className="text-lg font-bold">大学一覧</h3>
          <button
            onClick={() => {
              setIsUniversityModalOpen(false);
              setUniversitySearch("");
            }}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-2xl"
          >
            &times;
          </button>
        </header>
        <div className="p-4 flex-grow overflow-y-auto">
          <input
            type="text"
            value={universitySearch}
            onChange={(e) => setUniversitySearch(e.target.value)}
            placeholder="大学名で検索...（現在大阪大学のみ）"
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md mb-4 bg-[var(--bg-primary)]"
          />
          <ul className="space-y-1">
            {filteredUniversities.map((uni) => (
              <li key={uni.name}>
                <button
                  onClick={() => handleUniversitySelect(uni)}
                  className={`w-full text-left p-2 hover:bg-[var(--bg-secondary)] rounded cursor-pointer ${
                    selectedUniversity?.name === uni.name
                      ? "selected font-bold text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {uni.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Modal>

      {/* Building Modal（UI維持） */}
      <Modal
        isOpen={isBuildingModalOpen}
        onClose={() => setIsBuildingModalOpen(false)}
      >
        <header className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">建物一覧</h2>
          <button
            onClick={() => setIsBuildingModalOpen(false)}
            className="text-2xl text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <i className="fas fa-times"></i>
          </button>
        </header>
        <div className="p-4 flex flex-col max-h-[70vh]">
          <input
            type="text"
            value={buildingSearch}
            onChange={(e) => setBuildingSearch(e.target.value)}
            placeholder="建物名で検索..."
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md mb-4 bg-[var(--bg-primary)]"
          />
          <ul className="space-y-3 overflow-y-auto flex-1 pr-1">
            {filteredBuildings.map((b) => (
              <li key={b}>
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="form-checkbox accent-[var(--accent-color)] w-5 h-5"
                    checked={selectedBuildings.has(b)}
                    onChange={() => handleBuildingChange(b)}
                  />
                  <span className={`font-medium ${selectedBuildings.has(b) ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                    {b === 'all' ? 'すべて' : b}
                  </span>
                </label>
              </li>
            ))}
          </ul>
          <div className="pt-4">
            <button
              className="w-full bg-[var(--header-bg)] text-[var(--header-text)] font-bold py-2.5 rounded-lg hover:opacity-90 transition-all shadow-md"
              onClick={() => setIsBuildingModalOpen(false)}
            >
              完了
            </button>
          </div>
        </div>
      </Modal>

      {/* Classroom Modal（UI維持） */}
      <Modal
        isOpen={isClassroomModalOpen}
        onClose={() => setIsClassroomModalOpen(false)}
      >
        <header className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
          <h2 className="text-lg font-bold text-[var(--text-primary)]">教室を選択</h2>
          <button
            onClick={() => setIsClassroomModalOpen(false)}
            className="text-2xl text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <i className="fas fa-times"></i>
          </button>
        </header>
        <div className="p-4">
          <input
            type="text"
            value={classroomSearch}
            onChange={(e) => {
              const v = e.target.value;
              setClassroomSearch(v);
              setIsClassroomSearchDirty(v.trim().length > 0 ? true : false);
            }}
            placeholder="教室名で検索...（正規表現可／例: 共A, 共B, 共C または 基礎工学, 基/ または 理学, 理/ または 工/ または 文法経/（先頭一致））"
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md mb-4 bg-[var(--bg-primary)]"
          />
          <ul className="space-y-2 max-h-60 overflow-y-auto">
            {filteredClassrooms.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => {
                    // 教室名を正規表現欄に適用
                    setClassroomSearch(c.name);
                    setIsClassroomSearchDirty(true);
                    setIsClassroomModalOpen(false);
                  }}
                  className="w-full text-left p-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
                >
                  <span className="font-semibold text-[var(--text-primary)]">
                    {c.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </>
  );
}
