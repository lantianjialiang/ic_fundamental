import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { BoxGeometry, EdgesGeometry, LineBasicMaterial, type LineSegments } from 'three'
import { useScene } from '../context/SceneContext'
import { LAYER_BOX } from '../data/layout'

/** 侧栏点选某层时，在 3D 中用金色线框框出该层（跟随分解位移） */
export function FocusBox({ color }: { color: string }) {
  const { store, cfg } = useScene()
  const ref = useRef<LineSegments>(null)
  const geo = useMemo(() => new EdgesGeometry(new BoxGeometry(1, 1, 1)), [])
  const mat = useMemo(() => new LineBasicMaterial({ color, toneMapped: false, transparent: true, opacity: 0.95 }), [color])
  useEffect(() => () => mat.dispose(), [mat])

  useFrame(({ clock }) => {
    const line = ref.current
    if (!line) return
    const box = cfg.focus ? LAYER_BOX[cfg.flow][cfg.focus] : undefined
    line.visible = !!box
    if (!box || !cfg.focus) return
    line.position.set(box.c[0] + store.pose.x[cfg.focus], box.c[1] + store.pose.y[cfg.focus], box.c[2])
    line.scale.set(box.s[0], box.s[1], box.s[2])
    mat.opacity = cfg.reduced ? 0.95 : 0.65 + 0.3 * Math.sin(clock.elapsedTime * 3)
  })

  return <lineSegments ref={ref} geometry={geo} material={mat} visible={false} />
}
