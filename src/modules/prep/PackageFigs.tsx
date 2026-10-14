import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Hit } from './common'
import { CPFT, CPFT_LABEL, FLOW_LABEL, INSIDE, INSIDE_CAP, PARTS, VIEW, type InsideMode, type PartId, type PkgId, type StageId } from './data/package'

const L = {
  topNote: loc('从顶面看：1 脚旁有圆点或缺口，编号按逆时针。', 'From the top: pin 1 is next to a dot or notch, and numbering runs counterclockwise.'),
  cpftCap: loc('左：探针卡的针扎在晶圆 Pad 上；右：分选机把成品压进 Socket，弹簧针顶住锡球。', 'Left: probe-card needles land on wafer pads. Right: the handler presses the part into the socket, and spring pins push on the balls.'),
}

/* ---------- 封装外观 ---------- */

const SCALE: Record<PkgId, number> = { dip: 16, sop: 26, qfp: 13, qfn: 30, bga: 15, wlcsp: 55 }
const BODY = 'var(--neutral-fill)'
const METAL = '#a7afb8'
const PIN1 = 'var(--gold)'

function Pin1Label({ x, y, anchor = 'middle', text = '1' }: { x: number; y: number; anchor?: 'start' | 'middle' | 'end'; text?: string }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill="var(--gold)" fontSize="11" fontWeight="700" fontFamily="var(--mono)">
      {text}
    </text>
  )
}

/** 两排引脚（DIP / SOP），1 脚在左下 */
function DualTop({ cx, cy, k, len, wid, span, pitch, leadW, n, dip }: { cx: number; cy: number; k: number; len: number; wid: number; span: number; pitch: number; leadW: number; n: number; dip: boolean }) {
  const left = cx - (len / 2) * k
  const top = cy - (wid / 2) * k
  const bottom = cy + (wid / 2) * k
  const out = (span / 2 - wid / 2) * k
  const per = n / 2
  const leads: ReactNode[] = []
  for (let i = 0; i < per; i++) {
    const x = cx + (i - (per - 1) / 2) * pitch * k
    const w = leadW * k
    leads.push(<rect key={`b${i}`} x={x - w / 2} y={bottom} width={w} height={out} fill={i === 0 ? PIN1 : METAL} stroke="var(--text-2)" strokeWidth="0.6" />)
    leads.push(<rect key={`t${i}`} x={x - w / 2} y={top - out} width={w} height={out} fill={METAL} stroke="var(--text-2)" strokeWidth="0.6" />)
  }
  const pin1x = cx - ((per - 1) / 2) * pitch * k
  return (
    <g>
      {leads}
      <rect x={left} y={top} width={len * k} height={wid * k} rx="2" fill={BODY} stroke="var(--text-2)" />
      {dip ? <path d={`M${left} ${cy - 0.8 * k} A${0.8 * k} ${0.8 * k} 0 0 1 ${left} ${cy + 0.8 * k} Z`} fill="var(--well)" stroke="var(--text-2)" /> : null}
      <circle cx={left + (dip ? 1.1 : 0.6) * k} cy={bottom - (dip ? 1.1 : 0.6) * k} r={(dip ? 0.35 : 0.25) * k} fill="var(--well)" stroke="var(--text-2)" strokeWidth="0.6" />
      <Pin1Label x={pin1x} y={bottom + out + 14} />
    </g>
  )
}

function QfpTop({ cx, cy, k }: { cx: number; cy: number; k: number }) {
  const body = 10
  const out = 1
  const per = 11
  const pitch = 0.8
  const w = 0.37 * k
  const h = (body / 2) * k
  const leads: ReactNode[] = []
  for (let i = 0; i < per; i++) {
    const d = (i - (per - 1) / 2) * pitch * k
    leads.push(<rect key={`l${i}`} x={cx - h - out * k} y={cy + d - w / 2} width={out * k} height={w} fill={i === 0 ? PIN1 : METAL} stroke="var(--text-2)" strokeWidth="0.4" />)
    leads.push(<rect key={`r${i}`} x={cx + h} y={cy + d - w / 2} width={out * k} height={w} fill={METAL} stroke="var(--text-2)" strokeWidth="0.4" />)
    leads.push(<rect key={`t${i}`} x={cx + d - w / 2} y={cy - h - out * k} width={w} height={out * k} fill={METAL} stroke="var(--text-2)" strokeWidth="0.4" />)
    leads.push(<rect key={`b${i}`} x={cx + d - w / 2} y={cy + h} width={w} height={out * k} fill={METAL} stroke="var(--text-2)" strokeWidth="0.4" />)
  }
  const first = cy - ((per - 1) / 2) * pitch * k
  return (
    <g>
      {leads}
      <rect x={cx - h} y={cy - h} width={body * k} height={body * k} rx="2" fill={BODY} stroke="var(--text-2)" />
      <circle cx={cx - h + 1 * k} cy={cy - h + 1 * k} r={0.4 * k} fill="var(--well)" stroke="var(--text-2)" strokeWidth="0.6" />
      <Pin1Label x={cx - h - out * k - 6} y={first + 4} anchor="end" />
    </g>
  )
}

