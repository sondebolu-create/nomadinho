import { setTracks, thumb, TRACKS, type Track } from "./content";
import { buildCatalogue } from "./catalogue";

export const HERO_COVERS = 7;

/** Live catalogue → bundled snapshot → placeholders. Never rejects, never blocks longer than the fetch timeout. */
export async function loadCatalogue(): Promise<void> {
  try {
    setTracks(await buildCatalogue(20));
    return;
  } catch { /* fall through to the snapshot */ }
  try {
    const res = await fetch("/data/releases.json");
    setTracks((await res.json()) as Track[]);
  } catch { /* placeholders stay */ }
}

/** Resolves once the covers the first screens need have been fetched. */
export const preloadCovers = (count = HERO_COVERS + 3) =>
  Promise.all(TRACKS.slice(0, count).map((t) => new Promise((r) => { const i = new Image(); i.onload = i.onerror = r; i.src = thumb(t.cover); })));
