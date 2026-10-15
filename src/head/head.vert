// Displaced photo mesh: radial face mask × (0.55 + 0.45 × brightness) pushed along z, with a faint ripple down the face.
uniform sampler2D uTex;
uniform float uDepth;
uniform float uReveal;
uniform float uTime;
uniform vec2 uFace;
uniform vec2 uSpot;
varying vec2 vUv;
varying float vLit;
varying float vLum;

float luma(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

float faceMask(vec2 uv) {
  vec2 d = (uv - uFace) * vec2(1.0, 0.85);
  return smoothstep(0.52, 0.12, length(d));
}

void main() {
  vUv = uv;
  vec3 c = texture2D(uTex, uv).rgb;
  float m = faceMask(uv);
  float l = luma(c);
  float depth = m * (0.55 + 0.45 * l);
  depth += sin(uv.y * 22.0 - uTime * 1.6) * 0.02 * m;
  vec3 p = position;
  p.z += depth * uDepth * uReveal;
  vLum = l;
  vLit = smoothstep(0.34, 0.0, distance(uv, uSpot));
#ifdef IS_POINTS
  gl_PointSize = uPointSize * (0.5 + l * 0.8 + vLit * 0.9);
#endif
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