function QfnBottom({ cx, cy, k }: { cx: number; cy: number; k: number }) {
  const body = 5
  const per = 8
  const pitch = 0.5
  const pw = 0.25 * k
  const pl = 0.4 * k
  const h = (body / 2) * k
  const ep = (3.3 / 2) * k
  const pads: ReactNode[] = []
  for (let i = 0; i < per; i++) {
    const d = (i - (per - 1) / 2) * pitch * k
    pads.push(<rect key={`r${i}`} x={cx + h - pl} y={cy + d - pw / 2} width={pl} height={pw} fill={i === 0 ? PIN1 : METAL} />)
    pads.push(<rect key={`l${i}`} x={cx - h} y={cy + d - pw / 2} width={pl} height={pw} fill={METAL} />)
    pads.push(<rect key={`t${i}`} x={cx + d - pw / 2} y={cy - h} width={pw} height={pl} fill={METAL} />)
    pads.push(<rect key={`b${i}`} x={cx + d - pw / 2} y={cy + h - pl} width={pw} height={pl} fill={METAL} />)
  }
  const c = 0.4 * k
  const first = cy - ((per - 1) / 2) * pitch * k
  return (
    <g>
      <rect x={cx - h} y={cy - h} width={body * k} height={body * k} rx="2" fill={BODY} stroke="var(--text-2)" />
      {pads}
      <path d={`M${cx - ep} ${cy - ep} H${cx + ep - c} L${cx + ep} ${cy - ep + c} V${cy + ep} H${cx - ep} Z`} fill={METAL} stroke="var(--text-2)" strokeWidth="0.6" />
      <Pin1Label x={cx + h + 8} y={first + 4} anchor="start" />
    </g>
  )
}

const ROWS = 'ABCDEFGHJKLMNPRTUVWY'

function ArrayBottom({ cx, cy, k, body, n, pitch, ball, die }: { cx: number; cy: number; k: number; body: number; n: number; pitch: number; ball: number; die: boolean }) {
  const h = (body / 2) * k
  const balls: ReactNode[] = []
  const pos = (i: number) => (i - (n - 1) / 2) * pitch * k
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const a1 = r === 0 && c === 0
      balls.push(<circle key={`${r}-${c}`} cx={cx - pos(c)} cy={cy + pos(r)} r={(ball / 2) * k} fill={a1 ? PIN1 : METAL} stroke="var(--text-2)" strokeWidth="0.4" />)
    }
  }
  const labels: ReactNode[] = []
  for (let i = 0; i < n; i++) {
    labels.push(
      <text key={`row${i}`} x={cx + h + 8} y={cy + pos(i) + 3} fill={i === 0 ? 'var(--gold)' : 'var(--dim)'} fontSize="8" fontFamily="var(--mono)">
        {ROWS[i]}
      </text>,
    )
    labels.push(
      <text key={`col${i}`} x={cx - pos(i)} y={cy - h - 6} textAnchor="middle" fill={i === 0 ? 'var(--gold)' : 'var(--dim)'} fontSize="8" fontFamily="var(--mono)">
        {i + 1}
      </text>,
    )
  }
  const tri = 0.9 * k
  return (
    <g>
      <rect x={cx - h} y={cy - h} width={body * k} height={body * k} rx={die ? 1 : 3} fill={die ? 'var(--fig-box-2)' : 'var(--green-bg)'} stroke="var(--text-2)" />
      {die ? null : <path d={`M${cx + h - tri} ${cy - h} H${cx + h} V${cy - h + tri} Z`} fill="var(--gold)" opacity="0.8" />}
      {balls}
      {labels}
    </g>
  )
}

