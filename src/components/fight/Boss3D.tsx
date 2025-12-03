'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, Box, Cylinder, Torus, Ring, Plane, Stars } from '@react-three/drei'
import * as THREE from 'three'

// ============================================================================
// ENVIRONMENT COMPONENTS
// ============================================================================

function ArenaFloor() {
  const gridRef = useRef<THREE.GridHelper>(null)

  useFrame((state) => {
    if (gridRef.current) {
      // Slow rotation of grid
      gridRef.current.rotation.y = state.clock.elapsedTime * 0.02
    }
  })

  return (
    <group position={[0, -3.2, 0]}>
      {/* Main grid */}
      <gridHelper ref={gridRef} args={[20, 40, '#22d3ee', '#0f172a']} />

      {/* Glowing floor plane */}
      <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <meshStandardMaterial
          color="#0a0a1a"
          transparent
          opacity={0.8}
          metalness={0.9}
          roughness={0.1}
        />
      </Plane>

      {/* Hexagonal platform under boss */}
      <Cylinder args={[2, 2.2, 0.15, 6]} position={[0, 0.05, 0]}>
        <meshStandardMaterial
          color="#1a1a3a"
          metalness={0.8}
          roughness={0.2}
          emissive="#22d3ee"
          emissiveIntensity={0.1}
        />
      </Cylinder>

      {/* Inner platform ring */}
      <Torus args={[1.8, 0.05, 8, 32]} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
        <meshStandardMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={1}
        />
      </Torus>

      {/* Corner pillars */}
      {[[3, 0, 3], [-3, 0, 3], [3, 0, -3], [-3, 0, -3]].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <Cylinder args={[0.15, 0.2, 2, 6]} position={[0, 1, 0]}>
            <meshStandardMaterial color="#1a1a2e" metalness={0.9} roughness={0.1} />
          </Cylinder>
          <Sphere args={[0.12, 8, 8]} position={[0, 2.1, 0]}>
            <meshStandardMaterial
              color="#a855f7"
              emissive="#a855f7"
              emissiveIntensity={2}
            />
          </Sphere>
        </group>
      ))}
    </group>
  )
}

