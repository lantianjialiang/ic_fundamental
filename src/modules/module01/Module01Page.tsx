import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LabShell } from '../../lab/LabShell'
import { type ModuleId } from '../catalog'
import { LegendPanel } from './components/LegendPanel'
import { Scene } from './Scene'
import { LabelsContext } from './context/LabelsContext'
import { type TestFlow } from './data/layout'
import { useAssembly } from './hooks/useAssembly'

type Module01PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

export function Module01Page({ moduleId, onModuleChange }: Module01PageProps) {
  const { t } = useLocale()
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
        title={t(ui.m02.title)}
        goal={t(flow === 'FT' ? ui.m02.goalFt : ui.m02.goalCp)}
        footer={
          <footer className="lab__toolbar">
            <div className="lab__modes" role="group" aria-label="Test flow">
              <button
                type="button"
                className={`lab__mode${flow === 'FT' ? ' is-active' : ''}`}
                onClick={() => switchFlow('FT')}
              >
                {t(ui.m02.ft)}
              </button>
              <button
                type="button"
                className={`lab__mode${flow === 'CP' ? ' is-active' : ''}`}
                onClick={() => switchFlow('CP')}
              >
                {t(ui.m02.cp)}
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
              {t(ui.m02.labels)}
            </label>
            <span className="lab__hint">
              {t(ui.m02.hint)}
            </span>
            <button type="button" className="lab__btn lab__btn--primary" onClick={() => onModuleChange('ate')}>
              {t(ui.m02.next)}
            </button>
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
