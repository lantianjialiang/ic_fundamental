import { useMemo, type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { PASS_LABEL, RDS_LABEL, RDS_VGS_CURVES } from './data/mosSwitch'
import { BOARD, condLoss, passCurve, passInputLevel, passTarget, passVgsEnd, rdsOn, type PassDev, type PassInput } from './data/mosSwitchModel'
export function T({ x, y, children, anchor = 'middle', color = 'var(--text-2)', size = 11, bold = false, mono = false }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; color?: string; size?: number; bold?: boolean; mono?: boolean }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontWeight={bold ? 700 : 400} fontFamily={mono ? 'var(--mono)' : undefined}>
      {children}
    </text>
  )
}

/**
 * MOS 符号，局部坐标：栅极在左，漏极在上 (22,-30)，源极在下 (22,30)。
 * NMOS 箭头指向沟道，PMOS 箭头背离沟道且栅极带小圆圈。
 * orient = 'h' 时转成栅极在上、漏左源右（镜像），漏端 (-30,22)，源端 (30,22)，栅端 (0,-30)。
 * flip 上下翻转（仅 'v'）：源极在上、漏极在下，PMOS 高边开关用。
 */
export function MosSym({ kind, x, y, orient = 'v', flip = false, color = 'var(--text)' }: { kind: 'n' | 'p'; x: number; y: number; orient?: 'v' | 'h'; flip?: boolean; color?: string }) {
  const tf = orient === 'v' ? `translate(${x} ${y})${flip ? ' scale(1 -1)' : ''}` : `translate(${x} ${y}) scale(-1 1) rotate(90)`
  const p = kind === 'p'
  return (
    <g transform={tf} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={p ? 'M-30 0 H-15' : 'M-30 0 H-8'} />
      {p ? <circle cx="-11.5" cy="0" r="3.5" /> : null}
      <path d="M-8 -14 V14" />
      <path d="M0 -14 V-8 M0 -3 V3 M0 8 V14" />
      <path d="M0 -11 H22 V-30 M0 11 H22 V30 M0 0 H22 V11" />
      <path d={p ? 'M3 -4 L10 0 L3 4' : 'M9 -4 L1 0 L9 4'} />
    </g>
  )
}

export function Led({ x, y, lit }: { x: number; y: number; lit: boolean }) {
  return (
    <g>
      {lit ? <circle cx={x} cy={y} r="24" fill="var(--red)" opacity="0.28" /> : null}
      <path d={`M${x - 10} ${y - 9} H${x + 10} L${x} ${y + 9} Z`} fill={lit ? 'var(--red)' : 'var(--card)'} stroke="var(--text)" strokeWidth="2" strokeLinejoin="round" />
      <path d={`M${x - 10} ${y + 9} H${x + 10}`} stroke="var(--text)" strokeWidth="2.5" />
      <g stroke={lit ? 'var(--gold)' : 'var(--dim)'} strokeWidth="1.6" fill="none" strokeLinecap="round">
        <path d={`M${x + 14} ${y - 4} L${x + 22} ${y - 12} M${x + 17} ${y - 12} H${x + 22} V${y - 7}`} />
        <path d={`M${x + 18} ${y + 3} L${x + 26} ${y - 5} M${x + 21} ${y - 5} H${x + 26} V${y}`} />
      </g>
    </g>
  )
}

export function Gnd({ x, y, color = 'var(--text-2)' }: { x: number; y: number; color?: string }) {
  return <path d={`M${x - 12} ${y} H${x + 12} M${x - 7} ${y + 6} H${x + 7} M${x - 2.5} ${y + 12} H${x + 2.5}`} stroke={color} strokeWidth="2" strokeLinecap="round" />
}

const GX0 = 410
const GX1 = 735
const GY0 = 235
const GY1 = 40
const gy = (v: number) => GY0 - (v / 3.5) * (GY0 - GY1)