const PCB_Y = 196

function Pcb({ x0, x1, thick }: { x0: number; x1: number; thick: number }) {
  return <rect x={x0} y={PCB_Y} width={x1 - x0} height={thick} fill="var(--green-bg)" stroke="var(--green-line)" />
}

function GullSide({ cx, k, body, thick, span }: { cx: number; k: number; body: number; thick: number; span: number }) {
  const bottom = PCB_Y - 0.1 * k
  const top = bottom - thick * k
  const mid = (top + bottom) / 2
  const lt = Math.max(0.15 * k, 2)
  const lead = (sgn: number) => {
    const x0 = cx + sgn * (body / 2) * k
    const x1 = cx + sgn * (body / 2 + 0.3) * k
    const x2 = cx + sgn * (body / 2 + 0.5) * k
    const x3 = cx + sgn * (span / 2) * k
    return `M${x0} ${mid} H${x1} L${x2} ${PCB_Y - lt / 2} H${x3}`
  }
  return (
    <g>
      {[-1, 1].map((sgn) => (
        <rect key={sgn} x={sgn < 0 ? cx - (span / 2) * k - 2 : cx + (body / 2 + 0.45) * k} y={PCB_Y - 1} width={(span / 2 - body / 2 - 0.45) * k + 2} height="3" fill="var(--gold-bg-2)" />
      ))}
      <path d={`${lead(-1)} ${lead(1)}`} fill="none" stroke={METAL} strokeWidth={lt} strokeLinejoin="round" />
      <path d={`${lead(-1)} ${lead(1)}`} fill="none" stroke="var(--text-2)" strokeWidth="0.6" strokeLinejoin="round" />
      <rect x={cx - (body / 2) * k} y={top} width={body * k} height={thick * k} rx="2" fill={BODY} stroke="var(--text-2)" />
    </g>
  )
}

