import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import {
  UNIVERSE_S,
  VECTORS,
  YEAR_S,
  evalAnd,
  secondsOf,
  sup,
  timeParts,
  type Bit,
  type FaultId,
  type SourceId,
} from './data/content'

const L = {
  rowIn: loc('只看输入', 'Inputs only'),
  rowState: loc('加上触发器', 'With flip-flops'),
  explodeCap: loc(
    '每条向量 100 ns（10 MHz）。横轴是对数刻度：每往右一格，时间都乘上千倍。',
    'Each vector takes 100 ns (10 MHz). The axis is logarithmic: each step to the right multiplies the time by about a thousand.',
  ),
  t1us: loc('1 µs', '1 µs'),
  t1ms: loc('1 ms', '1 ms'),
  t1s: loc('1 秒', '1 s'),
  t1h: loc('1 小时', '1 h'),
  t1y: loc('1 年', '1 yr'),
  t1ky: loc('1000 年', '1000 yr'),
  tUni: loc('宇宙年龄', 'Age of universe'),
  sourceCap: loc(
    '三种向量都要交给 ATE 回放，区别在于谁写、依据什么、什么时候生成。',
    'All three end up on the ATE. They differ in who writes them, what they are based on, and when they are generated.',
  ),
  good: loc('好', 'good'),
  bad: loc('坏', 'faulty'),
  caught: loc('抓到', 'caught'),
  missed: loc('抓不到', 'missed'),
  untried: loc('没试', 'not tried'),
  diff: loc('好坏不同 → 抓到', 'Good ≠ faulty → caught'),
  same: loc('好坏一样 → 抓不到', 'Good = faulty → missed'),
  faultCap: loc(
    '线上的「好/坏」是同一组输入下好芯片和坏芯片的值。下面一排记下每条向量试过的结果。',
    'Each wire shows good/faulty: the value in a good part and in the faulty part for the same inputs. The row below records every vector you have tried.',
  ),
  rowA: loc('A（B 保持 1）', 'A (B held at 1)'),
  rowGood: loc('Y 好芯片', 'Y good'),
  rowSlow: loc('Y 慢升', 'Y slow-to-rise'),
  launch: loc('Launch', 'Launch'),
  capture: loc('Capture', 'Capture'),
  thr: loc('门限', 'threshold'),
}

/* ---------------- 穷举会爆炸 ---------------- */

const EX0 = 150
const EX1 = 660
const DEC0 = -7
const DEC1 = 22

const exX = (sec: number) => EX0 + ((Math.log10(sec) - DEC0) / (DEC1 - DEC0)) * (EX1 - EX0)

export function ExplodeFig({ n, s }: { n: number; s: number }) {
  const { t } = useLocale()
  const ticks: Array<[number, LText]> = [
    [1e-6, L.t1us],
    [1e-3, L.t1ms],
    [1, L.t1s],
    [3600, L.t1h],
    [YEAR_S, L.t1y],
    [YEAR_S * 1000, L.t1ky],
    [UNIVERSE_S, L.tUni],
  ]
  const rows = [
    { y: 34, bits: n, name: `${t(L.rowIn)}  2${sup('n')}`, fill: 'var(--blue-bg-2)', stroke: 'var(--blue)' },
    { y: 92, bits: n + s, name: `${t(L.rowState)}  2${sup('n+s')}`, fill: 'var(--gold-bg-2)', stroke: 'var(--gold-line)' },
  ]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 210" className="term-fig__svg" role="img" aria-label={t(L.explodeCap)}>
        <rect width="680" height="210" rx="10" fill="var(--well)" />
        {ticks.map(([sec]) => (
          <line key={sec} x1={exX(sec)} y1="22" x2={exX(sec)} y2="150" stroke="var(--line-soft)" strokeDasharray="3 4" />
        ))}
        {rows.map((row) => {
          const sec = secondsOf(row.bits)
          const end = exX(sec)
          const frac = Math.max(0.01, Math.min(1, (end - EX0) / (EX1 - EX0)))
          const tp = timeParts(sec)
          const inside = end > EX1 - 150
          return (
            <g key={row.y}>
              <text x="14" y={row.y + 21} fill="var(--text-2)" fontSize="12">
                {row.name}
              </text>
              <rect x={EX0} y={row.y} width={EX1 - EX0} height="32" rx="4" fill="var(--fig-box)" />
              <rect
                className="m10-bar"
                x={EX0}
                y={row.y}
                width={EX1 - EX0}
                height="32"
                rx="4"
                fill={row.fill}
                stroke={row.stroke}
                style={{ transform: `scaleX(${frac})` }}
              />
              <text
                x={inside ? EX1 - 8 : end + 8}
                y={row.y + 21}
                textAnchor={inside ? 'end' : 'start'}
                fill={sec > UNIVERSE_S ? 'var(--red)' : 'var(--text)'}
                fontSize="13"
                fontFamily="var(--mono)"
              >
                {`${tp.value} ${t(tp.unit)}`}
              </text>
            </g>
          )
        })}
        <line x1={EX0} y1="150" x2={EX1} y2="150" stroke="var(--line-2)" />
        {ticks.map(([sec, label], i) => (
          <g key={sec}>
            <line x1={exX(sec)} y1="146" x2={exX(sec)} y2="154" stroke="var(--muted)" />
            <text x={exX(sec)} y={i % 2 === 0 ? 172 : 192} textAnchor="middle" fill="var(--muted)" fontSize="11">
              {t(label)}
            </text>
          </g>
        ))}
      </svg>
      <figcaption>{t(L.explodeCap)}</figcaption>
    </figure>
  )
}

