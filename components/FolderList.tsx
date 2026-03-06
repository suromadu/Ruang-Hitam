'use client';

import { useState } from 'react';
import { load } from 'cheerio'; // Kita tetep pakai cheerio untuk fallback, tapi utama regex

type Folder = { name: string; displayName: string; url: string };

type Props = { initialHtml: string };

export default function FolderList({ initialHtml }: Props) {
  const [htmlPages, setHtmlPages] = useState<string[]>([initialHtml]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [videos, setVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const parseFolders = (html: string): Folder[] => {
    const folders: Folder[] = [];

    // Regex tangkap pola Markdown: [N. Nama 👁️ angka](https://cdn.skyli.sbs/f/slug)
    const regex = /\[(\d+\.)\s*(.+?)\s*👁️\s*\d+\]\((https:\/\/cdn\.skyli\.sbs\/f\/[^)]+)\)/g;
    let match;

    while ((match = regex.exec(html)) !== null) {
      const rawDisplay = match[2].trim(); // e.g. "Mandona" atau "Cewe Cantik Viral"
      const url = match[3];
      const slug = url.split('/f/')[1]?.trim() || '';

      if (slug) {
        folders.push({
          name: slug,           // untuk key & selectedFolder
          displayName: rawDisplay, // tampilan cantik di button
          url,
        });
      }
    }

    return folders;
  };

  const allFolders = htmlPages.flatMap(parseFolders);

  const loadNextPage = async () => {
    setLoading(true);
    const nextPage = currentPage + 1;
    const proxyUrl = `/api/scrape?url=\( {encodeURIComponent(`https://skyli.ink/folder-list.php?page= \){nextPage}`)}`;

    try {
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const { html } = await res.json();
        // Cek kalau halaman punya konten folder (ada link cdn)
        if (html && html.includes('cdn.skyli.sbs/f/')) {
          setHtmlPages((prev) => [...prev, html]);
          setCurrentPage(nextPage);
        }
      }
    } catch (err) {
      console.error('Gagal load page berikutnya:', err);
    }
    setLoading(false);
  };

  const loadVideos = async (folderUrl: string) => {
    setLoading(true);
    const folderSlug = folderUrl.split('/f/')[1];
    setSelectedFolder(folderSlug || 'Misterius');
    setVideos([]);

    const proxyUrl = `/api/scrape?url=${encodeURIComponent(folderUrl)}`;

    try {
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const { html } = await res.json();

        // Folder page (cdn.skyli.sbs/f/xxx) kemungkinan HTML directory listing
        const $ = load(html);
        const videoLinks: string[] = [];

        // Cari semua <a> yang berakhir .mp4 / .mkv / .webm dll
        \( ('a[href \)=".mp4"], a[href\( =".mkv"], a[href \)=".webm"], a[href$=".mov"]').each((_, el) => {
          let href = $(el).attr('href') || '';
          if (href) {
            // Kalau relative → jadikan absolute
            if (!href.startsWith('http')) {
              href = new URL(href, folderUrl).href;
            }
            videoLinks.push(href);
          }
        });

        // Kalau gak nemu <a>, mungkin text list — fallback regex sederhana
        if (videoLinks.length === 0) {
          const fileRegex = /(https?:\/\/[^\s]+\.(mp4|mkv|webm|mov))/gi;
          let fileMatch;
          while ((fileMatch = fileRegex.exec(html)) !== null) {
            videoLinks.push(fileMatch[0]);
          }
        }

        setVideos(videoLinks);
      }
    } catch (err) {
      console.error('Gagal load video:', err);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
        {allFolders.map((f) => (
          <button
            key={f.name}
            onClick={() => loadVideos(f.url)}
            className={`p-6 rounded-2xl bg-gradient-to-br from-purple-950 to-pink-950 hover:from-purple-800 hover:to-pink-800 
              transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg text-center font-bold text-pink-200 uppercase tracking-wider
              border border-pink-900/50 hover:border-pink-500/70 ${selectedFolder === f.name ? 'ring-4 ring-pink-500 scale-105' : ''}`}
          >
            {f.displayName}
          </button>
        ))}
      </div>

      {loading && (
        <p className="text-center text-3xl font-semibold text-pink-400 animate-bounce">
          Membuka lipatan gelap... 💦 tunggu ya sayang
        </p>
      )}

      {videos.length > 0 && (
        <div className="mt-16 bg-black/60 backdrop-blur-md p-8 rounded-2xl border border-pink-900/40 shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-10 text-center bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
            Video panas di {selectedFolder} 🔥 siap basah?
          </h2>
          <ul className="space-y-5">
            {videos.map((v, i) => (
              <li key={i}>
                <a
                  href={v}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-950 to-black rounded-xl hover:from-pink-950 hover:to-purple-950 
                    transition-all duration-300 border border-pink-800/30 hover:border-pink-500 group"
                >
                  <span className="text-pink-300 font-medium group-hover:text-pink-200">
                    Video {i + 1} – Klik & nikmati
                  </span>
                  <span className="text-2xl text-pink-500 group-hover:text-pink-300">▶</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center mt-16">
        <button
          onClick={loadNextPage}
          disabled={loading || currentPage >= 8} // max page dari observasi
          className="px-12 py-6 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 
            rounded-full text-2xl font-bold text-white shadow-xl transform hover:scale-110 transition-all duration-300 disabled:opacity-40 disabled:scale-100"
        >
          {loading ? 'Sedang membuka...' : 'Lebih dalam lagi... 😏'}
        </button>
      </div>
    </div>
  );
      }
