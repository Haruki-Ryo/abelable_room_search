import Link from 'next/link';

export default function HowToUsePage() {
  return (
    <div className="container mx-auto max-w-lg bg-[var(--bg-primary)] min-h-screen shadow-xl">
      <header className="bg-[var(--header-bg)] text-[var(--header-text)] p-4 flex items-center shadow-md sticky top-0 z-20">
        <Link href="/" className="text-2xl mr-3"><i className="fas fa-arrow-left"></i></Link>
        <h1 className="text-xl font-bold tracking-wider">使い方</h1>
      </header>
      <main className="p-4 text-[var(--text-primary)]">
        <div className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold mb-2 border-b-2 border-[var(--accent-color)] pb-1">1. 検索条件の指定</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              トップページで大学、建物、曜日、時間を指定して、空いている教室を検索できます。現在地から最寄りの大学を自動で設定することも可能です。
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2 border-b-2 border-[var(--accent-color)] pb-1">2. 検索結果の確認</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              条件に合う空き教室が一覧で表示されます。教室名、建物の場所、設備などの詳細情報を確認できます。
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2 border-b-2 border-[var(--accent-color)] pb-1">3. レビューの投稿と閲覧</h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              各教室のレビューを投稿したり、他の人のレビューを閲覧したりできます。コンセントの数やWi-Fiの速度など、リアルな情報を共有しましょう。
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold mb-2 border-b-2 border-[var(--accent-color)] pb-1">注意事項</h2>
            <ul className="list-disc list-inside text-sm text-[var(--text-secondary)] space-y-1">
              <li>本サービスの情報は、大学の公式情報ではありません。必ずしも正確・最新ではない可能性があります。</li>
              <li>情報の正確性については、ユーザーの皆様のレビューによって向上します。ご協力をお願いいたします。</li>
              <li>本サービスを利用したことによるいかなる損害も、開発者は一切の責任を負いません。</li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