function AmbientParticles({ count = 15 }: { count?: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null)

  const particles = useMemo(() => {
    const temp = []
    for (let i = 0; i < count; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 8,
          Math.random() * 4 - 1,
          (Math.random() - 0.5) * 6
        ],
        speed: Math.random() * 0.3 + 0.1,
        offset: Math.random() * Math.PI * 2
      })
    }
    return temp
  }, [count])

  useFrame((state) => {
    if (!mesh.current) return
    const temp = new THREE.Object3D()

    particles.forEach((particle, i) => {
      const t = state.clock.elapsedTime * particle.speed + particle.offset
      temp.position.set(
        particle.position[0] + Math.sin(t) * 0.3,
        particle.position[1] + Math.sin(t * 1.2) * 0.2,
        particle.position[2] + Math.cos(t) * 0.2
      )
      temp.scale.setScalar(0.04)
      temp.updateMatrix()
      mesh.current!.setMatrixAt(i, temp.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <sphereGeometry args={[1, 4, 4]} />
      <meshBasicMaterial
        color="#22d3ee"
        transparent
        opacity={0.5}
      />
    </instancedMesh>
  )
}

function EnergyBeams() {
  const beamsRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (beamsRef.current) {
      beamsRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <group ref={beamsRef} position={[0, -3, 0]}>
      {[0, 1, 2, 3].map((i) => (
        <Box
          key={i}
          args={[0.02, 8, 0.02]}
          position={[
            Math.cos((i / 4) * Math.PI * 2) * 4,
            4,
            Math.sin((i / 4) * Math.PI * 2) * 4
          ]}
        >
          <meshStandardMaterial
            color="#a855f7"
            emissive="#a855f7"
            emissiveIntensity={3}
            transparent
            opacity={0.3}
          />
        </Box>
      ))}
    </group>
  )
}

// ============================================================================
// PROJECTILE & IMPACT EFFECTS
// ============================================================================

function Projectile({ startPos, onComplete }: { startPos: [number, number, number]; onComplete: () => void }) {
  const ref = useRef<THREE.Mesh>(null)
  const trailRef = useRef<THREE.Group>(null)
  const [progress, setProgress] = useState(0)

  useFrame((_, delta) => {
    if (!ref.current) return

    const newProgress = Math.min(progress + delta * 5, 1)
    setProgress(newProgress)

    // Move from bottom toward center (boss position)
    ref.current.position.z = THREE.MathUtils.lerp(startPos[2], 0, newProgress)
    ref.current.position.y = THREE.MathUtils.lerp(startPos[1], 0, newProgress)
    ref.current.position.x = THREE.MathUtils.lerp(startPos[0], 0, newProgress * 0.6)

    // Rotate projectile
    ref.current.rotation.z += delta * 15

    // Scale down as it approaches
    const scale = 1 - newProgress * 0.3
    ref.current.scale.setScalar(scale)

    if (newProgress >= 1) {
      onComplete()
    }
  })

  return (
    <group>
      {/* Main projectile */}
      <Sphere ref={ref} args={[0.12, 12, 12]} position={startPos}>
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={4}
          transparent
          opacity={0.95}
        />
      </Sphere>
      {/* Outer glow */}
      <Sphere args={[0.2, 8, 8]} position={startPos}>
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={2}
          transparent
          opacity={0.3}
        />
      </Sphere>
    </group>
  )
}

function ImpactSpark({ position }: { position: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null)
  const [life, setLife] = useState(1)

  useFrame((_, delta) => {
    if (!ref.current) return
    setLife((l) => Math.max(0, l - delta * 6))
    ref.current.scale.setScalar(life * 2.5)
    ref.current.rotation.z += delta * 15
  })

  if (life <= 0) return null

  return (
    <group ref={ref} position={position}>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <Box
          key={i}
          args={[0.04, 0.4, 0.04]}
          position={[
            Math.cos((i / 8) * Math.PI * 2) * 0.4,
            Math.sin((i / 8) * Math.PI * 2) * 0.4,
            0
          ]}
          rotation={[0, 0, (i / 8) * Math.PI * 2]}
        >
          <meshStandardMaterial
            color="#ffaa00"
            emissive="#ff6600"
            emissiveIntensity={3}
            transparent
            opacity={life}
          />
        </Box>
      ))}
      {/* Central flash */}
      <Sphere args={[0.2, 8, 8]}>
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={5}
          transparent
          opacity={life * 0.8}
        />
      </Sphere>
    </group>
  )
}

// ============================================================================
// DEATH EXPLOSION
// ============================================================================

interface Debris {
  id: number
  position: THREE.Vector3
  velocity: THREE.Vector3
  rotation: THREE.Euler
  rotationSpeed: THREE.Vector3
  scale: number
  type: 'cube' | 'sphere' | 'cylinder'
}

function DeathExplosion({ active, onComplete }: { active: boolean; onComplete: () => void }) {
  const [debris, setDebris] = useState<Debris[]>([])
  const [explosionFlash, setExplosionFlash] = useState(false)

  useEffect(() => {
    if (active) {
      // Create debris pieces - reduced for performance
      const newDebris: Debris[] = []
      for (let i = 0; i < 12; i++) {
        newDebris.push({
          id: i,
          position: new THREE.Vector3(
            (Math.random() - 0.5) * 1,
            (Math.random() - 0.5) * 1.5,
            (Math.random() - 0.5) * 0.5
          ),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            Math.random() * 6 + 2,
            (Math.random() - 0.5) * 6
          ),
          rotation: new THREE.Euler(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
          ),
          rotationSpeed: new THREE.Vector3(
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10,
            (Math.random() - 0.5) * 10
          ),
          scale: 0.1 + Math.random() * 0.2,
          type: ['cube', 'sphere', 'cylinder'][Math.floor(Math.random() * 3)] as 'cube' | 'sphere' | 'cylinder'
        })
      }
      setDebris(newDebris)
      setExplosionFlash(true)

      setTimeout(() => setExplosionFlash(false), 100)
      setTimeout(() => {
        setDebris([])
        onComplete()
      }, 1500)
    }
  }, [active, onComplete])

  return (
    <group>
      {/* Explosion flash sphere */}
      {explosionFlash && (
        <Sphere args={[2, 16, 16]} position={[0, 0, 0]}>
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffaa00"
            emissiveIntensity={10}
            transparent
            opacity={0.8}
          />
        </Sphere>
      )}

      {/* Debris pieces */}
      {debris.map((piece) => (
        <DebrisPiece key={piece.id} piece={piece} />
      ))}

      {/* Smoke particles */}
      {active && <SmokeParticles />}
    </group>
  )
}

