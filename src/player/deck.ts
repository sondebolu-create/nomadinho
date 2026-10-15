import gsap from "gsap";
import { thumb, TRACKS } from "../content";
import { player } from "./player";
import { reduced } from "../motion";

const BARS = 120;
const RPM_DEG_PER_S = 200; // 33⅓ rpm
const SEC_PER_REV = 1.8;
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// Seeded per track so every record has its own shape.
function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function waveHeights(index: number) {
  const r = rng(index * 9973 + 17);
  return Array.from({ length: BARS }, (_, i) => {
    const rise = Math.min(1, 0.25 + i / 28);
    const fall = i > BARS - 24 ? 0.35 + (BARS - i) / 37 : 1;
    return Math.round(4 + (0.3 + 0.7 * r()) * 24 * rise * fall);
  });
}

/** Wires the deck markup (rendered in hero.ts) to the player: waveform, controls, turntable physics, keyboard. */
export function initDeck() {
  const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
  const deck = $("deck"), wave = $("wave"), tCur = $("tCur"), tDur = $("tDur");
  const vinyl = deck.querySelector<HTMLElement>(".tt-vinyl")!;
  const label = deck.querySelector<HTMLElement>(".tt-label")!;
  const arm = deck.querySelector<HTMLElement>(".tt-arm")!;
  const platter = deck.querySelector<HTMLElement>(".tt-platter")!;
  const miniCover = () => document.getElementById("miniCover") as HTMLElement | null;
  let bars: HTMLElement[] = [];
  let playedBars = -1, shownSec = -1, shownDur = -1;

  // ---- track + play state ----
  const renderTrack = () => {
    const i = player.index, t = player.track;
    $("deckLabel").textContent = `Now on the deck · ${String(i + 1).padStart(2, "0")}/${String(TRACKS.length).padStart(2, "0")}`;
    $("deckTitle").textContent = t.title;
    $("deckArtist").textContent = `${t.artist} · ${t.type}`;
    ($("ttLabel") as HTMLImageElement).src = thumb(t.cover);
    document.querySelectorAll<HTMLElement>(".cover").forEach((c, n) => c.classList.toggle("is-on", n === i));
    wave.replaceChildren(...(bars = waveHeights(i).map((h, n) => {
      const b = document.createElement("i");
      b.style.height = `${h}px`; b.style.setProperty("--i", String(n));
      return b;
    })));
    playedBars = -1; shownSec = -1; shownDur = -1;
    document.body.style.setProperty("--bpm", String(t.bpm));
  };
  let lastIndex = -1;
  document.addEventListener("deck:state", ((e: CustomEvent) => {
    if (e.detail.index !== lastIndex) { lastIndex = e.detail.index; renderTrack(); }
    deck.classList.toggle("is-playing", e.detail.playing);
    $("btnPlay").setAttribute("aria-pressed", String(e.detail.playing));
    document.body.classList.toggle("is-playing", e.detail.playing);
    if ("mediaSession" in navigator) navigator.mediaSession.playbackState = e.detail.playing ? "playing" : "paused";
  }) as EventListener);

  // ---- controls ----
  $("btnPlay").addEventListener("click", () => void player.toggle());
  $("btnPrev").addEventListener("click", () => player.prev());
  $("btnNext").addEventListener("click", () => player.next());
  $("covers").addEventListener("click", (e) => {
    const c = (e.target as HTMLElement).closest<HTMLElement>(".cover");
    if (c) select(Number(c.dataset.i));
  });
  const select = (i: number) => (i === player.index ? void player.toggle() : player.load(i, true));
  // Gallery tiles and the mini player drive the same deck.
  document.addEventListener("deck:select", ((e: CustomEvent) => select(e.detail.index)) as EventListener);
  document.addEventListener("deck:cmd", ((e: CustomEvent) => {
    const c = e.detail.cmd as string;
    if (c === "toggle") void player.toggle(); else if (c === "prev") player.prev(); else if (c === "next") player.next();
  }) as EventListener);

  const vol = $<HTMLInputElement>("vol");
  vol.addEventListener("input", () => player.setVolume(Number(vol.value)));
  player.setVolume(Number(vol.value));

  // ---- keyboard: Space plays/pauses (unless typing), Alt+←/→ skip ----
  addEventListener("keydown", (e) => {
    const el = e.target as HTMLElement;
    if (!el?.closest) return;
    if (e.code === "Space" && !el.closest("input, textarea, button, [contenteditable]")) { e.preventDefault(); void player.toggle(); }
    if (e.altKey && e.key === "ArrowRight") { e.preventDefault(); player.next(); }
    if (e.altKey && e.key === "ArrowLeft") { e.preventDefault(); player.prev(); }
  });

  // ---- seek: click or drag the waveform ----
  const seekFrom = (clientX: number) => {
    const r = wave.getBoundingClientRect();
    player.seek(Math.max(0, Math.min(1, (clientX - r.left) / r.width)) * player.duration);
  };
  wave.addEventListener("pointerdown", (e) => {
    seekFrom(e.clientX);
    try { wave.setPointerCapture(e.pointerId); } catch { /* see scratch */ }
    const move = (ev: PointerEvent) => seekFrom(ev.clientX);
    const up = () => { wave.removeEventListener("pointermove", move); wave.removeEventListener("pointerup", up); };
    wave.addEventListener("pointermove", move); wave.addEventListener("pointerup", up);
  });
  wave.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); player.seek(player.position + 5); }
    if (e.key === "ArrowLeft") { e.preventDefault(); player.seek(player.position - 5); }
  });

  // ---- turntable physics ----
  let angle = 0, omega = 0, armAngle = 100, armShown = NaN, scratching = false;
  const spinTargets = () => [vinyl, label, miniCover()].filter(Boolean) as HTMLElement[];
  const rotate = () => spinTargets().forEach((el) => (el.style.transform = `rotate(${angle.toFixed(2)}deg)`));

  // Scratch: drag the record by hand; on release it seeks by the distance turned.
  platter.parentElement!.setAttribute("data-cursor", "Scratch");
  platter.parentElement!.style.touchAction = "none";
  platter.parentElement!.addEventListener("pointerdown", (e) => {
    const r = platter.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const at = (ev: PointerEvent) => (Math.atan2(ev.clientY - cy, ev.clientX - cx) * 180) / Math.PI;
    let prev = at(e), turned = 0;
    scratching = true; omega = 0; player.hold(true);
    const host = e.currentTarget as HTMLElement;
    try { host.setPointerCapture(e.pointerId); } catch { /* capture is a nicety; the gesture works without it */ }
    const move = (ev: PointerEvent) => {
      let d = at(ev) - prev; prev = at(ev);
      if (d > 180) d -= 360; if (d < -180) d += 360;
      turned += d; angle += d; rotate();
    };
    const up = () => {
      host.removeEventListener("pointermove", move); host.removeEventListener("pointerup", up); host.removeEventListener("pointercancel", up);
      scratching = false; player.hold(false);
      player.seek(player.position + (turned / 360) * SEC_PER_REV);
    };
    host.addEventListener("pointermove", move); host.addEventListener("pointerup", up); host.addEventListener("pointercancel", up);
  });

  // ---- per-frame: progress, waveform, spin-up/down inertia, tonearm ----
  gsap.ticker.add((_, dtMs) => {
    player.tick();
    const pos = player.position, dur = player.duration;
    const sec = Math.floor(pos);
    if (sec !== shownSec) { shownSec = sec; tCur.textContent = mmss(pos); wave.setAttribute("aria-valuenow", String(sec)); wave.setAttribute("aria-valuetext", `${mmss(pos)} of ${mmss(dur)}`); }
    if (Math.round(dur) !== shownDur) { shownDur = Math.round(dur); tDur.textContent = mmss(dur); wave.setAttribute("aria-valuemax", String(shownDur)); }
    const played = Math.round((pos / dur) * BARS);
    if (played !== playedBars) { playedBars = played; bars.forEach((b, i) => b.classList.toggle("is-played", i < played)); }

    if (!reduced() && !scratching) {
      const dt = Math.min(dtMs, 64) / 1000;
      const target = player.playing ? RPM_DEG_PER_S : 0;
      omega += (target - omega) * (1 - Math.exp(-dt * (player.playing ? 1.6 : 0.9))); // slow spin-up, slower slow-down
      if (Math.abs(omega) < 0.05 && !player.playing) omega = 0;
      if (omega) { angle = (angle + omega * dt) % 360; rotate(); }
    }
    // Tonearm swings onto the record when playing and moves inward with progress.
    const armTarget = player.playing ? 112 + 12 * (pos / dur) : 100;
    armAngle += (armTarget - armAngle) * (1 - Math.exp(-(Math.min(dtMs, 64) / 1000) * 3));
    if (Math.abs(armAngle - armShown) > 0.02 || isNaN(armShown)) { armShown = armAngle; arm.style.transform = `rotate(${armAngle.toFixed(2)}deg)`; }
  });

  // Initial paint once the deck exists.
  player.load(0); // emits deck:state → renders the first track
  rotate();
}
