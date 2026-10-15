import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { AppsSvg, Cap, Dot, Gnd, Mos, Res, T, Tag, W, mosPin, type FigProps } from './AppsFigs'
import { fmtA, fmtT } from './data/mosApps'
import { I_LIMIT, softRunOf } from './data/mosAppsSoft'
import { VIN_SOFT } from './data/mosAppsSoftModel'

const LABEL_SOFT = loc('热插拔与软启动电路图', 'Schematic of the hot-swap soft-start circuit')
const CAP_SOFT = loc('栅源电容 Cg 经 Rg 充电，决定 Vsg 上升多快；电源和线缆的串联电阻没有画出。示意图，参数为示意值。', 'The gate-source capacitor Cg charges through Rg and sets how fast Vsg rises; the series resistance of supply and cable is not drawn. Illustration with illustrative parameters.')
const LABEL_WAVE = loc('软启动的 Vsg、输出电压和涌入电流随时间变化的曲线', 'Curves of Vsg, output voltage and inrush current against time during soft start')
const CAP_WAVE = loc('曲线由平方律 PMOS 模型逐步积分算出，不含米勒反馈，只是一阶近似。', 'The curves come from step-by-step integration of a square-law PMOS model without Miller feedback, a first-order approximation.')

/** (g) 软启动：PMOS 高边开关，栅源之间有 Cg，Rg 从栅极接到 NMOS 使能管 */
export function SoftFig({ fault, out }: FigProps) {
  const hot = new Set(out.hot)
  const q1 = { x: 400, y: 150 }
  const q2 = { x: 330, y: 260 }
  const gate = mosPin(q1, 'g')
  const g2 = mosPin(q2, 'g')
  return (
    <AppsSvg h={330} label={LABEL_SOFT} caption={CAP_SOFT}>
      <W d="M200 50 H410 V120" id="vin" hot={hot} />
      <T x={200} y={40} anchor="start" size={11} color="var(--text)">{`+${VIN_SOFT} V`}</T>
      <Dot x={290} y={50} />
      <Dot x={340} y={50} />
      <W d="M290 50 V69" id="gdrv" hot={hot} />
      <W d="M290 101 V150 H340" id="gdrv" hot={hot} />
      <W d="M340 50 V81" id="gdrv" hot={hot} />
      <W d="M340 89 V150" id="gdrv" hot={hot} />
      <W d="M340 150 V174" id="gdrv" hot={hot} />
      <W d="M340 206 V230" id="gdrv" hot={hot} />
      <W d={`M340 150 H${gate[0]}`} />
      <Dot x={340} y={150} />
      <W d="M410 180 V220 H560" id="out" hot={hot} />
      <W d="M560 220 V251" id="out" hot={hot} />
      <W d="M560 259 V300" id="cl" hot={hot} />
      <W d={`M180 260 H${g2[0]}`} id="sig" hot={hot} sig />
      <Res x={290} y={85} />
      <Cap x={340} y={85} missing={fault === 'noRc'} />
      <Res x={340} y={190} on={hot.has('gdrv')} />
      <Cap x={560} y={255} />
      <Mos kind="p" x={q1.x} y={q1.y} on={hot.has('ch')} />
      <Mos kind="n" x={q2.x} y={q2.y} on={hot.has('q2')} />
      <Gnd x={340} y={290} />
      <Gnd x={560} y={300} />
      <rect x="110" y="235" width="70" height="50" rx="6" fill="var(--card)" stroke="var(--text-2)" strokeWidth="2" />
      <T x={145} y={266} size={12} color="var(--text)" bold>EN</T>
      <Tag x={145} y={302} anchor="middle" text={out.tags.en} />
      <T x={274} y={89} anchor="end" size={10} mono>Rgs 10 MΩ</T>
      <T x={356} y={88} anchor="start" size={10} mono>Cg</T>
      <T x={324} y={194} anchor="end" size={10} mono>Rg</T>
      <T x={450} y={155} anchor="start" size={10}>Q1 PMOS</T>
      <T x={376} y={266} anchor="start" size={10}>Q2 NMOS</T>
      <T x={578} y={259} anchor="start" size={10} mono>Cload</T>
      <Tag x={332} y={166} anchor="end" text={`Vsg ${out.tags.vsg}`} />
      <Tag x={460} y={212} anchor="middle" text={`Vout ${out.tags.vout}`} />
    </AppsSvg>
  )
}

const LX0 = 70
const LX1 = 360
const RX0 = 450
const RX1 = 730
const PY0 = 200
const PY1 = 50

