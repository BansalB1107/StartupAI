import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

const GRID_SIZE = 22; // 22x22 = 484 blocks
const NUM_BLOCKS = GRID_SIZE * GRID_SIZE;
const BLOCK_SIZE = 0.8;
const GAP = 0.2;

// Phases: 0 = Wave, 1 = Explode, 2 = Assemble
// Renders an immersive 3D background animation with dynamic phases built using Three.js and React Fiber.
export default function Advanced3DHero({ phase = 0 }) {
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: 'transparent' }}>
      <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
        <Scene phase={phase} />
      </Canvas>
    </div>
  );
}

// Controls camera positioning and rotation smoothly based on the current active animation phase.
function CameraRig({ phase }) {
  const { camera } = useThree();
  
  useFrame(() => {
    let targetPos = new THREE.Vector3();
    let targetRot = new THREE.Euler();
    
    if (phase === 0) {
      targetPos.set(0, 25, 30);
      targetRot.set(-Math.PI / 4, 0, 0);
    } else if (phase === 1) {
      targetPos.set(0, 10, 45);
      targetRot.set(-Math.PI / 12, 0, 0);
    } else {
      targetPos.set(0, 5, 35);
      targetRot.set(0, 0, 0);
    }
    
    camera.position.lerp(targetPos, 0.05);
    camera.rotation.x = THREE.MathUtils.lerp(camera.rotation.x, targetRot.x, 0.05);
    camera.rotation.y = THREE.MathUtils.lerp(camera.rotation.y, targetRot.y, 0.05);
    camera.rotation.z = THREE.MathUtils.lerp(camera.rotation.z, targetRot.z, 0.05);
  });
  
  return <PerspectiveCamera makeDefault fov={45} />;
}

// Base colors
const color1 = new THREE.Color('#3B82F6'); // Blue
const color2 = new THREE.Color('#1D4ED8'); // Navy
const color3 = new THREE.Color('#3b82f6'); // Blue
const color4 = new THREE.Color('#1e293b'); // Dark slate/card bg

