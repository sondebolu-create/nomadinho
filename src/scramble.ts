import { reduced } from "./motion";
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>—";

/** Nav labels scramble then resolve left to right on hover. */
export function initScramble() {
  if (reduced()) return;
  document.querySelectorAll<HTMLElement>("[data-scramble]").forEach((el) => {
    const text = el.textContent!;
    let raf = 0;
    el.addEventListener("pointerenter", () => {
      cancelAnimationFrame(raf);
      const start = performance.now(), dur = 420;
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        const keep = Math.floor(p * text.length);
        el.textContent = [...text].map((c, i) => (i < keep || c === " " ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join("");
        if (p < 1) raf = requestAnimationFrame(step); else el.textContent = text;
      };
      raf = requestAnimationFrame(step);
    });
  });
}
