import React from 'react';
import { Float, Sparkles } from '@react-three/drei';

export const StardustModel = () => {
    return (
        <Float speed={1} rotationIntensity={2} floatIntensity={1}>
            <Sparkles count={200} scale={4} size={6} speed={0.5} opacity={1} color="#fbbf24" />
            <Sparkles count={100} scale={3} size={4} speed={0.8} opacity={0.7} color="#60a5fa" />
            <Sparkles count={50} scale={5} size={8} speed={0.2} opacity={0.5} color="#f472b6" />
            <pointLight color="#fbbf24" intensity={4} distance={8} />
            <pointLight color="#60a5fa" intensity={4} distance={8} position={[2, 2, 2]} />
        </Float>
    );
};