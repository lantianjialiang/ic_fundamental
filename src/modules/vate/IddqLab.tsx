import { useRef, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { Cards, Seg } from '../fund/parts'
import { CLAMP_DEFAULT_INDEX, CLAMP_STEPS, DUTS, RANGES, S, VECTORS } from './data/content'
import { fmtRange, fmtUa, iddqBreakdown, iddqHeadline, iddqReading, iddqWhy } from './data/explain'
import { IDDQ_SPEC, VECTOR_IDS, decimalsFor, runIddq, type IddqConfig, type IddqResult, type IddqStatus } from './model/iddq'
import { Badge, Field, Pane, STATUS_LABEL, Slider, type Note, type Tone } from './parts'

type Run = { n: number; cfg: IddqConfig; result: IddqResult }

const TONE: Record<IddqStatus, Tone> = { pass: 'pass', fail: 'fail', invalid: 'warn', abort: 'muted' }
const MAX_RUNS = 80

function readingText(r: IddqResult): LText {
  if (r.reason === 'absmax') return S.noMeasure
  if (r.reason === 'overrange') return S.overRange
  const read = iddqReading(r)
  return read ? loc(read, read) : S.invalidRead
}

function condLine1(cfg: IddqConfig): string {
  return `${cfg.vdd.toFixed(2)} V · ${cfg.vector.toUpperCase()} · ${cfg.settleMs.toFixed(1)} ms`
}

function condLine2(cfg: IddqConfig, r: IddqResult): LText {
  const range = r.rangeUa ? fmtRange(r.rangeUa) : '—'
  const clamp = fmtRange(cfg.clampUa)
  return cfg.range === 'auto'
    ? loc(`量程 自动→${range} · 钳位 ${clamp}`, `range auto→${range} · clamp ${clamp}`)
    : loc(`量程 ${range} · 钳位 ${clamp}`, `range ${range} · clamp ${clamp}`)
}

export function noteForIddq(run: Run): Note {
  return {
    kicker: S.kickerIddq,
    title: loc(
      `#${run.n} · ${STATUS_LABEL[run.result.status].zh}`,
      `#${run.n} · ${STATUS_LABEL[run.result.status].en}`,
    ),
    text: iddqHeadline(run.cfg, run.result),
  }
}

export function IddqLab({ onNote }: { onNote: (note: Note) => void }) {
  const { t } = useLocale()
  const [dut, setDut] = useState(DUTS[0].id)
  const [vdd, setVdd] = useState(IDDQ_SPEC.vddNom)
  const [vector, setVector] = useState(VECTORS[0].id)
  const [settleMs, setSettleMs] = useState(5)
  const [range, setRange] = useState(RANGES[0].id)
  const [clampIdx, setClampIdx] = useState(CLAMP_DEFAULT_INDEX)
  const [limitUa, setLimitUa] = useState(IDDQ_SPEC.limitUa)
  const [runs, setRuns] = useState<Run[]>([])
  const [sel, setSel] = useState<number | null>(null)
  const counter = useRef(0)

  const clampUa = CLAMP_STEPS[clampIdx]
  const config = (vec = vector): IddqConfig => ({ dut, vdd, vector: vec, settleMs, range, clampUa, limitUa })

  const pushRuns = (cfgs: IddqConfig[]) => {
    const fresh = cfgs.map((cfg) => ({ n: ++counter.current, cfg, result: runIddq(cfg) }))
    const last = fresh[fresh.length - 1]
    const newestFirst = [...fresh].reverse()
    setRuns((prev) => [...newestFirst, ...prev].slice(0, MAX_RUNS))
    setSel(last.n)
    onNote(noteForIddq(last))
  }

  const current = runs.find((r) => r.n === sel) ?? runs[0]
  const pick = (run: Run) => {
    setSel(run.n)
    onNote(noteForIddq(run))
  }

  return (
    <div className="vlab">
      <Pane title={S.config} className="vpane--config">
        <Field label={S.dut}>
          <Cards items={DUTS} activeId={dut} onPick={(x) => setDut(x.id)} cols={3} />
        </Field>
        <div className="vgrid">
          <Field label={S.vdd} value={`${vdd.toFixed(2)} V`} hint={S.vddHint}>
            <Slider label={t(S.vdd)} value={vdd} min={0} max={3} step={0.02} onChange={setVdd} />
            {vdd > IDDQ_SPEC.absMax + 1e-9 ? <p className="vwarn">⚠ {t(S.vddAbsWarn)}</p> : null}
          </Field>
          <Field label={S.vector}>
            <Seg options={VECTORS.map((v) => ({ id: v.id, label: v.label }))} value={vector} onChange={setVector} />
          </Field>
          <Field label={S.settle} value={`${settleMs.toFixed(1)} ms`} hint={S.settleHint}>
            <Slider label={t(S.settle)} value={settleMs} min={0.1} max={10} step={0.1} onChange={setSettleMs} />
          </Field>
          <Field label={S.range} hint={S.rangeHint}>
            <Seg options={RANGES} value={range} onChange={setRange} />
          </Field>
          <Field label={S.clamp} value={fmtRange(clampUa)}>
            <Slider label={t(S.clamp)} value={clampIdx} min={0} max={CLAMP_STEPS.length - 1} step={1} onChange={setClampIdx} />
          </Field>
          <Field label={S.limit} value={`${limitUa} µA`}>
            <Slider label={t(S.limit)} value={limitUa} min={10} max={300} step={5} onChange={setLimitUa} />
          </Field>
        </div>
        <div className="vrun">
          <button type="button" className="lab__btn lab__btn--primary vrun__go" onClick={() => pushRuns([config()])}>
            ▶ {t(S.run)}
          </button>
          <button type="button" className="lab__btn" onClick={() => pushRuns(VECTOR_IDS.map((v) => config(v)))}>
            ▶ {t(S.runAll)}
          </button>
          <span className="vrun__hint">{t(S.disclaimer)}</span>
        </div>
      </Pane>

      <Pane title={S.result} className="vpane--result">
        {current ? <IddqResultView run={current} /> : <p className="vempty">{t(S.noRun)}</p>}
      </Pane>

      <Pane title={S.datalog} className="vpane--log">
        <div className="vlog__tools">
          <span className="vfield__hint">{t(S.logNote)}</span>
          <button
            type="button"
            className="lab__btn"
            disabled={runs.length === 0}
            onClick={() => {
              setRuns([])
              setSel(null)
              counter.current = 0
            }}
          >
            {t(S.clear)}
          </button>
        </div>
        <div className="vscroll">
          <table className="dtable vlog">
            <thead>
              <tr>
                <th>{t(S.colNo)}</th>
                <th>{t(S.colDut)}</th>
                <th>{t(S.colCond)}</th>
                <th>{t(S.colRead)}</th>
                <th>{t(S.colLimit)}</th>
                <th>{t(S.colResult)}</th>
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="vempty">
                    {t(S.noRun)}
                  </td>
                </tr>
              ) : (
                runs.map((run) => (
                  <tr
                    key={run.n}
                    className={`is-click${current?.n === run.n ? ' is-active' : ''}`}
                    onClick={() => pick(run)}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pick(run))}
                    aria-selected={current?.n === run.n}
                  >
                    <td className="mono-cell">{String(run.n).padStart(3, '0')}</td>
                    <td>{t(DUTS.find((d) => d.id === run.cfg.dut)!.title)}</td>
                    <td className="vlog__cond">
                      <span>{condLine1(run.cfg)}</span>
                      <span>{t(condLine2(run.cfg, run.result))}</span>
                    </td>
                    <td className="vlog__read">{t(readingText(run.result))}</td>
                    <td className="mono-cell">≤ {run.cfg.limitUa} µA</td>
                    <td>
                      <Badge tone={TONE[run.result.status]} label={STATUS_LABEL[run.result.status]} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Pane>
    </div>
  )
}

function IddqResultView({ run }: { run: Run }) {
  const { t } = useLocale()
  const { cfg, result: r } = run
  const why = iddqWhy(cfg, r)
  const aborted = r.reason === 'absmax'
  return (
    <div className="vres">
      <div className="vres__head">
        <span className="vres__no">#{String(run.n).padStart(3, '0')}</span>
        <Badge tone={TONE[r.status]} label={STATUS_LABEL[r.status]} />
      </div>
      <div className="readout">
        <div className={`readout__item${r.status === 'pass' ? ' is-pass' : r.status === 'fail' ? ' is-fail' : ''}`}>
          <b>{t(S.readLabel)}</b>
          <span>{t(readingText(r))}</span>
        </div>
        <div className="readout__item">
          <b>{t(S.colLimit)}</b>
          <span>≤ {cfg.limitUa} µA</span>
        </div>
        {!aborted ? (
          <>
            <div className="readout__item">
              <b>{t(S.rangeLabel)}</b>
              <span>{fmtRange(r.rangeUa)}</span>
            </div>
            <div className="readout__item">
              <b>{t(S.resLabel)}</b>
              <span>{fmtUa(r.resolutionUa, decimalsFor(r.resolutionUa))}</span>
            </div>
          </>
        ) : null}
      </div>
      <p className={`vres__headline vres__headline--${TONE[r.status]}`}>{t(iddqHeadline(cfg, r))}</p>
      {!aborted ? (
        <p className="vres__model">
          <b>{t(S.model)}</b>
          {t(iddqBreakdown(r))}
        </p>
      ) : null}
      {why.length ? (
        <div className="vres__why">
          <b>{t(S.why)}</b>
          <ul>
            {why.map((line, i) => (
              <li key={i}>{t(line)}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
