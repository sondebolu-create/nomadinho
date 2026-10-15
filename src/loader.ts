import gsap from "gsap";
import { LOADER_PHOTOS, PHOTOS } from "./content";
import { mountWordmark } from "./wordmark";
import { reduced as reducedMotion } from "./motion";

const MIN_MS = 2600;
const REDUCED_MIN_MS = 400;
const CAP_EXTRA_MS = 6000;

// Named easing: ease-enter (expo.out) is built into gsap, referenced by string below.
const holdParam = import.meta.env.DEV ? new URLSearchParams(location.search).get("hold") : null;
const HOLD = holdParam === null ? null : Number(holdParam) / 100;
const pad =(n: number) => String(Math.round(n)).padStart(3, "0") + "%";

/** Resolves when the loader has fully lifted away. */
export function runLoader(extraJobs: Promise<unknown>[] = []): Promise<void> {
  const reduced = reducedMotion();
  const loader = document.getElementById("loader")!;
  const photosEl = document.getElementById("loaderPhotos")!;
  const centre = document.getElementById("loaderCentre")!;
  const bar = document.getElementById("loaderBar")!;
  const pct = document.getElementById("loaderPct")!;
  mountWordmark(document.getElementById("loaderWordmark")!);
  document.body.classList.add("is-loading");

  // Slots come from the Figma frame (1440×900), scaled to the viewport.
  const sx = innerWidth / 1440, sy = innerHeight / 900;
  const slots = LOADER_PHOTOS.map((p) => ({ x: p.x * sx, y: p.y * sy, rot: p.rot }));

  // Real progress: photos + extra assets + fonts.
  const jobs = PHOTOS.length + extraJobs.length + 1;
  let done = 0;
  const photoEls: HTMLElement[] = [];
  const launched = new Set<number>();

  const launch = (i: number) => {
    if (launched.has(i)) return;
    launched.add(i);
    gsap.to(photoEls[i], {
      scale: 1, x: slots[i].x, y: slots[i].y, rotation: slots[i].rot,
      duration: reduced ? 0.01 : 1.3, ease: "expo.out", delay: reduced ? 0 : (launched.size - 1) * 0.09,
    });
  };

  PHOTOS.forEach((src, i) => {
    const card = document.createElement("div");
    card.className = "loader__photo";
    gsap.set(card, { scale: 0 });
    const img = new Image();
    img.alt = "";
    img.decoding = "async";
    card.appendChild(img);
    photosEl.appendChild(card);
    photoEls.push(card);
    const finish = () => { done++; launch(i); };
    img.onload = finish;
    img.onerror = finish;
    img.src = src;
  });
  extraJobs.forEach((p) => p.then(() => { done++; }, () => { done++; }));
  document.fonts.ready.then(() => { done++; });

  const start = performance.now();
  const min = reduced ? REDUCED_MIN_MS : MIN_MS;
  let shown = 0;

  return new Promise((resolve) => {
    let exiting = false;
    const tick = () => {
      const t = performance.now() - start;
      // Bar follows real progress, ceilinged by time so the splash plays fully; never moves backward.
      const timeCeil = Math.min(1, t / min);
      let target = t >= min + CAP_EXTRA_MS ? 1 : Math.min(done / jobs, timeCeil);
      if (HOLD !== null) target = Math.min(target, HOLD); // dev only: ?hold=67 freezes the loader for visual QA
      shown = Math.max(shown, shown + (target - shown) * 0.08);
      if (target >= 1 && shown > 0.995) shown = 1;
      bar.style.transform = `scaleX(${shown})`;
      pct.textContent = pad(shown * 100);
      if (shown >= 1 && !exiting) { exiting = true; gsap.ticker.remove(tick); exit(); }
    };
    gsap.ticker.add(tick);

    function exit() {
      photoEls.forEach((_, i) => launch(i)); // never leave a photo un-launched
      const tl = gsap.timeline({
        onComplete: () => {
          loader.remove();
          document.body.classList.remove("is-loading");
          resolve();
        },
      });
      if (reduced) { tl.call(() => document.dispatchEvent(new CustomEvent("loader:curtain"))).to(loader, { opacity: 0, duration: 0.2 }); return; }
      tl.to(photoEls, { y: () => -innerHeight * 1.1, duration: 0.8, ease: "expo.in", stagger: 0.03, overwrite: "auto" }, 0.2)
        .to(centre, { y: "-=40", opacity: 0, duration: 0.6, ease: "power3.out" }, 0.3)
        .call(() => document.dispatchEvent(new CustomEvent("loader:curtain")), [], ">-0.2")
        .to(loader, { clipPath: "inset(0 0 100% 0)", duration: 1, ease: "expo.inOut" }, "<");
    }
  });
}
