import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useThree, useFrame, extend } from '@react-three/fiber';
import { OrbitControls, Effects } from '@react-three/drei';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';
import { Vector2 } from 'three';
import DustOrb from './DustOrb';

// Extend so R3F knows about UnrealBloomPass
extend({ UnrealBloomPass });

function BloomEffect() {
    const { size } = useThree();
    const bloomRef = useRef();

    useEffect(() => {
        if (bloomRef.current) {
            bloomRef.current.resolution = new Vector2(size.width, size.height);
        }
    }, [size]);

    return (
        <Effects>
            <unrealBloomPass
                ref={bloomRef}
                args={[new Vector2(size.width, size.height), 0.4, 0.8, 0.5]}
            />
        </Effects>
    );
}

export default function OrbViewer({ voiceActivity = 0, color = 'cyan' }) {
    return (
        <div className="orb-container" style={{ background: '#000000' }}>
            <Canvas
                camera={{ position: [0, 0, 8], fov: 60 }}
                dpr={[1, 2]}
                gl={{ antialias: true }}
            >
                <color attach="background" args={['#000000']} />

                <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    minDistance={4}
                    maxDistance={15}
                    enableDamping={true}
                    dampingFactor={0.05}
                    rotateSpeed={0.5}
                />

                <Suspense fallback={null}>
                    <DustOrb voiceActivity={voiceActivity} color={color} />
                </Suspense>

                <BloomEffect />
            </Canvas>
        </div>
    );
}
