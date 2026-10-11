import { RoundedBox } from '@react-three/drei'
import { useMemo } from 'react'
import { ExtrudeGeometry, MeshStandardMaterial, Shape } from 'three'
import { useLocale } from '../../../i18n/LocaleContext'
import { useScene } from '../context/SceneContext'
import { registerDim } from '../data/dim'
import { BGA, DUT_BASE_Y, QFP, allContacts, qfpLeads } from '../data/layout'
import { GEO, MAT } from '../data/materials'
import { dutMarkTexture } from '../data/textures'
import { T } from '../data/text'
import { InstancedParts, type InstanceItem } from './Instanced'
import { LayerGroup } from './LayerGroup'

/** 鸥翼引脚侧面轮廓（u 向外、y 向上），沿 Z 拉伸成引脚宽度 */
function gullWingGeometry(): ExtrudeGeometry {
  const s = new Shape()
  const upper: Array<[number, number]> = [
    [-0.01, 0.081],
    [0.048, 0.081],
    [0.098, 0.012],
    [0.18, 0.012],
  ]
  const lower: Array<[number, number]> = [
    [0.18, 0],
    [0.092, 0],
    [0.042, 0.069],
    [-0.01, 0.069],
  ]
  s.moveTo(upper[0]![0], upper[0]![1])
  for (const [u, y] of [...upper.slice(1), ...lower]) s.lineTo(u, y)
  s.closePath()
  const g = new ExtrudeGeometry(s, { depth: 0.03, bevelEnabled: false })
  g.translate(0, 0, -0.015)
  return g
}

const markMaterials = {
  BGA: registerDim(new MeshStandardMaterial({ map: dutMarkTexture('BGA'), roughness: 0.6, metalness: 0 })),
  QFP: registerDim(new MeshStandardMaterial({ map: dutMarkTexture('QFP'), roughness: 0.6, metalness: 0 })),
}

/** DUT：BGA（基板 + 塑封 + 锡球阵列）或 QFP（塑封 + 四边鸥翼引脚），顶面带打标贴图 */
export function DUT() {
  const { cfg } = useScene()
  const { t } = useLocale()
  const leadGeo = useMemo(() => gullWingGeometry(), [])

  const balls = useMemo<InstanceItem[]>(
    () => allContacts('BGA').map(([x, z]) => ({ p: [x, BGA.ballR * 0.88, z], s: [BGA.ballR, BGA.ballR * 0.92, BGA.ballR] })),
    [],
  )
  const leads = useMemo<InstanceItem[]>(() => qfpLeads().map((l) => ({ p: [l.x, 0, l.z], r: [0, l.rotY, 0] })), [])
  const isBga = cfg.pkg === 'BGA'

  return (
    <LayerGroup id="dut" sub={t(isBga ? T.bgaSub : T.qfpSub)}>
      <group position={[0, DUT_BASE_Y, 0]}>
        {isBga ? (
          <>
            <InstancedParts geometry={GEO.sphere} material={MAT.solder} items={balls} />
            <RoundedBox
              args={[BGA.body, BGA.subTop - BGA.subBottom, BGA.body]}
              radius={0.008}
              smoothness={2}
              position={[0, (BGA.subTop + BGA.subBottom) / 2, 0]}
              material={MAT.bt}
              castShadow
            />
            <RoundedBox
              args={[BGA.mold, BGA.top - BGA.subTop, BGA.mold]}
              radius={0.016}
              smoothness={3}
              position={[0, (BGA.top + BGA.subTop) / 2, 0]}
              material={MAT.mold}
              castShadow
            />
            <mesh position={[0, BGA.top + 0.0008, 0]} rotation={[-Math.PI / 2, 0, 0]} material={markMaterials.BGA}>
              <planeGeometry args={[BGA.mold - 0.04, BGA.mold - 0.04]} />
            </mesh>
          </>
        ) : (
          <>
            <InstancedParts geometry={leadGeo} material={MAT.solder} items={leads} />
            <RoundedBox
              args={[QFP.body, QFP.top - QFP.bottom, QFP.body]}
              radius={0.02}
              smoothness={3}
              position={[0, (QFP.top + QFP.bottom) / 2, 0]}
              material={MAT.mold}
              castShadow
            />
            <mesh position={[0, QFP.top + 0.0008, 0]} rotation={[-Math.PI / 2, 0, 0]} material={markMaterials.QFP}>
              <planeGeometry args={[QFP.body - 0.05, QFP.body - 0.05]} />
            </mesh>
          </>
        )}
      </group>
    </LayerGroup>
  )
}
