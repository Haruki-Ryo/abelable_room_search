"use client";

import Link from "next/link";

export default function HowToUsePage() {
  return (
    <main className="p-4 text-[var(--text-primary)]">
      <button className="mb-4 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        <Link href="/" className="flex items-center">
          <i className="fas fa-arrow-left mr-2"></i>検索に戻る
        </Link>
      </button>

      <div className="p-4 bg-[var(--bg-primary)] rounded-lg">
        <h2 className="text-xl font-bold mb-6 text-[var(--text-primary)] text-center">
          使い方ガイド
        </h2>
        <div className="space-y-6 text-[var(--text-secondary)]">
          <div className="p-4 border border-[var(--border-color)] rounded-lg">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2 flex items-center">
              <span className="bg-[var(--accent-color)] text-[var(--accent-text)] rounded-full h-6 w-6 flex items-center justify-center mr-3">
                1
              </span>
              検索条件の指定
            </h3>
            <p>
              トップページで<i className="fas fa-university mx-1"></i>
              <strong>大学</strong>、
              <i className="fas fa-calendar-day mx-1"></i>
              <strong>曜日</strong>、<i className="fas fa-clock mx-1"></i>
              <strong>時間</strong>
              の３つの条件を指定します。時間帯はドラッグで範囲選択できます。
            </p>
          </div>

          <div className="p-4 border border-[var(--border-color)] rounded-lg">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2 flex items-center">
              <span className="bg-[var(--accent-color)] text-[var(--accent-text)] rounded-full h-6 w-6 flex items-center justify-center mr-3">
                2
              </span>
              教室をさがす
            </h3>
            <p>
              条件を指定したら、<i className="fas fa-search mx-1"></i>
              <strong>さがす</strong>
              ボタンをタップ。条件に合う空き教室が一覧で表示されます。
            </p>
          </div>

          <div className="p-4 border border-[var(--border-color)] rounded-lg">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2 flex items-center">
              <span className="bg-[var(--accent-color)] text-[var(--accent-text)] rounded-full h-6 w-6 flex items-center justify-center mr-3">
                3
              </span>
              結果の確認
            </h3>
            <p>
              各教室カードには、名前や設備の他に、その日の空き時間がタイムラインで表示されます。色が付いている部分が利用可能な時間帯です。
            </p>
          </div>

          <div className="p-4 border border-[var(--border-color)] rounded-lg">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2 flex items-center">
              <span className="bg-[var(--accent-color)] text-[var(--accent-text)] rounded-full h-6 w-6 flex items-center justify-center mr-3">
                4
              </span>
              教室レビュー
            </h3>
            <p>
              メニューの<i className="fas fa-comment-dots mx-1"></i>
              <strong>教室レビュー</strong>
              から、各教室の設備などの情報を投稿できます。みんなで情報を共有しましょう！
            </p>
          </div>

          <div className="p-4 border border-[var(--border-color)] rounded-lg">
            <h3 className="font-semibold text-[var(--text-primary)] mb-2 flex items-center">
              <span className="bg-[var(--accent-color)] text-[var(--accent-text)] rounded-full h-6 w-6 flex items-center justify-center mr-3">
                5
              </span>
              表示モードの切替
            </h3>
            <p>
              メニューの<i className="fas fa-palette mx-1"></i>
              <strong>モード</strong>
              から、見やすい表示（ライト/ダーク）にいつでも切り替えられます。
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
