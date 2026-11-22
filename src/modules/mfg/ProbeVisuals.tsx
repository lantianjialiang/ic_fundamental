import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { Diagram, DiagramChoices } from './FlowVisuals'
import { HardwareCanvas, dot, ink, label, leader, line, rect, type Point } from './HardwareCanvas'
import { drawProbe, probeTip, type ProbeType } from './ProbeTypes'

const STACK = [
  { id: 'pogo', title: loc('测试头 Pogo', 'Test-head pogos') },
  { id: 'pcb', title: loc('针卡 PCB', 'Probe PCB') },
  { id: 'st', title: loc('空间转换层', 'Space transformer') },
  { id: 'probe', title: loc('探针与焊盘', 'Probe and pad') },
]
const STACK_TRACE: readonly Point[] = [
  [204, 55], [204, 109], [204, 120], [234, 120], [248, 134], [248, 147],
  [248, 162], [270, 182], [270, 195], [270, 235], [286, 244],
]
const TRACE_ENDS = [2, 6, 9, STACK_TRACE.length]

export function ProbeStack({ layer, onLayer, note }: { layer: string; onLayer: (id: string) => void; note: LText }) {
  const focus = Math.max(0, STACK.findIndex((item) => item.id === layer))
  const title = loc('沿针卡走线：从测试头到晶圆焊盘', 'Through the probe card: test head to wafer pad')
  return (
    <Diagram title={title} caption={note}>
      <HardwareCanvas scene="probe-stack" description={loc('测试头 Pogo 经过针卡 PCB、空间转换层和探针，最终连接晶圆焊盘', 'Test-head pogos reach wafer pads through the probe PCB, space transformer and probes')}
        value={focus} draw={(ctx, value, t) => {
          const active = STACK[Math.round(value)].id
          const border = (id: string) => active === id ? ink.trace : ink.steel
          rect(ctx, 155, 37, 290, 23, '#3f5c70', ink.steel)
          for (const x of [204, 396]) {
            rect(ctx, x - 7, 60, 14, 46, ink.dark, border('pogo'))
            line(ctx, [[x, 55], [x, 111]], ink.gold, 3)
          }
          rect(ctx, 153, 105, 294, 42, '#235d60', border('pcb'))
          line(ctx, [[160, 113], [440, 113]], '#6aab9e', 1)
          line(ctx, [[160, 139], [440, 139]], '#6aab9e', 1)
          rect(ctx, 224, 147, 152, 48, '#3a556d', border('st'))
          for (const x of [248, 352]) rect(ctx, x - 7, 145, 14, 5, ink.copper)
          for (const x of [270, 330]) rect(ctx, x - 6, 193, 12, 5, ink.copper)
          rect(ctx, 211, 248, 178, 22, '#41688e', ink.wafer)
          for (const x of [286, 314]) rect(ctx, x - 10, 244, 20, 4, ink.gold, border('probe'), 1)
          line(ctx, STACK_TRACE, ink.gold, 2.8)
          line(ctx, STACK_TRACE.map(([x, y]) => [600 - x, y]), ink.copper, 2.8)

          const prior = TRACE_ENDS[Math.floor(value)] - 1
          const next = TRACE_ENDS[Math.ceil(value)] - 1
          const end = prior + (next - prior) * (value % 1)
          const last = STACK_TRACE[Math.floor(end)]
          const toward = STACK_TRACE[Math.min(Math.ceil(end), STACK_TRACE.length - 1)]
          const tip: Point = [last[0] + (toward[0] - last[0]) * (end % 1), last[1] + (toward[1] - last[1]) * (end % 1)]
          ctx.shadowColor = ink.trace
          ctx.shadowBlur = 9
          line(ctx, [...STACK_TRACE.slice(0, Math.floor(end) + 1), tip], ink.trace, 3.4)
          dot(ctx, ...tip, 4, ink.trace)
          ctx.shadowBlur = 0

          leader(ctx, 204, 79, 165, 129, t(loc('测试头 Pogo', 'Head pogo')))
          leader(ctx, 153, 126, 143, 129, t(loc('针卡 PCB', 'Probe PCB')))
          leader(ctx, 376, 176, 401, 423, t(loc('空间转换层', 'Transformer')))
          leader(ctx, 272, 220, 181, 129, t(loc('探针', 'Needle')))
          leader(ctx, 389, 259, 412, 423, t(loc('晶圆与焊盘', 'Wafer and pads')))
          label(ctx, 300, 291, t(loc('探针侧的接触间距更小', 'Contact pitch narrows at the probe tips')), ink.label, 'center', 16)
        }} />
      <DiagramChoices label={title} items={STACK} value={layer} onPick={onLayer} />
    </Diagram>
  )
}

const MOTION_STEPS = [
  { id: 'approach', title: loc('接近', 'Approach') },
  { id: 'zero', title: loc('初次接触', 'Touchdown') },
  { id: 'window', title: loc('30 µm', '30 µm') },
  { id: 'high', title: loc('70 µm', '70 µm') },
] as const

