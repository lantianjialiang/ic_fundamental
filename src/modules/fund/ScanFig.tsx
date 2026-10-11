import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { CHAIN_N, EQUATIONS, type Bit, type CombFault, type Phase, type StuckFault, type Tri } from './data/scan'

const L = {
  comb: loc('组合逻辑', 'Combinational logic'),
  pi: loc('主输入 PI', 'Primary inputs PI'),
  po: loc('主输出 PO', 'Primary outputs PO'),
  fb: loc('反馈（次态变量）', 'Feedback (secondary variables)'),
  hard: loc('反馈让测试变难', 'Feedback makes testing hard'),
  clk: loc('系统时钟 → 所有存储元件', 'System clock → all M'),
  capNone: loc('同步时序电路通用模型：组合逻辑 + 存储元件 M1…Mn。测试机只碰得到 PI 和 PO。', 'General model of a synchronous sequential circuit: combinational logic + storage elements M1...Mn. The tester can reach only PI and PO.'),
  capNormal: loc('正常模式：黄色是此刻有效的路径——组合逻辑 → 开关 → 存储元件 → 反馈。', 'Normal mode: yellow is the active path: combinational logic → switch → storage element → feedback.'),
  capScan: loc('Scan 模式：黄色是 Scan 路径——Scan Data In → M1 → M2 → … → Mn → Scan Data Out。', 'Scan mode: yellow is the scan path: Scan Data In → M1 → M2 → ... → Mn → Scan Data Out.'),
  exp: loc('期望', 'Expected'),
  act: loc('实际', 'Actual'),
  clock: loc('拍', 'Clock'),
  chainCap: loc('上：链上 8 个触发器此刻的值（红框是注入故障的位置）。下：每一拍之后 SDO 上的值，红色是和期望不一致的拍。', 'Top: the present values of the 8 flip-flops on the chain (the red box marks the injected fault). Bottom: the SDO value after each clock; red marks clocks that do not match the expected value.'),
  stepCap: loc('黄色是当前这一拍有效的路径。Scan 模式走链，正常模式走 D。', 'Yellow is the path active in this clock. Scan mode uses the chain; normal mode uses D.'),
  mScan: loc('Scan 模式', 'Scan mode'),
  mNormal: loc('正常模式', 'Normal mode'),
}

/* ---------------- 通用模型（可选加 Scan） ---------------- */

