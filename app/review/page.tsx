"use client";

import { useState } from "react";
import Link from "next/link";
import Modal from "../components/Modal";
import Toast from "../components/Toast";
import { mockUniversities, mockClassrooms } from "../lib/data";

type University = (typeof mockUniversities)[0];

// ユークリッド距離で最寄りを判定
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2));
}

export default function ReviewPage() {
  const [isUniversityModalOpen, setIsUniversityModalOpen] = useState(false);
  const [isBuildingModalOpen, setIsBuildingModalOpen] = useState(false);
  const [isClassroomModalOpen, setIsClassroomModalOpen] = useState(false);
  const [selectedUniversity, setSelectedUniversity] =
    useState<University | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<string | null>(null);
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(
    null,
  );
  const [universitySearch, setUniversitySearch] = useState("");
  const [buildingSearch, setBuildingSearch] = useState("");
  const [classroomSearch, setClassroomSearch] = useState("");
  const [toast, setToast] = useState({
    show: false,
    message: "",
    isError: false,
  });
  const [comment, setComment] = useState("");
  let toastTimeout: NodeJS.Timeout | null = null;

  const showToast = (message: string, isError = false) => {
    setToast({ show: true, message, isError });
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(
      () => setToast((t) => ({ ...t, show: false })),
      2500,
    );
  };

  const [tags, setTags] = useState<string[]>([]);
  const tagOptions = [
    { label: "コンセントあり", value: "コンセントあり" },
    { label: "会話OK", value: "会話OK" },
    { label: "混みがち", value: "混みがち" },
  ];

  const filteredUniversities = mockUniversities.filter((u) =>
    u.name.includes(universitySearch),
  );
  const buildings = selectedUniversity
    ? Array.from(
        new Set(
          mockClassrooms
            .filter((c) => c.university === selectedUniversity.name)
            .map((c) => c.building),
        ),
      )
    : [];
  const filteredBuildings = buildings.filter((b) => b.includes(buildingSearch));
  const classrooms =
    selectedUniversity && selectedBuilding
      ? mockClassrooms.filter(
          (c) =>
            c.university === selectedUniversity.name &&
            c.building === selectedBuilding,
        )
      : [];
  const filteredClassrooms = classrooms.filter((c) =>
    c.name.includes(classroomSearch),
  );

  const handleLocationUniversity = () => {
    if (!navigator.geolocation) {
      showToast("位置情報取得がサポートされていません", true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        let nearest = null;
        let minDist = Infinity;
        for (const u of mockUniversities) {
          if (u.lat && u.lon) {
            const dist = getDistance(latitude, longitude, u.lat, u.lon);
            if (dist < minDist) {
              minDist = dist;
              nearest = u;
            }
          }
        }
        if (nearest) {
          setSelectedUniversity(nearest);
          setSelectedBuilding(null);
          setSelectedClassroom(null);
          showToast(`現在地から${nearest.name}を選択しました`);
        } else {
          showToast("最寄りの大学が見つかりません", true);
        }
      },
      () => showToast("位置情報の取得に失敗しました", true),
    );
  };

  const handleLocationBuilding = () => {
    if (!selectedUniversity) {
      showToast("先に大学を選択してください", true);
      return;
    }
    if (!navigator.geolocation) {
      showToast("位置情報取得がサポートされていません", true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const buildings = mockClassrooms
          .filter((c) => c.university === selectedUniversity.name)
          .map((c) => ({ name: c.building, lat: c.lat, lon: c.lon }));
        // 重複除去
        const uniqueBuildings = Array.from(
          new Map(buildings.map((b) => [b.name, b])).values(),
        );
        let nearest = null;
        let minDist = Infinity;
        for (const b of uniqueBuildings) {
          if (b.lat && b.lon) {
            const dist = getDistance(latitude, longitude, b.lat, b.lon);
            if (dist < minDist) {
              minDist = dist;
              nearest = b;
            }
          }
        }
        if (nearest) {
          setSelectedBuilding(nearest.name);
          setSelectedClassroom(null);
          showToast(`現在地から${nearest.name}を選択しました`);
        } else {
          showToast("最寄りの建物が見つかりません", true);
        }
      },
      () => showToast("位置情報の取得に失敗しました", true),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showToast("レビューを投稿しました！");
    // フォームをリセット
    setSelectedUniversity(null);
    setSelectedBuilding(null);
    setSelectedClassroom(null);
    setComment("");
    setTags([]);
  };

  return (
    <main className="p-4 text-[var(--text-primary)]">
      <button className="mb-4 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        <Link href="/" className="flex items-center">
          <i className="fas fa-arrow-left mr-2"></i>検索に戻る
        </Link>
      </button>

      <div className="p-4 bg-[var(--bg-primary)] rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-[var(--text-primary)]">
          教室レビュー投稿
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* 大学選択 */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              大学
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <button
                  type="button"
                  onClick={() => setIsUniversityModalOpen(true)}
                  className="w-full text-left pl-10 pr-4 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] bg-[var(--bg-primary)]"
                >
                  <span className="text-[var(--text-primary)]">
                    {selectedUniversity
                      ? selectedUniversity.name
                      : "大学を選択..."}
                  </span>
                </button>
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <i className="fas fa-graduation-cap text-[var(--text-tertiary)]"></i>
                </span>
              </div>
              <button
                type="button"
                onClick={handleLocationUniversity}
                className="bg-[var(--accent-color)] text-[var(--accent-text)] px-4 py-2 rounded-md hover:opacity-90"
                aria-label="現在地から大学を検索"
              >
                <i className="fas fa-map-marker-alt"></i>
              </button>
            </div>
          </div>

          {/* 建物選択 */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              建物
            </label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-grow">
                <button
                  type="button"
                  onClick={() => setIsBuildingModalOpen(true)}
                  className="w-full text-left pl-10 pr-4 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] bg-[var(--bg-primary)]"
                  disabled={!selectedUniversity}
                >
                  <span className="text-[var(--text-primary)]">
                    {selectedBuilding || "建物を選択..."}
                  </span>
                </button>
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <i className="fas fa-building text-[var(--text-tertiary)]"></i>
                </span>
              </div>
              <button
                type="button"
                onClick={handleLocationBuilding}
                className="bg-[var(--accent-color)] text-[var(--accent-text)] px-4 py-2 rounded-md hover:opacity-90"
                aria-label="現在地から建物を検索"
              >
                <i className="fas fa-map-marker-alt"></i>
              </button>
            </div>
          </div>

          {/* 教室選択 */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              教室
            </label>
            <div className="relative flex-grow">
              <button
                type="button"
                onClick={() => setIsClassroomModalOpen(true)}
                className="w-full text-left pl-10 pr-4 py-2 border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] bg-[var(--bg-primary)]"
                disabled={!selectedBuilding}
              >
                <span className="text-[var(--text-primary)]">
                  {selectedClassroom || "教室を選択..."}
                </span>
              </button>
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <i className="fas fa-chalkboard text-[var(--text-tertiary)]"></i>
              </span>
            </div>
          </div>

          {/* タグ選択 */}
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">
              タグ
            </label>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map((opt) => (
                <label
                  key={opt.value}
                  className="flex items-center space-x-2 p-2 border border-[var(--border-color)] rounded-md"
                >
                  <input
                    type="checkbox"
                    className="form-checkbox text-[var(--accent-color)]"
                    checked={tags.includes(opt.value)}
                    onChange={(e) => {
                      setTags((tags) =>
                        e.target.checked
                          ? [...tags, opt.value]
                          : tags.filter((t) => t !== opt.value),
                      );
                    }}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* コメント */}
          <div>
            <label
              htmlFor="review-comment"
              className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
            >
              コメント
            </label>
            <textarea
              id="review-comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-2 border border-[var(--border-color)] rounded-md bg-[var(--bg-primary)] text-[var(--text-primary)]"
              placeholder="例：窓際の席は日当たりが良いです"
            />
          </div>

          {/* 投稿ボタン */}
          <button
            type="submit"
            className="w-full bg-[var(--header-bg)] text-[var(--header-text)] font-bold py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            投稿する
          </button>
        </form>
      </div>

      {/* 大学選択モーダル */}
      <Modal
        isOpen={isUniversityModalOpen}
        onClose={() => setIsUniversityModalOpen(false)}
      >
        <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
          <h3 className="text-lg font-bold">大学一覧</h3>
          <button
            onClick={() => setIsUniversityModalOpen(false)}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-2xl"
          >
            &times;
          </button>
        </div>
        <div className="p-4 flex-grow overflow-y-auto">
          <input
            type="text"
            value={universitySearch}
            onChange={(e) => setUniversitySearch(e.target.value)}
            placeholder="大学名で検索..."
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md mb-4 bg-[var(--bg-primary)]"
          />
          <ul className="space-y-1">
            {filteredUniversities.map((u) => (
              <li key={u.name}>
                <button
                  onClick={() => {
                    setSelectedUniversity(u);
                    setSelectedBuilding(null);
                    setSelectedClassroom(null);
                    setIsUniversityModalOpen(false);
                  }}
                  className={`p-2 hover:bg-[var(--bg-secondary)] rounded cursor-pointer w-full text-left ${
                    selectedUniversity?.name === u.name
                      ? "selected font-bold text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {u.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Modal>

      {/* 建物選択モーダル */}
      <Modal
        isOpen={isBuildingModalOpen}
        onClose={() => setIsBuildingModalOpen(false)}
      >
        <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
          <h3 className="text-lg font-bold">建物一覧</h3>
          <button
            onClick={() => setIsBuildingModalOpen(false)}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-2xl"
          >
            &times;
          </button>
        </div>
        <div className="p-4 flex-grow overflow-y-auto">
          <input
            type="text"
            value={buildingSearch}
            onChange={(e) => setBuildingSearch(e.target.value)}
            placeholder="建物名で検索..."
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md mb-4 bg-[var(--bg-primary)]"
          />
          <ul className="space-y-1">
            {filteredBuildings.map((b) => (
              <li key={b}>
                <button
                  onClick={() => {
                    setSelectedBuilding(b);
                    setSelectedClassroom(null);
                    setIsBuildingModalOpen(false);
                  }}
                  className={`p-2 hover:bg-[var(--bg-secondary)] rounded cursor-pointer w-full text-left ${
                    selectedBuilding === b
                      ? "selected font-bold text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {b}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Modal>

      {/* 教室選択モーダル */}
      <Modal
        isOpen={isClassroomModalOpen}
        onClose={() => setIsClassroomModalOpen(false)}
      >
        <div className="p-4 border-b border-[var(--border-color)] flex justify-between items-center">
          <h3 className="text-lg font-bold">教室一覧</h3>
          <button
            onClick={() => setIsClassroomModalOpen(false)}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-2xl"
          >
            &times;
          </button>
        </div>
        <div className="p-4 flex-grow overflow-y-auto">
          <input
            type="text"
            value={classroomSearch}
            onChange={(e) => setClassroomSearch(e.target.value)}
            placeholder="教室名で検索..."
            className="w-full px-3 py-2 border border-[var(--border-color)] rounded-md mb-4 bg-[var(--bg-primary)]"
          />
          <ul className="space-y-1">
            {filteredClassrooms.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => {
                    setSelectedClassroom(c.name);
                    setIsClassroomModalOpen(false);
                  }}
                  className={`p-2 hover:bg-[var(--bg-secondary)] rounded cursor-pointer w-full text-left ${
                    selectedClassroom === c.name
                      ? "selected font-bold text-[var(--text-primary)]"
                      : "text-[var(--text-secondary)]"
                  }`}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </Modal>

      <Toast
        message={toast.message}
        show={toast.show}
        isError={toast.isError}
      />
    </main>
  );
}
