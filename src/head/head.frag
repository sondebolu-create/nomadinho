// Duotone (near-black → bone, 35% original colour), scanlines, animated grain, cursor spotlight with a hint of accent. Edges fade out.
uniform sampler2D uTex;
uniform float uTime;
uniform float uOpacity;
uniform float uReveal;
uniform vec2 uSpot;
uniform vec3 uBone;
uniform vec3 uDark;
uniform vec3 uAccent;
varying vec2 vUv;
varying float vLit;
varying float vLum;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
  vec3 c = texture2D(uTex, vUv).rgb;
  vec3 duo = mix(uDark, uBone, smoothstep(0.05, 0.95, vLum));
  vec3 col = mix(duo, c, 0.35);

  float d = distance(vUv, uSpot);
  col *= 0.5 + 1.0 * smoothstep(0.5, 0.0, d);
  col += uAccent * smoothstep(0.14, 0.0, d) * 0.2;

  col *= 0.94 + 0.06 * sin(gl_FragCoord.y * 1.6);
  col += (hash(vUv * 900.0 + uTime) - 0.5) * 0.07;

  float edge = smoothstep(0.5, 0.34, length(vUv - 0.5));
  float a = edge * uOpacity * clamp(uReveal * 2.0, 0.0, 1.0);
  gl_FragColor = vec4(col, a);
}
