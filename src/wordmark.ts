import { reduced } from "./motion";
// NOMADINHO letter splitting + fallback font cycling (until CL Antique No.15 is licensed).
// Order matches the Figma wordmark: N O M A D I N H O.
const FALLBACKS = [
  "Rye", "Almendra Display", "Fruktur", "Sancreek", "Metamorphous",
  "UnifrakturMaguntia", "Germania One", "Pirata One", "Grenze Gotisch",
];
const setFace = (s: HTMLElement, name: string) => {
  s.style.fontFamily = `"${name}", serif`;
  s.style.fontWeight = name === "Grenze Gotisch" ? "700" : "400";
};

export function mountWordmark(el: HTMLElement, text = "NOMADINHO", cycle = true) {
  el.textContent = "";
  const letters = [...text].map((c, i) => {
    const s = document.createElement("span");
    s.className = "ch";
    s.setAttribute("aria-hidden", "true");
    s.textContent = c;
    setFace(s, FALLBACKS[i % FALLBACKS.length]);
    el.appendChild(s);
    return s;
  });

  let timer: number | undefined;
  const stop = () => { if (timer) clearInterval(timer); timer = undefined; };

  if (cycle && !reduced()) {
    timer = window.setInterval(() => {
      const s = letters[Math.floor(Math.random() * letters.length)];
      setFace(s, FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]);
    }, 900);
  }

  // When the licensed OTF is present, use it for every letter and stop cycling.
  document.fonts.load('1em "CL Antique No15"').then((f) => {
    if (f.length) { stop(); el.classList.add("has-font"); }
  }).catch(() => {});

  return { letters, stop };
}
