import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { reduced } from "./motion";

gsap.registerPlugin(ScrollTrigger);

export let lenis: Lenis;

/** Lenis drives ScrollTrigger from the GSAP ticker. Stopped until the loader is gone. */
export function initScroll() {
  lenis = new Lenis({ lerp: reduced() ? 1 : 0.09 });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
  document.addEventListener("loader:done", () => lenis.start(), { once: true });

  // Anchor links scroll with Lenis over 1.6s.
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = document.querySelector(a.getAttribute("href")!);
      if (!target) return;
      e.preventDefault();
      (target as HTMLElement).focus?.({ preventScroll: true }); // keep keyboard focus where the page moved
      lenis.scrollTo(target as HTMLElement, { duration: reduced() ? 0 : 1.6, easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)) });
    });
  });
}

/** Hero out (scrubbed): top bar rises and fades, side columns slide out, cover row lifts. */
export function initHeroScroll() {
  if (reduced() || matchMedia("(max-width: 980px)").matches) return;
  const tl = gsap.timeline({ data: "scroll", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
  tl.to(".topbar", { yPercent: -40, opacity: 0.2, ease: "none" }, 0)
    .to(".stats--l", { x: -80, opacity: 0, ease: "none" }, 0)
    .to(".stats--r", { x: 80, opacity: 0, ease: "none" }, 0)
    .to(".covers", { y: -30, opacity: 0, ease: "none" }, 0);
}
