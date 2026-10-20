import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import { RF_META } from './meta'
import { BerFig } from './RfCapstoneFig'
import {
  BIN_LABELS,
  BIN_ORDER,
  INTRO,
  MISCONCEPTIONS,
  QUIZ,
  S,
  STATUS_LABELS,
  STEP_LABELS,
  STOP_TEXT,
  TAKEAWAY,
  stepStatus,
  taskItems,
  verdictOf,
} from './rfCapstoneData'
import {
  BER_BITS,
  DEFAULT_CAP,
  DEVICE_NAME,
  N_DEVICES,
  runBatch,
  summarize,
  toCsv,
  type Bin,
  type CapState,
  type Summary,
} from './rfCapstoneModel'
import './rfCapstone.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const f2 = (value: number) => value.toFixed(2)

/** 通过为 pass，未测（null）不着色 */
function passState(value: boolean | null): 'pass' | 'fail' | undefined {
  if (value === null) {
    return undefined
  }
  return value ? 'pass' : 'fail'
}

/** 批量的 Bin 计数：summary 里的字段与 Bin 名一一对应 */
function binCount(summary: Summary, bin: Bin): number {
  if (bin === 'pass') {
    return summary.pass
  }
  if (bin === 'txFail') {
    return summary.txFail
  }
  return summary.rxFail
}

