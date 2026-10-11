import { RoundedBox } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import { MeshStandardMaterial, type Mesh } from 'three'
import { useLocale } from '../../../i18n/LocaleContext'
import { useScene } from '../context/SceneContext'
import { registerBoardFade } from '../data/fade'
import { CHANNEL_COUNT, PC, PC_SPEC, cpRoute, pcbSurfaceLift, towerPinXZ, type Vec3 } from '../data/layout'
import { GEO, MAT, PC_MASK_MAT, pcCopperMaterials } from '../data/materials'
import { annulusGeometry } from '../data/shapes'
import { T } from '../data/text'
import { pcSilkTexture } from '../data/textures'
import { BoardCopper } from './BoardCopper'
import { InstancedParts, type InstanceItem } from './Instanced'
import { LayerGroup } from './LayerGroup'
import { Needles } from './Needles'
import { PcbSheets, PcbSlot, SPREAD_MIN } from './PcbStack'
import { SceneLabel } from './SceneLabel'

/** 分解后总标注挪到右后方、加强板上方，不和左右两列的分层标签挤在一起 */
const EXPLODED_LABEL = {
  position: [0.75 * PC.r + 0.2, PC.stiffTop + pcbSurfaceLift(PC_SPEC, 1) + 0.3, -0.66 * PC.r] as Vec3,
  side: 'right' as const,
}

const silk = registerBoardFade(new MeshStandardMaterial({ map: pcSilkTexture(), transparent: true, roughness: 0.6, depthWrite: false }))

/**
 * 探针卡：金属加强板 + 大圆 PCB（边缘 pogo 焊盘圈）+ 中央空间转换器 + 探针。
 * 分解时 PCB 拆成一叠薄片：加强板随顶面、空间转换器和探针随底面移动。
 */
