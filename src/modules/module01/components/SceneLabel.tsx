import { Html } from '@react-three/drei'
import { useContext } from 'react'
import { LabelsContext } from '../context/LabelsContext'

type SceneLabelProps = {
  position: [number, number, number]
  title: string
  subtitle?: string
}

export function SceneLabel({ position, title, subtitle }: SceneLabelProps) {
  const show = useContext(LabelsContext)
  if (!show) return null

  return (
    <Html position={position} center distanceFactor={10} occlude={false} style={{ pointerEvents: 'none' }}>
      <div className="scene-label">
        <span className="scene-label__title">{title}</span>
        {subtitle ? <span className="scene-label__sub">{subtitle}</span> : null}
      </div>
    </Html>
  )
}
