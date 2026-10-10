import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { QUIZ } from './data/content'
import { BANK, OPS, STUCKS, alu, bin4, runBank, type StuckId } from './data/pattern'
import {
  judgeLeak,
  judgeTiming,
  leakCurrentUa,
  settleAt,
  type TimingReason,
} from './data/engine'

type Module17PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

type Tab = 'timing' | 'leak' | 'pattern'
type Focus = { kind: 'timing' } | { kind: 'leak' } | { kind: 'pattern' } | { kind: 'quiz' }

const REASON: Record<TimingReason, LText> = {
  pass: loc('Strobe 落在输出已经翻转之后、下一拍之前。Compare 采到的是新值。'),
  early: loc('Tester 在 DUT 输出稳定之前进行了 Compare。采到的是旧值。'),
  late: loc('Strobe 已经走到下一拍。可能采到下一周期的数据。'),
  'before-drive': loc('输入还没被 Drive，输出谈不上新值。Strobe 太靠前。'),
  slow: loc('Drive + Delay 已经大于等于 Period。这一拍里 DUT 来不及稳定。'),
}

export function Module17Page({ moduleId, onModuleChange }: Module17PageProps) {
  const { t } = useLocale()
  const [tab, setTab] = useState<Tab>('timing')
  const [focus, setFocus] = useState<Focus>({ kind: 'timing' })
  const [period, setPeriod] = useState(10)
  const [drive, setDrive] = useState(2)
  const [delay, setDelay] = useState(4)
  const [strobe, setStrobe] = useState(8)
  const [forceV, setForceV] = useState(3.3)
  const [limitUa, setLimitUa] = useState(10)
  const [stuck, setStuck] = useState<StuckId>('none')
  const [patVecs, setPatVecs] = useState<string[]>(BANK.map((row) => row.id))

  const timing = useMemo(
    () => judgeTiming({ period, drive, delay, strobe }),
    [period, drive, delay, strobe],
  )
  const settle = settleAt(drive, delay)
  const leak = useMemo(() => judgeLeak(forceV, limitUa), [forceV, limitUa])
  const patRows = useMemo(() => runBank(patVecs, stuck), [patVecs, stuck])
  const patFails = patRows.filter((row) => !row.pass).length
  const stuckHint = STUCKS.find((item) => item.id === stuck)

  const detail =
    focus.kind === 'quiz'
      ? { kicker: t(ui.m17.kickerQuiz), title: t(ui.m17.quizTitle), text: t(ui.m17.quizNote) }
      : tab === 'pattern'
        ? {
            kicker: t(ui.m17.kickerPat),
            title: stuckHint ? t(stuckHint.title) : t(ui.m17.tabPat),
            text: t(
              stuck === 'none'
                ? loc(`无故障。${patRows.length} 条里失败 ${patFails}。`)
                : loc(`${patRows.length} 条里失败 ${patFails}。对照红行，就是这种 stuck 能被测到的地方。`),
            ),
          }
      : tab === 'leak'
        ? {
            kicker: t(ui.m17.kickerLeak),
            title: leak.pass ? t(ui.m17.pass) : t(ui.m17.fail),
            text: t(
              leak.pass
                ? loc(`Force ${forceV.toFixed(1)} V → 测到 ${leak.meas.toFixed(2)} μA ≤ Limit ${limitUa.toFixed(1)} μA。`)
                : loc(`Force ${forceV.toFixed(1)} V → 测到 ${leak.meas.toFixed(2)} μA，超过 Limit ${limitUa.toFixed(1)} μA。芯片未必坏了，是规格更紧。`),
            ),
          }
        : {
            kicker: t(ui.m17.kickerTime),
            title: timing.pass ? t(ui.m17.pass) : t(ui.m17.fail),
            text: t(REASON[timing.reason]),
          }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m17.title)}
      goal={t(ui.m17.goal)}
      kicker={detail.kicker}
      asideTitle={detail.title}
      asideText={detail.text}
      asideLater={t(ui.m17.asideLater)}
    >
      <Section title={t(ui.m17.introTitle)}>
        <p>{t(ui.m17.introBody)}</p>
      </Section>

      <div className="sim-tabs" role="tablist">
        <button
          type="button"
          className={`sim-tabs__btn${tab === 'timing' ? ' is-active' : ''}`}
          onClick={() => {
            setTab('timing')
            setFocus({ kind: 'timing' })
          }}
        >
          {t(ui.m17.tabTime)}
        </button>
        <button
          type="button"
          className={`sim-tabs__btn${tab === 'leak' ? ' is-active' : ''}`}
          onClick={() => {
            setTab('leak')
            setFocus({ kind: 'leak' })
          }}
        >
          {t(ui.m17.tabLeak)}
        </button>
        <button
          type="button"
          className={`sim-tabs__btn${tab === 'pattern' ? ' is-active' : ''}`}
          onClick={() => {
            setTab('pattern')
            setFocus({ kind: 'pattern' })
          }}
        >
          {t(ui.m17.tabPat)}
        </button>
      </div>

      {tab === 'timing' ? (
        <Section title={t(ui.m17.timeTitle)} note={t(ui.m17.timeNote)}>
          <div className="sim-presets">
            <button
              type="button"
              className="lab__btn"
              onClick={() => applyPreset(10, 2, 4, 3, setPeriod, setDrive, setDelay, setStrobe)}
            >
              {t(ui.m17.presetEarly)}
            </button>
            <button
              type="button"
              className="lab__btn"
              onClick={() => applyPreset(10, 2, 4, 7, setPeriod, setDrive, setDelay, setStrobe)}
            >
              {t(ui.m17.presetOk)}
            </button>
            <button
              type="button"
              className="lab__btn"
              onClick={() => applyPreset(10, 2, 4, 10, setPeriod, setDrive, setDelay, setStrobe)}
            >
              {t(ui.m17.presetLate)}
            </button>
          </div>
          <div className="sim-grid">
            <Knob
              label={`Period  ${period.toFixed(1)} ns`}
              min={6}
              max={20}
              step={0.5}
              value={period}
              onChange={(v) => {
                setPeriod(v)
                setDrive((d) => Math.min(d, v - 0.5))
                setStrobe((s) => Math.min(s, v))
                setFocus({ kind: 'timing' })
              }}
            />
            <Knob
              label={`Drive  ${drive.toFixed(1)} ns`}
              min={0}
              max={Math.max(period - 0.5, 0.5)}
              step={0.1}
              value={drive}
              onChange={(v) => {
                setDrive(v)
                setFocus({ kind: 'timing' })
              }}
            />
            <Knob
              label={`DUT Delay  ${delay.toFixed(1)} ns`}
              min={0.5}
              max={12}
              step={0.1}
              value={delay}
              onChange={(v) => {
                setDelay(v)
                setFocus({ kind: 'timing' })
              }}
            />
            <Knob
              label={`Strobe  ${strobe.toFixed(1)} ns`}
              min={0}
              max={period}
              step={0.1}
              value={strobe}
              onChange={(v) => {
                setStrobe(v)
                setFocus({ kind: 'timing' })
              }}
            />
          </div>
          <TimingCanvas period={period} drive={drive} strobe={strobe} settle={settle} />
          <p className="sim-axis-note">{t(ui.m17.driveHint)}</p>
          <p className={`sim-verdict${timing.pass ? ' is-ok' : ' is-bad'}`}>
            {timing.pass ? '✓ PASS' : '❌ FAIL'} · {t(REASON[timing.reason])}
          </p>
        </Section>
      ) : tab === 'leak' ? (
        <Section title={t(ui.m17.leakTitle)} note={t(ui.m17.leakNote)}>
          <div className="sim-grid">
            <Knob
              label={`${t(ui.m17.force)}  ${forceV.toFixed(1)} V`}
              min={0.5}
              max={5}
              step={0.1}
              value={forceV}
              onChange={(v) => {
                setForceV(v)
                setFocus({ kind: 'leak' })
              }}
            />
            <Knob
              label={`${t(ui.m17.limit)}  ${limitUa.toFixed(1)} μA`}
              min={1}
              max={20}
              step={0.1}
              value={limitUa}
              onChange={(v) => {
                setLimitUa(v)
                setFocus({ kind: 'leak' })
              }}
            />
          </div>
          <div className="sim-flow">
            <FlowBox title="Force" value={`${forceV.toFixed(1)} V`} />
            <span>→</span>
            <FlowBox title="Measure" value={`${leak.meas.toFixed(2)} μA`} />
            <span>→</span>
            <FlowBox title="Limit" value={`${limitUa.toFixed(1)} μA`} />
            <span>→</span>
            <FlowBox title="Result" value={leak.pass ? 'PASS' : 'FAIL'} ok={leak.pass} />
          </div>
          <LeakMeter meas={leak.meas} limit={limitUa} />
          <p className={`sim-verdict${leak.pass ? ' is-ok' : ' is-bad'}`}>
            {leak.pass ? '✓ PASS' : '❌ FAIL'} · {t(ui.m17.leakHint)} · {t({ zh: `此时 DUT 漏电 ${leakCurrentUa(forceV).toFixed(2)} μA` })}
          </p>
        </Section>
      ) : (
        <Section title={t(ui.m17.patTitle)} note={t(ui.m17.patNote)}>
          <div className="pick pick--3">
            {STUCKS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`pick__card${stuck === item.id ? ' is-active' : ''}`}
                onClick={() => {
                  setStuck(item.id)
                  setFocus({ kind: 'pattern' })
                }}
              >
                {t(item.title)}
              </button>
            ))}
          </div>
          {stuckHint ? <p className="sim-axis-note">{t(stuckHint.hint)}</p> : null}
          <p className="pat-legend">{t(ui.m17.patBits)}</p>
          <div className="vec">
            {BANK.map((row) => {
              const on = patVecs.includes(row.id)
              const exp = alu(row.a, row.b, row.op)
              return (
                <button
                  key={row.id}
                  type="button"
                  className={`vec__row${on ? ' is-active' : ''}`}
                  onClick={() =>
                    setPatVecs((prev) =>
                      prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id],
                    )
                  }
                >
                  {OPS[row.op].name} A={bin4(row.a)} B={bin4(row.b)} → Y {bin4(exp.y)} C {exp.carry}
                </button>
              )
            })}
          </div>
          <div className="vec">
            {patRows.map((item) => (
              <p key={item.row.id} className={item.pass ? 'is-ok' : 'is-bad'}>
                {item.label} · exp <Bits value={item.exp.y} /> C={item.exp.carry} · got{' '}
                <Bits value={item.got.y} compare={item.exp.y} /> C=
                <i className={item.got.carry === item.exp.carry ? '' : 'pat-bit is-bad'}>{item.got.carry}</i> ·{' '}
                {item.pass ? 'PASS' : 'FAIL'}
              </p>
            ))}
          </div>
          <p className={`sim-verdict${patFails === 0 ? ' is-ok' : ' is-bad'}`}>
            {patFails === 0 ? '✓' : '❌'} {patRows.length} {t({ zh: '条里失败' })} {patFails}
          </p>
        </Section>
      )}

      <Section title={t(ui.m17.quizTitle)} note={t(ui.m17.quizNote)}>
        <div onClick={() => setFocus({ kind: 'quiz' })}>
          <QuizList questions={QUIZ} yes={t(ui.m17.yes)} no={t(ui.m17.no)} />
        </div>
      </Section>
    </LessonFrame>
  )
}

