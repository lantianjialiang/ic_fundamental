import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { S2 } from './data/mosGatesTg'
import { Draw, DIM, HI_UP, T } from './GatesNet'
import { nm, par, pm, type Sig } from './gatesModel'
import { KN, KP, VDD, VTN, VTP, rOn } from './model'

const TG_NET = par(nm('C'), pm('nC'))

/** 传输门的两只管子在 Vin 下的导通电阻：NMOS 栅极 VDD、源极 Vin；PMOS 栅极 0、源极 Vin */
export function tgRon(vin: number) {
  const rn = rOn(VDD - vin, KN, VTN)
  const rp = rOn(vin, KP, -VTP)
  const total = 1 / (1 / rn + 1 / rp)
  return { rn, rp, total }
}

const TG_CAP = loc(
  '左：传输门电路，NMOS 栅极接 C，PMOS 栅极接 ¬C，上端 IN、下端 OUT。右：按教学模型（VDD 3.3 V，KN = KP = 2 mA/V²，忽略体效应）算出的导通电阻随 Vin 的变化，虚线标出 |Vtp| 和 VDD − Vtn，圆点是当前 Vin。',
  'Left: the transmission-gate circuit, NMOS gate on C, PMOS gate on ¬C, IN at the top and OUT at the bottom. Right: on-resistance against Vin from the teaching model (VDD 3.3 V, KN = KP = 2 mA/V², body effect ignored); dashed lines mark |Vtp| and VDD − Vtn, and the dot is the present Vin.',
)

const X0 = 330
const X1 = 720
const CY0 = 200
const CY1 = 64
const YMAX = 500
const px = (v: number) => X0 + (v / VDD) * (X1 - X0)
const py = (r: number) => CY0 - (Math.min(r, YMAX) / YMAX) * (CY0 - CY1)

function curve(pick: (v: number) => number) {
  let d = ''
  let pen = false
  for (let k = 0; k <= 165; k += 1) {
    const v = (k / 165) * VDD
    const r = pick(v)
    if (Number.isFinite(r) && r <= YMAX) {
      d += `${pen ? 'L' : 'M'}${px(v).toFixed(1)} ${py(r).toFixed(1)} `
      pen = true
    } else {
      pen = false
    }
  }
  return d
}

