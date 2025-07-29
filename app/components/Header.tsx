'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') || 'system';
    }
    return 'system';
  });

  useEffect(() => {
    const applyTheme = (t: 'light' | 'dark' | 'system') => {
      const root = document.documentElement;
      if (t === 'dark' || (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };
    applyTheme(theme);
    localStorage.setItem('theme', theme);
    const listener = () => {
      if (localStorage.getItem('theme') === 'system') applyTheme('system');
    };
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', listener);
    return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', listener);
  }, [theme]);

  return (
    <>
      <header className="bg-[var(--header-bg)] text-[var(--header-text)] p-4 flex items-center justify-between shadow-md sticky top-0 z-20">
        <Link href="/" className="flex items-center flex-grow">
          <i className="fas fa-home text-2xl mr-3"></i>
          <h1 className="text-xl font-bold tracking-wider">大学空き教室検索</h1>
        </Link>
        <button onClick={() => setIsMenuOpen(true)} id="menu-btn" className="text-2xl">
          <i className="fas fa-bars"></i>
        </button>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-30" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsMenuOpen(false)}></div>
          <div className="absolute right-0 top-0 h-full w-72 bg-[var(--bg-secondary)] shadow-xl p-4 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">メニュー</h2>
              <button onClick={() => setIsMenuOpen(false)} className="text-2xl text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                <i className="fas fa-times"></i>
              </button>
            </div>
            <nav className="flex-grow">
              <ul className="space-y-2 text-[var(--text-primary)]">
                <li>
                  <Link href="/howto" onClick={() => setIsMenuOpen(false)} className="flex items-center p-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
                    <i className="fas fa-question-circle w-6 text-center mr-3 text-[var(--text-secondary)]"></i>
                    <span>使い方</span>
                  </Link>
                </li>
                <li>
                  <Link href="/review" onClick={() => setIsMenuOpen(false)} className="flex items-center p-3 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors">
                    <i className="fas fa-comment-dots w-6 text-center mr-3 text-[var(--text-secondary)]"></i>
                    <span>教室レビュー</span>
                  </Link>
                </li>
                <li>
                  <div className="flex items-center p-3">
                    <i className="fas fa-palette w-6 text-center mr-3 text-[var(--text-secondary)]"></i>
                    <span>モード</span>
                  </div>
                  <div className="pl-12 space-y-1">
                     <button onClick={() => { setTheme('light'); setIsMenuOpen(false); }} className={`w-full text-left p-2 rounded-md hover:bg-[var(--bg-tertiary)] ${theme === 'light' ? 'font-bold text-[var(--accent-color)]' : ''}`}>ライト</button>
                     <button onClick={() => { setTheme('dark'); setIsMenuOpen(false); }} className={`w-full text-left p-2 rounded-md hover:bg-[var(--bg-tertiary)] ${theme === 'dark' ? 'font-bold text-[var(--accent-color)]' : ''}`}>ダーク</button>
                     <button onClick={() => { setTheme('system'); setIsMenuOpen(false); }} className={`w-full text-left p-2 rounded-md hover:bg-[var(--bg-tertiary)] ${theme === 'system' ? 'font-bold text-[var(--accent-color)]' : ''}`}>システム</button>
                  </div>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