function applyPreset(
  period: number,
  drive: number,
  delay: number,
  strobe: number,
  setPeriod: (n: number) => void,
  setDrive: (n: number) => void,
  setDelay: (n: number) => void,
  setStrobe: (n: number) => void,
) {
  setPeriod(period)
  setDrive(drive)
  setDelay(delay)
  setStrobe(strobe)
}

function Bits({ value, compare }: { value: number; compare?: number }) {
  return (
    <span className="pat-bits">
      Y=
      {[3, 2, 1, 0].map((pos) => {
        const bit = (value >> pos) & 1
        const miss = compare !== undefined && bit !== ((compare >> pos) & 1)
        return (
          <i key={pos} className={`pat-bit${miss ? ' is-bad' : ''}`} title={`Y[${pos}]`}>
            {bit}
          </i>
        )
      })}
    </span>
  )
}

function Knob({
  label,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string
  min: number
  max: number
  step: number
  value: number
  onChange: (v: number) => void
}) {
  return (
    <label className="sim-knob">
      <span>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  )
}

function FlowBox({ title, value, ok }: { title: string; value: string; ok?: boolean }) {
  const tone = ok === undefined ? '' : ok ? ' is-ok' : ' is-bad'
  return (
    <div className={`sim-flow__box${tone}`}>
      <b>{title}</b>
      <span>{value}</span>
    </div>
  )
}

