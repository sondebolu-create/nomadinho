// Lights-out particles: a halftone of the portrait. Shadows become ink dots, highlights drop out,
// and the cursor flashlight tints nearby dots with the accent colour.
uniform float uOpacity;
uniform float uReveal;
uniform vec3 uInk;
uniform vec3 uAccent;
varying vec2 vUv;
varying float vLit;
varying float vLum;
varying float vDark;
varying float vMask;

void main() {
  vec2 q = gl_PointCoord - 0.5;
  float r = length(q);
  if (r > 0.5) discard;
  float edge = smoothstep(0.5, 0.36, length(vUv - 0.5));
  float tint = smoothstep(0.15, 0.8, vLit);
  // under the flashlight dots turn orange but shadows stay deep, so the face is still drawn
  vec3 lit = uAccent * (0.5 + 0.5 * (1.0 - vDark));
  vec3 col = mix(uInk, lit, tint);
  float body = 0.1 + 0.9 * vDark;                 // shadows read strongest
  float focus = 0.3 + 0.7 * vMask;                // the face carries the picture, the wall recedes
  float a = clamp(body * focus + 0.12 * vLit * vMask, 0.0, 1.0) * smoothstep(0.5, 0.28, r) * edge * uOpacity * clamp(uReveal * 2.0, 0.0, 1.0);
  gl_FragColor = vec4(col, a);
}
