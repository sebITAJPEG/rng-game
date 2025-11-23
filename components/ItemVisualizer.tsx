import React, { useRef, useEffect, useState, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { RarityId, ItemData, VariantId } from '../types';
import { RARITY_TIERS, VARIANTS, ORES } from '../constants';

interface Props {
  item: ItemData & { rarityId: RarityId, variantId?: VariantId };
  onClose: () => void;
}

// --- 3D SCENE COMPONENT ---
const ThreeScene: React.FC<{ color: string; intensity: number; isLiquidLuck?: boolean; isSoundShard?: boolean }> = ({ color, intensity, isLiquidLuck, isSoundShard }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [libsLoaded, setLibsLoaded] = useState(false);

  useEffect(() => {
    // Function to load external scripts
    const loadScript = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.body.appendChild(script);
      });
    };

    // Load Three.js and SimplexNoise
    // Sound Shard now also needs SimplexNoise for the waveform effect
    Promise.all([
      loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'),
      (isLiquidLuck || isSoundShard) ? loadScript('https://cdnjs.cloudflare.com/ajax/libs/simplex-noise/2.4.0/simplex-noise.min.js') : Promise.resolve()
    ]).then(() => {
      setLibsLoaded(true);
    }).catch(e => console.error("Failed to load 3D libraries", e));

  }, [isLiquidLuck, isSoundShard]);

  useEffect(() => {
    if (!libsLoaded || !containerRef.current) return;

    const THREE = (window as any).THREE;
    const SimplexNoise = (window as any).SimplexNoise;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // Setup Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    let mesh: any;
    let simplex: any;
    // Store original positions to calculate noise displacement from a stable base
    let originalPositions: Float32Array | null = null;

    if (isLiquidLuck && SimplexNoise) {
      // --- LIQUID LUCK MODEL ---
      simplex = new SimplexNoise();

      const geometry = new THREE.IcosahedronGeometry(1, 5);
      originalPositions = geometry.attributes.position.array.slice();

      const material = new THREE.MeshPhysicalMaterial({
        color: 0xffd700,
        emissive: 0xaa6600,
        emissiveIntensity: 0.2,
        metalness: 0.9,
        roughness: 0.1,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
        reflectivity: 1.0,
        transmission: 0.1,
        opacity: 0.9,
        transparent: true
      });

      mesh = new THREE.Mesh(geometry, material);

    } else if (isSoundShard && SimplexNoise) {
      // --- SOUND SHARD MODEL (NEW) ---
      simplex = new SimplexNoise();

      // A tall, segmented crystal cylinder
      const geometry = new THREE.CylinderGeometry(0.05, 0.6, 2.5, 6, 20); // High height segments for wave resolution
      originalPositions = geometry.attributes.position.array.slice();

      const material = new THREE.MeshPhysicalMaterial({
        color: 0x6ee7b7, // Emeraldish green
        emissive: 0x10b981,
        emissiveIntensity: 0.5,
        metalness: 0.1,
        roughness: 0.2,
        transmission: 0.2,
        thickness: 1.0,
        clearcoat: 1.0,
        transparent: true,
        opacity: 0.9,
        flatShading: true // Crystal look
      });

      mesh = new THREE.Mesh(geometry, material);

      // Add sonic rings around it
      const ringGeo = new THREE.TorusGeometry(1.0, 0.02, 4, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: 0x6ee7b7, transparent: true, opacity: 0.4 });
      const ring1 = new THREE.Mesh(ringGeo, ringMat);
      const ring2 = new THREE.Mesh(ringGeo, ringMat);
      const ring3 = new THREE.Mesh(ringGeo, ringMat); // Extra ring

      ring1.rotation.x = Math.PI / 2 + 0.2;
      ring2.rotation.x = Math.PI / 2 - 0.2;
      ring3.rotation.x = Math.PI / 2;

      // Add to mesh so they move together, but we'll animate them separately
      mesh.add(ring1);
      mesh.add(ring2);
      mesh.add(ring3);

      mesh.userData = { rings: [ring1, ring2, ring3] };

    } else {
      // --- STANDARD ORE MODEL ---
      const geometry = new THREE.DodecahedronGeometry(1, 0);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.7,
        metalness: 0.6,
        emissive: new THREE.Color(color),
        emissiveIntensity: 0.2 + (intensity * 0.1),
        flatShading: true,
      });
      mesh = new THREE.Mesh(geometry, material);
    }

    scene.add(mesh);

    // Wireframe for standard high-tier ores
    if (!isLiquidLuck && !isSoundShard && intensity > 5) {
      // For groups (Sound Shard), we need to find the mesh inside
      const targetMesh = mesh.isGroup ? mesh.children[0] : mesh;

      const wireframe = new THREE.WireframeGeometry(targetMesh.geometry);
      const line = new THREE.LineSegments(wireframe);
      // @ts-ignore
      line.material.depthTest = false;
      // @ts-ignore
      line.material.opacity = 0.1;
      // @ts-ignore
      line.material.transparent = true;
      targetMesh.add(line);
    }

    // Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffffff, 1);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    // Colored light from below/side to accent the material
    const pointLight2 = new THREE.PointLight(color, 2);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Animation Loop
    let animationId: number;
    let time = 0;

    const animate = () => {
      animationId = requestAnimationFrame(animate);
      time += 0.01;

      if (mesh) {
        if (isLiquidLuck && simplex && originalPositions) {
          // LIQUID LUCK ANIMATION
          mesh.rotation.y += 0.005;
          const positionAttribute = mesh.geometry.attributes.position;
          const vertex = new THREE.Vector3();

          for (let i = 0; i < positionAttribute.count; i++) {
            vertex.fromArray(originalPositions, i * 3);
            const timeScale = time * 1.5;
            const noiseScale = 1.5;
            const noise = simplex.noise4D(vertex.x * noiseScale, vertex.y * noiseScale, vertex.z * noiseScale, timeScale);
            const displacement = 1 + (noise * 0.15);
            vertex.multiplyScalar(displacement);
            positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
          }
          mesh.geometry.attributes.position.needsUpdate = true;
          mesh.geometry.computeVertexNormals();

        } else if (isSoundShard && simplex && originalPositions) {
          // SOUND SHARD ANIMATION

          // 1. Waveform Displacement
          const positionAttribute = mesh.geometry.attributes.position;
          const vertex = new THREE.Vector3();

          for (let i = 0; i < positionAttribute.count; i++) {
            vertex.fromArray(originalPositions, i * 3);

            // Create a "traveling wave" effect moving up the Y axis
            // Frequency high, amplitude dependent on Y
            const waveY = (vertex.y + 1.25) * 5; // Map Y to wave phase
            const noiseVal = simplex.noise2D(waveY - (time * 10), 0); // Fast moving wave

            // Distort X and Z based on the wave
            const distortion = 1 + (noiseVal * 0.2 * (1 - Math.abs(vertex.y) / 2)); // Less distortion at tips

            vertex.x *= distortion;
            vertex.z *= distortion;

            positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
          }
          mesh.geometry.attributes.position.needsUpdate = true;
          mesh.geometry.computeVertexNormals();

          // 2. Rotation
          mesh.rotation.y += 0.02; // Faster spin than normal

          // 3. Ring Animation
          if (mesh.userData && mesh.userData.rings) {
            mesh.userData.rings.forEach((ring: any, i: number) => {
              // Pulse scale
              const s = 1 + Math.sin((time * 5) + (i * 2)) * 0.3;
              ring.scale.set(s, s, s);

              // Wobble rotation
              ring.rotation.z = Math.sin(time * 2 + i) * 0.2;

              // Fade opacity
              if (ring.material) {
                ring.material.opacity = 0.4 + Math.sin((time * 10) + i) * 0.2;
              }
            });
          }

        } else {
          // STANDARD ORE ANIMATION
          mesh.rotation.x += 0.005;
          mesh.rotation.y += 0.005;
          mesh.position.y = Math.sin(time * 2) * 0.1;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId);
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [libsLoaded, color, intensity, isLiquidLuck, isSoundShard]);

  return <div ref={containerRef} className="w-full h-64 md:h-80 pointer-events-none" />;
};

