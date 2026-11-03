import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'

const LABEL = {
  rst: loc('RST', 'RST'),
  tx: loc('TX', 'TX'),
  sel: loc('SEL', 'SEL'),
  fd: loc('FD', 'FD'),
  t: loc('t', 't'),
}

const BG = '#0d1117'
const TRACK = '#21262d'
const TEXT = '#c9d1d9'
const BLUE = '#58a6ff'
const GOLD = '#e8c45a'
const SEL = '#d2a8ff'

/**
 * 4T 时序。名字只放在左栏，色条从 x=72 开始，避免文字叠在条上。
 */
export function SnsPixelFig({
  photoE,
  cds,
  aria,
  summary,
}: {
  photoE: number
  cds: boolean
  aria: string
  summary: string
}) {
  const { t } = useLocale()
  const W = 640
  const H = 268
  const x0 = 78
  const x1 = 620
  const span = x1 - x0
  const xAt = (p: number) => x0 + p * span
  const drop = Math.max(0, Math.min(1, photoE / 12000))
  const yReset = 186
  const ySignal = yReset + drop * 48
  const yStart = 214
  const trace = [
    [0, yStart],
    [0.08, yStart],
    [0.26, yReset],
    [0.46, yReset],
    [0.62, ySignal],
    [1, ySignal],
  ]
    .map(([p, y]) => `${xAt(p).toFixed(1)},${y.toFixed(1)}`)
    .join(' ')

  const bar = (y: number, a: number, b: number, color: string) => (
    <g key={`${y}-${a}`}>
      <rect x={x0} y={y} width={span} height={16} rx={3} fill={TRACK} />
      <rect x={xAt(a)} y={y} width={Math.max(0, xAt(b) - xAt(a))} height={16} rx={3} fill={color} />
    </g>
  )

  return (
    <figure className="sns-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} className="sns-svg">
        <rect width={W} height={H} rx={10} fill={BG} />
        {bar(36, 0.08, 0.26, BLUE)}
        {bar(78, 0.46, 0.62, GOLD)}
        {bar(120, 0.7, 0.94, SEL)}
        <text x={10} y={48} fill={TEXT} fontSize={12}>
          {t(LABEL.rst)}
        </text>
        <text x={10} y={90} fill={TEXT} fontSize={12}>
          {t(LABEL.tx)}
        </text>
        <text x={10} y={132} fill={TEXT} fontSize={12}>
          {t(LABEL.sel)}
        </text>
        <text x={10} y={196} fill={TEXT} fontSize={12}>
          {t(LABEL.fd)}
        </text>
        <polyline fill="none" stroke={BLUE} strokeWidth={2} points={trace} />
        {cds ? (
          <g>
            <circle cx={xAt(0.36)} cy={yReset} r={4} fill={GOLD} />
            <circle cx={xAt(0.78)} cy={ySignal} r={4} fill={GOLD} />
          </g>
        ) : null}
        <text x={x1 - 8} y={H - 10} fill={TEXT} fontSize={11} textAnchor="end">
          {t(LABEL.t)}
        </text>
      </svg>
      <p className="sns-summary">{summary}</p>
    </figure>
  )
}
