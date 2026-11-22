import { loc, type LText } from '../../i18n/locale'
import { Diagram, DiagramChoices, StagePlayer } from './FlowVisuals'
import { HardwareCanvas, curve, dot, ink, label, line, rect } from './HardwareCanvas'

const TESTER = { title: loc('测试头', 'Test head'), note: loc('测试通道产生激励并读取返回结果。亮线跟踪一条信号通路，回流和其他通道省略。', 'A tester channel drives the stimulus and reads the response. The highlighted trace follows one signal. Returns and other channels are omitted.') }
const CP = [
  TESTER,
  { title: loc('探针卡', 'Probe card'), note: loc('探针卡 PCB 把测试头接口接到空间转换层，后者把间距收拢到裸片焊盘的尺度。', 'The probe-card PCB routes the test-head interface to the space transformer, which narrows the pitch to that of the die pads.') },
  { title: loc('探针', 'Probe needles'), note: loc('探针尖端落到裸片焊盘上。卡本身提供走线和支撑，这个接触点才把信号送进晶圆。', 'Probe tips land on bare-die pads. The card provides routing and support, and the tip-to-pad contact takes the signal into the wafer.') },
  { title: loc('晶圆裸片', 'Wafer die'), note: loc('CP 在切割前测试晶圆上的裸片，结果可写入晶圆图供后续分选。', 'Wafer sort tests bare dies before dicing. The results can be recorded in a wafer map for sorting.') },
]
const FT = [
  TESTER,
  { title: loc('负载板 DIB', 'DIB / load board'), note: loc('DIB 把测试头通道扇出到各站点的插座，并承载去耦、继电器和其他接口电路。', 'The load board routes tester channels to each site socket and carries decoupling, relays and other interface circuitry.') },
  { title: loc('测试座 Socket', 'Test socket'), note: loc('接触件一端接负载板焊盘，另一端接封装端子。接触电阻和寄生电感都会进入测试回路。', 'Each contact joins a board pad to a package terminal. Contact resistance and parasitic inductance enter the measurement path.') },
  { title: loc('封装成品', 'Packaged DUT'), note: loc('FT 通过封装的外部端子测量成品，测试结束后从插座取出并分 Bin。', 'Final test measures the finished part through its external terminals. The part is then removed and sorted into a bin.') },
]
const NODE_X = [75, 224, 375, 525]
const BUS_Y = 153

export function HardwarePath({ kind, step, onStep }: { kind: string; step: number; onStep: (step: number) => void }) {
  const cp = kind === 'pcard'
  const nodes = cp ? CP : FT
  const title = cp ? loc('CP · 测试头到裸片焊盘', 'CP · Test head to bare-die pad') : loc('FT · 测试头到封装端子', 'FT · Test head to package terminal')
  return (
    <Diagram title={title} caption={nodes[step].note}>
      <HardwareCanvas scene="hardware-path" description={loc('选四个节点，追踪测试头、接口板、接触件和被测器件之间的信号', 'Trace the test head, interface board, contacts and device across four steps')} value={step}
        draw={(ctx, value, t) => {
          line(ctx, [[75, BUS_Y], [525, BUS_Y]], ink.guide, 3, [6, 5])
          rect(ctx, 29, 106, 92, 94, ink.dark, ink.steel, 9)
          for (const y of [132, 153, 174]) line(ctx, [[48, y], [101, y]], ink.steel, 3)
          rect(ctx, 168, 120, 112, 66, ink.board, ink.steel, 8)
          for (const y of [136, 153, 170]) {
            line(ctx, [[180, y], [216, y], [232, y + (BUS_Y - y) * 0.25], [268, y + (BUS_Y - y) * 0.25]], ink.gold, 2)
            dot(ctx, 180, y, 3.4, ink.gold)
          }
          if (cp) {
            rect(ctx, 328, 114, 88, 18, ink.dark, ink.steel)
            line(ctx, [[337, BUS_Y], [398, BUS_Y]], ink.gold, 3)
            for (const y of [143, 163]) line(ctx, [[337, y - 4], [369, y - 4], [398, y]], ink.gold, 3)
            rect(ctx, 483, 130, 84, 48, '#41668d', ink.wafer, 9)
            for (const x of [495, 515, 535, 555]) rect(ctx, x - 5, 139, 10, 28, ink.wafer)
          } else {
            rect(ctx, 327, 123, 96, 60, ink.dark, ink.steel, 7)
            line(ctx, [[337, BUS_Y], [413, BUS_Y]], ink.gold, 3)
            for (const y of [137, 169]) curve(ctx, `M337 ${y} H349 Q356 ${y - 13} 365 ${y} T382 ${y} H413`, ink.gold, 3)
            rect(ctx, 484, 128, 82, 35, ink.steel, ink.label, 6)
            for (const x of [494, 515, 536, 557]) dot(ctx, x, 169, 5, ink.gold)
          }
          const currentX = NODE_X[Math.floor(value)] + (value % 1) * ((NODE_X[Math.ceil(value)] ?? 525) - NODE_X[Math.floor(value)])
          ctx.shadowColor = ink.trace
          ctx.shadowBlur = 11
          line(ctx, [[75, BUS_Y], [currentX, BUS_Y]], ink.trace, 4)
          dot(ctx, currentX, BUS_Y, 6, ink.trace)
          ctx.shadowBlur = 0
          nodes.forEach((_, i) => {
            const active = Math.round(value) === i
            dot(ctx, NODE_X[i], 72, 14, active ? ink.trace : ink.dark)
            label(ctx, NODE_X[i], 72, String(i + 1), active ? ink.shadow : ink.light, 'center', 15)
            const names: LText[] = [loc('测试头', 'Test head'), cp ? loc('探针卡 PCB', 'Probe PCB') : loc('负载板', 'DIB'),
              cp ? loc('探针', 'Needles') : loc('测试座', 'Socket'), cp ? loc('裸片', 'Bare die') : loc('封装成品', 'Packaged DUT')]
            label(ctx, NODE_X[i], 224, t(names[i]), active ? ink.trace : ink.light, 'center', 18)
          })
          label(ctx, 300, 273, t(loc('沿一条测试信号通路追踪 →', 'Follow one test signal path →')), ink.label, 'center', 17)
        }} />
      <DiagramChoices label={title} items={nodes.map((node, i) => ({ id: String(i), title: node.title }))} value={String(step)} onPick={(id) => onStep(Number(id))} />
      <StagePlayer count={nodes.length} step={step} onStep={onStep} />
    </Diagram>
  )
}