/** 软启动曲线：左边 Vsg 与 Vout，右边涌入电流；时间轴相同 */
export function SoftWaveFig({ num, fault }: Pick<FigProps, 'num' | 'fault'>) {
  const { t } = useLocale()
  const run = softRunOf(num, fault)
  const kEnd = run.t.findIndex((x) => x > run.tView)
  const last = kEnd < 0 ? run.t.length - 1 : kEnd
  const step = Math.max(Math.ceil(last / 150), 1)
  const idx: number[] = []
  for (let k = 0; k <= last; k += step) {
    idx.push(k)
  }
  const ymaxI = Math.max(run.ipeak * 1.15, I_LIMIT * 1.2)
  const vx = (k: number) => LX0 + (run.t[k] / run.tView) * (LX1 - LX0)
  const vy = (v: number) => PY0 - (v / 13) * (PY0 - PY1)
  const ix = (k: number) => RX0 + (run.t[k] / run.tView) * (RX1 - RX0)
  const iy = (a: number) => PY0 - (a / ymaxI) * (PY0 - PY1)
  const line = (xf: (k: number) => number, yf: (k: number) => number, data: number[]) => idx.map((k, n) => `${n === 0 ? 'M' : 'L'}${xf(k).toFixed(1)} ${yf(data[k]).toFixed(1)}`).join(' ')
  const kPeak = run.i.indexOf(Math.max(...run.i.slice(0, last + 1)))
  const peakX = Math.max(Math.min(ix(kPeak), RX1), RX0 + 70)
  return (
    <AppsSvg h={260} label={LABEL_WAVE} caption={CAP_WAVE}>
      <line x1={LX0} y1={PY0} x2={LX1} y2={PY0} stroke="var(--line-2)" />
      <line x1={LX0} y1={PY0} x2={LX0} y2={PY1} stroke="var(--line-2)" />
      <line x1={RX0} y1={PY0} x2={RX1} y2={PY0} stroke="var(--line-2)" />
      <line x1={RX0} y1={PY0} x2={RX0} y2={PY1} stroke="var(--line-2)" />
      {[0, 4, 8, 12].map((v) => (
        <g key={v}>
          <line x1={LX0} y1={vy(v)} x2={LX1} y2={vy(v)} stroke="var(--line-3)" strokeOpacity="0.5" />
          <T x={LX0 - 8} y={vy(v) + 4} anchor="end" size={10} mono color="var(--dim)">{`${v}`}</T>
        </g>
      ))}
      <line x1={RX0} y1={iy(I_LIMIT)} x2={RX1} y2={iy(I_LIMIT)} stroke="var(--muted)" strokeDasharray="5 4" />
      <T x={RX1} y={iy(I_LIMIT) - 6} anchor="end" size={10} mono color="var(--muted)">{`${t(loc('上限', 'limit'))} ${I_LIMIT} A`}</T>
      <T x={RX0 - 8} y={PY1 + 4} anchor="end" size={10} mono color="var(--dim)">{fmtA(ymaxI)}</T>
      <T x={RX0 - 8} y={PY0 + 4} anchor="end" size={10} mono color="var(--dim)">0</T>
      <T x={LX0} y={PY1 - 20} anchor="start" size={11} color="var(--muted)">{t(loc('电压 (V)', 'Voltage (V)'))}</T>
      <T x={RX0} y={PY1 - 20} anchor="start" size={11} color="var(--muted)">{t(loc('涌入电流', 'Inrush current'))}</T>
      <T x={LX0} y={PY0 + 18} anchor="start" size={10} mono color="var(--dim)">0</T>
      <T x={LX1} y={PY0 + 18} anchor="end" size={10} mono color="var(--dim)">{fmtT(run.tView)}</T>
      <T x={RX0} y={PY0 + 18} anchor="start" size={10} mono color="var(--dim)">0</T>
      <T x={RX1} y={PY0 + 18} anchor="end" size={10} mono color="var(--dim)">{fmtT(run.tView)}</T>
      <T x={LX1} y={PY1 - 6} anchor="end" size={10} mono color="var(--gold)">Vout</T>
      <T x={LX1 - 50} y={PY1 - 6} anchor="end" size={10} mono color="var(--blue)">Vsg</T>
      <path d={line(vx, vy, run.vsg)} fill="none" stroke="var(--blue)" strokeWidth="2" />
      <path d={line(vx, vy, run.vout)} fill="none" stroke="var(--gold)" strokeWidth="2.4" />
      <path d={line(ix, iy, run.i)} fill="none" stroke="var(--red)" strokeWidth="2.4" />
      <circle cx={ix(kPeak)} cy={iy(run.ipeak)} r="3.5" fill="var(--red)" />
      <T x={peakX} y={iy(run.ipeak) - 10} anchor="end" size={10} mono color="var(--red)">{fmtA(run.ipeak)}</T>
    </AppsSvg>
  )
}
