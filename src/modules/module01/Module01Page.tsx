import { useState } from 'react'
import { LabShell } from '../../lab/LabShell'
import { type ModuleId } from '../catalog'
import { LegendPanel } from './components/LegendPanel'
import { Scene } from './Scene'
import { LabelsContext } from './context/LabelsContext'
import { type TestFlow } from './data/layout'
import { useAssembly } from './hooks/useAssembly'

const GOALS: Record<TestFlow, string> = {
  FT: 'FT：DUT 在上、ATE 在下。路径：封装 DUT → Socket → Load Board → ATE Channel。',
  CP: 'CP：ATE 在上、Wafer 在下。路径：ATE Channel → Probe Card → Needles → Die Pad。',
}

type Module01PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

export function Module01Page({ moduleId, onModuleChange }: Module01PageProps) {
  const { progress, explode, assemble } = useAssembly()
  const [flow, setFlow] = useState<TestFlow>('FT')
  const [showLabels, setShowLabels] = useState(false)
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null)
  const exploded = progress > 0.5

  const switchFlow = (next: TestFlow) => {
    setFlow(next)
    assemble()
  }

  return (
    <LabelsContext.Provider value={showLabels}>
      <LabShell
        moduleId={moduleId}
        onModuleChange={onModuleChange}
        title="Module 02 — How is a DUT connected to an ATE?"
        goal={GOALS[flow]}
        footer={
          <footer className="lab__toolbar">
            <div className="lab__modes" role="group" aria-label="Test flow">
              <button
                type="button"
                className={`lab__mode${flow === 'FT' ? ' is-active' : ''}`}
                onClick={() => switchFlow('FT')}
              >
                FT 成品测试
              </button>
              <button
                type="button"
                className={`lab__mode${flow === 'CP' ? ' is-active' : ''}`}
                onClick={() => switchFlow('CP')}
              >
                CP 晶圆测试
              </button>
            </div>
            <button type="button" className="lab__btn lab__btn--primary" onClick={explode} disabled={exploded && progress > 0.99}>
              Explode
            </button>
            <button type="button" className="lab__btn" onClick={assemble} disabled={!exploded && progress < 0.01}>
              Assemble
            </button>
            <label className="lab__check">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(event) => setShowLabels(event.target.checked)}
              />
              3D 标注
            </label>
            <span className="lab__hint">
              左键旋转 · 滚轮缩放 · 右键平移 · 点通道或 PCB 走线高亮路径
            </span>
          </footer>
        }
      >
        <div className="lab__body">
          <main className="lab__stage">
            <Scene
              progress={progress}
              flow={flow}
              selectedChannel={selectedChannel}
              onSelect={setSelectedChannel}
            />
          </main>
          <LegendPanel flow={flow} selectedChannel={selectedChannel} onSelect={setSelectedChannel} />
        </div>
      </LabShell>
    </LabelsContext.Provider>
  )
}
