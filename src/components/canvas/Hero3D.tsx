'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Environment, ContactShadows } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useTheme } from 'next-themes';

const HERO_PALETTES = {
    dark: {
        glassColor: '#6366f1',    // Indigo glass
        glassBg: '#050510',
        orb1: '#8b5cf6',          // Purple
        orb2: '#a855f7',          // Lighter purple
        transmission: 0.9,
        attenuation: '#1a1a2e',
        bg: '#000000'
    },
    light: {
        glassColor: '#c7d2fe',
        glassBg: '#ffffff',
        orb1: '#6366f1',
        orb2: '#a855f7',
        transmission: 0.85,
        attenuation: '#e0e7ff',
        bg: '#FFFFFF'
    }
};

function GlassShape({ palette }: { palette: any }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.1;
        }
    });

    return (
        <Float
            speed={2}
            rotationIntensity={1.5}
            floatIntensity={2}
        >
            <mesh ref={meshRef} scale={1.8}>
                <icosahedronGeometry args={[1, 15]} />
                <MeshTransmissionMaterial
                    backside={false}
                    samples={16}
                    resolution={1024}
                    transmission={palette.transmission}
                    roughness={0.0}
                    clearcoat={1}
                    clearcoatRoughness={0.0}
                    thickness={0.5}
                    ior={1.5}
                    chromaticAberration={0.06}
                    anisotropy={0.1}
                    distortion={0.5}
                    distortionScale={0.3}
                    temporalDistortion={0.5}
                    attenuationDistance={0.5}
                    attenuationColor={palette.attenuation}
                    color={palette.glassColor}
                    background={new THREE.Color(palette.glassBg)}
                />
            </mesh>
        </Float>
    );
}

function FloatingOrbs({ palette }: { palette: any }) {
    return (
        <group>
            <Float speed={1.5} rotationIntensity={1} floatIntensity={1.5} position={[3, 1, -2]}>
                <mesh scale={0.8}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial color={palette.orb1} emissive={palette.orb1} emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
                </mesh>
            </Float>
            <Float speed={2.5} rotationIntensity={1.5} floatIntensity={2} position={[-3, -1, -3]}>
                <mesh scale={0.6}>
                    <sphereGeometry args={[1, 32, 32]} />
                    <meshStandardMaterial color={palette.orb2} emissive={palette.orb2} emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
                </mesh>
            </Float>
        </group>
    )
}

export default function Hero3D() {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const isDark = resolvedTheme === 'dark';
    const palette = isDark ? HERO_PALETTES.dark : HERO_PALETTES.light;

    if (!palette) return null; // Safe guard

    return (
        <div className="canvas-container" style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none' }}>
            <Canvas key={resolvedTheme} camera={{ position: [0, 0, 6], fov: 45 }}>
                <color attach="background" args={[palette.bg]} />
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={1} />
                <Environment preset="city" />
                <group position={[0, 0, 0]}>
                    <GlassShape palette={palette} />
                </group>
                <FloatingOrbs palette={palette} />
                <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={20} blur={2.5} far={4.5} />
            </Canvas>
        </div>
    );
}
