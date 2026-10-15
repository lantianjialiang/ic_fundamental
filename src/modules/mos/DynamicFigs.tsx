import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Hit } from '../prep/common'
import { DS, QG_LABEL, type CapId, type DsId } from './data/mosDynamic'
import { calcEdge, CDS, CGD, CGS, ILOAD, VDD_P, VPL, VTH, waveAt, type DynParams } from './dynamicModel'

export function T({ x, y, children, anchor = 'middle', color = 'var(--text-2)', size = 11, bold = false, mono = false }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; color?: string; size?: number; bold?: boolean; mono?: boolean }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontWeight={bold ? 700 : 400} fontFamily={mono ? 'var(--mono)' : undefined}>
      {children}
    </text>
  )
}

export const fmtPf = (farad: number) => `${(farad * 1e12).toFixed(0)} pF`

/** 秒 → ps / ns / µs 的读数 */
export function fmtTime(sec: number) {
  const a = Math.abs(sec)
  if (a < 1e-9) {
    return `${(sec * 1e12).toFixed(0)} ps`
  }
  if (a < 1e-6) {
    const ns = sec * 1e9
    return `${ns < 10 ? ns.toFixed(2) : ns.toFixed(1)} ns`
  }
  return `${(sec * 1e6).toFixed(2)} µs`
}

export function fmtEnergy(joule: number) {
  const a = Math.abs(joule)
  if (a < 1e-6) {
    return `${(joule * 1e9).toFixed(0)} nJ`
  }
  return `${(joule * 1e6).toFixed(2)} µJ`
}

export function fmtPower(watt: number) {
  return watt < 1 ? `${(watt * 1000).toFixed(0)} mW` : `${watt.toFixed(2)} W`
}

const CAP_VALUE: Record<CapId, number> = { cgs: CGS, cgd: CGD, cds: CDS }
export const DS_VALUE: Record<DsId, number> = { ciss: CGS + CGD, coss: CDS + CGD, crss: CGD }

const DS_COND = {
  ciss: loc('测量：漏源交流短路', 'Measured: D-S AC-shorted'),
  coss: loc('测量：栅源交流短路', 'Measured: G-S AC-shorted'),
  crss: loc('测量：只剩栅漏之间的 Cgd', 'Measured: only Cgd between G and D'),
}

const CAP_LABEL = {
  head: loc('数据手册参数', 'Datasheet parameters'),
  cap: loc('NMOS 符号上的三个寄生电容：Cgs 在栅源之间，Cgd 在栅漏之间，Cds 在漏源之间（和体二极管的结电容并联）。金色的是当前所选数据手册参数用到的电容。', 'The three parasitic capacitors on the NMOS symbol: Cgs between gate and source, Cgd between gate and drain, Cds between drain and source (in parallel with the body diode’s junction). Gold ones are used by the selected datasheet parameter.'),
}

function CapPart({ x, y, on, label, value, side }: { x: number; y: number; on: boolean; label: string; value: string; side: 'l' | 'r' }) {
  const c = on ? 'var(--gold)' : 'var(--muted)'
  const w = on ? 2.6 : 1.8
  const tx = side === 'r' ? x + 18 : x - 18
  return (
    <g>
      <g stroke={c} strokeWidth={w} strokeLinecap="round">
        <path d={`M${x - 14} ${y - 4} H${x + 14}`} />
        <path d={`M${x - 14} ${y + 4} H${x + 14}`} />
      </g>
      <T x={tx} y={y - 2} anchor={side === 'r' ? 'start' : 'end'} size={12} bold color={c}>
        {label}
      </T>
      <T x={tx} y={y + 12} anchor={side === 'r' ? 'start' : 'end'} size={10} color={c} mono>
        {value}
      </T>
    </g>
  )
}

