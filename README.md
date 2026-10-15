# Nomadinho

One-page dark-mode landing site for Blaqbonez. Vite + vanilla TypeScript, GSAP + ScrollTrigger + Lenis, three.js for the head.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
npm run snapshot   # refresh public/data/releases.json from the iTunes API
```

## Where things live

| Path | What |
| --- | --- |
| `src/content.ts` | Stats, labels, footer links, loader photo layout. The only file editors touch |
| `src/catalogue.ts`, `src/boot.ts` | Release list: live iTunes API → `public/data/releases.json` → placeholders |
| `src/loader.ts` | Loader: real progress, photo splash, curtain exit |
| `src/hero.ts`, `src/player/` | Hero layout, deck, audio (real 30s previews, placeholder beat fallback) |
| `src/head/` | three.js head: displaced portrait mesh + lights-out particles |
| `src/gallery.ts`, `src/scroll.ts` | Pinned horizontal gallery, Lenis, hero scroll-out |
| `src/footer.ts`, `src/mini.ts`, `src/cursor.ts` | Footer marquee, mini player, custom cursor |
| `docs/DESIGN.md` | Design documentation (source of truth) |

## Dev flags (dev server only)

`?skip` skips the loader · `?hold=67` freezes the loader at 67% · `?reduce` forces reduced-motion code paths.

## Open items

- Licence CL Antique No.15, put `CLAntiqueNo15.otf` in `public/assets/fonts/` and uncomment the `@font-face` rule in `src/base.css`. The wordmark switches to it and the letters stop cycling. (The rule is commented out so the missing file is not requested.)
- Footer links and the bookings email are placeholders (`FOOTER` in `src/content.ts`).
- Hero stat cards are static copy; there is no free live-chart API.
- Head uses a cropped portrait with a radial face mask; supply a background-removed PNG to improve it.
