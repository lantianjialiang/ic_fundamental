import { useLocale } from '../../i18n/LocaleContext'
import { Hit } from '../prep/common'
import { S } from './data/pcbSupply'
import { PANEL_ITEMS, type PanelId } from './data/pcbSupplyMake'

// 拼板几何：左右各留 24 的余边，上下是工艺边
const PX = 24
const PY = 24
const PW = 448
const PH = 200
const RAIL_H = 28
const BOARD_Y = 60
const BOARD_H = 128
const BOARDS = [
  { x: 48, w: 128, round: 2 },
  { x: 176, w: 128, round: 2 },
  { x: 320, w: 128, round: 22 },
]
const HOLES = [
  [44, 38],
  [452, 38],
  [44, 210],
  [452, 210],
]
// 全局 Fiducial 取三个点且不对称，板子放反时机器能发现
const FIDS = [
  [86, 38],
  [86, 210],
  [380, 210],
]
const VX = 176
const BRIDGES = [84, 144]

function Fid({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r * 2} fill="var(--card)" stroke="var(--line)" strokeWidth="0.8" />
      <circle cx={x} cy={y} r={r} fill="var(--gold)" />
    </g>
  )
}

export function PanelFig({ active, onPick }: { active: PanelId; onPick: (id: PanelId) => void }) {
  const { t } = useLocale()
  const name = (id: PanelId) => t((PANEL_ITEMS.find((p) => p.id === id) ?? PANEL_ITEMS[0]).name)
  const stroke = (id: PanelId) => (active === id ? 'var(--gold)' : 'var(--text-2)')
  const sw = (id: PanelId) => (active === id ? 2.4 : 1)
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 250" className="term-fig__svg" role="group" aria-label={t(S.panelCap)}>
        <rect width="760" height="250" rx="10" fill="var(--well)" />
        <rect x={PX} y={PY} width={PW} height={PH} fill="var(--neutral-fill)" stroke="var(--text-2)" />
        <rect x={304} y={BOARD_Y} width={16} height={BOARD_H} fill="var(--well)" />
        {BOARDS.map((b, i) => (
          <g key={i}>
            <rect x={b.x} y={BOARD_Y} width={b.w} height={BOARD_H} rx={b.round} fill="var(--green-bg)" stroke={active === 'util' ? 'var(--gold)' : 'var(--green-line)'} strokeWidth={active === 'util' ? 2.4 : 1} />
            <Fid x={b.x + 16} y={BOARD_Y + 16} r={2.4} />
            <Fid x={b.x + b.w - 16} y={BOARD_Y + BOARD_H - 16} r={2.4} />
          </g>
        ))}
        {BRIDGES.map((y) => (
          <Hit key={y} label={name('bite')} active={active === 'bite'} onPick={() => onPick('bite')}>
            <rect x={304} y={y} width={16} height={20} fill="var(--neutral-fill)" stroke={stroke('bite')} strokeWidth={sw('bite')} />
            {[4, 10, 16].map((d) => (
              <circle key={d} cx={312} cy={y + d} r={2.3} fill="var(--well)" />
            ))}
          </Hit>
        ))}
        {[PY, PY + PH - RAIL_H].map((y) => (
          <Hit key={y} label={name('rail')} active={active === 'rail'} onPick={() => onPick('rail')}>
            <rect x={PX} y={y} width={PW} height={RAIL_H} fill="transparent" stroke={stroke('rail')} strokeWidth={sw('rail')} />
          </Hit>
        ))}
        {HOLES.map(([x, y]) => (
          <Hit key={`${x}-${y}`} label={name('hole')} active={active === 'hole'} onPick={() => onPick('hole')}>
            <circle cx={x} cy={y} r={7} fill="var(--well)" stroke={stroke('hole')} strokeWidth={sw('hole')} />
          </Hit>
        ))}
        {FIDS.map(([x, y]) => (
          <Hit key={`f${x}-${y}`} label={name('fid')} active={active === 'fid'} onPick={() => onPick('fid')}>
            <circle cx={x} cy={y} r={9} fill="transparent" stroke={active === 'fid' ? 'var(--gold)' : 'none'} strokeWidth="2.4" />
            <Fid x={x} y={y} r={3.5} />
          </Hit>
        ))}
        <Hit label={name('vscore')} active={active === 'vscore'} onPick={() => onPick('vscore')}>
          <rect x={VX - 8} y={PY - 6} width={16} height={PH + 12} fill="transparent" />
          <line x1={VX} y1={PY - 4} x2={VX} y2={PY + PH + 4} stroke={active === 'vscore' ? 'var(--gold)' : 'var(--red)'} strokeWidth={active === 'vscore' ? 3 : 1.6} strokeDasharray="6 4" />
        </Hit>
        {PANEL_ITEMS.map((p, i) => {
          const y = 22 + i * 34
          const on = p.id === active
          return (
            <Hit key={p.id} label={t(p.name)} active={on} onPick={() => onPick(p.id)}>
              <rect x="520" y={y} width="220" height="28" rx="6" fill={on ? 'var(--gold-bg)' : 'var(--card)'} stroke={on ? 'var(--gold)' : 'var(--line)'} />
              <text x="630" y={y + 18} textAnchor="middle" fill={on ? 'var(--text)' : 'var(--text-2)'} fontSize="12" fontWeight={on ? 700 : 400}>
                {t(p.name)}
              </text>
            </Hit>
          )
        })}
      </svg>
      <figcaption>{t(S.panelCap)}</figcaption>
    </figure>
  )
}

export function CostBar({ nre, material, process }: { nre: number; material: number; process: number }) {
  const { t } = useLocale()
  const total = nre + material + process
  const BX = 40
  const BW = 680
  const parts = [
    { label: S.legNre, v: nre, fill: 'var(--gold)' },
    { label: S.legMat, v: material, fill: 'var(--green)' },
    { label: S.legProc, v: process, fill: 'var(--text-2)' },
  ]
  let x = BX
  return (
    <svg viewBox="0 0 760 64" className="term-fig__svg" role="img" aria-label={t(S.costCap)}>
      <rect width="760" height="64" rx="10" fill="var(--well)" />
      {parts.map((p) => {
        const w = (p.v / total) * BW
        const rect = <rect key={p.label.en} x={x} y={10} width={w} height={20} fill={p.fill} />
        x += w
        return rect
      })}
      {parts.map((p, i) => (
        <g key={p.label.en}>
          <rect x={BX + i * 232} y={42} width="10" height="10" fill={p.fill} />
          <text x={BX + i * 232 + 16} y={51} fill="var(--text-2)" fontSize="11">
            {`${t(p.label)} ${p.v.toFixed(2)}`}
          </text>
        </g>
      ))}
    </svg>
  )
}
