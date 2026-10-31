import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function CyberCanvas3D({ isListening = false, isSpeaking = false }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050811, 0.015);

    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 24;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent background
    container.appendChild(renderer.domElement);

    // 2. Central 3D Cyber Neural Core (Icosahedron Wireframe + Inner Glow Sphere)
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Inner Glowing Icosahedron
    const coreGeo = new THREE.IcosahedronGeometry(4.2, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      wireframe: true,
      transparent: true,
      opacity: 0.65
    });
    const coreMesh = new THREE.Mesh(coreGeo, wireMat);
    coreGroup.add(coreMesh);

    // Inner Solid Sphere (Emissive)
    const innerGeo = new THREE.SphereGeometry(2.4, 24, 24);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xff007f,
      wireframe: true,
      transparent: true,
      opacity: 0.35
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerMesh);

    // 3. Orbital Cyber Rings
    const ringGeo1 = new THREE.TorusGeometry(6.8, 0.06, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.75
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    coreGroup.add(ring1);

    const ringGeo2 = new THREE.TorusGeometry(7.6, 0.04, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0xffe600,
      transparent: true,
      opacity: 0.55
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.y = Math.PI / 4;
    coreGroup.add(ring2);

    // 4. Cyber Starfield / Particle Data Cloud
    const particleCount = 450;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const cyan = new THREE.Color(0x00f2fe);
    const pink = new THREE.Color(0xff007f);
    const yellow = new THREE.Color(0xffe600);

    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 65;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 45;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 5;

      const mixed = i % 3 === 0 ? cyan : i % 3 === 1 ? pink : yellow;
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      opacity: 0.8
    });
    const particleField = new THREE.Points(particleGeo, particleMat);
    scene.add(particleField);

    // 5. Mouse Parallax Reaction
    let targetX = 0;
    let targetY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth - 0.5) * 2;
      mouseY = -(event.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // 6. Animation Loop
    let animationId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera parallax
      targetX += (mouseX * 4 - targetX) * 0.05;
      targetY += (mouseY * 3 - targetY) * 0.05;
      camera.position.x = targetX;
      camera.position.y = targetY;
      camera.lookAt(scene.position);

      // Core rotation
      const speedMult = isSpeaking ? 2.5 : isListening ? 2.0 : 1.0;
      coreMesh.rotation.x = elapsedTime * 0.25 * speedMult;
      coreMesh.rotation.y = elapsedTime * 0.35 * speedMult;
      innerMesh.rotation.x = -elapsedTime * 0.4 * speedMult;
      innerMesh.rotation.z = elapsedTime * 0.3 * speedMult;

      ring1.rotation.z = elapsedTime * 0.4 * speedMult;
      ring2.rotation.x = -elapsedTime * 0.35 * speedMult;

      // Pulse scaling when listening / speaking
      let scale = 1.0;
      if (isSpeaking) {
        scale = 1.0 + Math.sin(elapsedTime * 8) * 0.15;
        wireMat.color.setHex(0xff007f);
      } else if (isListening) {
        scale = 1.0 + Math.sin(elapsedTime * 12) * 0.2;
        wireMat.color.setHex(0xffe600);
      } else {
        scale = 1.0 + Math.sin(elapsedTime * 1.5) * 0.04;
        wireMat.color.setHex(0x00f2fe);
      }
      coreGroup.scale.set(scale, scale, scale);

      // Particle drift
      particleField.rotation.y = elapsedTime * 0.03;
      particleField.rotation.x = Math.sin(elapsedTime * 0.05) * 0.05;

      renderer.render(scene, camera);
    };
    animate();

    // Resize handling
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [isListening, isSpeaking]);

  return (
    <div
      ref={mountRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.85
      }}
    />
  );
}
