import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Seg, Steps } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import { PrereqSection } from './HsPrereq'
import { BathtubFig, EyeBoxFig } from './SerdesFig'
import {
  INTRO,
  MISCONCEPTIONS,
  PREREQ,
  QUIZ,
  S,
  SAMPLE_OPTIONS,
  STEPS,
  TAKEAWAY,
  fmtBer,
  taskItems,
  verdictOf,
} from './serdesData'
import { BER_LIMIT, DEFAULT_SAMPLE, DEVICE_NAME, SPEC_EH_MV, SPEC_EW_UI, buildCsv, runAll, type SampleId } from './serdesModel'
import { HS_META } from './meta'
import './hs.css'
import './hsCapstone.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function HsCapstonePage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [sample, setSample] = useState<SampleId>(DEFAULT_SAMPLE)
  /** 最近一次「运行全部」时的样片；换了样片后需要重新运行，报告才会出现 */
  const [ranSample, setRanSample] = useState<SampleId | null>(null)
  const [csvDone, setCsvDone] = useState(false)

  const report = useMemo(() => runAll(sample), [sample])
  const shown = ranSample === sample ? report : null
  const verdict = verdictOf(sample, shown)

  const reset = () => {
    setSample(DEFAULT_SAMPLE)
    setRanSample(null)
    setCsvDone(false)
  }

  const runAllSteps = () => {
    setRanSample(sample)
  }

  const downloadCsv = () => {
    if (shown === null) {
      return
    }
    const blob = new Blob([buildCsv(shown)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${DEVICE_NAME.toLowerCase()}_${sample}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    setCsvDone(true)
  }

  const passText = (ok: boolean): LText => (ok ? S.pass : S.fail)
  const rows = shown === null ? [] : [
    {
      label: S.rowPhase,
      measured: `${shown.bestPhasePs.toFixed(1)} ps`,
      limit: '—',
      result: null,
    },
    {
      label: S.rowBer,
      measured: fmtBer(shown.berAtBest),
      limit: `≤ ${BER_LIMIT.toExponential(0)}`,
      result: shown.checks.ber,
    },
    {
      label: S.rowEw,
      measured: `${shown.ewUi.toFixed(3)} UI`,
      limit: `≥ ${SPEC_EW_UI.toFixed(2)} UI`,
      result: shown.checks.ew,
    },
    {
      label: S.rowEh,
      measured: `${shown.ehMv.toFixed(1)} mV`,
      limit: `≥ ${SPEC_EH_MV} mV`,
      result: shown.checks.eh,
    },
    {
      label: S.rowOverall,
      measured: '',
      limit: '',
      result: shown.checks.overall,
    },
  ]

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(HS_META.hsCapstone.title)}
      goal={t(HS_META.hsCapstone.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      extra={<TaskList items={taskItems(sample, shown, csvDone)} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['hsEye', 'hsJitter', 'hsInterface', 'hsAteLimit']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <Steps items={STEPS} />

        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.sampleLabel)}</span>
            <Seg options={SAMPLE_OPTIONS} value={sample} onChange={setSample} />
          </div>
          <button type="button" className="lab__btn lab__btn--primary" aria-label={t(S.runAria)} onClick={runAllSteps}>
            {t(S.runAll)}
          </button>
        </div>

        <div className="serdes-figs">
          <BathtubFig points={report.points} bestPhasePs={report.bestPhasePs} />
          <EyeBoxFig sample={sample} />
        </div>

        <div className="serdes-report">
          <h3 className="serdes-report__title">{t(S.reportTitle)}</h3>
          <p className="serdes-report__note">{t(S.reportNote)}</p>
          {shown === null ? (
            <p className="serdes-report__idle">{t(S.idleHint)}</p>
          ) : (
            <table className="serdes-table">
              <thead>
                <tr>
                  <th scope="col">{t(S.colItem)}</th>
                  <th scope="col">{t(S.colMeasured)}</th>
                  <th scope="col">{t(S.colLimit)}</th>
                  <th scope="col">{t(S.colResult)}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className={row.result === null ? '' : row.result ? 'is-pass' : 'is-fail'}>
                    <td>{t(row.label)}</td>
                    <td>{row.measured}</td>
                    <td>{row.limit}</td>
                    <td>{row.result === null ? t(S.info) : t(passText(row.result))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="serdes-csv">
          <p className="serdes-csv__note">{t(S.csvNote)}</p>
          <button
            type="button"
            className="lab__btn lab__btn--primary"
            aria-label={t(S.csvAria)}
            disabled={shown === null}
            onClick={downloadCsv}
          >
            {t(S.csvBtn)}
          </button>
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

      <PrereqSection title={S.prereqTitle} note={S.prereqNote} items={PREREQ} />
    </LessonFrame>
  )
}
