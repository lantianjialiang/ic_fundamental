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
import { PathHighlight } from './components/PathHighlight'
import { PogoTowerCP, PogoTowerFT } from './components/PogoTower'
import { ProbeCard } from './components/ProbeCard'
import { SignalFlow } from './components/SignalFlow'
import { Socket } from './components/Socket'
import { Stage } from './components/Stage'
import { TestHead } from './components/TestHead'
import { Wafer } from './components/Wafer'
import { SceneContext, type SceneConfig, type SceneStore } from './context/SceneContext'
import { CAMERA_LIMITS, CAMERA_PRESET, type ContactPhase } from './data/layout'
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

        {/* 两条流程各自一整棵子树（带 key）：切换时旧流程的部件全部卸载，任何时刻只渲染当前流程的叠层 */}
        {isFT ? (
          <group key="FT">
            <Handler />
            <DUT />
            <Socket />
            <LoadBoard />
            <PogoTowerFT />
            <TestHead />
          </group>
        ) : (
          <group key="CP">
            <TestHead />
            <PogoTowerCP />
            <ProbeCard />
            <Wafer />
            <Chuck />
            <ProberBase />
          </group>
        )}
        <Mainframe />

        <PathHighlight />
        <SignalFlow theme={theme} />
        <FocusBox color={theme.gold} />

        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.12}
          minDistance={1.2}
          maxDistance={22}
          minAzimuthAngle={-Infinity}
          maxAzimuthAngle={Infinity}
          minPolarAngle={CAMERA_LIMITS.minPolar}
          maxPolarAngle={CAMERA_LIMITS.maxPolar}
        />
        <CameraRig resetKey={resetKey} />
      </SceneContext.Provider>
    </Canvas>
  )
}
