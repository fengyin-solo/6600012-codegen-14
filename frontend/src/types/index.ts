export type SimMode = 'gravity' | 'collision' | 'fluid' | 'vortex'

export interface Particle {
  id: number
  position: [number, number, number]
  velocity: [number, number, number]
  mass: number
  color: string
  radius: number
}

export interface SimulationParams {
  mode: SimMode
  particleCount: number
  gravity: number         // -20 ~ 20
  damping: number         // 0 ~ 1
  bounce: number          // 0 ~ 1
  attractorStrength: number
  slowMotion: boolean
  paused: boolean
}

export interface Preset {
  id: string
  name: string
  params: Partial<SimulationParams>
}
