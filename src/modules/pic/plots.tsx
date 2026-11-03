const BG = '#0d1117'
const BOX = '#161b22'
const EDGE = '#3d4756'
const TEXT = '#c9d1d9'
const MUTED = '#8b949e'
const GOLD = '#e8c45a'

const W = 640
const H = 300
const L = 52
const R = 16
const T = 28
const B = 36

export type SweepCurve = { id: string; legend: string; color: string; db: number[] }

/** 波长–dB 谱。游标用滑块移动，图下有读数，不靠颜色区分曲线。 */
export function SpectrumPlot({
  lambdaNm,
  curves,
  cursor,
  onCursor,
  aria,
  summary,
  xLabel,
  yLabel,
}: {
  lambdaNm: number[]
  curves: SweepCurve[]
  cursor: number
  onCursor: (index: number) => void
  aria: string
  summary: string
  xLabel: string
  yLabel: string
}) {
  const n = lambdaNm.length
  const i = Math.min(Math.max(n - 1, 0), Math.max(0, cursor))
  const ys = curves.flatMap((curve) => curve.db.filter((v) => Number.isFinite(v)))
  const yMin = Math.min(-40, ...ys) - 1
  const yMax = Math.max(1, ...ys) + 1
  const xOf = (index: number) => L + (n <= 1 ? 0 : (index / (n - 1)) * (W - L - R))
  const yOf = (db: number) => T + ((yMax - db) / (yMax - yMin)) * (H - T - B)
  const ticks = 4

  return (
    <figure className="pic-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={aria} className="pic-svg">
        <rect width={W} height={H} rx={10} fill={BG} />
        <text x={12} y={18} fill={TEXT} fontSize={12}>
          {yLabel}
        </text>
        <rect x={L} y={T} width={W - L - R} height={H - T - B} fill={BOX} stroke={EDGE} />
        {Array.from({ length: ticks + 1 }, (_, k) => {
          const db = yMin + ((yMax - yMin) * k) / ticks
          const y = yOf(db)
          return (
            <g key={k}>
              <line x1={L} x2={W - R} y1={y} y2={y} stroke={EDGE} />
              <text x={L - 6} y={y + 4} fill={MUTED} fontSize={10} textAnchor="end">
                {db.toFixed(0)}
              </text>
            </g>
          )
        })}
        {curves.map((curve) => {
          const d = curve.db
            .map((db, index) => `${index === 0 ? 'M' : 'L'} ${xOf(index).toFixed(1)} ${yOf(db).toFixed(1)}`)
            .join(' ')
          return <path key={curve.id} d={d} fill="none" stroke={curve.color} strokeWidth={1.8} />
        })}
        <line x1={xOf(i)} x2={xOf(i)} y1={T} y2={H - B} stroke={GOLD} strokeDasharray="3 3" />
        {curves.map((curve, index) => (
          <g key={curve.id} transform={`translate(${L + index * 150}, 16)`}>
            <line x1={0} y1={0} x2={14} y2={0} stroke={curve.color} strokeWidth={2.5} />
            <text x={18} y={4} fill={TEXT} fontSize={11}>
              {curve.legend}
            </text>
          </g>
        ))}
        <text x={W / 2} y={H - 8} fill={MUTED} fontSize={11} textAnchor="middle">
          {`${xLabel}  ${lambdaNm[0]?.toFixed(1)} – ${lambdaNm[n - 1]?.toFixed(1)}`}
        </text>
      </svg>
      <input
        type="range"
        min={0}
        max={Math.max(0, n - 1)}
        step={1}
        value={i}
        aria-label={aria}
        onChange={(event) => onCursor(Number(event.target.value))}
      />
      <p className="pic-summary">{summary}</p>
    </figure>
  )
}

export function CouplingHeat({
  xs,
  ys,
  db,
  path,
  mark,
  peak,
  aria,
  summary,
}: {
  xs: number[]
  ys: number[]
  db: number[][]
  path: Array<{ x: number; y: number }>
  mark: { x: number; y: number }
  peak: { x: number; y: number }
  aria: string
  summary: string
}) {
  const plot = 280
  const pad = 36
  const size = plot + pad * 2
  let lo = Infinity
  let hi = -Infinity
  for (const row of db) {
    for (const value of row) {
      if (value < lo) lo = value
      if (value > hi) hi = value
    }
  }
  const span = Math.max(hi - lo, 1e-6)
  const xOf = (x: number) => pad + ((x - xs[0]) / (xs[xs.length - 1] - xs[0] || 1)) * plot
  const yOf = (y: number) => pad + (1 - (y - ys[0]) / (ys[ys.length - 1] - ys[0] || 1)) * plot
  const cellW = plot / xs.length
  const cellH = plot / ys.length

  return (
    <figure className="pic-fig">
      <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={aria} className="pic-svg">
        <rect width={size} height={size} rx={10} fill={BG} />
        {ys.map((y, iy) =>
          xs.map((x, ix) => {
            const t = (db[iy][ix] - lo) / span
            const color = `rgb(${Math.round(25 + t * 210)}, ${Math.round(48 + t * 130)}, ${Math.round(90 - t * 40)})`
            return <rect key={`${ix}-${iy}`} x={xOf(x) - cellW / 2} y={yOf(y) - cellH / 2} width={cellW + 0.4} height={cellH + 0.4} fill={color} />
          }),
        )}
        {path.length > 1 ? (
          <polyline
            fill="none"
            stroke={GOLD}
            strokeWidth={1.4}
            points={path.map((p) => `${xOf(p.x).toFixed(1)},${yOf(p.y).toFixed(1)}`).join(' ')}
          />
        ) : null}
        <circle cx={xOf(peak.x)} cy={yOf(peak.y)} r={4} fill="none" stroke="#ffffff" strokeWidth={1.4} />
        <circle cx={xOf(mark.x)} cy={yOf(mark.y)} r={3.5} fill={GOLD} />
        <text x={pad} y={18} fill={TEXT} fontSize={12}>
          {`${lo.toFixed(1)} … ${hi.toFixed(1)} dBm`}
        </text>
      </svg>
      <p className="pic-summary">{summary}</p>
    </figure>
  )
}