export function TgFig({ en, vin }: { en: boolean; vin: number }) {
  const { t } = useLocale()
  const sig: Sig = { C: en ? 1 : 0, nC: en ? 0 : 1 }
  const now = tgRon(vin)
  const mark = en ? vin : 0
  const ticksY = [0, 100, 200, 300, 400, 500]
  const ticksX = [0, 1, 2, 3]
  const lines = [
    { x: X0, label: S2.legendN, color: 'var(--blue)', dash: '6 4' },
    { x: X0 + 78, label: S2.legendP, color: 'var(--red)', dash: '6 4' },
    { x: X0 + 156, label: S2.legendT, color: 'var(--gold)', dash: undefined },
  ]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 740 290" className="term-fig__svg" role="img" aria-label={t(TG_CAP)}>
        <rect width="740" height="290" rx="10" fill="var(--well)" />
        <rect x="10" y="10" width="280" height="270" rx="8" fill="var(--card)" stroke="var(--line)" />
        <T x={150} y={32} size={12} color="var(--text)" bold mono>
          {`IN = ${vin.toFixed(2)} V`}
        </T>
        <path d="M150 40 V70" stroke={en ? HI_UP : DIM} strokeWidth={en ? 3.5 : 2} />
        <Draw net={TG_NET} x={30} y={70} live={en} hl={HI_UP} sig={sig} onT={t(S2.on)} offT={t(S2.off)} />
        <path d="M150 134 V166" stroke={en ? HI_UP : DIM} strokeWidth={en ? 3.5 : 2} />
        <T x={150} y={188} size={12} color={en ? 'var(--text)' : 'var(--muted)'} bold mono>
          {en ? `OUT = ${vin.toFixed(2)} V` : 'OUT = Z'}
        </T>
        <T x={150} y={240} size={11} color="var(--muted)">
          {t(en ? loc('C = 1：OUT 跟随 IN', 'C = 1: OUT follows IN') : loc('C = 0：OUT 与 IN 断开', 'C = 0: OUT is cut off from IN'))}
        </T>
        <T x={X0} y={24} anchor="start" size={12} color="var(--text)" bold>
          {t(S2.chartTitle)}
        </T>
        {lines.map((item) => (
          <g key={item.x}>
            <line x1={item.x} y1={42} x2={item.x + 18} y2={42} stroke={item.color} strokeWidth={item.dash ? 2 : 3} strokeDasharray={item.dash} />
            <T x={item.x + 24} y={46} anchor="start" size={11} color="var(--text-2)">
              {t(item.label)}
            </T>
          </g>
        ))}
        {ticksY.map((r) => (
          <g key={r}>
            <line x1={X0} y1={py(r)} x2={X1} y2={py(r)} stroke="var(--line-3)" strokeOpacity="0.5" />
            <T x={X0 - 8} y={py(r) + 4} anchor="end" size={10} color="var(--dim)" mono>
              {`${r}`}
            </T>
          </g>
        ))}
        {ticksX.map((v) => (
          <T key={v} x={px(v)} y={CY0 + 14} size={10} color="var(--dim)" mono>
            {`${v}`}
          </T>
        ))}
        {[
          { v: -VTP, label: '|Vtp|' },
          { v: VDD - VTN, label: 'VDD−Vtn' },
        ].map((m) => (
          <g key={m.label}>
            <line x1={px(m.v)} y1={CY1} x2={px(m.v)} y2={CY0} stroke="var(--muted)" strokeDasharray="3 3" />
            <T x={px(m.v)} y={CY1 - 5} size={10} color="var(--muted)" mono>
              {m.label}
            </T>
          </g>
        ))}
        <line x1={X0} y1={CY0} x2={X1} y2={CY0} stroke="var(--line-2)" />
        <path d={curve((v) => rOn(VDD - v, KN, VTN))} fill="none" stroke="var(--blue)" strokeWidth="2" strokeDasharray="6 4" />
        <path d={curve((v) => rOn(v, KP, -VTP))} fill="none" stroke="var(--red)" strokeWidth="2" strokeDasharray="6 4" />
        <path d={curve((v) => tgRon(v).total)} fill="none" stroke="var(--gold)" strokeWidth="3" />
        {en ? (
          <g>
            <line x1={px(mark)} y1={CY1} x2={px(mark)} y2={CY0} stroke="var(--gold)" strokeWidth="1.5" strokeOpacity="0.8" />
            <circle cx={px(mark)} cy={py(now.total)} r={5} fill="var(--gold)" stroke="var(--card)" strokeWidth="1.5" />
          </g>
        ) : null}
        <rect x={px(0)} y={CY0 + 22} width={px(VDD - VTN) - px(0)} height={12} rx={3} fill="var(--blue)" fillOpacity="0.28" stroke="var(--blue)" />
        <T x={px(0) + 6} y={CY0 + 32} anchor="start" size={10} color="var(--text)">
          {t(S2.nBand)}
        </T>
        <rect x={px(-VTP)} y={CY0 + 40} width={px(VDD) - px(-VTP)} height={12} rx={3} fill="var(--red)" fillOpacity="0.25" stroke="var(--red)" />
        <T x={px(-VTP) + 6} y={CY0 + 50} anchor="start" size={10} color="var(--text)">
          {t(S2.pBand)}
        </T>
        <T x={X1} y={CY0 + 74} anchor="end" size={11} color="var(--muted)">
          Vin (V)
        </T>
      </svg>
      <figcaption>{t(TG_CAP)}</figcaption>
    </figure>
  )
}
