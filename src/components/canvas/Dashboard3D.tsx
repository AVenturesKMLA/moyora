'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Environment } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function DashboardShape() {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.2;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.3;
        }
    });

    return (
        <Float speed={2} rotationIntensity={2} floatIntensity={1}>
            <mesh ref={meshRef} scale={1.2}>
                <torusKnotGeometry args={[1, 0.3, 128, 16]} />
                <MeshTransmissionMaterial
                    backside={false}
                    samples={16}
                    resolution={512}
                    transmission={0.9}
                    roughness={0.1}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    thickness={0.5}
                    ior={1.5}
                    chromaticAberration={0.1}
                    anisotropy={0.1}
                    distortion={0.2}
                    distortionScale={0.2}
                    temporalDistortion={0.1}
                    attenuationDistance={0.5}
                    attenuationColor="#ffffff"
                    color="#a0d8ef"
                    background={new THREE.Color('#000000')}
                />
            </mesh>
        </Float>
    );
}

export default function Dashboard3D() {
    return (
        <div className="canvas-container" style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0, zIndex: 0, opacity: 0.6, pointerEvents: 'none' }}>
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <Environment preset="city" />
                <DashboardShape />
            </Canvas>
        </div>
    );
}
