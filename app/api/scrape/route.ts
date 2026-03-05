// app/api/scrape/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing ?url=...' }, { status: 400 });
  }

  const apiKey = process.env.SCRAPERAPI_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'ScraperAPI key missing' }, { status: 500 });
  }

  const scraperUrl = `http://api.scraperapi.com?api_key=\( {apiKey}&url= \){encodeURIComponent(targetUrl)}`;

  try {
    const res = await fetch(scraperUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; RuangHitamBot/1.0)' },
    });

    if (!res.ok) throw new Error(`Scraper failed: ${res.status}`);

    const html = await res.text();
    return NextResponse.json({ html });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to scrape' }, { status: 500 });
  }
    }
