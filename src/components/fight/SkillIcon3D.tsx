'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Box, Sphere, Cylinder, Torus, Cone, Icosahedron } from '@react-three/drei'
import * as THREE from 'three'

interface SkillIcon3DProps {
  type: 'overclock' | 'emp_burst' | 'data_surge'
  isReady: boolean
  isActive: boolean
  size?: number
}

// Overclock - Lightning bolt / Power surge
function OverclockIcon({ isReady, isActive }: { isReady: boolean; isActive: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const boltRef = useRef<THREE.Group>(null)
  const glowRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Rotation
    groupRef.current.rotation.y += delta * (isActive ? 8 : isReady ? 1 : 0.2)

    // Bolt wiggle when active
    if (boltRef.current && isActive) {
      boltRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 30) * 0.2
    }

    // Glow pulse
    if (glowRef.current && isReady) {
      const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.5 + 1.5
      ;(glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse
    }
  })

  const color = isReady ? '#facc15' : '#4b5563'
  const emissive = isReady ? 1.5 : 0

  return (
    <Float speed={isReady ? 3 : 0.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Lightning bolt shape */}
        <group ref={boltRef}>
          {/* Top part */}
          <Box args={[0.25, 0.4, 0.1]} position={[-0.1, 0.25, 0]} rotation={[0, 0, -0.3]}>
            <meshStandardMaterial
              color={color}
              metalness={0.8}
              roughness={0.2}
              emissive={color}
              emissiveIntensity={emissive}
            />
          </Box>

          {/* Middle part */}
          <Box args={[0.5, 0.12, 0.1]} position={[0, 0, 0]}>
            <meshStandardMaterial
              color={color}
              metalness={0.8}
              roughness={0.2}
              emissive={color}
              emissiveIntensity={emissive}
            />
          </Box>

          {/* Bottom part */}
          <Box args={[0.25, 0.4, 0.1]} position={[0.1, -0.25, 0]} rotation={[0, 0, -0.3]}>
            <meshStandardMaterial
              color={color}
              metalness={0.8}
              roughness={0.2}
              emissive={color}
              emissiveIntensity={emissive}
            />
          </Box>
        </group>

        {/* Glow sphere */}
        {isReady && (
          <Sphere ref={glowRef} args={[0.6, 16, 16]}>
            <meshStandardMaterial
              color="#facc15"
              emissive="#facc15"
              emissiveIntensity={0.5}
              transparent
              opacity={0.15}
            />
          </Sphere>
        )}

        {/* Energy ring */}
        {isActive && (
          <Torus args={[0.5, 0.04, 8, 32]} rotation={[Math.PI / 2, 0, 0]}>
            <meshStandardMaterial
              color="#fff"
              emissive="#facc15"
              emissiveIntensity={3}
              transparent
              opacity={0.8}
            />
          </Torus>
        )}
      </group>
    </Float>
  )
}

