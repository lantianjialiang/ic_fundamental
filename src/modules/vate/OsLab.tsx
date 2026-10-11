import { useRef, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { Seg } from '../fund/parts'
import { ChipFig } from './ChipFig'
import {
  BIASES,
  DEFECTS,
  FORCE_DEFAULT_INDEX,
  FORCE_STEPS,
  OS_MODES,
  PUZZLES,
  RC_DEFAULT_INDEX,
  RC_STEPS,
  S,
  VERDICT_LABEL,
} from './data/content'
import { defectTruth, fmtForce, fmtOhm, fmtV, osRowWhy, osWarnings, osWindow, pinName } from './data/explain'
import {
  PINS,
  SIG_PINS,
  runOs,
  sameDefect,
  type Bias,
  type Defect,
  type DefectKind,
  type OsConfig,
  type OsResult,
  type OsRow,
  type OsVerdict,
  type PinId,
} from './model/continuity'
import { Badge, Field, Pane, Slider, type Note, type Tone } from './parts'

type Mode = (typeof OS_MODES)[number]['id']
type Run = { n: number; cfg: OsConfig; mode: Mode; puzzle: number; defect: Defect; result: OsResult; warnings: LText[] }

const TONE: Record<OsVerdict, Tone> = { pass: 'pass', marginal: 'warn', open: 'fail', short: 'fail', abort: 'muted' }
const POLS: Array<{ id: 'neg' | 'pos'; label: LText }> = [
  { id: 'neg', label: S.polNeg },
  { id: 'pos', label: S.polPos },
]
const MAX_RUNS = 40

const pinOption = (id: PinId) => {
  const p = PINS.find((x) => x.id === id)!
  return `Pin ${p.no} · ${p.name}`
}

const BIAS_SHORT: Record<Bias, LText> = { gnd: loc('0 V', '0 V'), float: loc('浮空', 'float') }

function biasText(cfg: OsConfig): LText {
  const o = BIAS_SHORT[cfg.others]
  const v = BIAS_SHORT[cfg.vdd]
  return loc(`其它脚 ${o.zh} · VDD ${v.zh}`, `others ${o.en} · VDD ${v.en}`)
}

function noteForRow(run: Run, row: OsRow): Note {
  const v = VERDICT_LABEL[row.verdict]
  const why = osRowWhy(run.cfg, run.result, row)
  const first = run.warnings[0] ?? why[0] ?? S.noRun
  return {
    kicker: S.kickerOs,
    title: loc(`#${run.n} · ${pinName(row.pin)} · ${v.zh}`, `#${run.n} · ${pinName(row.pin)} · ${v.en}`),
    text: first,
  }
}

export function OsLab({ onNote }: { onNote: (note: Note) => void }) {
  const { t } = useLocale()
  const [mode, setMode] = useState<Mode>(OS_MODES[0].id)
  const [kind, setKind] = useState<DefectKind>(DEFECTS[0].id)
  const [pinA, setPinA] = useState<PinId>(SIG_PINS[0])
  const [pinB, setPinB] = useState<PinId>(SIG_PINS[1])
  const [rcIdx, setRcIdx] = useState(RC_DEFAULT_INDEX)
  const [puzzle, setPuzzle] = useState(0)
  const [pins, setPins] = useState<PinId[]>([SIG_PINS[0]])
  const [pol, setPol] = useState(POLS[0].id)
  const [forceIdx, setForceIdx] = useState(FORCE_DEFAULT_INDEX)
  const [clampV, setClampV] = useState(3)
  const [openTh, setOpenTh] = useState(-1.5)
  const [shortTh, setShortTh] = useState(-0.2)
  const [others, setOthers] = useState<Bias>(BIASES[0].id)
  const [vddBias, setVddBias] = useState<Bias>(BIASES[0].id)
  const [runs, setRuns] = useState<Run[]>([])
  const [sel, setSel] = useState<{ n: number; pin: PinId } | null>(null)
  const [ansKind, setAnsKind] = useState<DefectKind>(DEFECTS[0].id)
  const [ansA, setAnsA] = useState<PinId>(SIG_PINS[0])
  const [ansB, setAnsB] = useState<PinId>(SIG_PINS[1])
  const [feedback, setFeedback] = useState<{ ok: boolean; puzzle: number } | null>(null)
  const counter = useRef(0)

  const forceUa = (pol === 'neg' ? -1 : 1) * FORCE_STEPS[forceIdx]
  const injected: Defect = { kind, a: pinA, b: pinB, rc: RC_STEPS[rcIdx] }
  const activeDefect = mode === 'inject' ? injected : PUZZLES[puzzle].defect
  const cfg: OsConfig = { forceUa, clampV, openTh, shortTh, others, vdd: vddBias }
  const orderedPins = SIG_PINS.filter((p) => pins.includes(p))

  const togglePin = (pin: PinId) =>
    setPins((prev) => (prev.includes(pin) ? prev.filter((p) => p !== pin) : [...prev, pin]))

  const run = () => {
    if (orderedPins.length === 0) return
    const result = runOs(activeDefect, cfg, orderedPins)
    const entry: Run = {
      n: ++counter.current,
      cfg,
      mode,
      puzzle,
      defect: activeDefect,
      result,
      warnings: osWarnings(cfg, result),
    }
    setRuns((prev) => [entry, ...prev].slice(0, MAX_RUNS))
    const row = result.rows[0]
    setSel({ n: entry.n, pin: row.pin })
    onNote(noteForRow(entry, row))
  }

  const current = runs.find((r) => r.n === sel?.n) ?? runs[0]
  const currentRow = current?.result.rows.find((r) => r.pin === sel?.pin) ?? current?.result.rows[0]
  const latest = runs[0]
  const verdicts: Partial<Record<PinId, OsVerdict>> = {}
  if (latest && latest.mode === mode && (mode === 'inject' || latest.puzzle === puzzle)) {
    for (const r of latest.result.rows) verdicts[r.pin] = r.verdict
  }

  const pickRow = (r: Run, row: OsRow) => {
    setSel({ n: r.n, pin: row.pin })
    onNote(noteForRow(r, row))
  }

  const setA = (id: PinId) => {
    setPinA(id)
    if (id === pinB) setPinB(SIG_PINS.find((p) => p !== id)!)
  }
  const setAnsPinA = (id: PinId) => {
    setAnsA(id)
    if (id === ansB) setAnsB(SIG_PINS.find((p) => p !== id)!)
  }

  const mirror = () => {
    const s = pol === 'neg' ? -1 : 1
    setOpenTh(1.5 * s)
    setShortTh(0.2 * s)
  }

  const submit = () => {
    const answer: Defect = { kind: ansKind, a: ansA, b: ansB, rc: 0 }
    setFeedback({ ok: sameDefect(answer, PUZZLES[puzzle].defect), puzzle })
  }

  const numInput = (value: number, set: (v: number) => void, label: LText) => (
    <input
      type="number"
      className="vnum"
      aria-label={t(label)}
      min={-3}
      max={3}
      step={0.05}
      value={value}
      onChange={(e) => {
        const v = Number(e.target.value)
        if (e.target.value !== '' && Number.isFinite(v)) set(Math.max(-3, Math.min(3, v)))
      }}
    />
  )

  const needsB = (k: DefectKind) => k === 'pinPin'
  const needsA = (k: DefectKind) => k !== 'none'

  return (
    <div className="vlab">
      <Pane title={S.config} className="vpane--config">
        <Field label={S.mode}>
          <Seg
            options={OS_MODES}
            value={mode}
            onChange={(m) => {
              setMode(m)
              setFeedback(null)
            }}
          />
        </Field>

        {mode === 'inject' ? (
          <div className="vgrid">
            <Field label={S.defect}>
              <select className="vselect" aria-label={t(S.defect)} value={kind} onChange={(e) => setKind(e.target.value as DefectKind)}>
                {DEFECTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {t(d.label)}
                  </option>
                ))}
              </select>
            </Field>
            {needsA(kind) ? (
              <Field label={S.pinA}>
                <select className="vselect" aria-label={t(S.pinA)} value={pinA} onChange={(e) => setA(e.target.value as PinId)}>
                  {SIG_PINS.map((p) => (
                    <option key={p} value={p}>
                      {pinOption(p)}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}
            {needsB(kind) ? (
              <Field label={S.pinB}>
                <select className="vselect" aria-label={t(S.pinB)} value={pinB} onChange={(e) => setPinB(e.target.value as PinId)}>
                  {SIG_PINS.filter((p) => p !== pinA).map((p) => (
                    <option key={p} value={p}>
                      {pinOption(p)}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}
            {kind === 'contact' ? (
              <Field label={S.rc} value={fmtOhm(RC_STEPS[rcIdx])}>
                <Slider label={t(S.rc)} value={rcIdx} min={0} max={RC_STEPS.length - 1} step={1} onChange={setRcIdx} />
              </Field>
            ) : null}
          </div>
        ) : (
          <div className="vquiz-head">
            <span>
              {t(S.quizPick)} <b>#{puzzle + 1}</b> / {PUZZLES.length}
            </span>
            <button
              type="button"
              className="lab__btn"
              onClick={() => {
                setPuzzle((p) => (p + 1) % PUZZLES.length)
                setFeedback(null)
              }}
            >
              {t(S.quizNext)}
            </button>
            <span className="vfield__hint">{t(S.quizHidden)}</span>
          </div>
        )}

        <Field label={S.pins} hint={S.pinsHint}>
          <ChipFig selected={pins} onToggle={togglePin} verdicts={verdicts} defect={mode === 'inject' ? injected : undefined} />
          <div className="vpins">
            {SIG_PINS.map((p) => (
              <button
                key={p}
                type="button"
                className={`vpins__btn${pins.includes(p) ? ' is-active' : ''}`}
                aria-pressed={pins.includes(p)}
                onClick={() => togglePin(p)}
              >
                {pinOption(p)}
              </button>
            ))}
            <button type="button" className="lab__btn" onClick={() => setPins([...SIG_PINS])}>
              {t(S.selectAll)}
            </button>
          </div>
        </Field>

        <div className="vgrid">
          <Field label={S.polarity}>
            <Seg options={POLS} value={pol} onChange={setPol} />
          </Field>
          <Field label={S.force} value={fmtForce(forceUa)}>
            <Slider label={t(S.force)} value={forceIdx} min={0} max={FORCE_STEPS.length - 1} step={1} onChange={setForceIdx} />
          </Field>
          <Field label={S.vclamp} value={`±${clampV.toFixed(1)} V`}>
            <Slider label={t(S.vclamp)} value={clampV} min={0.2} max={5} step={0.1} onChange={setClampV} />
          </Field>
          <Field label={S.colWin} value={osWindow(cfg)}>
            <div className="vth">
              <label>
                <span>{t(S.openTh)}</span>
                {numInput(openTh, setOpenTh, S.openTh)}
              </label>
              <label>
                <span>{t(S.shortTh)}</span>
                {numInput(shortTh, setShortTh, S.shortTh)}
              </label>
            </div>
            <button type="button" className="linkish" onClick={mirror}>
              {t(S.mirror)}
            </button>
          </Field>
          <Field label={S.others}>
            <Seg options={BIASES} value={others} onChange={setOthers} />
          </Field>
          <Field label={S.vddPin}>
            <Seg options={BIASES} value={vddBias} onChange={setVddBias} />
          </Field>
        </div>
        <p className="vfield__hint">{t(S.osModelNote)}</p>
        <div className="vrun">
          <button type="button" className="lab__btn lab__btn--primary vrun__go" disabled={orderedPins.length === 0} onClick={run}>
            ▶ {t(S.run)}
          </button>
          {orderedPins.length === 0 ? <span className="vwarn">{t(S.noPins)}</span> : null}
          <span className="vrun__hint">{t(S.disclaimer)}</span>
        </div>
      </Pane>

      <Pane title={S.result} className="vpane--result">
        {current && currentRow ? (
          <OsResultView run={current} row={currentRow} showTruth={current.mode === 'inject'} />
        ) : (
          <p className="vempty">{t(S.noRun)}</p>
        )}
      </Pane>

      {mode === 'quiz' ? (
        <Pane title={S.quizAsk} className="vpane--quiz">
          <div className="vgrid">
            <Field label={S.quizType}>
              <select className="vselect" aria-label={t(S.quizType)} value={ansKind} onChange={(e) => setAnsKind(e.target.value as DefectKind)}>
                {DEFECTS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {t(d.label)}
                  </option>
                ))}
              </select>
            </Field>
            {needsA(ansKind) ? (
              <Field label={S.pinA}>
                <select className="vselect" aria-label={t(S.pinA)} value={ansA} onChange={(e) => setAnsPinA(e.target.value as PinId)}>
                  {SIG_PINS.map((p) => (
                    <option key={p} value={p}>
                      {pinOption(p)}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}
            {needsB(ansKind) ? (
              <Field label={S.pinB}>
                <select className="vselect" aria-label={t(S.pinB)} value={ansB} onChange={(e) => setAnsB(e.target.value as PinId)}>
                  {SIG_PINS.filter((p) => p !== ansA).map((p) => (
                    <option key={p} value={p}>
                      {pinOption(p)}
                    </option>
                  ))}
                </select>
              </Field>
            ) : null}
          </div>
          <div className="vrun">
            <button type="button" className="lab__btn lab__btn--primary" onClick={submit}>
              {t(S.quizSubmit)}
            </button>
          </div>
          {feedback && feedback.puzzle === puzzle ? (
            <p className={`quiz__explain${feedback.ok ? ' is-ok' : ' is-bad'}`}>
              <Badge tone={feedback.ok ? 'pass' : 'fail'} label={feedback.ok ? S.quizRight : S.quizWrong} /> {t(PUZZLES[puzzle].explain)}
            </p>
          ) : null}
        </Pane>
      ) : null}

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
                <th>{t(S.colPin)}</th>
                <th>{t(S.colCond)}</th>
                <th>{t(S.colVm)}</th>
                <th>{t(S.colWin)}</th>
                <th>{t(S.colVerdict)}</th>
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
                runs.flatMap((r) =>
                  r.result.rows.map((row) => {
                    const active = current?.n === r.n && currentRow?.pin === row.pin
                    const src = r.mode === 'quiz' ? loc(`练习 #${r.puzzle + 1}`, `drill #${r.puzzle + 1}`) : loc('注入', 'inject')
                    return (
                      <tr
                        key={`${r.n}-${row.pin}`}
                        className={`is-click${active ? ' is-active' : ''}`}
                        onClick={() => pickRow(r, row)}
                        tabIndex={0}
                        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), pickRow(r, row))}
                        aria-selected={active}
                      >
                        <td className="mono-cell">{String(r.n).padStart(3, '0')}</td>
                        <td className="mono-cell">{pinOption(row.pin)}</td>
                        <td className="vlog__cond">
                          <span>{`${fmtForce(r.cfg.forceUa)} · ±${r.cfg.clampV.toFixed(1)} V`}</span>
                          <span>{`${t(biasText(r.cfg))} · ${t(src)}`}</span>
                        </td>
                        <td className="mono-cell">
                          {row.verdict === 'abort' ? '—' : fmtV(row.vm)}
                          {row.clamped ? ` (${t(S.clampedTag)})` : ''}
                        </td>
                        <td className="mono-cell">{osWindow(r.cfg)}</td>
                        <td>
                          <Badge tone={TONE[row.verdict]} label={VERDICT_LABEL[row.verdict]} />
                        </td>
                      </tr>
                    )
                  }),
                )
              )}
            </tbody>
          </table>
        </div>
      </Pane>
    </div>
  )
}

function OsResultView({ run, row, showTruth }: { run: Run; row: OsRow; showTruth: boolean }) {
  const { t } = useLocale()
  const counts = new Map<OsVerdict, number>()
  for (const r of run.result.rows) counts.set(r.verdict, (counts.get(r.verdict) ?? 0) + 1)
  const why = osRowWhy(run.cfg, run.result, row)
  return (
    <div className="vres">
      <div className="vres__head">
        <span className="vres__no">#{String(run.n).padStart(3, '0')}</span>
        <span className="vres__sum">
          {t(S.summary)}:{' '}
          {[...counts].map(([v, n]) => (
            <span key={v} className="vres__count">
              <Badge tone={TONE[v]} label={VERDICT_LABEL[v]} /> ×{n}
            </span>
          ))}
        </span>
      </div>
      {run.warnings.length ? (
        <ul className="vres__warn">
          {run.warnings.map((w, i) => (
            <li key={i}>⚠ {t(w)}</li>
          ))}
        </ul>
      ) : null}
      <div className="readout">
        <div className="readout__item">
          <b>{t(S.colPin)}</b>
          <span>{pinOption(row.pin)}</span>
        </div>
        <div className="readout__item">
          <b>{t(S.colForce)}</b>
          <span>{fmtForce(run.cfg.forceUa)}</span>
        </div>
        <div className={`readout__item${row.verdict === 'pass' ? ' is-pass' : row.verdict === 'abort' ? '' : ' is-fail'}`}>
          <b>{t(S.colVm)}</b>
          <span>{row.verdict === 'abort' ? '—' : fmtV(row.vm)}</span>
        </div>
        <div className="readout__item">
          <b>{t(S.colWin)}</b>
          <span>{osWindow(run.cfg)}</span>
        </div>
      </div>
      <p className="vres__headline">
        <Badge tone={TONE[row.verdict]} label={VERDICT_LABEL[row.verdict]} />
      </p>
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
      {showTruth ? (
        <p className="vres__model">
          <b>{t(S.truth)}</b>
          {t(defectTruth(run.defect, row.pin))}
        </p>
      ) : null}
    </div>
  )
}
