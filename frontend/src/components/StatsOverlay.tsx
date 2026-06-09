import { useSimStore } from '../store/simulation'

export default function StatsOverlay() {
  const fps = useSimStore(s => s.fps)
  const count = useSimStore(s => s.particleCount)
  const mode = useSimStore(s => s.mode)
  const energy = useSimStore(s => s.totalEnergy)

  return (
    <div className="absolute top-3 left-3 bg-black/60 rounded px-3 py-2 text-xs font-mono space-y-1 pointer-events-none">
      <div className="text-green-400">FPS: {fps}</div>
      <div className="text-blue-400">粒子数: {count}</div>
      <div className="text-yellow-400">模式: {mode}</div>
      <div className="text-pink-400">总动能: {energy.toFixed(1)}</div>
    </div>
  )
}
