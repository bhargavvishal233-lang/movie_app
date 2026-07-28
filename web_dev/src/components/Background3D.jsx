import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Background3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. Particle Cloud (Starfield / Dust)
    const particleCount = 700;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const redColor = new THREE.Color('#ef4444');
    const roseColor = new THREE.Color('#f43f5e');
    const blueColor = new THREE.Color('#3b82f6');
    const darkColor = new THREE.Color('#64748b');

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 120;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120;

      // Color variation (mix red accents with dark blue/gray ambient stars)
      const rand = Math.random();
      let chosenColor = darkColor;
      if (rand > 0.85) chosenColor = redColor;
      else if (rand > 0.7) chosenColor = roseColor;
      else if (rand > 0.5) chosenColor = blueColor;

      colors[i * 3] = chosenColor.r;
      colors[i * 3 + 1] = chosenColor.g;
      colors[i * 3 + 2] = chosenColor.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Custom Canvas Texture for glowing circular particles
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.4, 'rgba(239, 68, 68, 0.8)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const particleTexture = new THREE.CanvasTexture(canvas);

    const material = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 2. Floating 3D Geometric Nodes (Cinematic Orbs)
    const orbGroup = new THREE.Group();
    const orbGeom = new THREE.IcosahedronGeometry(2, 1);
    
    for (let i = 0; i < 8; i++) {
      const orbMat = new THREE.MeshBasicMaterial({
        color: i % 2 === 0 ? 0xef4444 : 0x3b82f6,
        wireframe: true,
        transparent: true,
        opacity: 0.25,
      });
      const mesh = new THREE.Mesh(orbGeom, orbMat);
      mesh.position.set(
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 40
      );
      mesh.scale.setScalar(Math.random() * 1.5 + 0.8);
      orbGroup.add(mesh);
    }
    scene.add(orbGroup);

    // Mouse interactive sway
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Resize Listener
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Continuous 3D rotation
      particles.rotation.y = elapsedTime * 0.04;
      particles.rotation.x = elapsedTime * 0.02;

      orbGroup.children.forEach((orb, idx) => {
        orb.rotation.x += 0.005 * (idx % 2 === 0 ? 1 : -1);
        orb.rotation.y += 0.008;
        orb.position.y += Math.sin(elapsedTime + idx) * 0.02;
      });

      // Smooth camera sway follow mouse
      camera.position.x += (mouseX * 4 - camera.position.x) * 0.03;
      camera.position.y += (-mouseY * 4 - camera.position.y) * 0.03;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      particleTexture.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      
      {/* 1. Ambient 3D Motion Video Loop Layer */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen filter brightness-125 contrast-125"
      >
        <source
          src="https://assets.mixkit.co/videos/preview/mixkit-tunnel-of-futuristic-neon-lights-41564-large.mp4"
          type="video/mp4"
        />
      </video>

      {/* 2. Interactive Three.js 3D Canvas Layer */}
      <div ref={mountRef} className="absolute inset-0" />

      {/* 3. Radial Gradient Backdrop Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-slate-950/40 to-slate-950" />
    </div>
  );
}
