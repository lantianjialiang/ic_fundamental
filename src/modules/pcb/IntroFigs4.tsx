import { useLocale } from '../../i18n/LocaleContext'
import { LEVEL_LABEL, TYPE_LABEL } from './data/pcbIntro'
import { Barrel, C, cut, Lead, Note, Rects, Side, Txt, type Span } from './IntroFigs'

const BX0 = 40
const BX1 = 500
const FULL: Span[] = [[BX0, BX1]]
const PI = '#e0a526'
const ADH = '#9a8a5c'

export function FlexSketch() {
  const { t } = useLocale()
  const win: Span = [210, 262]
  return (
    <>
      <Rects spans={cut(FULL, [win])} y={116} h={10} fill={PI} />
      <Rects spans={cut(FULL, [win])} y={126} h={14} fill={ADH} />
      <Rects spans={FULL} y={140} h={16} fill={PI} />
      <Rects spans={[[60, 150], [190, 330], [370, 500]]} y={134} h={6} fill={C.cu} />
      <path d="M360 100 Q420 40 480 100" fill="none" stroke={PI} strokeWidth="6" strokeLinecap="round" />
      <Txt x={420} y={50}>{t(TYPE_LABEL.bend)}</Txt>
      <Note x={236} y={96} from={[236, 101]} to={[236, 133]} text={t(LEVEL_LABEL.pad)} />
      <Side
        items={[
          { py: 121, text: t(TYPE_LABEL.cover) },
          { py: 130, text: t(TYPE_LABEL.glue) },
          { py: 137, text: t(TYPE_LABEL.ra) },
          { py: 148, text: t(TYPE_LABEL.pi) },
        ]}
      />
    </>
  )
}

export function RigidFlexSketch() {
  const { t } = useLocale()
  const hole: Span = [436, 444]
  const rigid: Span[] = [[BX0, 196], [344, BX1]]
  const zone = (a: number, b: number, label: string) => (
    <>
      <Lead d={`M${a + 2} 78 V84 H${b - 2} V78`} />
      <Txt x={(a + b) / 2} y={70}>{label}</Txt>
    </>
  )
  return (
    <>
      <Rects spans={cut(rigid, [hole])} y={100} h={34} fill={C.core} />
      <Rects spans={cut(rigid, [hole])} y={158} h={34} fill={C.core} />
      <Rects spans={cut(rigid, [hole])} y={94} h={6} fill={C.cu} />
      <Rects spans={cut(rigid, [hole])} y={192} h={6} fill={C.cu} />
      <Rects spans={[[196, 344]]} y={128} h={6} fill={PI} />
      <Rects spans={[[196, 344]]} y={158} h={6} fill={PI} />
      <Rects spans={cut(FULL, [hole])} y={140} h={12} fill={PI} />
      <Rects spans={cut([[60, 500]], [hole])} y={134} h={6} fill={C.cu} />
      <Rects spans={cut([[60, 500]], [hole])} y={152} h={6} fill={C.cu} />
      <Barrel x={440} r={4} y0={94} y1={198} />
      {zone(BX0, 196, t(TYPE_LABEL.rigid))}
      {zone(196, 344, t(TYPE_LABEL.flexZone))}
      {zone(344, BX1, t(TYPE_LABEL.rigid))}
      <Note x={270} y={112} from={[270, 117]} to={[270, 129]} text={t(TYPE_LABEL.cover)} />
      <Note x={440} y={230} from={[440, 217]} to={[440, 199]} text={t(TYPE_LABEL.pth)} />
      <Side
        items={[
          { py: 117, text: t(TYPE_LABEL.fr4) },
          { py: 137, text: t(TYPE_LABEL.circuit) },
          { py: 146, text: t(TYPE_LABEL.flexCore) },
        ]}
      />
    </>
  )
}

export function MetalSketch() {
  const { t } = useLocale()
  const open: Span[] = [[212, 234], [286, 308]]
  return (
    <>
      <defs>
        <marker id="introHeat2" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0 L8 4 L0 8 Z" fill={C.heat} />
        </marker>
      </defs>
      <Rects spans={FULL} y={118} h={8} fill="#d8d2b8" />
      <Rects spans={FULL} y={126} h={56} fill={C.steel} />
      <Rects spans={cut(FULL, open)} y={108} h={10} fill={C.mask} />
      <Rects spans={[[60, 232], [288, 500]]} y={112} h={6} fill={C.cu} />
      <Rects spans={[[216, 230], [290, 304]]} y={106} h={6} fill={C.sn} />
      <rect x="216" y="88" width="88" height="18" rx="2" fill="#e8e8e8" stroke="#8b949e" />
      <path d="M236 88 Q260 58 284 88 Z" fill="#f2c94c" opacity="0.85" />
      <Txt x={260} y={101} size={10} fill="#222">{t(TYPE_LABEL.led)}</Txt>
      <g fill="none" stroke={C.heat} strokeWidth="2" markerEnd="url(#introHeat2)">
        <path d="M222 114 V150 H160" />
        <path d="M298 114 V150 H360" />
      </g>
      <Note x={330} y={94} from={[328, 97]} to={[299, 128]} text={t(TYPE_LABEL.heat)} anchor="start" />
      <Side
        items={[
          { py: 109, text: t(TYPE_LABEL.mask) },
          { py: 115, text: t(TYPE_LABEL.circuit) },
          { py: 122, text: t(TYPE_LABEL.diel) },
          { py: 154, text: t(TYPE_LABEL.alu) },
        ]}
      />
    </>
  )
}
