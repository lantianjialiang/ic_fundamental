import { useFrame } from '@react-three/fiber'
import { useRef, type ReactNode } from 'react'
import type { Group } from 'three'
import { useLocale } from '../../../i18n/LocaleContext'
import { layerVisible, useScene } from '../context/SceneContext'
import { LABEL_ANCHOR, LAYER_BOX, type LayerId, type Vec3 } from '../data/layout'
import { LAYER_TEXT } from '../data/text'
import { LabelGate, SceneLabel } from './SceneLabel'

type LayerGroupProps = {
  id: LayerId
  children: ReactNode
  /** 覆盖默认副标题 */
  sub?: string
  /** 覆盖该层总标注的位置（PCB 分层展开时挪到叠层上方，让出各层标签的位置） */
  labelAt?: { position: Vec3; side: 'left' | 'right' }
}

/** 一层叠层：每帧按 store.pose 平移；被「隐藏其它部件」或眼睛按钮隐藏时整层不渲染；可选显示该层的 3D 标注 */
export function LayerGroup({ id, children, sub, labelAt }: LayerGroupProps) {
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
  const visible = layerVisible(cfg, id)

  return (
    <group ref={ref} visible={visible}>
      <LabelGate.Provider value={visible}>
        {children}
        {showLabel ? (
          <SceneLabel
            position={labelAt?.position ?? [box.c[0] + anchor.ax * (box.s[0] / 2 + 0.2), box.c[1], box.c[2] + anchor.az * (box.s[2] / 2)]}
            title={t(text.name)}
            subtitle={sub ?? t(text.sub)}
            active={focused}
            side={labelAt?.side ?? anchor.side}
          />
        ) : null}
      </LabelGate.Provider>
    </group>
  )
}
