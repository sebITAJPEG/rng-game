import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, MeshTransmissionMaterial, Sparkles, Icosahedron } from '@react-three/drei';

export const MoonstoneModel = () => {
    const meshRef = useRef<THREE.Mesh>(null);
    const innerRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (meshRef.current) {
            // Gentle, floating rotation
            meshRef.current.rotation.y = t * 0.1;
            meshRef.current.rotation.z = Math.sin(t * 0.1) * 0.05;
        }
        if (innerRef.current) {
            // Inner pulse
            const pulse = 1 + Math.sin(t * 1.5) * 0.05;
            innerRef.current.scale.set(pulse, pulse, pulse);
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
            {/* Outer Moonstone Shell */}
            <Icosahedron ref={meshRef} args={[1, 2]}>
                <MeshTransmissionMaterial
                    backside
                    samples={16}
                    thickness={1.5}
                    roughness={0.2}
                    chromaticAberration={0.3}
                    anisotropy={0.2}
                    distortion={0.3}
                    distortionScale={0.4}
                    temporalDistortion={0.1}
                    color="#e0e7ff" // Pale blue-white
                    emissive="#c7d2fe"
                    emissiveIntensity={0.4}
                    attenuationDistance={0.8}
                    attenuationColor="#ffffff"
                />
            </Icosahedron>

            {/* Inner Glowing Core */}
            <mesh ref={innerRef}>
                <icosahedronGeometry args={[0.6, 1]} />
                <meshBasicMaterial color="#a5b4fc" wireframe transparent opacity={0.2} />
            </mesh>

            {/* Orbiting Lunar Dust */}
            <Sparkles count={60} scale={3} size={2} speed={0.3} opacity={0.5} color="#e0e7ff" />

            <pointLight color="#c7d2fe" intensity={4} distance={6} />
        </Float>
    );
};