export function ScanModelFig({ mode }: { mode: 'none' | 'normal' | 'scan' }) {
  const { t } = useLocale()
  const xs = [220, 320, 450]
  const names = ['M1', 'M2', 'Mn']
  const hasMux = mode !== 'none'
  const hot = 'var(--gold)'
  const dim = 'var(--line-2)'
  const funcColor = mode === 'scan' ? dim : mode === 'normal' ? hot : 'var(--text-2)'
  const scanColor = mode === 'scan' ? hot : dim
  const fbColor = mode === 'none' ? 'var(--red)' : mode === 'normal' ? hot : dim
  const cap = mode === 'none' ? L.capNone : mode === 'normal' ? L.capNormal : L.capScan
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 310" className="term-fig__svg" role="img" aria-label={t(cap)}>
        <rect width="680" height="310" rx="10" fill="var(--well)" />
        {/* 组合逻辑 */}
        <rect x="190" y="22" width="320" height="84" rx="10" fill="var(--fig-box)" stroke="var(--line-2)" strokeWidth="1.5" />
        <text x="350" y="70" textAnchor="middle" fill="var(--text)" fontSize="15">
          {t(L.comb)}
        </text>
        <line x1="70" y1="48" x2="190" y2="48" stroke="var(--sky)" strokeWidth="2" />
        <path d="M182 43 L190 48 L182 53" fill="none" stroke="var(--sky)" strokeWidth="2" />
        {/* 英文标签约 115 px 宽，往画布外侧靠，和组合逻辑框留出间距 */}
        <text x="24" y="38" fill="var(--sky)" fontSize="12">
          {t(L.pi)}
        </text>
        <line x1="510" y1="48" x2="630" y2="48" stroke="var(--sky)" strokeWidth="2" />
        <path d="M622 43 L630 48 L622 53" fill="none" stroke="var(--sky)" strokeWidth="2" />
        <text x="664" y="38" textAnchor="end" fill="var(--sky)" fontSize="12">
          {t(L.po)}
        </text>
        {/* Scan Select 线（画在开关后面） */}
        {hasMux ? (
          <>
            <line x1="96" y1="164" x2={xs[2] + 30} y2="164" stroke={mode === 'scan' ? 'var(--purple)' : 'var(--dim)'} strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="142" y="182" textAnchor="end" fill={mode === 'scan' ? 'var(--purple)' : 'var(--muted)'} fontSize="11">
              {`Scan Select = ${mode === 'scan' ? 1 : 0}`}
            </text>
          </>
        ) : null}
        {xs.map((mx, i) => (
          <g key={names[i]}>
            {/* 组合逻辑 → 存储元件 */}
            <line x1={mx + 22} y1="106" x2={mx + 22} y2={hasMux ? 152 : 192} stroke={funcColor} strokeWidth="2" />
            {hasMux ? (
              <>
                {/* Scan 路径进入开关 */}
                <path
                  d={i === 0 ? `M110 140 L${mx + 40} 140 L${mx + 40} 152` : `M${xs[i - 1] + 60} 214 L${mx - 12} 214 L${mx - 12} 140 L${mx + 40} 140 L${mx + 40} 152`}
                  fill="none"
                  stroke={scanColor}
                  strokeWidth="2"
                />
                <path d={`M${mx + 6} 152 L${mx + 54} 152 L${mx + 46} 176 L${mx + 14} 176 Z`} fill="var(--fig-box-2)" stroke="var(--text-2)" />
                <text x={mx + 22} y="168" textAnchor="middle" fill="var(--dim)" fontSize="9">
                  0
                </text>
                <text x={mx + 40} y="168" textAnchor="middle" fill="var(--dim)" fontSize="9">
                  1
                </text>
                <line x1={mx + 30} y1="176" x2={mx + 30} y2="192" stroke={hot} strokeWidth="2" />
              </>
            ) : null}
            <rect x={mx} y="192" width="60" height="44" rx="6" fill="var(--blue-bg)" stroke="var(--blue)" strokeWidth="1.5" />
            <text x={mx + 30} y="219" textAnchor="middle" fill="var(--text)" fontSize="13" fontFamily="var(--mono)">
              {names[i]}
            </text>
            <path d={`M${mx} 228 L${mx + 7} 232 L${mx} 236`} fill="none" stroke="var(--muted)" />
            {/* 反馈 */}
            <line x1={mx + 30} y1="236" x2={mx + 30} y2="258" stroke={fbColor} strokeWidth="1.5" />
          </g>
        ))}
        <text x="402" y="219" textAnchor="middle" fill="var(--muted)" fontSize="16">
          …
        </text>
        {hasMux ? (
          <>
            <circle cx="110" cy="140" r="3" fill={scanColor} />
            <text x="102" y="144" textAnchor="end" fill={mode === 'scan' ? hot : 'var(--muted)'} fontSize="11">
              Scan Data In
            </text>
            <path d={`M${xs[2] + 60} 214 L630 214`} fill="none" stroke={scanColor} strokeWidth="2" />
            <path d="M622 209 L630 214 L622 219" fill="none" stroke={scanColor} strokeWidth="2" />
            <text x="630" y="204" textAnchor="end" fill={mode === 'scan' ? hot : 'var(--muted)'} fontSize="11">
              Scan Data Out
            </text>
          </>
        ) : null}
        <path d={`M${xs[2] + 30} 258 L150 258 L150 88 L190 88`} fill="none" stroke={fbColor} strokeWidth="1.5" />
        <path d="M182 83 L190 88 L182 93" fill="none" stroke={fbColor} strokeWidth="1.5" />
        <text x="160" y="276" fill={fbColor} fontSize="11">
          {t(L.fb)}
        </text>
        <text x="630" y="296" textAnchor="end" fill="var(--muted)" fontSize="11">
          {t(L.clk)}
        </text>
        {mode === 'none' ? (
          <text x="350" y="296" textAnchor="middle" fill="var(--red)" fontSize="14">
            {t(L.hard)}
          </text>
        ) : null}
      </svg>
      <figcaption>{t(cap)}</figcaption>
    </figure>
  )
}

/* ---------------- 8 位链：Flush / Shift ---------------- */

