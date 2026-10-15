import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { AppsSvg, Dio, Dot, Gnd, Mos, Res, T, Tag, W, mosPin, type FigProps } from './AppsFigs'
import { V_HV, V_LV } from './data/mosAppsI2c'
import { VZ } from './data/mosAppsRevPol'

const LABEL_REV = loc('PMOS 防反接电路图', 'Schematic of the PMOS reverse-polarity protection')
const LABEL_I2C = loc('单管 I2C 电平转换电路图', 'Schematic of the single-transistor I2C level shifter')
const CAP_I2C = loc('VL 是 3.3 V 侧电压，VH 是 5 V 侧电压，Vgs 是栅源电压；示意图，参数为示意值。', 'VL is the 3.3 V-side voltage, VH the 5 V-side voltage and Vgs the gate-source voltage; illustration with illustrative parameters.')
const CAP_REV = loc('电池符号：长线是正极，短粗线是负极。示意图，参数为示意值。', 'Battery symbol: the long plate is plus and the short thick plate is minus. Illustration with illustrative parameters.')

/** 电池：正接时长线在上；反接时上下对调 */
export function Battery({ x, y, reversed }: { x: number; y: number; reversed: boolean }) {
  const longY = reversed ? y + 7 : y - 7
  const shortY = reversed ? y - 7 : y + 7
  return (
    <g>
      <path d={`M${x - 14} ${longY} H${x + 14}`} stroke="var(--text)" strokeWidth="2.5" strokeLinecap="round" />
      <path d={`M${x - 8} ${shortY} H${x + 8}`} stroke="var(--text)" strokeWidth="5" strokeLinecap="round" />
      <T x={x + 22} y={longY + 4} anchor="start" size={12} color="var(--text)" bold>+</T>
      <T x={x + 22} y={shortY + 4} anchor="start" size={12} color="var(--text)" bold>−</T>
    </g>
  )
}

/** (c) PMOS 防反接：漏极接电池，源极接负载，栅极经 Rg 接地，Zener 在栅源之间 */
export function RevPolFig({ sel, fault, out }: FigProps) {
  const hot = new Set(out.hot)
  const reversedBat = sel.pol === 'reversed'
  const partBack = fault === 'pmosReversed'
  // 正确装法：漏极在上（接电池），符号上下翻转；装反时源极在上
  const q = { x: 470, y: 150, flip: !partBack }
  const gate = mosPin(q, 'g')
  return (
    <AppsSvg h={320} label={LABEL_REV} caption={CAP_REV}>
      <W d="M140 110 V50 H480 V120" id="bat" hot={hot} />
      <W d="M480 180 V210 H600 V219" id="src" hot={hot} />
      <W d="M600 251 V290 H140 V124" id="gnd" hot={hot} />
      <W d={`M${gate[0]} ${gate[1]} H410 V234`} />
      <W d="M410 266 V290" />
      <W d="M410 210 H439" />
      <W d="M451 210 H480" />
      <Dot x={410} y={150} />
      <Dot x={410} y={210} />
      <Dot x={480} y={210} />
      <Dot x={410} y={290} />
      <Battery x={140} y={117} reversed={reversedBat} />
      <Res x={410} y={250} />
      <Res x={600} y={235} on={hot.has('load')} />
      <Dio x={445} y={210} kind="z" missing={fault === 'noZener'} />
      <Mos kind="p" x={q.x} y={q.y} flip={q.flip} on={hot.has('ch')} dio={hot.has('dio')} />
      <Gnd x={370} y={290} />
      <W d="M370 290 H410" />
      <T x={118} y={102} anchor="end" size={10}>Vbat</T>
      <Tag x={118} y={118} anchor="end" text={out.tags.vbat} />
      <T x={426} y={254} anchor="start" size={10} mono>Rg 100 kΩ</T>
      <T x={445} y={196} size={10} mono>{`Dz ${VZ} V`}</T>
      <T x={516} y={155} anchor="start" size={10}>Q1 PMOS</T>
      <Tag x={396} y={144} anchor="end" text={`Vsg ${out.tags.vsg}`} bad={out.tone === 'bad'} />
      <Tag x={492} y={230} text={`Vs ${out.tags.vs}`} bad={out.tone === 'bad'} />
      <T x={616} y={254} anchor="start" size={10} mono>RL 6 Ω</T>
    </AppsSvg>
  )
}

