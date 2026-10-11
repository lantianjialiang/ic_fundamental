import { RoundedBox } from '@react-three/drei'
import { useMemo } from 'react'
import { useLocale } from '../../../i18n/LocaleContext'
import { useScene } from '../context/SceneContext'
import { CARD_COUNT, TH, TH_DOCK_Y, cardX, channelCard } from '../data/layout'
import { GEO, MAT } from '../data/materials'
import { frameGeometry } from '../data/shapes'
import { T } from '../data/text'
import { InstancedParts, type InstanceItem } from './Instanced'
import { LayerGroup } from './LayerGroup'
import { SceneLabel } from './SceneLabel'

const CHIP_Z = [-1.15, -0.4, 0.4, 1.15]

export function TestHead() {
  const { cfg } = useScene()
  const { t } = useLocale()
  const flipped = cfg.flow === 'CP'
  const plate = useMemo(() => frameGeometry(TH.w, TH.d, 4.0, 3.8, TH.plateH), [])

  /** CP 时测试头绕 Z 轴翻转，局部 x 镜像 */
  const selectedLocalCard =
    cfg.selected === null ? -1 : flipped ? CARD_COUNT - 1 - channelCard(cfg.selected) : channelCard(cfg.selected)

  const cards = useMemo<InstanceItem[]>(
    () =>
      Array.from({ length: CARD_COUNT }, (_, c) => ({
        p: [cardX(c), -TH.cardH / 2, 0],
        s: [TH.cardT, TH.cardH, TH.cardD],
        c: c === selectedLocalCard ? '#35b866' : '#1d6a3a',
      })),
    [selectedLocalCard],
  )
  const fingers = useMemo<InstanceItem[]>(
    () => Array.from({ length: CARD_COUNT }, (_, c) => ({ p: [cardX(c), -0.03, 0], s: [TH.cardT + 0.008, 0.06, TH.cardD - 0.2] })),
    [],
  )
  const chips = useMemo<InstanceItem[]>(() => {
    const out: InstanceItem[] = []
    for (let c = 0; c < CARD_COUNT; c += 1) {
      for (const z of CHIP_Z) out.push({ p: [cardX(c) + 0.04, -TH.chipDepth, z], s: [0.03, 0.22, 0.24] })
    }
    return out
  }, [])
  const cams = useMemo<InstanceItem[]>(
    () => [
      { p: [2.15, 0.06, 0], s: [0.09, 0.12, 0.09] },
      { p: [-2.15, 0.06, 0], s: [0.09, 0.12, 0.09] },
      { p: [0, 0.06, 2.05], s: [0.09, 0.12, 0.09] },
      { p: [0, 0.06, -2.05], s: [0.09, 0.12, 0.09] },
    ],
    [],
  )
  const vents = useMemo<InstanceItem[]>(
    () => Array.from({ length: 9 }, (_, i) => ({ p: [TH.w / 2 + 0.004, -0.8, -1.9 + i * 0.17], s: [0.01, 0.7, 0.07] })),
    [],
  )
  const rails = useMemo<InstanceItem[]>(
    () => [
      { p: [0, -1.25, 1.75], s: [4.2, 0.08, 0.08] },
      { p: [0, -1.25, -1.75], s: [4.2, 0.08, 0.08] },
    ],
    [],
  )

  return (
    <LayerGroup id="testhead">
      <group position={[0, TH_DOCK_Y[cfg.flow], 0]} rotation={[0, 0, flipped ? Math.PI : 0]}>
        <RoundedBox
          args={[TH.w, TH.shellH, TH.d]}
          radius={0.06}
          smoothness={3}
          position={[0, -TH.plateH - TH.shellH / 2, 0]}
          material={MAT.thShell}
          castShadow
          receiveShadow
        />
        <mesh geometry={plate} position={[0, -TH.plateH, 0]} material={MAT.aluminumClip} castShadow receiveShadow />
        <InstancedParts geometry={GEO.box} material={MAT.plasticWhite} items={cards} />
        <InstancedParts geometry={GEO.box} material={MAT.gold} items={fingers} />
        <InstancedParts geometry={GEO.box} material={MAT.mold} items={chips} />
        <InstancedParts geometry={GEO.cyl} material={MAT.steel} items={cams} castShadow />
        <InstancedParts geometry={GEO.box} material={MAT.groove} items={vents} />
        <InstancedParts geometry={GEO.box} material={MAT.aluminum} items={rails} />
        <mesh position={[TH.w / 2 + 0.006, -0.35, -0.9]} material={MAT.led}>
          <boxGeometry args={[0.01, 0.05, 0.5]} />
        </mesh>
        {!flipped ? (
          <mesh position={[0, -TH.plateH - TH.shellH - 0.2, 0]} material={MAT.paint} castShadow receiveShadow>
            <boxGeometry args={[3.6, 0.4, 3.4]} />
          </mesh>
        ) : null}
        {cfg.showLabels ? (
          <SceneLabel position={flipped ? [cardX(0), -1.22, TH.d / 2 + 0.05] : [cardX(0), -0.9, TH.cardD / 2]} title={t(T.cards)} />
        ) : null}
      </group>
    </LayerGroup>
  )
}
