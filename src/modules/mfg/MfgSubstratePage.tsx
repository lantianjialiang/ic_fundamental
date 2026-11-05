import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Cards, Knob, Readout } from '../fund/parts'
import { escapeTraces, microstripZ0 } from './core'
import { LayerBars } from './figs'
import { MFG_META } from './meta'
import { After, COMMON, Drill, PackLesson, near, useSticky } from './shell'

const KINDS = [
  { id: 'lf', title: loc('引线框架', 'Lead-frame'), text: loc('金属框架 + 塑封。节距粗，成本低。', 'A metal frame plus mold. Coarse pitch, low cost.') },
  { id: 'org', title: loc('有机积层', 'Organic build-up'), text: loc('core + 积层膜。细线、多层，常见于 BGA。积层膜名为概念示例。', 'Core plus build-up film. Fine lines, many layers, common in BGA. Film names are conceptual examples.') },
  { id: 'cer', title: loc('陶瓷', 'Ceramic'), text: loc('耐高温、气密，成本高。', 'High temperature and hermetic, at higher cost.') },
]

const STACK = [
  { id: 'sm', title: loc('阻焊', 'Solder mask'), color: '#3d6b4a' },
  { id: 'bu1', title: loc('积层 1', 'Build-up 1'), color: '#d8c48a' },
  { id: 'core', title: loc('Core', 'Core'), color: '#c4a15a' },
  { id: 'bu2', title: loc('积层 2', 'Build-up 2'), color: '#d8c48a' },
  { id: 'ball', title: loc('球焊盘', 'Ball pads'), color: '#b0b8c0' },
]

const QUIZ = [
  { id: 'q1', prompt: loc('基板的主要作用？', 'Main job of a substrate?'), options: [
    { id: 'a', text: loc('把芯片节距扇出到板级，并供电/走信号', 'Fan chip pitch out to board pitch, and carry power / signals') },
    { id: 'b', text: loc('替代晶圆', 'Replace the wafer') },
    { id: 'c', text: loc('只做散热', 'Only heat') },
  ], answer: 'a', explain: loc('它不是“小 PCB”那么简单：节距、材料和翘曲都更严。', 'It is not just a small PCB: pitch, materials and warpage are tighter.') },
  { id: 'q2', prompt: loc('层数是否越多越好？', 'Are more layers always better?'), options: [
    { id: 'a', text: loc('是，布线永远更轻松', 'Yes; routing is always easier') },
    { id: 'b', text: loc('不是：成本、良率和翘曲都会变差', 'No: cost, yield and warpage all get worse') },
    { id: 'c', text: loc('只影响颜色', 'Only color') },
  ], answer: 'b', explain: loc('先用逃逸容量判断要不要加层。', 'Use escape capacity before adding a layer.') },
  { id: 'q3', prompt: loc('h=50、w=40、t=15 µm、εr=3.3 的 Z0？', 'Z0 at h=50, w=40, t=15 µm, εr=3.3?'), options: [
    { id: 'a', text: loc('50 Ω', '50 Ω') },
    { id: 'b', text: loc('约 74.2 Ω', 'About 74.2 Ω') },
    { id: 'c', text: loc('100 Ω', '100 Ω') },
  ], answer: 'b', explain: loc('IPC 微带近似，教学示意。', 'IPC microstrip approximation; teaching illustration.') },
  { id: 'q4', prompt: loc('阻抗只跟线宽有关吗？', 'Does impedance depend only on width?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是，还跟介质厚度、εr 和线厚有关', 'No; height, εr and thickness also matter') },
    { id: 'c', text: loc('只跟铜纯度有关', 'Only copper purity') },
  ], answer: 'b', explain: loc('Z0≈87/√(εr+1.41)·ln(5.98h/(0.8w+t))。', 'Z0≈87/√(εr+1.41)·ln(5.98h/(0.8w+t)).') },
  { id: 'q5', prompt: loc('节距 150、焊盘 80、线/距 15/15 的逃逸走线数？', 'Escape traces at pitch 150, pad 80, 15/15?'), options: [
    { id: 'a', text: loc('0', '0') },
    { id: 'b', text: loc('1', '1') },
    { id: 'c', text: loc('3', '3') },
  ], answer: 'b', explain: loc('floor((150−80−15)/(15+15))=1。', 'floor((150−80−15)/(15+15))=1.') },
  { id: 'q6', prompt: loc('core 的作用？', 'What is the core for?'), options: [
    { id: 'a', text: loc('提供刚性，积层贴在两侧', 'Stiffness; build-up is added on both sides') },
    { id: 'b', text: loc('只做装饰', 'Decoration only') },
    { id: 'c', text: loc('代替阻焊', 'It replaces solder mask') },
  ], answer: 'a', explain: loc('太薄会翘，太厚钻孔更难。', 'Too thin warps; too thick is harder to drill.') },
  { id: 'q7', prompt: loc('激光微孔和 PTH 的差别？', 'Laser microvia vs PTH?'), options: [
    { id: 'a', text: loc('微孔连相邻积层，PTH 打穿 core', 'A microvia joins adjacent build-up; a PTH goes through the core') },
    { id: 'b', text: loc('完全一样', 'They are the same') },
    { id: 'c', text: loc('PTH 更细', 'PTH is finer') },
  ], answer: 'a', explain: loc('细线路靠微孔，粗电源靠 PTH。', 'Fine signals use microvias; coarse power uses PTH.') },
  { id: 'q8', prompt: loc('ball map 逃逸不够时怎么办？', 'If the ball map cannot escape?'), options: [
    { id: 'a', text: loc('加层或放宽线距/节距', 'Add a layer, or relax line/space or pitch') },
    { id: 'b', text: loc('忽略 DRC', 'Ignore DRC') },
    { id: 'c', text: loc('改用更粗的线硬塞', 'Force thicker traces through') },
  ], answer: 'a', explain: loc('先算逃逸容量，再决定层数。', 'Compute escape capacity before choosing layers.'),
  },
]

