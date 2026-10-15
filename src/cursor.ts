import gsap from "gsap";

/** 6px dot follows exactly; 38px ring lerps 0.18. Elements with data-cursor grow the ring to 84px and show a label. */
export function initCursor() {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  document.documentElement.classList.add("has-cursor");

  const dot = document.createElement("div");
  dot.className = "cursor-dot";
  const ring = document.createElement("div");
  ring.className = "cursor-ring";
  const label = document.createElement("span");
  ring.appendChild(label);
  document.body.append(dot, ring);

  const p = { x: -100, y: -100, rx: -100, ry: -100 };
  addEventListener("pointermove", (e) => {
    p.x = e.clientX; p.y = e.clientY;
    dot.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%)`;
    const t = e.target as HTMLElement | null;
    const tagged = t?.closest<HTMLElement>("[data-cursor]");
    const interactive = t?.closest("a, button, input, [role='slider']");
    ring.classList.toggle("is-label", !!tagged);
    ring.classList.toggle("is-link", !tagged && !!interactive);
    label.textContent = tagged?.dataset.cursor ?? "";
    document.body.classList.toggle("cursor-active", !!tagged);
  });
  document.addEventListener("pointerleave", () => ring.classList.add("is-hidden"));
  document.addEventListener("pointerenter", () => ring.classList.remove("is-hidden"));
  gsap.ticker.add(() => {
    p.rx += (p.x - p.rx) * 0.18; p.ry += (p.y - p.ry) * 0.18;
    ring.style.transform = `translate(${p.rx}px, ${p.ry}px) translate(-50%, -50%)`;
  });
}
