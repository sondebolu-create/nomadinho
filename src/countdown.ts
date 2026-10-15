import { DROP } from "./content";

const pad = (n: number) => String(n).padStart(2, "0");

/** Time left as accent colons around ink digits, e.g. 05:42:11 (or 1d 05:42:11 when a day or more is left). */
function render(msLeft: number) {
  const s = Math.max(0, Math.floor(msLeft / 1000));
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  const digits = `${pad(h)}<i>:</i>${pad(m)}<i>:</i>${pad(sec)}`;
  return { html: d ? `${d}d ${digits}` : digits, long: d > 0 };
}

export function countdownHTML() {
  const { html } = render(new Date(DROP.at).getTime() - Date.now());
  return `<article class="stat" id="countdown">
    <div class="stat__meta"><span>${DROP.source}</span><span>01</span></div>
    <div class="stat__num stat__num--time" role="timer" aria-label="Time until Nomadinho: 4th Prime drops" id="cdNum">${html}</div>
    <p class="stat__body" id="cdBody">${DROP.before}</p>
  </article>`;
}

/** Ticks once a second; switches to an "Out now" state at zero. */
export function initCountdown() {
  const card = document.getElementById("countdown");
  const num = document.getElementById("cdNum");
  const body = document.getElementById("cdBody");
  if (!card || !num || !body) return;
  const end = new Date(DROP.at).getTime();

  const tick = () => {
    const left = end - Date.now();
    if (left <= 0) {
      num.innerHTML = "<i>Out</i> now";
      num.classList.remove("is-long");
      num.removeAttribute("role");
      body.textContent = DROP.after;
      card.classList.add("is-live");
      clearInterval(timer);
      return;
    }
    const { html, long } = render(left);
    num.innerHTML = html;
    num.classList.toggle("is-long", long);
  };
  const timer = window.setInterval(tick, 1000);
  tick();
}
