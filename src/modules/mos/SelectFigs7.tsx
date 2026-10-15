import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { type CaseId } from './data/mosSelectFlow'
import { SUPPLY } from './data/mosSelectParts'
import { powerLimit } from './data/mosSelectSoa'
import { T } from './SelectFigs'
import { FlybackCaseFig, FloatCaseFig, Frame, LogicCaseFig } from './SelectFigs6'

/* ---------- 4. Vgs 超限 ---------- */
const VG = {
  cap: loc(
    '示意：不同来源的电压直接加到栅极上，和管子的 ±Vgs 上限比。绿色在两种上限内，金色只在 ±20 V 的管子里安全，红色超过任何常见上限。',
    'Illustrative: voltages from different sources applied straight to the gate, against the part’s ±Vgs limit. Green is inside both limits, gold is safe only for ±20 V parts, red exceeds any common limit.',
  ),
  lim12: loc('±12 V 管子的上限', 'limit of ±12 V parts'),
  lim20: loc('±20 V 管子的上限', 'limit of ±20 V parts'),
  note: loc('超过上限：栅氧击穿，永久短路', 'Beyond the limit: the gate oxide breaks down, a permanent short'),
}
const VROWS: Array<{ v: number; label: ReturnType<typeof loc> }> = [
  { v: 3.3, label: loc('MCU 输出 3.3 V', 'MCU output 3.3 V') },
  { v: 5, label: loc('5 V 逻辑信号', '5 V logic signal') },
  { v: 12, label: loc('12 V 电源直连', '12 V rail direct') },
  { v: 24, label: loc('24 V 工业信号', '24 V industrial signal') },
]
const GX0 = 210
const GX1 = 730
const gx = (v: number) => GX0 + (v / 30) * (GX1 - GX0)

function VgsCaseFig() {
  const { t } = useLocale()
  return (
    <Frame cap={VG.cap} h={232}>
      <rect x={gx(20)} y={40} width={GX1 - gx(20)} height={146} fill="var(--red)" fillOpacity="0.1" />
      {[0, 10, 20, 30].map((v) => (
        <T key={v} x={gx(v)} y={202} size={10} color="var(--dim)" mono>
          {`${v} V`}
        </T>
      ))}
      <line x1={GX0} y1={186} x2={GX1} y2={186} stroke="var(--line-2)" />
      <line x1={gx(12)} y1={40} x2={gx(12)} y2={186} stroke="var(--gold)" strokeWidth="2" strokeDasharray="5 4" />
      <line x1={gx(20)} y1={40} x2={gx(20)} y2={186} stroke="var(--red)" strokeWidth="2" strokeDasharray="5 4" />
      <T x={gx(12)} y={30} size={10} color="var(--gold)">
        {t(VG.lim12)}
      </T>
      <T x={gx(20)} y={30} size={10} color="var(--red)">
        {t(VG.lim20)}
      </T>
      {VROWS.map((r, k) => {
        const y = 52 + k * 34
        const color = r.v <= 12 ? 'var(--green)' : r.v <= 20 ? 'var(--gold)' : 'var(--red)'
        return (
          <g key={r.v}>
            <T x={16} y={y + 14} anchor="start" size={11} color="var(--text)">
              {t(r.label)}
            </T>
            <rect x={GX0} y={y} width={gx(r.v) - GX0} height="20" rx="3" fill={color} fillOpacity="0.6" />
            <T x={gx(r.v) + 6} y={y + 14} anchor="start" size={11} color={color} mono>
              {`${r.v} V`}
            </T>
          </g>
        )
      })}
      <T x={GX1} y={224} anchor="end" size={10.5} color="var(--red)">
        {t(VG.note)}
      </T>
    </Frame>
  )
}