export function RfCapstonePage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<CapState>(DEFAULT_CAP)
  const [exported, setExported] = useState(false)
  const results = useMemo(() => runBatch(state.spread, state.rxTest), [state.spread, state.rxTest])
  const summary = useMemo(() => summarize(results), [results])
  const device = results[state.device - 1]
  const verdict = verdictOf(state, device)
  const update = (patch: Partial<CapState>) => setState((prev) => ({ ...prev, ...patch }))
  const reset = () => {
    setState(DEFAULT_CAP)
    setExported(false)
  }

  const exportCsv = () => {
    const blob = new Blob([toCsv(results)], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${DEVICE_NAME}-report.csv`
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
    setExported(true)
  }

  const stopRows: Array<{ step: number; limit: LText; count: number }> = [
    { step: 1, limit: S.limitPout, count: summary.stopCounts.txPower },
    { step: 2, limit: S.limitEvm, count: summary.stopCounts.txEvm },
    { step: 3, limit: S.limitGain, count: summary.stopCounts.rxGain },
    { step: 4, limit: S.limitBer, count: summary.stopCounts.rxBer },
  ]

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(RF_META.rfCapstone.title)}
      goal={t(RF_META.rfCapstone.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={verdict.note ? `${t(verdict.text)} ${t(verdict.note)}` : t(verdict.text)}
      asideLater={t(S.asideLater)}
      extra={<TaskList items={taskItems(state, device, summary, exported)} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['rfEvm', 'rfNf', 'rfCal', 'fProgram']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="rf-controls">
          <Knob label={S.spreadLabel} value={state.spread} unit="×" min={0.5} max={2} step={0.1} onChange={(spread) => update({ spread })} />
          <Knob label={S.rxTestLabel} value={state.rxTest} unit="dBm" min={-100} max={-90} step={0.5} onChange={(rxTest) => update({ rxTest })} />
          <Knob label={S.deviceLabel} value={state.device} unit="" min={1} max={N_DEVICES} step={1} onChange={(device) => update({ device })} />
        </div>

        <div className="rf-grid">
          <div className="rf-cell">
            <ol className="rf-flow">
              {STEP_LABELS.map((label, step) => {
                const status = stepStatus(device.stopAt, step)
                return (
                  <li key={step} className={`rf-flow__step is-${status}`}>
                    <b>{t(label)}</b>
                    <span>{t(STATUS_LABELS[status])}</span>
                  </li>
                )
              })}
            </ol>
            <p className="rf-flow-note">{t(S.flowNote)}</p>
            <Readout
              items={[
                { label: S.rPout, value: `${f2(device.pout)} dBm`, state: passState(device.poutPass) },
                { label: S.rEvm, value: device.evm === null ? t(S.notRun) : `${f2(device.evm)} %`, state: passState(device.evmPass) },
                { label: S.rGain, value: device.gain === null ? t(S.notRun) : `${f2(device.gain)} dB`, state: passState(device.gainPass) },
                {
                  label: S.rBer,
                  value: device.errors === null ? t(S.notRun) : `${device.errors} / ${BER_BITS}`,
                  state: passState(device.berPass),
                },
                { label: S.rSens, value: `${f2(device.sensDbm)} dBm` },
                { label: S.rBin, value: t(BIN_LABELS[device.bin]), state: device.bin === 'pass' ? 'pass' : 'fail' },
              ]}
            />
          </div>
          <BerFig nfDb={device.nfDb} rxTest={state.rxTest} />
        </div>
      </Section>

      <Section title={t(S.batchTitle)} note={t(S.batchNote)}>
        <div className="rf-grid">
          <div className="rf-cell">
            <Readout
              items={[
                { label: S.rPass, value: `${summary.pass} / ${summary.total}` },
                { label: S.rYield, value: `${summary.yieldPct.toFixed(0)} %` },
                { label: S.rTxFail, value: `${summary.txFail}` },
                { label: S.rRxFail, value: `${summary.rxFail}` },
              ]}
            />
            <p className="rf-flow-note">
              <b>{t(S.binTitle)}</b>
            </p>
            <div className="rf-bins">
              {BIN_ORDER.map((bin) => {
                const count = binCount(summary, bin)
                const pct = summary.total === 0 ? 0 : (count / summary.total) * 100
                return (
                  <div key={bin} className="rf-bin">
                    <span>{t(BIN_LABELS[bin])}</span>
                    <div className="rf-bin__track">
                      <span className={`rf-bin__fill is-${bin}`} style={{ width: `${pct.toFixed(1)}%` }} />
                    </div>
                    <span className="rf-bin__count">{`${count} (${pct.toFixed(0)}%)`}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rf-cell">
            <p className="rf-flow-note">
              <b>{t(S.stopTitle)}</b>
            </p>
            <div className="rf-table-wrap">
              <table className="rf-table">
                <thead>
                  <tr>
                    <th>{t(S.colTest)}</th>
                    <th>{t(S.colLimit)}</th>
                    <th>{t(S.colStop)}</th>
                  </tr>
                </thead>
                <tbody>
                  {stopRows.map((row) => (
                    <tr key={row.step}>
                      <td>{t(STEP_LABELS[row.step])}</td>
                      <td>{t(row.limit)}</td>
                      <td className={row.count > 0 ? 'is-fail' : ''}>{`${row.count}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="rf-actions">
          <button type="button" className="lab__btn lab__btn--primary" onClick={exportCsv}>
            {t(S.csvBtn)}
          </button>
        </div>
        <p className="rf-flow-note">{t(S.csvNote)}</p>

        <p className="rf-flow-note">
          <b>{t(S.reportTitle)}</b>
        </p>
        <div className="rf-report">
          <table className="rf-table">
            <thead>
              <tr>
                <th>{t(S.colDev)}</th>
                <th>{t(S.colPout)}</th>
                <th>{t(S.colEvm)}</th>
                <th>{t(S.colGain)}</th>
                <th>{t(S.colErr)}</th>
                <th>{t(S.colBin)}</th>
                <th>{t(S.colStopAt)}</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.index}>
                  <td>{`${r.index}`}</td>
                  <td className={r.poutPass ? '' : 'is-fail'}>{f2(r.pout)}</td>
                  <td className={r.evmPass === false ? 'is-fail' : ''}>{r.evm === null ? '—' : f2(r.evm)}</td>
                  <td className={r.gainPass === false ? 'is-fail' : ''}>{r.gain === null ? '—' : f2(r.gain)}</td>
                  <td className={r.berPass === false ? 'is-fail' : ''}>{r.errors === null ? '—' : `${r.errors} / ${BER_BITS}`}</td>
                  <td className={r.bin === 'pass' ? '' : 'is-fail'}>{t(BIN_LABELS[r.bin])}</td>
                  <td>{t(STOP_TEXT[r.stopAt])}</td>
                </tr>
              ))}
            </tbody>
          </table>
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
