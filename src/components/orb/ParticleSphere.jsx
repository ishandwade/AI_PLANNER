import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Color, DoubleSide, AdditiveBlending } from 'three';
import { vertexShader, fragmentShader } from './shaders';

export default function ParticleSphere({ voiceActivity = 0, color = 'cyan' }) {
    const meshRef = useRef();
    const materialRef = useRef();

    // Map color strings to Three.js colors
    const colorMap = useMemo(() => ({
        cyan: new Color('#00ffff'),
        purple: new Color('#b000ff'),
        pink: new Color('#ff00ff'),
    }), []);

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uPulse: { value: 0 },
            uColor: { value: colorMap[color] },
        }),
        [color, colorMap]
    );

    useFrame((state) => {
        const { clock } = state;
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = clock.getElapsedTime();

            // Smoothly interpolate pulse back to 0
            materialRef.current.uniforms.uPulse.value += (voiceActivity - materialRef.current.uniforms.uPulse.value) * 0.1;

            // Update color based on prop (animate color transition roughly)
            materialRef.current.uniforms.uColor.value.lerp(colorMap[color], 0.05);
        }

        // Slowly rotate the sphere
        if (meshRef.current) {
            meshRef.current.rotation.y += 0.005;
            meshRef.current.rotation.x += 0.002;
        }
    });

    return (
        <mesh ref={meshRef}>
            <icosahedronGeometry args={[2, 32]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent={true}
                blending={AdditiveBlending}
                side={DoubleSide}
                depthWrite={false}
                wireframe={true} // Makes it look a bit more "particle/tech" like
            />
        </mesh>
    );
}
