import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MeshTransmissionMaterial, Sphere, Torus } from '@react-three/drei';

export const BlackHoleModel = () => {
    const particlesCount = 1500;
    const particlesRef = useRef<THREE.Points>(null);
    const ringRef1 = useRef<THREE.Group>(null);
    const ringRef2 = useRef<THREE.Group>(null);

    // Generate spiral particles for accretion disk
    const particlePositions = useMemo(() => {
        const positions = new Float32Array(particlesCount * 3);
        for (let i = 0; i < particlesCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = 1.2 + Math.random() * 2.5 + Math.pow(Math.random(), 3) * 2;
            const y = (Math.random() - 0.5) * 0.15 * (radius * 0.5);

            positions[i * 3] = Math.cos(angle) * radius;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = Math.sin(angle) * radius;
        }
        return positions;
    }, []);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (particlesRef.current) particlesRef.current.rotation.y = -t * 0.2;
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
            <Sphere args={[0.8, 64, 64]}><meshBasicMaterial color="#000000" /></Sphere>
            <Sphere args={[1.3, 32, 32]}>
                <MeshTransmissionMaterial backside backsideThickness={5} thickness={2} roughness={0} chromaticAberration={0.5} anisotropicBlur={0.1} distortion={1.5} distortionScale={0.5} temporalDistortion={0.1} background={new THREE.Color('#000')} />
            </Sphere>
            <group ref={ringRef1}><Torus args={[1.6, 0.05, 16, 100]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.1]}><meshBasicMaterial color="#ff6600" transparent opacity={0.8} toneMapped={false} /></Torus></group>
            <group ref={ringRef2}><Torus args={[2.2, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.1]}><meshBasicMaterial color="#ffaa00" transparent opacity={0.4} toneMapped={false} /></Torus></group>
            <points ref={particlesRef}>
                <bufferGeometry><bufferAttribute attach="attributes-position" count={particlePositions.length / 3} array={particlePositions} itemSize={3} /></bufferGeometry>
                <pointsMaterial size={0.04} color="#00aaff" transparent opacity={0.6} blending={THREE.AdditiveBlending} sizeAttenuation={true} toneMapped={false} />
            </points>
            <pointLight color="#ff6600" intensity={5} distance={10} />
        </group>
    );
};