/// <reference types="@react-three/fiber" />
import React, { useRef, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  OrbitControls,
  Float,
  Stars,
  Sparkles,
  MeshTransmissionMaterial,
  MeshDistortMaterial,
  Icosahedron,
  Octahedron,
  Torus,
  Sphere
} from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { RarityId, ItemData, VariantId } from '@/types';
import { RARITY_TIERS, VARIANTS, ORES } from '@/constants';

interface Props {
  item: ItemData & { rarityId: RarityId, variantId?: VariantId };
  onClose: () => void;
}

// --- 3D COMPONENTS ---

const BlackHoleModel = () => {
  const particlesCount = 1500;
  const particlesRef = useRef<THREE.Points>(null);
  const ringRef1 = useRef<THREE.Mesh>(null);
  const ringRef2 = useRef<THREE.Mesh>(null);

  // Generate spiral particles for accretion disk
  const particlePositions = useMemo(() => {
    const positions = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      // Distribute mostly in a disk, clustered near center
      const radius = 1.2 + Math.random() * 2.5 + Math.pow(Math.random(), 3) * 2;
      const y = (Math.random() - 0.5) * 0.15 * (radius * 0.5); // Flattened

      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return positions;
  }, []);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    if (particlesRef.current) {
      particlesRef.current.rotation.y = -t * 0.2;
    }
    if (ringRef1.current) {
      ringRef1.current.rotation.z = t * 0.1;
      ringRef1.current.rotation.x = Math.PI / 2 + Math.sin(t * 0.5) * 0.05;
    }
    if (ringRef2.current) {
      ringRef2.current.rotation.z = -t * 0.15;
      ringRef2.current.rotation.x = Math.PI / 2 + Math.cos(t * 0.3) * 0.05;
    }
  });

  return (
    <group>
      {/* Event Horizon (Pure Black) */}
      <Sphere args={[0.8, 64, 64]}>
        <meshBasicMaterial color="#000000" />
      </Sphere>

      {/* Gravitational Lensing Shell (Glass distortion) */}
      <Sphere args={[1.3, 32, 32]}>
        <MeshTransmissionMaterial
          backside
          backsideThickness={5}
          thickness={2}
          roughness={0}
          chromaticAberration={0.5}
          anisotropicBlur={0.1}
          distortion={1.5}
          distortionScale={0.5}
          temporalDistortion={0.1}
          background={new THREE.Color('#000')}
        />
      </Sphere>

      {/* Accretion Disk Glow Rings */}
      <group ref={ringRef1}>
        <Torus args={[1.6, 0.05, 16, 100]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.1]}>
          <meshBasicMaterial color="#ff6600" transparent opacity={0.8} toneMapped={false} />
        </Torus>
      </group>
      <group ref={ringRef2}>
        <Torus args={[2.2, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.1]}>
          <meshBasicMaterial color="#ffaa00" transparent opacity={0.4} toneMapped={false} />
        </Torus>
      </group>

      {/* Particle System */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlePositions.length / 3}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color="#00aaff"
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          sizeAttenuation={true}
          toneMapped={false}
        />
      </points>

      {/* Lighting for the scene around it */}
      <pointLight color="#ff6600" intensity={5} distance={10} />
    </group>
  );
};

const LiquidLuckModel = () => {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1}>
      <Icosahedron args={[1, 0]}>
        <MeshTransmissionMaterial
          backside
          samples={16}
          thickness={2}
          roughness={0.2}
          chromaticAberration={1}
          anisotropy={1}
          distortion={1}
          distortionScale={1}
          temporalDistortion={0.2}
          color="#ffd700"
          emissive="#ffaa00"
          emissiveIntensity={0.5}
        />
      </Icosahedron>
      <Sparkles count={20} scale={3} size={4} speed={0.4} opacity={0.5} color="#ffd700" />
    </Float>
  );
};

const SoundShardModel = () => {
  return (
    <Float speed={5} rotationIntensity={0.5} floatIntensity={0.5}>
      <mesh>
        <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
        <MeshDistortMaterial
          color="#6ee7b7"
          emissive="#10b981"
          emissiveIntensity={2}
          distort={0.6}
          speed={5}
          toneMapped={false}
        />
      </mesh>
      <Torus args={[1, 0.02, 16, 32]} rotation={[Math.PI / 2, 0, 0]}>
        <meshBasicMaterial color="#6ee7b7" transparent opacity={0.5} />
      </Torus>
    </Float>
  );
};