function DebrisPiece({ piece }: { piece: Debris }) {
  const ref = useRef<THREE.Mesh>(null)
  const [life, setLife] = useState(1)

  useFrame((_, delta) => {
    if (!ref.current) return

    // Apply gravity
    piece.velocity.y -= 15 * delta

    // Move debris
    ref.current.position.add(piece.velocity.clone().multiplyScalar(delta))

    // Rotate
    ref.current.rotation.x += piece.rotationSpeed.x * delta
    ref.current.rotation.y += piece.rotationSpeed.y * delta
    ref.current.rotation.z += piece.rotationSpeed.z * delta

    // Fade out
    setLife((l) => Math.max(0, l - delta * 0.8))
  })

  if (life <= 0) return null

  const colors = ['#22d3ee', '#a855f7', '#f59e0b', '#ef4444']
  const color = colors[piece.id % colors.length]

  return (
    <mesh ref={ref} position={piece.position} rotation={piece.rotation} scale={piece.scale}>
      {piece.type === 'cube' && <boxGeometry args={[1, 1, 1]} />}
      {piece.type === 'sphere' && <sphereGeometry args={[0.5, 8, 8]} />}
      {piece.type === 'cylinder' && <cylinderGeometry args={[0.3, 0.3, 1, 6]} />}
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2 * life}
        metalness={0.9}
        roughness={0.1}
        transparent
        opacity={life}
      />
    </mesh>
  )
}

function SmokeParticles() {
  const particles = useMemo(() => {
    const arr = []
    for (let i = 0; i < 6; i++) {
      arr.push({
        id: i,
        startPos: new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.3
        ),
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          Math.random() * 2 + 1,
          (Math.random() - 0.5) * 2
        ),
        scale: 0.5 + Math.random() * 0.5
      })
    }
    return arr
  }, [])

  return (
    <>
      {particles.map((p) => (
        <SmokeParticle key={p.id} particle={p} />
      ))}
    </>
  )
}

function SmokeParticle({ particle }: { particle: { startPos: THREE.Vector3; velocity: THREE.Vector3; scale: number } }) {
  const ref = useRef<THREE.Mesh>(null)
  const [life, setLife] = useState(1)
  const pos = useRef(particle.startPos.clone())

  useFrame((_, delta) => {
    if (!ref.current) return

    pos.current.add(particle.velocity.clone().multiplyScalar(delta))
    ref.current.position.copy(pos.current)
    ref.current.scale.setScalar(particle.scale * (2 - life))

    setLife((l) => Math.max(0, l - delta))
  })

  if (life <= 0) return null

  return (
    <Sphere ref={ref} args={[0.5, 8, 8]} position={particle.startPos}>
      <meshStandardMaterial
        color="#444"
        transparent
        opacity={life * 0.4}
      />
    </Sphere>
  )
}

// ============================================================================
// BOSS ENTRANCE ANIMATION
// ============================================================================

