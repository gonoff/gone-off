'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, Box, Cylinder } from '@react-three/drei'
import * as THREE from 'three'

interface RobotBossProps {
  stage: number
  isHit: boolean
  isDead: boolean
  hpPercent: number
}

function RobotBoss({ stage, isHit, isDead, hpPercent }: RobotBossProps) {
  const groupRef = useRef<THREE.Group>(null)
  const eyeLeftRef = useRef<THREE.Mesh>(null)
  const eyeRightRef = useRef<THREE.Mesh>(null)
  const bodyRef = useRef<THREE.Mesh>(null)

  // Color based on boss type and HP
  const baseColor = useMemo(() => {
    if (stage % 100 === 0) return '#a855f7' // Major boss - purple
    if (stage % 50 === 0) return '#ef4444'  // Named boss - red
    if (stage % 10 === 0) return '#f59e0b'  // Mini boss - orange
    return '#22d3ee' // Regular - cyan
  }, [stage])

  const eyeColor = useMemo(() => {
    if (hpPercent < 0.25) return '#ef4444'
    if (hpPercent < 0.5) return '#f59e0b'
    return '#22c55e'
  }, [hpPercent])

  // Animation
  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Idle hover
    groupRef.current.rotation.y += delta * 0.3

    // Hit shake
    if (isHit) {
      groupRef.current.position.x = Math.sin(state.clock.elapsedTime * 50) * 0.1
    } else {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, 0, 0.1)
    }

    // Death animation - shrink when dead, grow back when alive
    if (isDead) {
      groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, 0, 0.15)
      groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, 0, 0.15)
      groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, 0, 0.15)
    } else {
      // Restore scale when not dead
      groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, scale, 0.1)
      groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, scale, 0.1)
      groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, scale, 0.1)
    }

    // Eye glow pulse
    if (eyeLeftRef.current && eyeRightRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.3 + 0.7
      ;(eyeLeftRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse
      ;(eyeRightRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse
    }
  })

  // Scale based on boss type
  const scale = useMemo(() => {
    if (stage % 100 === 0) return 1.5
    if (stage % 50 === 0) return 1.3
    if (stage % 10 === 0) return 1.15
    return 1
  }, [stage])

  return (
    <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
      <group ref={groupRef}>
        {/* Body */}
        <Box ref={bodyRef} args={[1.2, 1.5, 0.8]} position={[0, 0, 0]}>
          <MeshDistortMaterial
            color={baseColor}
            metalness={0.8}
            roughness={0.2}
            distort={isHit ? 0.3 : 0.1}
            speed={2}
          />
        </Box>

        {/* Head */}
        <Box args={[0.8, 0.6, 0.6]} position={[0, 1.1, 0]}>
          <meshStandardMaterial
            color={baseColor}
            metalness={0.9}
            roughness={0.1}
            emissive={baseColor}
            emissiveIntensity={0.2}
          />
        </Box>

        {/* Eye Left */}
        <Sphere ref={eyeLeftRef} args={[0.12, 16, 16]} position={[-0.2, 1.15, 0.31]}>
          <meshStandardMaterial
            color={eyeColor}
            emissive={eyeColor}
            emissiveIntensity={1}
          />
        </Sphere>

        {/* Eye Right */}
        <Sphere ref={eyeRightRef} args={[0.12, 16, 16]} position={[0.2, 1.15, 0.31]}>
          <meshStandardMaterial
            color={eyeColor}
            emissive={eyeColor}
            emissiveIntensity={1}
          />
        </Sphere>

        {/* Antenna */}
        <Cylinder args={[0.03, 0.03, 0.4]} position={[0, 1.6, 0]}>
          <meshStandardMaterial color="#666666" metalness={0.9} roughness={0.2} />
        </Cylinder>
        <Sphere args={[0.06, 8, 8]} position={[0, 1.8, 0]}>
          <meshStandardMaterial
            color="#ef4444"
            emissive="#ef4444"
            emissiveIntensity={1.5}
          />
        </Sphere>

        {/* Arms */}
        <Box args={[0.25, 0.8, 0.25]} position={[-0.85, -0.1, 0]}>
          <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.3} />
        </Box>
        <Box args={[0.25, 0.8, 0.25]} position={[0.85, -0.1, 0]}>
          <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.3} />
        </Box>

        {/* Legs */}
        <Box args={[0.3, 0.7, 0.3]} position={[-0.35, -1.1, 0]}>
          <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.3} />
        </Box>
        <Box args={[0.3, 0.7, 0.3]} position={[0.35, -1.1, 0]}>
          <meshStandardMaterial color="#444444" metalness={0.8} roughness={0.3} />
        </Box>

        {/* Chest panel */}
        <Box args={[0.6, 0.4, 0.05]} position={[0, 0.2, 0.43]}>
          <meshStandardMaterial
            color="#111111"
            emissive={baseColor}
            emissiveIntensity={0.5}
          />
        </Box>

        {/* HP indicator lights on chest */}
        {[0, 1, 2, 3, 4].map((i) => (
          <Sphere key={i} args={[0.04, 8, 8]} position={[-0.2 + i * 0.1, 0.2, 0.47]}>
            <meshStandardMaterial
              color={i / 5 < hpPercent ? '#22c55e' : '#333333'}
              emissive={i / 5 < hpPercent ? '#22c55e' : '#000000'}
              emissiveIntensity={i / 5 < hpPercent ? 1 : 0}
            />
          </Sphere>
        ))}
      </group>
    </Float>
  )
}

interface Boss3DProps {
  stage: number
  isHit: boolean
  isDead: boolean
  hpPercent: number
}

export function Boss3D({ stage, isHit, isDead, hpPercent }: Boss3DProps) {
  return (
    <div className="w-full h-64 relative">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.3} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#22d3ee" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#a855f7" />
        <spotLight
          position={[0, 5, 5]}
          angle={0.3}
          penumbra={1}
          intensity={1}
          color="#ffffff"
        />

        {/* Boss */}
        <RobotBoss
          stage={stage}
          isHit={isHit}
          isDead={isDead}
          hpPercent={hpPercent}
        />

        {/* Grid floor effect */}
        <gridHelper args={[10, 20, '#22d3ee', '#1a1a2e']} position={[0, -2, 0]} />
      </Canvas>

      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none scanlines opacity-30" />

      {/* Glow effect at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-primary/20 to-transparent pointer-events-none" />
    </div>
  )
}
