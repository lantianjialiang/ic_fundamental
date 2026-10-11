import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { QUIZ } from './data/content'
import { BANK, OPS, STUCKS, alu, bin4, runBank, type StuckId } from './data/pattern'
import { judgeLeak, judgeTiming, settleAt, type TimingReason } from './data/engine'

type Module17PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
}

type Tab = 'timing' | 'leak' | 'pattern'
type Focus = { kind: 'timing' } | { kind: 'leak' } | { kind: 'pattern' } | { kind: 'quiz' }

const REASON: Record<TimingReason, LText> = {
  pass: loc('Strobe 落在输出稳定之后、本周期结束之前，比较到的是新值。', 'The strobe falls after the output settles and before the cycle ends, so it compares the new value.'),
  early: loc('Strobe 早于 Drive + tpd：DUT 输出还没变完，比较到的是上一拍的旧值。', 'The strobe is before Drive + tpd: the DUT output has not settled, so it compares the previous value.'),
  late: loc('Strobe 落到了周期之外。Strobe 必须在本周期内。', 'The strobe lies outside the cycle. It must stay within the cycle.'),
  'before-drive': loc('Strobe 比 Drive 还早：本拍输入都还没给，更谈不上新输出。', 'The strobe is even before Drive: this cycle\'s inputs have not been applied yet.'),
  slow: loc('Drive + tpd ≥ Period：这一拍里 DUT 来不及稳定，Strobe 放哪都不对。降频或换更快的芯片。', 'Drive + tpd ≥ Period: the DUT cannot settle within the cycle, so no strobe position works. Lower the frequency or use a faster chip.'),
}

const S = {
  delay: loc('DUT tpd', 'DUT tpd'),
  cycle: loc('周期', 'Cycle'),
  data: loc('输入（Drive）', 'Input (drive)'),
  out: loc('DUT 输出', 'DUT output'),
  window: loc('有效窗口', 'valid window'),
  waveCap: loc(
    '输入每拍在 Drive 时刻翻转；DUT 输出晚 tpd 跟着翻转。绿色是可以放 Strobe 的窗口，圆点是每拍的比较时刻。',
    'The input toggles at Drive each cycle; the DUT output follows tpd later. Green: where the strobe may go. Dots: the compare point in each cycle.',
  ),
  measure: loc('测量', 'Measure'),
  result: loc('结果', 'Result'),
  exp: loc('期望', 'Exp'),
  got: loc('实际', 'Got'),
}

const TABS: Array<{ id: Tab; label: LText }> = [
  { id: 'timing', label: ui.m17.tabTime },
  { id: 'leak', label: ui.m17.tabLeak },
  { id: 'pattern', label: ui.m17.tabPat },
]

