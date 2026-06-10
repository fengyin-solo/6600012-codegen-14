import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useSimStore } from '../store/simulation'
import { applyPhysics } from '../simulations/physics'
import { applyColorMapping } from '../simulations/colorMapping'

const tempObject = new THREE.Object3D()
const tempColor = new THREE.Color()

function applyStaticColorMapping(
  particles: { velocity: [number, number, number]; mass: number; color: string }[],
  mode: string,
  colorArray: Float32Array
): void {
  if (mode === 'none') {
    particles.forEach((p, i) => {
      tempColor.set(p.color)
      colorArray[i * 3] = tempColor.r
      colorArray[i * 3 + 1] = tempColor.g
      colorArray[i * 3 + 2] = tempColor.b
    })
  } else if (mode === 'speed') {
    applyColorMapping(particles as any, 'speed', colorArray)
  } else if (mode === 'mass') {
    applyColorMapping(particles as any, 'mass', colorArray)
  }
}

export default function ParticleSystem() {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const particles = useSimStore(s => s.particles)
  const mode = useSimStore(s => s.mode)
  const gravity = useSimStore(s => s.gravity)
  const damping = useSimStore(s => s.damping)
  const bounce = useSimStore(s => s.bounce)
  const attractorStrength = useSimStore(s => s.attractorStrength)
  const slowMotion = useSimStore(s => s.slowMotion)
  const paused = useSimStore(s => s.paused)
  const colorMapping = useSimStore(s => s.colorMapping)
  const setFps = useSimStore(s => s.setFps)
  const setTotalEnergy = useSimStore(s => s.setTotalEnergy)

  const colorArray = useMemo(
    () => new Float32Array(particles.length * 3),
    [particles.length]
  )

  const prevVelocitiesRef = useRef<[number, number, number][]>([])

  useEffect(() => {
    if (colorMapping !== 'force') {
      applyStaticColorMapping(particles, colorMapping, colorArray)
      if (meshRef.current) {
        const geometry = meshRef.current.geometry
        const colorAttr = geometry.getAttribute('color') as THREE.InstancedBufferAttribute
        colorAttr.needsUpdate = true
      }
    }
    prevVelocitiesRef.current = particles.map(p => [...p.velocity])
  }, [particles, colorArray, colorMapping])

  const fpsCounter = useRef({ frames: 0, lastTime: performance.now() })

  useFrame((_, delta) => {
    if (!meshRef.current) return

    const dt = slowMotion ? delta * 0.1 : delta
    const updated = paused ? particles : applyPhysics(particles, mode, gravity, damping, bounce, attractorStrength, dt)

    let totalEnergy = 0
    updated.forEach((p, i) => {
      tempObject.position.set(...p.position)
      const scale = p.radius * 2
      tempObject.scale.set(scale, scale, scale)
      tempObject.updateMatrix()
      meshRef.current!.setMatrixAt(i, tempObject.matrix)
      totalEnergy += 0.5 * p.mass * (p.velocity[0]**2 + p.velocity[1]**2 + p.velocity[2]**2)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
    setTotalEnergy(totalEnergy)

    if (colorMapping !== 'none' && !paused) {
      applyColorMapping(
        updated,
        colorMapping as 'speed' | 'mass' | 'force',
        colorArray,
        prevVelocitiesRef.current,
        dt
      )
      const geometry = meshRef.current.geometry
      const colorAttr = geometry.getAttribute('color') as THREE.InstancedBufferAttribute
      colorAttr.needsUpdate = true
    } else if (colorMapping === 'none') {
      updated.forEach((p, i) => {
        tempColor.set(p.color)
        colorArray[i * 3] = tempColor.r
        colorArray[i * 3 + 1] = tempColor.g
        colorArray[i * 3 + 2] = tempColor.b
      })
      if (meshRef.current) {
        const geometry = meshRef.current.geometry
        const colorAttr = geometry.getAttribute('color') as THREE.InstancedBufferAttribute
        colorAttr.needsUpdate = true
      }
    }

    if (!paused) {
      prevVelocitiesRef.current = updated.map(p => [...p.velocity])
    }

    fpsCounter.current.frames++
    const now = performance.now()
    if (now - fpsCounter.current.lastTime > 1000) {
      setFps(fpsCounter.current.frames)
      fpsCounter.current.frames = 0
      fpsCounter.current.lastTime = now
    }
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particles.length]}>
      <sphereGeometry args={[1, 8, 8]}>
        <instancedBufferAttribute attach="attributes-color" args={[colorArray, 3]} />
      </sphereGeometry>
      <meshPhongMaterial vertexColors toneMapped={false} shininess={80} />
    </instancedMesh>
  )
}
