import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { isUpcoming, TRACKS } from "./content";
import { lenis } from "./scroll";
import { reduced } from "./motion";

gsap.registerPlugin(ScrollTrigger);

// Tile widths in vw at 1440 (22–36vw, capped at 52vh), and vertical offsets in px at 900 tall.
const WIDTHS = [32.5, 24, 30, 22, 32.5, 26, 32];
const OFFSETS = [0, -80, 90, -10, 0, 100, 0];
const GROW = 0.22;
const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export function initGallery() {
  const root = document.getElementById("gallery")!;
  const pad = (n: number) => String(n).padStart(2, "0");
  root.innerHTML = `
    <h2 class="gallery__title">Every cover,<br />every era.</h2>
    <div class="gallery__counter"><span class="gallery__num" id="gNum">01</span><span class="ui-label">Songs &amp; albums</span></div>
    <div class="gallery__track" id="gTrack">
      ${TRACKS.map((t, i) => `
        <button class="tile" type="button" data-i="${i}" data-cursor="Play" style="--w:${WIDTHS[i % WIDTHS.length]};--dy:${OFFSETS[i % OFFSETS.length]}">
          <span class="sr-only">Play </span><span class="tile__img"><img src="${t.cover}" alt="" decoding="async"${i > 7 ? ' fetchpriority="low"' : ""} /><b class="tile__tag" aria-hidden="true">On deck</b></span>
          <span class="tile__cap"><span class="ui-label tile__n">${pad(i + 1)}</span><span class="tile__t">${t.title}</span><span class="ui-label tile__type">${t.type}</span></span>
        </button>`).join("")}
    </div>
    <p class="gallery__hint ui-label">Scroll</p><p class="gallery__hint gallery__hint--r ui-label" aria-hidden="true">←</p>
    <div class="gallery__progress"><i id="gFill"></i></div>`;

  const track = document.getElementById("gTrack")!;
  const tiles = [...track.querySelectorAll<HTMLElement>(".tile")];
  const num = document.getElementById("gNum")!;
  // The tag on the current tile says "Coming soon" until the release date has passed, then "On deck".
  const tagText = () => tiles.forEach((t, i) => { t.querySelector(".tile__tag")!.textContent = isUpcoming(TRACKS[i]) ? "Coming soon" : "On deck"; });
  tagText();
  document.addEventListener("drop:live", tagText);
  const fill = document.getElementById("gFill")!;
  const isReduced = reduced();

  // Which track is on deck, and hover dimming.
  document.addEventListener("deck:state", ((e: CustomEvent) => {
    tiles.forEach((t, i) => { const on = i === e.detail.index; t.classList.toggle("is-on", on); on ? t.setAttribute("aria-current", "true") : t.removeAttribute("aria-current"); });
  }) as EventListener);
  tiles[0].classList.add("is-on");
  tiles.forEach((t) => {
    t.addEventListener("pointerenter", () => { track.classList.add("is-hovering"); t.classList.add("is-hover"); });
    t.addEventListener("pointerleave", () => { track.classList.remove("is-hovering"); t.classList.remove("is-hover"); });
    t.addEventListener("click", () => document.dispatchEvent(new CustomEvent("deck:select", { detail: { index: Number(t.dataset.i) } })));
  });

  let W = 0, vw = innerWidth;
  const state = { p: 0 };
  const skewSet = tiles.map((t) => gsap.quickSetter(t, "skewX", "deg") as (v: number) => void);
  let skew = 0;

  const apply = (p: number) => {
    const g = clamp(p / GROW), t = clamp((p - GROW) / (1 - GROW));
    const s = lerp(0.32, 1, gsap.parseEase("power3.out")(g));
    // Right end of the row drifts from 0.95vw to 1.15vw while it grows, then the whole row travels right.
    const R = lerp(vw * 0.951, vw * 1.148, g);
    const x = lerp(R - W, 0, t);
    gsap.set(track, { x, scale: isReduced ? 1 : s });
    tiles.forEach((tile, i) => gsap.set(tile, { rotation: isReduced ? 0 : (i % 2 ? 6 : -6) * (1 - g) }));
    num.textContent = String(1 + Math.round(t * (TRACKS.length - 1))).padStart(2, "0");
    fill.style.transform = `scaleX(${p})`;
  };

  const measure = () => { vw = innerWidth; W = track.scrollWidth; };
  measure();
  gsap.set(track, { yPercent: -50, transformOrigin: "100% 50%" });
  apply(0);

  const tl = gsap.timeline({
    data: "scroll",
    scrollTrigger: {
      trigger: root, start: "top top", end: () => `+=${Math.round(W * 1.15)}`, pin: true, scrub: isReduced ? true : 1,
      invalidateOnRefresh: true, onRefreshInit: measure,
    },
  }).to(state, { p: 1, ease: "none", onUpdate: () => apply(state.p) });

  // Keyboard users: focusing a tile behaves like hover and scrolls the pinned row so the tile is centred.
  const R1 = () => vw * 1.148;
  tiles.forEach((t) => {
    t.addEventListener("focus", () => {
      track.classList.add("is-hovering"); t.classList.add("is-hover");
      const st = tl.scrollTrigger;
      if (!st) return;
      const x = vw / 2 - (t.offsetLeft + t.offsetWidth / 2);
      const k = clamp(1 - x / (R1() - W));
      const p = GROW + k * (1 - GROW);
      lenis.scrollTo(st.start + p * (st.end - st.start), { immediate: isReduced, duration: 1.2 });
    });
    t.addEventListener("blur", () => { track.classList.remove("is-hovering"); t.classList.remove("is-hover"); });
  });

  // Tiles skew up to ±4° with scroll velocity.
  if (!isReduced) {
    gsap.ticker.add(() => {
      const target = clamp(lenis.velocity * 0.12, -4, 4);
      if (Math.abs(target) < 0.01 && Math.abs(skew) < 0.01) { if (skew) { skew = 0; skewSet.forEach((set) => set(0)); } return; }
      skew += (target - skew) * 0.12;
      skewSet.forEach((set) => set(skew));
    });
  }
  addEventListener("resize", () => { ScrollTrigger.refresh(); });
}
