import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { FLOOR_Y, type TestFlow } from '../data/layout'
import type { SceneTheme } from '../hooks/useSceneTheme'

type StageProps = { theme: SceneTheme; flow: TestFlow }

/**
 * 灯光与地面：离线环境光（Environment + Lightformer，不联网取 HDR）、
 * 带阴影的主光、跟随主题的背景 / 地面 / 网格 / 接触阴影。
 */
export function Stage({ theme, flow }: StageProps) {
  const light = theme.mode === 'light'

  return (
    <>
      <color attach="background" args={[theme.bg]} />
      <fog attach="fog" args={[theme.bg, 18, 38]} />
      <ambientLight intensity={light ? 0.35 : 0.22} />
      <hemisphereLight args={[light ? '#ffffff' : '#c9d6e6', light ? '#c7ccd2' : '#1b1f25', light ? 0.55 : 0.35]} />
      <directionalLight
        position={[6, 11, 6]}
        intensity={light ? 2.1 : 2.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-camera-near={1}
        shadow-camera-far={32}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02}
      />
      <directionalLight position={[-7, 4, -5]} intensity={0.55} color="#bcd4ff" />

      <Environment resolution={256} frames={1} environmentIntensity={light ? 0.9 : 0.75}>
        <Lightformer form="rect" intensity={3} position={[0, 9, 0]} scale={[14, 7, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[9, 3, 5]} scale={[9, 3, 1]} />
        <Lightformer form="rect" intensity={1.1} position={[-9, 3, -2]} scale={[9, 3, 1]} />
        <Lightformer form="ring" intensity={2.2} position={[3, 5, 9]} scale={3} />
        <Lightformer form="rect" color="#9ecbff" intensity={0.7} position={[0, 2, -10]} scale={[16, 4, 1]} />
        <Lightformer form="rect" color="#ffe2b8" intensity={0.5} position={[0, -6, 0]} scale={[12, 12, 1]} />
      </Environment>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]} receiveShadow>
        <circleGeometry args={[22, 72]} />
        <meshStandardMaterial color={theme.panel2} roughness={0.92} metalness={0} />
      </mesh>
      <gridHelper key={`${theme.line}-${theme.lineSoft}`} args={[32, 64, theme.line, theme.lineSoft]} position={[0, FLOOR_Y + 0.002, 0]} />
      <ContactShadows
        key={`${flow}-${theme.mode}`}
        position={[0, FLOOR_Y + 0.004, 0]}
        scale={18}
        resolution={512}
        blur={2.6}
        far={3}
        frames={1}
        opacity={light ? 0.35 : 0.65}
        color="#000000"
      />
    </>
  )
}
