import type { Particle, SimMode } from '../types'

const BOUND = 12

export function applyPhysics(
  particles: Particle[],
  mode: SimMode,
  gravity: number,
  damping: number,
  bounce: number,
  attractorStrength: number,
  dt: number
): Particle[] {
  return particles.map(p => {
    const vel: [number, number, number] = [...p.velocity]
    const pos: [number, number, number] = [...p.position]

    if (mode === 'gravity') {
      vel[1] -= gravity * dt
      // Attractor to center
      const dx = -pos[0], dy = -pos[1], dz = -pos[2]
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) + 0.01
      const f = attractorStrength / (dist * dist) * dt
      vel[0] += dx / dist * f
      vel[1] += dy / dist * f
      vel[2] += dz / dist * f
    } else if (mode === 'collision') {
      vel[1] -= gravity * dt
      // Elastic collision approximation with neighbours
      for (const q of particles) {
        if (q.id === p.id) continue
        const dx = q.position[0] - pos[0]
        const dy = q.position[1] - pos[1]
        const dz = q.position[2] - pos[2]
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz)
        if (dist < p.radius + q.radius + 0.1) {
          const nx = dx / (dist + 0.001)
          const ny = dy / (dist + 0.001)
          const nz = dz / (dist + 0.001)
          vel[0] -= nx * 0.5
          vel[1] -= ny * 0.5
          vel[2] -= nz * 0.5
        }
      }
    } else if (mode === 'fluid') {
      // Viscous fluid simulation (simplified SPH)
      const pressure = 2.0
      for (const q of particles) {
        if (q.id === p.id) continue
        const dx = q.position[0] - pos[0]
        const dy = q.position[1] - pos[1]
        const dz = q.position[2] - pos[2]
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz)
        if (dist < 2.0) {
          const h = 2.0 - dist
          const force = pressure * h * h * dt
          vel[0] -= (dx / (dist+0.001)) * force
          vel[1] -= (dy / (dist+0.001)) * force - gravity * dt * 0.3
          vel[2] -= (dz / (dist+0.001)) * force
        }
      }
      vel[1] -= gravity * dt * 0.5
    } else if (mode === 'vortex') {
      // Rotational vortex force
      const r = Math.sqrt(pos[0]*pos[0] + pos[2]*pos[2]) + 0.01
      const omega = attractorStrength / (r + 1) * dt
      vel[0] += -pos[2] / r * omega
      vel[2] +=  pos[0] / r * omega
      vel[1] -= gravity * dt * 0.2
      // Pull towards axis
      vel[0] -= pos[0] / r * dt * 2
      vel[2] -= pos[2] / r * dt * 2
    }

    // Damping
    const d = 1 - damping
    vel[0] *= d; vel[1] *= d; vel[2] *= d

    // Integrate
    pos[0] += vel[0] * dt * 10
    pos[1] += vel[1] * dt * 10
    pos[2] += vel[2] * dt * 10

    // Boundary bounce
    for (let i = 0; i < 3; i++) {
      if (pos[i] > BOUND)  { pos[i] = BOUND;  vel[i] *= -bounce }
      if (pos[i] < -BOUND) { pos[i] = -BOUND; vel[i] *= -bounce }
    }

    return { ...p, position: pos, velocity: vel }
  })
}
