import { useLocale } from '../../i18n/LocaleContext'
import { FF_FIG } from './data/content'

/** 上升沿位置（x） */
const EDGES = [280, 360, 440, 520, 600]
const ROW = { clk: 40, d: 102, q: 164 }
const H = 26

/** 按跳变点画方波：levels[i] 是 xs[i] 到 xs[i+1] 的电平 */
function wave(xs: number[], levels: number[], top: number) {
  const y = (v: number) => (v ? top : top + H)
  let d = `M${xs[0]} ${y(levels[0])}`
  for (let i = 1; i < xs.length - 1; i += 1) {
    d += ` L${xs[i]} ${y(levels[i - 1])} L${xs[i]} ${y(levels[i])}`
  }
  d += ` L${xs[xs.length - 1]} ${y(levels[levels.length - 1])}`
  return d
}

export function FfFig() {
  const { t } = useLocale()
  const clkX = [240, 280, 320, 360, 400, 440, 480, 520, 560, 600, 640, 660]
  const clkL = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0]
  // D 在 300–340 有一个夹在两个沿之间的窄脉冲：Q 不会理它
  const dX = [240, 300, 340, 400, 470, 560, 660]
  const dL = [0, 1, 0, 1, 0, 1]
  const qX = [240, 440, 520, 600, 660]
  const qL = [0, 1, 0, 1]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 216" className="term-fig__svg" role="img" aria-label={t(FF_FIG.aria)}>
        <rect width="680" height="216" rx="10" fill="var(--well)" />
        {/* FF 符号 */}
        <rect x="70" y="50" width="100" height="124" rx="6" fill="var(--blue-bg)" stroke="var(--blue)" strokeWidth="1.5" />
        <text x="120" y="118" textAnchor="middle" fill="var(--text)" fontSize="16" fontFamily="var(--mono)">
          FF
        </text>
        <line x1="24" y1="80" x2="70" y2="80" stroke="var(--blue)" strokeWidth="2" />
        <text x="78" y="84" fill="var(--text-2)" fontSize="12" fontFamily="var(--mono)">
          D
        </text>
        <line x1="24" y1="152" x2="70" y2="152" stroke="var(--gold)" strokeWidth="2" />
        <path d="M70 144 L82 152 L70 160" fill="none" stroke="var(--gold)" strokeWidth="1.5" />
        <text x="24" y="144" fill="var(--gold)" fontSize="11" fontFamily="var(--mono)">
          CLK
        </text>
        <line x1="170" y1="80" x2="214" y2="80" stroke="var(--green)" strokeWidth="2" />
        <text x="162" y="84" textAnchor="end" fill="var(--text-2)" fontSize="12" fontFamily="var(--mono)">
          Q
        </text>

        {/* 上升沿参考线 */}
        {EDGES.map((x) => (
          <line key={x} x1={x} y1={32} x2={x} y2={ROW.q + H + 6} stroke="var(--line-2)" strokeDasharray="3 4" />
        ))}
        <text x={EDGES[2]} y={24} textAnchor="middle" fill="var(--muted)" fontSize="11">
          {t(FF_FIG.edge)}
        </text>

        <text x="232" y={ROW.clk + 18} textAnchor="end" fill="var(--gold)" fontSize="12" fontFamily="var(--mono)">
          CLK
        </text>
        <path d={wave(clkX, clkL, ROW.clk)} fill="none" stroke="var(--gold)" strokeWidth="2" />
        <text x="232" y={ROW.d + 18} textAnchor="end" fill="var(--blue)" fontSize="12" fontFamily="var(--mono)">
          D
        </text>
        <path d={wave(dX, dL, ROW.d)} fill="none" stroke="var(--blue)" strokeWidth="2" />
        <text x="232" y={ROW.q + 18} textAnchor="end" fill="var(--green)" fontSize="12" fontFamily="var(--mono)">
          Q
        </text>
        <path d={wave(qX, qL, ROW.q)} fill="none" stroke="var(--green)" strokeWidth="2" />

        {/* 被忽略的窄脉冲 */}
        <rect x="296" y={ROW.d - 4} width="48" height={H + 8} rx="4" fill="none" stroke="var(--red)" strokeDasharray="3 3" />
        <text x="320" y={ROW.q - 8} textAnchor="middle" fill="var(--red)" fontSize="11">
          {t(FF_FIG.hold)}
        </text>
      </svg>
      <figcaption>{t(FF_FIG.cap)}</figcaption>
    </figure>
  )
}
