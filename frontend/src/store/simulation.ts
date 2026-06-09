import { create } from 'zustand'
import type { SimMode, SimulationParams, Particle } from '../types'

const COLORS = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#c084fc','#f472b6','#38bdf8']

function randomParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    position: [
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
    ] as [number, number, number],
    velocity: [
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
      (Math.random() - 0.5) * 2,
    ] as [number, number, number],
    mass: 0.5 + Math.random() * 2,
    color: COLORS[i % COLORS.length],
    radius: 0.15 + Math.random() * 0.35,
  }))
}

interface SimStore extends SimulationParams {
  particles: Particle[]
  fps: number
  totalEnergy: number
  setMode: (mode: SimMode) => void
  setParticleCount: (count: number) => void
  setParam: <K extends keyof SimulationParams>(key: K, value: SimulationParams[K]) => void
  reset: () => void
  setFps: (fps: number) => void
  setTotalEnergy: (e: number) => void
  applyPreset: (preset: Partial<SimulationParams>) => void
}

export const useSimStore = create<SimStore>((set, get) => ({
  mode: 'gravity',
  particleCount: 300,
  gravity: 9.8,
  damping: 0.02,
  bounce: 0.7,
  attractorStrength: 5,
  slowMotion: false,
  paused: false,
  particles: randomParticles(300),
  fps: 0,
  totalEnergy: 0,
  setMode: (mode) => set({ mode }),
  setParticleCount: (count) => set({ particleCount: count, particles: randomParticles(count) }),
  setParam: (key, value) => set({ [key]: value } as any),
  reset: () => {
    const { particleCount } = get()
    set({ particles: randomParticles(particleCount) })
  },
  setFps: (fps) => set({ fps }),
  setTotalEnergy: (e) => set({ totalEnergy: e }),
  applyPreset: (preset) => {
    set({ ...preset } as any)
    const { particleCount } = get()
    set({ particles: randomParticles(particleCount) })
  },
}))