export function CapFig({ active, onPick }: { active: DsId; onPick: (id: DsId) => void }) {
  const { t } = useLocale()
  const item = DS.find((d) => d.id === active) ?? DS[0]
  const on = (id: CapId) => item.caps.includes(id)
  const wire = { stroke: 'var(--text-2)', strokeWidth: 2, fill: 'none' }
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 280" className="term-fig__svg" role="img" aria-label={t(CAP_LABEL.cap)}>
        <rect width="760" height="280" rx="10" fill="var(--well)" />
        <rect x="10" y="10" width="450" height="260" rx="8" fill="var(--card)" stroke="var(--line)" />
        <g {...wire}>
          <path d="M70 140 H262" />
          <path d="M110 140 V98 M110 90 V50 H420 V136 M420 144 V230 H110 V190 M110 182 V140" />
          <path d="M300 50 V114 H274 M274 166 H300 V230" />
          <path d="M274 140 H300 V166" />
        </g>
        <g stroke="var(--text)" strokeWidth="2.6" strokeLinecap="round" fill="none">
          <path d="M262 108 V172" />
          <path d="M274 104 V124 M274 130 V150 M274 156 V176" />
          <path d="M282 135 L274 140 L282 145" strokeWidth="2" />
        </g>
        <circle cx="110" cy="140" r="3.5" fill="var(--text)" />
        <circle cx="300" cy="50" r="3.5" fill="var(--text)" />
        <circle cx="300" cy="230" r="3.5" fill="var(--text)" />
        <T x={64} y={144} anchor="end" size={13} bold color="var(--text)">
          G
        </T>
        <T x={300} y={38} size={13} bold color="var(--text)">
          D
        </T>
        <T x={300} y={252} size={13} bold color="var(--text)">
          S
        </T>
        <CapPart x={110} y={94} on={on('cgd')} label="Cgd" value={fmtPf(CAP_VALUE.cgd)} side="r" />
        <CapPart x={110} y={186} on={on('cgs')} label="Cgs" value={fmtPf(CAP_VALUE.cgs)} side="r" />
        <CapPart x={420} y={140} on={on('cds')} label="Cds" value={fmtPf(CAP_VALUE.cds)} side="l" />
        <T x={480} y={34} anchor="start" size={11} color="var(--muted)">
          {t(CAP_LABEL.head)}
        </T>
        {DS.map((d, i) => {
          const y = 46 + i * 72
          const sel = d.id === active
          return (
            <Hit key={d.id} label={`${d.name} = ${d.formula}`} active={sel} onPick={() => onPick(d.id)}>
              <rect x="480" y={y} width="260" height="62" rx="8" fill={sel ? 'var(--card)' : 'var(--well)'} stroke={sel ? 'var(--gold)' : 'var(--line)'} strokeWidth={sel ? 2 : 1} />
              <T x={494} y={y + 26} anchor="start" size={13} bold color={sel ? 'var(--gold)' : 'var(--text)'} mono>
                {`${d.name} = ${d.formula}`}
              </T>
              <T x={726} y={y + 26} anchor="end" size={13} color="var(--text)" mono>
                {fmtPf(DS_VALUE[d.id])}
              </T>
              <T x={494} y={y + 47} anchor="start" size={10} color="var(--muted)">
                {t(DS_COND[d.id])}
              </T>
            </Hit>
          )
        })}
      </svg>
      <figcaption>{t(CAP_LABEL.cap)}</figcaption>
    </figure>
  )
}

/* ---------- 开通四个区间 ---------- */

const DEF: DynParams = { rg: 10, cx: 100e-12, vdrive: 10 }
const PX0 = 60
const PX1 = 730
const PY0 = 250
const PY1 = 40
const BAND = (PX1 - PX0) / 4
const yV = (v: number) => PY0 - (v / VDD_P) * (PY0 - PY1)
const yI = (i: number) => PY0 - (i / (ILOAD * 1.35)) * (PY0 - PY1)
const BAND_LABELS = ['t0–t1', 't1–t2', 't2–t3', 't3–t4']

function curve(pick: (w: ReturnType<typeof waveAt>) => number, yOf: (v: number) => number) {
  const c = calcEdge(DEF, 'on')
  const bounds = [0, ...c.marks]
  const parts: string[] = []
  for (let b = 0; b < 4; b += 1) {
    for (let k = 0; k <= 40; k += 1) {
      const frac = k / 40
      const w = waveAt(c, bounds[b] + frac * (bounds[b + 1] - bounds[b]))
      const x = PX0 + (b + frac) * BAND
      parts.push(`${parts.length === 0 ? 'M' : 'L'}${x.toFixed(1)} ${Math.max(PY1 - 6, yOf(pick(w))).toFixed(1)}`)
    }
  }
  return parts.join(' ')
}

