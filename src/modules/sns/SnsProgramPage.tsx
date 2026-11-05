import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import '../hs/hs.css'
import { SNS_META } from './meta'
import { INTRO, MISCONCEPTIONS, QUIZ, S, STEP_BIN_LABEL, STEP_LABEL, TAKEAWAY, coreNote, gradeLater, taskItems, verdictOf } from './snsProgramData'
import { DEFAULT_PROGRAM, STEP_IDS, analyseProgram, exportSummary, type ProgramState, type StepId } from './snsProgramModel'
import './sns.css'
import { PRACTICE_NOTE, PracticeSteps } from '../../lab/PracticeSteps'

const BG = '#0d1117'
const GOLD = '#e8c45a'
const BLUE = '#58a6ff'
const MUTED = '#8b949e'
const TEXT = '#c9d1d9'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

function BinBars({ bins, aria, caption }: { bins: Record<number, number>; aria: string; caption: string }) {
  const ids = [1, 2, 3, 4, 5, 6]
  const W = 560
  const H = 200
  const L = 28
  const B = 28
  const T = 12
  const max = Math.max(...ids.map((id) => bins[id] ?? 0), 1)
  const slot = (W - L) / ids.length
  return (
    <figure className="sns-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} className="sns-svg">
        <rect width={W} height={H} rx={10} fill={BG} />
        {ids.map((id, index) => {
          const h = ((bins[id] ?? 0) / max) * (H - T - B - 8)
          const x = L + index * slot + 10
          return (
            <g key={id}>
              <rect x={x} y={H - B - h} width={slot - 24} height={h} fill={id === 1 ? GOLD : BLUE} />
              <text x={x + (slot - 24) / 2} y={H - 8} fill={TEXT} fontSize={12} textAnchor="middle">
                {String(id)}
              </text>
            </g>
          )
        })}
        <text x={8} y={16} fill={MUTED} fontSize={11}>
          {String(max)}
        </text>
      </svg>
      <p className="sns-summary">{caption}</p>
    </figure>
  )
}

