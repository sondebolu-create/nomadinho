import { TRACKS, type Track } from "../content";
import type { BeatEngine } from "./engine";

/** Deck state. Tracks with a `src` play through an audio element; the rest play the placeholder beat. */
const audio = new Audio();
audio.preload = "metadata"; // the clip downloads on first play, not at page load

// The Web Audio beat is a fallback (every catalogue release has a preview), so it loads on demand.
const BEAT_DURATION = 96;
let beat: BeatEngine | null = null;
let beatLoading: Promise<BeatEngine> | null = null;
const ensureBeat = () =>
  (beatLoading ??= import("./engine").then(({ BeatEngine }) => {
    beat = new BeatEngine();
    beat.setVolume(volume);
    beat.setMuted(held);
    return beat;
  }));

type Mode = "audio" | "beat";
let mode: Mode = "beat";
let index = 0;
let playing = false;
let volume = 0.8;
let held = false; // true while the record is being scratched
let audioDuration = 30; // preview clips are ~30s; corrected once metadata loads

const emit = () => document.dispatchEvent(new CustomEvent("deck:state", { detail: { index, playing } }));
const track = (): Track => TRACKS[index];

function useBeat(offset = 0) {
  mode = "beat";
  audio.pause();
  void ensureBeat().then((b) => b.reset(offset));
  if (beat) beat.reset(offset);
}

export const player = {
  get index() { return index; },
  get playing() { return playing; },
  get volume() { return volume; },
  get mode() { return mode; },
  get duration() { return mode === "audio" ? (isFinite(audio.duration) && audio.duration > 0 ? audio.duration : audioDuration) : BEAT_DURATION; },
  get position() { return mode === "audio" ? audio.currentTime : beat?.position ?? 0; },
  get track() { return track(); },

  load(i: number, play = false) {
    index = ((i % TRACKS.length) + TRACKS.length) % TRACKS.length;
    beat?.reset(0);
    audio.pause();
    const t = track();
    if (t.src) {
      mode = "audio";
      audio.src = t.src;
      audio.currentTime = 0;
      audio.volume = volume;
    } else {
      useBeat(0);
    }
    playing = false;
    if (play) void this.play(); else emit(); // play() announces the new track and the playing state together
    this.syncSession();
  },

  async play() {
    if (playing) return;
    // Flip the UI first: a preview can take a moment to buffer and a second press must pause, not play again.
    playing = true;
    emit();
    const t = track();
    if (mode === "audio") {
      try {
        await audio.play();
      } catch (err) {
        // A newer load()/pause() interrupts this request (AbortError): that is not a failure.
        if (!playing || (err as DOMException).name === "AbortError") return;
        useBeat(0); // offline or blocked preview: keep the deck usable with the placeholder beat
      }
    }
    if (mode === "beat") {
      const b = await ensureBeat();
      if (playing) b.start(t.bpm, t.key, b.position);
    }
  },

  pause() {
    if (!playing) return;
    if (mode === "audio") audio.pause(); else beat?.stop();
    playing = false;
    emit();
  },

  toggle() { return playing ? this.pause() : this.play(); },
  next() { this.load(index + 1, playing); },
  prev() { if (this.position > 3) this.seek(0); else this.load(index - 1, playing); },

  seek(sec: number) {
    const s = Math.max(0, Math.min(this.duration - 0.05, sec));
    if (mode === "audio") audio.currentTime = s;
    else if (beat) {
      const was = playing;
      beat.reset(s);
      if (was) beat.start(track().bpm, track().key, s);
    }
  },

  setVolume(v: number) { volume = v; audio.volume = v; beat?.setVolume(v); },

  /** Silences output while the record is dragged by hand. */
  hold(on: boolean) { held = on; audio.muted = on; beat?.setMuted(on); },
  get held() { return held; },

  /** Called every frame: advances to the next track when the current one ends. */
  tick() {
    if (playing && mode === "beat" && beat && beat.position >= beat.duration - 0.05) this.next();
  },

  syncSession() {
    if (!("mediaSession" in navigator)) return;
    const t = track();
    navigator.mediaSession.metadata = new MediaMetadata({ title: t.title, artist: t.artist, album: t.type, artwork: [{ src: t.cover, sizes: "600x600", type: "image/webp" }] });
  },
};

audio.addEventListener("loadedmetadata", () => { if (isFinite(audio.duration)) audioDuration = audio.duration; });
audio.addEventListener("ended", () => player.next());
audio.addEventListener("error", () => {
  if (mode !== "audio" || !audio.src) return;
  const was = playing;
  useBeat(0);
  if (was) void ensureBeat().then((b) => b.start(track().bpm, track().key, 0));
});

if ("mediaSession" in navigator) {
  navigator.mediaSession.setActionHandler("play", () => void player.play());
  navigator.mediaSession.setActionHandler("pause", () => player.pause());
  navigator.mediaSession.setActionHandler("previoustrack", () => player.prev());
  navigator.mediaSession.setActionHandler("nexttrack", () => player.next());
}
if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__player = player; // dev-only handle for QA