export function TurnOnFig({ step }: { step: number }) {
  const { t } = useLocale()
  const legend = [
    { color: '#f5d442', label: QG_LABEL.gate },
    { color: '#38d6e8', label: QG_LABEL.drain },
    { color: '#ff5fd2', label: QG_LABEL.cur },
  ]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 320" className="term-fig__svg" role="img" aria-label={t(QG_LABEL.capTurn)}>
        <rect width="760" height="320" rx="10" fill="var(--well)" />
        <rect x={PX0 + step * BAND} y={PY1 - 8} width={BAND} height={PY0 - PY1 + 8} fill="var(--gold)" fillOpacity="0.14" />
        {BAND_LABELS.map((label, i) => (
          <T key={label} x={PX0 + (i + 0.5) * BAND} y={28} size={12} bold={i === step} color={i === step ? 'var(--gold)' : 'var(--muted)'} mono>
            {label}
          </T>
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line x1={PX0 + i * BAND} y1={PY1 - 8} x2={PX0 + i * BAND} y2={PY0} stroke="var(--line-3)" strokeDasharray="3 4" />
            <T x={PX0 + i * BAND} y={PY0 + 16} size={10} color="var(--dim)" mono>
              {`t${i}`}
            </T>
          </g>
        ))}
        <line x1={PX0} y1={PY0} x2={PX1} y2={PY0} stroke="var(--line-2)" />
        <line x1={PX0} y1={PY0} x2={PX0} y2={PY1 - 8} stroke="var(--line-2)" />
        <line x1={PX0} y1={yV(VPL)} x2={PX1} y2={yV(VPL)} stroke="var(--muted)" strokeDasharray="5 4" strokeOpacity="0.7" />
        <line x1={PX0} y1={yV(VTH)} x2={PX1} y2={yV(VTH)} stroke="var(--muted)" strokeDasharray="2 4" strokeOpacity="0.7" />
        <T x={PX0 - 6} y={yV(VPL) - 2} anchor="end" size={10} color="var(--muted)" mono>
          Vpl
        </T>
        <T x={PX0 - 6} y={yV(VTH) + 9} anchor="end" size={10} color="var(--muted)" mono>
          Vth
        </T>
        <T x={PX0 - 6} y={yV(VDD_P) + 4} anchor="end" size={10} color="var(--muted)" mono>
          VDD
        </T>
        <line x1={PX0} y1={yI(ILOAD)} x2={PX1} y2={yI(ILOAD)} stroke="#ff5fd2" strokeDasharray="2 4" strokeOpacity="0.5" />
        <T x={PX1 + 6} y={yI(ILOAD) + 4} anchor="start" size={10} color="#ff5fd2" mono>
          {`${ILOAD} A`}
        </T>
        <path d={curve((w) => w.vds, yV)} fill="none" stroke="#38d6e8" strokeWidth="2.2" />
        <path d={curve((w) => w.id, yI)} fill="none" stroke="#ff5fd2" strokeWidth="2.2" />
        <path d={curve((w) => w.vgs, yV)} fill="none" stroke="#f5d442" strokeWidth="2.6" />
        <T x={PX0 + 2 * BAND + 10} y={yV(VPL) - 22} anchor="start" size={11} bold color="#f5d442">
          {t(QG_LABEL.plateau)}
        </T>
        {legend.map((item, i) => (
          <g key={item.color}>
            <line x1={PX0 + i * 230} y1={296} x2={PX0 + i * 230 + 24} y2={296} stroke={item.color} strokeWidth="3" />
            <T x={PX0 + i * 230 + 32} y={300} anchor="start" size={11} color="var(--text-2)">
              {t(item.label)}
            </T>
          </g>
        ))}
        <T x={PX1} y={PY0 + 34} anchor="end" size={10} color="var(--muted)">
          {t(QG_LABEL.time)}
        </T>
      </svg>
      <figcaption>{t(QG_LABEL.capTurn)}</figcaption>
    </figure>
  )
}
