const fmt = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Lagos", hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit",
});

export function startClock() {
  const els = document.querySelectorAll<HTMLElement>("[data-clock]");
  const tick = () => els.forEach((e) => (e.textContent = fmt.format(new Date())));
  tick();
  setInterval(tick, 1000);
}
