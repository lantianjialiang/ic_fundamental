import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { Diagram, DiagramChoices } from './FlowVisuals'
import { HardwareCanvas, curve, dot, ink, label, line, rect } from './HardwareCanvas'

type TestOption = { id: string; title: LText; text: LText }

const WAT_NOTES: Record<string, LText> = {
  vth: loc('扫栅源电压 VGS，保持漏源偏压，读漏电流 ID。在图示的定电流法中，达到指定 ID 时读出 Vth。', 'Sweep VGS at a fixed drain bias and read ID. In the illustrated constant-current method, read Vth when ID reaches the extraction current.'),
  rs: loc('外侧两针送电流 I，内侧两针量薄膜上的压差 V。薄层电阻由 V/I 和几何因子换算。', 'The outer probes force current I. The inner probes sense voltage V on the film. Sheet resistance is calculated from V/I and a geometry factor.'),
  via: loc('电流沿上下两层金属交替经过通孔。端到端读数累加各孔与连线的电阻，开路会截断整条路径。', 'Current alternates between two metal layers through the vias. The end-to-end reading includes vias and wiring. An open interrupts the entire path.'),
}

export function WatStructureCompare({ items, value, onPick }: {
  items: readonly TestOption[]; value: string; onPick: (id: string) => void
}) {
  const { t } = useLocale()
  const title = loc('三种 WAT 测项接到哪里', 'Where the three WAT measurements connect')
  return (
    <Diagram title={title} caption={WAT_NOTES[value]}>
      <div className="probe-compare" role="group" aria-label={t(title)}>
        {items.map(({ id, title: name, text }) => (
          <button key={id} type="button" aria-label={t(name)} aria-pressed={id === value} onClick={() => onPick(id)}>
            <strong>{t(name)}</strong>
            <HardwareCanvas scene={`wat-${id}`} description={WAT_NOTES[id]} draw={(ctx, _, translate) => {
              if (id === 'vth') {
                label(ctx, 152, 72, 'S', ink.light, 'center', 29)
                label(ctx, 300, 54, 'G', ink.light, 'center', 29)
                label(ctx, 448, 72, 'D', ink.light, 'center', 29)
                rect(ctx, 88, 223, 424, 40, '#477495', ink.wafer)
                rect(ctx, 115, 203, 74, 20, ink.copper)
                rect(ctx, 411, 203, 74, 20, ink.copper)
                rect(ctx, 260, 164, 80, 32, ink.dark, ink.steel)
                rect(ctx, 252, 196, 96, 7, ink.wafer)
                line(ctx, [[152, 100], [152, 211]], ink.gold, 6)
                line(ctx, [[300, 82], [300, 166]], ink.gold, 6)
                line(ctx, [[448, 101], [448, 214], [395, 214], [204, 214], [152, 214]], ink.trace, 6)
                label(ctx, 292, 286, 'VGS → ID', ink.trace, 'center', 28)
              } else if (id === 'rs') {
                rect(ctx, 66, 213, 468, 36, '#356d90', ink.wafer)
                const xs = [126, 242, 358, 474]
                xs.forEach((x, i) => {
                  const sense = i === 1 || i === 2
                  label(ctx, x, 77, ['I+', 'V+', 'V−', 'I−'][i], sense ? ink.gold : ink.trace, 'center', 29)
                  line(ctx, [[x, 112], [x, 214]], sense ? ink.gold : ink.trace, 6)
                })
                line(ctx, [[126, 231], [474, 231]], ink.trace, 5)
                label(ctx, 300, 280, 'Rₛ ∝ V / I', ink.light, 'center', 27)
              } else {
                rect(ctx, 58, 115, 484, 122, '#36566e', ink.steel)
                line(ctx, [[74, 126], [150, 126], [150, 222], [250, 222], [250, 126], [350, 126], [350, 222], [450, 222], [450, 126], [526, 126]], ink.trace, 7)
                for (const x of [150, 250, 350, 450]) {
                  dot(ctx, x, 126, 8, ink.gold)
                  dot(ctx, x, 222, 8, ink.gold)
                }
                label(ctx, 74, 78, 'A', ink.light, 'center', 29)
                label(ctx, 526, 78, 'B', ink.light, 'center', 29)
                label(ctx, 300, 276, translate(loc('通孔串联', 'Vias in series')), ink.light, 'center', 27)
              }
            }} />
            <span>{t(text)}</span>
          </button>
        ))}
      </div>
    </Diagram>
  )
}

const STATES = [
  { id: 'setup', title: loc('看设备', 'Inspect setup') },
  { id: 'run', title: loc('看怎么测', 'See it run') },
] as const