export function MfgSubstratePage({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [kindId, setKindId] = useState(KINDS[0].id)
  const [stackId, setStackId] = useState(STACK[0].id)
  const [h, setH] = useState(70)
  const [w, setW] = useState(50)
  const [th, setTh] = useState(15)
  const [eps, setEps] = useState(3.3)
  const [pitch, setPitch] = useState(180)
  const [pad, setPad] = useState(90)
  const [line, setLine] = useState(20)
  const kind = KINDS.find((item) => item.id === kindId) ?? KINDS[0]
  const z0 = microstripZ0(w, h, th, eps)
  const escape = escapeTraces(pitch, pad, line, line)
  const zHit = useSticky(h === 50 && w === 40 && th === 15 && near(eps, 3.3, 0.001))
  const tuneHit = useSticky(near(z0, 50, 3))
  const escHit = useSticky(pitch === 150 && pad === 80 && line === 15 && escape === 1)
  const zeroHit = useSticky(escape === 0)
  const taskZ = loc('把介质厚调到 50、线宽 40、线厚 15、εr 3.3，读特性阻抗。', 'Set dielectric to 50, width 40, thickness 15 and εr 3.3, then read the characteristic impedance.')
  const taskTune = loc('改线宽或介质厚，把阻抗调到 50 Ω 附近（±3 Ω）。', 'Change width or dielectric thickness until impedance is near 50 Ω (±3 Ω).')
  const taskEsc = loc('把节距调到 150、焊盘 80、线距 15，读两颗焊盘之间能走出几根线。', 'Set pitch to 150, pad to 80 and line/space to 15, then read how many traces fit between pads.')
  const taskZero = loc('把逃逸根数调成 0，再决定是加层还是放宽规则。', 'Make the escape count 0, then decide whether to add a layer or relax the rules.')

  return (
    <PackLesson
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      meta={MFG_META.mfgSubstrate}
      nextId="mfgSubFab"
      nextLabel={loc('下一课：基板制造工艺', 'Next: substrate manufacturing')}
      later={loc('基板布线会影响 DIB 映射和高速完整性，见 {@hsChannel}。', 'Substrate routing hits DIB mapping and high-speed integrity; see {@hsChannel}.')}
      intro={[
        loc('封装基板把芯片上的细节距扇出到板上的粗节距，并提供电源和地。有机积层是 VDUT-MFG1 的默认结构。', 'A package substrate fans a fine chip pitch out to a coarse board pitch and carries power and ground. Organic build-up is the VDUT-MFG1 default.'),
        loc('积层膜等材料名只作概念示例。阻抗公式是 IPC 教学近似。', 'Build-up film names are conceptual examples. The impedance formula is an IPC teaching approximation.'),
      ]}
      related={['pcbStack', 'mfgSubFab', 'hsChannel']}
      kicker={COMMON.kicker}
      asideTitle={kind.title}
      asideText={kind.text}
      notice={COMMON.vendor}
      tasks={[
        { id: 't1', text: taskZ, done: zHit.hit },
        { id: 't2', text: taskTune, done: tuneHit.hit },
        { id: 't3', text: taskEsc, done: escHit.hit },
        { id: 't4', text: taskZero, done: zeroHit.hit },
      ]}
      onReset={() => {
        setKindId(KINDS[0].id)
        setStackId(STACK[0].id)
        setH(70)
        setW(50)
        setTh(15)
        setEps(3.3)
        setPitch(180)
        setPad(90)
        setLine(20)
        zHit.reset()
        tuneHit.reset()
        escHit.reset()
        zeroHit.reset()
      }}
      learn={
        <div className="mfg-lab">
          <p>{t(loc('基板把芯片上的细间距扇出到板上的粗间距，同时走电源和地。点一种结构，读它适合什么。', 'A substrate fans the chip’s fine pitch out to the board’s coarse pitch, and it carries power and ground. Click a kind and read where it fits.'))}</p>
          <Cards items={KINDS} activeId={kindId} cols={3} onPick={(item) => setKindId(item.id)} />
          <p>{t(kind.text)}</p>
          <p>{t(loc('从上到下点一层，看信号走在哪。', 'Click a layer from the top and see where the signal runs.'))}</p>
          <LayerBars layers={STACK} activeId={stackId} onPick={setStackId} />
          <p>{t(loc('微带线阻抗用 IPC 近似：Z0 = 87 / √(εr+1.41) × ln(5.98h / (0.8w+t))。介质更厚或线更窄，阻抗更高；εr 更大，阻抗更低。', 'Microstrip impedance uses an IPC approximation: Z0 = 87 / √(εr+1.41) × ln(5.98h / (0.8w+t)). A thicker dielectric or a narrower line raises impedance; a larger εr lowers it.'))}</p>
          <p>{t(loc('两颗焊盘之间能走的线数 = floor( (节距 − 焊盘 − 间距) / (线宽 + 间距) )。算出来是 0，这一层就扇不出去，要加一层或放宽线距。', 'Traces between two pads = floor( (pitch − pad − space) / (line + space) ). A result of 0 means this layer cannot escape, so add a layer or relax the line and space.'))}</p>
        </div>
      }
      practice={
        <div className="mfg-lab">
          <Drill n={1} title={taskZ}>
            <div className="knobs">
              <Knob label={loc('介质厚 h', 'Dielectric h')} value={h} unit="µm" min={30} max={80} step={5} onChange={setH} />
              <Knob label={loc('线宽 w', 'Width w')} value={w} unit="µm" min={20} max={60} step={5} onChange={setW} />
              <Knob label={loc('线厚 t', 'Thickness t')} value={th} unit="µm" min={10} max={20} step={5} onChange={setTh} />
              <Knob label={loc('εr', 'εr')} value={eps} unit="" min={3} max={4.2} step={0.1} onChange={setEps} />
            </div>
            <Readout items={[{ label: loc('你算出的 Z0', 'Z0 you got'), value: `${z0.toFixed(1)} Ω` }]} />
            <After show={zHit.hit} text={loc('这组尺寸代入近似式，得到约 74.2 Ω。它高于常见的 50 Ω，因为线相对介质偏窄。', 'Those sizes in the approximation give about 74.2 Ω. That is above the usual 50 Ω because the line is narrow for this dielectric.')} />
          </Drill>
          <Drill n={2} title={taskTune}>
            <p>{t(loc('继续用上面的四个旋钮。线加宽或介质变薄，阻抗会往下走。', 'Keep using the four knobs above. A wider line or a thinner dielectric brings impedance down.'))}</p>
            <Readout items={[{ label: loc('你算出的 Z0', 'Z0 you got'), value: `${z0.toFixed(1)} Ω` }]} />
            <After show={tuneHit.hit} text={loc('落到 50±3 Ω，说明线宽、介质厚和 εr 配到了目标。只改线宽、不动 h 和 εr，往往调不到。', 'Landing inside 50±3 Ω means width, dielectric thickness and εr now match the target. Changing width alone, and leaving h and εr, often cannot get there.')} />
          </Drill>
          <Drill n={3} title={taskEsc}>
            <div className="knobs">
              <Knob label={loc('节距', 'Pitch')} value={pitch} unit="µm" min={120} max={200} step={10} onChange={setPitch} />
              <Knob label={loc('焊盘', 'Pad')} value={pad} unit="µm" min={60} max={100} step={10} onChange={setPad} />
              <Knob label={loc('线/距', 'Line/space')} value={line} unit="µm" min={10} max={25} step={5} onChange={setLine} />
            </div>
            <Readout items={[{ label: loc('你算出的逃逸根数', 'Escape traces you got'), value: `${escape}` }]} />
            <After show={escHit.hit} text={loc('(150−80−15) / (15+15) = 1.83，向下取整是 1。两颗焊盘之间只够走一根线。', '(150−80−15) / (15+15) = 1.83, which floors to 1. Only one trace fits between the two pads.')} />
          </Drill>
          <Drill n={4} title={taskZero}>
            <p>{t(loc('把节距缩小或焊盘、线距加大，直到根数变成 0。', 'Shrink the pitch, or grow the pad or the line/space, until the count becomes 0.'))}</p>
            <Readout items={[{ label: loc('你算出的逃逸根数', 'Escape traces you got'), value: `${escape}` }]} />
            <After show={zeroHit.hit} text={loc('空隙比一根线加一个间距还小，这一层扇不出去。要么再加一层走线，要么放宽线宽和间距。层数会在下一课连乘进良率。', 'The gap is smaller than one line plus one space, so this layer cannot escape. Add a routing layer, or relax width and space. Layer count multiplies into yield in the next lesson.')} />
          </Drill>
        </div>
      }
      misconceptions={[
        loc('基板只是小 PCB。节距、材料和翘曲要求都更严。', 'A substrate is not just a small PCB. Pitch, materials and warpage are tighter.'),
        loc('层数越多越好。成本和良率会一起掉。', 'More layers are not always better. Cost and yield fall together.'),
        loc('阻抗只跟线宽有关。h 和 εr 同样重要。', 'Impedance is not width-only. h and εr matter as much.'),
      ]}
      takeaway={[
        loc('剖面 = core + 积层 + 微孔/PTH + 阻焊。', 'The stack is core + build-up + microvia/PTH + solder mask.'),
        loc('先算 Z0 和逃逸容量，再决定层数。', 'Compute Z0 and escape capacity before choosing layer count.'),
      ]}
      quiz={QUIZ}
    />
  )
}
