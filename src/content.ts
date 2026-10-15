const photo = (n: number) => `/assets/photos/photo-${String(n).padStart(2, "0")}.webp`;
const cover = (n: number) => `/assets/covers/cover-${String(n).padStart(2, "0")}.jpg`;

// Loader splash, in the order of the Figma frame "01 Loader — 1440" (photo 1…10, clockwise from the top).
// x/y are the card centre offsets from the screen centre in the 1440×900 frame; rot in degrees.
export const LOADER_PHOTOS = [
  { src: photo(10), x: -68, y: -323, rot: 9 },
  { src: photo(9), x: 323, y: -278, rot: -7 },
  { src: photo(6), x: 390, y: -198, rot: 4 },
  { src: photo(5), x: 413, y: -51, rot: -12 },
  { src: photo(1), x: 281, y: 45, rot: 11 },
  { src: photo(2), x: -17, y: 88, rot: -5 },
  { src: photo(3), x: -312, y: 43, rot: 7 },
  { src: photo(4), x: -377, y: -48, rot: -10 },
  { src: photo(8), x: -409, y: -191, rot: 3 },
  { src: photo(7), x: -260, y: -298, rot: -8 },
];
export const PHOTOS = LOADER_PHOTOS.map((p) => p.src);

/** Apple's artwork CDN resizes on request: small sizes for thumbnails, 600px for the gallery. */
export const thumb = (url: string) => url.replace("600x600bb", "240x240bb");

export type Track = { title: string; artist: string; type: string; cover: string; bpm: number; key: string; src: string; date?: string; link?: string };

// Last-resort placeholders, only used if both the live API and the bundled snapshot fail.
const PLACEHOLDER_TRACKS: Track[] = [
  { title: "Ikebe 3000", artist: "Blaqbonez & Asake", type: "Single", cover: cover(1), bpm: 110, key: "F#m", src: "" },
  { title: "Big Performer", artist: "Blaqbonez", type: "Single", cover: cover(2), bpm: 104, key: "Am", src: "" },
  { title: "Bling", artist: "Blaqbonez, Amaarae & Buju", type: "Single", cover: cover(3), bpm: 100, key: "Dm", src: "" },
  { title: "Back in Uni", artist: "Blaqbonez", type: "Single", cover: cover(4), bpm: 96, key: "Gm", src: "" },
  { title: "Haaa", artist: "Blaqbonez", type: "Single", cover: cover(5), bpm: 108, key: "Cm", src: "" },
  { title: "Sex Over Love", artist: "Blaqbonez", type: "Album", cover: cover(6), bpm: 102, key: "Em", src: "" },
  { title: "Young Preacher", artist: "Blaqbonez", type: "Album", cover: cover(7), bpm: 98, key: "Bm", src: "" },
];

// Deck order and gallery numbering, latest release first. Filled in place by setTracks() at boot
// (live iTunes catalogue → /data/releases.json snapshot → placeholders above).
export const TRACKS: Track[] = [...PLACEHOLDER_TRACKS];
export const setTracks = (list: Track[]) => { if (list.length) TRACKS.splice(0, TRACKS.length, ...list); };

export type Stat = { source: string; prefix: string; number: number; suffix: string; sentence: string };
// Display order after the countdown card: left column [countdown, STATS[0]], right column [STATS[1], STATS[2]].
export const STATS: Stat[] = [
  { source: "Spotify NG Daily", prefix: "#", number: 2, suffix: "", sentence: "“Big Performer” rises to a new peak of #2 on Spotify Nigeria Daily Top Songs with 217,355 streams." },
  { source: "Spotify NG Daily", prefix: "", number: 4, suffix: " days", sentence: "“Ikebe 3000” spends its 4th consecutive day at #1 on the Spotify Nigeria Daily Top Songs Chart." },
  { source: "Apple Music NG", prefix: "#", number: 1, suffix: "", sentence: "Blaqbonez & Asake’s “Ikebe 3000” is the No.1 song on the Apple Music Nigeria Top Songs chart." },
];

// Countdown card (first slot, top left). `at` is midnight Lagos time (WAT, UTC+1) as tonight turns into 16 Oct.
export const DROP = {
  source: "Nomadinho: 4th Prime",
  at: "2026-10-16T00:00:00+01:00",
  before: "The new album drops tonight at midnight, Lagos time.",
  after: "Out now. Nomadinho: 4th Prime is live everywhere.",
};

export const LABELS = { left: { title: "Chocolate City", sub: "Label" }, right: { title: "4th Prime", sub: "Era" } };

// Footer links. Hrefs are placeholders until confirmed (see Open questions in the design doc).
export const FOOTER = {
  columns: [
    { title: "Listen", links: [{ label: "Spotify", href: "#" }, { label: "Apple Music", href: "#" }, { label: "Audiomack", href: "#" }] },
    { title: "Follow", links: [{ label: "Instagram", href: "#" }, { label: "X", href: "#" }, { label: "TikTok", href: "#" }] },
    { title: "Bookings", links: [{ label: "bookings@example.com", href: "mailto:bookings@example.com" }] },
    { title: "Label", links: [{ label: "Chocolate City", href: "#" }] },
  ],
  base: { left: "© Blaqbonez", centre: "Nomadinho · 4th Prime", right: "Back to top ↑" },
};