const RUN: Record<string, LText> = {
  ate: loc('分选机将封装送到负载板上的插座。ATE 驱动、测量，分选机再把器件送入相应的 Bin。', 'The handler seats the packaged part in the load-board socket. ATE drives and measures, then the handler sends the part to its bin.'),
  slt: loc('插座接到接近实际应用的板卡。主机、存储器和接口一同运行应用负载，观察芯片在系统中的行为。', 'The socket connects to an application-like board. The host, memory and interfaces run an application workload together.'),
  burn: loc('多个器件在高温腔内持续加偏置。监测针对早期失效，插座在整个保温区间保持接触。', 'Multiple devices remain biased in a heated chamber. Monitoring screens for early failures while the sockets maintain contact throughout the dwell.'),
  bench: loc('手动插装样品。工作台上的仪表经夹具施加偏置或激励，再读取电压、电流等参数。', 'Insert a sample by hand. Bench instruments use the fixture to apply a bias or stimulus and measure voltage, current or other parameters.'),
}

export function SocketUseCompare({ items, value, onPick, running, onRun }: {
  items: readonly TestOption[]; value: string; onPick: (id: string) => void; running: boolean; onRun: (running: boolean) => void
}) {
  const title = loc('同一个测试座概念，四种工况', 'The socket in four test setups')
  const selected = items.find((item) => item.id === value) ?? items[0]
  return (
    <Diagram title={title} caption={running ? RUN[value] : selected.text}>
      <DiagramChoices label={title} items={items} value={value} onPick={onPick} />
      <HardwareCanvas scene={`socket-use-${value}`} description={RUN[value]} value={running ? 1 : 0} draw={(ctx, level, t) => {
        const color = level > 0.5 ? ink.trace : ink.steel
        const box = (x: number, y: number, width: number, name: LText, fill = ink.dark) => {
          rect(ctx, x, y, width, 52, fill, ink.steel, 6)
          label(ctx, x + width / 2, y + 26, t(name), ink.light, 'center', 20)
        }
        const socket = (x: number, y: number, lift = 0) => {
          rect(ctx, x - 28, y - lift, 56, 24, '#41668d', ink.wafer)
          for (const dx of [-13, 0, 13]) dot(ctx, x + dx, y + 26 - lift, 3, ink.gold)
          rect(ctx, x - 35, y + 28, 70, 12, ink.board, color, 3)
        }
        const wire = (x1: number, y1: number, x2: number, y2: number) => {
          line(ctx, [[x1, y1], [x2, y2]], ink.guide, 3, [5, 5])
          line(ctx, [[x1, y1], [x1 + (x2 - x1) * level, y1 + (y2 - y1) * level]], ink.trace, 4)
        }
        if (value === 'ate') {
          box(32, 157, 94, loc('ATE', 'ATE'))
          box(220, 40, 160, loc('分选机', 'Handler'))
          wire(126, 183, 265, 183)
          line(ctx, [[300, 93], [300, 123]], ink.wafer, 2, [5, 5])
          rect(ctx, 196, 183, 208, 17, ink.board, ink.steel)
          socket(300, 143, 16 * (1 - level))
          label(ctx, 300, 225, t(loc('插座 / 负载板', 'Socket / load board')), ink.light, 'center')
          box(474, 157, 93, loc('分 Bin', 'Bins'))
          wire(407, 183, 472, 183)
        } else if (value === 'slt') {
          rect(ctx, 56, 83, 488, 144, ink.board, ink.steel, 11)
          box(82, 122, 101, loc('主机', 'Host'))
          box(419, 122, 101, loc('存储器', 'Memory'))
          socket(300, 129)
          wire(183, 148, 265, 148)
          wire(335, 148, 419, 148)
          label(ctx, 300, 263, t(loc('应用板与接口', 'Application board and I/O')), ink.light, 'center')
        } else if (value === 'burn') {
          rect(ctx, 58, 54, 484, 172, '#553849', level > 0.5 ? ink.red : ink.steel, 13)
          for (const x of [150, 250, 350, 450]) {
            socket(x, 124)
            curve(ctx, `M${x} 104 q13 -10 0 -20 q-13 -10 0 -20`, level > 0.5 ? ink.red : ink.steel, 2.5)
            wire(x, 166, x, 197)
          }
          line(ctx, [[150, 197], [450, 197]], color, 3)
          label(ctx, 300, 263, t(loc('高温腔 · 多颗持续加偏置', 'Heated chamber · sustained bias')), ink.light, 'center')
        } else {
          box(65, 75, 145, loc('台式仪表', 'Bench meter'))
          rect(ctx, 288, 184, 227, 52, ink.dark, ink.steel)
          socket(400, 144)
          wire(211, 102, 365, 167)
          wire(211, 122, 365, 171)
          label(ctx, 400, 262, t(loc('手动夹具', 'Manual fixture')), ink.light, 'center')
        }
      }} />
      <DiagramChoices label={loc('工况操作', 'Setup operation')} items={STATES}
        value={running ? 'run' : 'setup'} onPick={(id) => onRun(id === 'run')} />
    </Diagram>
  )
}
