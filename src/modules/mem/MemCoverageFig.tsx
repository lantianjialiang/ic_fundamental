import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { FAULT_NAME, FIG, S } from './memCoverageData'
import { ALG_IDS, type AlgId, FAULT_KINDS, type FaultKind, RESULTS } from './memCoverageModel'

const W = 480
const H = 250
const X0 = 46
const X1 = 462
const Y_TOP = 36
const Y_BOT = 196
const T_MAX = 120

const xOf = (ms: number) => X0 + (ms / T_MAX) * (X1 - X0)
const yOf = (coverage: number) => Y_BOT - coverage * (Y_BOT - Y_TOP)

const SHORT: Record<AlgId, string> = {
  mscan: 'MSCAN',
  mats: 'MATS+',
  marchx: 'March X',
  marchc: 'March C−',
}

/** 覆盖率—耗时曲线：每种算法一个点，按耗时排序连线；数据全部来自 RESULTS */
export function CoverageCurveFig({ current }: { current: AlgId }) {
  const { t } = useLocale()
  const points = ALG_IDS.map((id) => ({ id, x: xOf(RESULTS[id].timeMs), y: yOf(RESULTS[id].coverage) }))
  const sorted = [...points].sort((a, b) => a.x - b.x)
  const line = sorted.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

  const ticks: ReactNode[] = []
  for (const ms of [0, 40, 80, 120]) {
    ticks.push(
      <text key={`x${ms}`} x={xOf(ms)} y={Y_BOT + 14} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
        {ms}
      </text>,
    )
  }
  for (const pct of [0, 50, 100]) {
    ticks.push(
      <text key={`y${pct}`} x={X0 - 6} y={yOf(pct / 100) + 3} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
        {`${pct}%`}
      </text>,
    )
  }

  return (
    <figure className="term-fig mcov-fig">
      <svg viewBox={`0 0 ${W} ${H}`} className="term-fig__svg" role="img" aria-label={t(FIG.curveAria)}>
        <rect width={W} height={H} rx="10" fill="var(--well)" />
        <text x={X0} y={16} fill="var(--text)" fontSize="11">
          {t(FIG.curveTitle)}
        </text>
        <line x1={X0} x2={X0} y1={Y_TOP} y2={Y_BOT} stroke="var(--line-2)" />
        <line x1={X0} x2={X1} y1={Y_BOT} y2={Y_BOT} stroke="var(--line-2)" />
        <line x1={X0} x2={X1} y1={yOf(0.5)} y2={yOf(0.5)} stroke="var(--line-2)" strokeDasharray="3 3" />
        {ticks}
        <text x={(X0 + X1) / 2} y={Y_BOT + 30} textAnchor="middle" fill="var(--muted)" fontSize="10">
          {t(FIG.xLabel)}
        </text>
        <polyline points={line} fill="none" stroke="var(--blue)" strokeWidth="1.5" opacity="0.6" />
        {points.map((p) => {
          const isCurrent = p.id === current
          return (
            <g key={p.id}>
              <circle cx={p.x} cy={p.y} r={isCurrent ? 6.5 : 5} fill={isCurrent ? 'var(--gold)' : 'var(--blue)'} />
              <text x={p.x} y={p.y - 10} textAnchor="middle" fill="var(--text)" fontSize="10" fontFamily="var(--mono)">
                {`${SHORT[p.id]} ${(RESULTS[p.id].coverage * 100).toFixed(0)}%`}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption>{t(FIG.cap)}</figcaption>
    </figure>
  )
}

/** 故障类别 × 算法的检出表：每格是 检出 / 注入；颜色区分全检、部分检、一个都没检 */
export function FaultTable({ current }: { current: AlgId }) {
  const { t } = useLocale()
  return (
    <div className="mcov-table-wrap">
      <table className="mcov-table">
        <thead>
          <tr>
            <th scope="col">{t(S.classHead)}</th>
            {ALG_IDS.map((id) => (
              <th key={id} scope="col" className={id === current ? 'is-current' : undefined}>
                {SHORT[id]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FAULT_KINDS.map((kind: FaultKind) => (
            <tr key={kind}>
              <th scope="row">{t(FAULT_NAME[kind])}</th>
              {ALG_IDS.map((id) => {
                const cell = RESULTS[id].byKind[kind]
                let tone = 'is-none'
                if (cell.detected === cell.total) {
                  tone = 'is-full'
                } else if (cell.detected > 0) {
                  tone = 'is-part'
                }
                return (
                  <td key={id} className={`${tone}${id === current ? ' is-current' : ''}`}>
                    {`${cell.detected} / ${cell.total}`}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