function SideView({ id, cx, k }: { id: PkgId; cx: number; k: number }) {
  if (id === 'dip') {
    const bodyBottom = PCB_Y - 0.6 * k
    const bodyTop = bodyBottom - 3.3 * k
    const leadY = bodyBottom - 1.0 * k
    const pcbT = 1.6 * k
    return (
      <g>
        <Pcb x0={cx - 120} x1={cx + 120} thick={pcbT} />
        {[-1, 1].map((sgn) => {
          const x = cx + sgn * 3.81 * k
          return (
            <g key={sgn}>
              <rect x={x - 0.6 * k} y={PCB_Y} width={1.2 * k} height={pcbT} fill="var(--well)" />
              <path d={`M${cx + sgn * 3.2 * k} ${leadY} H${x} V${PCB_Y + pcbT + 1.0 * k}`} fill="none" stroke={METAL} strokeWidth={0.46 * k} />
              <path d={`M${x - 0.8 * k} ${PCB_Y + pcbT} Q${x} ${PCB_Y + pcbT + 0.8 * k} ${x + 0.8 * k} ${PCB_Y + pcbT} Z`} fill="var(--line-2)" />
            </g>
          )
        })}
        <rect x={cx - 3.2 * k} y={bodyTop} width={6.4 * k} height={3.3 * k} rx="3" fill={BODY} stroke="var(--text-2)" />
      </g>
    )
  }
  if (id === 'sop') {
    return (
      <g>
        <Pcb x0={cx - 120} x1={cx + 120} thick={14} />
        <GullSide cx={cx} k={k} body={3.9} thick={1.5} span={6.0} />
      </g>
    )
  }
  if (id === 'qfp') {
    return (
      <g>
        <Pcb x0={cx - 120} x1={cx + 120} thick={14} />
        <GullSide cx={cx} k={k} body={10} thick={1.4} span={12} />
      </g>
    )
  }
  if (id === 'qfn') {
    const bottom = PCB_Y - 0.05 * k
    const top = bottom - 0.85 * k
    const term = 0.2 * k
    return (
      <g>
        <Pcb x0={cx - 120} x1={cx + 120} thick={14} />
        {[-2.3, 2.3, 0].map((d) => (
          <rect key={d} x={cx + (d - (d === 0 ? 1.65 : 0.2)) * k} y={bottom} width={(d === 0 ? 3.3 : 0.4) * k} height={0.05 * k + 1} fill="var(--line-2)" />
        ))}
        <rect x={cx - 2.5 * k} y={top} width={5 * k} height={0.85 * k} rx="2" fill={BODY} stroke="var(--text-2)" />
        <rect x={cx - 2.5 * k} y={bottom - term} width={0.4 * k} height={term} fill={METAL} />
        <rect x={cx + 2.1 * k} y={bottom - term} width={0.4 * k} height={term} fill={METAL} />
        <rect x={cx - 1.65 * k} y={bottom - term} width={3.3 * k} height={term} fill={METAL} />
      </g>
    )
  }
  if (id === 'bga') {
    const subBottom = PCB_Y - 0.4 * k
    const subTop = subBottom - 0.36 * k
    const moldTop = subTop - 0.8 * k
    return (
      <g>
        <Pcb x0={cx - 120} x1={cx + 120} thick={14} />
        {Array.from({ length: 10 }, (_, i) => {
          const x = cx + (i - 4.5) * 0.8 * k
          return <ellipse key={i} cx={x} cy={PCB_Y - 0.2 * k} rx={0.25 * k} ry={0.21 * k} fill={METAL} stroke="var(--text-2)" strokeWidth="0.5" />
        })}
        <rect x={cx - 5 * k} y={subTop} width={10 * k} height={0.36 * k} fill="var(--green-bg)" stroke="var(--green-line)" />
        <rect x={cx - 4.6 * k} y={moldTop} width={9.2 * k} height={0.8 * k} rx="1" fill={BODY} stroke="var(--text-2)" />
      </g>
    )
  }
  const dieBottom = PCB_Y - 0.2 * k
  return (
    <g>
      <Pcb x0={cx - 120} x1={cx + 120} thick={14} />
      {Array.from({ length: 6 }, (_, i) => {
        const x = cx + (i - 2.5) * 0.4 * k
        return <ellipse key={i} cx={x} cy={PCB_Y - 0.1 * k} rx={0.13 * k} ry={0.1 * k} fill={METAL} stroke="var(--text-2)" strokeWidth="0.5" />
      })}
      <rect x={cx - 1.3 * k} y={dieBottom - 0.5 * k} width={2.6 * k} height={0.5 * k} fill="var(--fig-box-2)" stroke="var(--text-2)" />
    </g>
  )
}

export function PackageFig({ id }: { id: PkgId }) {
  const { t } = useLocale()
  const k = SCALE[id]
  const bottomView = id === 'qfn' || id === 'bga' || id === 'wlcsp'
  const cy = 136
  const cx = 190
  let left: ReactNode = null
  if (id === 'dip') {
    left = <DualTop cx={cx} cy={cy} k={k} len={9.8} wid={6.4} span={8.2} pitch={2.54} leadW={1.2} n={8} dip />
  } else if (id === 'sop') {
    left = <DualTop cx={cx} cy={cy} k={k} len={4.9} wid={3.9} span={6.0} pitch={1.27} leadW={0.42} n={8} dip={false} />
  } else if (id === 'qfp') {
    left = <QfpTop cx={cx} cy={cy} k={k} />
  } else if (id === 'qfn') {
    left = <QfnBottom cx={cx} cy={cy} k={k} />
  } else if (id === 'bga') {
    left = <ArrayBottom cx={cx} cy={cy} k={k} body={10} n={10} pitch={0.8} ball={0.5} die={false} />
  } else {
    left = <ArrayBottom cx={cx} cy={cy} k={k} body={2.6} n={6} pitch={0.4} ball={0.26} die />
  }
  const cap = bottomView ? VIEW.mirror : L.topNote
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 290" className="term-fig__svg" role="img" aria-label={t(cap)}>
        <rect width="760" height="290" rx="10" fill="var(--well)" />
        <rect x="10" y="10" width="360" height="270" rx="8" fill="var(--card)" stroke="var(--line)" />
        <rect x="390" y="10" width="360" height="270" rx="8" fill="var(--card)" stroke="var(--line)" />
        <text x="190" y="30" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(bottomView ? VIEW.bottom : VIEW.top)}
        </text>
        <text x="570" y="30" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(VIEW.side)}
        </text>
        {left}
        <SideView id={id} cx={570} k={k} />
        <text x="738" y={PCB_Y + 11} textAnchor="end" fill="var(--green)" fontSize="10">
          {t(VIEW.pcb)}
        </text>
        {[24, 404].map((x) => (
          <g key={x}>
            <path d={`M${x} 262 v6 h${k} v-6`} fill="none" stroke="var(--text-2)" />
            <text x={x + k + 6} y="270" fill="var(--text-2)" fontSize="10" fontFamily="var(--mono)">
              1 mm
            </text>
          </g>
        ))}
      </svg>
      <figcaption>{t(cap)}</figcaption>
    </figure>
  )
}

