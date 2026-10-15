# CLAUDE.md — Nomadinho

Read docs/DESIGN.md before any UI work. It is the source of truth for tokens, motion and layout.

Rules
- Dark first. Colours only from the tokens in DESIGN.md (CSS custom properties on :root, see src/tokens.css).
- Type: NOMADINHO wordmark in CL Antique No.15 (fallback: mixed ornamental faces). UI labels in Space Mono 11px uppercase. Everything else Inter Tight.
- Motion: GSAP + ScrollTrigger + Lenis. Use the named easings and durations; never default ease.
- Every interaction needs a hover, active and reduced-motion state. Use `reduced()` from src/motion.ts in JS.
- Images come from /assets with the names in DESIGN.md; never hotlink (the one exception is Apple's artwork CDN for release covers).
- No component libraries, no Tailwind UI kits. Hand-built, small files.
- Check work in a browser at 1440x900 and 390x844 before saying a section is done.

Project notes
- All editable content lives in src/content.ts. Release data comes from the iTunes Search API (src/catalogue.ts), with public/data/releases.json as the offline fallback (`npm run snapshot` refreshes it).
- Figma file: NOMADINHO (He18qLqPGj4up2CJzAPPIa), "Hi-fi screens" page.
- Dev-only URL flags: `?skip` (jump past the loader), `?hold=67` (freeze the loader), `?reduce` (force reduced motion).
- JS budget: first-party + gsap + lenis under 60 KB gzipped (three.js is a separate lazy chunk). Check with `npm run build`.
