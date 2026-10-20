import { useLocale } from '../../i18n/LocaleContext'
import { FIG, S } from './leakData'
import { C_DEC_NF, DUT_IDS, R_S_KOHM, SPEC_UA, limitUa, readingUa, settleNeededMs, type DutId, type LeakState } from './leakModel'

/* ---------- 电路图 ---------- */

const HW = 480
const HH = 196

/** 三颗器件的颜色：良品绿、边缘件金、故障件红 */
const DUT_COLOR: Record<DutId, string> = {
  healthy: 'var(--green)',
  edge: 'var(--gold)',
  fault: 'var(--red)',
}

/** 电路图：PMU（FVMI）→ R_S → 引脚节点 → DUT；节点到地挂去耦电容 C */
export function HookFig({ state }: { state: LeakState }) {
  const { t } = useLocale()
  const isIq = state.mode === 'iq'
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${HW} ${HH}`} className="term-fig__svg" role="img" aria-label={t(FIG.hookAria)}>
        <rect width={HW} height={HH} rx="10" fill="var(--well)" />

        {/* PMU 方框：加压、量电流 */}
        <rect x="16" y="60" width="92" height="56" rx="6" fill="var(--fig-box)" stroke="var(--line-2)" />
        <text x="62" y="80" textAnchor="middle" fill="var(--blue)" fontSize="11" fontFamily="var(--mono)">PMU</text>
        <text x="62" y="96" textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">FVMI</text>
        <text x="62" y="110" textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">{`${state.vForce.toFixed(1)} V`}</text>
        <line x1="108" y1="88" x2="150" y2="88" stroke="var(--line-2)" strokeWidth="2" />

        {/* R_S：线缆与源内阻 */}
        <rect x="150" y="80" width="60" height="16" fill="var(--fig-box)" stroke="var(--line-2)" />
        <text x="180" y="92" textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">R_S</text>
        <text x="180" y="72" textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">{`${R_S_KOHM} kΩ`}</text>
        <line x1="210" y1="88" x2="250" y2="88" stroke="var(--line-2)" strokeWidth="2" />

        {/* 引脚节点：DUT 与去耦电容都接在这里 */}
        <circle cx="250" cy="88" r="3.5" fill="var(--purple)" />
        <text x="250" y="76" textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {t(isIq ? S.nodeIq : S.nodeLeak)}
        </text>
        <line x1="250" y1="88" x2="300" y2="88" stroke="var(--line-2)" strokeWidth="2" />

        {/* DUT 方框 */}
        <rect x="300" y="60" width="150" height="56" rx="6" fill="var(--fig-box)" stroke="var(--line-2)" />
        <text x="375" y="80" textAnchor="middle" fill="var(--gold)" fontSize="11" fontFamily="var(--mono)">DUT</text>
        <text x="375" y="100" textAnchor="middle" fill="var(--muted)" fontSize="10">
          {t(isIq ? S.pathIq : S.pathLeak)}
        </text>

        {/* 去耦电容：节点到地，两极板平行，地符号在最下方 */}
        <line x1="250" y1="88" x2="250" y2="112" stroke="var(--line-2)" strokeWidth="2" />
        <line x1="238" y1="112" x2="262" y2="112" stroke="var(--line-2)" strokeWidth="2.5" />
        <line x1="238" y1="120" x2="262" y2="120" stroke="var(--line-2)" strokeWidth="2.5" />
        <line x1="250" y1="120" x2="250" y2="146" stroke="var(--line-2)" strokeWidth="2" />
        <line x1="238" y1="146" x2="262" y2="146" stroke="var(--line-2)" strokeWidth="2" />
        <line x1="242" y1="151" x2="258" y2="151" stroke="var(--line-2)" strokeWidth="2" />
        <line x1="246" y1="156" x2="254" y2="156" stroke="var(--line-2)" strokeWidth="2" />
        <text x="226" y="120" textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">{`C ${C_DEC_NF} nF`}</text>

        <text x="16" y="184" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          I_read(t) = I_DUT + (V / R_S) · e^(−t/τ)
        </text>
      </svg>
      <figcaption>{t(FIG.hookCap)}</figcaption>
    </figure>
  )
}

/* ---------- 瞬态曲线图 ---------- */

const W = 480
const H = 196
const PX0 = 52
const PX1 = 456
const PY0 = 14
const PY1 = 140
const T_MAX_MS = 10
const SAMPLES = 100
const TIME_TICKS = [0, 2, 4, 6, 8, 10]

const tx = (ms: number) => PX0 + (ms / T_MAX_MS) * (PX1 - PX0)

/** 满量程：漏电 0–100 µA，静态电流 0–200 µA */
const yMaxOf = (mode: LeakState['mode']) => (mode === 'leak' ? 100 : 200)

/**
 * 读数随等待时间的曲线：三颗器件各一条。
 * 选中的器件加粗，并在当前等待时间处画一个点；限值与规格用水平线，
 * 所需等待时间用竖线。文字统一放在坐标轴下方的图例行，避免与曲线、标线重叠。
 */
export function SettleFig({ state }: { state: LeakState }) {
  const { t } = useLocale()
  const yMax = yMaxOf(state.mode)
  const ty = (ua: number) => PY1 - (ua / yMax) * (PY1 - PY0)
  const limit = limitUa(state.mode, state.guard)
  const spec = SPEC_UA[state.mode]
  const needMs = settleNeededMs(state.vForce)
  const selectedReading = readingUa(state.mode, state.dut, state.vForce, state.settleMs)

  const curves = DUT_IDS.map((dut) => {
    const parts: string[] = []
    for (let i = 0; i <= SAMPLES; i += 1) {
      const ms = (T_MAX_MS * i) / SAMPLES
      parts.push(`${tx(ms).toFixed(1)},${ty(readingUa(state.mode, dut, state.vForce, ms)).toFixed(1)}`)
    }
    return { dut, points: parts.join(' ') }
  })

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${W} ${H}`} className="term-fig__svg" role="img" aria-label={t(FIG.settleAria)}>
        <rect width={W} height={H} rx="10" fill="var(--well)" />
        <rect x={PX0} y={PY0} width={PX1 - PX0} height={PY1 - PY0} fill="var(--fig-box)" stroke="var(--line-2)" />

        <line x1={PX0} x2={PX1} y1={ty(limit)} y2={ty(limit)} stroke="var(--red)" strokeWidth="1.5" strokeDasharray="6 3" />
        <line x1={PX0} x2={PX1} y1={ty(spec)} y2={ty(spec)} stroke="var(--muted)" strokeWidth="1" strokeDasharray="2 3" />
        <line x1={tx(needMs)} x2={tx(needMs)} y1={PY0} y2={PY1} stroke="var(--muted)" strokeWidth="1" strokeDasharray="4 3" />

        {curves.map((c) => (
          <polyline
            key={c.dut}
            points={c.points}
            fill="none"
            stroke={DUT_COLOR[c.dut]}
            strokeWidth={c.dut === state.dut ? 2.6 : 1.2}
            opacity={c.dut === state.dut ? 1 : 0.5}
          />
        ))}

        <circle cx={tx(state.settleMs)} cy={ty(selectedReading)} r="4" fill="var(--purple)" />

        <text x={PX0 - 6} y={PY1 + 3} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">0</text>
        <text x={PX0 - 6} y={PY0 + 3} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">{`${yMax}`}</text>
        {TIME_TICKS.map((ms) => (
          <text key={ms} x={tx(ms)} y={PY1 + 14} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
            {`${ms} ms`}
          </text>
        ))}

        {DUT_IDS.map((dut, index) => (
          <text
            key={dut}
            x={52 + index * 118}
            y={170}
            fill={DUT_COLOR[dut]}
            fontSize="10"
            fontFamily="var(--mono)"
            fontWeight={dut === state.dut ? 'bold' : 'normal'}
          >
            {t(dut === 'healthy' ? S.dutHealthy : dut === 'edge' ? S.dutEdge : S.dutFault)}
          </text>
        ))}
        <text x={52} y={186} fill="var(--red)" fontSize="10" fontFamily="var(--mono)">
          {`${t(S.limitLbl)} ${limit.toFixed(1)} µA`}
        </text>
        <text x={190} y={186} fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {`${t(S.specLbl)} ${spec.toFixed(1)} µA`}
        </text>
        <text x={330} y={186} fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {`${t(S.settleLbl)} ${needMs.toFixed(1)} ms`}
        </text>
      </svg>
      <figcaption>{t(FIG.settleCap)}</figcaption>
    </figure>
  )
}
