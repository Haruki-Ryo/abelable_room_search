import type { Metadata } from 'next';
import { Kosugi } from 'next/font/google';
import './globals.css';
import Header from './components/Header';

const kosugi = Kosugi({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: '大学空き教室検索',
  description: '大学の空き教室を検索できるアプリケーションです。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className="system">
            <body className={`${kosugi.className} bg-[var(--bg-secondary)]`}>
        <link 
          rel="stylesheet" 
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" 
          integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" 
          crossOrigin="anonymous" 
          referrerPolicy="no-referrer" 
        />
        <Header />
        <div className="container mx-auto max-w-lg bg-[var(--bg-primary)] min-h-screen shadow-xl">
          {children}
        </div>
      </body>
    </html>
  );
}
