import { RoundedBox } from '@react-three/drei'
import { useScene } from '../context/SceneContext'
import { DUT_BASE_Y, HANDLER, dutHeight } from '../data/layout'
import { MAT } from '../data/materials'
import { LayerGroup } from './LayerGroup'

/** Handler 测试臂：横梁 + 导杆 + 压头块 + 底部真空吸嘴 */
export function Handler() {
  const { cfg } = useScene()
  const base = DUT_BASE_Y + dutHeight(cfg.pkg)
  const blockY = HANDLER.cupH + HANDLER.blockH / 2
  const shaftY = HANDLER.cupH + HANDLER.blockH + HANDLER.shaftH / 2
  const armY = HANDLER.cupH + HANDLER.blockH + HANDLER.shaftH + 0.11

  return (
    <LayerGroup id="handler">
      <group position={[0, base, 0]}>
        <mesh position={[0, HANDLER.cupH / 2, 0]} material={MAT.rubber}>
          <cylinderGeometry args={[0.15, 0.18, HANDLER.cupH, 24]} />
        </mesh>
        <mesh position={[0, HANDLER.cupH + 0.01, 0]} material={MAT.steel}>
          <cylinderGeometry args={[0.07, 0.07, 0.03, 16]} />
        </mesh>
        <RoundedBox
          args={[HANDLER.block, HANDLER.blockH, HANDLER.block]}
          radius={0.03}
          smoothness={3}
          position={[0, blockY, 0]}
          material={MAT.aluminum}
          castShadow
        />
        <mesh position={[0, shaftY, 0]} material={MAT.steel} castShadow>
          <cylinderGeometry args={[HANDLER.shaftR, HANDLER.shaftR, HANDLER.shaftH, 24]} />
        </mesh>
        <mesh position={[0, HANDLER.cupH + HANDLER.blockH + 0.1, 0]} material={MAT.paint}>
          <cylinderGeometry args={[0.2, 0.2, 0.2, 24]} />
        </mesh>
        <RoundedBox args={[3.0, 0.22, 0.6]} radius={0.04} smoothness={3} position={[0.6, armY, 0]} material={MAT.paint} castShadow />
        <mesh position={[0.6, armY, 0.302]} material={MAT.accent}>
          <boxGeometry args={[2.9, 0.05, 0.01]} />
        </mesh>
        <mesh position={[0.25, shaftY, 0.18]} rotation={[0, 0, 0]} material={MAT.cable}>
          <cylinderGeometry args={[0.025, 0.025, HANDLER.shaftH, 8]} />
        </mesh>
      </group>
    </LayerGroup>
  )
}
