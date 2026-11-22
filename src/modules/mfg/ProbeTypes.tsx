import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { Diagram, DiagramChoices } from './FlowVisuals'
import { HardwareCanvas, curve, dot, ink, line, rect } from './HardwareCanvas'

export type ProbeType = 'cant' | 'vert' | 'mems'

export function probeTip(type: ProbeType, overdrive: number) {
  const padY = 216 - overdrive * 0.68
  const y = Math.min(216, padY)
  const travel = Math.max(overdrive, 0) / 80
  const initialX = type === 'cant' ? 246 : 237
  const scrub = travel * (type === 'cant' ? 50 : type === 'mems' ? 15 : 25)
  return { padY, y, travel, initialX, scrub, x: initialX + scrub }
}

export function drawProbe(ctx: CanvasRenderingContext2D, type: ProbeType, overdrive: number, mount = true) {
  const { x, y, travel } = probeTip(type, overdrive)
  if (type === 'cant') {
    if (mount) rect(ctx, 94, 65, 61, 35, '#36526a', ink.steel, 5)
    curve(ctx, `M143 88 C174 93 194 ${115 - 30 * travel} ${x - 17} ${y - 33} Q${x - 6} ${y - 15} ${x} ${y - 3}`, ink.gold, 7)
  } else if (type === 'mems') {
    if (mount) rect(ctx, 204, 55, 66, 26, '#36526a', ink.steel)
    curve(ctx, `M223 81 V106 Q223 ${y - 20} ${x - 7} ${y - 18} L${x} ${y - 3}`, ink.gold, 5)
    curve(ctx, `M251 81 V106 Q251 ${y - 27} ${x - 7} ${y - 18}`, ink.copper, 3)
  } else {
    if (mount) {
      rect(ctx, 207, 54, 64, 27, '#36526a', ink.steel)
      rect(ctx, 207, 132, 64, 9, ink.dark, ink.steel, 2)
    }
    curve(ctx, `M237 80 C${237 + 55 * travel} 96 ${245 + 50 * travel} 115 237 135 L${x} ${y - 3}`, ink.gold, 6)
  }
}

const DETAILS: Record<ProbeType, LText> = {
  cant: loc('针梁从侧面伸出，偏转时针尖沿焊盘滑动。排布要给针梁和擦痕留空间。', 'The beam reaches in from the side. Its tip slides across the pad as it deflects, so the beam and scrub both need clearance.'),
  vert: loc('针体穿过导向板，受压时在板间弹性弯曲。阵列节距与针体、导向孔和弯曲空间有关。', 'A vertical probe passes through guides and flexes between them. Probe size, guide holes and clearance for flexure constrain array pitch.'),
  mems: loc('图中画的是一类微加工弹簧阵列。微加工可重复形成小型接触单元，便于在细节距下控制针尖位置。', 'This example shows an array of micromachined springs. Repeated compact contact elements help control tip position at fine pitch.'),
}

const CONTACT_STATES = [
  { id: 'touch', title: loc('初次接触', 'First touch') },
  { id: 'loaded', title: loc('接触后抬升晶圆台', 'Raise the chuck after contact') },
] as const

export function ProbeTypeCompare({ items, selected, onSelect, loaded, onLoad }: {
  items: readonly { id: ProbeType; title: LText }[]
  selected: ProbeType
  onSelect: (id: ProbeType) => void
  loaded: boolean
  onLoad: (loaded: boolean) => void
}) {
  const { t } = useLocale()
  const title = loc('三种探针的针体与焊盘接触方式', 'How three probe designs contact a pad')
  return (
    <Diagram title={title} caption={loc('图示为典型结构，形变和擦痕有所放大。MEMS 描述微加工方式，也可制成垂直结构。实际节距和擦痕由具体针型、焊盘和载荷决定。', 'The drawings show representative designs with exaggerated flexure and scrub. MEMS describes a fabrication method and can also produce vertical probes. Actual pitch and scrub depend on the design, pad and load.')}>
      <DiagramChoices label={loc('对照图的接触状态', 'Contact state for all three drawings')}
        items={CONTACT_STATES} value={loaded ? 'loaded' : 'touch'} onPick={(id) => onLoad(id === 'loaded')} />
      <div className="probe-compare" role="group" aria-label={t(title)}>
        {items.map(({ id, title: name }) => (
          <button key={id} type="button" aria-label={t(name)} aria-pressed={id === selected} onClick={() => onSelect(id)}>
            <strong>{t(name)}</strong>
            <HardwareCanvas scene={`probe-type-${id}`} description={DETAILS[id]} value={loaded ? 30 : 0}
              draw={(ctx, od) => {
                const tip = probeTip(id, od)
                ctx.translate(-62, -34)
                ctx.scale(1.65, 1.38)
                const offsets = id === 'mems' ? [-49, 0, 49] : id === 'vert' ? [-39, 39] : [0]
                const left = id === 'mems' ? 162 : 154
                const width = id === 'mems' ? 147 : 160
                rect(ctx, left, tip.padY + 7, width, 24, '#3a628a', ink.wafer)
                if (id !== 'cant') rect(ctx, 173, 55, 130, 26, '#36526a', ink.steel, 4)
                if (id === 'vert') rect(ctx, 173, 132, 130, 9, ink.dark, ink.steel, 2)
                for (const dx of offsets) {
                  ctx.save()
                  ctx.translate(dx, 0)
                  rect(ctx, tip.initialX - 21, tip.padY, 44, 7, ink.copper, ink.gold, 2)
                  if (tip.scrub > 0) line(ctx, [[tip.initialX, tip.padY + 1], [tip.x, tip.padY + 1]], ink.trace, 2.6)
                  drawProbe(ctx, id, od, id === 'cant')
                  dot(ctx, tip.x, tip.y - 2, 3, ink.trace)
                  ctx.restore()
                }
                if (od > 0.5) {
                  const arrowX = id === 'mems' ? 332 : 343
                  line(ctx, [[arrowX, 216], [arrowX, tip.padY], [arrowX - 4, tip.padY + 7]], ink.wafer, 2)
                  line(ctx, [[arrowX, tip.padY], [arrowX + 4, tip.padY + 7]], ink.wafer, 2)
                }
              }} />
            <span>{t(DETAILS[id])}</span>
          </button>
        ))}
      </div>
    </Diagram>
  )
}
