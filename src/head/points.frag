// Lights-out particles: ink dots, bigger and accent-coloured under the flashlight that follows the cursor.
uniform float uOpacity;
uniform float uReveal;
uniform vec3 uInk;
uniform vec3 uAccent;
varying vec2 vUv;
varying float vLit;
varying float vLum;

void main() {
  vec2 q = gl_PointCoord - 0.5;
  float r = length(q);
  if (r > 0.5) discard;
  float edge = smoothstep(0.5, 0.34, length(vUv - 0.5));
  vec3 col = mix(uInk, uAccent, smoothstep(0.15, 0.7, vLit));
  float a = (0.3 + 0.6 * vLit) * smoothstep(0.5, 0.3, r) * edge * uOpacity * clamp(uReveal * 2.0, 0.0, 1.0);
  gl_FragColor = vec4(col, a);
}
