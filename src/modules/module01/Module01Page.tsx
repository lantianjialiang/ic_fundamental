import { useMemo, useRef, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LabShell } from '../../lab/LabShell'
import { type ModuleId } from '../catalog'
import { LegendPanel } from './components/LegendPanel'
import { createStore, resetContact, type SceneConfig } from './context/SceneContext'
import { PHASES, computePose, type ContactPhase, type LayerId, type Pkg, type ProbeType, type TestFlow } from './data/layout'
import { PHASE_TEXT, T } from './data/text'
import { useReducedMotion } from './hooks/useReducedMotion'
import { Scene } from './Scene'
import './module01.css'

type Module01PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

export function Module01Page({ moduleId, onModuleChange }: Module01PageProps) {
  const { t } = useLocale()
  const reduced = useReducedMotion()
  const store = useRef(createStore('FT')).current
  const [flow, setFlow] = useState<TestFlow>('FT')
  const [pkg, setPkg] = useState<Pkg>('BGA')
  const [probe, setProbe] = useState<ProbeType>('cantilever')
  const [showLabels, setShowLabels] = useState(false)
  const [selected, setSelected] = useState<number | null>(null)
  const [focus, setFocus] = useState<LayerId | null>(null)
  const [exploded, setExploded] = useState(false)
  const [section, setSection] = useState(false)
  const [phase, setPhase] = useState<ContactPhase>('idle')
  const [resetKey, setResetKey] = useState(0)

  const stopContact = () => {
    resetContact(store)
    setPhase('idle')
  }

  const switchFlow = (next: TestFlow) => {
    if (next === flow) return
    stopContact()
    store.explodeTarget = 0
    store.scrubMax = 0
    computePose(next, store, store.pose)
    setExploded(false)
    setSelected(null)
    setFocus(null)
    setFlow(next)
  }

  const toggleExplode = () => {
    stopContact()
    const next = !exploded
    store.explodeTarget = next ? 1 : 0
    setExploded(next)
  }

  const startContact = () => {
    store.explodeTarget = 0
    setExploded(false)
    store.scrubMax = 0
    store.pulseT = 0
    store.phaseT = 0
    if (reduced) {
      resetContact(store)
      store.phase = 'done'
      setPhase('done')
      return
    }
    if (flow === 'FT') {
      store.shuttle = 1
      store.lift = 1
      store.press = 0
    } else {
      store.waferShift = 1
      store.drop = 1
      store.od = 0
    }
    const first = PHASES[flow][0] ?? 'done'
    store.phase = first
    setPhase(first)
  }

  const changePkg = (next: Pkg) => {
    stopContact()
    setPkg(next)
  }

  const changeProbe = (next: ProbeType) => {
    stopContact()
    store.scrubMax = 0
    setProbe(next)
  }

  const toggleSection = (on: boolean) => {
    store.sectionTarget = on ? 1 : 0
    setSection(on)
  }

  const resetView = () => {
    setFocus(null)
    setResetKey((k) => k + 1)
  }

  const cfg = useMemo<SceneConfig>(
    () => ({ flow, pkg, probe, selected, focus, showLabels, reduced, onSelect: setSelected }),
    [flow, pkg, probe, selected, focus, showLabels, reduced],
  )

  const phases = PHASES[flow]
  const phaseIndex = phases.indexOf(phase)
  const isFT = flow === 'FT'

  return (
    <LabShell
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m02.title)}
      goal={t(isFT ? ui.m02.goalFt : ui.m02.goalCp)}
      footer={
        <footer className="lab__toolbar m01-toolbar">
          <div className="lab__modes" role="group" aria-label={t(T.flowGroup)}>
            <button
              type="button"
              className={`lab__mode${isFT ? ' is-active' : ''}`}
              aria-pressed={isFT}
              onClick={() => switchFlow('FT')}
            >
              {t(T.ft)}
            </button>
            <button
              type="button"
              className={`lab__mode${!isFT ? ' is-active' : ''}`}
              aria-pressed={!isFT}
              onClick={() => switchFlow('CP')}
            >
              {t(T.cp)}
            </button>
          </div>
          <button type="button" className="lab__btn lab__btn--primary" onClick={toggleExplode}>
            {t(exploded ? T.assemble : T.explode)}
          </button>
          <button type="button" className="lab__btn" onClick={startContact}>
            {t(phase === 'idle' ? T.contact : T.contactReplay)}
          </button>
          <label className="lab__check">
            <input type="checkbox" checked={section} onChange={(event) => toggleSection(event.target.checked)} />
            {t(T.section)}
          </label>
          {isFT ? (
            <div className="lab__modes" role="group" aria-label={t(T.pkgGroup)}>
              {(['BGA', 'QFP'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`lab__mode${pkg === p ? ' is-active' : ''}`}
                  aria-pressed={pkg === p}
                  onClick={() => changePkg(p)}
                >
                  {t(p === 'BGA' ? T.bga : T.qfp)}
                </button>
              ))}
            </div>
          ) : (
            <div className="lab__modes" role="group" aria-label={t(T.probeGroup)}>
              {(['cantilever', 'vertical'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`lab__mode${probe === p ? ' is-active' : ''}`}
                  aria-pressed={probe === p}
                  onClick={() => changeProbe(p)}
                >
                  {t(p === 'cantilever' ? T.cantilever : T.vertical)}
                </button>
              ))}
            </div>
          )}
          <label className="lab__check">
            <input type="checkbox" checked={showLabels} onChange={(event) => setShowLabels(event.target.checked)} />
            {t(T.labels)}
          </label>
          <button type="button" className="lab__btn" onClick={resetView}>
            {t(T.resetView)}
          </button>
          <span className="lab__hint m01-hint">{t(T.hint)}</span>
          <button type="button" className="lab__btn lab__btn--primary" onClick={() => onModuleChange('ate')}>
            {t(T.next)}
          </button>
        </footer>
      }
    >
      <div className="lab__body">
        <main className="lab__stage m01-stage" aria-label={t(T.stageAria)}>
          <Scene store={store} cfg={cfg} resetKey={resetKey} onPhase={setPhase} />
          <p className="m01-overlay m01-overlay--note">{t(T.scaleShort)}</p>
          {phase !== 'idle' ? (
            <div className="m01-overlay m01-overlay--phase" aria-live="polite">
              {phaseIndex >= 0 && phase !== 'done' ? (
                <span className="m01-overlay__step">
                  {t(T.stepOf)
                    .replace('{i}', String(phaseIndex + 1))
                    .replace('{n}', String(phases.length - 1))}
                </span>
              ) : null}
              <span>{t(PHASE_TEXT[phase])}</span>
              {phase === 'signal' ? <span className="m01-overlay__sub">{t(T.pulseLegend)}</span> : null}
            </div>
          ) : null}
        </main>
        <LegendPanel
          flow={flow}
          pkg={pkg}
          probe={probe}
          selected={selected}
          onSelect={setSelected}
          focus={focus}
          onFocus={(id) => setFocus((f) => (f === id ? null : id))}
          phase={phase}
        />
      </div>
    </LabShell>
  )
}
