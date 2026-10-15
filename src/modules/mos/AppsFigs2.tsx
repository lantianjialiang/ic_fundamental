import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { AppsSvg, Dio, Dot, Gnd, Mos, Res, T, Tag, W, mosPin, type FigProps } from './AppsFigs'
import { LOADS, RG_GPIO, RPD_GPIO, VCC, type LoadId } from './data/mosAppsGpio'
import { R1, R2, VIN } from './data/mosAppsLoadSw'

const LABEL_GPIO = loc('GPIO 低边驱动电路图', 'Schematic of the GPIO low-side driver')
const LABEL_LOADSW = loc('PMOS 高边负载开关电路图', 'Schematic of the PMOS high-side load switch')

/** (a) GPIO 低边驱动：负载在 +5 V 和漏极之间 */
export function GpioFig({ sel, fault, out }: FigProps) {
  const { t } = useLocale()
  const hot = new Set(out.hot)
  const load = sel.load as LoadId
  const bad = out.tone === 'bad'
  const ld = LOADS[load] ?? LOADS.led
  const q = { x: 490, y: 220 }
  const gate = mosPin(q, 'g')
  return (
    <AppsSvg h={320} label={LABEL_GPIO}>
      <path d="M470 40 H530" stroke="var(--text-2)" strokeWidth="2" />
      <T x={500} y={30} size={11} color="var(--text)">{`+${VCC} V`}</T>
      <W d="M500 40 V62" id="vcc" hot={hot} />
      {load === 'led' ? (
        <g>
          <W d="M500 62 V79" id="load" hot={hot} />
          <W d="M500 111 V144" id="load" hot={hot} />
          <W d="M500 156 V190" id="dn" hot={hot} />
          <Res x={500} y={95} on={hot.has('load')} />
          <Dio x={500} y={150} rot={90} kind="led" on={hot.has('load')} />
          <T x={516} y={99} anchor="start" size={10} mono>{`${ld.r} Ω`}</T>
          <T x={526} y={154} anchor="start" size={10}>LED</T>
        </g>
      ) : (
        <g>
          <W d="M500 62 V85" id="load" hot={hot} />
          <W d="M500 145 V170" id="load" hot={hot} />
          <W d="M500 170 V190" id="dn" hot={hot} />
          <W d="M500 62 H560 V119" id="fl" hot={hot} />
          <W d="M560 131 V170 H500" id="fl" hot={hot} />
          <Dot x={500} y={62} />
          <Dot x={500} y={170} />
          {load === 'relay' ? (
            <rect x="488" y="85" width="24" height="60" fill="var(--card)" stroke={hot.has('load') ? 'var(--gold)' : 'var(--text)'} strokeWidth="2" />
          ) : (
            <g>
              <circle cx="500" cy="115" r="24" fill="var(--card)" stroke={hot.has('load') ? 'var(--gold)' : 'var(--text)'} strokeWidth="2" />
              <T x={500} y={120} size={12} color="var(--text)">BZ</T>
            </g>
          )}
          {load === 'relay' ? (
            <g>
              <T x={480} y={112} anchor="end" size={10}>K1</T>
              <T x={480} y={126} anchor="end" size={10} mono>{`${ld.r} Ω`}</T>
            </g>
          ) : (
            <T x={470} y={119} anchor="end" size={10} mono>{`${ld.r} Ω`}</T>
          )}
          <Dio x={560} y={125} rot={-90} on={hot.has('fl')} missing={fault === 'noFlyback'} />
          <T x={578} y={129} anchor="start" size={10}>D1</T>
        </g>
      )}
      <Mos kind="n" x={q.x} y={q.y} on={hot.has('ch')} />
      <W d="M500 250 V290" id="gnd" hot={hot} />
      <Gnd x={500} y={290} />
      <T x={540} y={226} anchor="start" size={10}>Q1 NMOS</T>
      <W d="M230 220 H304" id="gate" hot={hot} sig />
      <W d={`M336 220 H${gate[0]}`} id="gate" hot={hot} sig />
      <W d="M420 220 V246" />
      <W d="M420 278 V290" />
      <Dot x={420} y={220} />
      <Gnd x={420} y={290} />
      <Res x={320} y={220} vertical={false} on={hot.has('gate')} />
      <Res x={420} y={262} missing={fault === 'gateFloat'} />
      <rect x="150" y="200" width="80" height="40" rx="6" fill="var(--card)" stroke="var(--text-2)" strokeWidth="2" />
      <T x={190} y={225} size={12} color="var(--text)" bold>GPIO</T>
      <Tag x={190} y={258} anchor="middle" text={out.tags.gpio} />
      <T x={320} y={206} size={10} mono>{`Rg ${RG_GPIO} Ω`}</T>
      <T x={404} y={266} anchor="end" size={10} mono>{`Rpd ${RPD_GPIO / 1000} kΩ`}</T>
      <Tag x={420} y={208} anchor="middle" text={`Vg ${out.tags.vg}`} bad={bad && out.tags.vg === '?'} />
      <Tag x={512} y={196} text={`Vd ${out.tags.vd}`} bad={bad} />
      <T x={150} y={190} anchor="start" size={10}>{t(loc('MCU 引脚', 'MCU pin'))}</T>
    </AppsSvg>
  )
}