/* ---------------- 三种向量来源 ---------------- */

const LANES: Array<{ id: SourceId; name: string; color: string; boxes: Array<[LText, LText]> }> = [
  {
    id: 'func',
    name: 'Functional',
    color: 'var(--green)',
    boxes: [
      [loc('规格书', 'Datasheet'), loc('真值表', 'truth table')],
      [loc('工程师', 'Engineer'), loc('按功能手写', 'writes by hand')],
      [loc('证明功能对', 'Proves function'), loc('不数故障覆盖率', 'no fault coverage')],
    ],
  },
  {
    id: 'algo',
    name: 'Algorithmic',
    color: 'var(--sky)',
    boxes: [
      [loc('规则阵列', 'Regular array'), loc('Memory', '(memory)')],
      [loc('March 算法', 'March algorithm'), loc('w0 · r0w1 · r1w0', 'w0 · r0w1 · r1w0')],
      [loc('ATE 按地址', 'ATE generates'), loc('现场生成每一拍', 'each cycle live')],
    ],
  },
  {
    id: 'atpg',
    name: 'ATPG',
    color: 'var(--gold)',
    boxes: [
      [loc('门级网表', 'Gate netlist'), loc('故障列表', 'fault list')],
      [loc('ATPG 工具', 'ATPG tool'), loc('激活 · 传播', 'activate · propagate')],
      [loc('预先存成', 'Stored ahead'), loc('Pattern 文件', 'as pattern file')],
    ],
  },
]

const BOX_X = [140, 330, 520]
const BOX_W = 146

export function SourceFig({ active }: { active: SourceId }) {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 248" className="term-fig__svg" role="img" aria-label={t(L.sourceCap)}>
        <rect width="680" height="248" rx="10" fill="var(--well)" />
        {LANES.map((lane, i) => {
          const y = 18 + i * 76
          const on = lane.id === active
          const c = on ? lane.color : 'var(--line-2)'
          return (
            <g key={lane.id} opacity={on ? 1 : 0.5}>
              <text x="16" y={y + 35} fill={on ? lane.color : 'var(--muted)'} fontSize="14" fontWeight="600">
                {lane.name}
              </text>
              {lane.boxes.map(([l1, l2], j) => (
                <g key={j}>
                  <rect x={BOX_X[j]} y={y} width={BOX_W} height="56" rx="8" fill="var(--fig-box)" stroke={c} strokeWidth={on ? 1.8 : 1.2} />
                  <text x={BOX_X[j] + BOX_W / 2} y={y + 24} textAnchor="middle" fill="var(--text)" fontSize="12">
                    {t(l1)}
                  </text>
                  <text x={BOX_X[j] + BOX_W / 2} y={y + 42} textAnchor="middle" fill="var(--text-2)" fontSize="12">
                    {t(l2)}
                  </text>
                  {j < 2 ? (
                    <g>
                      <line x1={BOX_X[j] + BOX_W + 4} y1={y + 28} x2={BOX_X[j + 1] - 6} y2={y + 28} stroke={c} strokeWidth="1.6" />
                      <path d={`M ${BOX_X[j + 1] - 4} ${y + 28} l -7 -4 v 8 z`} fill={c} />
                    </g>
                  ) : null}
                </g>
              ))}
            </g>
          )
        })}
      </svg>
      <figcaption>{t(L.sourceCap)}</figcaption>
    </figure>
  )
}

/* ---------------- 与门上的 Stuck-at ---------------- */

const pair = (g: Bit, f: Bit) => (g === f ? String(g) : `${g}/${f}`)

