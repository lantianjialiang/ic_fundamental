import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import {
  RISK_PCT,
  SHMOO_VDD,
  SHMOO_VIL,
  SPEC_VDD,
  SPEC_VIL,
  marginPct,
  shmooPass,
  type MarginParam,
  type ShmooVec,
} from './data/qualify'

const L = {
  marginAria: loc('每个参数离失效还有多少余量'),
  pull: loc('拉偏'),
  shmooAria: loc('四个向量的 VDD vs. VIL Shmoo 图'),
  spec: loc('规格点'),
}

const MX0 = 120
const MX1 = 610
const MMAX = 50
const MROW = 26

export function MarginFig({ params, x, active, onPick }: { params: MarginParam[]; x: number; active: string; onPick: (id: string) => void }) {
  const { t } = useLocale()
  const height = 40 + params.length * MROW + 10
  const px = (pct: number) => MX0 + (Math.min(pct, MMAX) / MMAX) * (MX1 - MX0)
  const ticks = [0, 10, 20, 30, 40, 50]
  return (
    <svg viewBox={`0 0 680 ${height}`} className="term-fig__svg" role="img" aria-label={t(L.marginAria)}>
      <rect width="680" height={height} rx="10" fill="var(--well)" />
      {ticks.map((v) => (
        <g key={v}>
          <line x1={px(v)} y1={28} x2={px(v)} y2={height - 8} stroke="var(--line)" strokeDasharray={v === RISK_PCT ? '4 3' : undefined} />
          <text x={px(v)} y={20} textAnchor="middle" fill={v === RISK_PCT ? 'var(--gold)' : 'var(--dim)'} fontSize="10">
            {`${v}%`}
          </text>
        </g>
      ))}
      {params.map((p, i) => {
        const m = marginPct(p)
        const y = 36 + i * MROW
        const fail = m <= x
        const risk = !fail && m < RISK_PCT
        const color = fail ? 'var(--red)' : risk ? 'var(--gold)' : 'var(--green)'
        return (
          <g key={p.id} style={{ cursor: 'pointer' }} onClick={() => onPick(p.id)}>
            <rect x={4} y={y - 3} width={672} height={MROW - 2} rx="4" fill={p.id === active ? 'var(--fig-box)' : 'var(--well)'} />
            <text x={14} y={y + 13} fill="var(--text-2)" fontSize="12" fontFamily="var(--mono)">
              {p.name}
            </text>
            <rect x={MX0} y={y + 2} width={Math.max(2, px(m) - MX0)} height={MROW - 10} rx="3" fill={color} opacity="0.75" />
            <text x={Math.min(px(m), MX1) + 6} y={y + 13} fill={color} fontSize="11" fontFamily="var(--mono)">
              {`${m.toFixed(1)}%${m > MMAX ? ' ›' : ''}`}
            </text>
          </g>
        )
      })}
      <line x1={px(x)} y1={26} x2={px(x)} y2={height - 6} stroke="var(--sky)" strokeWidth="2" />
      <text x={px(x) + 4} y={height - 10} fill="var(--sky)" fontSize="11">
        {`${t(L.pull)} ±${x}%`}
      </text>
    </svg>
  )
}

const PW = 330
const PH = 230
const CW = 26
const CH = 17

export function ShmooFig({
  vecs,
  picked,
  verdict,
  onPick,
}: {
  vecs: ShmooVec[]
  picked: string | null
  verdict: Record<string, 'right' | 'wrong'>
  onPick: (id: string) => void
}) {
  const { t } = useLocale()
  const rowsVdd = [...SHMOO_VDD].reverse()
  return (
    <svg viewBox={`0 0 680 ${PH * 2 + 20}`} className="term-fig__svg" role="img" aria-label={t(L.shmooAria)}>
      <rect width="680" height={PH * 2 + 20} rx="10" fill="var(--well)" />
      {vecs.map((v, i) => {
        const ox = 10 + (i % 2) * (PW + 0)
        const oy = 10 + Math.floor(i / 2) * PH
        const gx = ox + 58
        const gy = oy + 26
        const state = verdict[v.id]
        const stroke = state === 'right' ? 'var(--green)' : state === 'wrong' ? 'var(--red)' : picked === v.id ? 'var(--blue)' : 'var(--line)'
        return (
          <g key={v.id} style={{ cursor: 'pointer' }} onClick={() => onPick(v.id)}>
            <rect x={ox + 2} y={oy} width={PW - 8} height={PH - 8} rx="8" fill="var(--panel)" stroke={stroke} strokeWidth={state || picked === v.id ? 2 : 1} />
            <text x={ox + 14} y={oy + 18} fill="var(--text)" fontSize="12" fontFamily="var(--mono)">
              {v.name}
            </text>
            {rowsVdd.map((vdd, r) => (
              <g key={vdd}>
                <text x={gx - 6} y={gy + r * CH + 12} textAnchor="end" fill="var(--dim)" fontSize="9" fontFamily="var(--mono)">
                  {vdd.toFixed(2)}
                </text>
                {SHMOO_VIL.map((vil, c) => {
                  const pass = shmooPass(v, vdd, vil)
                  return (
                    <rect
                      key={vil}
                      x={gx + c * CW + 1}
                      y={gy + r * CH + 1}
                      width={CW - 2}
                      height={CH - 2}
                      rx="2"
                      fill={pass ? 'var(--green-line)' : 'var(--red-bg)'}
                      stroke={pass ? 'none' : 'var(--red-line)'}
                    />
                  )
                })}
              </g>
            ))}
            {SHMOO_VIL.map((vil, c) => (
              <text key={vil} x={gx + c * CW + CW / 2} y={gy + rowsVdd.length * CH + 12} textAnchor="middle" fill="var(--dim)" fontSize="9" fontFamily="var(--mono)">
                {vil.toFixed(1)}
              </text>
            ))}
            <text x={gx + (SHMOO_VIL.length * CW) / 2} y={gy + rowsVdd.length * CH + 26} textAnchor="middle" fill="var(--muted)" fontSize="10">
              VIL (V)
            </text>
            <text x={ox + 14} y={gy + (rowsVdd.length * CH) / 2} fill="var(--muted)" fontSize="10" transform={`rotate(-90 ${ox + 14} ${gy + (rowsVdd.length * CH) / 2})`} textAnchor="middle">
              VDD (V)
            </text>
            {/* 规格点 */}
            <circle
              cx={gx + SHMOO_VIL.indexOf(SPEC_VIL) * CW + CW / 2}
              cy={gy + rowsVdd.indexOf(SPEC_VDD) * CH + CH / 2}
              r="9"
              fill="none"
              stroke="var(--gold)"
              strokeWidth="1.5"
            />
            <text x={gx + SHMOO_VIL.length * CW + 4} y={gy + rowsVdd.indexOf(SPEC_VDD) * CH + 12} fill="var(--gold)" fontSize="9">
              {`○ ${t(L.spec)}`}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
