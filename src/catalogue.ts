// Blaqbonez catalogue from the free iTunes Search API (no key, CORS open).
// Erasable TypeScript only, so scripts/snapshot.mjs can run it directly under Node.
import type { Track } from "./content";

export const ARTIST_ID = 1033968464;
const LOOKUP = "https://itunes.apple.com/lookup";

type Item = Record<string, any>;
export type Fetcher = (url: string) => Promise<{ results: Item[] }>;

export const fetchJson: Fetcher = async (url) => {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4500);
  try {
    const res = await fetch(url, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`iTunes ${res.status}`);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
};

// Apple stylises some titles in capitals ("IKEBE 3000"); sentence-case those, leave mixed case alone.
const tidy = (s: string) => {
  const letters = s.replace(/[^a-z]/gi, "");
  if (letters.length < 4 || letters !== letters.toUpperCase()) return s;
  return s.toLowerCase().replace(/(^|[\s(\[:-])([a-z])/g, (_, p, c) => p + c.toUpperCase());
};

// Releases left off the site on purpose (matched ignoring case, spaces and punctuation).
export const EXCLUDED_TITLES = ["100", "2 sl1ck", "Lifestyle", "Don't II", "Tattoo"];
const squash = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "");
const EXCLUDED = new Set(EXCLUDED_TITLES.map(squash));

const FEAT = /\s*[(\[](?:feat\.?|ft\.?|with)\s+([^)\]]+)[)\]]/i;
const hash = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const KEYS = ["Am", "Dm", "Gm", "Cm", "Em", "Bm", "F#m"];

export async function buildCatalogue(limit = 20, get: Fetcher = fetchJson): Promise<Track[]> {
  const [albums, songs] = await Promise.all([
    get(`${LOOKUP}?id=${ARTIST_ID}&entity=album&limit=200&sort=recent`),
    get(`${LOOKUP}?id=${ARTIST_ID}&entity=song&limit=200&sort=recent`),
  ]);

  // First (lowest track number) song with a preview per release.
  const preview = new Map<number, Item>();
  for (const s of songs.results) {
    if (s.wrapperType !== "track" || !s.previewUrl) continue;
    const cur = preview.get(s.collectionId);
    if (!cur || s.trackNumber < cur.trackNumber) preview.set(s.collectionId, s);
  }

  const seen = new Set<string>();
  const out: Track[] = [];
  const releases = albums.results
    .filter((r) => r.wrapperType === "collection" && /blaqbonez/i.test(r.artistName) && !/\b(dj mix|mixed)\b/i.test(r.collectionName))
    .sort((a, b) => b.releaseDate.localeCompare(a.releaseDate)); // latest first

  for (const r of releases) {
    const single = /\s-\s(single)$/i.test(r.collectionName);
    const ep = /\s-\s(ep)$/i.test(r.collectionName);
    let title = r.collectionName.replace(/\s-\s(single|ep)$/i, "");
    let artist: string = r.artistName;
    const feat = title.match(FEAT);
    if (feat) { title = title.replace(FEAT, ""); artist = `${artist} ft. ${feat[1].trim()}`; }
    title = tidy(title.trim());

    if (EXCLUDED.has(squash(title))) continue;

    const key = title.toLowerCase().replace(/\b(deluxe|edition|remix|version)\b/g, "").replace(/[^a-z0-9]+/g, " ").trim();
    if (seen.has(key)) continue; // newest version of a release wins
    seen.add(key);

    const song = preview.get(r.collectionId);
    out.push({
      title,
      artist,
      type: single ? "Single" : ep ? "EP" : "Album",
      cover: String(r.artworkUrl100).replace("100x100bb.jpg", "600x600bb.webp"),
      bpm: 96 + (hash(title) % 15),
      key: KEYS[hash(title) % KEYS.length],
      src: song?.previewUrl ?? "",
      date: String(r.releaseDate).slice(0, 10),
      link: r.collectionViewUrl,
    });
    if (out.length >= limit) break;
  }
  return out;
}
