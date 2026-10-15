/** Single source of truth for "should things move". Dev builds also honour ?reduce so the JS paths can be tested. */
const forced = import.meta.env.DEV && new URLSearchParams(location.search).has("reduce");
export const reduced = () => forced || matchMedia("(prefers-reduced-motion: reduce)").matches;
