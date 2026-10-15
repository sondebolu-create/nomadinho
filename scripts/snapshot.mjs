// Refreshes public/data/releases.json from the iTunes Search API. Run: npm run snapshot
import { writeFileSync } from "node:fs";
import { buildCatalogue } from "../src/catalogue.ts";

const tracks = await buildCatalogue(20, async (url) => (await fetch(url)).json());
writeFileSync(new URL("../public/data/releases.json", import.meta.url), JSON.stringify(tracks, null, 1));
console.log(`wrote ${tracks.length} releases, latest first:`);
for (const t of tracks) console.log(t.date, t.type.padEnd(6), t.title, "|", t.artist, t.src ? "(preview)" : "");
