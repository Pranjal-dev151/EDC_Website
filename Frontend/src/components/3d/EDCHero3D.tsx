import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useReducedMotion } from './useReducedMotion';
import { useVisibilityPause } from './useVisibilityPause';

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Shared mutable refs for interactivity — updated via document listeners
const pointerRef = { x: 0, y: 0 };
const hoverRef = { current: false };
const pressedRef = { current: false };
const dragDeltaRef = { current: 0 };

function Scene({
  scrollProgress,
  paused,
}: {
  scrollProgress: number;
  paused: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const sphereRef = useRef<THREE.Mesh>(null);
  const wireRefs = useRef<THREE.Mesh[]>([]);
  const elapsedRef = useRef(0);
  const reduced = useReducedMotion();

  const sphereGeo = useMemo(() => new THREE.SphereGeometry(0.9, 32, 32), []);
  const shellGeo = useMemo(() => new THREE.SphereGeometry(1.05, 16, 16), []);
  const icoGeo = useMemo(() => new THREE.IcosahedronGeometry(0.38, 0), []);
  const octaGeo = useMemo(() => new THREE.OctahedronGeometry(0.46, 0), []);
  const ico2Geo = useMemo(() => new THREE.IcosahedronGeometry(0.32, 0), []);

  useEffect(() => {
    return () => {
      sphereGeo.dispose();
      shellGeo.dispose();
      icoGeo.dispose();
      octaGeo.dispose();
      ico2Geo.dispose();
    };
  }, [sphereGeo, shellGeo, icoGeo, octaGeo, ico2Geo]);

  const orbiters = useMemo(
    () => [
      { geo: icoGeo, baseRadius: 2.5, orbitSpeed: 0.22, selfSpeed: 0.5, yOffset: 0.2 },
      { geo: octaGeo, baseRadius: 3.2, orbitSpeed: 0.16, selfSpeed: -0.38, yOffset: -0.35 },
      { geo: ico2Geo, baseRadius: 4.0, orbitSpeed: 0.11, selfSpeed: 0.28, yOffset: 0.45 },
    ],
    [icoGeo, octaGeo, ico2Geo],
  );

  // Pulse state for click
  const pulseRef = useRef(0);
  const tiltRef = useRef(0);

  useFrame((_, delta) => {
    if (paused) return;
    const d = Math.min(delta, 0.05);
    elapsedRef.current += d;
    const t = elapsedRef.current;

    // Disable click/drag while scrolling
    const allowInteract = scrollProgress <= 0.05;
    const hover = hoverRef.current && allowInteract;
    const pressed = pressedRef.current && allowInteract;

    // Smooth hover lerp values
    const hoverLerp = hover ? 0.08 : 0.06;
    const targetHover = hover ? 1 : 0;
    // use refs for smooth interpolation
    (Scene as unknown as { _hoverT?: number })._hoverT = lerp(
      (Scene as unknown as { _hoverT?: number })._hoverT ?? 0,
      targetHover,
      hoverLerp,
    );
    const ht = (Scene as unknown as { _hoverT?: number })._hoverT ?? 0;

    // Pulse decay
    if (pressed) {
      pulseRef.current = lerp(pulseRef.current, 0.15, 0.2);
      tiltRef.current = lerp(tiltRef.current, 15 * (Math.PI / 180), 0.15);
    } else {
      pulseRef.current = lerp(pulseRef.current, 0, 0.08);
      tiltRef.current = lerp(tiltRef.current, 0, 0.08);
    }

    if (groupRef.current) {
      if (!reduced) {
        // Document pointer tracking — does not lose focus on header/social rail
        const px = pointerRef.x;
        const py = pointerRef.y;
        // Base drag sensitivity 2x when pressed
        const sensitivity = pressed ? 0.6 : 0.3;
        const dragInfluence = dragDeltaRef.current * (pressed ? 0.02 : 0);
        const targetY = px * sensitivity + dragInfluence;
        const targetX = -py * 0.15;
        groupRef.current.rotation.y += (targetY - groupRef.current.rotation.y) * 0.05;
        groupRef.current.rotation.x += (targetX - groupRef.current.rotation.x) * 0.05;
        // Tilt orbit plane when pressed
        groupRef.current.rotation.z = lerp(groupRef.current.rotation.z, tiltRef.current * 0.5, 0.08);
      } else {
        groupRef.current.rotation.y += d * 0.12;
      }
    }

    if (sphereRef.current) {
      const mat = sphereRef.current.material as THREE.MeshStandardMaterial;
      // Hover emissive 0.9 → 1.15
      const targetEmissive = 0.9 + ht * 0.25 + (pressed ? 0.1 : 0);
      mat.emissiveIntensity = lerp(mat.emissiveIntensity, targetEmissive, 0.08);
      mat.emissiveIntensity = lerp(0.6 + scrollProgress * 0.6, mat.emissiveIntensity, 0.3);
      sphereRef.current.rotation.y += d * 0.06;
      // Pulse scale on click
      const s = 1 + pulseRef.current;
      sphereRef.current.scale.set(s, s, s);
      // Warmer red on click
      if (pressed) {
        mat.color.lerp(new THREE.Color('#ff4d4d'), 0.08);
      } else {
        mat.color.lerp(new THREE.Color('#2a0a0a'), 0.06);
      }
    }

    const radiusFactor = lerp(1.0, 1.6, scrollProgress);
    const extraOpacity = lerp(0, 0.3, scrollProgress);
    const hoverRadiusBoost = 1 + ht * 0.08; // 2.5→2.7

    wireRefs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const cfg = orbiters[i];
      if (!cfg) return;
      const hoverSpeed = ht * 0.4 + 1; // ×1.4 on hover
      const r = cfg.baseRadius * radiusFactor * hoverRadiusBoost;
      const angle = t * cfg.orbitSpeed * hoverSpeed + i * 1.9;
      mesh.position.x = Math.cos(angle) * r;
      mesh.position.z = Math.sin(angle) * r * 0.9;
      mesh.position.y = cfg.yOffset + Math.sin(t * 0.4 + i) * 0.15;
      mesh.rotation.x += d * cfg.selfSpeed * hoverSpeed;
      mesh.rotation.y += d * cfg.selfSpeed * 0.7 * hoverSpeed;
      mesh.rotation.z += d * cfg.selfSpeed * 0.35;
      // Tilt orbit plane on click
      mesh.rotation.z += tiltRef.current * 0.02;

      const mat = mesh.material as THREE.MeshStandardMaterial;
      mat.opacity = 0.25 + extraOpacity * 0.5;
      if (pressed) {
        mat.color.lerp(new THREE.Color('#ff6b6b'), 0.08);
      } else {
        mat.color.lerp(new THREE.Color('#ffffff'), 0.06);
      }
    });
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <mesh ref={sphereRef} geometry={sphereGeo}>
        <meshStandardMaterial color="#2a0a0a" emissive="#e63946" emissiveIntensity={0.9} roughness={0.38} metalness={0.08} />
      </mesh>
      <mesh geometry={shellGeo}>
        <meshStandardMaterial color="#e63946" wireframe transparent opacity={0.08} emissive="#e63946" emissiveIntensity={0.2} />
      </mesh>
      {orbiters.map((cfg, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) wireRefs.current[i] = el;
          }}
          geometry={cfg.geo}
        >
          <meshStandardMaterial color="#ffffff" wireframe transparent opacity={0.25} />
        </mesh>
      ))}
    </group>
  );
}

