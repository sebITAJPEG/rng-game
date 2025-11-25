import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei';

export const TimeLostTreasureModel = () => {
    const groupRef = useRef<THREE.Group>(null);
    const ring1Ref = useRef<THREE.Mesh>(null);
    const ring2Ref = useRef<THREE.Mesh>(null);
    const ring3Ref = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (groupRef.current) {
            groupRef.current.rotation.y = t * 0.1;
            groupRef.current.position.y = Math.sin(t * 0.5) * 0.1;
        }
        if (ring1Ref.current) {
            ring1Ref.current.rotation.x = t * 0.4;
            ring1Ref.current.rotation.y = t * 0.2;
        }
        if (ring2Ref.current) {
            ring2Ref.current.rotation.x = t * 0.3 + Math.PI / 3;
            ring2Ref.current.rotation.y = -t * 0.3;
        }
        if (ring3Ref.current) {
            ring3Ref.current.rotation.x = -t * 0.2;
            ring3Ref.current.rotation.z = t * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                {/* Core */}
                <mesh>
                    <icosahedronGeometry args={[0.6, 0]} />
                    <MeshDistortMaterial
                        color="#06b6d4"
                        emissive="#22d3ee"
                        emissiveIntensity={2}
                        roughness={0.1}
                        metalness={1}
                        distort={0.4}
                        speed={2}
                    />
                </mesh>

                {/* Inner Gold Cage */}
                <mesh>
                    <icosahedronGeometry args={[0.8, 1]} />
                    <meshStandardMaterial color="#facc15" wireframe transparent opacity={0.3} />
                </mesh>

                {/* Rotating Rings (Armillary Sphere style) */}
                <group>
                    <mesh ref={ring1Ref}>
                        <torusGeometry args={[1.2, 0.03, 16, 100]} />
                        <meshStandardMaterial color="#fbbf24" metalness={1} roughness={0.2} emissive="#fbbf24" emissiveIntensity={0.5} />
                    </mesh>
                    <mesh ref={ring2Ref}>
                        <torusGeometry args={[1.5, 0.03, 16, 100]} />
                        <meshStandardMaterial color="#f59e0b" metalness={1} roughness={0.2} emissive="#f59e0b" emissiveIntensity={0.3} />
                    </mesh>
                    <mesh ref={ring3Ref}>
                        <torusGeometry args={[1.8, 0.02, 16, 100]} />
                        <meshStandardMaterial color="#d97706" metalness={1} roughness={0.2} />
                    </mesh>
                </group>

                {/* Particles */}
                <Sparkles count={40} scale={4} size={3} speed={0.4} opacity={0.6} color="#22d3ee" />
                <Sparkles count={20} scale={3} size={4} speed={0.2} opacity={0.8} color="#facc15" noise={0.5} />

                {/* Lights */}
                <pointLight color="#22d3ee" intensity={3} distance={5} />
                <pointLight color="#facc15" intensity={2} distance={8} position={[2, 2, 2]} />
            </Float>
        </group>
    );
};