import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FOOTER } from "./content";
import { mountWordmark } from "./wordmark";
import { lenis } from "./scroll";
import { reduced } from "./motion";

gsap.registerPlugin(ScrollTrigger);

// 16-ray burst in the accent colour (the ✺ between wordmark repeats).
const rays = Array.from({ length: 16 }, (_, i) => `<rect x="44" y="4" width="3" height="${i % 2 ? 22 : 30}" rx="1.5" transform="rotate(${i * 22.5} 45.5 45.5)"/>`).join("");
const BURST = `<svg class="burst" viewBox="0 0 91 91" aria-hidden="true" fill="currentColor">${rays}</svg>`;

export function initFooter() {
  const root = document.getElementById("footer")!;
  const group = () => `<div class="marquee__group">${[0, 1, 2].map(() => `<h2 class="wordmark wordmark--footer" aria-hidden="true"></h2>${BURST}`).join("")}</div>`;

  root.innerHTML = `
    <div class="marquee" role="img" aria-label="Nomadinho"><div class="marquee__track">${group()}${group()}</div></div>
    <div class="footer__links">
      ${FOOTER.columns.map((c) => `
        <div class="footer__col">
          <p class="ui-label">${c.title}</p>
          ${c.links.map((l) => `<a class="footer__link" href="${l.href}">${l.label}</a>`).join("")}
        </div>`).join("")}
    </div>
    <div class="footer__base ui-label">
      <span>${FOOTER.base.left}</span><span>${FOOTER.base.centre}</span>
      <a href="#hero" id="toTop">${FOOTER.base.right}</a>
    </div>`;

  // Footer repeats hold the Figma font per letter (no cycling) so the loop reads as one wordmark.
  root.querySelectorAll<HTMLElement>(".wordmark--footer").forEach((w) => mountWordmark(w, "NOMADINHO", false));

  root.querySelectorAll<HTMLAnchorElement>('a[href="#"]').forEach((a) => a.addEventListener("click", (e) => e.preventDefault())); // placeholders until real URLs land

  document.getElementById("toTop")!.addEventListener("click", (e) => {
    e.preventDefault();
    lenis.scrollTo(0, { duration: reduced() ? 0 : 1.6, easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) });
  });

  if (!reduced()) {
    gsap.from(".footer__col, .footer__base", {
      y: 30, opacity: 0, duration: 1, ease: "expo.out", stagger: 0.07, data: "scroll",
      scrollTrigger: { trigger: root, start: "top 55%", once: true },
    });
  }
}
