import {
  BufferAttribute, BufferGeometry, Color, Group, Mesh, PerspectiveCamera, PlaneGeometry, Points, Scene,
  ShaderMaterial, TextureLoader, Vector2, WebGLRenderer,
} from "three";
import gsap from "gsap";
import { reduced } from "../motion";
import vert from "./head.vert?raw";
import frag from "./head.frag?raw";
import pointsFrag from "./points.frag?raw";

const col = (hex: string) => new Color(hex);

// Where the face sits in head-src.jpg (uv, origin bottom-left).
const FACE = new Vector2(0.5, 0.6);

/** Single portrait turned into depth: displaced mesh + point cloud sharing one shader. Resolves null if WebGL is unavailable. */
export async function createHead(host: HTMLElement) {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  } catch {
    return null;
  }
  const lite = matchMedia("(pointer: coarse)").matches || (navigator.hardwareConcurrency ?? 8) <= 4;
  renderer.setPixelRatio(Math.min(devicePixelRatio, lite ? 1.5 : 2));
  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.className = "head__canvas";
  host.appendChild(canvas);

  const tex = await new Promise<import("three").Texture>((res, rej) => new TextureLoader().load("/assets/head-src.webp", res, undefined, rej));

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 20);
  camera.position.z = 4.35; // plane (2.4) fills ~87.5% of the canvas
  const group = new Group();
  scene.add(group);

  const shared = {
    uTex: { value: tex }, uDepth: { value: 0.9 }, uReveal: { value: 0 }, uTime: { value: 0 },
    uFace: { value: FACE }, uSpot: { value: new Vector2(0.64, 0.55) },
  };

  const meshMat = new ShaderMaterial({
    vertexShader: vert, fragmentShader: frag, transparent: true, depthWrite: false,
    uniforms: { ...shared, uOpacity: { value: 1 }, uBone: { value: col("#ece6da") }, uDark: { value: col("#0a0a09") }, uAccent: { value: col("#ff4d1a") } },
  });
  const mesh = new Mesh(new PlaneGeometry(2.4, 2.4, lite ? 130 : 220, lite ? 130 : 220), meshMat);
  group.add(mesh);

  // 150 × 150 point cloud using the same displacement.
  const N = lite ? 100 : 150, pos = new Float32Array(N * N * 3), uvs = new Float32Array(N * N * 2);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const i = y * N + x;
    pos.set([(x / (N - 1) - 0.5) * 2.4, (y / (N - 1) - 0.5) * 2.4, 0], i * 3);
    uvs.set([x / (N - 1), y / (N - 1)], i * 2);
  }
  const pg = new BufferGeometry();
  pg.setAttribute("position", new BufferAttribute(pos, 3));
  pg.setAttribute("uv", new BufferAttribute(uvs, 2));
  const pointMat = new ShaderMaterial({
    vertexShader: "uniform float uPointSize;\n" + vert, fragmentShader: pointsFrag, transparent: true, depthWrite: false,
    defines: { IS_POINTS: "" },
    uniforms: { ...shared, uOpacity: { value: 0 }, uPointSize: { value: 4 }, uInk: { value: col("#0a0a09") }, uAccent: { value: col("#ff4d1a") } },
  });
  const points = new Points(pg, pointMat);
  group.add(points);

  // ---- size ----
  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = 4.35 * Math.max(1, 1 / camera.aspect); // keep the whole plane in frame on portrait canvases
    camera.updateProjectionMatrix();
    pointMat.uniforms.uPointSize.value = (h / 640) * 2.6 * renderer.getPixelRatio();
  };
  new ResizeObserver(resize).observe(host);
  resize();

  // ---- cursor tracking (eased, never snaps) + touch drag ----
  const m = { x: 0, y: 0, tx: 0, ty: 0 };
  const spot = { x: 0.64, y: 0.55, tx: 0.64, ty: 0.55 };
  const coarse = matchMedia("(pointer: coarse)").matches;
  let dragging = false;
  const aim = (cx: number, cy: number) => {
    m.tx = (cx / innerWidth) * 2 - 1; m.ty = (cy / innerHeight) * 2 - 1;
    const r = host.getBoundingClientRect();
    // pointer → plane uv (plane fills 87.5% of the canvas), v flipped
    spot.tx = ((cx - r.left) / r.width - 0.0625) / 0.875;
    spot.ty = 1 - ((cy - r.top) / r.height - 0.0625) / 0.875;
  };
  if (!reduced()) {
    if (!coarse) addEventListener("pointermove", (e) => aim(e.clientX, e.clientY));
    else {
      host.style.touchAction = "pan-y";
      host.addEventListener("pointerdown", (e) => { dragging = true; aim(e.clientX, e.clientY); });
      host.addEventListener("pointermove", (e) => { if (dragging) aim(e.clientX, e.clientY); });
      const end = () => { dragging = false; m.tx = 0; m.ty = 0; };
      host.addEventListener("pointerup", end); host.addEventListener("pointercancel", end); host.addEventListener("pointerleave", end);
    }
  }

  // ---- render loop (paused off screen) ----
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(host);
  const t0 = performance.now();
  let frame = 0;
  const render = () => {
    if (!visible || !document.body.dataset.revealed) return; // nothing to see behind the loader
    if (lite && (frame++ & 1)) return; // 30fps on phones
    const t = (performance.now() - t0) / 1000;
    m.x += (m.tx - m.x) * 0.06; m.y += (m.ty - m.y) * 0.06;
    spot.x += (spot.tx - spot.x) * 0.12; spot.y += (spot.ty - spot.y) * 0.12;
    const drift = reduced() ? 0 : 1;
    group.rotation.y = m.x * 0.55 + Math.sin(t * 0.4) * 0.08 * drift;
    group.rotation.x = m.y * 0.32 + Math.cos(t * 0.3) * 0.04 * drift;
    shared.uTime.value = reduced() ? 0 : t;
    shared.uSpot.value.set(spot.x, spot.y);
    renderer.render(scene, camera);
  };
  gsap.ticker.add(render);

  // ---- reveal + lights-out ----
  const api = {
    reveal() {
      gsap.to(shared.uReveal, { value: 1, duration: reduced() ? 0.01 : 2.2, ease: "expo.out" });
    },
    setLightsOut(on: boolean) {
      const to = (u: { value: number }, v: number) => gsap.to(u, { value: v, duration: reduced() ? 0.01 : 0.9, ease: "expo.inOut" });
      to(meshMat.uniforms.uOpacity, on ? 0 : 1);
      to(pointMat.uniforms.uOpacity, on ? 1 : 0);
    },
  };
  if (document.body.dataset.revealed) api.reveal(); else document.addEventListener("head:reveal", api.reveal, { once: true });
  if (document.documentElement.dataset.theme === "lights-out") api.setLightsOut(true);
  document.addEventListener("theme:change", ((e: CustomEvent) => api.setLightsOut(e.detail.lightsOut)) as EventListener);
  host.classList.add("has-gl");
  if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__head = { group, m, spot }; // dev-only handle for QA
  return api;
}
