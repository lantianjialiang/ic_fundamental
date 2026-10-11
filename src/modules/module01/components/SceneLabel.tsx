import { Html } from '@react-three/drei'
import type { Vec3 } from '../data/layout'

type SceneLabelProps = {
  position: Vec3
  title: string
  subtitle?: string
  active?: boolean
  /** 标签在锚点的右边（默认）还是左边 */
  side?: 'left' | 'right'
}

/** 3D 标注：HTML 标签，配色走站点 CSS 变量，跟随主题 */
export function SceneLabel({ position, title, subtitle, active = false, side = 'right' }: SceneLabelProps) {
  return (
    <Html position={position} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div className={`m01-label m01-label--${side}${active ? ' is-active' : ''}`}>
        <span className="m01-label__title">{title}</span>
        {subtitle ? <span className="m01-label__sub">{subtitle}</span> : null}
      </div>
    </Html>
  )
}
