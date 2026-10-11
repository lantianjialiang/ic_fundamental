import { Html } from '@react-three/drei'
import { createContext, useContext } from 'react'
import type { Vec3 } from '../data/layout'

type SceneLabelProps = {
  position: Vec3
  title: string
  subtitle?: string
  active?: boolean
  /** 标签在锚点的右边（默认）还是左边 */
  side?: 'left' | 'right'
  /** 小号标签（PCB 分层标注，层与层挨得近） */
  compact?: boolean
}

/** HTML 标签不跟随父级 three 对象的 visible，所在部件被隐藏时由这里关掉 */
export const LabelGate = createContext(true)

/** 3D 标注：HTML 标签，配色走站点 CSS 变量，跟随主题 */
export function SceneLabel({ position, title, subtitle, active = false, side = 'right', compact = false }: SceneLabelProps) {
  const open = useContext(LabelGate)
  if (!open) return null
  return (
    <Html position={position} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div className={`m01-label m01-label--${side}${compact ? ' m01-label--compact' : ''}${active ? ' is-active' : ''}`}>
        <span className="m01-label__title">{title}</span>
        {subtitle ? <span className="m01-label__sub">{subtitle}</span> : null}
      </div>
    </Html>
  )
}