/** (d) 单管 I2C 电平转换：栅极 3.3 V，源极在 3.3 V 侧，漏极在 5 V 侧 */
export function I2cFig({ fault, out }: FigProps) {
  const { t } = useLocale()
  const hot = new Set(out.hot)
  const bad = out.tone === 'bad'
  const q = { x: 380, y: 150, rot: 90 as const }
  const dl = { x: 70, y: 200, scale: 0.7 }
  const dh = { x: 700, y: 200, scale: 0.7 }
  const gl = mosPin(dl, 'g')
  const gh = mosPin(dh, 'g')
  return (
    <AppsSvg h={290} label={LABEL_I2C} caption={CAP_I2C}>
      <path d="M130 60 H380 M440 60 H620" stroke="var(--text-2)" strokeWidth="2" />
      <T x={130} y={50} anchor="start" size={11} color="var(--text)">{`+${V_LV} V`}</T>
      <T x={440} y={50} anchor="start" size={11} color="var(--text)">{`+${V_HV} V`}</T>
      <W d="M380 60 V120" />
      <Dot x={380} y={60} />
      <W d="M250 60 V84" id="puL" hot={hot} />
      <W d="M250 116 V160" id="puL" hot={hot} />
      <W d="M540 60 V84" id="puH" hot={hot} />
      <W d="M540 116 V160" id="puH" hot={hot} />
      <W d="M77 160 H350" id="lv" hot={hot} />
      <W d="M410 160 H707" id="hv" hot={hot} />
      <W d="M77 160 V179" id="drL" hot={hot} />
      <W d="M707 160 V179" id="drH" hot={hot} />
      <W d={`M${gl[0]} ${gl[1]} H34`} id="drL" hot={hot} sig />
      <W d={`M${gh[0]} ${gh[1]} H664`} id="drH" hot={hot} sig />
      <W d="M77 221 V236" id="drL" hot={hot} />
      <W d="M707 221 V236" id="drH" hot={hot} />
      <Dot x={250} y={160} />
      <Dot x={540} y={160} />
      <rect x="20" y="110" width="110" height="150" rx="8" fill="none" stroke="var(--line-2)" strokeWidth="1.5" />
      <rect x="650" y="110" width="100" height="150" rx="8" fill="none" stroke="var(--line-2)" strokeWidth="1.5" />
      <T x={75} y={128} size={10} color="var(--text)" bold>{t(loc('MCU 3.3 V', 'MCU 3.3 V'))}</T>
      <T x={700} y={128} size={10} color="var(--text)" bold>{t(loc('器件 5 V', 'Device 5 V'))}</T>
      <Mos kind="n" x={dl.x} y={dl.y} scale={dl.scale} noDiode on={hot.has('drL')} />
      <Mos kind="n" x={dh.x} y={dh.y} scale={dh.scale} noDiode on={hot.has('drH')} />
      <Gnd x={77} y={236} />
      <Gnd x={707} y={236} />
      <Res x={250} y={100} on={hot.has('puL')} missing={fault === 'noPuLV'} />
      <Res x={540} y={100} on={hot.has('puH')} missing={fault === 'noPuHV'} />
      <Mos kind="n" x={q.x} y={q.y} rot={q.rot} on={hot.has('ch')} dio={hot.has('dio')} />
      <T x={266} y={104} anchor="start" size={10} mono>R 4.7 kΩ</T>
      <T x={556} y={104} anchor="start" size={10} mono>R 4.7 kΩ</T>
      <T x={380} y={212} size={10}>Q1</T>
      <T x={380} y={196} size={9} color="var(--dim)">{t(loc('体二极管', 'body diode'))}</T>
      <Tag x={190} y={150} anchor="middle" text={`VL ${out.tags.vl}`} bad={bad} />
      <Tag x={598} y={150} anchor="middle" text={`VH ${out.tags.vh}`} bad={bad} />
      <Tag x={396} y={100} text={`Vgs ${out.tags.vgs}`} />
    </AppsSvg>
  )
}
