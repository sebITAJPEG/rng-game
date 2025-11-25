import React from 'react';
import { Float, MeshTransmissionMaterial, Octahedron, Sphere, Sparkles, Torus } from '@react-three/drei';

export const FrozenTimeModel = () => {
    return (
        <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <Sphere args={[0.4, 32, 32]}><meshBasicMaterial color="#ffffff" toneMapped={false} /></Sphere>
            <pointLight color="#06b6d4" intensity={2} distance={3} />
            <Octahedron args={[1.2, 0]}>
                <MeshTransmissionMaterial backside samples={16} thickness={2} roughness={0.1} chromaticAberration={0.5} anisotropy={0.5} distortion={0.5} distortionScale={0.5} temporalDistortion={0.1} color="#cffafe" emissive="#06b6d4" emissiveIntensity={0.2} />
            </Octahedron>
            <group rotation={[Math.PI / 4, 0, 0]}><Torus args={[1.8, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}><meshBasicMaterial color="#06b6d4" transparent opacity={0.4} /></Torus></group>
            <group rotation={[-Math.PI / 4, Math.PI / 4, 0]}><Torus args={[2.2, 0.02, 16, 100]} rotation={[Math.PI / 2, 0, 0]}><meshBasicMaterial color="#06b6d4" transparent opacity={0.2} /></Torus></group>
            <Sparkles count={50} scale={4} size={3} speed={0.1} opacity={0.6} color="#cffafe" />
        </Float>
    );
};