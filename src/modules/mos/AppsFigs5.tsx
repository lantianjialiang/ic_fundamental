import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { AppsSvg, Dot, Gnd, Mos, T, Tag, W, type FigProps } from './AppsFigs'
import { Battery } from './AppsFigs3'
import { VBAT } from './data/mosAppsHb'

const LABEL_HB = loc('H 桥电机驱动电路图', 'Schematic of the H-bridge motor drive')
const CAP_HB = loc('四只 NMOS 排成 H 形，电机在中间；G1 到 G4 是四个栅极的驱动电平（1 = 导通）。示意图，参数为示意值。', 'Four NMOS transistors form an H with the motor in the middle; G1 to G4 are the four gate drive levels (1 = on). Illustration with illustrative parameters.')

/** (f) H 桥：左桥臂 Q1（上）Q2（下），右桥臂 Q3（上）Q4（下） */
export function HBridgeFig({ out }: FigProps) {
  const { t } = useLocale()
  const hot = new Set(out.hot)
  const drive = new Set(['g1', 'g2', 'g3', 'g4'].filter((g) => out.tags[g] === '1'))
  const bad = out.tone === 'bad'
  const mos = (n: number, x: number, y: number) => <Mos key={n} kind="n" x={x} y={y} on={hot.has(`q${n}`)} dio={hot.has(`d${n}`)} />
  return (
    <AppsSvg h={340} label={LABEL_HB} caption={CAP_HB}>
      <W d="M130 168 V40" id="bat" hot={hot} />
      <W d="M130 310 V182" id="bat" hot={hot} />
      <W d="M130 40 H270" id="rA" hot={hot} />
      <W d="M270 40 H510" id="rB" hot={hot} />
      <W d="M130 310 H270" id="gA" hot={hot} />
      <W d="M270 310 H510" id="gB" hot={hot} />
      <W d="M270 40 V70" id="w1" hot={hot} />
      <W d="M510 40 V70" id="w3" hot={hot} />
      <W d="M270 130 V170" id="a1" hot={hot} />
      <W d="M270 170 V210" id="a2" hot={hot} />
      <W d="M270 270 V310" id="g2" hot={hot} />
      <W d="M510 130 V170" id="b3" hot={hot} />
      <W d="M510 170 V210" id="b4" hot={hot} />
      <W d="M510 270 V310" id="g4" hot={hot} />
      <W d="M270 170 H366" id="mA" hot={hot} />
      <W d="M510 170 H414" id="mB" hot={hot} />
      <W d="M230 100 H212" id="g1" hot={drive} sig />
      <W d="M230 240 H212" id="g2" hot={drive} sig />
      <W d="M470 100 H452" id="g3" hot={drive} sig />
      <W d="M470 240 H452" id="g4" hot={drive} sig />
      <Dot x={270} y={40} />
      <Dot x={510} y={40} />
      <Dot x={270} y={170} />
      <Dot x={510} y={170} />
      <Dot x={270} y={310} />
      <Dot x={510} y={310} />
      <circle cx="390" cy="170" r="24" fill="var(--card)" stroke={hot.has('motor') ? 'var(--gold)' : 'var(--text)'} strokeWidth={hot.has('motor') ? 3.5 : 2} />
      <T x={390} y={176} size={16} color="var(--text)" bold>M</T>
      <Battery x={130} y={175} reversed={false} />
      {mos(1, 260, 100)}
      {mos(2, 260, 240)}
      {mos(3, 500, 100)}
      {mos(4, 500, 240)}
      <Gnd x={390} y={310} />
      <T x={140} y={32} anchor="start" size={11} color="var(--text)">{`+${VBAT} V`}</T>
      <T x={306} y={104} anchor="start" size={10} color="var(--text)" bold>Q1</T>
      <T x={306} y={118} anchor="start" size={9} color="var(--dim)">{t(loc('上管', 'high side'))}</T>
      <T x={306} y={244} anchor="start" size={10} color="var(--text)" bold>Q2</T>
      <T x={306} y={258} anchor="start" size={9} color="var(--dim)">{t(loc('下管', 'low side'))}</T>
      <T x={546} y={104} anchor="start" size={10} color="var(--text)" bold>Q3</T>
      <T x={546} y={118} anchor="start" size={9} color="var(--dim)">{t(loc('上管', 'high side'))}</T>
      <T x={546} y={244} anchor="start" size={10} color="var(--text)" bold>Q4</T>
      <T x={546} y={258} anchor="start" size={9} color="var(--dim)">{t(loc('下管', 'low side'))}</T>
      <T x={258} y={160} anchor="end" size={10}>OUTA</T>
      <T x={522} y={160} anchor="start" size={10}>OUTB</T>
      <Tag x={208} y={104} anchor="end" text={`G1=${out.tags.g1}`} bad={bad && out.tags.g1 === '1' && out.tags.g2 === '1'} />
      <Tag x={208} y={244} anchor="end" text={`G2=${out.tags.g2}`} bad={bad && out.tags.g1 === '1' && out.tags.g2 === '1'} />
      <Tag x={448} y={104} anchor="end" text={`G3=${out.tags.g3}`} />
      <Tag x={448} y={244} anchor="end" text={`G4=${out.tags.g4}`} />
    </AppsSvg>
  )
}
