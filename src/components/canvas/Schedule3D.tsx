'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Environment, Stars } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function OctahedronCore() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.3;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
        }
    });

    return (
        <Float speed={3} rotationIntensity={2} floatIntensity={1}>
            <mesh ref={meshRef} scale={1.5}>
                <octahedronGeometry args={[1, 0]} />
                <MeshTransmissionMaterial
                    backside={false}
                    samples={16}
                    resolution={512}
                    transmission={0.95}
                    roughness={0.0}
                    clearcoat={1}
                    clearcoatRoughness={0.0}
                    thickness={0.8}
                    ior={1.4}
                    chromaticAberration={0.05}
                    anisotropy={0.1}
                    distortion={0.1}
                    distortionScale={0.1}
                    temporalDistortion={0.1}
                    attenuationDistance={1}
                    attenuationColor="#ffffff"
                    color="#f0f8ff"
                />
            </mesh>
        </Float>
    );
}

function RotatingRings() {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.z = state.clock.getElapsedTime() * 0.2;
        }
    });

    return (
        <group ref={groupRef}>
            {[1.8, 2.2, 2.6].map((radius, i) => (
                <mesh key={i} rotation={[Math.PI / (i + 1.5), Math.PI / (i + 2), 0]}>
                    <torusGeometry args={[radius, 0.02, 16, 100]} />
                    <meshStandardMaterial color="#007AFF" emissive="#007AFF" emissiveIntensity={0.5} opacity={0.3} transparent />
                </mesh>
            ))}
        </group>
    );
}

export default function Schedule3D() {
    return (
        <div className="schedule-3d-visual" style={{ width: '100%', height: '300px', position: 'relative', overflow: 'hidden' }}>
            <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
                <ambientLight intensity={0.4} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                <Environment preset="city" />
                <Stars radius={100} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
                <OctahedronCore />
                <RotatingRings />
            </Canvas>
        </div>
    );
}