export function BandwidthResponse({ bandwidth }: { bandwidth: number }) {
  const title = loc('串联电感的幅频响应', 'Series-inductance frequency response')
  return (
    <Diagram title={title} caption={loc('纵轴以低频幅度为 0 dB。拖动 L 或 Z₀，观察响应曲线与 −3 dB 虚线的交点怎样移动。', 'The low-frequency amplitude is the 0 dB reference. Adjust L or Z₀ and watch where the curve crosses the −3 dB guide.')}>
      <HardwareCanvas scene="bandwidth" description={loc(`响应曲线在约 ${bandwidth.toFixed(1)} GHz 降至 −3 dB`, `Frequency response reaches −3 dB near ${bandwidth.toFixed(1)} GHz`)}
        value={bandwidth} draw={(ctx, bw) => {
          const x = (f: number) => 78 + f * 23
          const y = (db: number) => 42 - db * 18
          for (const db of [0, -3, -6, -9, -12]) {
            line(ctx, [[x(0), y(db)], [x(20), y(db)]], db === -3 ? ink.gold : ink.dark, 1.3, db === -3 ? [6, 4] : [])
            label(ctx, 63, y(db), String(db), db === -3 ? ink.gold : ink.label, 'right', 16)
          }
          const values = Array.from({ length: 101 }, (_, i): readonly [number, number] => {
            const f = i / 5
            return [x(f), y(Math.max(-12, -10 * Math.log10(1 + (f / bw) ** 2)))]
          })
          ctx.save()
          ctx.beginPath()
          ctx.rect(x(0), y(0) - 3, x(20) - x(0) + 3, y(-12) - y(0) + 3)
          ctx.clip()
          line(ctx, values.filter(([, pointY], i) => pointY < y(-12) || (i > 0 && values[i - 1][1] < y(-12))), ink.trace, 4)
          ctx.restore()
          line(ctx, [[x(bw), y(-3)], [x(bw), y(-12)]], ink.gold, 1.5, [5, 4])
          dot(ctx, x(bw), y(-3), 5, ink.gold)
          label(ctx, x(bw), y(-3) - 18, `${bw.toFixed(1)} GHz`, ink.gold, bw > 17 ? 'right' : 'center', 18)
          for (const frequency of [0, 5, 10, 15, 20]) label(ctx, x(frequency), 280, frequency === 20 ? '20 GHz' : String(frequency), ink.label, 'center', 16)
          label(ctx, 66, 21, 'dB', ink.label, 'right', 16)
        }} />
    </Diagram>
  )
}
