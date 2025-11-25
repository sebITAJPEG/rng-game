import React, { useMemo } from 'react';
import { Float, Sparkles } from '@react-three/drei';

export const LunarDustModel = () => {
    const count = 1000;
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        for (let i = 0; i < count; i++) {
            const r = 1.5 * Math.cbrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = r * Math.cos(phi);
        }
        return pos;
    }, []);

    return (
        <Float speed={1} rotationIntensity={0.5} floatIntensity={1}>
            <points>
                <bufferGeometry><bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} /></bufferGeometry>
                <pointsMaterial size={0.03} color="#e5e7eb" transparent opacity={0.6} sizeAttenuation={true} />
            </points>
            <Sparkles count={50} scale={3} size={2} speed={0.2} opacity={0.4} color="#ffffff" />
            <pointLight color="#ffffff" intensity={2} distance={5} />
        </Float>
    );
};