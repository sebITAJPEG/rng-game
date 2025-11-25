import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, MeshTransmissionMaterial, Sparkles, Octahedron } from '@react-three/drei';

export const PhilosophersGoldModel = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const innerRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (meshRef.current) {
            // Slow, magical rotation
            meshRef.current.rotation.y = t * 0.2;
            meshRef.current.rotation.z = Math.sin(t * 0.3) * 0.1;
        }
        if (innerRef.current) {
            // Pulsing inner veins
            const pulse = 1 + Math.sin(t * 2) * 0.03;
            innerRef.current.scale.set(pulse, pulse, pulse);
            // Slight color shift for iridescence simulation (via rotation/lighting interaction)
            innerRef.current.rotation.x = -t * 0.1;
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.6}>
            {/* Main Crystalline Form */}
            <Octahedron ref={meshRef} args={[1, 1]}> {/* Higher detail octahedron for faceted, jewel-like look */}
                <MeshTransmissionMaterial
                    backside
                    samples={16}
                    thickness={1.5}
                    roughness={0.1}
                    chromaticAberration={0.6} // Strong dispersion for rainbow highlights
                    anisotropy={0.6}
                    distortion={0.4}
                    distortionScale={0.5}
                    temporalDistortion={0.1}
                    color="#fbbf24" // Deep Amber/Gold base
                    emissive="#f59e0b"
                    emissiveIntensity={0.6}
                    attenuationDistance={0.8}
                    attenuationColor="#ffffff"
                />
            </Octahedron>

            {/* Inner Glowing Veins/Core */}
            <mesh ref={innerRef}>
                <dodecahedronGeometry args={[0.7, 0]} />
                <meshBasicMaterial color="#ef4444" wireframe transparent opacity={0.4} /> {/* Crimson/Red veins */}
            </mesh>

            {/* Floating Golden Motes/Sparks */}
            <Sparkles
                count={80}
                scale={2.5}
                size={3}
                speed={0.4}
                opacity={0.8}
                color="#fcd34d"
                noise={0.2}
            />

            {/* Mystical Aura Lighting */}
            <pointLight color="#fbbf24" intensity={6} distance={4} decay={2} />
            <pointLight position={[2, -2, 2]} color="#a855f7" intensity={3} distance={5} /> {/* Violet highlight */}
        </Float>
    );
};