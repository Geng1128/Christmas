// shaders.ts

export const foliageVertexShader = `
  uniform float uTime;
  uniform float uMix;
  attribute vec3 aChaosPos;
  attribute vec3 aTargetPos;
  attribute float aSize;
  attribute float aRandom;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 pos = mix(aChaosPos, aTargetPos, uMix);
    float windStrength = 1.0 - smoothstep(0.8, 1.2, uMix);
    float wind = sin(uTime * 2.0 + pos.y * 0.5 + aRandom * 10.0) * 0.1 * windStrength;
    pos.x += wind;
    pos.z += wind;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aSize * (350.0 / -mvPosition.z);
    
    vec3 emerald = vec3(0.0, 0.26, 0.15);
    vec3 gold = vec3(1.0, 0.84, 0.0);
    float heightFactor = smoothstep(-10.0, 10.0, aTargetPos.y);
    float sparkle = step(0.95, sin(uTime * 3.0 + aRandom * 100.0));
    vColor = mix(emerald, gold, heightFactor * 0.3 + sparkle * 0.5);
    vAlpha = 0.8 + sparkle * 0.2;
  }
`;

export const foliageFragmentShader = `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 xy = gl_PointCoord.xy - vec2(0.5);
    float ll = length(xy);
    if (ll > 0.5) discard;
    float alpha = smoothstep(0.5, 0.3, ll) * vAlpha;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

export const backgroundVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const backgroundFragmentShader = `
  uniform float uTime;
  varying vec2 vUv;
  
  float random (in vec2 _st) {
    return fract(sin(dot(_st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  float noise (in vec2 _st) {
    vec2 i = floor(_st);
    vec2 f = fract(_st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm ( in vec2 _st) {
    float v = 0.0;
    float a = 0.5;
    vec2 shift = vec2(100.0);
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.50));
    for (int i = 0; i < 5; ++i) {
        v += a * noise(_st);
        _st = rot * _st * 2.0 + shift;
        a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 st = vUv * 3.0;
    float q = fbm(st + vec2(0.0, uTime * 0.05));
    float r = fbm(st + vec2(q, uTime * 0.1));
    
    vec3 color = mix(vec3(0.0, 0.05, 0.02), vec3(0.0, 0.0, 0.0), length(vUv - 0.5) * 1.5);
    vec3 gold = vec3(0.8, 0.6, 0.2);
    vec3 emerald = vec3(0.0, 0.4, 0.2);
    
    float aurora = fbm(st + r);
    color += mix(emerald, gold, r) * aurora * 0.3 * (1.0 - length(vUv - 0.5)); 
    
    float star = step(0.995, random(vUv + uTime * 0.001));
    color += vec3(1.0) * star * (0.5 + 0.5 * sin(uTime * 5.0 + vUv.x * 100.0));

    gl_FragColor = vec4(color, 1.0);
  }
`;