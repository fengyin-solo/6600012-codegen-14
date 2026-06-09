import React from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import ParticleSystem from './components/ParticleSystem'
import ControlPanel from './components/ControlPanel'
import StatsOverlay from './components/StatsOverlay'

export default function App() {
  return (
    <div className="flex w-full h-full">
      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 0, 30], fov: 60 }}>
          <color attach="background" args={['#050510']} />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Stars radius={80} depth={50} count={1000} factor={3} />
          <ParticleSystem />
          <OrbitControls makeDefault enableDamping />
        </Canvas>
        <StatsOverlay />
      </div>
      <ControlPanel />
    </div>
  )
}