export function Module17Page({ moduleId, onModuleChange }: Module17PageProps) {
  const { t } = useLocale()
  const [tab, setTab] = useState<Tab>(TABS[0].id)
  const [focus, setFocus] = useState<Focus>({ kind: TABS[0].id })
  const [period, setPeriod] = useState(10)
  const [drive, setDrive] = useState(2)
  const [delay, setDelay] = useState(4)
  const [strobe, setStrobe] = useState(8)
  const [forceV, setForceV] = useState(3.3)
  const [limitUa, setLimitUa] = useState(10)
  const [stuck, setStuck] = useState<StuckId>(STUCKS[0].id)
  const [patVecs, setPatVecs] = useState<string[]>(BANK.map((row) => row.id))

  const timing = useMemo(() => judgeTiming({ period, drive, delay, strobe }), [period, drive, delay, strobe])
  const settle = settleAt(drive, delay)
  const leak = useMemo(() => judgeLeak(forceV, limitUa), [forceV, limitUa])
  const patRows = useMemo(() => runBank(patVecs, stuck), [patVecs, stuck])
  const patFails = patRows.filter((row) => !row.pass).length
  const stuckHint = STUCKS.find((item) => item.id === stuck)
  const failLine = loc(`${patRows.length} 条里 ${patFails} 条 Fail。`, `${patFails} of ${patRows.length} rows fail.`)

  const detail =
    focus.kind === 'quiz'
      ? { kicker: t(ui.m17.kickerQuiz), title: t(ui.m17.quizTitle), text: t(ui.m17.quizNote) }
      : tab === 'pattern'
        ? {
            kicker: t(ui.m17.kickerPat),
            title: stuckHint ? t(stuckHint.title) : t(ui.m17.tabPat),
            text: stuck === 'none' ? t(failLine) : `${t(failLine)} ${t(ui.m17.patAside)}`,
          }
        : tab === 'leak'
          ? {
              kicker: t(ui.m17.kickerLeak),
              title: leak.pass ? 'PASS' : 'FAIL',
              text: t(
                leak.pass
                  ? loc(
                      `Force ${forceV.toFixed(1)} V → 测到 ${leak.meas.toFixed(2)} μA ≤ Limit ${limitUa.toFixed(1)} μA。`,
                      `Force ${forceV.toFixed(1)} V → measured ${leak.meas.toFixed(2)} μA ≤ limit ${limitUa.toFixed(1)} μA.`,
                    )
                  : loc(
                      `Force ${forceV.toFixed(1)} V → 测到 ${leak.meas.toFixed(2)} μA > Limit ${limitUa.toFixed(1)} μA。芯片没变，是规格更紧了。`,
                      `Force ${forceV.toFixed(1)} V → measured ${leak.meas.toFixed(2)} μA > limit ${limitUa.toFixed(1)} μA. The chip is the same; the limit is tighter.`,
                    ),
              ),
            }
          : {
              kicker: t(ui.m17.kickerTime),
              title: timing.pass ? 'PASS' : 'FAIL',
              text: t(REASON[timing.reason]),
            }

  const preset = (s: number) => {
    setPeriod(10)
    setDrive(2)
    setDelay(4)
    setStrobe(s)
    setFocus({ kind: 'timing' })
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
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={tab === item.id}
            className={`sim-tabs__btn${tab === item.id ? ' is-active' : ''}`}
            onClick={() => {
              setTab(item.id)
              setFocus({ kind: item.id })
            }}
          >
            {t(item.label)}
          </button>
        ))}
      </div>

      {tab === 'timing' ? (
        <Section title={t(ui.m17.timeTitle)} note={t(ui.m17.timeNote)}>
          <div className="sim-presets">
            <button type="button" className="lab__btn" onClick={() => preset(3)}>
              {t(ui.m17.presetEarly)}
            </button>
            <button type="button" className="lab__btn" onClick={() => preset(7)}>
              {t(ui.m17.presetOk)}
            </button>
            <button type="button" className="lab__btn" onClick={() => preset(10)}>
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
              label={`${t(S.delay)}  ${delay.toFixed(1)} ns`}
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
          <TimingCanvas period={period} drive={drive} strobe={strobe} settle={settle} pass={timing.pass} />
          <p className={`sim-verdict${timing.pass ? ' is-ok' : ' is-bad'}`}>
            {timing.pass ? '✓ PASS' : '✗ FAIL'} · {t(REASON[timing.reason])}
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
            <FlowBox title={t(S.measure)} value={`${leak.meas.toFixed(2)} μA`} />
            <span>→</span>
            <FlowBox title="Limit" value={`≤ ${limitUa.toFixed(1)} μA`} />
            <span>→</span>
            <FlowBox title={t(S.result)} value={leak.pass ? 'PASS' : 'FAIL'} ok={leak.pass} />
          </div>
          <LeakMeter meas={leak.meas} limit={limitUa} />
          <p className={`sim-verdict${leak.pass ? ' is-ok' : ' is-bad'}`}>
            {leak.pass ? '✓ PASS' : '✗ FAIL'} · {t(ui.m17.leakHint)}
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
          <p className="pat-legend">{t(ui.m17.patPick)}</p>
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
                    setPatVecs((prev) => (prev.includes(row.id) ? prev.filter((id) => id !== row.id) : [...prev, row.id]))
                  }
                >
                  {`${OPS[row.op].name} A=${bin4(row.a)} B=${bin4(row.b)} → Y ${bin4(exp.y)} C ${exp.carry}`}
                </button>
              )
            })}
          </div>
          <p className="pat-legend">{t(ui.m17.patBits)}</p>
          <div className="vec">
            {patRows.map((item) => (
              <p key={item.row.id} className={item.pass ? 'is-ok' : 'is-bad'}>
                {item.label} · {t(S.exp)} <Bits value={item.exp.y} /> C={item.exp.carry} · {t(S.got)}{' '}
                <Bits value={item.got.y} compare={item.exp.y} /> C=
                <i className={item.got.carry === item.exp.carry ? '' : 'pat-bit is-bad'}>{item.got.carry}</i> ·{' '}
                {item.pass ? 'PASS' : 'FAIL'}
              </p>
            ))}
          </div>
          <p className={`sim-verdict${patFails === 0 ? ' is-ok' : ' is-bad'}`}>
            {patFails === 0 ? '✓' : '✗'} {t(failLine)}
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

/** 横轴固定 0–40 ns：Period 变大，每一拍就变宽 */
const TIME_SPAN = 40