export function PassFig({ dev, input, cPf }: { dev: PassDev; input: PassInput; cPf: number }) {
  const { t } = useLocale()
  const curve = useMemo(() => passCurve(dev, input, cPf), [dev, input, cPf])
  const target = passTarget(dev, input)
  const vin = passInputLevel(input)
  const good = Math.abs(target - vin) < 0.005
  const color = good ? 'var(--green)' : 'var(--red)'
  const px = (tn: number) => GX0 + (tn / curve.tMax) * (GX1 - GX0)
  const pts = curve.t.map((tn, k) => `${k === 0 ? 'M' : 'L'}${px(tn).toFixed(1)} ${gy(curve.v[k]).toFixed(1)}`).join(' ')
  const ticksX = [0, 1, 2, 3, 4, 5].map((k) => (curve.tMax * k) / 5)
  const xEnd = px(curve.t[curve.t.length - 1])
  const yEnd = gy(curve.v[curve.v.length - 1])
  const settleX = curve.tSettle === null ? null : px(curve.tSettle)
  const settleText = `${t(PASS_LABEL.settled)} ${curve.tSettle === null ? '' : curve.tSettle.toFixed(1)} ns`
  const sameLevel = Math.abs(vin - target) < 0.005
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 290" className="term-fig__svg" role="img" aria-label={t(PASS_LABEL.cap)}>
        <rect width="760" height="290" rx="10" fill="var(--well)" />
        <rect x="10" y="10" width="340" height="272" rx="8" fill="var(--card)" stroke="var(--line)" />
        <g stroke="var(--text-2)" strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M50 152 H120 M180 152 H250 M250 152 V192 M250 200 V222 M150 100 V78 M138 78 H162" />
          <path d="M238 192 H262 M238 200 H262" stroke="var(--text)" strokeWidth="3" />
        </g>
        <circle cx="50" cy="152" r="3.5" fill="var(--text)" />
        <circle cx="250" cy="152" r="3.5" fill="var(--text)" />
        <MosSym kind={dev} x={150} y={130} orient="h" />
        <Gnd x={250} y={222} />
        <T x={150} y={66} color="var(--text)">
          {t(dev === 'n' ? PASS_LABEL.gateVdd : PASS_LABEL.gateGnd)}
        </T>
        <T x={30} y={138} anchor="start" color="var(--text)">
          {`${t(PASS_LABEL.vin)} ${vin.toFixed(2)} V`}
        </T>
        <T x={250} y={138} color="var(--text)">
          {t(PASS_LABEL.outNode)}
        </T>
        <T x={272} y={200} anchor="start" color="var(--text)" size={12}>
          C
        </T>
        <T x={175} y={250} size={15} bold color={color}>
          {`${dev === 'n' ? 'NMOS' : 'PMOS'} ${input === 'high' ? '1' : '0'}: ${t(good ? PASS_LABEL.good : PASS_LABEL.weak)}`}
        </T>
        <T x={175} y={270} color="var(--muted)">
          {`${t(PASS_LABEL.vgs)} = ${passVgsEnd(dev, input).toFixed(2)} V`}
        </T>
        {[0, 1, 2, 3].map((v) => (
          <g key={v}>
            <line x1={GX0} y1={gy(v)} x2={GX1} y2={gy(v)} stroke="var(--line-3)" strokeOpacity="0.5" />
            <T x={GX0 - 8} y={gy(v) + 4} anchor="end" size={10} color="var(--dim)" mono>
              {`${v}`}
            </T>
          </g>
        ))}
        {ticksX.map((tn) => (
          <T key={tn} x={px(tn)} y={GY0 + 16} size={10} color="var(--dim)" mono>
            {`${+tn.toFixed(1)}`}
          </T>
        ))}
        <line x1={GX0} y1={GY0} x2={GX1} y2={GY0} stroke="var(--line-2)" />
        <line x1={GX0} y1={GY0} x2={GX0} y2={GY1} stroke="var(--line-2)" />
        {sameLevel ? null : <line x1={GX0} y1={gy(vin)} x2={GX1} y2={gy(vin)} stroke="var(--muted)" strokeDasharray="5 4" />}
        <line x1={GX0} y1={gy(target)} x2={GX1} y2={gy(target)} stroke={color} strokeDasharray="2 4" strokeWidth="1.6" />
        {sameLevel ? null : (
          <T x={GX1} y={gy(vin) + (vin > target ? -6 : 14)} anchor="end" size={10} color="var(--muted)" mono>
            {`${t(PASS_LABEL.vin)} ${vin.toFixed(2)} V`}
          </T>
        )}
        <T x={GX1} y={gy(target) + (vin > target || sameLevel ? -6 : 14)} anchor="end" size={10} color={color} mono>
          {`${sameLevel ? `${t(PASS_LABEL.vin)} = ` : ''}${target.toFixed(2)} V`}
        </T>
        <T x={GX0} y={GY1 - 14} anchor="start" size={11} color="var(--muted)">
          {t(PASS_LABEL.vout)}
        </T>
        <T x={GX1} y={GY0 + 34} anchor="end" size={11} color="var(--muted)">
          {t(PASS_LABEL.time)}
        </T>
        {settleX === null ? null : (
          <g>
            <line x1={settleX} y1={GY0} x2={settleX} y2={GY1 + 8} stroke="var(--line-3)" strokeDasharray="3 3" />
            <T x={GX0} y={GY0 + 34} anchor="start" size={11} color="var(--muted)">
              {settleText}
            </T>
          </g>
        )}
        <path d={pts} fill="none" stroke="var(--gold)" strokeWidth="2.4" />
        <circle cx={xEnd} cy={yEnd} r="3.5" fill="var(--gold)" />
      </svg>
      <figcaption>{t(PASS_LABEL.cap)}</figcaption>
    </figure>
  )
}

