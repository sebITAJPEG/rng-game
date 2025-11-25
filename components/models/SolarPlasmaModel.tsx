import React from 'react';
import * as THREE from 'three';
import { Float, MeshDistortMaterial, Sphere, Sparkles } from '@react-three/drei';

export const SolarPlasmaModel = () => {
    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            <Sphere args={[1, 32, 32]}><MeshDistortMaterial color="#f97316" emissive="#ef4444" emissiveIntensity={2} distort={0.4} speed={3} roughness={0} /></Sphere>
            <Sphere args={[1.2, 32, 32]}><meshBasicMaterial color="#eab308" transparent opacity={0.1} side={THREE.BackSide} /></Sphere>
            <Sparkles count={100} scale={3} size={5} speed={0.4} opacity={0.5} color="#fbbf24" />
            <pointLight color="#f97316" intensity={10} distance={10} />
        </Float>
    );
};