'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Box, Sphere, Cylinder, Torus, Octahedron } from '@react-three/drei'
import * as THREE from 'three'

interface Currency3DProps {
  type: 'scrap' | 'data' | 'core'
  isAnimating?: boolean
  size?: number
}

function ScrapIcon({ isAnimating }: { isAnimating?: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const teethRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (!groupRef.current) return
    groupRef.current.rotation.z += delta * (isAnimating ? 4 : 0.5)
  })

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Main gear body */}
        <Cylinder args={[0.5, 0.5, 0.15, 32]}>
          <meshStandardMaterial
            color="#f59e0b"
            metalness={0.9}
            roughness={0.1}
            emissive="#f59e0b"
            emissiveIntensity={isAnimating ? 1 : 0.3}
          />
        </Cylinder>

        {/* Inner ring */}
        <Torus args={[0.25, 0.06, 8, 24]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial
            color="#854d0e"
            metalness={0.9}
            roughness={0.2}
          />
        </Torus>

        {/* Gear teeth */}
        <group ref={teethRef}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Box
              key={i}
              args={[0.15, 0.2, 0.12]}
              position={[
                Math.cos((i / 8) * Math.PI * 2) * 0.55,
                Math.sin((i / 8) * Math.PI * 2) * 0.55,
                0
              ]}
              rotation={[0, 0, (i / 8) * Math.PI * 2]}
            >
              <meshStandardMaterial
                color="#f59e0b"
                metalness={0.9}
                roughness={0.1}
                emissive="#f59e0b"
                emissiveIntensity={isAnimating ? 1 : 0.3}
              />
            </Box>
          ))}
        </group>

        {/* Center hole */}
        <Cylinder args={[0.12, 0.12, 0.2, 16]}>
          <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.5} />
        </Cylinder>
      </group>
    </Float>
  )
}

function DataIcon({ isAnimating }: { isAnimating?: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const innerRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (!groupRef.current || !innerRef.current) return
    groupRef.current.rotation.y += delta * (isAnimating ? 3 : 0.3)
    innerRef.current.rotation.z = state.clock.elapsedTime * 2
  })

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Outer chip frame */}
        <Box args={[0.7, 0.7, 0.1]}>
          <meshStandardMaterial
            color="#06b6d4"
            metalness={0.9}
            roughness={0.1}
            emissive="#06b6d4"
            emissiveIntensity={isAnimating ? 1.5 : 0.4}
          />
        </Box>

        {/* Inner circuit pattern */}
        <Box ref={innerRef} args={[0.4, 0.4, 0.12]} position={[0, 0, 0.02]}>
          <meshStandardMaterial
            color="#0e7490"
            metalness={0.9}
            roughness={0.2}
          />
        </Box>

        {/* Central core */}
        <Sphere args={[0.12, 16, 16]} position={[0, 0, 0.08]}>
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={isAnimating ? 3 : 1}
            transparent
            opacity={0.9}
          />
        </Sphere>

        {/* Connection pins */}
        {[-0.35, 0.35].map((x) =>
          [-0.25, 0, 0.25].map((y, i) => (
            <Box key={`${x}-${y}`} args={[0.08, 0.05, 0.08]} position={[x, y, 0]}>
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
            </Box>
          ))
        )}
        {[-0.25, 0, 0.25].map((x) =>
          [-0.35, 0.35].map((y) => (
            <Box key={`${x}-${y}`} args={[0.05, 0.08, 0.08]} position={[x, y, 0]}>
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
            </Box>
          ))
        )}
      </group>
    </Float>
  )
}

function CoreIcon({ isAnimating }: { isAnimating?: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const innerRef = useRef<THREE.Mesh>(null)
  const outerRingRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (!groupRef.current) return
    groupRef.current.rotation.y += delta * (isAnimating ? 2 : 0.5)

    if (innerRef.current) {
      innerRef.current.rotation.x = state.clock.elapsedTime * 1.5
      innerRef.current.rotation.z = state.clock.elapsedTime * 1
    }

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = state.clock.elapsedTime * -0.5
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.4}>
      <group ref={groupRef}>
        {/* Outer diamond shell */}
        <Octahedron args={[0.5, 0]}>
          <meshStandardMaterial
            color="#a855f7"
            metalness={0.8}
            roughness={0.1}
            transparent
            opacity={0.7}
            emissive="#a855f7"
            emissiveIntensity={isAnimating ? 2 : 0.5}
          />
        </Octahedron>

        {/* Inner core */}
        <Sphere ref={innerRef} args={[0.25, 16, 16]}>
          <meshStandardMaterial
            color="#c084fc"
            emissive="#c084fc"
            emissiveIntensity={isAnimating ? 4 : 2}
          />
        </Sphere>

        {/* Orbiting ring */}
        <Torus ref={outerRingRef} args={[0.45, 0.03, 8, 32]} rotation={[Math.PI / 4, 0, 0]}>
          <meshStandardMaterial
            color="#e879f9"
            emissive="#e879f9"
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
        </Torus>

        {/* Energy particles */}
        {[0, 1, 2, 3].map((i) => (
          <Sphere
            key={i}
            args={[0.05, 8, 8]}
            position={[
              Math.cos((i / 4) * Math.PI * 2) * 0.6,
              Math.sin((i / 4) * Math.PI * 2) * 0.6,
              0
            ]}
          >
            <meshStandardMaterial
              color="#f0abfc"
              emissive="#f0abfc"
              emissiveIntensity={3}
            />
          </Sphere>
        ))}
      </group>
    </Float>
  )
}

export function CurrencyIcon3D({ type, isAnimating = false, size = 24 }: Currency3DProps) {
  return (
    <div style={{ width: size, height: size }} className="flex-shrink-0">
      <Canvas
        camera={{ position: [0, 0, 2.5], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[2, 2, 2]} intensity={1.2} />
        <pointLight position={[-2, -2, 2]} intensity={0.6} color="#a855f7" />

        {type === 'scrap' && <ScrapIcon isAnimating={isAnimating} />}
        {type === 'data' && <DataIcon isAnimating={isAnimating} />}
        {type === 'core' && <CoreIcon isAnimating={isAnimating} />}
      </Canvas>
    </div>
  )
}
