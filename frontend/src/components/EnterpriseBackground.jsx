import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

// Renders an animated 3D particle constellation field using React Three Fiber for visual depth.
function ConstellationField() {
    const pointsRef = useRef();

    // Generate 100 particles for the ambient network
    const [positions] = useMemo(() => {
        const count = 100;
        const pos = new Float32Array(count * 3);
        
        for (let i = 0; i < count; i++) {
            // Spread particles in a wide 3D space
            pos[i * 3] = (Math.random() - 0.5) * 20;     // x
            pos[i * 3 + 1] = (Math.random() - 0.5) * 20; // y
            pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 5; // z
        }
        
        return [pos];
    }, []);

    useFrame((state) => {
        if (!pointsRef.current) return;
        
        // Slow institutional rotation
        pointsRef.current.rotation.y = state.clock.elapsedTime * 0.015;
        pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.05) * 0.05;
        
        // Gentle sine-wave vertical floating
        pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.5;
    });

    return (
        <Points ref={pointsRef} positions={positions} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#3B82F6"
                size={0.15}
                sizeAttenuation={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                opacity={0.3}
            />
        </Points>
    );
}

// Mounts an ambient, low-performance-impact 3D background canvas for enterprise aesthetics.
export default function EnterpriseBackground() {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setPrefersReducedMotion(mediaQuery.matches);
        
        const handleChange = (e) => {
            setPrefersReducedMotion(e.matches);
        };
        
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    if (prefersReducedMotion) {
        return null;
    }

    return (
        <div className="enterprise-ambient-bg">
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }} dpr={[1, 2]} powerPreference="high-performance">
                <ConstellationField />
            </Canvas>
        </div>
    );
}