function BossEntrance({ active, onComplete }: { active: boolean; onComplete: () => void }) {
  const [flash, setFlash] = useState(false)
  const portalRef = useRef<THREE.Group>(null)

  useEffect(() => {
    if (active) {
      setFlash(true)
      setTimeout(() => setFlash(false), 200)
      setTimeout(() => onComplete(), 800)
    }
  }, [active, onComplete])

  useFrame((state) => {
    if (portalRef.current && active) {
      portalRef.current.rotation.z = state.clock.elapsedTime * 5
    }
  })

  if (!active) return null

  return (
    <group>
      {/* Portal rings */}
      <group ref={portalRef}>
        <Torus args={[2, 0.08, 8, 32]} position={[0, 0, -1]} rotation={[0, 0, 0]}>
          <meshStandardMaterial
            color="#a855f7"
            emissive="#a855f7"
            emissiveIntensity={5}
            transparent
            opacity={0.8}
          />
        </Torus>
        <Torus args={[1.5, 0.05, 8, 32]} position={[0, 0, -0.5]} rotation={[0, 0, Math.PI / 4]}>
          <meshStandardMaterial
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={5}
            transparent
            opacity={0.8}
          />
        </Torus>
      </group>

      {/* Flash */}
      {flash && (
        <Sphere args={[3, 16, 16]}>
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={10}
            transparent
            opacity={0.6}
          />
        </Sphere>
      )}
    </group>
  )
}

// ============================================================================
// ROBOT BOSS VARIANTS
// ============================================================================

interface RobotBossProps {
  stage: number
  isHit: boolean
  isDead: boolean
  hpPercent: number
  isEntering: boolean
}

