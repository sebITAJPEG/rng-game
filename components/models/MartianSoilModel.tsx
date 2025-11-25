import React, { useMemo } from 'react';
import { Float, Sparkles } from '@react-three/drei';

export const MartianSoilModel = () => {
    const count = 1200;
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 3;
            pos[i * 3 + 1] = (Math.random() - 0.5) * 3;
            pos[i * 3 + 2] = (Math.random() - 0.5) * 3;
        }
        return pos;
    }, []);

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={0.5}>
            <points>
                <bufferGeometry><bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} /></bufferGeometry>
                <pointsMaterial size={0.04} color="#c2410c" transparent opacity={0.8} sizeAttenuation={true} />
            </points>
            <Sparkles count={30} scale={3} size={4} speed={0.5} opacity={0.5} color="#ea580c" />
            <pointLight color="#ea580c" intensity={3} distance={6} />
        </Float>
    );
};