// --- MAIN VISUALIZER COMPONENT ---

export const ItemVisualizer: React.FC<Props> = ({ item, onClose }) => {
  const tier = RARITY_TIERS[item.rarityId];
  const variant = VARIANTS[item.variantId || VariantId.NONE];
  const hasVariant = (item.variantId ?? VariantId.NONE) !== VariantId.NONE;

  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 50 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 50 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], ["-15deg", "15deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXRel = e.clientX - rect.left;
    const mouseYRel = e.clientY - rect.top;
    const xPct = mouseXRel / width - 0.5;
    const yPct = mouseYRel / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Detect item types
  const oreData = useMemo(() => ORES.find(o => o.name === item.text), [item.text]);
  const isOre = !!oreData;
  const isLiquidLuck = item.text === "Liquid Luck";
  const isSoundShard = item.text === "Sound Shard";

  // Determine 3D Color
  const modelColor = oreData ? oreData.glowColor : '#888';

  const borderClass = hasVariant ? variant.borderClass : tier.color;

  // Calculate Intensity
  const intensity = (tier.id / 2) + (variant.multiplier > 1 ? 2 : 0);

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-md perspective-1000" onClick={onClose}>
      <motion.div
        ref={ref}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => e.stopPropagation()}
        className={`
            relative w-full max-w-md rounded-xl border-2 ${borderClass} bg-neutral-900 
            shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden group cursor-default flex flex-col
        `}
      >
        {/* Holographic Shine Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-30 transition-opacity pointer-events-none mix-blend-overlay z-20" />

        {/* Scanline Texture */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] filter contrast-150 brightness-1000 z-10" />

        {/* Variant Glow */}
        {hasVariant && (
          <div className={`absolute inset-0 opacity-20 pointer-events-none ${variant.styleClass} blur-3xl z-0`} />
        )}

        {/* 3D Scene Container (Only for Ores or Special items like Sound Shard) */}
        {(isOre || isSoundShard) && (
          <div className="relative z-0 w-full bg-gradient-to-b from-black/50 to-transparent">
            <ThreeScene
              color={isSoundShard ? '#6ee7b7' : modelColor}
              intensity={intensity}
              isLiquidLuck={isLiquidLuck}
              isSoundShard={isSoundShard}
            />

            {/* Floating Labels inside 3D view */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
              <div className="text-left">
                <div className={`text-xs font-mono uppercase tracking-widest ${tier.textColor} drop-shadow-md`}>
                  {tier.name} // NO.{item.rarityId}
                </div>
                {hasVariant && (
                  <div className={`text-xs font-mono uppercase tracking-widest mt-1 ${variant.styleClass.split(' ')[0]}`}>
                    VARIANT: {variant.name}
                  </div>
                )}
              </div>
              <div className="text-xs font-mono text-neutral-500 uppercase tracking-widest border border-neutral-700 px-2 py-1 rounded bg-black/50">
                {isSoundShard ? 'ARTIFACT' : 'MATERIAL'}
              </div>
            </div>
          </div>
        )}

        {/* Content Layout */}
        <div className={`relative z-10 flex flex-col items-center text-center space-y-4 p-8 ${(isOre || isSoundShard) ? 'pt-0 bg-gradient-to-t from-neutral-900 via-neutral-900 to-transparent' : 'pt-8'} transform translate-z-10`}>

          {/* Header for Non-Ores */}
          {(!isOre && !isSoundShard) && (
            <div className="w-full flex justify-between items-start border-b border-white/10 pb-4 mb-4">
              <div className="text-left">
                <div className={`text-xs font-mono uppercase tracking-widest ${tier.textColor}`}>
                  {tier.name} // NO.{item.rarityId}
                </div>
                {hasVariant && (
                  <div className={`text-xs font-mono uppercase tracking-widest mt-1 ${variant.styleClass.split(' ')[0]}`}>
                    VARIANT: {variant.name}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-[10px] text-neutral-500 font-mono">
                  SECURE ITEM
                </div>
                {hasVariant && (
                  <div className="text-[10px] text-neutral-500 font-mono mt-1">
                    x{variant.multiplier} RARITY
                  </div>
                )}
              </div>
            </div>
          )}

          <div className={(isOre || isSoundShard) ? "py-4" : "py-8"}>
            <h1 className={`text-3xl md:text-4xl font-bold ${tier.textColor} drop-shadow-md mb-4 ${hasVariant ? variant.styleClass : ''}`}>
              {hasVariant ? variant.prefix : ''} {item.text}
            </h1>
            <p className="text-sm font-mono text-neutral-400 leading-relaxed max-w-xs mx-auto">
              {item.description}
            </p>
          </div>

          <div className="w-full pt-4 border-t border-white/10 flex flex-col gap-3">
            {(isOre || isSoundShard) ? (
              <div className="flex justify-between text-[10px] font-mono text-neutral-600 uppercase">
                <span>MINT CONDITION</span>
                <span>ID: {Math.random().toString(36).substring(7).toUpperCase()}</span>
              </div>
            ) : null}
            <button
              onClick={onClose}
              className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white font-mono text-xs tracking-widest uppercase transition-all"
            >
              CLOSE VISUALIZER
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};