export default function EDCHero3D({ scrollProgress = 0 }: { scrollProgress?: number }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const visible = useVisibilityPause(wrapperRef);
  const paused = reduced || !visible;
  const [contextLost, setContextLost] = useState(false);
  const glRef = useRef<THREE.WebGLRenderer | null>(null);

  // Document pointer tracking — does not lose focus on header/social rail
  useEffect(() => {
    if (reduced) return;
    const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isDesktop) return;
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      pointerRef.x = x;
      pointerRef.y = y;
    };
    document.addEventListener('pointermove', onMove, { passive: true });
    return () => document.removeEventListener('pointermove', onMove);
  }, [reduced]);

  // Hover / click / drag on hero container (React DOM, not R3F)
  useEffect(() => {
    const hero = document.querySelector<HTMLElement>('[data-header-region]');
    if (!hero) return;
    const onEnter = () => {
      if (scrollProgress > 0.05) return;
      hoverRef.current = true;
    };
    const onLeave = () => {
      hoverRef.current = false;
      pressedRef.current = false;
      dragDeltaRef.current = 0;
    };
    let startX = 0;
    const onDown = (e: PointerEvent) => {
      if (scrollProgress > 0.05) return;
      pressedRef.current = true;
      startX = e.clientX;
      (hero as HTMLElement).setPointerCapture?.(e.pointerId);
    };
    const onUp = () => {
      pressedRef.current = false;
      // smooth return handled in useFrame lerp
      setTimeout(() => (dragDeltaRef.current = 0), 600);
    };
    const onDragMove = (e: PointerEvent) => {
      if (!pressedRef.current || scrollProgress > 0.05) return;
      dragDeltaRef.current = e.clientX - startX;
    };
    hero.addEventListener('pointerenter', onEnter);
    hero.addEventListener('pointerleave', onLeave);
    hero.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    hero.addEventListener('pointermove', onDragMove);
    return () => {
      hero.removeEventListener('pointerenter', onEnter);
      hero.removeEventListener('pointerleave', onLeave);
      hero.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      hero.removeEventListener('pointermove', onDragMove);
    };
  }, [scrollProgress]);

  useEffect(() => {
    const renderer = glRef.current;
    if (!renderer) return;
    const canvas = renderer.domElement as HTMLCanvasElement;
    const onLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onRestored = () => setContextLost(false);
    canvas.addEventListener('webglcontextlost', onLost as EventListener, false);
    canvas.addEventListener('webglcontextrestored', onRestored as EventListener, false);
    return () => {
      canvas.removeEventListener('webglcontextlost', onLost as EventListener);
      canvas.removeEventListener('webglcontextrestored', onRestored as EventListener);
    };
  }, []);

  if (contextLost) {
    return (
      <div
        ref={wrapperRef}
        aria-hidden="true"
        style={{ inlineSize: '100%', blockSize: '100%', minBlockSize: 320, width: '100%', height: '100%', background: 'radial-gradient(60% 60% at 50% 50%, rgb(230 57 70 / 12%), transparent 70%)' }}
      />
    );
  }

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      style={{ inlineSize: '100%', blockSize: '100%', minBlockSize: 320, width: '100%', height: '100%' }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 7.5], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ width: '100%', height: '100%', display: 'block' }}
        frameloop={paused ? 'never' : 'always'}
        resize={{ scroll: false, offsetSize: true }}
        onCreated={({ gl, camera }) => {
          glRef.current = gl as unknown as THREE.WebGLRenderer;
          camera.lookAt(0, 0, 0);
          (camera as THREE.PerspectiveCamera).updateProjectionMatrix?.();
          const canvas = gl.domElement as HTMLCanvasElement;
          // eslint-disable-next-line no-console
          console.log('canvas mounted at', Date.now());
          // eslint-disable-next-line no-console
          console.log('canvas size:', canvas.width, canvas.height, 'client:', canvas.clientWidth, canvas.clientHeight);
          const onLost = (e: Event) => {
            e.preventDefault();
            setContextLost(true);
          };
          const onRestored = () => setContextLost(false);
          canvas.removeEventListener('webglcontextlost', onLost as EventListener);
          canvas.removeEventListener('webglcontextrestored', onRestored as EventListener);
          canvas.addEventListener('webglcontextlost', onLost as EventListener, false);
          canvas.addEventListener('webglcontextrestored', onRestored as EventListener, false);
        }}
      >
        <ambientLight intensity={0.85} />
        <directionalLight position={[4, 6, 4]} intensity={1.1} />
        <directionalLight position={[-3, -2, -3]} intensity={0.32} />
        <pointLight position={[0, 2.2, 3]} intensity={1.0} color="#ff8a94" />
        <Scene scrollProgress={scrollProgress} paused={paused} />
      </Canvas>
    </div>
  );
}
