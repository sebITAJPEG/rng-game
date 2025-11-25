import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, MeshDistortMaterial, Sparkles, Sphere, MeshTransmissionMaterial } from '@react-three/drei';

export const NeutroniumModel = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const coreRef = useRef<THREE.Mesh>(null);
    const distortionRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (meshRef.current) {
            // Slow, heavy rotation due to extreme density
            meshRef.current.rotation.y = t * 0.1;
            meshRef.current.rotation.z = Math.sin(t * 0.05) * 0.05;
        }
        if (coreRef.current) {
            // Pulsing core energy
            const pulse = 1 + Math.sin(t * 3) * 0.02;
            coreRef.current.scale.set(pulse, pulse, pulse);
        }
        if (distortionRef.current) {
            // Spacetime rippling effect
            distortionRef.current.rotation.z = -t * 0.2;
            distortionRef.current.rotation.x = Math.cos(t * 0.2) * 0.1;
        }
    });

    return (
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
            {/* Main Dense Sphere */}
            <Sphere ref={meshRef} args={[0.8, 64, 64]}>
                <MeshDistortMaterial
                    color="#1a1a1a" // Dark metallic base
                    emissive="#4c1d95" // Deep violet glow from fractures
                    emissiveIntensity={2}
                    roughness={0.2}
                    metalness={1}
                    distort={0.3} // Gravitational distortion
                    speed={0.5}
                    bumpScale={0.05}
                />
            </Sphere>

            {/* Inner Core Glow (leaking through) */}
            <mesh ref={coreRef}>
                <sphereGeometry args={[0.78, 32, 32]} />
                <meshBasicMaterial color="#8b5cf6" wireframe transparent opacity={0.1} />
            </mesh>

            {/* Gravitational Lensing / Spacetime Warp Shell */}
            <mesh ref={distortionRef} scale={[1.4, 1.4, 1.4]}>
                <sphereGeometry args={[1, 32, 32]} />
                {/* Replaced meshPhysicalMaterial with MeshTransmissionMaterial for chromatic aberration support */}
                <MeshTransmissionMaterial
                    transmission={1}
                    roughness={0}
                    thickness={0.5}
                    ior={2.0} // High refraction for lensing effect
                    chromaticAberration={0.1}
                    anisotropy={0.5}
                    background={new THREE.Color('#000000')} // Transmission material needs background context often
                    color="#000000"
                    emissive="#1e1b4b"
                    emissiveIntensity={0.2}
                />
            </mesh>

            {/* Leaking Energy Particles - Heavy and falling slightly towards center */}
            <Sparkles
                count={60}
                scale={2.5}
                size={2}
                speed={0.2}
                opacity={0.8}
                color="#a78bfa"
                noise={0.5}
            />

            {/* Ambient Gravity Well Lighting */}
            <pointLight color="#4c1d95" intensity={8} distance={4} decay={2} />
            <pointLight position={[2, 2, 2]} color="#1e3a8a" intensity={3} distance={5} />
        </Float>
    );
};