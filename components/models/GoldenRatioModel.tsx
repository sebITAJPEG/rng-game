import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Float, Line, MeshTransmissionMaterial, Sparkles, Text, Icosahedron, Torus } from '@react-three/drei';

export const GoldenRatioModel = () => {
    const groupRef = useRef<THREE.Group>(null);
    const spiralRef = useRef<THREE.Group>(null);
    const phiTextRef = useRef<THREE.Mesh>(null);
    const ringRef1 = useRef<THREE.Mesh>(null);
    const ringRef2 = useRef<THREE.Mesh>(null);

    // Create a Fibonacci spiral using line segments
    const spiralPoints = useMemo(() => {
        const points: THREE.Vector3[] = [];
        const numPoints = 500; // Increased points for smoothness
        const turns = 12; // More turns

        // Golden Ratio (Phi)
        const phi = (1 + Math.sqrt(5)) / 2;
        const goldenFactor = 0.30635;

        for (let i = 0; i < numPoints; i++) {
            // Logarithmic spiral formula: r = a * e^(b * theta)
            // b = ln(phi) / (pi/2) approx 0.3063489 for true golden spiral per quarter turn
            // Adjusted for visual fit in scene
            const angle = i * 0.1;
            const radius = 0.001 * Math.exp(goldenFactor * angle);

            const x = radius * Math.cos(angle);
            const y = radius * Math.sin(angle);
            // Flatten the z-depth slightly to keep it more planar but still 3D
            const z = (i * 0.002) - 0.5;

            points.push(new THREE.Vector3(x, y, z));
        }
        return points;
    }, []);

    // Create Golden Rectangles logic (visualized as wireframe boxes scaling down)
    const rectangles = useMemo(() => {
        const rects = [];
        let width = 2.0;
        let height = width / 1.618;

        // A simplified visual representation of nested rectangles
        // True spiral origin logic is complex to center in 3D, so we arrange them artistically
        for (let i = 0; i < 8; i++) {
            rects.push(
                <mesh key={i} position={[0, 0, i * -0.05]} rotation={[0, 0, i * -Math.PI / 2]}>
                    <boxGeometry args={[width, height, 0.05]} />
                    <meshBasicMaterial color="#fbbf24" wireframe transparent opacity={0.1 + (i * 0.05)} />
                </mesh>
            );
            const temp = width;
            width = height;
            height = temp / 1.618;
        }
        return rects;
    }, []);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (groupRef.current) {
            // Gentle floating rotation
            groupRef.current.rotation.y = Math.sin(t * 0.1) * 0.1;
            groupRef.current.rotation.x = Math.cos(t * 0.1) * 0.05;
        }
        if (spiralRef.current) {
            // Rotate the spiral slowly to hypnotize
            spiralRef.current.rotation.z = -t * 0.1;
        }
        if (phiTextRef.current) {
            phiTextRef.current.rotation.y = Math.sin(t * 0.5) * 0.2; // Slight wobble
            phiTextRef.current.position.y = 1.4 + Math.sin(t * 1) * 0.05;
        }
        if (ringRef1.current) {
            ringRef1.current.rotation.x = t * 0.2;
            ringRef1.current.rotation.y = t * 0.1;
        }
        if (ringRef2.current) {
            ringRef2.current.rotation.x = -t * 0.15;
            ringRef2.current.rotation.z = t * 0.1;
        }
    });

    return (
        <group ref={groupRef}>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>

                {/* Central Icosahedron representing divine geometry */}
                <mesh scale={0.45}>
                    <icosahedronGeometry args={[1, 1]} /> {/* Increased detail level */}
                    <MeshTransmissionMaterial
                        backside
                        samples={16}
                        thickness={1.5}
                        roughness={0}
                        chromaticAberration={0.6}
                        anisotropy={0.5}
                        distortion={0.4}
                        distortionScale={0.3}
                        temporalDistortion={0.2}
                        color="#fbbf24"
                        emissive="#d97706"
                        emissiveIntensity={0.8}
                    />
                </mesh>

                {/* Golden Rectangles Background */}
                <group position={[0, 0, -0.5]}>
                    {rectangles}
                </group>

                {/* The Spiral Line */}
                <group ref={spiralRef} scale={0.8} position={[0, 0, 0]}>
                    <Line
                        points={spiralPoints}
                        color="#fde047"
                        lineWidth={3}
                        transparent
                        opacity={0.8}
                    />
                </group>

                {/* Rotating Rings representing orbital mechanics/geometry */}
                <group>
                    <mesh ref={ringRef1}>
                        <torusGeometry args={[1.8, 0.01, 16, 100]} />
                        <meshBasicMaterial color="#fbbf24" transparent opacity={0.3} />
                    </mesh>
                    <mesh ref={ringRef2} rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[2.0, 0.01, 16, 100]} />
                        <meshBasicMaterial color="#f59e0b" transparent opacity={0.2} />
                    </mesh>
                    <mesh ref={ringRef2} rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[3.0, 0.01, 16, 100]} />
                        <meshBasicMaterial color="#f59e0b" transparent opacity={0.2} />
                    </mesh>
                    <mesh ref={ringRef2} rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[4.0, 0.01, 16, 100]} />
                        <meshBasicMaterial color="#f59e0b" transparent opacity={0.2} />
                    </mesh>
                    <mesh ref={ringRef2} rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[5.0, 0.01, 16, 100]} />
                        <meshBasicMaterial color="#f59e0b" transparent opacity={0.2} />
                    </mesh>
                </group>

                {/* Floating Greek Letter Phi */}
                <group position={[0, 1.4, 0]}>
                    <Text
                        ref={phiTextRef}
                        fontSize={0.6}
                        color="#fde047"
                        font="https://fonts.gstatic.com/s/raleway/v14/1Ptrg8zYS_SKggPNwK4vaqI.woff"
                        anchorX="center"
                        anchorY="middle"
                        depthWrite={false}
                        depthTest={false}
                        blending={THREE.AdditiveBlending}
                        side={THREE.DoubleSide}

                    >
                        Φ
                        <meshBasicMaterial color="#fde047" toneMapped={false} />
                    </Text>
                </group>

                {/* Ambient Particles */}
                <Sparkles count={100} scale={6} size={3} speed={0.3} opacity={0.6} color="#fcd34d" />

                <pointLight color="#fbbf24" intensity={3} distance={8} />
                <pointLight position={[0, 0, 5]} color="#fff" intensity={1} distance={10} />
            </Float>
        </group>
    );
}