/** (b) PMOS 高边负载开关：NMOS 做电平移位 */
export function LoadSwFig({ fault, out }: FigProps) {
  const hot = new Set(out.hot)
  const bad = out.tone === 'bad'
  const rev = fault === 'pmosReversed'
  const q1 = { x: 460, y: 120, flip: rev }
  const q2 = { x: 390, y: 230 }
  // 翻转后上下端点位置不变，只是上端变成漏极、下端变成源极
  const gate = mosPin(q1, 'g')
  const g2 = mosPin(q2, 'g')
  return (
    <AppsSvg h={320} label={LABEL_LOADSW}>
      <W d="M300 50 H470 V90" id="vin" hot={hot} />
      <T x={300} y={40} anchor="start" size={11} color="var(--text)">{`+${VIN} V`}</T>
      <Dot x={400} y={50} />
      <W d="M400 50 V69" id="gdrv" hot={hot} />
      <W d="M400 101 V144" id="gdrv" hot={hot} />
      <W d="M400 176 V200" id="gdrv" hot={hot} />
      <W d={`M400 120 H${gate[0]}`} />
      <Dot x={400} y={120} />
      <W d="M470 150 V190 H580" id="out" hot={hot} />
      <W d="M580 190 V219" id="load" hot={hot} />
      <W d="M580 251 V290" id="gnd" hot={hot} />
      <W d="M400 260 V290" id="q2s" hot={hot} />
      <W d={`M230 230 H${g2[0]}`} id="sig" hot={hot} sig />
      <W d="M320 230 V246" />
      <W d="M320 278 V290" />
      <Dot x={320} y={230} />
      <Res x={400} y={85} on={hot.has('gdrv')} missing={fault === 'noPullup'} />
      <Res x={400} y={160} on={hot.has('gdrv')} />
      <Res x={580} y={235} on={hot.has('load')} />
      <Res x={320} y={262} missing={fault === 'gateFloat'} />
      <Mos kind="p" x={q1.x} y={q1.y} flip={rev} on={hot.has('ch')} dio={hot.has('dio')} />
      <Mos kind="n" x={q2.x} y={q2.y} on={hot.has('q2')} />
      <Gnd x={580} y={290} />
      <Gnd x={400} y={290} />
      <Gnd x={320} y={290} />
      <rect x="150" y="210" width="80" height="40" rx="6" fill="var(--card)" stroke="var(--text-2)" strokeWidth="2" />
      <T x={190} y={235} size={12} color="var(--text)" bold>GPIO</T>
      <Tag x={190} y={268} anchor="middle" text={out.tags.gpio} />
      <T x={384} y={89} anchor="end" size={10} mono>{`R1 ${R1 / 1000} kΩ`}</T>
      <T x={384} y={164} anchor="end" size={10} mono>{`R2 ${R2 / 1000} kΩ`}</T>
      <T x={304} y={266} anchor="end" size={10} mono>Rpd 100 kΩ</T>
      <T x={522} y={125} anchor="start" size={10}>Q1 PMOS</T>
      <T x={440} y={236} anchor="start" size={10}>Q2 NMOS</T>
      <T x={596} y={239} anchor="start" size={10} mono>RL 6 Ω</T>
      <Tag x={384} y={126} anchor="end" text={`Vg ${out.tags.vg}`} bad={bad && out.tags.vg === '?'} />
      <Tag x={484} y={182} text={`Vout ${out.tags.vout}`} bad={bad} />
    </AppsSvg>
  )
}
