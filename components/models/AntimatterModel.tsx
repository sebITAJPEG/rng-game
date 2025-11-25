import React from 'react';
import { Float, MeshDistortMaterial, Sphere, Icosahedron, Sparkles } from '@react-three/drei';

export const AntimatterModel = () => {
    return (
        <Float speed={5} rotationIntensity={2} floatIntensity={2}>
            <Sphere args={[0.8, 32, 32]}><MeshDistortMaterial color="#000000" emissive="#8b5cf6" emissiveIntensity={1.5} distort={0.8} speed={5} roughness={0.2} /></Sphere>
            <group rotation={[Math.PI / 4, Math.PI / 4, 0]}><Icosahedron args={[1.5, 0]}><meshBasicMaterial color="#4c1d95" wireframe transparent opacity={0.3} /></Icosahedron></group>
            <Sparkles count={80} scale={4} size={2} speed={2} opacity={0.8} color="#d8b4fe" noise={1} />
            <pointLight color="#8b5cf6" intensity={5} distance={8} />
        </Float>
    );
};