/* ---------- 打线 / 倒装剖面 ---------- */

function partStyle(on: boolean) {
  return on ? { stroke: 'var(--gold)', strokeWidth: 2.5 } : { stroke: 'var(--text-2)', strokeWidth: 0.8 }
}

/** 打线 BGA 剖面；dx 平移；show 控制分步出现 */
function WireBga({ dx, active, onPick, show }: { dx: number; active?: PartId; onPick?: (id: PartId) => void; show: { wire: boolean; mold: boolean; ball: boolean } }) {
  const { t } = useLocale()
  const pick = (id: PartId) => () => onPick?.(id)
  const wrap = (id: PartId, node: ReactNode) =>
    onPick ? (
      <Hit key={id} label={t(PARTS[id].title)} active={active === id} onPick={pick(id)}>
        {node}
      </Hit>
    ) : (
      <g key={id}>{node}</g>
    )
  const wires = [
    `M${182 + dx} 136 C${178 + dx} 96 ${120 + dx} 100 ${110 + dx} 168`,
    `M${196 + dx} 136 C${192 + dx} 106 ${150 + dx} 108 ${140 + dx} 168`,
    `M${358 + dx} 136 C${362 + dx} 96 ${420 + dx} 100 ${430 + dx} 168`,
    `M${344 + dx} 136 C${348 + dx} 106 ${390 + dx} 108 ${400 + dx} 168`,
  ]
  return (
    <g>
      {wrap(
        'substrate',
        <g>
          <rect x={70 + dx} y="170" width="400" height="18" fill="var(--green-bg)" {...partStyle(active === 'substrate')} />
          {[110, 140, 400, 430].map((x) => (
            <g key={x}>
              <rect x={x + dx - 7} y="167" width="14" height="3" fill="var(--gold)" />
              <line x1={x + dx} y1="170" x2={x + dx + (x < 270 ? -20 : 20)} y2="188" stroke="var(--gold-line)" />
            </g>
          ))}
        </g>,
      )}
      {show.ball
        ? wrap(
            'ball',
            <g>
              {Array.from({ length: 10 }, (_, i) => (
                <circle key={i} cx={90 + i * 40 + dx} cy="197" r="9" fill={METAL} {...partStyle(active === 'ball')} />
              ))}
            </g>,
          )
        : null}
      {wrap('attach', <rect x={165 + dx} y="162" width="210" height="8" fill="var(--gold-bg-2)" {...partStyle(active === 'attach')} />)}
      {wrap(
        'die',
        <g>
          <rect x={170 + dx} y="136" width="200" height="26" fill="var(--fig-box-2)" {...partStyle(active === 'die')} />
          {[182, 196, 344, 358].map((x) => (
            <rect key={x} x={x + dx - 4} y="134" width="8" height="3" fill="var(--text-2)" />
          ))}
        </g>,
      )}
      {show.mold ? wrap('mold', <rect x={80 + dx} y="80" width="380" height="90" rx="3" fill={BODY} opacity="0.55" {...partStyle(active === 'mold')} />) : null}
      {show.wire
        ? wrap(
            'wire',
            <g>
              {wires.map((d) => (
                <g key={d}>
                  <path d={d} fill="none" stroke="transparent" strokeWidth="10" />
                  <path d={d} fill="none" stroke={active === 'wire' ? 'var(--gold)' : 'var(--gold-line)'} strokeWidth={active === 'wire' ? 2.5 : 1.5} />
                </g>
              ))}
            </g>,
          )
        : null}
    </g>
  )
}

