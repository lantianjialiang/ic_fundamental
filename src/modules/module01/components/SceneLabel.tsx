import { Html } from '@react-three/drei'
import type { Vec3 } from '../data/layout'

type SceneLabelProps = {
  position: Vec3
  title: string
  subtitle?: string
  active?: boolean
}

/** 3D 标注：HTML 标签，配色走站点 CSS 变量，跟随主题 */
export function SceneLabel({ position, title, subtitle, active = false }: SceneLabelProps) {
  return (
    <Html position={position} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div className={`m01-label${active ? ' is-active' : ''}`}>
        <span className="m01-label__title">{title}</span>
        {subtitle ? <span className="m01-label__sub">{subtitle}</span> : null}
      </div>
    </Html>
  )
}
