import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import { MEM_META } from './meta'
import { MemParallelFig } from './MemParallelFig'
import {
  CAP_OPTIONS,
  FAIL_OPTIONS,
  INTRO,
  MISCONCEPTIONS,
  QUIZ,
  S,
  SITE_OPTIONS,
  TAKEAWAY,
  taskItems,
  verdictOf,
} from './memParallelData'
import { analyseParallel, CH_TOTAL, DEFAULT_PARALLEL, FAIL_DEPTH, type ParallelState } from './memParallelModel'
import './memParallel.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function MemParallelPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<ParallelState>(DEFAULT_PARALLEL)
  const result = useMemo(() => analyseParallel(state), [state])
  const verdict = verdictOf(result)
  const update = (patch: Partial<ParallelState>) => setState((prev) => ({ ...prev, ...patch }))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MEM_META.memParallel.title)}
      goal={t(MEM_META.memParallel.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={verdict.note ? `${t(verdict.text)} ${t(verdict.note)}` : t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="memCoverage"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, result)} onReset={() => setState(DEFAULT_PARALLEL)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['memMarch', 'memTiming', 'memBin']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="mpar-controls">
          <div className="mpar-field">
            <span className="mpar-field__label">{t(S.capLabel)}</span>
            <Seg options={CAP_OPTIONS} value={state.cap} onChange={(cap) => update({ cap })} />
          </div>
          <div className="mpar-field">
            <span className="mpar-field__label">{t(S.failLabel)}</span>
            <Seg options={FAIL_OPTIONS} value={state.fail} onChange={(fail) => update({ fail })} />
          </div>
          <div className="mpar-field">
            <span className="mpar-field__label">{t(S.siteLabel)}</span>
            <Seg options={SITE_OPTIONS} value={String(state.sites)} onChange={(id) => update({ sites: Number(id) })} />
          </div>
        </div>

        <div className="mpar-grid">
          <MemParallelFig state={state} result={result} />
          <div className="mpar-cell">
            <Readout
              items={[
                { label: S.rCh, value: `${result.channelsUsed} / ${CH_TOTAL}` },
                { label: S.rTime, value: result.tBatch.toFixed(3) },
                { label: S.rThr, value: Math.round(result.throughput).toString() },
                { label: S.rSpeed, value: `${result.speedup.toFixed(2)} x` },
                {
                  label: S.rFill,
                  value: `${result.fillPct.toFixed(0)}%`,
                  state: result.overflow ? 'fail' : undefined,
                },
                { label: S.rTotal, value: `${result.totalStored} / ${result.sites * FAIL_DEPTH}` },
                { label: S.rShare, value: `${(result.readShare * 100).toFixed(0)}%` },
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
