import React from 'react';
import { Float } from '@react-three/drei';

export const StandardOreModel = ({ color, intensity }: { color: string, intensity: number }) => {
    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
            <mesh>
                <dodecahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color={color} roughness={0.4} metalness={0.8} emissive={color} emissiveIntensity={0.2 + (intensity * 0.05)} />
            </mesh>
            {intensity > 5 && (
                <mesh scale={[1.1, 1.1, 1.1]}>
                    <dodecahedronGeometry args={[1, 0]} />
                    <meshBasicMaterial color={color} wireframe transparent opacity={0.2} />
                </mesh>
            )}
        </Float>
    );
};