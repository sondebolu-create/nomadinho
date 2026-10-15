import gsap from "gsap";
import "./tokens.css";
import "./base.css";
import "./loader.css";
import "./hero.css";
import "./gallery.css";
import "./footer.css";
import { startClock } from "./clock";
import { runLoader } from "./loader";
import { initHero, initHead, revealHero } from "./hero";
import { initScramble } from "./scramble";
import { initScroll, initHeroScroll } from "./scroll";
import { initGallery } from "./gallery";
import { initMiniPlayer } from "./mini";
import { initCursor } from "./cursor";
import { initFooter } from "./footer";
import { loadCatalogue, preloadCovers } from "./boot";

// Always start at the top: a restored scroll position would leave the scrubbed hero and pinned gallery mid-way.
history.scrollRestoration = "manual";
scrollTo(0, 0);

startClock();
initCursor();
initScroll();

// Catalogue first (live API, snapshot fallback); the loader waits for it and for the first covers.
const yieldToMain = () => new Promise<void>((r) => setTimeout(r, 0));
const boot = loadCatalogue().then(async () => {
  initHero(); await yieldToMain();
  initHeroScroll(); initScramble(); await yieldToMain();
  initGallery(); await yieldToMain();
  initMiniPlayer(); initFooter(); await yieldToMain();
  void initHead(); // three.js is its own chunk; the head reveals itself whenever it is ready
  return preloadCovers();
});

// Light / dark: colour tokens only. "light" is the lights-out palette; the head dissolves into particles (see head/head.ts).
const themeToggle = document.getElementById("themeToggle");
const setTheme = (light: boolean) => {
  const root = document.documentElement;
  root.dataset.theme = light ? "lights-out" : "dark";
  themeToggle?.setAttribute("aria-checked", String(light));
  document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')?.setAttribute("content", light ? "#ece6da" : "#0a0a09");
  try { localStorage.setItem("theme", light ? "light" : "dark"); } catch { /* private mode: the choice just isn't remembered */ }
  document.dispatchEvent(new CustomEvent("theme:change", { detail: { lightsOut: light } }));
};
const isLight = () => document.documentElement.dataset.theme === "lights-out";
themeToggle?.setAttribute("aria-checked", String(isLight())); // the inline <head> script already applied a saved choice
themeToggle?.addEventListener("click", () => setTheme(!isLight()));

// Shift on its own toggles too (Shift+Tab and Shift+click must not).
let shiftAlone = false;
addEventListener("keydown", (e) => { shiftAlone = e.key === "Shift" && !e.repeat && !e.ctrlKey && !e.altKey && !e.metaKey ? true : e.key === "Shift" ? shiftAlone : false; });
addEventListener("keyup", (e) => { if (e.key === "Shift" && shiftAlone) { shiftAlone = false; setTheme(!isLight()); } });
addEventListener("pointerdown", () => { shiftAlone = false; });

// Hero reveal starts underneath as the loader curtain lifts.
document.addEventListener("loader:curtain", revealHero, { once: true });
const skip = import.meta.env.DEV && new URLSearchParams(location.search).has("skip");
if (skip) {
  // dev only: ?skip jumps straight to the hero
  boot.then(() => {
    document.getElementById("loader")?.remove();
    revealHero();
    gsap.globalTimeline.getChildren(false).filter((t) => t.data !== "scroll").forEach((t) => t.progress(1)); // static end state for QA screenshots
    document.body.classList.remove("is-loading");
    document.dispatchEvent(new CustomEvent("loader:done"));
  });
} else
runLoader([boot]).then(() => document.dispatchEvent(new CustomEvent("loader:done")));
