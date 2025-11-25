import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, MeshTransmissionMaterial, Sparkles, Icosahedron } from '@react-three/drei';

export const SolidLightModel = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const innerRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (meshRef.current) {
            // Gentle, floating rotation
            meshRef.current.rotation.x = Math.sin(t * 0.2) * 0.1;
            meshRef.current.rotation.y += 0.005;
        }
        if (innerRef.current) {
            // Inner pulse
            const scale = 1 + Math.sin(t * 2) * 0.05;
            innerRef.current.scale.set(scale, scale, scale);
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            {/* Outer Crystalline Shell */}
            <Icosahedron ref={meshRef} args={[1, 0]}> {/* Low detail Icosahedron for faceted look */}
                <MeshTransmissionMaterial
                    backside
                    samples={16}
                    thickness={2}
                    roughness={0.1}
                    chromaticAberration={0.5}
                    anisotropy={0.5}
                    distortion={0.6}
                    distortionScale={0.5}
                    temporalDistortion={0.2}
                    color="#e0f2fe" // Pale blue
                    emissive="#bae6fd"
                    emissiveIntensity={0.5}
                    attenuationDistance={0.5}
                    attenuationColor="#ffffff"
                />
            </Icosahedron>

            {/* Inner Shimmering Core */}
            <mesh ref={innerRef}>
                <icosahedronGeometry args={[0.6, 1]} />
                <meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.3} />
            </mesh>

            {/* Surrounding Rock/Pressure Marks (Abstracted as floating debris) */}
            <group>
                {[...Array(5)].map((_, i) => (
                    <mesh key={i} position={[
                        (Math.random() - 0.5) * 2.5,
                        (Math.random() - 0.5) * 2.5,
                        (Math.random() - 0.5) * 2.5
                    ]} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]} scale={0.1 + Math.random() * 0.1}>
                        <dodecahedronGeometry />
                        <meshStandardMaterial color="#57534e" roughness={0.8} />
                    </mesh>
                ))}
            </group>

            {/* Ambient Particles for Light Energy */}
            <Sparkles count={50} scale={3} size={4} speed={0.4} opacity={0.6} color="#e0f2fe" />

            <pointLight color="#e0f2fe" intensity={5} distance={5} />
        </Float>
    );
};