function RobotBoss({ stage, isHit, isDead, hpPercent, isEntering }: RobotBossProps) {
  const groupRef = useRef<THREE.Group>(null)
  const eyeLeftRef = useRef<THREE.Mesh>(null)
  const eyeRightRef = useRef<THREE.Mesh>(null)
  const coreRef = useRef<THREE.Mesh>(null)
  const leftArmRef = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)

  // Track hit flash
  const [hitFlash, setHitFlash] = useState(0)
  const [entranceProgress, setEntranceProgress] = useState(isEntering ? 0 : 1)

  useEffect(() => {
    if (isHit) {
      setHitFlash(1)
    }
  }, [isHit])

  // Reset entrance animation when stage changes
  useEffect(() => {
    setEntranceProgress(0)
  }, [stage])

  // Boss type detection
  const isMajorBoss = stage % 100 === 0
  const isNamedBoss = stage % 50 === 0 && !isMajorBoss
  const isMiniBoss = stage % 10 === 0 && !isNamedBoss && !isMajorBoss

  // Color based on boss type and HP
  const baseColor = useMemo(() => {
    if (isMajorBoss) return '#a855f7' // Major boss - purple
    if (isNamedBoss) return '#ef4444' // Named boss - red
    if (isMiniBoss) return '#f59e0b' // Mini boss - orange
    return '#22d3ee' // Regular - cyan
  }, [isMajorBoss, isNamedBoss, isMiniBoss])

  const eyeColor = useMemo(() => {
    if (hpPercent < 0.25) return '#ef4444'
    if (hpPercent < 0.5) return '#f59e0b'
    return '#22c55e'
  }, [hpPercent])

  // Scale based on boss type
  const baseScale = useMemo(() => {
    if (isMajorBoss) return 1.6
    if (isNamedBoss) return 1.35
    if (isMiniBoss) return 1.2
    return 1
  }, [isMajorBoss, isNamedBoss, isMiniBoss])

  // Animation
  useFrame((state, delta) => {
    if (!groupRef.current) return

    // Entrance animation
    if (entranceProgress < 1) {
      setEntranceProgress((p) => Math.min(1, p + delta * 2.5))
      groupRef.current.position.z = THREE.MathUtils.lerp(-5, 0, entranceProgress)
      groupRef.current.rotation.y = (1 - entranceProgress) * Math.PI * 2
      const entranceScale = entranceProgress * baseScale
      groupRef.current.scale.setScalar(entranceScale)
      return
    }

    // Idle hover and rotation
    groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3

    // Hit shake and flash decay
    if (isHit) {
      groupRef.current.position.x = Math.sin(state.clock.elapsedTime * 80) * 0.15
      groupRef.current.position.z = Math.sin(state.clock.elapsedTime * 60) * 0.1
    } else {
      groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, 0, 0.15)
      groupRef.current.position.z = THREE.MathUtils.lerp(groupRef.current.position.z, 0, 0.15)
    }

    // Decay hit flash
    setHitFlash((f) => Math.max(0, f - delta * 8))

    // Death animation
    if (isDead) {
      groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, 0, 0.2)
      groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, 0, 0.2)
      groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, 0, 0.2)
      groupRef.current.rotation.y += delta * 12
    } else {
      groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, baseScale, 0.1)
      groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, baseScale, 0.1)
      groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, baseScale, 0.1)

      // Safety net: force scale recovery if stuck at near-zero
      if (entranceProgress >= 1 && groupRef.current.scale.x < baseScale * 0.5) {
        groupRef.current.scale.setScalar(baseScale)
      }
    }

    // Eye glow pulse
    if (eyeLeftRef.current && eyeRightRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 4) * 0.5 + 1.5
      ;(eyeLeftRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse
      ;(eyeRightRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse
    }

    // Core pulse based on HP
    if (coreRef.current) {
      const corePulse = Math.sin(state.clock.elapsedTime * (3 - hpPercent * 2)) * 0.5 + 1
      ;(coreRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = corePulse * (1 + (1 - hpPercent))
    }

    // Arm movement
    if (leftArmRef.current && rightArmRef.current) {
      leftArmRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.2
      rightArmRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2 + Math.PI) * 0.2
    }
  })

  // Calculate flash color mix
  const flashMix = hitFlash > 0 ? '#ffffff' : baseColor

  return (
    <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.3}>
      <group ref={groupRef}>
        {/* Main Body - Torso */}
        <Box args={[1.4, 1.8, 1]} position={[0, 0, 0]}>
          <MeshDistortMaterial
            color={hitFlash > 0.5 ? flashMix : baseColor}
            metalness={0.5}
            roughness={0.4}
            distort={isHit ? 0.2 : 0.05}
            speed={3}
            emissive={baseColor}
            emissiveIntensity={0.3 + hitFlash * 2}
          />
        </Box>

        {/* Chest armor plates */}
        <Box args={[0.5, 0.8, 0.15]} position={[-0.35, 0.3, 0.55]}>
          <meshStandardMaterial color="#555" metalness={0.6} roughness={0.3} emissive="#222" emissiveIntensity={0.2} />
        </Box>
        <Box args={[0.5, 0.8, 0.15]} position={[0.35, 0.3, 0.55]}>
          <meshStandardMaterial color="#555" metalness={0.6} roughness={0.3} emissive="#222" emissiveIntensity={0.2} />
        </Box>

        {/* Core energy sphere */}
        <Sphere ref={coreRef} args={[0.25, 16, 16]} position={[0, 0.1, 0.5]}>
          <meshStandardMaterial
            color={hpPercent < 0.25 ? '#ff0000' : baseColor}
            emissive={hpPercent < 0.25 ? '#ff0000' : baseColor}
            emissiveIntensity={2}
            transparent
            opacity={0.9}
          />
        </Sphere>

        {/* Core ring */}
        <Torus args={[0.35, 0.03, 8, 32]} position={[0, 0.1, 0.5]} rotation={[0, 0, 0]}>
          <meshStandardMaterial color="#666" metalness={0.9} roughness={0.1} />
        </Torus>

        {/* Boss type decorations */}
        {isMajorBoss && (
          <group>
            {/* Crown-like spikes */}
            {[0, 1, 2].map((i) => (
              <Box key={i} args={[0.08, 0.4, 0.08]} position={[(i - 1) * 0.3, 1.8, 0]}>
                <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={2} />
              </Box>
            ))}
            {/* Extra shoulder guards */}
            <Sphere args={[0.3, 12, 12]} position={[-1.1, 0.6, 0]}>
              <meshStandardMaterial color="#a855f7" metalness={0.9} emissive="#a855f7" emissiveIntensity={0.5} />
            </Sphere>
            <Sphere args={[0.3, 12, 12]} position={[1.1, 0.6, 0]}>
              <meshStandardMaterial color="#a855f7" metalness={0.9} emissive="#a855f7" emissiveIntensity={0.5} />
            </Sphere>
          </group>
        )}

        {isNamedBoss && (
          <group>
            {/* Dual horns */}
            <Cylinder args={[0.06, 0.02, 0.5]} position={[-0.35, 1.7, 0]} rotation={[0, 0, 0.3]}>
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1} />
            </Cylinder>
            <Cylinder args={[0.06, 0.02, 0.5]} position={[0.35, 1.7, 0]} rotation={[0, 0, -0.3]}>
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={1} />
            </Cylinder>
          </group>
        )}

        {isMiniBoss && (
          <group>
            {/* Extra plating */}
            <Box args={[0.2, 0.6, 0.15]} position={[-0.65, 0.3, 0.4]}>
              <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} />
            </Box>
            <Box args={[0.2, 0.6, 0.15]} position={[0.65, 0.3, 0.4]}>
              <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.1} />
            </Box>
          </group>
        )}

        {/* Head */}
        <group position={[0, 1.3, 0]}>
          {/* Main head */}
          <Box args={[0.9, 0.7, 0.7]}>
            <meshStandardMaterial
              color={hitFlash > 0.5 ? flashMix : baseColor}
              metalness={0.5}
              roughness={0.4}
              emissive={baseColor}
              emissiveIntensity={0.3 + hitFlash}
            />
          </Box>

          {/* Visor */}
          <Box args={[0.8, 0.25, 0.1]} position={[0, 0.05, 0.35]}>
            <meshStandardMaterial color="#222" metalness={0.3} roughness={0.5} />
          </Box>

          {/* Eye Left */}
          <Sphere ref={eyeLeftRef} args={[0.1, 12, 12]} position={[-0.2, 0.05, 0.38]}>
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={2} />
          </Sphere>

          {/* Eye Right */}
          <Sphere ref={eyeRightRef} args={[0.1, 12, 12]} position={[0.2, 0.05, 0.38]}>
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={2} />
          </Sphere>

          {/* Antenna */}
          <Cylinder args={[0.04, 0.04, 0.5]} position={[0, 0.6, 0]}>
            <meshStandardMaterial color="#666" metalness={0.5} roughness={0.4} />
          </Cylinder>
          <Sphere args={[0.08, 8, 8]} position={[0, 0.85, 0]}>
            <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={2} />
          </Sphere>

          {/* Side head details */}
          <Cylinder args={[0.08, 0.08, 0.2]} position={[-0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <meshStandardMaterial color="#888" metalness={0.5} roughness={0.4} />
          </Cylinder>
          <Cylinder args={[0.08, 0.08, 0.2]} position={[0.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <meshStandardMaterial color="#888" metalness={0.5} roughness={0.4} />
          </Cylinder>
        </group>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.95, 0.4, 0]}>
          <Sphere args={[0.2, 12, 12]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#777" metalness={0.5} roughness={0.4} />
          </Sphere>
          <Box args={[0.3, 0.7, 0.3]} position={[-0.15, -0.5, 0]}>
            <meshStandardMaterial color="#888" metalness={0.5} roughness={0.4} />
          </Box>
          <Box args={[0.25, 0.6, 0.25]} position={[-0.15, -1.1, 0]}>
            <meshStandardMaterial
              color={baseColor}
              metalness={0.5}
              roughness={0.4}
              emissive={baseColor}
              emissiveIntensity={0.5}
            />
          </Box>
          <Box args={[0.15, 0.25, 0.08]} position={[-0.25, -1.5, -0.1]}>
            <meshStandardMaterial color="#666" metalness={0.5} roughness={0.4} />
          </Box>
          <Box args={[0.15, 0.25, 0.08]} position={[-0.05, -1.5, -0.1]}>
            <meshStandardMaterial color="#666" metalness={0.5} roughness={0.4} />
          </Box>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.95, 0.4, 0]}>
          <Sphere args={[0.2, 12, 12]} position={[0, 0, 0]}>
            <meshStandardMaterial color="#777" metalness={0.5} roughness={0.4} />
          </Sphere>
          <Box args={[0.3, 0.7, 0.3]} position={[0.15, -0.5, 0]}>
            <meshStandardMaterial color="#888" metalness={0.5} roughness={0.4} />
          </Box>
          <Cylinder args={[0.15, 0.2, 0.7]} position={[0.15, -1.1, 0]}>
            <meshStandardMaterial
              color={baseColor}
              metalness={0.5}
              roughness={0.4}
              emissive={baseColor}
              emissiveIntensity={0.5}
            />
          </Cylinder>
          <Cylinder args={[0.08, 0.1, 0.3]} position={[0.15, -1.5, 0]}>
            <meshStandardMaterial color="#555" metalness={0.5} roughness={0.4} />
          </Cylinder>
        </group>

        {/* Legs */}
        <group position={[0, -1.4, 0]}>
          <Box args={[0.35, 0.9, 0.35]} position={[-0.4, -0.3, 0]}>
            <meshStandardMaterial color="#777" metalness={0.5} roughness={0.4} />
          </Box>
          <Box args={[0.4, 0.2, 0.5]} position={[-0.4, -0.85, 0.05]}>
            <meshStandardMaterial color="#666" metalness={0.5} roughness={0.4} />
          </Box>
          <Box args={[0.35, 0.9, 0.35]} position={[0.4, -0.3, 0]}>
            <meshStandardMaterial color="#777" metalness={0.5} roughness={0.4} />
          </Box>
          <Box args={[0.4, 0.2, 0.5]} position={[0.4, -0.85, 0.05]}>
            <meshStandardMaterial color="#666" metalness={0.5} roughness={0.4} />
          </Box>
        </group>

        {/* HP indicator bar on back */}
        <group position={[0, 0.8, -0.55]} rotation={[0, Math.PI, 0]}>
          <Box args={[1, 0.1, 0.05]}>
            <meshStandardMaterial color="#222" />
          </Box>
          <Box args={[hpPercent * 0.95, 0.08, 0.06]} position={[(hpPercent - 1) * 0.475, 0, 0.01]}>
            <meshStandardMaterial
              color={hpPercent < 0.25 ? '#ff0000' : hpPercent < 0.5 ? '#ffaa00' : '#00ff00'}
              emissive={hpPercent < 0.25 ? '#ff0000' : hpPercent < 0.5 ? '#ffaa00' : '#00ff00'}
              emissiveIntensity={1}
            />
          </Box>
        </group>

        {/* Low HP warning aura */}
        {hpPercent < 0.25 && (
          <Sphere args={[2, 16, 16]}>
            <meshStandardMaterial
              color="#ff0000"
              emissive="#ff0000"
              emissiveIntensity={1}
              transparent
              opacity={0.1}
            />
          </Sphere>
        )}
      </group>
    </Float>
  )
}

