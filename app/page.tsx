// app/page.tsx
import { Suspense } from 'react';
import FolderList from '@/components/FolderList';

async function getFolders(page = 1) {
  const proxyUrl = '\( {process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/scrape?url= \){encodeURIComponent('https://skyli.ink/folder-list.php?page=${page}')}';

  const res = await fetch(proxyUrl, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch folder page');

  const { html } = await res.json();
  return html;
}

export default async function Home() {
  const initialHtml = await getFolders(1);

  return (
    <div className="min-h-screen bg-black text-pink-300 p-8">
      <h1 className="text-5xl font-bold mb-12 text-center animate-pulse">
        Ruang Hitam – Dive Deep, Baby 😈
      </h1>

      <Suspense fallback={<p className="text-center text-xl">Undressing folders...</p>}>
        <FolderList initialHtml={initialHtml} />
      </Suspense>
    </div>
  );
}
