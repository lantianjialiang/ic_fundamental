import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import { MEM_META } from './meta'
import { MemBinFig } from './MemBinFig'
import {
  CLASS_NAME,
  GUESS_OPTIONS,
  INTRO,
  lineValue,
  MAP_OPTIONS,
  MISCONCEPTIONS,
  QUIZ,
  S,
  TAKEAWAY,
  taskItems,
  verdictOf,
} from './memBinData'
import { analyse, type BinState, DEFAULT_BIN, DEFAULT_SEED, genMap, type MapKind, NO_GUESS } from './memBinModel'
import './memBin.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function MemBinPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<BinState>(DEFAULT_BIN)
  const map = useMemo(() => genMap(state.kind, state.seed), [state.kind, state.seed])
  const analysis = useMemo(() => analyse(map), [map])
  const verdict = verdictOf(state, analysis)
  const judged = state.guess !== NO_GUESS

  const pickKind = (kind: MapKind) => setState((prev) => ({ ...prev, kind, seed: DEFAULT_SEED, guess: NO_GUESS }))
  const reroll = () => setState((prev) => ({ ...prev, seed: prev.seed + 1, guess: NO_GUESS }))
  const judge = (guess: BinState['guess']) =>
    setState((prev) => {
      const hit = guess !== NO_GUESS && guess === analysis.cls
      const solved = hit && !prev.solved.includes(prev.kind) ? [...prev.solved, prev.kind] : prev.solved
      return { ...prev, guess, solved }
    })
  const reset = () => setState(DEFAULT_BIN)

  const blockPct = analysis.n > 0 ? Math.round((analysis.largest / analysis.n) * 100) : 0

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MEM_META.memBin.title)}
      goal={t(MEM_META.memBin.goal)}
      kicker={t(S.kicker)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="memCapstone"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['memBist', 'memCoverage', 'memMarch']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="mem-bin-controls">
          <div className="mem-bin-field">
            <span className="mem-bin-field__label">{t(S.kindLabel)}</span>
            <Seg options={MAP_OPTIONS} value={state.kind} onChange={pickKind} />
          </div>
          <div className="mem-bin-field">
            <span className="mem-bin-field__label">{t(S.guessLabel)}</span>
            <Seg options={GUESS_OPTIONS} value={state.guess} onChange={judge} />
          </div>
          <button type="button" className="lab__btn" onClick={reroll}>
            {t(S.reroll)}
          </button>
        </div>

        <div className="mem-bin-grid">
          <MemBinFig map={map} />
          <div className="mem-bin-cell">
            <Readout
              items={[
                { label: S.rN, value: String(analysis.n) },
                { label: S.rRow, value: t(lineValue(analysis.maxRow, analysis.maxRowIdx, 'row')) },
                { label: S.rCol, value: t(lineValue(analysis.maxCol, analysis.maxColIdx, 'col')) },
                { label: S.rBlock, value: `${blockPct}%` },
                { label: S.rRepair, value: t(analysis.repairable ? S.yes : S.no), state: analysis.repairable ? 'pass' : 'fail' },
                { label: S.rClass, value: judged ? t(CLASS_NAME[analysis.cls]) : t(S.hidden) },
                { label: S.rBin, value: judged ? String(analysis.bin) : t(S.hidden) },
              ]}
            />
          </div>
        </div>
      </Section>

      <Section title={t(S.misTitle)}>
        <Callout tone="warn">
          {MISCONCEPTIONS.map((item, index) => (
            <p key={index}>{`${index + 1}. ${t(item)}`}</p>
          ))}
        </Callout>
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
