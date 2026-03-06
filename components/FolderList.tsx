// components/FolderList.tsx
'use client';

import { useState, useEffect } from 'react';
import cheerio from 'cheerio';

type Props = { initialHtml: string };

export default function FolderList({ initialHtml }: Props) {
  const [htmlPages, setHtmlPages] = useState<string[]>([initialHtml]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [videos, setVideos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const parseFolders = (html: string) => {
    const $ = cheerio.load(html);
    const folders: { name: string; url: string }[] = [];

    $('a[href^="https://cdn.skyli.sbs/f/"]').each((_, el) => {
      const url = $(el).attr('href') || '';
      const name = url.split('/f/')[1]?.trim() || '';
      if (name) folders.push({ name, url });
    });

    return folders;
  };

  const allFolders = htmlPages.flatMap(parseFolders);

  const loadNextPage = async () => {
    setLoading(true);
    const nextPage = currentPage + 1;
    const proxyUrl = `/api/scrape?url=${encodeURIComponent(`https://skyli.ink/folder-list.php?page=${nextPage}`)}`;

    const res = await fetch(proxyUrl);
    if (res.ok) {
      const { html } = await res.json();
      if (html && html.includes('https://cdn.skyli.sbs/f/')) {
        setHtmlPages([...htmlPages, html]);
        setCurrentPage(nextPage);
      }
    }
    setLoading(false);
  };

  const loadVideos = async (folderUrl: string) => {
    setLoading(true);
    setSelectedFolder(folderUrl.split('/f/')[1]);
    setVideos([]);

    const proxyUrl = `/api/scrape?url=${encodeURIComponent(folderUrl)}`;
    const res = await fetch(proxyUrl);

    if (res.ok) {
      const { html } = await res.json();
      const $ = cheerio.load(html);
      const videoLinks: string[] = [];

      $('a[href$=".mp4"], a[href$=".mkv"], a[href$=".webm"]').each((_, el) => {
        let href = $(el).attr('href') || '';
        if (href && !href.startsWith('http')) {
          href = new URL(href, folderUrl).href;
        }
        if (href) videoLinks.push(href);
      });

      setVideos(videoLinks);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {allFolders.map((f) => (
          <button
            key={f.name}
            onClick={() => loadVideos(f.url)}
            className="p-6 rounded-xl bg-gradient-to-br from-purple-900 to-pink-900 hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg text-center font-semibold text-white"
          >
            {f.name.replace(/-/g, ' ').toUpperCase()}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-2xl animate-bounce">Peeling back the layers... 💦</p>}

      {videos.length > 0 && (
        <div className="mt-16">
          <h2 className="text-4xl font-bold mb-8 text-center text-pink-400">
            Videos in {selectedFolder} – Come get wet 🔥
          </h2>
          <ul className="space-y-4">
            {videos.map((v, i) => (
              <li key={i}>
                <a
                  href={v}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition flex justify-between items-center"
                >
                  <span>Video {i + 1}</span>
                  <span className="text-pink-400">▶ Play</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-center mt-12">
        <button
          onClick={loadNextPage}
          disabled={loading}
          className="px-10 py-5 bg-pink-600 hover:bg-pink-500 rounded-full text-xl font-bold disabled:opacity-50 transition"
        >
          Load More Folders… deeper 😏
        </button>
      </div>
    </div>
  );
}