// Orchestrates the main 3D scene, rendering instanced meshes, lighting, and complex block animations.
function Scene({ phase }) {
  const meshRef = useRef();
  
  // Dummy object for matrix calculations
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Block definitions (per-instance data)
  const blocks = useMemo(() => {
    const data = [];
    
    // Calculate columns for assemble phase
    // Let's divide into 3 columns, each 7 blocks wide
    
    for (let i = 0; i < NUM_BLOCKS; i++) {
      // --- 1. WAVE PHASE DATA ---
      const gridX = (i % GRID_SIZE) - GRID_SIZE / 2;
      const gridZ = Math.floor(i / GRID_SIZE) - GRID_SIZE / 2;
      const waveX = gridX * (BLOCK_SIZE + GAP);
      const waveZ = gridZ * (BLOCK_SIZE + GAP);
      const waveY = 0;
      
      const waveColor = new THREE.Color().lerpColors(color1, color3, (gridX + GRID_SIZE/2) / GRID_SIZE);

      // --- 2. EXPLODE PHASE DATA ---
      const explodeX = waveX + (Math.random() - 0.5) * 40;
      const explodeY = (Math.random() - 0.5) * 40 + 10;
      const explodeZ = waveZ + (Math.random() - 0.5) * 60 + 20; // explode towards camera
      const explodeRotX = Math.random() * Math.PI * 4;
      const explodeRotY = Math.random() * Math.PI * 4;
      const explodeRotZ = Math.random() * Math.PI * 4;
      
      // --- 3. ASSEMBLE PHASE DATA (Kanban Board) ---
      // Distribute blocks into 3 main columns to look like Kanban cards
      const col = i % 3;
      const colWidth = 6;
      const indexInCol = Math.floor(i / 3);
      
      const cardNum = Math.floor(indexInCol / (colWidth * 5)); // 5 rows per card
      const idxInCard = indexInCol % (colWidth * 5);
      
      const cardRow = Math.floor(idxInCard / colWidth);
      const cardCol = idxInCard % colWidth;
      
      const spacingX = 1.0;
      const spacingY = 1.0;
      
      // Positioning
      const colOffsetX = (col - 1) * 9; // -9, 0, 9
      const cardOffsetY = (cardNum * -7) + 12; // top to bottom
      
      const assembleX = colOffsetX + (cardCol - colWidth/2) * spacingX;
      const assembleY = cardOffsetY - cardRow * spacingY;
      const assembleZ = (Math.random() - 0.5) * 0.1; // flat
      
      const isHeader = cardRow === 0;
      const assembleColor = isHeader ? (col === 0 ? color1 : col === 1 ? color2 : color3) : color4.clone().lerp(new THREE.Color('#ffffff'), 0.05 + Math.random()*0.05);

      data.push({
        wave: { pos: [waveX, waveY, waveZ], rot: [0, 0, 0], color: waveColor.clone() },
        explode: { pos: [explodeX, explodeY, explodeZ], rot: [explodeRotX, explodeRotY, explodeRotZ], color: waveColor.clone() },
        assemble: { pos: [assembleX, assembleY, assembleZ], rot: [0, 0, 0], color: assembleColor.clone() },
        currentPos: new THREE.Vector3(waveX, waveY, waveZ),
        currentRot: new THREE.Euler(0, 0, 0),
        currentColor: waveColor.clone(),
        delay: Math.random() * 0.8 // Random delay for explosion
      });
    }
    return data;
  }, [color1, color2, color3, color4]);

  const colorArray = useMemo(() => new Float32Array(NUM_BLOCKS * 3), []);
  
  // Animation state
  const timeRef = useRef(0);
  const phaseTime = useRef(0);
  const lastPhase = useRef(phase);

  useFrame((state, delta) => {
    timeRef.current += delta;
    
    if (lastPhase.current !== phase) {
      phaseTime.current = 0; // Reset animation time for new phase
      lastPhase.current = phase;
    }
    
    phaseTime.current += delta;
    
    const t = timeRef.current;
    
    for (let i = 0; i < NUM_BLOCKS; i++) {
      const b = blocks[i];
      let targetPos, targetRot, targetColor;
      
      // Determine target state based on phase
      if (phase === 0) {
        // Wave math
        const waveY = Math.sin(t * 2 + b.wave.pos[0] * 0.3 + b.wave.pos[2] * 0.3) * 2;
        targetPos = new THREE.Vector3(b.wave.pos[0], waveY, b.wave.pos[2]);
        targetRot = new THREE.Euler(0, 0, 0);
        targetColor = b.wave.color;
      } else if (phase === 1) {
        // Explode
        targetPos = new THREE.Vector3(...b.explode.pos);
        targetRot = new THREE.Euler(...b.explode.rot);
        targetColor = b.explode.color;
      } else if (phase === 2) {
        // Assemble
        targetPos = new THREE.Vector3(...b.assemble.pos);
        targetRot = new THREE.Euler(...b.assemble.rot);
        targetColor = b.assemble.color;
      }

      // Lerp towards target
      let lerpSpeed = 0.05;
      if (phase === 1) {
        // Explode logic (delayed start)
        if (phaseTime.current > b.delay) {
          lerpSpeed = 0.1;
        } else {
          lerpSpeed = 0; // Don't move yet
        }
      } else if (phase === 2) {
        // Assemble logic - smooth spring-like
        // Add a slight delay based on distance so it looks like it's assembling piece by piece
        if (phaseTime.current > b.delay * 0.5) {
          lerpSpeed = 0.08;
        } else {
          lerpSpeed = 0;
        }
      }

      if (lerpSpeed > 0) {
        b.currentPos.lerp(targetPos, lerpSpeed);
        b.currentRot.x = THREE.MathUtils.lerp(b.currentRot.x, targetRot.x, lerpSpeed);
        b.currentRot.y = THREE.MathUtils.lerp(b.currentRot.y, targetRot.y, lerpSpeed);
        b.currentRot.z = THREE.MathUtils.lerp(b.currentRot.z, targetRot.z, lerpSpeed);
        b.currentColor.lerp(targetColor, lerpSpeed);
      }

      // Apply to dummy
      dummy.position.copy(b.currentPos);
      dummy.rotation.copy(b.currentRot);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
      
      // Apply color
      b.currentColor.toArray(colorArray, i * 3);
    }

    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) {
      meshRef.current.geometry.attributes.color.needsUpdate = true;
    }
  });

  // Assign initial colors
  useEffect(() => {
    for (let i = 0; i < NUM_BLOCKS; i++) {
      blocks[i].currentColor.toArray(colorArray, i * 3);
    }
    meshRef.current.geometry.setAttribute('color', new THREE.InstancedBufferAttribute(colorArray, 3));
  }, [blocks, colorArray]);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 20, 10]} intensity={2.0} color="#ffffff" />
      <directionalLight position={[-10, -20, -10]} intensity={0.5} color="#3B82F6" />
      
      {/* Animated Camera */}
      <CameraRig phase={phase} />

      <instancedMesh ref={meshRef} args={[null, null, NUM_BLOCKS]} castShadow receiveShadow>
        {/* Short blocks in phase 0, maybe scale them down? BoxGeometry handles it */}
        <boxGeometry args={[BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE]}>
          <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
        </boxGeometry>
        <meshStandardMaterial vertexColors roughness={0.15} metalness={0.1} />
      </instancedMesh>
      
      <Environment preset="city" />
    </>
  );
}