const HypercubeFragmentModel = () => {
  const groupRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.x = t * 0.5;
      coreRef.current.rotation.y = t * 0.8;
    }
    if (innerRef.current) {
      innerRef.current.rotation.x = t * 0.2;
      innerRef.current.rotation.z = t * 0.2;
    }
    if (outerRef.current) {
      outerRef.current.rotation.y = -t * 0.1;
      outerRef.current.rotation.z = -t * 0.1;
    }
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Core */}
      <mesh ref={coreRef}>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <meshStandardMaterial
          color="#a855f7" // Purple-ish
          emissive="#a855f7"
          emissiveIntensity={2}
          roughness={0.1}
          metalness={1}
        />
      </mesh>

      {/* Inner Wireframe */}
      <mesh ref={innerRef}>
        <boxGeometry args={[1.4, 1.4, 1.4]} />
        <meshBasicMaterial color="#d8b4fe" wireframe transparent opacity={0.5} />
      </mesh>

      {/* Outer Wireframe */}
      <mesh ref={outerRef}>
        <boxGeometry args={[2, 2, 2]} />
        <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.3} />
      </mesh>

      <Sparkles count={30} scale={4} size={2} speed={0.4} opacity={0.5} color="#a855f7" />
      <pointLight color="#a855f7" intensity={5} distance={5} />
    </group>
  );
};

const FrozenTimeModel = () => {
  return (
    <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.5}>
      {/* Core "Time" Sphere */}
      <Sphere args={[0.4, 32, 32]}>
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </Sphere>
      <pointLight color="#06b6d4" intensity={2} distance={3} />

      {/* Ice Crystal Shell */}
      <Octahedron args={[1.2, 0]}>
        <MeshTransmissionMaterial
          backside
          samples={16}
          thickness={2}
          roughness={0.1}
          chromaticAberration={0.5}
          anisotropy={0.5}
          distortion={0.5}
          distortionScale={0.5}
          temporalDistortion={0.1}
          color="#cffafe"
          emissive="#06b6d4"
          emissiveIntensity={0.2}
        />
      </Octahedron>

      {/* Slow Rings */}
      <group rotation={[Math.PI / 4, 0, 0]}>
        <Torus args={[1.8, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.4} />
        </Torus>
      </group>
      <group rotation={[-Math.PI / 4, Math.PI / 4, 0]}>
        <Torus args={[2.2, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.2} />
        </Torus>
      </group>

      {/* Suspended Particles */}
      <Sparkles count={50} scale={4} size={3} speed={0.1} opacity={0.6} color="#cffafe" />
    </Float>
  );
};

const SolarPlasmaModel = () => {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      {/* Core Sun */}
      <Sphere args={[1, 32, 32]}>
        <MeshDistortMaterial
          color="#f97316"
          emissive="#ef4444"
          emissiveIntensity={2}
          distort={0.4}
          speed={3}
          roughness={0}
        />
      </Sphere>

      {/* Corona / Glow */}
      <Sphere args={[1.2, 32, 32]}>
        <meshBasicMaterial color="#eab308" transparent opacity={0.1} side={THREE.BackSide} />
      </Sphere>

      {/* Solar Flares Particles */}
      <Sparkles count={100} scale={3} size={5} speed={0.4} opacity={0.5} color="#fbbf24" />
      <pointLight color="#f97316" intensity={10} distance={10} />
    </Float>
  );
};

const AntimatterModel = () => {
  return (
    <Float speed={5} rotationIntensity={2} floatIntensity={2}>
      {/* Unstable Core */}
      <Sphere args={[0.8, 32, 32]}>
        <MeshDistortMaterial
          color="#000000"
          emissive="#8b5cf6"
          emissiveIntensity={1.5}
          distort={0.8}
          speed={5}
          roughness={0.2}
        />
      </Sphere>

      {/* Containment Cage */}
      <group rotation={[Math.PI / 4, Math.PI / 4, 0]}>
        <Icosahedron args={[1.5, 0]}>
          <meshBasicMaterial color="#4c1d95" wireframe transparent opacity={0.3} />
        </Icosahedron>
      </group>

      {/* Chaotic Particles */}
      <Sparkles count={80} scale={4} size={2} speed={2} opacity={0.8} color="#d8b4fe" noise={1} />
      <pointLight color="#8b5cf6" intensity={5} distance={8} />
    </Float>
  );
};

const StandardOreModel = ({ color, intensity }: { color: string, intensity: number }) => {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
      <mesh>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={color}
          roughness={0.4}
          metalness={0.8}
          emissive={color}
          emissiveIntensity={0.2 + (intensity * 0.05)}
        />
      </mesh>
      {intensity > 5 && (
        <mesh scale={[1.1, 1.1, 1.1]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={color} wireframe transparent opacity={0.2} />
        </mesh>
      )}
    </Float>
  );
};