/** 从 low 开始，每个边沿翻转一次的数字波形 */
function togglePath(xAt: (ns: number) => number, edges: number[], hi: number, lo: number) {
  let level = false
  let d = `M ${xAt(0)} ${lo}`
  for (const e of edges) {
    if (e >= TIME_SPAN) break
    level = !level
    d += ` H ${xAt(e)} V ${level ? hi : lo}`
  }
  return `${d} H ${xAt(TIME_SPAN)}`
}

function TimingCanvas({
  period,
  drive,
  strobe,
  settle,
  pass,
}: {
  period: number
  drive: number
  strobe: number
  settle: number
  pass: boolean
}) {
  const { t } = useLocale()
  const X0 = 110
  const X1 = 700
  const xAt = (ns: number) => X0 + (Math.min(Math.max(ns, 0), TIME_SPAN) / TIME_SPAN) * (X1 - X0)
  const cycles = Array.from({ length: Math.ceil(TIME_SPAN / period) }, (_, k) => k)
  const dat = 100
  const out = 176
  const h = 16
  const sc = pass ? 'var(--green)' : 'var(--red)'
  const dataEdges = cycles.map((k) => k * period + drive)
  const outEdges = cycles.map((k) => k * period + settle)

  return (
    <figure className="term-fig">
      <svg viewBox="0 0 720 280" className="sim-wave" role="img" aria-label={t(S.waveCap)}>
        <rect width="720" height="280" rx="10" fill="var(--well)" />
        {/* 有效窗口 */}
        {settle < period
          ? cycles.map((k) => (
              <rect
                key={`w${k}`}
                x={xAt(k * period + settle)}
                y={out - h - 6}
                width={Math.max(xAt((k + 1) * period) - xAt(k * period + settle), 0)}
                height={2 * h + 12}
                fill="var(--green-bg)"
              />
            ))
          : null}
        {/* 周期边界 */}
        {cycles.map((k) => (
          <g key={`c${k}`}>
            <line x1={xAt(k * period)} y1="26" x2={xAt(k * period)} y2="222" stroke="var(--line-2)" strokeDasharray="4 4" />
            {xAt(k * period) + 6 < X1 ? (
              <text x={xAt(k * period) + 4} y="40" fill="var(--muted)" fontSize="11">
                {`#${k + 1}`}
              </text>
            ) : null}
          </g>
        ))}
        <text x="12" y="40" fill="var(--muted)" fontSize="11">
          {t(S.cycle)}
        </text>
        <text x="12" y={dat + 4} fill="var(--sky)" fontSize="11">
          {t(S.data)}
        </text>
        <text x="12" y={out + 4} fill="var(--green)" fontSize="11">
          {t(S.out)}
        </text>
        <path d={togglePath(xAt, dataEdges, dat - h, dat + h)} fill="none" stroke="var(--sky)" strokeWidth="2" />
        <path d={togglePath(xAt, outEdges, out - h, out + h)} fill="none" stroke="var(--green)" strokeWidth="2" />
        {/* 第 1 拍标注 */}
        <line x1={xAt(drive)} y1="50" x2={xAt(drive)} y2={out + h} stroke="var(--sky)" strokeDasharray="3 3" />
        <text x={xAt(drive) + 4} y="62" fill="var(--sky)" fontSize="11">
          Drive
        </text>
        {settle < TIME_SPAN ? (
          <>
            <line x1={xAt(drive)} y1={out + h + 14} x2={xAt(settle)} y2={out + h + 14} stroke="var(--muted)" />
            <text x={(xAt(drive) + xAt(settle)) / 2} y={out + h + 28} textAnchor="middle" fill="var(--muted)" fontSize="11">
              tpd
            </text>
          </>
        ) : null}
        {/* 每拍的 Strobe */}
        {cycles.map((k) => {
          const at = k * period + strobe
          if (at >= TIME_SPAN) return null
          return (
            <g key={`s${k}`}>
              <line x1={xAt(at)} y1={dat - h - 6} x2={xAt(at)} y2={out + h + 4} stroke={sc} strokeWidth={k === 0 ? 2 : 1.2} />
              <circle cx={xAt(at)} cy={out} r="4.5" fill={sc} />
            </g>
          )
        })}
        <text x={xAt(strobe) + 4} y="78" fill={sc} fontSize="11">
          Strobe
        </text>
        {settle < period ? (
          <text x={(xAt(settle) + xAt(period)) / 2} y={out - h - 10} textAnchor="middle" fill="var(--green)" fontSize="10">
            {t(S.window)}
          </text>
        ) : null}
        {/* 时间轴 */}
        {[0, 10, 20, 30, 40].map((ns) => (
          <text key={ns} x={xAt(ns)} y="266" textAnchor="middle" fill="var(--dim)" fontSize="11">
            {`${ns} ns`}
          </text>
        ))}
      </svg>
      <figcaption>{t(S.waveCap)}</figcaption>
    </figure>
  )
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