function FlipBga({ active, onPick }: { active: PartId; onPick: (id: PartId) => void }) {
  const { t } = useLocale()
  const wrap = (id: PartId, node: ReactNode) => (
    <Hit key={id} label={t(PARTS[id].title)} active={active === id} onPick={() => onPick(id)}>
      {node}
    </Hit>
  )
  return (
    <g>
      {wrap(
        'substrate',
        <g>
          <rect x="70" y="170" width="400" height="18" fill="var(--green-bg)" {...partStyle(active === 'substrate')} />
          {[180, 240, 300, 360].map((x) => (
            <line key={x} x1={x} y1="170" x2={x + (x < 270 ? -40 : 40)} y2="188" stroke="var(--gold-line)" />
          ))}
        </g>,
      )}
      {wrap(
        'ball',
        <g>
          {Array.from({ length: 10 }, (_, i) => (
            <circle key={i} cx={90 + i * 40} cy="197" r="9" fill={METAL} {...partStyle(active === 'ball')} />
          ))}
        </g>,
      )}
      {wrap('underfill', <path d="M158 170 L170 146 H370 L382 170 Z" fill="var(--blue-bg)" {...partStyle(active === 'underfill')} />)}
      {wrap(
        'bump',
        <g>
          {Array.from({ length: 10 }, (_, i) => (
            <circle key={i} cx={180 + i * 20} cy="158" r="6" fill={METAL} {...partStyle(active === 'bump')} />
          ))}
        </g>,
      )}
      {wrap('die', <rect x="170" y="118" width="200" height="28" fill="var(--fig-box-2)" {...partStyle(active === 'die')} />)}
    </g>
  )
}

export function InsideFig({ mode, active, onPick }: { mode: InsideMode; active: PartId; onPick: (id: PartId) => void }) {
  const { t } = useLocale()
  const list = INSIDE[mode]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 240" className="term-fig__svg" role="group" aria-label={t(INSIDE_CAP)}>
        <rect width="760" height="240" rx="10" fill="var(--well)" />
        {mode === 'wire' ? <WireBga dx={0} active={active} onPick={onPick} show={{ wire: true, mold: true, ball: true }} /> : <FlipBga active={active} onPick={onPick} />}
        <line x1="40" y1="218" x2="500" y2="218" stroke="var(--line-3)" strokeDasharray="4 4" />
        {list.map((id, i) => {
          const y = 22 + i * 34
          const on = id === active
          return (
            <Hit key={id} label={t(PARTS[id].title)} active={on} onPick={() => onPick(id)}>
              <rect x="540" y={y} width="200" height="28" rx="6" fill={on ? 'var(--gold-bg)' : 'var(--card)'} stroke={on ? 'var(--gold)' : 'var(--line)'} />
              <text x="640" y={y + 18} textAnchor="middle" fill={on ? 'var(--text)' : 'var(--text-2)'} fontSize="12" fontWeight={on ? 700 : 400}>
                {t(PARTS[id].title)}
              </text>
            </Hit>
          )
        })}
      </svg>
      <figcaption>{t(INSIDE_CAP)}</figcaption>
    </figure>
  )
}

/* ---------- 封装流程 ---------- */

function Label({ x, y, text, anchor = 'start', color = 'var(--text-2)' }: { x: number; y: number; text: string; anchor?: 'start' | 'middle' | 'end'; color?: string }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize="11">
      {text}
    </text>
  )
}

