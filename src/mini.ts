import { thumb, TRACKS } from "./content";
import { ICON } from "./icons";

/** Pill bottom right; slides up when the deck scrolls out of view and hides when it returns. */
export function initMiniPlayer() {
  const el = document.createElement("div");
  el.className = "mini";
  el.setAttribute("role", "region");
  el.setAttribute("aria-label", "Mini player");
  el.innerHTML = `
    <img class="mini__cover" id="miniCover" src="${thumb(TRACKS[0].cover)}" alt="" />
    <div class="mini__text"><b id="miniTitle">${TRACKS[0].title}</b><span class="ui-label">Blaqbonez</span></div>
    <div class="mini__ctl">
      <button class="ctl" data-cmd="prev" type="button" aria-label="Previous">${ICON.prev}</button>
      <button class="ctl ctl--play" data-cmd="toggle" type="button" aria-label="Play or pause">${ICON.play}${ICON.pause}</button>
      <button class="ctl" data-cmd="next" type="button" aria-label="Next">${ICON.next}</button>
    </div>`;
  document.body.appendChild(el);

  el.addEventListener("click", (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>("[data-cmd]");
    if (b) document.dispatchEvent(new CustomEvent("deck:cmd", { detail: { cmd: b.dataset.cmd } }));
  });
  document.addEventListener("deck:state", ((e: CustomEvent) => {
    const { index, playing } = e.detail;
    (document.getElementById("miniCover") as HTMLImageElement).src = thumb(TRACKS[index].cover);
    document.getElementById("miniTitle")!.textContent = TRACKS[index].title;
    el.classList.toggle("is-playing", playing);
  }) as EventListener);

  new IntersectionObserver(([entry]) => el.classList.toggle("is-shown", !entry.isIntersecting), { threshold: 0.05 })
    .observe(document.getElementById("deck")!);
}