export function SnsProgramPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<ProgramState>(DEFAULT_PROGRAM)
  const [selected, setSelected] = useState<StepId>(STEP_IDS[0])
  const [exported, setExported] = useState<string | null>(null)
  const analysis = useMemo(() => analyseProgram(state), [state])
  const verdict = verdictOf(selected, state, analysis)
  const update = (patch: Partial<ProgramState>) => {
    setState((prev) => ({ ...prev, ...patch }))
    setExported(null)
  }
  const toggle = (id: StepId) => {
    setState((prev) => ({ ...prev, enabled: { ...prev.enabled, [id]: !prev.enabled[id] } }))
    setExported(null)
  }
  const preview = exported ? exported.split('\n').slice(0, 10).join('\n') : ''

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(SNS_META.snsProgram.title)}
      goal={t(SNS_META.snsProgram.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(gradeLater(state, analysis))}
      extra={
        <TaskList
          items={taskItems(state, analysis, exported !== null)}
          onReset={() => {
            setState(DEFAULT_PROGRAM)
            setSelected(STEP_IDS[0])
            setExported(null)
          }}
        />
      }
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['snsFlat', 'genStdf', 'genMultisite']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.misTitle)}>
        <Callout tone="warn">
          {MISCONCEPTIONS.map((item, index) => (
            <p key={index}>{`${index + 1}. ${t(item)}`}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.coreTitle)} note={t(coreNote())}>
        <p className="intro__note">{t(PRACTICE_NOTE)}</p>
        <PracticeSteps items={taskItems(state, analysis, exported !== null)} />

        <Callout>{t(S.callout)}</Callout>
        <div className="pick pick--3">
          {STEP_IDS.map((id) => (
            <button
              key={id}
              type="button"
              className={`pick__card${selected === id ? ' is-active' : ''}`}
              onClick={() => setSelected(id)}
              aria-pressed={selected === id}
            >
              {t(STEP_LABEL[id])}
              <span>{`${t(state.enabled[id] ? S.on : S.off)} · Bin ${STEP_BIN_LABEL[id]}`}</span>
            </button>
          ))}
        </div>
        <div className="hs-controls">
          <label className="hs-field__label">
            <input
              type="checkbox"
              checked={state.enabled[selected]}
              onChange={() => toggle(selected)}
              aria-label={t(S.enableAria)}
            />
            {` ${t(S.enableAria)}`}
          </label>
        </div>
        <div className="hs-controls">
          <Knob label={S.darkFrames} value={state.darkFrames} unit="" min={1} max={24} step={1} onChange={(v) => update({ darkFrames: Math.round(v) })} />
          <Knob label={S.brightFrames} value={state.brightFrames} unit="" min={1} max={16} step={1} onChange={(v) => update({ brightFrames: Math.round(v) })} />
          <Knob label={S.hotMax} value={state.hotMax} unit="" min={1} max={30} step={1} onChange={(v) => update({ hotMax: Math.round(v) })} />
          <Knob label={S.gradeA} value={state.gradeA} unit="" min={0} max={40} step={1} onChange={(v) => update({ gradeA: Math.round(v) })} />
          <Knob label={S.gradeB} value={state.gradeB} unit="" min={0} max={40} step={1} onChange={(v) => update({ gradeB: Math.round(v) })} />
          <Knob label={S.density} value={state.density} unit="" min={1} max={30} step={1} onChange={(v) => update({ density: Math.round(v) })} />
          <Knob label={S.cluster} value={state.clusterProb} unit="" min={0} max={0.5} step={0.05} onChange={(v) => update({ clusterProb: Math.round(v * 20) / 20 })} />
          <Knob label={S.budget} value={state.budgetS} unit="s" min={0.5} max={3} step={0.1} onChange={(v) => update({ budgetS: Math.round(v * 10) / 10 })} />
        </div>
        <div className="hs-grid">
          <BinBars bins={analysis.bins} aria={t(S.barAria)} caption={t(S.barCap)} />
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rTime, value: `${analysis.timeS.toFixed(2)} s`, state: analysis.withinBudget ? 'pass' : 'fail' },
                { label: S.rBudget, value: `${state.budgetS.toFixed(2)} s` },
                { label: S.rUph, value: Math.round(analysis.uph).toString() },
                { label: S.rFrames, value: String(analysis.frames) },
                { label: S.rPrnu, value: `${(analysis.prnuMeas * 100).toFixed(2)} %` },
                { label: S.rTemporal, value: analysis.temporal.toFixed(4) },
                { label: S.rBin1, value: String(analysis.bins[1]) },
                { label: S.rBin2, value: String(analysis.bins[2]) },
                { label: S.rBin3, value: String(analysis.bins[3]) },
                { label: S.rBin4, value: String(analysis.bins[4]) },
                { label: S.rBin5, value: String(analysis.bins[5]) },
                { label: S.rBin6, value: String(analysis.bins[6]) },
                { label: S.rGrade, value: `${analysis.grades.A} / ${analysis.grades.B} / ${analysis.grades.C}` },
              ]}
            />
          </div>
        </div>
        <div className="hs-controls">
          <button
            type="button"
            className="lab__btn lab__btn--primary"
            aria-label={t(S.exportAria)}
            onClick={() => setExported(exportSummary(analysis.dice))}
          >
            {t(S.exportBtn)}
          </button>
        </div>
        <p className="sns-summary">{t(S.exportCap)}</p>
        <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 180, overflow: 'auto', margin: 0 }}>{exported ? preview : t(S.exportEmpty)}</pre>
      </Section>

      

      <Section title={t(S.takeawayTitle)}>
        <Callout tone="ok">
          <p>{t(TAKEAWAY)}</p>
        </Callout>
      </Section>

      <Section title={t(S.quizTitle)} note={t(S.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>
    </LessonFrame>
  )
}
