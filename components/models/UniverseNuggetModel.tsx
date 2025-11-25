import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, MeshDistortMaterial, Sparkles, Sphere, MeshTransmissionMaterial } from '@react-three/drei';

export const UniverseNuggetModel = () => {
    const coreRef = useRef<THREE.Mesh>(null);
    const shellRef = useRef<THREE.Mesh>(null);
    const galaxyRef = useRef<THREE.Group>(null);

    // Generate spiral galaxy arms
    const galaxyParticles = useMemo(() => {
        const count = 4000; // Increased particle count for detail
        const pos = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const color1 = new THREE.Color("#8b5cf6"); // Violet
        const color2 = new THREE.Color("#3b82f6"); // Blue
        const color3 = new THREE.Color("#f472b6"); // Pink
        const goldenColor = new THREE.Color("#fbbf24"); // Golden highlights

        for (let i = 0; i < count; i++) {
            // Spiral logic with Golden Ratio influence
            const angle = Math.random() * Math.PI * 2;
            // Golden spiral approximation r = a * e^(b*theta)
            // b = ln(phi) / (pi/2) approx 0.30635
            const phi = (1 + Math.sqrt(5)) / 2;
            const goldenFactor = 0.30635;

            // Use a mix of standard spiral and golden spiral distribution
            const t = Math.random();
            const radius = 0.2 + (Math.exp(goldenFactor * (angle + (i % 5) * (Math.PI * 2 / 5))) * 0.15 * t);

            const armOffset = (i % 3) * (Math.PI * 2 / 3); // 3 arms
            const spiralAngle = angle + armOffset + (radius * 3); // More twist

            const x = Math.cos(spiralAngle) * radius;
            const z = Math.sin(spiralAngle) * radius;
            const y = (Math.random() - 0.5) * 0.15 * (2 - radius); // Flattened disk

            pos[i * 3] = x;
            pos[i * 3 + 1] = y;
            pos[i * 3 + 2] = z;

            // Color mixing
            let mixedColor;
            if (Math.random() > 0.9) {
                mixedColor = goldenColor; // Occasional golden star
            } else {
                mixedColor = color1.clone().lerp(color2, Math.random()).lerp(color3, Math.random());
            }

            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;
        }
        return { pos, colors };
    }, []);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (coreRef.current) {
            coreRef.current.rotation.y = t * 0.05;
        }
        if (shellRef.current) {
            shellRef.current.rotation.y = -t * 0.1;
            shellRef.current.rotation.z = Math.sin(t * 0.1) * 0.1;
        }
        if (galaxyRef.current) {
            galaxyRef.current.rotation.y = t * 0.1;
        }
    });

    return (
        <Float speed={1} rotationIntensity={0.2} floatIntensity={0.2}>
            {/* Deep Space Core */}
            <Sphere ref={coreRef} args={[0.5, 64, 64]}>
                <MeshDistortMaterial
                    color="#0f172a"
                    emissive="#4c1d95"
                    emissiveIntensity={0.8}
                    roughness={0.1}
                    metalness={0.9}
                    distort={0.4}
                    speed={0.2}
                />
            </Sphere>

            {/* Galaxy Particle System */}
            <group ref={galaxyRef}>
                <points>
                    <bufferGeometry>
                        <bufferAttribute attach="attributes-position" count={galaxyParticles.pos.length / 3} array={galaxyParticles.pos} itemSize={3} />
                        <bufferAttribute attach="attributes-color" count={galaxyParticles.colors.length / 3} array={galaxyParticles.colors} itemSize={3} />
                    </bufferGeometry>
                    <pointsMaterial size={0.015} vertexColors transparent opacity={0.9} sizeAttenuation={true} depthWrite={false} blending={THREE.AdditiveBlending} />
                </points>
            </group>

            {/* Outer Containment Shell (Event Horizon-ish) */}
            <Sphere ref={shellRef} args={[1.6, 32, 32]}>
                <MeshTransmissionMaterial
                    backside
                    samples={16}
                    thickness={0.1}
                    roughness={0}
                    chromaticAberration={0.3}
                    anisotropy={0.2}
                    distortion={0.3}
                    distortionScale={0.5}
                    temporalDistortion={0.1}
                    color="#000000"
                    opacity={0.2}
                    transparent
                />
            </Sphere>

            {/* Ambient Starfield */}
            <Sparkles count={150} scale={3.5} size={1.5} speed={0.2} opacity={0.6} color="#ffffff" />

            {/* Cosmic Lighting */}
            <pointLight color="#8b5cf6" intensity={3} distance={6} />
            <pointLight position={[2, 2, 2]} color="#fbbf24" intensity={1.5} distance={6} />
        </Float>
    );
};