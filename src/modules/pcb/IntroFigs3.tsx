import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { ROLE_LABEL, TYPES, TYPE_LABEL, type TypeId } from './data/pcbIntro'
import { Barrel, C, cut, Note, Rects, Side, type Span } from './IntroFigs'
import { FlexSketch, MetalSketch, RigidFlexSketch } from './IntroFigs4'

const L = {
  gndVia: loc('地过孔', 'GND via'),
  pwrVia: loc('电源过孔', 'Power via'),
  antipad: loc('反焊盘', 'Antipad'),
}

const BX0 = 40
const BX1 = 500
const SILK = '#f6f6f6'
const FULL: Span[] = [[BX0, BX1]]

function SingleSketch() {
  const { t } = useLocale()
  const holes: Span[] = [[200, 210], [310, 320]]
  const joint = (x: number) => `M${x - 14} 166 Q${x - 4} 168 ${x - 1.5} 180 H${x + 1.5} Q${x + 4} 168 ${x + 14} 166 Z`
  return (
    <>
      <Rects spans={cut(FULL, holes)} y={110} h={50} fill={C.core} />
      <Rects spans={cut(FULL, [...holes, [189, 221], [299, 331]])} y={160} h={10} fill={C.mask} />
      <Rects spans={cut([[60, 219], [301, 500]], holes)} y={160} h={6} fill={C.cu} />
      <Rects spans={[[170, 176], [334, 340], [470, 500]]} y={106} h={4} fill={SILK} />
      <rect x="225" y="76" width="70" height="20" rx="8" fill="#d8b56a" stroke="#8a6d33" />
      <path d="M225 86 H205 V182 M295 86 H315 V182" fill="none" stroke={C.steel} strokeWidth="2.5" />
      <path d={joint(205)} fill={C.sn} />
      <path d={joint(315)} fill={C.sn} />
      <Note x={260} y={58} from={[260, 63]} to={[260, 75]} text={t(TYPE_LABEL.part)} />
      <Note x={360} y={214} from={[352, 203]} to={[320, 181]} text={t(TYPE_LABEL.npth)} />
      <Side
        items={[
          { py: 108, text: t(TYPE_LABEL.silk) },
          { py: 135, text: t(TYPE_LABEL.base1) },
          { py: 163, text: t(TYPE_LABEL.cuOne) },
          { py: 168, text: t(TYPE_LABEL.mask) },
        ]}
      />
    </>
  )
}

function DoubleSketch() {
  const { t } = useLocale()
  const hole: Span = [246, 254]
  const open: Span = [224, 278]
  return (
    <>
      <Rects spans={cut(FULL, [hole])} y={120} h={40} fill={C.core} />
      <Rects spans={cut(FULL, [open])} y={108} h={12} fill={C.mask} />
      <Rects spans={cut(FULL, [open])} y={160} h={12} fill={C.mask} />
      <Rects spans={cut([[60, 276], [330, 500]], [hole])} y={112} h={8} fill={C.cu} />
      <Rects spans={cut([[226, 500]], [hole])} y={160} h={8} fill={C.cu} />
      <Rects spans={[[100, 130], [440, 500]]} y={106} h={2} fill={SILK} />
      <Barrel x={250} r={4} y0={112} y1={168} />
      <Note x={250} y={62} from={[250, 68]} to={[250, 112]} text={t(TYPE_LABEL.pth)} />
      <Side
        items={[
          { py: 107, text: t(TYPE_LABEL.silk) },
          { py: 110, text: t(TYPE_LABEL.mask) },
          { py: 116, text: t(TYPE_LABEL.top) },
          { py: 140, text: t(TYPE_LABEL.core) },
          { py: 164, text: t(TYPE_LABEL.bottom) },
        ]}
      />
    </>
  )
}

function MultiSketch() {
  const { t } = useLocale()
  const holes: Span[] = [[246, 254], [386, 394]]
  const open: Span[] = [[224, 276], [364, 416]]
  return (
    <>
      <Rects spans={cut(FULL, holes)} y={118} h={16} fill={C.pp} />
      <Rects spans={cut(FULL, holes)} y={139} h={32} fill={C.core} />
      <Rects spans={cut(FULL, holes)} y={176} h={16} fill={C.pp} />
      <Rects spans={cut(FULL, [...holes, [380, 400]])} y={134} h={5} fill={C.cu} />
      <Rects spans={cut(FULL, [...holes, [240, 260]])} y={171} h={5} fill={C.cu} />
      <Rects spans={cut(FULL, open)} y={108} h={10} fill={C.mask} />
      <Rects spans={cut(FULL, open)} y={192} h={10} fill={C.mask} />
      <Rects spans={cut([[60, 274], [366, 500]], holes)} y={112} h={6} fill={C.cu} />
      <Rects spans={cut([[226, 416], [440, 500]], holes)} y={192} h={6} fill={C.cu} />
      <Barrel x={250} r={4} y0={112} y1={198} />
      <Barrel x={390} r={4} y0={112} y1={198} />
      <Note x={250} y={62} from={[250, 68]} to={[250, 111]} text={t(L.gndVia)} />
      <Note x={390} y={62} from={[390, 68]} to={[390, 111]} text={t(L.pwrVia)} />
      <Note x={250} y={242} from={[256, 230]} to={[257, 174]} text={t(L.antipad)} />
      <Note x={352} y={242} from={[354, 230]} to={[383, 137]} text={t(L.antipad)} />
      <Side
        items={[
          { py: 115, text: t(TYPE_LABEL.l1) },
          { py: 126, text: t(TYPE_LABEL.pp) },
          { py: 136.5, text: t(ROLE_LABEL.gnd) },
          { py: 155, text: t(TYPE_LABEL.core) },
          { py: 173.5, text: t(ROLE_LABEL.pwr) },
          { py: 195, text: t(TYPE_LABEL.l4) },
        ]}
      />
    </>
  )
}

const SKETCH: Record<TypeId, () => ReactNode> = {
  single: SingleSketch,
  double: DoubleSketch,
  multi: MultiSketch,
  flex: FlexSketch,
  rigidflex: RigidFlexSketch,
  metal: MetalSketch,
}

export function TypeFig({ active }: { active: TypeId }) {
  const { t } = useLocale()
  const item = TYPES.find((x) => x.id === active) ?? TYPES[0]
  const Sketch = SKETCH[item.id]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 260" className="term-fig__svg" role="img" aria-label={`${t(item.title)} · ${t(item.sub)}`}>
        <rect width="760" height="260" rx="10" fill="var(--well)" />
        <Sketch />
      </svg>
    </figure>
  )
}
