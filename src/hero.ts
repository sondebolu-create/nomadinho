import gsap from "gsap";
import { LABELS, STATS, thumb, TRACKS } from "./content";
import { countdownHTML, initCountdown } from "./countdown";
import { mountWordmark } from "./wordmark";
import { ICON } from "./icons";
import { reduced } from "./motion";
import { HERO_COVERS } from "./boot";
import { initDeck } from "./player/deck";


function statHTML(i: number) {
  const s = STATS[i];
  const num = `${s.prefix ? `<i>${s.prefix}</i>` : ""}<span data-count="${s.number}">${s.number}</span>${s.suffix ? `<i>${s.suffix}</i>` : ""}`;
  return `<article class="stat">
    <div class="stat__meta"><span>${s.source}</span><span>${String(i + 2).padStart(2, "0")}</span></div>
    <div class="stat__num">${num}</div>
    <p class="stat__body">${s.sentence}</p>
  </article>`;
}

export function initHero() {
  const root = document.getElementById("hero")!;
  const t0 = TRACKS[0];
  root.innerHTML = `
    <div class="topbar">
      <div class="topbar__side topbar__side--l"><b>${LABELS.left.title}</b><span>${LABELS.left.sub}</span></div>
      <h1 class="topbar__word wordmark wordmark--hero" id="heroWordmark" aria-label="Nomadinho"></h1>
      <div class="topbar__side topbar__side--r"><b>${LABELS.right.title}</b><span>${LABELS.right.sub}</span></div>
      <p class="topbar__sub">Blaqbonez</p>
    </div>

    <div class="head" id="head" aria-hidden="true">
      <div class="head__photo" id="headPhoto"><img src="/assets/head.webp" alt="" width="560" height="560" loading="lazy" decoding="async" /></div>
      <div class="head__spot"></div>
    </div>

    <div class="stats stats--l">${countdownHTML()}${statHTML(0)}</div>
    <div class="stats stats--r">${statHTML(1)}${statHTML(2)}</div>

    <p class="hint ui-label" id="hint">${matchMedia("(pointer: coarse)").matches ? "Drag to look around" : "Move your cursor"}</p>

    <div class="covers" id="covers" role="group" aria-label="Tracks">
      ${TRACKS.slice(0, HERO_COVERS).map((t, i) => `<button class="cover${i === 0 ? " is-on" : ""}" type="button" data-i="${i}" data-cursor="Play" aria-label="Play ${t.title}"><img src="${thumb(t.cover)}" alt="" width="62" height="62" decoding="async" /></button>`).join("")}
    </div>

    <section class="deck" id="deck" aria-label="Deck player">
      <div class="turntable" aria-hidden="true">
        <div class="tt-platter"></div>
        <div class="tt-vinyl"><img src="/assets/ui/vinyl.webp" alt="" /></div>
        <div class="tt-label"><img id="ttLabel" src="${thumb(t0.cover)}" alt="" /></div>
        <div class="tt-spindle"></div><div class="tt-pivot"></div><div class="tt-arm"></div><div class="tt-led"></div>
      </div>
      <div class="deck__info">
        <p class="deck__label ui-label" id="deckLabel"></p>
        <h2 class="deck__title" id="deckTitle" aria-live="polite"></h2>
        <p class="deck__artist" id="deckArtist"></p>
      </div>
      <div class="deck__controls">
        <button class="ctl" id="btnPrev" type="button" aria-label="Previous">${ICON.prev}</button>
        <button class="ctl ctl--play" id="btnPlay" type="button" aria-label="Play or pause" aria-pressed="false">${ICON.play}${ICON.pause}</button>
        <button class="ctl" id="btnNext" type="button" aria-label="Next">${ICON.next}</button>
      </div>
      <div class="progress">
        <span id="tCur">0:00</span>
        <div class="wave" id="wave" data-cursor="Seek" role="slider" aria-label="Seek" aria-valuemin="0" tabindex="0"></div>
        <span id="tDur">0:30</span>
        <label class="vol">Vol<input id="vol" type="range" min="0" max="1" step="0.01" value="0.8" aria-label="Volume" /></label>
      </div>
    </section>`;

  mountWordmark(document.getElementById("heroWordmark")!);

  initDeck();
  initCountdown();

  // ---- head follows the cursor (eased, never snaps) ----
  const head = document.getElementById("head")!;
  const m = { x: 0, y: 0, tx: 0, ty: 0 };
  if (!reduced()) {
    addEventListener("pointermove", (e) => { m.tx = (e.clientX / innerWidth) * 2 - 1; m.ty = (e.clientY / innerHeight) * 2 - 1; });
    gsap.ticker.add(() => {
      if (head.classList.contains("has-gl")) return; // the WebGL head does its own tracking
      m.x += (m.tx - m.x) * 0.06; m.y += (m.ty - m.y) * 0.06;
      head.style.setProperty("--mx", m.x.toFixed(3)); head.style.setProperty("--my", m.y.toFixed(3));
    });
  }

  prepareReveal(root);
}

// ---- reveal (runs as the loader curtain lifts) ----
function prepareReveal(root: HTMLElement) {
  if (reduced()) return;
  gsap.set(root.querySelectorAll(".topbar > *"), { y: 60, opacity: 0 });
  gsap.set(root.querySelectorAll(".stat"), { y: 40, opacity: 0 });
  gsap.set(root.querySelectorAll(".cover"), { y: 40, opacity: 0 });
  gsap.set("#deck", { y: 40, opacity: 0 });
  gsap.set("#hint", { opacity: 0 });
  gsap.set("#header", { y: -30, opacity: 0 });
  gsap.set(".head__photo", { scale: 0.82, opacity: 0, filter: "blur(18px)" });
}

export function revealHero() {
  document.body.dataset.revealed = "1";
  document.dispatchEvent(new CustomEvent("head:reveal"));
  if (reduced()) return;
  const tl = gsap.timeline();
  tl.to(".topbar > *", { y: 0, opacity: 1, duration: 1.2, ease: "expo.out", stagger: 0.08 }, 0)
    .to(".stat", { y: 0, opacity: 1, duration: 1, ease: "expo.out", stagger: 0.07 }, 0.15)
    .to(".cover", { y: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.04 }, 0.3)
    .to("#deck", { y: 0, opacity: 1, duration: 1, ease: "expo.out" }, 0.45)
    .to("#header", { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, 0.6)
    .to(".head__photo", { scale: 1, opacity: 1, filter: "blur(0px)", duration: 2.2, ease: "expo.out" }, 0)
    .to("#hint", { opacity: 1, duration: 1, ease: "power3.out" }, 1.2);
  document.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
    const end = Number(el.dataset.count), o = { v: 0 };
    el.textContent = "0";
    gsap.to(o, { v: end, duration: 1.4, ease: "power3.out", delay: 0.3, onUpdate: () => (el.textContent = String(Math.round(o.v))) });
  });
}

/** three.js is a separate chunk, fetched once the loader is already running. Falls back to the still image without WebGL. */
export async function initHead() {
  try {
    const { createHead } = await import("./head/head");
    await createHead(document.getElementById("head")!);
  } catch (err) {
    console.warn("3D head unavailable, using the still image", err);
  }
}
