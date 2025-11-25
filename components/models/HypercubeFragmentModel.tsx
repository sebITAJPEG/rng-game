import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sparkles } from '@react-three/drei';

export const HypercubeFragmentModel = () => {
    const groupRef = useRef<THREE.Group>(null);
    const coreRef = useRef<THREE.Mesh>(null);
    const innerRef = useRef<THREE.Mesh>(null);
    const outerRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (coreRef.current) { coreRef.current.rotation.x = t * 0.5; coreRef.current.rotation.y = t * 0.8; }
        if (innerRef.current) { innerRef.current.rotation.x = t * 0.2; innerRef.current.rotation.z = t * 0.2; }
        if (outerRef.current) { outerRef.current.rotation.y = -t * 0.1; outerRef.current.rotation.z = -t * 0.1; }
        if (groupRef.current) { groupRef.current.position.y = Math.sin(t) * 0.1; }
    });

    return (
        <group ref={groupRef}>
            <mesh ref={coreRef}><boxGeometry args={[0.8, 0.8, 0.8]} /><meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2} roughness={0.1} metalness={1} /></mesh>
            <mesh ref={innerRef}><boxGeometry args={[1.4, 1.4, 1.4]} /><meshBasicMaterial color="#d8b4fe" wireframe transparent opacity={0.5} /></mesh>
            <mesh ref={outerRef}><boxGeometry args={[2, 2, 2]} /><meshBasicMaterial color="#ffffff" wireframe transparent opacity={0.3} /></mesh>
            <Sparkles count={30} scale={4} size={2} speed={0.4} opacity={0.5} color="#a855f7" />
            <pointLight color="#a855f7" intensity={5} distance={5} />
        </group>
    );
};