import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { AppsSvg, Cap, Dot, Gnd, Mos, Res, T, Tag, W, mosPin, type FigProps } from './AppsFigs'
import { fmtT } from './data/mosApps'
import { RISE_K, VDD_OD, odRise } from './data/mosAppsOd'

const LABEL_OD = loc('开漏输出与上拉电阻电路图和上升波形', 'Schematic of open-drain outputs with a pull-up, and the rising waveform')
const CAP_OD = loc('金色实线是线电压；被拉低时，虚线表示释放后的上升过程。上拉 Rp 和线电容 Cb 决定上升时间。示意图，参数为示意值。', 'The solid gold trace is the line voltage; when held low, the dashed curve is the rise after release. Pull-up Rp and line capacitance Cb set the rise time. Illustration with illustrative parameters.')

const X0 = 470
const X1 = 730
const Y0 = 230
const Y1 = 50
const px = (frac: number) => X0 + frac * (X1 - X0)
const py = (v: number) => Y0 - (v / 3.5) * (Y0 - Y1)

/** (e) 开漏输出：两个开漏 NMOS 并在一条线上，一个上拉电阻，右边是线电压波形 */
export function OdFig({ num, fault, out }: FigProps) {
  const { t } = useLocale()
  const hot = new Set(out.hot)
  const a = { x: 100, y: 185 }
  const b = { x: 370, y: 185 }
  const ga = mosPin(a, 'g')
  const gb = mosPin(b, 'g')
  const lowNow = hot.has('drA') || hot.has('drB')
  const noPu = fault === 'noPullup'
  const rc = num.rp * 1e3 * num.cb * 1e-12
  const tmax = 6 * rc
  const n = 60
  const rise = Array.from({ length: n + 1 }, (_, k) => {
    const f = k / n
    return `${k === 0 ? 'M' : 'L'}${px(f).toFixed(1)} ${py(VDD_OD * (1 - Math.exp(-(f * tmax) / rc))).toFixed(1)}`
  }).join(' ')
  const f10 = Math.log(1 / 0.9) * rc / tmax
  const f90 = Math.log(10) * rc / tmax
  return (
    <AppsSvg h={290} label={LABEL_OD} caption={CAP_OD}>
      <path d="M130 40 H260" stroke="var(--text-2)" strokeWidth="2" />
      <T x={130} y={30} anchor="start" size={11} color="var(--text)">{`+${VDD_OD} V`}</T>
      <W d="M200 40 V69" id="pu" hot={hot} />
      <W d="M200 101 V130" id="pu" hot={hot} />
      <W d="M110 130 H380" id="line" hot={hot} />
      <W d="M110 130 V155" id="drA" hot={hot} />
      <W d="M380 130 V155" id="drB" hot={hot} />
      <W d="M275 130 V166" />
      <W d="M275 174 V210" />
      <W d={`M${ga[0]} ${ga[1]} H52`} id="gA" hot={hot} sig />
      <W d={`M${gb[0]} ${gb[1]} H322`} id="gB" hot={hot} sig />
      <Dot x={200} y={130} />
      <Dot x={275} y={130} />
      <Res x={200} y={85} on={hot.has('pu')} missing={noPu} />
      <Cap x={275} y={170} />
      <Mos kind="n" x={a.x} y={a.y} noDiode on={hot.has('drA')} />
      <Mos kind="n" x={b.x} y={b.y} noDiode on={hot.has('drB')} />
      <Gnd x={110} y={215} />
      <Gnd x={380} y={215} />
      <Gnd x={275} y={210} />
      <T x={46} y={189} anchor="end" size={11} color="var(--text)" bold>A</T>
      <T x={318} y={189} anchor="end" size={11} color="var(--text)" bold>B</T>
      <T x={110} y={252} size={10}>{t(loc('开漏输出 A', 'Open-drain A'))}</T>
      <T x={380} y={252} size={10}>{t(loc('开漏输出 B', 'Open-drain B'))}</T>
      <T x={216} y={89} anchor="start" size={10} mono>{`Rp ${num.rp} kΩ`}</T>
      <T x={262} y={174} anchor="end" size={10} mono>{`Cb ${num.cb} pF`}</T>
      <Tag x={330} y={120} anchor="middle" text={`Vline ${out.tags.vl}`} bad={out.tone === 'bad'} />
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="var(--line-2)" />
      <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="var(--line-2)" />
      <line x1={X0} y1={py(VDD_OD)} x2={X1} y2={py(VDD_OD)} stroke="var(--muted)" strokeDasharray="5 4" />
      <T x={X1} y={py(VDD_OD) - 6} anchor="end" size={10} mono color="var(--muted)">{`${VDD_OD} V`}</T>
      <T x={X0} y={Y1 - 14} anchor="start" size={11} color="var(--muted)">{t(loc('线电压', 'Line voltage'))}</T>
      <T x={X0} y={Y0 + 16} size={10} mono color="var(--dim)">0</T>
      <T x={X1} y={Y0 + 16} anchor="end" size={10} mono color="var(--dim)">{fmtT(tmax)}</T>
      {noPu ? (
        <g>
          {lowNow ? null : <path d={`M${X0} ${py(1.6)} H${X1}`} stroke="var(--red)" strokeWidth="2.4" strokeDasharray="6 5" />}
          {lowNow ? null : <T x={px(0.5)} y={py(1.6) - 8} size={12} color="var(--red)" bold>?</T>}
          {lowNow ? <path d={`M${X0} ${py(0.05)} H${X1}`} stroke="var(--gold)" strokeWidth="2.4" /> : null}
        </g>
      ) : (
        <g>
          {lowNow ? <path d={rise} fill="none" stroke="var(--muted)" strokeWidth="1.8" strokeDasharray="5 4" /> : <path d={rise} fill="none" stroke="var(--gold)" strokeWidth="2.4" />}
          {lowNow ? <path d={`M${X0} ${py(0.05)} H${X1}`} stroke="var(--gold)" strokeWidth="2.4" /> : null}
          {lowNow ? <T x={(X0 + X1) / 2} y={py(0.05) - 8} size={10} color="var(--gold)">{t(loc('被拉低', 'Held low'))}</T> : null}
          <circle cx={px(f10)} cy={py(0.1 * VDD_OD)} r="3.5" fill="var(--blue)" />
          <circle cx={px(f90)} cy={py(0.9 * VDD_OD)} r="3.5" fill="var(--blue)" />
          <T x={px(f10) + 8} y={py(0.1 * VDD_OD) + 16} anchor="start" size={10} mono color="var(--blue)">10 %</T>
          <T x={px(f90) + 8} y={py(0.9 * VDD_OD) + 16} anchor="start" size={10} mono color="var(--blue)">90 %</T>
          <T x={X1} y={Y0 - 10} anchor="end" size={10} mono color="var(--blue)">{`tr ${fmtT(odRise(num))}`}</T>
        </g>
      )}
      <T x={X1} y={Y0 - 24} anchor="end" size={9} mono color="var(--dim)">{`RC ln9 = ${RISE_K.toFixed(2)} RC`}</T>
    </AppsSvg>
  )
}
