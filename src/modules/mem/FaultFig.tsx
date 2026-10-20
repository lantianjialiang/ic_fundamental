import { useLocale } from '../../i18n/LocaleContext'
import { COLS, SIZE, TWO_CELL, type FaultState, type Injection } from './faultModel'
import { FIG } from './faultData'

const VW = 330
const VH = 330
const CELL = 36
const OX = 16
const OY = 16

const left = (addr: number) => OX + (addr % COLS) * CELL
const top = (addr: number) => OY + Math.floor(addr / COLS) * CELL
const mid = (addr: number) => ({ x: left(addr) + (CELL - 4) / 2, y: top(addr) + (CELL - 4) / 2 })

export function FaultFig({ state, inj, failAddrs }: { state: FaultState; inj: Injection; failAddrs: number[] }) {
  const { t } = useLocale()
  const failSet = new Set(failAddrs)
  const hasPair = TWO_CELL.includes(state.kind) && inj.victim !== null
  const from = mid(state.cell)
  const to = inj.victim === null ? null : mid(inj.victim)

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${VW} ${VH}`} className="term-fig__svg" role="img" aria-label={t(FIG.aria)}>
        <rect width={VW} height={VH} rx="10" fill="var(--well)" />
        <defs>
          <marker id="mft-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--sky)" />
          </marker>
        </defs>

        {Array.from({ length: SIZE }, (_, addr) => {
          const failing = failSet.has(addr)
          const injected = addr === state.cell
          const partner = hasPair && inj.victim === addr
          const x = left(addr)
          const y = top(addr)
          return (
            <g key={addr}>
              <rect
                x={x}
                y={y}
                width={CELL - 4}
                height={CELL - 4}
                rx="4"
                fill={failing ? 'var(--red-bg)' : 'var(--fig-box)'}
                stroke={injected ? 'var(--gold)' : partner ? 'var(--sky)' : failing ? 'var(--red)' : 'none'}
                strokeWidth={injected ? 2.5 : partner ? 2 : 1.5}
                strokeDasharray={partner && !injected ? '4 3' : undefined}
              />
              <text
                x={x + (CELL - 4) / 2}
                y={y + (CELL - 4) / 2 + 4}
                textAnchor="middle"
                fontSize="11"
                fill={failing ? 'var(--red)' : 'var(--text-2)'}
              >
                {addr}
              </text>
            </g>
          )
        })}

        {hasPair && to !== null ? (
          <line
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="var(--sky)"
            strokeWidth="1.5"
            strokeDasharray="5 3"
            markerEnd="url(#mft-arrow)"
          />
        ) : null}
      </svg>
      <figcaption>{t(FIG.cap)}</figcaption>
    </figure>
  )
}
