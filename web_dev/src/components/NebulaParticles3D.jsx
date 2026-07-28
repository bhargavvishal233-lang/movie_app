import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function ParticleField({ hoveredCardPos, isHovered }) {
  const pointsRef = useRef();
  const haloRef = useRef();
  const count = 4000;

  // Generate particle positions, colors, sizes, and initial velocities
  const [positions, colors, sizes, originalPositions] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const origPos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);

    // Color palette: Cyan-400 (#22d3ee), Purple-500 (#a855f7), Blue-600 (#2563eb), Red accent (#ef4444)
    const cyan = new THREE.Color('#22d3ee');
    const purple = new THREE.Color('#a855f7');
    const blue = new THREE.Color('#2563eb');
    const red = new THREE.Color('#ef4444');

    for (let i = 0; i < count; i++) {
      // Spread across 3D space
      const x = (Math.random() - 0.5) * 140;
      const y = (Math.random() - 0.5) * 140;
      const z = (Math.random() - 0.5) * 100;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      origPos[i * 3] = x;
      origPos[i * 3 + 1] = y;
      origPos[i * 3 + 2] = z;

      // Color assignment
      const rand = Math.random();
      let chosenColor = blue;
      if (rand > 0.75) chosenColor = cyan;
      else if (rand > 0.45) chosenColor = purple;
      else if (rand > 0.3) chosenColor = red;

      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;

      // Depth sizing: closer particles (larger Z) appear larger and bokeh-like
      const depthFactor = (z + 50) / 100; // 0 to 1
      sz[i] = THREE.MathUtils.lerp(0.8, 3.5, depthFactor * Math.random());
    }

    return [pos, col, sz, origPos];
  }, [count]);

  // Create Circular Soft Bokeh Particle Texture
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.3, 'rgba(34, 211, 238, 0.8)');
    grad.addColorStop(0.7, 'rgba(168, 85, 247, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }, []);

  // Frame Animation Loop: Mouse Rotation & Edge-to-Center Inward Motion Flow
  useFrame((state, delta) => {
    if (!pointsRef.current) return;

    const { pointer, clock } = state;
    const time = clock.getElapsedTime();

    // 1. Mouse rotation & tilt smoothly lerped
    pointsRef.current.rotation.x = THREE.MathUtils.lerp(
      pointsRef.current.rotation.x,
      -pointer.y * 0.2,
      0.05
    );
    pointsRef.current.rotation.y = THREE.MathUtils.lerp(
      pointsRef.current.rotation.y,
      pointer.x * 0.25,
      0.05
    );

    // Continuous ambient slow swirl
    pointsRef.current.rotation.z = time * 0.015;

    // 2. Inward flow of particles from edges towards screen center
    const positionsAttr = pointsRef.current.geometry.attributes.position;
    const array = positionsAttr.array;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      // Inward pull toward center
      array[idx] -= array[idx] * 0.0008;
      array[idx + 1] -= array[idx + 1] * 0.0008;

      // Reset particles if they reach close to center
      if (Math.abs(array[idx]) < 2 && Math.abs(array[idx + 1]) < 2) {
        array[idx] = originalPositions[idx];
        array[idx + 1] = originalPositions[idx + 1];
        array[idx + 2] = originalPositions[idx + 2];
      }
    }
    positionsAttr.needsUpdate = true;

    // 3. Card Hover Halo Aura Animation
    if (haloRef.current) {
      if (isHovered && hoveredCardPos) {
        // Position halo behind hovered card
        const targetX = (hoveredCardPos.x / window.innerWidth - 0.5) * 40;
        const targetY = -(hoveredCardPos.y / window.innerHeight - 0.5) * 40;

        haloRef.current.position.x = THREE.MathUtils.lerp(haloRef.current.position.x, targetX, 0.1);
        haloRef.current.position.y = THREE.MathUtils.lerp(haloRef.current.position.y, targetY, 0.1);
        haloRef.current.scale.x = THREE.MathUtils.lerp(haloRef.current.scale.x, 2.5, 0.1);
        haloRef.current.scale.y = THREE.MathUtils.lerp(haloRef.current.scale.y, 2.5, 0.1);
        haloRef.current.material.opacity = THREE.MathUtils.lerp(haloRef.current.material.opacity, 0.8, 0.1);
      } else {
        haloRef.current.scale.x = THREE.MathUtils.lerp(haloRef.current.scale.x, 0.1, 0.1);
        haloRef.current.scale.y = THREE.MathUtils.lerp(haloRef.current.scale.y, 0.1, 0.1);
        haloRef.current.material.opacity = THREE.MathUtils.lerp(haloRef.current.material.opacity, 0, 0.1);
      }
    }
  });

  return (
    <>
      {/* Main Nebulous Particle Cloud */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={count}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={count}
            array={colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={count}
            array={sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={1.6}
          map={particleTexture}
          vertexColors
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* Dynamic Hover Card Halo Effect */}
      <mesh ref={haloRef} position={[0, 0, -10]}>
        <planeGeometry args={[12, 16]} />
        <meshBasicMaterial
          map={particleTexture}
          color="#ef4444"
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}

export default function NebulaParticles3D({ hoveredCardPos, isHovered }) {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* R3F WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 0, 45], fov: 60 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        className="w-full h-full"
      >
        <ParticleField hoveredCardPos={hoveredCardPos} isHovered={isHovered} />
      </Canvas>

      {/* Top & Bottom Gradient Masking to guarantee high UI text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950 pointer-events-none opacity-90" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-950/50 to-slate-950 pointer-events-none" />
    </div>
  );
}
