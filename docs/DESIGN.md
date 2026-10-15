# Nomadinho — Design Documentation

Oct 15, 2026 · @The Genius

## Overview

Nomadinho is a one-page, dark-mode landing site for Blaqbonez that feels like an interactive object, not a brochure. A visitor should play with it before they read it: the head follows their cursor, the record spins, the covers move when they scroll.

**Page flow:** Loader → Hero (stats, 3D head, cover row, turntable) → Gallery (cover row grows into a horizontal gallery) → Footer. A mini player follows the visitor once the turntable scrolls away.

&#91;embedded content: page choreography · 4 stages, 2 gallery phases\]

The gallery is the signature moment: the pin holds the screen while the row grows, then the covers travel right before the footer arrives.

**Audience:** fans, press and bookers. Mobile and desktop are designed as equals.

**References**

| Reference | What we take from it | What we don't |
| --- | --- | --- |
| [yutaabe.com](https://yutaabe.com/) | Overall taste: monochrome dark base, small uppercase mono UI, live local clock, a playful 3D object that reacts to the cursor, a SHIFT key easter egg, tight motion | Its content and characters |
| [kaviengcreative.com](https://www.kaviengcreative.com/) | The cover gallery: big image tiles, scroll-driven horizontal travel, hover that dims the rest | Its layout grid for the rest of the page |
| [CL Antique No.15](https://centurylibrary.com/shop/fonts/victorian-decorative-font-flourished-ornamental-letters-with-mixed-styles-cl-antique-no-15/) | The NOMADINHO wordmark: Victorian, flourished, mixed letter styles | Body text |
| Figma file NOMADINHO | Layout sketches for the hero and loader, all photos and covers | — |

A working prototype exists (`index.html` in the nomadinho folder). Treat it as the reference build: this doc explains why it looks and moves the way it does so it can be rebuilt properly.

## Using this doc with Claude Code

Give Claude Code this doc plus the Figma file, then build one section at a time and check each against its spec before moving on.

1. Export this doc as Markdown and save it in the repo as `docs/DESIGN.md`.
2. Add the snippet below to `CLAUDE.md` at the repo root so every session starts from the same rules.
3. Connect the Figma MCP so Claude Code can read the frames on the **Hi-fi screens** page directly.
4. Build in the order of the build plan (last section). After each step, run the page and compare it with the Figma frame and the acceptance checklist.

```markdown
# CLAUDE.md — Nomadinho

Read docs/DESIGN.md before any UI work. It is the source of truth for tokens, motion and layout.

Rules
- Dark first. Colours only from the tokens in DESIGN.md (CSS custom properties on :root).
- Type: NOMADINHO wordmark in CL Antique No.15 (fallback: mixed ornamental faces). UI labels in Space Mono 11px uppercase. Everything else Inter Tight.
- Motion: GSAP + ScrollTrigger + Lenis. Use the named easings and durations; never default ease.
- Every interaction needs a hover, active and reduced-motion state.
- Images come from /assets with the names in DESIGN.md; never hotlink.
- No component libraries, no Tailwind UI kits. Hand-built, small files.
- Check work in a browser at 1440x900 and 390x844 before saying a section is done.
```

Prompt pattern that works: *"Build the \[section\] exactly as specified in DESIGN.md §\[n\]. Match the Figma frame \[name\]. List anything in the spec you could not do."*

## Taste rules

The site feels premium because almost everything is quiet and three things are loud: the wordmark, the head and the record. Protect that contrast.

1. **One loud element per viewport.** Hero: the head. Gallery: the covers. Footer: the marquee. Everything else is small mono text and thin lines.
2. **Bone on near-black, one hot accent.** The accent (#FF4D1A) marks only what is live or active: playing, on deck, hovered, the number in a stat.
3. **Hairlines, not boxes.** Structure comes from 1px rules at 14% opacity. Cards are outlines with a faint blur, never filled panels with shadows.
4. **Small UI, big type.** UI labels are 11px uppercase mono. Display type is 8–17vw. Nothing lives in between except stat numbers and track titles.
5. **Everything responds.** Every hover does something physical: lift, scramble, dim the rest, grow the cursor. Nothing just changes colour.
6. **Motion has weight.** Things arrive fast and settle slowly (expo.out). Things leave by accelerating away (expo.in). Nothing bounces.
7. **Real objects behave like real objects.** The record spins up and slows down with inertia; the tonearm moves with progress; the head eases toward the cursor, never snaps.
8. **Texture over gradients.** Film grain over the whole page and scanlines on the head. No glossy gradients or glow except the accent LED.

| Do | Don't |
| --- | --- |
| Let photos be the only colour on the page | Add brand colours beyond the accent |
| Use the live Lagos clock and small metadata as decoration | Add icons for decoration |
| Keep copy short and factual (chart stats) | Write marketing paragraphs |
| Reveal on load and scroll with staggered expo.out | Fade things in with linear opacity |
| Give touch users an equivalent (drag to look) | Hide content behind hover only |

## Design tokens

All tokens are CSS custom properties on `:root`. Lights-out mode (SHIFT) swaps the colour tokens only; nothing else changes.

### Colour

| Token | Dark (default) | Lights-out | Use |
| --- | --- | --- | --- |
| `--bg` | #0A0A09 | #ECE6DA | Page background |
| `--bg-2` | #121210 | #DCD5C7 | Image placeholders, turntable plinth |
| `--ink` | #ECE6DA | #0A0A09 | Primary text, play button fill |
| `--ink-2` | #A39D91 | #4A463F | Body copy, secondary labels |
| `--ink-3` | #5D5951 | #7D776C | Meta labels, inactive waveform |
| `--line` | rgba(236,230,218,.14) | rgba(10,10,9,.16) | Hairlines, card borders |
| `--accent` | #FF4D1A | #FF4D1A | Live / active state only |

### Typography

| Role | Family | Size | Weight / case | Notes |
| --- | --- | --- | --- | --- |
| Wordmark (hero) | CL Antique No.15 | clamp(52px, 8.4vw, 148px) | Regular, caps | Line-height .86 |
| Wordmark (loader) | CL Antique No.15 | clamp(48px, 9vw, 132px) | Regular, caps |  |
| Wordmark (footer marquee) | CL Antique No.15 | clamp(80px, 17vw, 280px) | Regular, caps |  |
| Section title | Inter Tight | clamp(28px, 4vw, 64px) | 700, sentence | Tracking −0.04em, line-height .9 |
| Stat number | Inter Tight | clamp(30px, 2.8vw, 44px) | 700 | Tabular figures, tracking −0.03em |
| Track title | Inter Tight | clamp(22px, 2.4vw, 36px) | 700 | Tracking −0.02em |
| Body | Inter Tight | 13–15px | 400 / 500 | Line-height 1.35 |
| UI label | Space Mono | 11px | 400, UPPERCASE | Tracking .06em |

**Wordmark fallback:** until the CL Antique No.15 OTF is licensed, each letter of NOMADINHO is set in a different free ornamental face (Rye, Pirata One, UnifrakturMaguntia, Sancreek, Almendra Display, Grenze Gotisch, Germania One, Metamorphous, Fruktur), and one random letter swaps face every 900ms. When the OTF loads, all letters switch to it and the cycling stops.

### Space, grid and shape

- Gutter: `clamp(16px, 2.2vw, 32px)` on page edges and between columns.
- Hero grid (desktop): 3 columns `minmax(220px,1fr) 2.1fr minmax(220px,1fr)`; rows: top bar, centre, cover row, deck.
- Spacing steps: 4, 8, 12, 16, 24, 32.
- Radius: 0 for images and cards, 2px loader photos, 6px turntable, 50% for controls, 999px mini player.
- Lines: 1px `--line`. Accent underline on hover: 2px.

### Motion

| Token | Value | Use |
| --- | --- | --- |
| `ease-enter` | expo.out | Anything arriving or settling |
| `ease-exit` | expo.in | Anything leaving the screen |
| `ease-ui` | cubic-bezier(.2,.8,.2,1) | CSS hovers and transitions |
| `ease-swap` | expo.inOut | Loader curtain, mode changes |
| Fast | 0.25–0.35s | Hover colour, cursor size |
| Base | 0.6s | Hover lifts, underlines, mini player |
| Slow | 1–1.3s | Reveals, photo splash |
| Stagger | 0.04–0.09s | Groups of items |

## Tech stack and structure

Build it as a Vite + vanilla TypeScript site (or Astro, which yutaabe uses) with four libraries; no UI framework is needed for one page.

| Library | Version used in prototype | Job |
| --- | --- | --- |
| three | r128 | 3D head: displaced photo mesh, particle mode |
| gsap + ScrollTrigger | 3.12.5 | Loader timeline, reveals, pinned gallery |
| lenis | 1.1.13 | Smooth scroll, synced to ScrollTrigger |
| Web Audio API | built in | Placeholder beat engine, real audio playback |

Suggested file structure:

```
src/
  main.ts            boot: fonts, assets, loader, then init modules
  tokens.css         all custom properties (see Design tokens)
  base.css           reset, grain, cursor, type classes
  content.ts         TRACKS, STATS, asset paths (the only file editors touch)
  loader.ts          progress tracking + photo splash + exit timeline
  cursor.ts          dot + ring + label states
  head/
    head.ts          three.js scene, cursor tracking, lights-out
    head.vert        displacement shader
    head.frag        duotone + spotlight + scanlines
    points.frag      particle mode
  player/
    player.ts        state: index, playing, position, volume, events
    engine.ts        placeholder beat scheduler (Web Audio)
    deck.ts          turntable, waveform, controls, mini player
  gallery.ts         pinned horizontal gallery
  scroll.ts          Lenis + ScrollTrigger setup, hero parallax
  wordmark.ts        NOMADINHO letter splitting + font cycling
public/assets/
  photos/photo-01.jpg … photo-10.jpg
  covers/cover-01.jpg … cover-07.jpg
  head.png           cut-out portrait, transparent background
  fonts/CLAntiqueNo15.otf
  audio/             one file per track when available
```

**Asset pipeline:** export images from the Figma file at 2x, convert to WebP/AVIF with a JPG fallback, cap covers at 1200px and photos at 1600px on the long edge. The head needs a background-removed PNG around 1500px tall. The 3D head must be served over http, not opened as a local file, because WebGL refuses local-file textures.

## Screen specs

Seven screens make up the site; each has a matching frame on the **Hi-fi screens** page of the Figma file.

| Figma frame | Covers |
| --- | --- |
| 01 Loader — 1440 | Loader mid-splash at 67% |
| 02 Hero — 1440 | Hero, turntable, cover row |
| 03a Gallery — grow phase | Row at scale 0.32, tiles tilted ±6° |
| 03b Gallery — travel + hover | Mid-travel, hover dimming, PLAY cursor, On deck tag, mini player |
| 04 Footer — 1440 | Marquee, links, base row |
| 05 Hero — Lights-out (SHIFT) | Same hero in the Lights-out variable mode, particle head |
| 06a / 06b Mobile | Hero; deck and gallery start at 390×844 |

Components on the same page: Wordmark, Stat card, Control (Prev / Play / Pause / Next) and Gallery tile, all bound to the `Nomadinho` colour variables with Dark and Lights-out modes. Figma uses Inter where the site uses Inter Tight, which isn't installed in Figma.

### 1. Loader

The loader turns waiting into the first show: photos burst out of the centre while a real progress counter runs.

- **Layout:** full-screen `--bg`. NOMADINHO centred about 22vh below the middle. Under it, a 440px-wide (max 72vw) 2px track with the percentage on its right in Space Mono, zero-padded (`007%`). Footer row of meta: Blaqbonez · Loading the experience · live Lagos clock.
- **Photos:** the 10 photos start at scale 0 in the centre and fly to positions around a ring (radius 24–36% of the short side, wider horizontally), each rotated ±13°, staggered 0.09s, 1.3s expo.out. Each one launches when its image loads.
- **Progress:** real loading (photos, covers, head, fonts), with a minimum of 2.6s so the splash plays fully. The bar eases toward the real value; it never jumps backward. Hard cap at minimum + 6s so a slow asset never traps the visitor.
- **Exit:** photos fly up and out (expo.in, stagger .03), the centre fades up, then the loader lifts away with a clip-path curtain (1s expo.inOut) and the hero reveal starts underneath.

### 2. Hero

The hero is a three-column composition around the head, matching the hand sketch in Figma.

- **Header (fixed, blend-mode difference):** BLAQBONEZ wordmark left · Home / Discography / Contact centre · SHIFT hint and Lagos clock right. Nav labels scramble on hover.
- **Top bar:** hairline above. Left: Chocolate City / Label. Centre: NOMADINHO with BLAQBONEZ under it, letter-spaced .3em. Right: 4th Prime / Era.
- **Left column:** stat cards 01 and 02. **Right column:** stat cards 03 and 04. Each card: meta row (source · number), big number counting up on reveal, one sentence with the song title in bold. Hover: lift 3px, border turns accent, 2px accent line wipes in along the bottom.
- **Centre:** the 3D head on a full-bleed canvas behind everything, a thin bone ring around it, and a "Move your cursor" hint at the bottom ("Drag to look around" on touch).
- **Cover row:** 7 square covers, 66px, centred. Hover lifts 8px and tilts −3°. The cover on the deck has an accent border. Click puts that track on the deck and plays.
- **Deck:** see Turntable below.
- **Fit:** the whole hero fits one viewport at 1440×900 and above (`height: max(100svh, 760px)`).

### 3. Turntable (deck player)

The deck is the sketch's "deck player spinning Blaqbonez songs": a small turntable plus large track info and controls.

- **Turntable:** 170px plinth, platter with grooved vinyl, the current cover as the centre label, a tonearm and an LED. Playing: record spins at 33⅓ rpm with spin-up and slow-down inertia, the tonearm swings onto the record and moves inward with progress, the LED glows accent.
- **Info:** "Now on the deck · 01/07", track title, artist · type.
- **Controls:** previous (restarts if more than 3s in), play/pause (66px, bone fill, accent on hover), next. Space toggles play; Alt+←/→ skip.
- **Progress:** 120-bar waveform (seeded per track), played part in accent, bars pulse gently while playing. Click or drag to seek. Volume slider on desktop.
- **Scratch:** drag the record to rotate it by hand; on release it seeks by the distance turned.

### 4. Gallery

On scroll, the hero's cover row grows into a gallery of every song and album cover that travels left to right.

- **Pinned section,** 100svh. Heading "Every cover, every era." top left; a live counter (01–07) top right; a thin progress line at the bottom.
- **Tiles:** square covers at mixed sizes (22–36vw, capped at 52vh), alternating offsets up and down. Caption under each: number · title · type in mono.
- **Choreography:** first 22% of the scroll, the row scales from 0.32 to 1 around the right end and tiles straighten from ±6° rotation. Remaining 78%, the track slides right until the first item reaches the left edge. Tiles skew up to ±4° with scroll velocity.
- **Hover:** hovered cover zooms from 1.08 to 1; all others go grayscale at 50% brightness; cursor shows PLAY. Click plays that track; the playing tile shows an "On deck" tag.

### 5. Mini player

A pill bottom right (spinning cover, title, artist, three controls) slides up when the deck scrolls out of view and hides when it returns.

### 6. Footer

A huge NOMADINHO marquee (26s loop, accent ✺ between repeats), then four link columns (Listen, Follow, Bookings, Label), then a base row: © Blaqbonez · Nomadinho · 4th Prime · Back to top. Links underline from left on hover.

### 7. Lights-out (SHIFT)

Pressing SHIFT flips the palette to bone background with near-black ink, and the head dissolves into glowing particles lit by a flashlight that follows the cursor. Press again to return. The header shows the SHIFT hint so it is discoverable.

### Mobile (≤ 980px)

- One column: top bar, wordmark, stats 01–02 as a horizontal swipe row, head (54vh), stats 03–04 swipe row, cover row (swipe), deck stacked (turntable centred above the info).
- No custom cursor; the head follows touch drag. No side parallax.
- Gallery keeps the pinned horizontal travel; tiles drop the up/down offsets.

## Motion and interaction

Motion carries the taste: every value below is tuned, so copy the numbers rather than approximating them.

### Hero reveal (runs as the loader curtain lifts)

| Order | Element | Animation |
| --- | --- | --- |
| 1 | Top bar items | from y 60, opacity 0 · 1.2s expo.out · stagger .08 |
| 2 | Stat cards | from y 40 · 1s expo.out · stagger .07 · numbers count up over 1.4s power3.out |
| 3 | Cover row | from y 40 · .9s expo.out · stagger .04 |
| 4 | Deck | from y 40 · 1s expo.out |
| 5 | Header | from y −30 · .8s power3.out |
| 6 | Head | shader `uReveal` 0 → 1 over 2.2s expo.out: grows from flat to full depth |

### Scroll

- Lenis with `lerp: 0.09`, driving `ScrollTrigger.update` from the GSAP ticker.
- Hero out (scrubbed): top bar moves up 40% and fades to 0.2; side columns slide out 80px and fade; cover row lifts 30px and fades as it nears the top.
- Gallery pin lasts 1.15 × the track width in scroll distance, `scrub: 1`. Counter and progress line read from the pin's progress.
- Anchor links scroll with Lenis over 1.6s.

### Cursor

- 6px white dot follows exactly; 38px ring follows with 0.18 lerp; both blend-mode difference.
- Links and buttons: ring grows to 64px.
- Elements with `data-cursor` (covers, record, waveform): ring grows to 84px, fills white and shows a label (PLAY, SCRATCH, SEEK).
- Hidden on touch and coarse pointers.

### 3D head

The head is a single photo turned into depth, so it works with any good portrait and can be replaced by a real 3D model later.

- **Geometry:** a 2.4 × 2.4 plane with 220 × 220 segments (mesh) plus a 150 × 150 point cloud using the same shader.
- **Depth:** a radial mask centred on the face (or the PNG's alpha when a cut-out is supplied) × (0.55 + 0.45 × pixel brightness), pushed along z by `uDepth` 0.9. A faint sine ripple runs down the face.
- **Look:** duotone from near-black to bone, mixed 35% with the original colour, scanlines, animated grain, and a soft spotlight that tracks the cursor with a hint of accent at its centre. Edges fade to transparent.
- **Tracking:** rotation y = cursor x × 0.55, rotation x = cursor y × 0.32, eased at 0.06 per frame, plus a slow idle drift. The ring pulses with the beat while music plays.
- **Lights-out:** mesh fades out, points fade in with additive blending, brightest under the cursor.
- Rendering pauses when the hero is off screen.

### Audio

- Tracks with a `src` play through an audio element.
- Tracks without one play a generated placeholder: an afrobeats-style 16-step pattern (kick, shaker, clap, log drum, chord stabs) at the track's BPM and key, 96 seconds long, scheduled 120ms ahead with Web Audio. It exists so the deck is fully testable before real audio is licensed.
- Audio never autoplays; the first press of play starts it.

## Content model

All editable content lives in one file (`content.ts`) so copy and assets change without touching layout code.

**Tracks** — order here is the deck order and the gallery numbering. Cover pairings are placeholders until checked against the real artwork.

| # | Title | Artist | Type | Cover file | BPM (placeholder beat) |
| --- | --- | --- | --- | --- | --- |
| 01 | Ikebe 3000 | Blaqbonez & Asake | Single | cover-01 | 110 |
| 02 | Big Performer | Blaqbonez | Single | cover-02 | 104 |
| 03 | Bling | Blaqbonez, Amaarae & Buju | Single | cover-03 | 100 |
| 04 | Back in Uni | Blaqbonez | Single | cover-04 | 96 |
| 05 | Haaa | Blaqbonez | Single | cover-05 | 108 |
| 06 | Sex Over Love | Blaqbonez | Album | cover-06 | 102 |
| 07 | Young Preacher | Blaqbonez | Album | cover-07 | 98 |

Each track object: `{ title, artist, type, cover, bpm, key, src }`. Leave `src` empty to use the placeholder beat.

**Stats** — copy taken from the notes in the Figma file.

| # | Source | Number | Sentence |
| --- | --- | --- | --- |
| 01 | Apple Music NG | #1 | Blaqbonez & Asake's "Ikebe 3000" is the No.1 song on the Apple Music Nigeria Top Songs chart. |
| 02 | Spotify NG Daily | #2 | "Big Performer" rises to a new peak of #2 on Spotify Nigeria Daily Top Songs with 217,355 streams. |
| 03 | Spotify NG Daily | 4 days | "Ikebe 3000" spends its 4th consecutive day at #1 on the Spotify Nigeria Daily Top Songs Chart. |
| 04 | First-day streams | 2M | Most trending. Records 2M first-day streams. |

**Labels:** Chocolate City (label) and 4th Prime (era) in the top bar; both read from the hand sketch.

**Assets**

| File | Source in Figma | Count |
| --- | --- | --- |
| `photos/photo-01…10.jpg` | Section "bLAQBONEZ pictures" | 10 |
| `covers/cover-01…07.jpg` | "Album covers" row, left to right | 7 |
| `head.png` | A cut-out of one portrait, transparent background | 1 |
| `fonts/CLAntiqueNo15.otf` | Century Library (licence needed) | 1 |

## Accessibility, performance and responsive

The experience must stay usable with motion off, on a mid-range phone, and with a keyboard.

**Accessibility**

- `prefers-reduced-motion`: no grain animation, no marquee, no skew, no font cycling, loader minimum 0.4s, instant transitions. The gallery still scrolls horizontally.
- All controls are real buttons with labels ("Play or pause", "Next", "Play Ikebe 3000"). Visible focus rings in accent.
- NOMADINHO has `aria-label="Nomadinho"` because the split letters read badly.
- Body text meets 4.5:1 on `--bg` (`--ink-2` passes; `--ink-3` is for meta labels only, never sentences).
- Space plays and pauses unless focus is in a text field.

**Performance budgets**

| Item | Target |
| --- | --- |
| JavaScript (gzipped, excluding three) | under 60 KB |
| three.js | import only what is used, or load after the loader starts |
| Largest image | under 250 KB (WebP/AVIF) |
| Head canvas | device pixel ratio capped at 2; paused off screen |
| Frame rate | 60fps on a 2022 mid-range phone in the hero and gallery |

**Breakpoints**

| Width | Changes |
| --- | --- |
| ≥ 1440 | Reference layout; hero fits 900px tall |
| 981–1439 | Same layout, fluid type and columns |
| ≤ 980 | One-column hero, swipe rows for stats and covers, stacked deck, no cursor, no side parallax |
| ≤ 820 | Header nav and SHIFT hint hidden; logo and clock only |

## Build plan and acceptance

Build in this order; each step is a separate Claude Code session that ends with a browser check at 1440×900 and 390×844.

1. Scaffold: Vite, tokens.css, base.css, fonts, grain, header with clock, cursor.
2. Content and assets: content.ts, exported images in place, wordmark with fallback cycling.
3. Hero static layout: top bar, stat cards, cover row, deck layout (no motion yet), mobile layout.
4. Player: state, placeholder engine, real audio support, turntable motion, waveform, controls, keyboard, mini player.
5. 3D head: shader, cursor tracking, reveal, lights-out.
6. Loader: progress, photo splash, exit into the hero reveal.
7. Scroll: Lenis, hero parallax, pinned gallery, footer.
8. Polish: reduced motion, focus states, performance budget, cross-browser (Safari, Chrome, Firefox, iOS, Android).

**Acceptance checklist**

- [ ] Loader shows real progress, never stalls past minimum + 6s, exits into the hero reveal
- [ ] Hero fits one screen at 1440×900 with all four stats, cover row and deck visible
- [ ] Head follows the cursor smoothly and the drag on touch; pauses off screen
- [ ] Play, pause, next, previous, seek, scratch, volume and Space all work; record and tonearm respond
- [ ] Clicking any cover (hero or gallery) plays that track and marks it on deck
- [ ] Gallery grows from the row and travels left to right; counter and progress match
- [ ] Mini player appears after the deck and controls the same playback
- [ ] SHIFT toggles lights-out, including the particle head
- [ ] Reduced-motion mode removes decorative motion and keeps everything usable
- [ ] Lighthouse performance 85+ on mobile; no layout shift after load

**Open questions**

- [ ] Licence the CL Antique No.15 font, or approve the mixed fallback for launch?
- [ ] Confirm which song each cover belongs to and whether more covers should join the gallery.
- [ ] Supply licensed audio (full tracks or previews) for the deck.
- [ ] Supply a background-removed portrait for the head, or commission a real 3D head model.
- [ ] Confirm footer links and the bookings email.
