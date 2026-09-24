import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { ATE } from './components/ATE'
import { ChannelInterface } from './components/ChannelInterface'
import { ConnectionPaths } from './components/ConnectionPaths'
import { DUT } from './components/DUT'
import { LoadBoard } from './components/LoadBoard'
import { ProbeCard } from './components/ProbeCard'
import { ProbeNeedles } from './components/ProbeNeedles'
import { Socket } from './components/Socket'
import { Wafer } from './components/Wafer'
import { CAMERA, type TestFlow } from './data/layout'

type SceneProps = {
  progress: number
  flow: TestFlow
  selectedChannel: number | null
  onSelect: (channel: number | null) => void
}

export function Scene({ progress, flow, selectedChannel, onSelect }: SceneProps) {
  const isFT = flow === 'FT'

  return (
    <Canvas
      shadows
      camera={{ position: CAMERA.position, fov: CAMERA.fov }}
      gl={{ antialias: true }}
      onPointerMissed={() => onSelect(null)}
    >
      <color attach="background" args={['#1a1d23']} />
      <ambientLight intensity={0.72} />
      <directionalLight
        position={[5.5, 8.5, 4.5]}
        intensity={1.35}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <hemisphereLight args={['#d8dde3', '#2a2d32', 0.28]} />

      <ATE progress={progress} flow={flow} selectedChannel={selectedChannel} onSelect={onSelect} />
      {progress < 0.35 ? <ChannelInterface progress={progress} flow={flow} /> : null}

      {isFT ? (
        <>
          <LoadBoard progress={progress} selectedChannel={selectedChannel} onSelect={onSelect} />
          <Socket progress={progress} />
          <DUT progress={progress} selectedChannel={selectedChannel} onSelect={onSelect} />
        </>
      ) : (
        <>
          <ProbeCard progress={progress} selectedChannel={selectedChannel} onSelect={onSelect} />
          <ProbeNeedles progress={progress} />
          <Wafer progress={progress} />
        </>
      )}

      <ConnectionPaths
        flow={flow}
        progress={progress}
        selectedChannel={selectedChannel}
        onSelect={onSelect}
      />

      <gridHelper args={[14, 28, '#3a3f46', '#2a2e34']} position={[0, -2.4, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2.401, 0]} receiveShadow>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#16191d" roughness={1} metalness={0} />
      </mesh>

      <OrbitControls
        makeDefault
        target={CAMERA.target}
        enableDamping
        dampingFactor={0.12}
        minDistance={3}
        maxDistance={16}
      />
    </Canvas>
  )
}