export function ProbeCard() {
  const { store, cfg } = useScene()
  const { t } = useLocale()
  const body = useRef<Mesh>(null)
  const silkFace = useRef<Mesh>(null)
  const copper = pcCopperMaterials()
  const geos = useMemo(
    () => ({
      stiffRing: annulusGeometry(1.0, 1.35, PC.stiffTop - PC.top),
      needleRing: annulusGeometry(0.44, 0.64, PC.stBottom - 0.17),
      epoxy: annulusGeometry(0.42, 0.66, 0.04, 48),
    }),
    [],
  )
  const routes = useMemo(() => Array.from({ length: CHANNEL_COUNT }, (_, ch) => cpRoute(ch)), [])

  const edgePads = useMemo<InstanceItem[]>(
    () => towerPinXZ('CP').map(([x, z]) => ({ p: [x, PC.top + 0.003, z], s: [0.022, 0.006, 0.022] })),
    [],
  )
  const spokes = useMemo<InstanceItem[]>(
    () =>
      Array.from({ length: 4 }, (_, i) => {
        const a = Math.PI / 4 + (i * Math.PI) / 2
        return { p: [Math.cos(a) * 0.78, PC.top + 0.05, Math.sin(a) * 0.78], r: [0, -a, 0], s: [0.5, 0.1, 0.16] }
      }),
    [],
  )
  const caps = useMemo(() => {
    const top: InstanceItem[] = []
    const bottom: InstanceItem[] = []
    for (let i = 0; i < 20; i += 1) {
      const a = (i / 20) * Math.PI * 2 + 0.08
      top.push({ p: [Math.cos(a) * 1.48, PC.top + 0.022, Math.sin(a) * 1.48], r: [0, -a, 0], s: [0.05, 0.04, 0.09] })
      bottom.push({ p: [Math.cos(a) * 0.8, PC.bottom - 0.02, Math.sin(a) * 0.8], r: [0, -a, 0], s: [0.05, 0.04, 0.09] })
    }
    return { top, bottom }
  }, [])
  const posts = useMemo<InstanceItem[]>(
    () =>
      [
        [-0.22, -0.22],
        [0.22, -0.22],
        [0.22, 0.22],
        [-0.22, 0.22],
      ].map(([x, z]) => ({ p: [x!, (PC.upperGuide + PC.lowerGuide) / 2, z!], s: [0.018, PC.upperGuide - PC.lowerGuide, 0.018] })),
    [],
  )
  const vertical = cfg.probe === 'vertical'
  const bottomSlot = 2 * PC_SPEC.layers.length

  useFrame(() => {
    const whole = store.pose.spread <= SPREAD_MIN
    if (body.current) body.current.visible = whole
    if (silkFace.current) silkFace.current.visible = whole
  })

  return (
    <LayerGroup id="probecard" labelAt={cfg.exploded ? EXPLODED_LABEL : undefined}>
      <mesh ref={body} position={[0, PC.y, 0]} material={MAT.fr4Pc} castShadow receiveShadow>
        <cylinderGeometry args={[PC.r, PC.r, PC.t, 96]} />
      </mesh>
      <mesh ref={silkFace} position={[0, PC.top + 0.0015, 0]} rotation={[-Math.PI / 2, 0, 0]} material={silk}>
        <circleGeometry args={[PC.r, 96]} />
      </mesh>
      <PcbSheets
        id="probecard"
        spec={PC_SPEC}
        boardY={PC.y}
        outline={{ r: PC.r }}
        copper={copper}
        maskTop={[PC_MASK_MAT, silk]}
        maskBottom={PC_MASK_MAT}
      />

      <PcbSlot spec={PC_SPEC} slot={0}>
        <InstancedParts geometry={GEO.cyl} material={MAT.gold} items={edgePads} />
        <InstancedParts geometry={GEO.box} material={MAT.mlcc} items={caps.top} />
        <mesh geometry={geos.stiffRing} position={[0, PC.top, 0]} material={MAT.steelClip} castShadow />
        <mesh position={[0, PC.top + (PC.stiffTop - PC.top) / 2, 0]} material={MAT.steelClip} castShadow>
          <cylinderGeometry args={[0.55, 0.55, PC.stiffTop - PC.top, 48]} />
        </mesh>
        <InstancedParts geometry={GEO.box} material={MAT.steelClip} items={spokes} castShadow />
        {cfg.showLabels ? <SceneLabel position={[-1.2, PC.stiffTop + 0.05, -0.4]} title={t(T.stiffener)} /> : null}
      </PcbSlot>

      <PcbSlot spec={PC_SPEC} slot={bottomSlot}>
        <InstancedParts geometry={GEO.box} material={MAT.mlcc} items={caps.bottom} />
        <RoundedBox
          args={[PC.stSize, PC.bottom - PC.stBottom, PC.stSize]}
          radius={0.015}
          smoothness={2}
          position={[0, (PC.bottom + PC.stBottom) / 2, 0]}
          material={MAT.ceramicClip}
          castShadow
        />

        {vertical ? (
          <>
            <mesh position={[0, PC.upperGuide, 0]} material={MAT.ceramicClip}>
              <boxGeometry args={[0.5, 0.02, 0.5]} />
            </mesh>
            <mesh position={[0, PC.lowerGuide, 0]} material={MAT.ceramicClip}>
              <boxGeometry args={[0.5, 0.02, 0.5]} />
            </mesh>
            <InstancedParts geometry={GEO.cyl} material={MAT.steel} items={posts} />
          </>
        ) : (
          <>
            <mesh geometry={geos.needleRing} position={[0, 0.17, 0]} material={MAT.aluminumClip} />
            <mesh geometry={geos.epoxy} position={[0, 0.13, 0]} material={MAT.epoxy} />
          </>
        )}

        <Needles />
        {cfg.showLabels ? (
          // 分解时右前方被 FR4 分层标签占用，挪到左侧
          cfg.exploded ? (
            <SceneLabel position={[-0.55, PC.stBottom - 0.1, 0.55]} title={t(T.st)} side="left" />
          ) : (
            <SceneLabel position={[0.55, PC.stBottom + 0.04, 0.55]} title={t(T.st)} />
          )
        ) : null}
      </PcbSlot>

      <BoardCopper routes={routes} spec={PC_SPEC} boardY={PC.y} selected={cfg.selected} onSelect={cfg.onSelect} />
    </LayerGroup>
  )
}
