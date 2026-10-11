import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { AnimationDriver } from './components/AnimationDriver'
import { CameraRig } from './components/CameraRig'
import { Chuck, ProberBase } from './components/Chuck'
import { DUT } from './components/DUT'
import { FocusBox } from './components/FocusBox'
import { Handler } from './components/Handler'
import { LoadBoard } from './components/LoadBoard'
import { Mainframe } from './components/Mainframe'
import { PogoTower } from './components/PogoTower'
import { ProbeCard } from './components/ProbeCard'
import { SignalFlow } from './components/SignalFlow'
import { Socket } from './components/Socket'
import { Stage } from './components/Stage'
import { TestHead } from './components/TestHead'
import { Wafer } from './components/Wafer'
import { SceneContext, type SceneConfig, type SceneStore } from './context/SceneContext'
import { CAMERA_PRESET, type ContactPhase } from './data/layout'
import { useSceneTheme } from './hooks/useSceneTheme'

type SceneProps = {
  store: SceneStore
  cfg: SceneConfig
  resetKey: number
  onPhase: (phase: ContactPhase) => void
}

export function Scene({ store, cfg, resetKey, onPhase }: SceneProps) {
  const theme = useSceneTheme()
  const isFT = cfg.flow === 'FT'
  const preset = CAMERA_PRESET[cfg.flow]
  const ctx = { store, cfg }

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: preset.position, fov: 40, near: 0.05, far: 120 }}
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true
      }}
      onPointerMissed={() => cfg.onSelect(null)}
    >
      <SceneContext.Provider value={ctx}>
        <Stage theme={theme} flow={cfg.flow} />
        <AnimationDriver onPhase={onPhase} />

        {isFT ? (
          <>
            <Handler />
            <DUT />
            <Socket />
            <LoadBoard />
          </>
        ) : (
          <>
            <ProbeCard />
            <Wafer />
            <Chuck />
            <ProberBase />
          </>
        )}
        <PogoTower />
        <TestHead />
        <Mainframe />

        <SignalFlow theme={theme} />
        <FocusBox color={theme.gold} />

        <OrbitControls makeDefault enableDamping dampingFactor={0.12} minDistance={0.6} maxDistance={26} maxPolarAngle={Math.PI * 0.49} />
        <CameraRig resetKey={resetKey} />
      </SceneContext.Provider>
    </Canvas>
  )
}