/* ---------- 5. 热插拔浪涌超出 SOA ---------- */
const SO = {
  cap: loc(
    '示意：热插拔时输入电容被充电，电流和 Vds 一起按指数衰减，功率 P = Vds × Id 的峰值远高于 SOA 的 10 ms 功率线。这里把 10 ms 线当作保守的上限。',
    'Illustrative: during hot-plug the input capacitor charges, current and Vds decay exponentially together, and the peak power P = Vds × Id is far above the 10 ms power line of the SOA. The 10 ms line is used here as a conservative ceiling.',
  ),
  beyond: loc('超出 SOA', 'beyond the SOA'),
  axisX: loc('时间 (ms)', 'Time (ms)'),
}
const I_PEAK = 20
const TAU = 5
const SX0 = 70
const SX1 = 730
const SY0 = 190
const SY1 = 36
const sx = (ms: number) => SX0 + (ms / 20) * (SX1 - SX0)
const sy = (w: number) => SY0 - (w / 260) * (SY0 - SY1)
const pAt = (ms: number) => SUPPLY * I_PEAK * Math.exp((-2 * ms) / TAU)

function SoaCaseFig() {
  const { t } = useLocale()
  const p0 = SUPPLY * I_PEAK
  const lim10 = powerLimit(0.01)
  const limDc = powerLimit(Infinity)
  const tStar = (TAU / 2) * Math.log(p0 / lim10)
  let curve = ''
  let over = `M${sx(0)} ${sy(lim10).toFixed(1)} `
  for (let k = 0; k <= 200; k += 1) {
    const ms = (k / 200) * 20
    const pt = `${sx(ms).toFixed(1)} ${sy(pAt(ms)).toFixed(1)}`
    curve += `${k === 0 ? 'M' : 'L'}${pt} `
    if (ms <= tStar) {
      over += `L${pt} `
    }
  }
  over += `L${sx(tStar).toFixed(1)} ${sy(lim10).toFixed(1)} Z`
  return (
    <Frame cap={SO.cap} h={232}>
      {[0, 100, 200].map((w) => (
        <g key={w}>
          <line x1={SX0} y1={sy(w)} x2={SX1} y2={sy(w)} stroke="var(--line-3)" strokeOpacity="0.6" />
          <T x={SX0 - 8} y={sy(w) + 4} anchor="end" size={10} color="var(--dim)" mono>
            {`${w}`}
          </T>
        </g>
      ))}
      {[0, 5, 10, 15, 20].map((ms) => (
        <T key={ms} x={sx(ms)} y={SY0 + 16} size={10} color="var(--dim)" mono>
          {`${ms}`}
        </T>
      ))}
      <path d={over} fill="var(--red)" fillOpacity="0.25" />
      <line x1={SX0} y1={sy(lim10)} x2={SX1} y2={sy(lim10)} stroke="var(--gold)" strokeWidth="2" strokeDasharray="6 4" />
      <line x1={SX0} y1={sy(limDc)} x2={SX1} y2={sy(limDc)} stroke="var(--muted)" strokeDasharray="6 4" />
      <path d={curve} fill="none" stroke="var(--red)" strokeWidth="2.4" />
      <T x={96} y={46} anchor="start" size={10.5} color="var(--red)">
        {t(loc(`峰值 ${SUPPLY} V × ${I_PEAK} A = ${p0} W`, `peak ${SUPPLY} V × ${I_PEAK} A = ${p0} W`))}
      </T>
      <T x={sx(tStar) + 12} y={118} anchor="start" size={10.5} color="var(--red)">
        {t(SO.beyond)}
      </T>
      <T x={SX1 - 6} y={sy(lim10) - 6} anchor="end" size={10.5} color="var(--gold)">
        {t(loc(`10 ms 功率线 ${Math.round(lim10)} W（SOA）`, `10 ms power line: ${Math.round(lim10)} W (SOA)`))}
      </T>
      <T x={SX1 - 6} y={sy(limDc) + 14} anchor="end" size={10.5} color="var(--muted)">
        {t(loc(`直流 ${Math.round(limDc)} W`, `DC ${Math.round(limDc)} W`))}
      </T>
      <T x={SX1} y={SY0 + 36} anchor="end" size={10} color="var(--muted)">
        {t(SO.axisX)}
      </T>
      <T x={SX0} y={SY1 - 12} anchor="start" size={11} color="var(--muted)">
        P (W)
      </T>
    </Frame>
  )
}

export function CaseFig({ id }: { id: CaseId }) {
  if (id === 'logic') {
    return <LogicCaseFig />
  }
  if (id === 'float') {
    return <FloatCaseFig />
  }
  if (id === 'flyback') {
    return <FlybackCaseFig />
  }
  if (id === 'vgsmax') {
    return <VgsCaseFig />
  }
  return <SoaCaseFig />
}