export function FlowFig({ step }: { step: number }) {
  const { t } = useLocale()
  let scene: ReactNode
  if (step === 0) {
    scene = (
      <g>
        <rect x="180" y="126" width="400" height="42" fill="none" stroke="var(--line-2)" strokeDasharray="4 3" />
        <rect x="180" y="154" width="400" height="14" fill="var(--fig-box-2)" stroke="var(--text-2)" />
        <rect x="180" y="168" width="400" height="6" fill="var(--blue-bg)" stroke="var(--blue)" strokeWidth="0.6" />
        <rect x="300" y="110" width="160" height="44" rx="4" fill={METAL} stroke="var(--text-2)" />
        {[312, 336, 360, 384, 408, 432].map((x) => (
          <line key={x} x1={x} y1="150" x2={x + 12} y2="154" stroke="var(--text-2)" />
        ))}
        <rect x="372" y="40" width="16" height="70" fill="var(--line-2)" />
        <path d="M352 56 a28 8 0 1 0 56 0" fill="none" stroke="var(--blue)" strokeWidth="1.4" />
        <path d="M408 56 l-6 -2 M408 56 l-3 -5" stroke="var(--blue)" strokeWidth="1.4" />
        <Label x={468} y={108} text={t(FLOW_LABEL.wheel)} />
        <Label x={590} y={140} text={t(FLOW_LABEL.before)} color="var(--muted)" />
        <Label x={590} y={164} text={t(FLOW_LABEL.after)} />
        <Label x={170} y={175} text={t(FLOW_LABEL.tape)} anchor="end" color="var(--blue)" />
      </g>
    )
  } else if (step === 1) {
    scene = (
      <g>
        <rect x="110" y="160" width="34" height="14" fill="var(--text-2)" />
        <rect x="616" y="160" width="34" height="14" fill="var(--text-2)" />
        <rect x="110" y="174" width="540" height="5" fill="var(--blue-bg)" stroke="var(--blue)" strokeWidth="0.6" />
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={182 + i * 50} y="160" width={i === 7 ? 44 : 46} height="14" fill="var(--fig-box-2)" stroke="var(--text-2)" strokeWidth="0.8" />
        ))}
        <rect x="378" y="70" width="4" height="102" fill={METAL} stroke="var(--text-2)" strokeWidth="0.6" />
        <rect x="366" y="54" width="28" height="40" rx="3" fill="var(--line-2)" />
        <path d="M398 120 h40 M430 114 l8 6 l-8 6" fill="none" stroke="var(--muted)" strokeWidth="1.4" />
        <Label x={400} y={70} text={t(FLOW_LABEL.blade)} />
        <Label x={104} y={156} text={t(FLOW_LABEL.frame)} anchor="end" />
      </g>
    )
  } else {
    const dx = 110
    scene = (
      <g>
        <WireBga dx={dx} show={{ wire: step >= 3, mold: step >= 4, ball: step >= 5 }} />
        {step === 2 ? (
          <g>
            <rect x="372" y="50" width="16" height="74" fill="var(--line-2)" />
            <path d="M360 124 H400 L392 134 H368 Z" fill="var(--line-2)" />
            <path d="M380 30 V46 M375 40 L380 46 L385 40" fill="none" stroke="var(--blue)" strokeWidth="1.5" />
            <Label x={396} y={80} text={t(FLOW_LABEL.collet)} />
          </g>
        ) : null}
        {step === 6 ? (
          <g>
            <line x1="380" y1="20" x2="380" y2="78" stroke="var(--red)" strokeWidth="2" />
            <line x1="380" y1="20" x2="380" y2="78" stroke="var(--red)" strokeWidth="6" opacity="0.2" />
            {[330, 344, 358, 372, 386, 400, 414].map((x) => (
              <rect key={x} x={x} y="80" width="8" height="3" fill="var(--text)" />
            ))}
            <Label x={392} y={40} text={t(FLOW_LABEL.laser)} color="var(--red)" />
          </g>
        ) : null}
        {step === 7 ? (
          <g>
            <rect x="236" y="42" width="288" height="36" rx="4" fill="var(--line-2)" />
            <path d="M380 18 V36 M374 30 L380 36 L386 30" fill="none" stroke="var(--blue)" strokeWidth="1.5" />
            <rect x="170" y="206" width="420" height="30" fill="var(--panel-2)" stroke="var(--line-2)" />
            {Array.from({ length: 10 }, (_, i) => {
              const x = 200 + i * 40
              return <path key={i} d={`M${x} 206 v4 l-3 3 l6 3 l-6 3 l6 3 l-3 3 v8`} fill="none" stroke="var(--gold)" strokeWidth="1.2" />
            })}
            <Label x={530} y={64} text={t(FLOW_LABEL.pusher)} />
            <Label x={596} y={226} text={t(FLOW_LABEL.socket)} />
          </g>
        ) : null}
      </g>
    )
  }
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 244" className="term-fig__svg" role="img" aria-label={t(FLOW_LABEL.cap)}>
        <rect width="760" height="244" rx="10" fill="var(--well)" />
        {scene}
      </svg>
      <figcaption>{t(FLOW_LABEL.cap)}</figcaption>
    </figure>
  )
}

/* ---------- CP vs FT ---------- */