/** 横轴固定 0–40 ns，Period 变大则每一拍变宽，学生能看见节拍被拉开 */
const TIME_SPAN = 40

function TimingCanvas({
  period,
  drive,
  strobe,
  settle,
}: {
  period: number
  drive: number
  strobe: number
  settle: number
}) {
  const X0 = 78
  const X1 = 700
  const xAt = (ns: number) => X0 + (Math.min(Math.max(ns, 0), TIME_SPAN) / TIME_SPAN) * (X1 - X0)
  const clk = 44
  const dat = 112
  const out = 180
  const hi = (y: number) => y - 16
  const lo = (y: number) => y + 16
  const dx = xAt(drive)
  const sx = xAt(strobe)
  const px = xAt(period)

  return (
    <svg viewBox="0 0 720 280" className="sim-wave" role="img">
      <rect width="720" height="280" rx="6" fill="var(--well)" />
      {[10, 20, 30].map((ns) => (
        <g key={ns}>
          <line x1={xAt(ns)} y1="14" x2={xAt(ns)} y2="228" stroke="var(--fig-box-2)" />
          <text x={xAt(ns)} y="268" textAnchor="middle" fill="var(--dim)" fontSize="11">
            {ns} ns
          </text>
        </g>
      ))}
      <text x={X0} y="268" fill="var(--dim)" fontSize="11">
        0
      </text>
      <text x={X1} y="268" textAnchor="end" fill="var(--dim)" fontSize="11">
        40 ns
      </text>
      <line x1={px} y1="14" x2={px} y2="228" stroke="var(--muted)" strokeDasharray="4 4" />
      <text x={px + 4} y="24" fill="var(--muted)" fontSize="11">
        Period {period.toFixed(1)}
      </text>
      <text x="10" y={clk + 4} fill="var(--muted)" fontSize="11">
        CLK
      </text>
      <text x="10" y={dat + 4} fill="var(--sky)" fontSize="11">
        DATA
      </text>
      <text x="10" y={out + 4} fill="var(--green)" fontSize="11">
        OUT
      </text>
      <path d={clockPath(xAt, period, clk, hi, lo)} fill="none" stroke="var(--blue)" strokeWidth="2" />
      <path d={drivenPath(xAt, period, drive, dat, hi, lo)} fill="none" stroke="var(--sky)" strokeWidth="2" />
      <path d={drivenPath(xAt, period, settle, out, hi, lo)} fill="none" stroke="var(--green)" strokeWidth="2" />
      <line x1={dx} y1="28" x2={dx} y2="220" stroke="var(--sky)" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x={dx + 5} y="42" fill="var(--sky)" fontSize="12">
        Drive
      </text>
      <line x1={sx} y1="28" x2={sx} y2="220" stroke="var(--gold)" strokeWidth="1.8" />
      <text x={sx + 5} y="58" fill="var(--gold)" fontSize="12">
        Strobe
      </text>
    </svg>
  )
}

