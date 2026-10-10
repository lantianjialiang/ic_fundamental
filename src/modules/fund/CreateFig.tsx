import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { LB_CHAIN, LB_NODES, type LbNodeId } from './data/create'

const L = {
  aria: loc('负载板测试流程图'),
  pass: loc('Pass'),
  fail: loc('Fail'),
}

const BX = 140
const BW = 260
const BH = 34
const GAP = 48
const SX = 470
const SW = 190

export function LoadboardFig({
  active,
  visited,
  failAt,
  onPick,
}: {
  active: LbNodeId
  visited: LbNodeId[]
  failAt: LbNodeId | null
  onPick: (id: LbNodeId) => void
}) {
  const { t } = useLocale()
  const yOf = (i: number) => 16 + i * GAP
  const height = yOf(LB_CHAIN.length - 1) + BH + 16
  const stopY = yOf(3)
  const label = (id: LbNodeId) => LB_NODES.find((n) => n.id === id)?.label ?? ''
  const reachedStop = visited.includes('stop')

  const boxStyle = (id: LbNodeId) => {
    const seen = visited.includes(id)
    if (id === failAt && seen) return { fill: 'var(--red-bg)', stroke: 'var(--red)' }
    if (id === 'ok' && seen) return { fill: 'var(--green-bg)', stroke: 'var(--green)' }
    if (seen) return { fill: 'var(--gold-bg)', stroke: 'var(--gold)' }
    return { fill: 'var(--fig-box)', stroke: 'var(--line-2)' }
  }

  return (
    <svg viewBox={`0 0 680 ${height}`} className="term-fig__svg" role="img" aria-label={t(L.aria)}>
      <rect width="680" height={height} rx="10" fill="var(--well)" />
      {LB_CHAIN.map((id, i) => {
        const y = yOf(i)
        const st = boxStyle(id)
        const testNode = i >= 1 && i <= 5
        return (
          <g key={id}>
            {i < LB_CHAIN.length - 1 ? (
              <>
                <line x1={BX + BW / 2} y1={y + BH} x2={BX + BW / 2} y2={yOf(i + 1) - 2} stroke="var(--line-2)" strokeWidth="1.5" />
                <path d={`M${BX + BW / 2 - 4} ${yOf(i + 1) - 7} L${BX + BW / 2} ${yOf(i + 1) - 1} L${BX + BW / 2 + 4} ${yOf(i + 1) - 7}`} fill="none" stroke="var(--line-2)" />
                {testNode ? (
                  <text x={BX + BW / 2 + 8} y={y + BH + 10} fill="var(--green)" fontSize="10">
                    {t(L.pass)}
                  </text>
                ) : null}
              </>
            ) : null}
            {testNode ? (
              <>
                <path
                  d={`M${BX + BW} ${y + BH / 2} L${SX - 30} ${y + BH / 2} L${SX - 30} ${stopY + BH / 2} L${SX} ${stopY + BH / 2}`}
                  fill="none"
                  stroke={id === failAt && visited.includes(id) ? 'var(--red)' : 'var(--line)'}
                  strokeWidth="1.2"
                  strokeDasharray="4 3"
                />
                <text x={BX + BW + 8} y={y + BH / 2 - 4} fill="var(--red)" fontSize="10">
                  {t(L.fail)}
                </text>
              </>
            ) : null}
            <g style={{ cursor: 'pointer' }} onClick={() => onPick(id)}>
              <rect x={BX} y={y} width={BW} height={BH} rx="8" fill={st.fill} stroke={id === active ? 'var(--blue)' : st.stroke} strokeWidth={id === active ? 2.5 : 1.5} />
              <text x={BX + BW / 2} y={y + BH / 2 + 5} textAnchor="middle" fill="var(--text)" fontSize="13">
                {t(label(id))}
              </text>
            </g>
            <text x={BX - 12} y={y + BH / 2 + 4} textAnchor="end" fill="var(--dim)" fontSize="11" fontFamily="var(--mono)">
              {i}
            </text>
          </g>
        )
      })}
      <g style={{ cursor: 'pointer' }} onClick={() => onPick('stop')}>
        <rect
          x={SX}
          y={stopY}
          width={SW}
          height={BH}
          rx="8"
          fill={reachedStop ? 'var(--red-bg)' : 'var(--fig-box-2)'}
          stroke={active === 'stop' ? 'var(--blue)' : reachedStop ? 'var(--red)' : 'var(--red-line)'}
          strokeWidth={active === 'stop' ? 2.5 : 1.5}
        />
        <text x={SX + SW / 2} y={stopY + BH / 2 + 5} textAnchor="middle" fill="var(--text)" fontSize="12">
          {t(label('stop'))}
        </text>
      </g>
    </svg>
  )
}
