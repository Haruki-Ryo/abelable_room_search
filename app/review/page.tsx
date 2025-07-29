'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ReviewPage() {
  const [rating, setRating] = useState(0);

  return (
    <div className="container mx-auto max-w-lg bg-[var(--bg-primary)] min-h-screen shadow-xl">
      <header className="bg-[var(--header-bg)] text-[var(--header-text)] p-4 flex items-center shadow-md sticky top-0 z-20">
        <Link href="/" className="text-2xl mr-3"><i className="fas fa-arrow-left"></i></Link>
        <h1 className="text-xl font-bold tracking-wider">レビュー投稿</h1>
      </header>
      <main className="p-4 text-[var(--text-primary)]">
        <form className="space-y-4">
          <div>
            <label htmlFor="classroom-id" className="block text-sm font-medium text-[var(--text-secondary)]">教室ID</label>
            <input type="text" id="classroom-id" placeholder="例: 101" className="mt-1 block w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)]">評価</label>
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} type="button" onClick={() => setRating(star)} className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-400'}`}>
                  <i className="fas fa-star"></i>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="review-comment" className="block text-sm font-medium text-[var(--text-secondary)]">コメント</label>
            <textarea id="review-comment" rows={4} placeholder="コンセントの数、Wi-Fiの速度など" className="mt-1 block w-full px-3 py-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md text-sm shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[var(--accent-color)] focus:border-[var(--accent-color)]"></textarea>
          </div>
          <button type="submit" className="w-full bg-[var(--accent-color)] text-[var(--accent-text)] font-bold py-2.5 px-4 rounded-lg hover:opacity-90 transition-all shadow-md">
            投稿する
          </button>
        </form>
      </main>
    </div>
  );
}