function clockPath(
  xAt: (ns: number) => number,
  period: number,
  y: number,
  hi: (y: number) => number,
  lo: (y: number) => number,
) {
  let d = `M ${xAt(0)} ${hi(y)}`
  let t = 0
  let high = true
  while (t < TIME_SPAN - 1e-6) {
    const next = Math.min(t + period / 2, TIME_SPAN)
    d += ` H ${xAt(next)}`
    t = next
    if (t >= TIME_SPAN) break
    high = !high
    d += ` V ${high ? hi(y) : lo(y)}`
  }
  return d
}

function drivenPath(
  xAt: (ns: number) => number,
  period: number,
  edge: number,
  y: number,
  hi: (y: number) => number,
  lo: (y: number) => number,
) {
  let d = `M ${xAt(0)} ${hi(y)}`
  let t = 0
  while (t < TIME_SPAN - 1e-6) {
    const fall = t + edge
    const end = t + period
    if (fall < TIME_SPAN) {
      d += ` H ${xAt(Math.min(fall, TIME_SPAN))} V ${lo(y)}`
    }
    if (end >= TIME_SPAN) {
      d += ` H ${xAt(TIME_SPAN)}`
      break
    }
    d += ` H ${xAt(end)} V ${hi(y)}`
    t = end
  }
  return d
}

function LeakMeter({ meas, limit }: { meas: number; limit: number }) {
  const max = Math.max(limit, meas, 1) * 1.2
  return (
    <div className="sim-meter">
      <i className="sim-meter__lim" style={{ width: `${(limit / max) * 100}%` }} />
      <b className="sim-meter__i" style={{ left: `${(meas / max) * 100}%` }} />
    </div>
  )
}
