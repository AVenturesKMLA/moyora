'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Environment, Box } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';

function NestedCubes() {
    const outerRef = useRef<THREE.Mesh>(null);
    const innerRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const time = state.clock.getElapsedTime();
        if (outerRef.current) {
            outerRef.current.rotation.y = time * 0.2;
            outerRef.current.rotation.x = time * 0.1;
        }
        if (innerRef.current) {
            innerRef.current.rotation.y = -time * 0.4;
            innerRef.current.rotation.z = time * 0.2;
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={1}>
            <group>
                {/* Outer Cube */}
                <mesh ref={outerRef} scale={1.8}>
                    <boxGeometry args={[1, 1, 1]} />
                    <MeshTransmissionMaterial
                        backside={true}
                        samples={8}
                        resolution={256}
                        transmission={0.9}
                        roughness={0.1}
                        thickness={0.2}
                        ior={1.2}
                        chromaticAberration={0.02}
                        color="#d0ffca"
                    />
                </mesh>

                {/* Inner Cube */}
                <mesh ref={innerRef} scale={0.8}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="#34C759" emissive="#34C759" emissiveIntensity={0.5} roughness={0.2} metalness={0.8} />
                </mesh>

                {/* Decorative Points */}
                <points scale={2.5}>
                    <boxGeometry args={[1, 1, 1, 4, 4, 4]} />
                    <pointsMaterial size={0.02} color="#ffffff" transparent opacity={0.4} />
                </points>
            </group>
        </Float>
    );
}

export default function Manage3D() {
    return (
        <div className="manage-3d-visual" style={{ width: '100%', height: '300px', position: 'relative', overflow: 'hidden' }}>
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <Environment preset="city" />
                <NestedCubes />
            </Canvas>
        </div>
    );
}
