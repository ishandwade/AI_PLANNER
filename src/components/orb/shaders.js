export const vertexShader = `
uniform float uTime;
uniform float uPulse;

varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vUv = uv;
  vPosition = position;

  // Add some breathing/pulsing animation
  vec3 pos = position;
  float pulseOffset = sin(uTime * 2.0 + pos.x * 5.0) * 0.1 * uPulse;
  pos += normal * pulseOffset;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

// Helper to convert HSL to RGB inside shader, useful if we want continuous shift, 
// but we will mainly pass the color via uniform for cyan/purple/pink
export const fragmentShader = `
uniform float uTime;
uniform float uPulse;
uniform vec3 uColor;

varying vec2 vUv;
varying vec3 vPosition;

// Cellular noise functions or simple sine waves for pattern
float pattern(vec2 uv) {
  return sin(uv.x * 10.0 + uTime) * sin(uv.y * 10.0 + uTime);
}

void main() {
  // Base alpha depends on distance from center for a glowing effect
  // But wait, this is a meshed sphere. Let's make it look like energy.
  
  float p = pattern(vUv);
  
  // Calculate a nice glowing edge based on normal/view (Fresnel effect roughly)
  // Instead, since we don't have normals here easily without recalculating, 
  // we use position as a cheap trick or just use generic glow.
  
  float energy = abs(sin(vPosition.y * 5.0 + uTime * 3.0));
  energy += abs(sin(vPosition.z * 5.0 + uTime * 2.0));
  energy += abs(sin(vPosition.x * 5.0 + uTime * 1.5));
  
  // Mix base color with white for high energy areas
  vec3 finalColor = mix(uColor * 0.5, uColor + vec3(0.5), energy * 0.3 * (1.0 + uPulse * 2.0));
  
  // Alpha intensity
  float alpha = clamp(energy * 0.4 + uPulse * 0.5, 0.1, 0.9);

  gl_FragColor = vec4(finalColor, alpha);
}
`;
