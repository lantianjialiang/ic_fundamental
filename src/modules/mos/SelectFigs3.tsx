import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { type Part } from './data/mosSelectParts'
import { T } from './SelectFigs'

/** Vgs(th) 的测试电流 A */
export const ID_TEST = 250e-6

/**
 * 示意转移特性：Vgs ≤ Vth 按 90 mV/dec 的亚阈值斜率下降，高于 Vth 按平方律上升；
 * k 由手册里最低 Vgs 的 Rds(on) 反推。没有考虑 Vds 和沟道长度调制，只用来比较量级。
 */
export function idTransfer(part: Part, vgs: number, vth: number): number {
  const spec = part.rds[0]
  const k = 1 / ((spec.mohm / 1000) * (spec.vgs - part.vth.typ))
  if (vgs <= vth) {
    return ID_TEST * Math.pow(10, (vgs - vth) / 0.09)
  }
  return ID_TEST + (k / 2) * (vgs - vth) * (vgs - vth)
}

const TR = {
  cap: loc(
    '示意转移特性（对数纵轴）：Vgs(th) 对应的只是 250 µA，离安培级电流还差几伏。虚线是 Vth 取最大值的最差批次。',
    'Illustrative transfer curve (log vertical axis): Vgs(th) only corresponds to 250 µA, still volts away from amps of current. The dashed curve is the worst batch with Vth at its maximum.',
  ),
  test: loc('250 µA：测 Vgs(th) 的电流', '250 µA: the current Vgs(th) is measured at'),
  load: loc('2 A 负载电流', '2 A load current'),
  band: loc('Vgs(th) 最小到最大', 'Vgs(th) min to max'),
  legend: loc('实线：典型 Vth；虚线：最大 Vth', 'solid: typical Vth; dashed: max Vth'),
  drive: loc('驱动', 'Drive'),
  axisX: loc('栅源电压 Vgs (V)', 'Gate-source voltage Vgs (V)'),
}

const X0 = 70
const X1 = 730
const Y0 = 290
const Y1 = 30
const VMAX = 12
const rx = (v: number) => X0 + (v / VMAX) * (X1 - X0)
const ry = (i: number) => Y0 - ((Math.log10(i) + 6) / 8) * (Y0 - Y1)
const YT = [
  [1e-6, '1 µA'],
  [1e-5, '10 µA'],
  [1e-4, '100 µA'],
  [1e-3, '1 mA'],
  [1e-2, '10 mA'],
  [1e-1, '100 mA'],
  [1, '1 A'],
  [10, '10 A'],
  [100, '100 A'],
] as const

function curve(part: Part, vth: number) {
  let d = ''
  for (let k = 0; k <= 240; k += 1) {
    const v = (k / 240) * VMAX
    d += `${k === 0 ? 'M' : 'L'}${rx(v).toFixed(1)} ${ry(Math.max(1e-9, Math.min(idTransfer(part, v, vth), 1e3))).toFixed(1)} `
  }
  return d
}

export function TransferFig({ part, vdrive }: { part: Part; vdrive: number }) {
  const { t } = useLocale()
  const dots = [
    { vth: part.vth.typ, color: 'var(--green)' },
    { vth: part.vth.max, color: 'var(--red)' },
  ]
  const clipId = 'mosSelectTransferClip'
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 332" className="term-fig__svg" role="img" aria-label={t(TR.cap)}>
        <defs>
          <clipPath id={clipId}>
            <rect x={X0} y={Y1} width={X1 - X0} height={Y0 - Y1} />
          </clipPath>
        </defs>
        <rect width="760" height="332" rx="10" fill="var(--well)" />
        {YT.map(([i, label]) => (
          <g key={label}>
            <line x1={X0} y1={ry(i)} x2={X1} y2={ry(i)} stroke="var(--line-3)" strokeOpacity="0.6" />
            <T x={X0 - 8} y={ry(i) + 4} anchor="end" size={10} color="var(--dim)" mono>
              {label}
            </T>
          </g>
        ))}
        {[0, 2, 4, 6, 8, 10, 12].map((v) => (
          <T key={v} x={rx(v)} y={Y0 + 16} size={10} color="var(--dim)" mono>
            {`${v}`}
          </T>
        ))}
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="var(--line-2)" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="var(--line-2)" />
        <rect x={rx(part.vth.min)} y={Y1} width={rx(part.vth.max) - rx(part.vth.min)} height={Y0 - Y1} fill="var(--gold)" fillOpacity="0.12" />
        <T x={(rx(part.vth.min) + rx(part.vth.max)) / 2} y={Y1 + 14} size={10} color="var(--gold)">
          {t(TR.band)}
        </T>
        <T x={X1} y={22} anchor="end" size={10} color="var(--muted)">
          {t(TR.legend)}
        </T>
        <line x1={X0} y1={ry(ID_TEST)} x2={X1} y2={ry(ID_TEST)} stroke="var(--gold)" strokeDasharray="5 4" />
        <T x={X1 - 6} y={ry(ID_TEST) + 14} anchor="end" size={10} color="var(--gold)">
          {t(TR.test)}
        </T>
        <line x1={X0} y1={ry(2)} x2={X1} y2={ry(2)} stroke="var(--blue)" strokeDasharray="5 4" />
        <T x={X0 + 6} y={ry(2) - 6} anchor="start" size={10} color="var(--blue)">
          {t(TR.load)}
        </T>
        <g clipPath={`url(#${clipId})`} fill="none" strokeWidth="2.4">
          <path d={curve(part, part.vth.typ)} stroke="var(--green)" />
          <path d={curve(part, part.vth.max)} stroke="var(--red)" strokeDasharray="6 4" />
        </g>
        <line x1={rx(vdrive)} y1={Y1} x2={rx(vdrive)} y2={Y0} stroke="var(--text-2)" strokeWidth="1.5" />
        {dots.map((d) => {
          const i = idTransfer(part, vdrive, d.vth)
          return i >= 1e-6 && i <= 100 ? <circle key={d.vth} cx={rx(vdrive)} cy={ry(i)} r="4.5" fill={d.color} /> : null
        })}
        <T x={rx(vdrive) + 5} y={Y0 - 6} anchor="start" size={10} color="var(--text-2)" mono>
          {`${t(TR.drive)} ${vdrive} V`}
        </T>
        <T x={X1} y={Y0 + 34} anchor="end" size={11} color="var(--muted)">
          {t(TR.axisX)}
        </T>
        <T x={X0} y={Y1 - 12} anchor="start" size={11} color="var(--muted)">
          Id (A)
        </T>
      </svg>
      <figcaption>{t(TR.cap)}</figcaption>
    </figure>
  )
}
