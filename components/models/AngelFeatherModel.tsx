import React from 'react';
import * as THREE from 'three';
import { Float, MeshDistortMaterial, Sparkles } from '@react-three/drei';

export const AngelFeatherModel = () => {
    return (
        <Float speed={1} rotationIntensity={1} floatIntensity={2} floatingRange={[0, 0.5]}>
            <group rotation={[0, 0, Math.PI / 4]}>
                <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.02, 0.05, 4.5, 8]} /><meshStandardMaterial color="#e2e8f0" roughness={0.3} /></mesh>
                <mesh position={[0, 0.5, 0]} scale={[1, 1, 0.1]}>
                    <coneGeometry args={[1.2, 3.5, 32]} />
                    <MeshDistortMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} roughness={0.1} metalness={0.1} distort={0.2} speed={1} side={THREE.DoubleSide} />
                </mesh>
                <mesh position={[0, 0.5, 0]} scale={[0.5, 0.8, 0.2]}><coneGeometry args={[1, 3, 16]} /><meshBasicMaterial color="#fefce8" transparent opacity={0.5} /></mesh>
            </group>
            <Sparkles count={60} scale={4} size={3} speed={0.2} opacity={0.6} color="#fefce8" />
            <Sparkles count={20} scale={3} size={5} speed={0.5} opacity={1} color="#fbbf24" noise={0.5} />
            <pointLight color="#ffffff" intensity={3} distance={6} decay={2} />
        </Float>
    );
};