function motionCaption(approach: boolean, overdrive: number) {
  if (approach) return loc('晶圆台还在接近，焊盘与针尖之间留有间隙。过驱动以初次接触为零点。', 'The chuck is still approaching and the pad is separated from the tip. Overdrive is measured from first contact.')
  if (overdrive === 0) return loc('针尖刚接触焊盘。继续抬升晶圆台，探针开始弹性偏转。', 'The tip just touches the pad. Further upward chuck travel deflects the probe.')
  if (overdrive < 20) return loc('针尖保持接触，但在这个示例里，位移与擦拭仍小，接触可能不稳定。', 'The tip is in contact, but travel and scrub are small in this example and the connection may be unstable.')
  if (overdrive <= 40) return loc('晶圆台继续上移，针尖沿焊盘运动。右侧俯视图显示初触位置和针尖走过的路径。', 'The chuck rises farther and the tip moves across the pad. The top view shows the initial touch point and scrub path.')
  return loc('过驱动超出教学窗口。示意中擦痕加长，焊盘受损风险增加。具体风险取决于针型、受力、焊盘和材料。', 'Overdrive exceeds the teaching window. The illustrated scrub grows longer and pad damage becomes more likely. Actual risk depends on probe design, load, pad and material.')
}

export function ProbeMotion({ type, overdrive, approach, onMotion }: {
  type: ProbeType; overdrive: number; approach: boolean; onMotion: (overdrive: number, approach?: boolean) => void
}) {
  const { t } = useLocale()
  const value = approach ? -27 : overdrive
  const selection = approach ? 'approach' : overdrive === 0 ? 'zero' : overdrive === 30 ? 'window' : overdrive === 70 ? 'high' : ''
  const caption = motionCaption(approach, overdrive)
  return (
    <Diagram title={loc('过驱动放大图：针尖与同一块焊盘', 'Overdrive close-up: the probe and the same pad')} caption={caption}>
      <HardwareCanvas scene="probe-motion" description={caption} value={value}
        draw={(ctx, od, translate) => {
          const { padY, y: tipY, initialX, x: tipX, scrub } = probeTip(type, od)
          const scrubColor = od > 40 ? ink.red : ink.trace
          const padLeft = 206

          line(ctx, [[403, 34], [403, 272]], ink.guide, 1.2, [4, 5])
          label(ctx, 24, 31, translate(loc('截面', 'Cross-section')), ink.light)
          label(ctx, 427, 31, translate(loc('焊盘俯视', 'Pad top view')), ink.light)
          line(ctx, [[172, 216], [354, 216]], ink.guide, 1.15, [5, 4])
          rect(ctx, 85, padY + 8, 270, 31, '#385b81', ink.wafer)
          rect(ctx, padLeft, padY, 125, 8, ink.copper, ink.gold, 2)
          rect(ctx, 95, padY + 39, 250, 12, '#23394a', ink.steel, 3)
          if (od > 0) line(ctx, [[initialX, padY + 1], [tipX, padY + 1]], scrubColor, 3)

          drawProbe(ctx, type, od)
          dot(ctx, tipX, tipY - 3, 3, od >= 0 ? scrubColor : ink.gold)
          leader(ctx, padLeft, padY + 4, 143, 73, translate(loc('焊盘', 'Pad')))
          if (od > 1) {
            line(ctx, [[382, 216], [382, padY + 1]], ink.wafer, 1.8)
            line(ctx, [[378, padY + 8], [382, padY + 1], [386, padY + 8]], ink.wafer, 1.7)
          }
          label(ctx, 175, 298, translate(loc('晶圆台 ↑', 'Chuck ↑')), ink.label, 'center', 17)

          rect(ctx, 432, 93, 131, 106, '#7a5240', ink.gold, 7)
          rect(ctx, 443, 105, 109, 82, '#926447', undefined, 4)
          const x0 = 461
          const at = x0 + scrub * 1.42
          if (od >= 0) {
            line(ctx, [[x0, 146], [at, 146]], scrubColor, od > 40 ? 6 : 3)
            dot(ctx, x0, 146, 4, ink.light)
            dot(ctx, at, 146, 5, scrubColor)
          }
          label(ctx, 497, 221, od < 0 ? '—' : translate(loc('过驱动', 'Overdrive')), ink.label, 'center', 16)
          label(ctx, 497, 252, od < 0 ? translate(loc('未接触', 'Gap open')) : `${Math.round(od)} µm`, od > 40 ? ink.red : ink.trace, 'center', 19)
        }} />
      <DiagramChoices label={loc('过驱动预设', 'Overdrive presets')} items={MOTION_STEPS} value={selection}
        onPick={(id) => {
          if (id === 'approach') onMotion(0, true)
          else onMotion(id === 'zero' ? 0 : id === 'window' ? 30 : 70)
        }} />
      <div className="hardware-window">
        <span>{t(loc('示意窗口 20–40 µm', 'Teaching range 20–40 µm'))}</span>
        <div aria-hidden="true"><i />{!approach && <b style={{ left: `${(overdrive / 80) * 100}%` }} />}</div>
        <footer aria-hidden="true"><span>0</span><span>20</span><span>40</span><span>60</span><span>80 µm</span></footer>
      </div>
    </Diagram>
  )
}
