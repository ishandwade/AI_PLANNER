import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Color } from 'three';
import { blobVertexShader, blobFragmentShader } from './dustShaders';

// Neon color map with RGB components
const COLOR_MAP = {
    orange: { r: 1.0, g: 0.42, b: 0.0 },
    cyan: { r: 0.0, g: 0.83, b: 1.0 },
    pink: { r: 1.0, g: 0.18, b: 0.54 },
    green: { r: 0.0, g: 0.9, b: 0.46 },
};

export default function DustOrb({ voiceActivity = 0, color = 'cyan' }) {
    const meshRef = useRef();
    const materialRef = useRef();
    const { viewport } = useThree();

    // Responsive scale
    const dynamicScale = Math.min(viewport.width, viewport.height) / 5.5;

    // Current and target color refs for smooth transitions
    const currentColor = useRef({ r: 0.0, g: 0.83, b: 1.0 });

    const uniforms = useMemo(() => ({
        u_time: { value: 0.0 },
        u_frequency: { value: 0.0 },
        u_intensity: { value: 1.0 },
        u_red: { value: currentColor.current.r },
        u_green: { value: currentColor.current.g },
        u_blue: { value: currentColor.current.b },
    }), []);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();

        if (materialRef.current) {
            // Update time
            materialRef.current.uniforms.u_time.value = t;

            // Voice activity → frequency uniform (maps 0-1 to 0-80 range like real audio)
            const targetFreq = voiceActivity * 80.0;
            materialRef.current.uniforms.u_frequency.value +=
                (targetFreq - materialRef.current.uniforms.u_frequency.value) * 0.12;

            // Base intensity for idle animation
            materialRef.current.uniforms.u_intensity.value = 1.0 + Math.sin(t * 0.5) * 0.3;

            // Smooth color transitions
            const target = COLOR_MAP[color] || COLOR_MAP['cyan'];
            const cur = currentColor.current;
            cur.r += (target.r - cur.r) * 0.06;
            cur.g += (target.g - cur.g) * 0.06;
            cur.b += (target.b - cur.b) * 0.06;

            materialRef.current.uniforms.u_red.value = cur.r;
            materialRef.current.uniforms.u_green.value = cur.g;
            materialRef.current.uniforms.u_blue.value = cur.b;
        }

        // Slow rotation
        if (meshRef.current) {
            meshRef.current.rotation.y = t * 0.08;
            meshRef.current.rotation.x = Math.sin(t * 0.05) * 0.1;
        }
    });

    return (
        <mesh ref={meshRef} scale={dynamicScale}>
            <icosahedronGeometry args={[2, 20]} />
            <shaderMaterial
                ref={materialRef}
                vertexShader={blobVertexShader}
                fragmentShader={blobFragmentShader}
                uniforms={uniforms}
                wireframe={true}
            />
        </mesh>
    );
}