export function CpFtFig({ active, onPick }: { active: StageId; onPick: (id: StageId) => void }) {
  const { t } = useLocale()
  const panel = (id: StageId, x: number) => {
    const on = active === id
    const item = CPFT.find((c) => c.id === id) ?? CPFT[0]
    return (
      <Hit label={t(item.title)} active={on} onPick={() => onPick(id)}>
        <rect x={x} y="10" width="360" height="232" rx="8" fill={on ? 'var(--gold-bg)' : 'var(--card)'} stroke={on ? 'var(--gold)' : 'var(--line)'} strokeWidth={on ? 2 : 1} />
        <text x={x + 180} y="32" textAnchor="middle" fill={on ? 'var(--gold)' : 'var(--text)'} fontSize="13" fontWeight="700">
          {t(item.title)}
        </text>
      </Hit>
    )
  }
  const needles = [
    [120, 160],
    [136, 168],
    [152, 176],
    [260, 220],
    [244, 212],
    [228, 204],
  ]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 252" className="term-fig__svg" role="group" aria-label={t(L.cpftCap)}>
        <rect width="760" height="252" rx="10" fill="var(--well)" />
        {panel('cp', 10)}
        {panel('ft', 390)}
        <g pointerEvents="none">
          {/* CP */}
          <rect x="50" y="64" width="280" height="14" rx="2" fill="var(--green-bg)" stroke="var(--green-line)" />
          <rect x="150" y="64" width="80" height="14" fill="var(--card)" stroke="var(--green-line)" />
          {needles.map(([x0, x1]) => (
            <path key={x0} d={`M${x0} 78 L${(x0 + x1) / 2} 130 L${x1} 178`} fill="none" stroke="var(--gold)" strokeWidth="1.2" />
          ))}
          <rect x="70" y="178" width="240" height="10" fill="var(--fig-box-2)" stroke="var(--text-2)" />
          {[160, 168, 176, 204, 212, 220].map((x) => (
            <rect key={x} x={x - 3} y="176" width="6" height="2" fill={METAL} />
          ))}
          <rect x="60" y="188" width="260" height="20" rx="2" fill="var(--panel-2)" stroke="var(--line-2)" />
          <Label x={190} y={56} text={t(CPFT_LABEL.probeCard)} anchor="middle" />
          <Label x={104} y={132} text={t(CPFT_LABEL.needle)} anchor="end" color="var(--gold)" />
          <Label x={320} y={174} text={t(CPFT_LABEL.wafer)} anchor="end" />
          <Label x={190} y={226} text={t(CPFT_LABEL.chuck)} anchor="middle" color="var(--muted)" />

          {/* FT */}
          <rect x="520" y="78" width="100" height="40" rx="3" fill="var(--line-2)" />
          <path d="M570 46 V70 M564 64 L570 70 L576 64" fill="none" stroke="var(--blue)" strokeWidth="1.5" />
          <rect x="524" y="120" width="92" height="16" rx="1" fill={BODY} stroke="var(--text-2)" />
          <rect x="520" y="136" width="100" height="6" fill="var(--green-bg)" stroke="var(--green-line)" />
          {Array.from({ length: 8 }, (_, i) => (
            <circle key={i} cx={528 + i * 12} cy="146" r="4" fill={METAL} stroke="var(--text-2)" strokeWidth="0.5" />
          ))}
          <rect x="500" y="150" width="140" height="36" fill="var(--panel-2)" stroke="var(--line-2)" />
          {Array.from({ length: 8 }, (_, i) => {
            const x = 528 + i * 12
            return <path key={i} d={`M${x} 150 v4 l-2 3 l4 3 l-2 3 l2 3 l-4 3 l2 3 v14`} fill="none" stroke="var(--gold)" strokeWidth="1" />
          })}
          <rect x="430" y="186" width="280" height="18" fill="var(--green-bg)" stroke="var(--green-line)" />
          <Label x={630} y={102} text={t(CPFT_LABEL.pusher)} />
          <Label x={514} y={132} text={t(CPFT_LABEL.part)} anchor="end" />
          <Label x={494} y={172} text={t(CPFT_LABEL.pogo)} anchor="end" color="var(--gold)" />
          <Label x={646} y={172} text="Socket" />
          <Label x={570} y={226} text={t(CPFT_LABEL.loadboard)} anchor="middle" color="var(--muted)" />
        </g>
      </svg>
      <figcaption>{t(L.cpftCap)}</figcaption>
    </figure>
  )
}
