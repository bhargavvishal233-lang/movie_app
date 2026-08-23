import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Premium Fluid/Nebula Shader Material
const NebulaShaderMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor1: new THREE.Color('#0f172a'), // slate-900 (Dark background base)
    uColor2: new THREE.Color('#3b0764'), // purple-950
    uColor3: new THREE.Color('#020617'), // slate-950
    uHighlight: new THREE.Color('#8b5cf6'), // violet-500
    uPointer: new THREE.Vector2(0, 0),
    uResolution: new THREE.Vector2(1, 1)
  },
  // Vertex Shader
  `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform vec3 uHighlight;
    uniform vec2 uPointer;
    uniform vec2 uResolution;
    varying vec2 vUv;

    // Simplex 2D noise
    vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
    float snoise(vec2 v){
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod(i, 289.0);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      // Fix aspect ratio distortion
      vec2 st = vUv;
      st.x *= uResolution.x / uResolution.y;

      // Subtle interaction distortion from mouse
      vec2 pointerSt = vec2(uPointer.x * 0.5 + 0.5, uPointer.y * 0.5 + 0.5);
      pointerSt.x *= uResolution.x / uResolution.y;
      float pointerDist = distance(st, pointerSt);
      st -= normalize(st - pointerSt) * smoothstep(0.8, 0.0, pointerDist) * 0.1 * sin(uTime);

      // Multi-octave noise flow for the "nebula" fluid effect
      float n1 = snoise(st * 2.0 + uTime * 0.05);
      float n2 = snoise(st * 4.0 - uTime * 0.08 + n1 * 1.5);
      float n3 = snoise(st * 6.0 + uTime * 0.12 + n2 * 1.5);
      
      // Mix base colors based on noise patterns
      vec3 color = mix(uColor1, uColor2, n1 * 0.5 + 0.5);
      color = mix(color, uColor3, n2 * 0.5 + 0.5);
      
      // Add neon highlights on noise ridges
      float ridge = abs(n3); // creates sharp lines at 0 crossings
      color += uHighlight * (1.0 - smoothstep(0.0, 0.1, ridge)) * 0.15;

      // Add starry dust speckles
      float dust = snoise(st * 40.0 + uTime * 0.2);
      dust = smoothstep(0.8, 1.0, dust);
      color += vec3(1.0, 0.9, 0.8) * dust * 0.4;

      // Vignette to fade out edges smoothly
      float vignette = smoothstep(0.9, 0.3, distance(vUv, vec2(0.5)));

      gl_FragColor = vec4(color * vignette, 1.0);
    }
  `
);

extend({ NebulaShaderMaterial });

function ShaderBackground({ isHovered, hoveredCardPos }) {
  const materialRef = useRef();
  const { viewport, size } = useThree();

  useFrame((state, delta) => {
    if (materialRef.current) {
      // Advance time for fluid animation
      materialRef.current.uTime += delta * 0.4;
      
      // Update viewport resolution for correct aspect ratio in shader
      materialRef.current.uResolution.set(size.width, size.height);
      
      // Follow mouse pointer with slight easing
      materialRef.current.uPointer.x = THREE.MathUtils.lerp(
        materialRef.current.uPointer.x, 
        state.pointer.x, 
        0.05
      );
      materialRef.current.uPointer.y = THREE.MathUtils.lerp(
        materialRef.current.uPointer.y, 
        state.pointer.y, 
        0.05
      );
      
      // If a card is hovered, attract the highlight to it slightly
      if (isHovered && hoveredCardPos) {
         const targetX = (hoveredCardPos.x / window.innerWidth) * 2 - 1;
         const targetY = -(hoveredCardPos.y / window.innerHeight) * 2 + 1;
         materialRef.current.uPointer.x = THREE.MathUtils.lerp(materialRef.current.uPointer.x, targetX, 0.1);
         materialRef.current.uPointer.y = THREE.MathUtils.lerp(materialRef.current.uPointer.y, targetY, 0.1);
         
         // Intensify the highlight color smoothly when hovering
         materialRef.current.uHighlight.lerp(new THREE.Color('#ec4899'), 0.05); // switch to pink
      } else {
         materialRef.current.uHighlight.lerp(new THREE.Color('#8b5cf6'), 0.05); // back to violet
      }
    }
  });

  return (
    <mesh>
      {/* Plane covering the entire viewport */}
      <planeGeometry args={[viewport.width, viewport.height]} />
      <nebulaShaderMaterial ref={materialRef} transparent opacity={1} depthWrite={false} />
    </mesh>
  );
}

export default function NebulaParticles3D({ hoveredCardPos, isHovered }) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020617]">
      {/* R3F WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 0, 1], fov: 90 }}
        gl={{ alpha: false, antialias: false, powerPreference: 'high-performance' }}
        className="w-full h-full opacity-80 mix-blend-screen"
      >
        <ShaderBackground hoveredCardPos={hoveredCardPos} isHovered={isHovered} />
      </Canvas>

      {/* Top & Bottom Gradient Masking to guarantee high UI text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617] pointer-events-none opacity-90" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#020617]/50 to-[#020617] pointer-events-none" />
    </div>
  );
}