// ============================================================================
// MAIN BOSS3D COMPONENT
// ============================================================================

interface Boss3DProps {
  stage: number
  isHit: boolean
  isDead: boolean
  hpPercent: number
}

export function Boss3D({ stage, isHit, isDead, hpPercent }: Boss3DProps) {
  const [projectiles, setProjectiles] = useState<{ id: number; pos: [number, number, number] }[]>([])
  const [impacts, setImpacts] = useState<{ id: number; pos: [number, number, number] }[]>([])
  const [showDeathExplosion, setShowDeathExplosion] = useState(false)
  const [showEntrance, setShowEntrance] = useState(false)
  const [bossEntering, setBossEntering] = useState(false)
  const projectileIdRef = useRef(0)
  const prevStageRef = useRef(stage)
  const lastProjectileTimeRef = useRef(0)

  // Detect stage change for entrance animation
  useEffect(() => {
    if (stage !== prevStageRef.current) {
      setShowEntrance(true)
      setBossEntering(true)
      prevStageRef.current = stage
    }
  }, [stage])

  // Spawn projectile when hit (throttled to prevent performance issues)
  useEffect(() => {
    if (isHit && !isDead) {
      const now = Date.now()
      // Throttle projectiles to max 1 every 80ms (12.5 per second) and max 5 active
      if (now - lastProjectileTimeRef.current > 80 && projectiles.length < 5) {
        lastProjectileTimeRef.current = now
        const id = projectileIdRef.current++
        const startX = (Math.random() - 0.5) * 3
        const startY = -3.5
        const startZ = 5
        setProjectiles((prev) => [...prev, { id, pos: [startX, startY, startZ] }])
      }
    }
  }, [isHit, isDead, projectiles.length])

  // Death explosion
  useEffect(() => {
    if (isDead) {
      setTimeout(() => setShowDeathExplosion(true), 200)
    }
  }, [isDead])

  const handleProjectileComplete = (id: number) => {
    setProjectiles((prev) => prev.filter((p) => p.id !== id))
    const impactId = projectileIdRef.current++
    const impactX = (Math.random() - 0.5) * 0.5
    const impactY = (Math.random() - 0.5) * 0.5
    setImpacts((prev) => [...prev, { id: impactId, pos: [impactX, impactY, 0.5] }])
    setTimeout(() => {
      setImpacts((prev) => prev.filter((i) => i.id !== impactId))
    }, 300)
  }

  return (
    <div className="w-full h-56 relative">
      <Canvas
        camera={{ position: [0, 1, 7], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 0, 5]} intensity={2} color="#ffffff" />
        <pointLight position={[3, 3, 4]} intensity={1.5} color="#22d3ee" />
        <pointLight position={[-3, 3, 4]} intensity={1.5} color="#a855f7" />
        <pointLight position={[0, -2, 3]} intensity={0.8} color="#f59e0b" />
        <spotLight
          position={[0, 5, 8]}
          angle={0.5}
          penumbra={0.5}
          intensity={3}
          color="#ffffff"
          castShadow
        />
        <pointLight position={[0, 2, -3]} intensity={0.6} color="#22d3ee" />

        {/* Stars background - reduced count for performance */}
        <Stars radius={50} depth={50} count={200} factor={2} fade speed={0.5} />

        {/* Arena environment */}
        <ArenaFloor />
        <AmbientParticles count={12} />

        {/* Boss entrance portal */}
        <BossEntrance
          active={showEntrance}
          onComplete={() => {
            setShowEntrance(false)
            setTimeout(() => setBossEntering(false), 800)
          }}
        />

        {/* Boss */}
        <RobotBoss
          stage={stage}
          isHit={isHit}
          isDead={isDead}
          hpPercent={hpPercent}
          isEntering={bossEntering}
        />

        {/* Death explosion */}
        <DeathExplosion
          active={showDeathExplosion}
          onComplete={() => setShowDeathExplosion(false)}
        />

        {/* Projectiles */}
        {projectiles.map((p) => (
          <Projectile
            key={p.id}
            startPos={p.pos}
            onComplete={() => handleProjectileComplete(p.id)}
          />
        ))}

        {/* Impact effects */}
        {impacts.map((i) => (
          <ImpactSpark key={i.id} position={i.pos} />
        ))}

        {/* Fog for depth */}
        <fog attach="fog" args={['#0a0a1a', 10, 25]} />
      </Canvas>

      {/* Scanline overlay */}
      <div className="absolute inset-0 pointer-events-none scanlines opacity-15" />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, transparent 35%, rgba(0,0,0,0.7) 100%)'
        }}
      />

      {/* Glow effect at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-primary/40 via-primary/10 to-transparent pointer-events-none" />

      {/* Top atmosphere */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-background/60 to-transparent pointer-events-none" />
    </div>
  )
}
