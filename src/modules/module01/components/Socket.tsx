import { useLocale } from '../../../i18n/LocaleContext'
import { ui } from '../../../i18n/ui'
import { DUT, SOCKET, bgaXZ, layerY } from '../data/layout'
import { SceneLabel } from './SceneLabel'

type SocketProps = {
  progress: number
}

export function Socket({ progress }: SocketProps) {
  const { t } = useLocale()
  const y = layerY(SOCKET, progress)
  const { w, h, d } = SOCKET.body
  const boardPinY = -h / 2 - SOCKET.boardPinLength / 2
  const dutContactY = h / 2 + 0.024

  return (
    <group position={[0, y, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial color="#3e444c" roughness={0.5} metalness={0.22} />
      </mesh>
      {/* DUT 从上方装入 */}
      <mesh position={[0, h / 2 - 0.02, 0]}>
        <boxGeometry args={[w * 0.78, 0.03, d * 0.78]} />
        <meshStandardMaterial color="#2a2f36" roughness={0.65} metalness={0.15} />
      </mesh>

      {Array.from({ length: DUT.grid }, (_, row) =>
        Array.from({ length: DUT.grid }, (_, col) => {
          const [x, z] = bgaXZ(col, row)
          return (
            <group key={`${col}-${row}`}>
              {/* 板侧：pin 朝下插入 Load Board 顶面焊盘 */}
              <mesh position={[x, boardPinY, z]}>
                <cylinderGeometry
                  args={[SOCKET.boardPinRadius, SOCKET.boardPinRadius * 0.75, SOCKET.boardPinLength, 8]}
                />
                <meshStandardMaterial color="#d4b45a" roughness={0.3} metalness={0.6} />
              </mesh>
              {/* DUT 侧：触点朝上接触 BGA */}
              <mesh position={[x, dutContactY, z]}>
                <cylinderGeometry
                  args={[SOCKET.contactRadius, SOCKET.contactRadius * 0.65, 0.05, 10]}
                />
                <meshStandardMaterial color="#c9b07a" roughness={0.35} metalness={0.55} />
              </mesh>
            </group>
          )
        }),
      )}

      <SceneLabel
        position={[w / 2 + 0.42, 0.16, 0]}
        title="SOCKET"
        subtitle={t(ui.scene.socketSub)}
      />
    </group>
  )
}