const RX0 = 90
const RX1 = 640
const RY0 = 235
const RY1 = 36
const I_MAX = 10
const P_MAX = 9
const rpx = (i: number) => RX0 + (i / I_MAX) * (RX1 - RX0)
const rpy = (p: number) => RY0 - (p / P_MAX) * (RY0 - RY1)

function lossPath(vgs: number) {
  const r = rdsOn(vgs)
  return Array.from({ length: 51 }, (_, k) => {
    const i = (k / 50) * I_MAX
    return `${k === 0 ? 'M' : 'L'}${rpx(i).toFixed(1)} ${rpy(Math.min(condLoss(i, r), P_MAX)).toFixed(1)}`
  }).join(' ')
}

export function RdsFig({ id, vgs }: { id: number; vgs: number }) {
  const { t } = useLocale()
  const on = vgs > BOARD.vth
  const p = on ? condLoss(id, rdsOn(vgs)) : 0
  const dotX = rpx(id)
  const dotY = rpy(Math.min(p, P_MAX))
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 270" className="term-fig__svg" role="img" aria-label={t(RDS_LABEL.cap)}>
        <rect width="760" height="270" rx="10" fill="var(--well)" />
        {[0, 3, 6, 9].map((w) => (
          <g key={w}>
            <line x1={RX0} y1={rpy(w)} x2={RX1} y2={rpy(w)} stroke="var(--line-3)" strokeOpacity="0.5" />
            <T x={RX0 - 8} y={rpy(w) + 4} anchor="end" size={10} color="var(--dim)" mono>
              {`${w}`}
            </T>
          </g>
        ))}
        {[0, 2, 4, 6, 8, 10].map((a) => (
          <T key={a} x={rpx(a)} y={RY0 + 16} size={10} color="var(--dim)" mono>
            {`${a}`}
          </T>
        ))}
        <line x1={RX0} y1={RY0} x2={RX1} y2={RY0} stroke="var(--line-2)" />
        <line x1={RX0} y1={RY0} x2={RX0} y2={RY1} stroke="var(--line-2)" />
        <T x={RX0} y={RY1 - 12} anchor="start" size={11} color="var(--muted)">
          {t(RDS_LABEL.power)}
        </T>
        <T x={RX1} y={RY0 + 34} anchor="end" size={11} color="var(--muted)">
          {t(RDS_LABEL.current)}
        </T>
        {RDS_VGS_CURVES.map((v) => (
          <g key={v}>
            <path d={lossPath(v)} fill="none" stroke="var(--blue)" strokeWidth="1.4" strokeOpacity="0.55" />
            <T x={RX1 + 8} y={rpy(Math.min(condLoss(I_MAX, rdsOn(v)), P_MAX)) + 4} anchor="start" size={10} color="var(--blue)" mono>
              {`${v} V`}
            </T>
          </g>
        ))}
        {on ? (
          <g>
            <path d={lossPath(vgs)} fill="none" stroke="var(--gold)" strokeWidth="2.8" />
            <circle cx={dotX} cy={dotY} r="5" fill="var(--gold)" />
            <T x={dotX - 10} y={dotY - 10} anchor={dotX < RX0 + 90 ? 'start' : 'end'} size={11} color="var(--gold)" mono>
              {`${vgs} V: ${p.toFixed(2)} W`}
            </T>
          </g>
        ) : (
          <T x={(RX0 + RX1) / 2} y={(RY0 + RY1) / 2} size={13} color="var(--red)">
            {t(RDS_LABEL.cutoff)}
          </T>
        )}
      </svg>
      <figcaption>{t(RDS_LABEL.cap)}</figcaption>
    </figure>
  )
}