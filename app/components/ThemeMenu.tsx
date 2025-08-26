import React from 'react';

interface ThemeMenuProps {
  current: 'light' | 'dark' | 'system';
  onChange: (theme: 'light' | 'dark' | 'system') => void;
}

const ThemeMenu: React.FC<ThemeMenuProps> = ({ current, onChange }) => (
  <div className="mt-2 pl-8 space-y-2">
    <button data-theme="light" className={`theme-btn w-full text-left p-1 rounded-md hover:bg-[#44403c]${current==='light'?' font-bold':''}`} onClick={() => onChange('light')}>ライト</button>
    <button data-theme="dark" className={`theme-btn w-full text-left p-1 rounded-md hover:bg-[#44403c]${current==='dark'?' font-bold':''}`} onClick={() => onChange('dark')}>ダーク</button>
    <button data-theme="system" className={`theme-btn w-full text-left p-1 rounded-md hover:bg-[#44403c]${current==='system'?' font-bold':''}`} onClick={() => onChange('system')}>システム</button>
  </div>
);

export default ThemeMenu; 