import type { Particle } from '../types'

function lerpColor(t: number): [number, number, number] {
  const hue = 240 - t * 240
  const s = 1
  const l = 0.6
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0
  if (hue >= 0 && hue < 60) { r = c; g = x; b = 0 }
  else if (hue >= 60 && hue < 120) { r = x; g = c; b = 0 }
  else if (hue >= 120 && hue < 180) { r = 0; g = c; b = x }
  else if (hue >= 180 && hue < 240) { r = 0; g = x; b = c }
  else if (hue >= 240 && hue < 300) { r = x; g = 0; b = c }
  else if (hue >= 300 && hue < 360) { r = c; g = 0; b = x }
  return [r + m, g + m, b + m]
}

function normalize(values: number[]): number[] {
  if (values.length === 0) return []
  let min = Infinity
  let max = -Infinity
  for (const v of values) {
    if (v < min) min = v
    if (v > max) max = v
  }
  const range = max - min || 1
  return values.map(v => (v - min) / range)
}

export function getSpeedValues(particles: Particle[]): number[] {
  return particles.map(p =>
    Math.sqrt(p.velocity[0] ** 2 + p.velocity[1] ** 2 + p.velocity[2] ** 2)
  )
}

export function getMassValues(particles: Particle[]): number[] {
  return particles.map(p => p.mass)
}

export function getForceValues(particles: Particle[], prevVelocities: [number, number, number][], dt: number): number[] {
  return particles.map((p, i) => {
    const prev = prevVelocities[i] || p.velocity
    const ax = (p.velocity[0] - prev[0]) / (dt + 1e-6)
    const ay = (p.velocity[1] - prev[1]) / (dt + 1e-6)
    const az = (p.velocity[2] - prev[2]) / (dt + 1e-6)
    const accMag = Math.sqrt(ax * ax + ay * ay + az * az)
    return p.mass * accMag
  })
}

export function applyColorMapping(
  particles: Particle[],
  mode: 'speed' | 'mass' | 'force',
  colorArray: Float32Array,
  prevVelocities?: [number, number, number][],
  dt?: number
): void {
  let values: number[]
  if (mode === 'speed') {
    values = getSpeedValues(particles)
  } else if (mode === 'mass') {
    values = getMassValues(particles)
  } else if (mode === 'force' && prevVelocities && dt !== undefined) {
    values = getForceValues(particles, prevVelocities, dt)
  } else {
    return
  }

  const normalized = normalize(values)
  normalized.forEach((t, i) => {
    const [r, g, b] = lerpColor(t)
    colorArray[i * 3] = r
    colorArray[i * 3 + 1] = g
    colorArray[i * 3 + 2] = b
  })
}