export function ChainFig({
  state,
  step,
  nextSdi,
  expected,
  actual,
  fault,
}: {
  state: Bit[]
  step: number
  nextSdi: Bit | null
  expected: Bit[]
  actual: Bit[]
  fault: StuckFault
}) {
  const { t } = useLocale()
  const bx = (i: number) => 96 + i * 64
  const cx = (c: number) => 104 + c * 32
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 236" className="term-fig__svg" role="img" aria-label={t(L.chainCap)}>
        <rect width="680" height="236" rx="10" fill="var(--well)" />
        {/* SDI */}
        <rect x="18" y="38" width="52" height="44" rx="6" fill="var(--fig-box)" stroke="var(--line-2)" />
        <text x="44" y="30" textAnchor="middle" fill="var(--muted)" fontSize="11">
          SDI
        </text>
        <text x="44" y="66" textAnchor="middle" fill="var(--gold)" fontSize="18" fontFamily="var(--mono)">
          {nextSdi === null ? '–' : nextSdi}
        </text>
        <line x1="70" y1="60" x2={bx(0)} y2="60" stroke="var(--gold)" strokeWidth="2" />
        {state.map((v, i) => {
          const bad = fault && fault.k === i + 1
          return (
            <g key={i}>
              {i > 0 ? <line x1={bx(i - 1) + 50} y1="60" x2={bx(i)} y2="60" stroke="var(--gold)" strokeWidth="2" /> : null}
              <rect
                x={bx(i)}
                y="38"
                width="50"
                height="44"
                rx="6"
                fill={v ? 'var(--blue-bg)' : 'var(--fig-box)'}
                stroke={bad ? 'var(--red)' : 'var(--blue)'}
                strokeWidth={bad ? 2.5 : 1.5}
              />
              <text x={bx(i) + 25} y="67" textAnchor="middle" fill="var(--text)" fontSize="18" fontFamily="var(--mono)">
                {v}
              </text>
              <text x={bx(i) + 25} y="30" textAnchor="middle" fill={bad ? 'var(--red)' : 'var(--muted)'} fontSize="11" fontFamily="var(--mono)">
                {bad ? `FF${i + 1} SA${fault.v}` : `FF${i + 1}`}
              </text>
            </g>
          )
        })}
        <line x1={bx(CHAIN_N - 1) + 50} y1="60" x2="626" y2="60" stroke="var(--gold)" strokeWidth="2" />
        <rect x="608" y="38" width="52" height="44" rx="6" fill="var(--fig-box)" stroke="var(--line-2)" />
        <text x="634" y="30" textAnchor="middle" fill="var(--muted)" fontSize="11">
          SDO
        </text>
        <text x="634" y="66" textAnchor="middle" fill="var(--gold)" fontSize="18" fontFamily="var(--mono)">
          {state[CHAIN_N - 1]}
        </text>
        {/* 输出序列 */}
        <text x="92" y="128" textAnchor="end" fill="var(--dim)" fontSize="11">
          {t(L.clock)}
        </text>
        <text x="92" y="162" textAnchor="end" fill="var(--text-2)" fontSize="12">
          {t(L.exp)}
        </text>
        <text x="92" y="202" textAnchor="end" fill="var(--text-2)" fontSize="12">
          {t(L.act)}
        </text>
        {expected.map((e, c) => {
          const shown = c <= step
          const miss = shown && actual[c] !== e
          return (
            <g key={c}>
              <text x={cx(c)} y="128" textAnchor="middle" fill={c === step ? 'var(--gold)' : 'var(--dim)'} fontSize="10" fontFamily="var(--mono)">
                {c}
              </text>
              <rect x={cx(c) - 13} y="144" width="26" height="26" rx="4" fill="var(--fig-box)" stroke="var(--line-soft)" />
              <text x={cx(c)} y="162" textAnchor="middle" fill="var(--text-2)" fontSize="13" fontFamily="var(--mono)">
                {e}
              </text>
              <rect
                x={cx(c) - 13}
                y="184"
                width="26"
                height="26"
                rx="4"
                fill={miss ? 'var(--red-bg)' : shown ? 'var(--green-bg)' : 'var(--fig-box)'}
                stroke={miss ? 'var(--red)' : 'var(--line-soft)'}
              />
              <text x={cx(c)} y="202" textAnchor="middle" fill={miss ? 'var(--red)' : 'var(--text)'} fontSize="13" fontFamily="var(--mono)">
                {shown ? actual[c] : ''}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption>{t(L.chainCap)}</figcaption>
    </figure>
  )
}

/* ---------------- 4 位完整 Scan 测试 ---------------- */

const FAULT_EQ: Record<CombFault, number> = { none: -1, d2sa0: 1, d3sa1: 2, d4sa0: 3, zsa1: 4 }

export function ScanStepFig({
  phase,
  d,
  z,
  a,
  b,
  fault,
}: {
  phase: Phase
  d: Tri[]
  z: Tri
  a: Bit
  b: Bit
  fault: CombFault
}) {
  const { t } = useLocale()
  const fx = [190, 290, 390, 490]
  const scan = phase.mode === 'scan'
  const hot = 'var(--gold)'
  const dim = 'var(--line-2)'
  const show = (v: Tri) => (v === null ? 'X' : String(v))
  const faultEq = FAULT_EQ[fault]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 300" className="term-fig__svg" role="img" aria-label={t(L.stepCap)}>
        <rect width="680" height="300" rx="10" fill="var(--well)" />
        {/* 组合逻辑 */}
        <rect x="170" y="16" width="360" height="104" rx="10" fill="var(--fig-box)" stroke="var(--line-2)" strokeWidth="1.5" />
        <text x="186" y="36" fill="var(--muted)" fontSize="11">
          {t(L.comb)}
        </text>
        {EQUATIONS.map((eq, i) => (
          <text
            key={eq}
            x={i < 3 ? 200 : 380}
            y={i < 3 ? 58 + i * 20 : 58 + (i - 3) * 20}
            fill={i === faultEq ? 'var(--red)' : 'var(--text-2)'}
            fontSize="12"
            fontFamily="var(--mono)"
          >
            {i === faultEq ? `${eq}  ✕` : eq}
          </text>
        ))}
        {/* 主输入 / 主输出 */}
        {[
          { name: 'A', v: a, y: 50 },
          { name: 'B', v: b, y: 86 },
        ].map((p) => (
          <g key={p.name}>
            <line x1="70" y1={p.y} x2="170" y2={p.y} stroke={phase.pi ? 'var(--sky)' : dim} strokeWidth="2" />
            <text x="40" y={p.y + 5} fill="var(--sky)" fontSize="13" fontFamily="var(--mono)">
              {`${p.name}=${phase.pi ? p.v : '–'}`}
            </text>
          </g>
        ))}
        <line x1="530" y1="68" x2="610" y2="68" stroke={phase.pi ? 'var(--sky)' : dim} strokeWidth="2" />
        <text x="616" y="73" fill="var(--sky)" fontSize="13" fontFamily="var(--mono)">
          {`Z=${phase.pi ? show(z) : '–'}`}
        </text>
        {/* SDI */}
        <text x="34" y="150" fill={scan ? hot : 'var(--muted)'} fontSize="12" fontFamily="var(--mono)">
          {`SDI=${phase.sdi === null ? '–' : phase.sdi}`}
        </text>
        {fx.map((x, i) => (
          <g key={i}>
            {/* D 线 */}
            <line x1={x + 20} y1="120" x2={x + 20} y2="162" stroke={!scan ? hot : dim} strokeWidth="2" />
            <text x={x + 14} y="144" textAnchor="end" fill={!scan ? hot : 'var(--muted)'} fontSize="11" fontFamily="var(--mono)">
              {`D${i + 1}=${phase.pi ? show(d[i]) : '–'}`}
            </text>
            {/* Scan 路径 */}
            <path
              d={i === 0 ? `M90 156 L${x + 42} 156 L${x + 42} 162` : `M${fx[i - 1] + 60} 226 L${x - 14} 226 L${x - 14} 156 L${x + 42} 156 L${x + 42} 162`}
              fill="none"
              stroke={scan ? hot : dim}
              strokeWidth="2"
            />
            <path d={`M${x + 6} 162 L${x + 54} 162 L${x + 46} 184 L${x + 14} 184 Z`} fill="var(--fig-box-2)" stroke="var(--text-2)" />
            <line x1={x + 30} y1="184" x2={x + 30} y2="204" stroke={hot} strokeWidth="2" />
            <rect x={x} y="204" width="60" height="44" rx="6" fill={phase.q[i] === 1 ? 'var(--blue-bg)' : 'var(--fig-box)'} stroke="var(--blue)" strokeWidth="1.5" />
            <text x={x + 30} y="221" textAnchor="middle" fill="var(--muted)" fontSize="11" fontFamily="var(--mono)">
              {`Q${i + 1}`}
            </text>
            <text x={x + 30} y="241" textAnchor="middle" fill="var(--text)" fontSize="16" fontFamily="var(--mono)">
              {show(phase.q[i])}
            </text>
          </g>
        ))}
        <path d={`M${fx[3] + 60} 226 L606 226`} fill="none" stroke={scan ? hot : dim} strokeWidth="2" />
        <text x="612" y="231" fill={scan ? hot : 'var(--muted)'} fontSize="12" fontFamily="var(--mono)">
          {`SDO=${phase.sdo === null ? '–' : phase.sdo}`}
        </text>
        <text x="340" y="280" textAnchor="middle" fill={scan ? 'var(--purple)' : hot} fontSize="13">
          {`${t(scan ? L.mScan : L.mNormal)} · Scan Select = ${scan ? 1 : 0}`}
        </text>
        <text x="340" y="296" textAnchor="middle" fill="var(--dim)" fontSize="10">
          Q1–Q4 → D1–D4 / Z
        </text>
      </svg>
      <figcaption>{t(L.stepCap)}</figcaption>
    </figure>
  )
}