export function AndFaultFig({ a, b, fault, tried }: { a: Bit; b: Bit; fault: FaultId; tried: string[] }) {
  const { t } = useLocale()
  const good = evalAnd(a, b, null)
  const bad = evalAnd(a, b, fault)
  const hit = good.y !== bad.y
  const red = 'var(--red)'
  const wire = (on: boolean) => (on ? red : 'var(--blue)')
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 260" className="term-fig__svg" role="img" aria-label={t(L.faultCap)}>
        <rect width="680" height="260" rx="10" fill="var(--well)" />
        {/* 输入 A、B */}
        <text x="40" y="64" fill="var(--text-2)" fontSize="14" fontFamily="var(--mono)">
          A
        </text>
        <text x="40" y="124" fill="var(--text-2)" fontSize="14" fontFamily="var(--mono)">
          B
        </text>
        <line x1="60" y1="60" x2="240" y2="60" stroke={wire(fault === 'A0' && good.aIn !== bad.aIn)} strokeWidth="2.2" />
        <line x1="60" y1="120" x2="240" y2="120" stroke="var(--blue)" strokeWidth="2.2" />
        <text x="90" y="50" fill="var(--sky)" fontSize="14" fontFamily="var(--mono)">
          {a}
        </text>
        <text x="90" y="110" fill="var(--sky)" fontSize="14" fontFamily="var(--mono)">
          {b}
        </text>
        {fault === 'A0' ? (
          <g>
            <path d="M 152 52 l 16 16 M 168 52 l -16 16" stroke={red} strokeWidth="2.4" />
            <text x="160" y="42" textAnchor="middle" fill={red} fontSize="12" fontFamily="var(--mono)">
              s-a-0
            </text>
            <text x="200" y="50" fill={good.aIn !== bad.aIn ? red : 'var(--sky)'} fontSize="14" fontFamily="var(--mono)">
              {pair(good.aIn, bad.aIn)}
            </text>
          </g>
        ) : null}
        {/* 与门 */}
        <path d="M 240 40 V 140 H 290 C 356 140 356 40 290 40 Z" fill="var(--fig-box)" stroke="var(--blue)" strokeWidth="2" />
        <text x="292" y="95" textAnchor="middle" fill="var(--text)" fontSize="13" fontFamily="var(--mono)">
          AND
        </text>
        {/* 输出 Y */}
        <line x1="339" y1="90" x2="500" y2="90" stroke={wire(hit)} strokeWidth="2.2" />
        {fault !== 'A0' ? (
          <g>
            <path d="M 382 82 l 16 16 M 398 82 l -16 16" stroke={red} strokeWidth="2.4" />
            <text x="390" y="72" textAnchor="middle" fill={red} fontSize="12" fontFamily="var(--mono)">
              {fault === 'Y0' ? 's-a-0' : 's-a-1'}
            </text>
          </g>
        ) : null}
        <text x="512" y="95" fill="var(--text-2)" fontSize="14" fontFamily="var(--mono)">
          Y
        </text>
        <text x="440" y="80" textAnchor="middle" fill={hit ? red : 'var(--sky)'} fontSize="14" fontFamily="var(--mono)">
          {pair(good.y, bad.y)}
        </text>
        <text x="440" y="116" textAnchor="middle" fill="var(--muted)" fontSize="11">
          {`${t(L.good)} ${good.y} · ${t(L.bad)} ${bad.y}`}
        </text>
        <text x="440" y="138" textAnchor="middle" fill={hit ? 'var(--green)' : 'var(--muted)'} fontSize="12" fontWeight="600">
          {t(hit ? L.diff : L.same)}
        </text>
        {/* 每条向量的试验记录 */}
        {VECTORS.map((v, i) => {
          const x = 70 + i * 140
          const done = tried.includes(v.id)
          const g = evalAnd(v.a, v.b, null).y
          const f = evalAnd(v.a, v.b, fault).y
          const ok = g !== f
          const cur = v.a === a && v.b === b
          return (
            <g key={v.id}>
              <rect
                x={x}
                y="172"
                width="120"
                height="66"
                rx="8"
                fill={done ? (ok ? 'var(--green-bg)' : 'var(--fig-box)') : 'var(--fig-box-2)'}
                stroke={cur ? 'var(--gold)' : done && ok ? 'var(--green-line)' : 'var(--line-2)'}
                strokeWidth={cur ? 2 : 1.2}
              />
              <text x={x + 60} y="194" textAnchor="middle" fill="var(--text)" fontSize="13" fontFamily="var(--mono)">
                {`AB = ${v.id}`}
              </text>
              <text x={x + 60} y="212" textAnchor="middle" fill="var(--muted)" fontSize="11">
                {done ? `${t(L.good)} ${g} · ${t(L.bad)} ${f}` : '–'}
              </text>
              <text x={x + 60} y="229" textAnchor="middle" fill={done ? (ok ? 'var(--green)' : 'var(--muted)') : 'var(--dim)'} fontSize="12">
                {t(done ? (ok ? L.caught : L.missed) : L.untried)}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption>{t(L.faultCap)}</figcaption>
    </figure>
  )
}

/* ---------------- Transition：一对向量 ---------------- */

export const TRAN_STEPS: LText[] = [
  loc('V1：A=0、B=1，Y 稳在 0（先放好旧值）', 'V1: A=0, B=1, Y settles at 0 (set the old value)'),
  loc('V2：A 跳到 1（Launch），好芯片的 Y 随即升到 1', 'V2: A rises to 1 (launch); in a good part Y rises to 1 at once'),
  loc('快时钟 Capture：好芯片采到 1，慢升的 Y 还没过门限，采到 0 → 抓到', 'Capture with a fast clock: the good part reads 1; the slow Y has not crossed the threshold and reads 0, so it is caught'),
]

const TX_V1 = 140
const TX_L = 360
const TX_C = 540
const TX_END = 640

export function TransitionFig({ step }: { step: number }) {
  const { t } = useLocale()
  const rows = [
    { y: 40, name: L.rowA },
    { y: 110, name: L.rowGood },
    { y: 180, name: L.rowSlow },
  ]
  const hi = (y: number) => y - 16
  const lo = (y: number) => y + 16
  const end = step === 0 ? TX_L : TX_END
  const slowAt = (x: number) => lo(180) - ((x - TX_L) / (TX_END + 200 - TX_L)) * 32
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 240" className="term-fig__svg" role="img" aria-label={t(TRAN_STEPS[step])}>
        <rect width="680" height="240" rx="10" fill="var(--well)" />
        {rows.map((r) => (
          <text key={r.y} x="14" y={r.y + 4} fill="var(--text-2)" fontSize="12">
            {t(r.name)}
          </text>
        ))}
        <text x={(TX_V1 + TX_L) / 2} y="222" textAnchor="middle" fill="var(--muted)" fontSize="12" fontFamily="var(--mono)">
          V1
        </text>
        {step > 0 ? (
          <text x={(TX_L + TX_END) / 2} y="222" textAnchor="middle" fill="var(--muted)" fontSize="12" fontFamily="var(--mono)">
            V2
          </text>
        ) : null}
        <line x1={TX_L} y1="16" x2={TX_L} y2="206" stroke="var(--line-2)" strokeDasharray="4 4" />
        {/* A */}
        <path
          d={step === 0 ? `M ${TX_V1} ${lo(40)} H ${TX_L}` : `M ${TX_V1} ${lo(40)} H ${TX_L} V ${hi(40)} H ${end}`}
          fill="none"
          stroke="var(--blue)"
          strokeWidth="2.2"
        />
        {/* Y 好芯片：Launch 后很快升起 */}
        <path
          d={step === 0 ? `M ${TX_V1} ${lo(110)} H ${TX_L}` : `M ${TX_V1} ${lo(110)} H ${TX_L + 12} L ${TX_L + 30} ${hi(110)} H ${end}`}
          fill="none"
          stroke="var(--green)"
          strokeWidth="2.2"
        />
        {/* Y 慢升：Capture 时还在门限以下 */}
        <line x1={TX_V1} y1="180" x2={TX_END} y2="180" stroke="var(--line-2)" strokeDasharray="2 4" />
        <text x={TX_END + 4} y="184" fill="var(--dim)" fontSize="10">
          {t(L.thr)}
        </text>
        <path
          d={step === 0 ? `M ${TX_V1} ${lo(180)} H ${TX_L}` : `M ${TX_V1} ${lo(180)} H ${TX_L} L ${end} ${slowAt(end)}`}
          fill="none"
          stroke="var(--red)"
          strokeWidth="2.2"
        />
        {step >= 1 ? (
          <text x={TX_L + 6} y="18" fill="var(--gold)" fontSize="12">
            {t(L.launch)}
          </text>
        ) : null}
        {step >= 2 ? (
          <g>
            <line x1={TX_C} y1="16" x2={TX_C} y2="206" stroke="var(--gold)" strokeWidth="1.8" strokeDasharray="5 3" />
            <text x={TX_C + 6} y="18" fill="var(--gold)" fontSize="12">
              {t(L.capture)}
            </text>
            <circle cx={TX_C} cy={hi(110)} r="6" fill="var(--green)" stroke="var(--well)" strokeWidth="2" />
            <text x={TX_C + 12} y={hi(110) + 4} fill="var(--green)" fontSize="13" fontFamily="var(--mono)">
              1
            </text>
            <circle cx={TX_C} cy={slowAt(TX_C)} r="6" fill="var(--red)" stroke="var(--well)" strokeWidth="2" />
            <text x={TX_C + 12} y={slowAt(TX_C) + 16} fill="var(--red)" fontSize="13" fontFamily="var(--mono)">
              0
            </text>
          </g>
        ) : null}
      </svg>
      <figcaption>{t(TRAN_STEPS[step])}</figcaption>
    </figure>
  )
}