const SceneContent: React.FC<{ item: ItemData; color: string; intensity: number }> = ({ item, color, intensity }) => {
  const isBlackHole = item.text === "Black Hole Core";
  const isLiquidLuck = item.text === "Liquid Luck";
  const isSoundShard = item.text === "Sound Shard";
  const isHypercube = item.text === "Hypercube Fragment";
  const isFrozenTime = item.text === "Frozen Time";
  const isSolarPlasma = item.text === "Solar Plasma";
  const isAntimatter = item.text === "Antimatter";

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} color={color} intensity={2} />

      {isBlackHole ? (
        <BlackHoleModel />
      ) : isLiquidLuck ? (
        <LiquidLuckModel />
      ) : isSoundShard ? (
        <SoundShardModel />
      ) : isHypercube ? (
        <HypercubeFragmentModel />
      ) : isFrozenTime ? (
        <FrozenTimeModel />
      ) : isSolarPlasma ? (
        <SolarPlasmaModel />
      ) : isAntimatter ? (
        <AntimatterModel />
      ) : (
        <StandardOreModel color={color} intensity={intensity} />
      )}

      {/* Environment Effects */}
      {isBlackHole ? (
        <>
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <EffectComposer>
            <Bloom luminanceThreshold={0} mipmapBlur intensity={1.5} radius={0.6} />
            <Noise opacity={0.1} />
            <Vignette eskil={false} offset={0.1} darkness={1.1} />
          </EffectComposer>
        </>
      ) : (
        <EffectComposer>
          <Bloom luminanceThreshold={1} mipmapBlur intensity={0.5} radius={0.4} />
        </EffectComposer>
      )}

      <OrbitControls enablePan={false} autoRotate autoRotateSpeed={isBlackHole ? 0.5 : 2} />
    </>
  );
};

// --- MAIN COMPONENT ---

export const ItemVisualizer: React.FC<Props> = ({ item, onClose }) => {
  const tier = RARITY_TIERS[item.rarityId];
  const variant = VARIANTS[item.variantId || VariantId.NONE];
  const hasVariant = (item.variantId ?? VariantId.NONE) !== VariantId.NONE;

  const ref = useRef<HTMLDivElement>(null);

  // 3D tilt effect for the card container
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseX = useSpring(x, { stiffness: 500, damping: 50 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 50 });
  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width - 0.5;
    const yPct = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Item Data
  const oreData = useMemo(() => ORES.find(o => o.name === item.text), [item.text]);
  const isSpecial = item.text === "Black Hole Core" || item.text === "Liquid Luck" || item.text === "Sound Shard" || item.text === "Hypercube Fragment" || item.text === "Frozen Time" || item.text === "Solar Plasma" || item.text === "Antimatter";
  const isOre = !!oreData;

  // Determine Visual Properties
  const modelColor = oreData ? oreData.glowColor : '#888';
  const borderClass = hasVariant ? variant.borderClass : tier.color;
  const intensity = (tier.id / 2) + (variant.multiplier > 1 ? 2 : 0);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-md perspective-1000" onClick={onClose}>
      <motion.div
        ref={ref}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        // @ts-ignore
        onPointerMove={handlePointerMove}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => e.stopPropagation()}
        className={`
            relative w-full max-w-lg h-[600px] rounded-xl border-2 ${borderClass} bg-neutral-900 
            shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden group cursor-default flex flex-col
        `}
      >
        {/* 3D Canvas Layer */}
        {(isOre || isSpecial) && (
          <div className="absolute inset-0 z-0">
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }} gl={{ antialias: false, alpha: true }}>
              <SceneContent item={item} color={modelColor} intensity={intensity} />
            </Canvas>
          </div>
        )}

        {/* UI Overlay */}
        <div className="relative z-10 h-full flex flex-col justify-between p-6 pointer-events-none">

          {/* Header */}
          <div className="flex justify-between items-start border-b border-white/10 pb-4 bg-gradient-to-b from-neutral-900/80 to-transparent">
            <div className="text-left">
              <div className={`text-xs font-mono uppercase tracking-widest ${tier.textColor} drop-shadow-md`}>
                {tier.name} // NO.{item.rarityId}
              </div>
              {hasVariant && (
                <div className={`text-xs font-mono uppercase tracking-widest mt-1 ${variant.styleClass.split(' ')[0]}`}>
                  VARIANT: {variant.name}
                </div>
              )}
            </div>
            <div className="text-xs font-mono text-neutral-500 uppercase tracking-widest border border-neutral-700 px-2 py-1 rounded bg-black/50">
              {isSpecial ? 'ARTIFACT' : 'MATERIAL'}
            </div>
          </div>

          {/* Footer Info */}
          <div className="pt-8 bg-gradient-to-t from-neutral-900 via-neutral-900/80 to-transparent pointer-events-auto">
            <h1 className={`text-3xl md:text-4xl font-bold ${tier.textColor} drop-shadow-md mb-2 ${hasVariant ? variant.styleClass : ''}`}>
              {hasVariant ? variant.prefix : ''} {item.text}
            </h1>
            <p className="text-sm font-mono text-neutral-400 leading-relaxed max-w-xs">
              {item.description}
            </p>

            <div className="mt-6 flex gap-2">
              <div className="flex-1 text-[10px] font-mono text-neutral-600 uppercase border-t border-white/10 pt-2">
                ID: {Math.random().toString(36).substring(7).toUpperCase()}
              </div>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white font-mono text-xs tracking-widest uppercase transition-all border border-neutral-700 hover:border-white"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Overlays */}
        <div className="absolute inset-0 pointer-events-none border-4 border-transparent rounded-xl mix-blend-overlay opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] z-20" />
        {hasVariant && (
          <div className={`absolute inset-0 pointer-events-none border-2 ${variant.borderClass} opacity-50 z-20`} />
        )}

      </motion.div>
    </div>
  );
};