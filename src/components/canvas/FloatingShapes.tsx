'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshTransmissionMaterial, Environment } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

function Shape({ position, color, speed, rotationIntensity, floatIntensity, scale, type }: any) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.1 * speed;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.15 * speed;
        }
    });

    return (
        <Float
            speed={speed * 2}
            rotationIntensity={rotationIntensity}
            floatIntensity={floatIntensity}
            position={position}
        >
            <mesh ref={meshRef} scale={scale}>
                {type === 'sphere' ? (
                    <sphereGeometry args={[1, 32, 32]} />
                ) : (
                    <torusGeometry args={[0.7, 0.3, 16, 32]} />
                )}
                <MeshTransmissionMaterial
                    backside={false}
                    samples={8}
                    resolution={512}
                    transmission={0.9}
                    roughness={0.1}
                    clearcoat={1}
                    clearcoatRoughness={0.1}
                    thickness={0.5}
                    ior={1.2}
                    chromaticAberration={0.03}
                    anisotropy={0.1}
                    distortion={0.3}
                    distortionScale={0.2}
                    temporalDistortion={0.2}
                    attenuationDistance={1}
                    attenuationColor="#ffffff"
                    color={color}
                />
            </mesh>
        </Float>
    );
}

export default function FloatingShapes() {
    const shapes = useMemo(() => [
        { id: 1, type: 'sphere', position: [4, 2, -5], color: '#c0dcff', scale: 1.2, speed: 1 },
        { id: 2, type: 'torus', position: [-5, -3, -4], color: '#e0c0ff', scale: 1.5, speed: 1.2 },
        { id: 3, type: 'sphere', position: [6, -4, -6], color: '#ffffff', scale: 0.8, speed: 1.5 },
        { id: 4, type: 'torus', position: [-7, 3, -7], color: '#c0ffdf', scale: 0.9, speed: 0.8 },
    ], []);

    return (
        <div className="floating-shapes-container" style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            opacity: 0.6
        }}>
            <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
                <ambientLight intensity={0.4} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                <Environment preset="city" />

                {shapes.map((shape) => (
                    <Shape
                        key={shape.id}
                        {...shape}
                        rotationIntensity={1}
                        floatIntensity={2}
                    />
                ))}
            </Canvas>
        </div>
    );
}
