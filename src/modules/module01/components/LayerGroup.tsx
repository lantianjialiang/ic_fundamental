import { useFrame } from '@react-three/fiber'
import { useRef, type ReactNode } from 'react'
import type { Group } from 'three'
import { useLocale } from '../../../i18n/LocaleContext'
import { useScene } from '../context/SceneContext'
import { LABEL_ANCHOR, LAYER_BOX, type LayerId } from '../data/layout'
import { LAYER_TEXT } from '../data/text'
import { SceneLabel } from './SceneLabel'

type LayerGroupProps = {
  id: LayerId
  children: ReactNode
  /** 覆盖默认副标题 */
  sub?: string
}

/** 一层叠层：每帧按 store.pose 平移；可选显示该层的 3D 标注 */
export function LayerGroup({ id, children, sub }: LayerGroupProps) {
  const { store, cfg } = useScene()
  const { t } = useLocale()
  const ref = useRef<Group>(null)

  useFrame(() => {
    const g = ref.current
    if (!g) return
    g.position.set(store.pose.x[id], store.pose.y[id], 0)
  })

  const box = LAYER_BOX[cfg.flow][id]
  const text = LAYER_TEXT[cfg.flow][id]
  const anchor = LABEL_ANCHOR[cfg.flow][id] ?? { ax: 1, az: 1, side: 'right' }
  const focused = cfg.focus === id
  const showLabel = (cfg.showLabels || focused) && box && text

  return (
    <group ref={ref}>
      {children}
      {showLabel ? (
        <SceneLabel
          position={[box.c[0] + anchor.ax * (box.s[0] / 2 + 0.2), box.c[1], box.c[2] + anchor.az * (box.s[2] / 2)]}
          title={t(text.name)}
          subtitle={sub ?? t(text.sub)}
          active={focused}
          side={anchor.side}
        />
      ) : null}
    </group>
  )
}
