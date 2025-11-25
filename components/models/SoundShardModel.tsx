import React from 'react';
import { Float, MeshDistortMaterial, Torus } from '@react-three/drei';

export const SoundShardModel = () => {
    return (
        <Float speed={5} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh>
                <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
                <MeshDistortMaterial color="#6ee7b7" emissive="#10b981" emissiveIntensity={2} distort={0.6} speed={5} toneMapped={false} />
            </mesh>
            <Torus args={[1, 0.02, 16, 32]} rotation={[Math.PI / 2, 0, 0]}><meshBasicMaterial color="#6ee7b7" transparent opacity={0.5} /></Torus>
        </Float>
    );
};