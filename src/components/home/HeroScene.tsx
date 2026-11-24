"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { Group, Mesh } from "three";

function Floating({ position, speed = 1, rotate = 0.3, children }: { position: [number, number, number]; speed?: number; rotate?: number; children: ReactNode }) {
  const ref = useRef<Group>(null);
  const seed = useMemo(() => Math.random() * Math.PI * 2, []);
  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime() * speed + seed;
    if (!ref.current) return;
    ref.current.position.y = position[1] + Math.sin(t) * 0.18;
    ref.current.position.x = position[0] + pointer.x * 0.15 * (position[2] + 2);
    ref.current.rotation.x = Math.sin(t * 0.6) * rotate;
    ref.current.rotation.y += 0.003 * speed;
  });
  return (
    <group ref={ref} position={position}>
      {children}
    </group>
  );
}

function Petal({ color }: { color: string }) {
  const ref = useRef<Mesh>(null);
  return (
    <mesh ref={ref} scale={[0.22, 0.09, 0.34]}>
      <sphereGeometry args={[1, 24, 16]} />
      <meshStandardMaterial color={color} roughness={0.55} />
    </mesh>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[3, 4, 5]} intensity={1.6} color="#fff3dc" />
      <pointLight position={[-4, -2, 3]} intensity={12} color="#c9822b" />
      {/* Gold rings — like bangles on a bridal tray */}
      <Floating position={[1.6, 0.9, 0]} speed={0.7}>
        <mesh rotation={[1.1, 0.2, 0]}>
          <torusGeometry args={[0.62, 0.05, 24, 96]} />
          <meshStandardMaterial color="#c9a56a" metalness={0.95} roughness={0.22} />
        </mesh>
      </Floating>
      <Floating position={[2.4, -0.6, -1]} speed={0.9}>
        <mesh rotation={[0.4, 0.8, 0]}>
          <torusGeometry args={[0.38, 0.04, 20, 80]} />
          <meshStandardMaterial color="#b08d57" metalness={0.95} roughness={0.25} />
        </mesh>
      </Floating>
      {/* Jamdani diamond */}
      <Floating position={[0.7, -1.1, 0.6]} speed={0.8} rotate={0.5}>
        <mesh>
          <octahedronGeometry args={[0.36, 0]} />
          <meshStandardMaterial color="#9b2226" metalness={0.3} roughness={0.35} flatShading />
        </mesh>
      </Floating>
      {/* Marigold petals */}
      <Floating position={[2.9, 1.5, -0.5]} speed={1.1}><Petal color="#e39b2d" /></Floating>
      <Floating position={[0.3, 1.6, -0.8]} speed={1.3}><Petal color="#d9822b" /></Floating>
      <Floating position={[3.2, 0.2, 0.4]} speed={1.2}><Petal color="#f0b445" /></Floating>
      <Floating position={[1.4, -1.9, -0.6]} speed={1}><Petal color="#e39b2d" /></Floating>
      {/* Pearls */}
      <Floating position={[2.1, 0.2, 0.9]} speed={1.4}>
        <mesh>
          <sphereGeometry args={[0.11, 24, 24]} />
          <meshStandardMaterial color="#fffaf0" metalness={0.1} roughness={0.15} />
        </mesh>
      </Floating>
      <Floating position={[0.9, 0.5, 1.2]} speed={1.2}>
        <mesh>
          <sphereGeometry args={[0.07, 20, 20]} />
          <meshStandardMaterial color="#fffaf0" metalness={0.1} roughness={0.15} />
        </mesh>
      </Floating>
    </>
  );
}

/** Lightweight R3F scene: ~10 meshes, paused when offscreen, capped DPR. */
export default function HeroScene() {
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    if (!wrap.current) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.01 });
    io.observe(wrap.current);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={wrap} className="absolute inset-0" aria-hidden>
      <Canvas dpr={[1, 1.5]} frameloop={visible ? "always" : "never"} camera={{ position: [0, 0, 6], fov: 42 }} gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}>
        <Scene />
      </Canvas>
    </div>
  );
}
