import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Sparkles, Float } from '@react-three/drei';

function InteractiveScene() {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.rotation.x += delta * 0.03;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Deep space stars */}
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0.5} fade speed={1.5} />
      
      {/* Floating glowing orbs */}
      <Float speed={2} rotationIntensity={1} floatIntensity={2}>
        <Sparkles count={400} scale={25} size={3} speed={0.4} opacity={0.6} color="#818cf8" />
      </Float>
      
      {/* Larger, slower purple orbs closer to camera */}
      <Float speed={1} rotationIntensity={2} floatIntensity={1}>
        <Sparkles count={150} scale={15} size={6} speed={0.2} opacity={0.8} color="#c084fc" />
      </Float>
    </group>
  );
}

export default function Background3D() {
  return (
    <div className="fixed inset-0 z-[-1] bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 pointer-events-none overflow-hidden">
      {/* Image Overlay */}
      <div 
        className="absolute inset-0 opacity-30 mix-blend-screen bg-no-repeat bg-center bg-cover transition-opacity duration-1000"
        style={{ backgroundImage: "url('/india_voting_bg.png')" }}
      />
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }} className="absolute inset-0 mix-blend-screen">
        <fog attach="fog" args={['#0f172a', 10, 40]} />
        <ambientLight intensity={0.5} />
        <InteractiveScene />
      </Canvas>
    </div>
  );
}
