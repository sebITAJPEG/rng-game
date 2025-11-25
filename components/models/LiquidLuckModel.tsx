import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, MeshTransmissionMaterial, Sparkles } from '@react-three/drei';
// Import the shader material or define it here if it's not exported globally yet.
// Assuming it's registered globally via extend in the main file or a setup file.
// Since extend is in ItemVisualizer, we need to make sure the shader is available.
// For this refactor, I'll assume the shader is defined/extended in a common place or I'll need to include it.
// To be safe and self-contained, I will import the definition if possible or rely on it being available in the context if extended at app root.
// However, in the original file it was defined in ItemVisualizer. 
// Let's move the shader definition to a shared file or include it here.
import { LiquidShaderMaterial } from '../materials/LiquidShaderMaterial'; // We need to create this too or import it.

// Since I can't easily create a new file for the material definition and update imports everywhere in one go without strict instructions,
// I will assume for now that LiquidShaderMaterial is available or I will redefine it locally if needed, 
// BUT the user already uploaded `components/materials/LiquidShaderMaterial.tsx`.
// So I can just import it!

export const LiquidLuckModel = () => {
    const materialRef = useRef<any>(null);

    useFrame((state, delta) => {
        if (materialRef.current) {
            materialRef.current.time += delta;
        }
    });

    return (
        <group>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
                {/* Glass Bottle */}
                <mesh>
                    <cylinderGeometry args={[0.5, 0.8, 2, 32]} />
                    <MeshTransmissionMaterial
                        backside
                        thickness={0.2}
                        roughness={0.05}
                        transmission={1}
                        ior={1.5}
                        chromaticAberration={0.1}
                        anisotropy={0.1}
                    />
                </mesh>

                {/* Liquid Content */}
                <mesh scale={[0.9, 0.8, 0.9]} position={[0, -0.1, 0]}>
                    <cylinderGeometry args={[0.45, 0.75, 1.8, 32]} />
                    {/* @ts-ignore */}
                    <liquidShaderMaterial
                        ref={materialRef}
                        transparent
                        color={new THREE.Color("#ffd700")}
                        rimColor={new THREE.Color("#fffacd")}
                    />
                </mesh>

                <Sparkles count={30} scale={1.5} size={2} speed={0.8} opacity={0.6} color="#fff" position={[0, 0, 0]} />
            </Float>
        </group>
    );
};