// EMP Burst - Target/Shockwave
function EmpBurstIcon({ isReady, isActive }: { isReady: boolean; isActive: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const outerRingRef = useRef<THREE.Mesh>(null)
  const innerRingRef = useRef<THREE.Mesh>(null)

  useFrame((state, delta) => {
    if (!groupRef.current) return

    groupRef.current.rotation.z += delta * (isActive ? 10 : isReady ? 0.5 : 0.1)

    if (outerRingRef.current) {
      outerRingRef.current.rotation.z -= delta * 2
    }
    if (innerRingRef.current) {
      innerRingRef.current.rotation.z += delta * 3
    }
  })

  const color = isReady ? '#22d3ee' : '#4b5563'
  const emissive = isReady ? 1.5 : 0

  return (
    <Float speed={isReady ? 2 : 0.5} rotationIntensity={0.1} floatIntensity={0.2}>
      <group ref={groupRef}>
        {/* Outer ring */}
        <Torus ref={outerRingRef} args={[0.45, 0.04, 8, 32]}>
          <meshStandardMaterial
            color={color}
            metalness={0.9}
            roughness={0.1}
            emissive={color}
            emissiveIntensity={emissive}
          />
        </Torus>

        {/* Inner ring */}
        <Torus ref={innerRingRef} args={[0.28, 0.03, 8, 32]}>
          <meshStandardMaterial
            color={color}
            metalness={0.9}
            roughness={0.1}
            emissive={color}
            emissiveIntensity={emissive}
          />
        </Torus>

        {/* Center target */}
        <Sphere args={[0.12, 16, 16]}>
          <meshStandardMaterial
            color={isReady ? '#fff' : '#666'}
            emissive={color}
            emissiveIntensity={isReady ? 2 : 0}
          />
        </Sphere>

        {/* Crosshair lines */}
        {[0, 90, 180, 270].map((angle) => (
          <Box
            key={angle}
            args={[0.08, 0.2, 0.02]}
            position={[
              Math.cos((angle * Math.PI) / 180) * 0.35,
              Math.sin((angle * Math.PI) / 180) * 0.35,
              0
            ]}
            rotation={[0, 0, (angle * Math.PI) / 180]}
          >
            <meshStandardMaterial
              color={color}
              metalness={0.8}
              roughness={0.2}
              emissive={color}
              emissiveIntensity={emissive * 0.5}
            />
          </Box>
        ))}

        {/* Shockwave effect when active */}
        {isActive && (
          <>
            <Torus args={[0.6, 0.02, 8, 32]}>
              <meshStandardMaterial
                color="#fff"
                emissive="#22d3ee"
                emissiveIntensity={5}
                transparent
                opacity={0.6}
              />
            </Torus>
            <Torus args={[0.8, 0.015, 8, 32]}>
              <meshStandardMaterial
                color="#fff"
                emissive="#22d3ee"
                emissiveIntensity={3}
                transparent
                opacity={0.3}
              />
            </Torus>
          </>
        )}
      </group>
    </Float>
  )
}

// Data Surge - Data crystal / Chip
function DataSurgeIcon({ isReady, isActive }: { isReady: boolean; isActive: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const crystalRef = useRef<THREE.Mesh>(null)
  const orbitRef = useRef<THREE.Group>(null)

  useFrame((state, delta) => {
    if (!groupRef.current) return

    groupRef.current.rotation.y += delta * (isActive ? 5 : isReady ? 0.8 : 0.2)

    if (crystalRef.current) {
      crystalRef.current.rotation.x = state.clock.elapsedTime * (isActive ? 3 : 1)
      crystalRef.current.rotation.z = state.clock.elapsedTime * (isActive ? 2 : 0.5)
    }

    if (orbitRef.current) {
      orbitRef.current.rotation.y = state.clock.elapsedTime * 2
      orbitRef.current.rotation.x = state.clock.elapsedTime * 1.5
    }
  })

  const color = isReady ? '#a855f7' : '#4b5563'
  const emissive = isReady ? 1.5 : 0

  return (
    <Float speed={isReady ? 2 : 0.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Central crystal */}
        <Icosahedron ref={crystalRef} args={[0.35, 0]}>
          <meshStandardMaterial
            color={color}
            metalness={0.7}
            roughness={0.1}
            transparent
            opacity={0.9}
            emissive={color}
            emissiveIntensity={emissive}
          />
        </Icosahedron>

        {/* Inner core glow */}
        <Sphere args={[0.18, 16, 16]}>
          <meshStandardMaterial
            color={isReady ? '#e879f9' : '#555'}
            emissive={isReady ? '#e879f9' : '#333'}
            emissiveIntensity={isReady ? 3 : 0}
          />
        </Sphere>

        {/* Orbiting data points */}
        <group ref={orbitRef}>
          {[0, 1, 2, 3].map((i) => (
            <Box
              key={i}
              args={[0.08, 0.08, 0.08]}
              position={[
                Math.cos((i / 4) * Math.PI * 2) * 0.55,
                0,
                Math.sin((i / 4) * Math.PI * 2) * 0.55
              ]}
            >
              <meshStandardMaterial
                color={isReady ? '#c084fc' : '#666'}
                emissive={color}
                emissiveIntensity={isReady ? 2 : 0}
              />
            </Box>
          ))}
        </group>

        {/* Data stream ring */}
        <Torus args={[0.55, 0.02, 8, 32]} rotation={[Math.PI / 2, 0, 0]}>
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={emissive * 0.5}
            transparent
            opacity={0.5}
          />
        </Torus>

        {/* Activation burst */}
        {isActive && (
          <Sphere args={[0.7, 16, 16]}>
            <meshStandardMaterial
              color="#e879f9"
              emissive="#e879f9"
              emissiveIntensity={5}
              transparent
              opacity={0.3}
            />
          </Sphere>
        )}
      </group>
    </Float>
  )
}

export function SkillIcon3D({ type, isReady, isActive, size = 48 }: SkillIcon3DProps) {
  return (
    <div style={{ width: size, height: size }} className="flex-shrink-0">
      <Canvas
        camera={{ position: [0, 0, 2.2], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[2, 2, 2]} intensity={1} />
        <pointLight position={[-2, -2, 2]} intensity={0.5} />

        {type === 'overclock' && <OverclockIcon isReady={isReady} isActive={isActive} />}
        {type === 'emp_burst' && <EmpBurstIcon isReady={isReady} isActive={isActive} />}
        {type === 'data_surge' && <DataSurgeIcon isReady={isReady} isActive={isActive} />}
      </Canvas>
    </div>
  )
}
