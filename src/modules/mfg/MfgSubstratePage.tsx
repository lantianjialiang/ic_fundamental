import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Cards, Knob, Readout } from '../fund/parts'
import { escapeTraces, microstripZ0 } from './core'
import { CrossSection, EscapeDiagram } from './ProcessDiagrams'
import { DiagramChoices, Formula } from './FlowVisuals'
import { MFG_META } from './meta'
import { After, COMMON, Drill, PackLesson, near, useSticky } from './shell'
import { SubstrateSignalPath, type SubstrateKind } from './SubstrateTypes'

const KINDS = [
  { id: 'lf', title: loc('引线框架', 'Lead-frame'), text: loc('金属框架 + 塑封。节距粗，成本低。', 'A metal frame plus mold. Coarse pitch, low cost.') },
  { id: 'org', title: loc('有机积层', 'Organic build-up'), text: loc('core + 积层膜。细线、多层，常见于 BGA。积层膜名为概念示例。', 'Core plus build-up film. Fine lines, many layers, common in BGA. Film names are conceptual examples.') },
  { id: 'cer', title: loc('陶瓷', 'Ceramic'), text: loc('耐高温、气密，成本高。', 'High temperature and hermetic, at higher cost.') },
] satisfies { id: SubstrateKind; title: ReturnType<typeof loc>; text: ReturnType<typeof loc> }[]

const STACK = [
  { id: 'sm', title: loc('阻焊', 'Solder mask'), color: '#3d6b4a' },
  { id: 'bu1', title: loc('积层 1', 'Build-up 1'), color: '#d8c48a' },
  { id: 'core', title: loc('Core', 'Core'), color: '#c4a15a' },
  { id: 'bu2', title: loc('积层 2', 'Build-up 2'), color: '#d8c48a' },
  { id: 'ball', title: loc('球焊盘', 'Ball pads'), color: '#b0b8c0' },
]

const MAKERS = [
  { id: 'unimicron', title: loc('欣兴电子', 'Unimicron'), sub: loc('台湾 · 有机积层', 'Taiwan · organic build-up'), text: loc('有机积层基板的主要供应方之一。细线、多层的 ABF 一类是主业，也做高层 PCB。这一课的 core 加两侧积层，就是这类工厂在做的结构。', 'One of the main suppliers of organic build-up substrates. Fine-line, many-layer ABF-class boards are the main business, along with high-layer-count PCB. The core plus build-up on both sides in this lesson is the structure this kind of fab builds.') },
  { id: 'kinsus', title: loc('景硕科技', 'Kinsus'), sub: loc('台湾 · 封装基板', 'Taiwan · package substrate'), text: loc('封装基板，倒装和打线都做。节距和层数仍用这一课的逃逸和阻抗来定。', 'Package substrates for both flip-chip and wire-bond. Pitch and layer count are still set by the escape and impedance math in this lesson.') },
  { id: 'ibiden', title: loc('揖斐电', 'Ibiden'), sub: loc('日本 · 高端 ABF', 'Japan · high-end ABF'), text: loc('日本的高端有机基板。CPU、GPU 那种很密的扇出常落到这类工厂。线更细，良率和翘曲更紧，层数会在下一课乘进良率。', 'A Japanese maker of high-end organic substrates. The very dense escape of a CPU or GPU often lands at this kind of fab. Lines are finer, so yield and warpage get tighter, and layer count multiplies into yield in the next lesson.') },
  { id: 'ase', title: loc('日月光', 'ASE'), sub: loc('封测', 'OSAT'), text: loc('图里的太阳标。主业是封测：把芯片装到基板上，并做成品测试。封装用的基板向基板厂购买。它和欣兴出现在同一张图里，是因为封装要接基板。', 'The sun mark in the collage. The main business is OSAT: assemble the chip onto a substrate and run final test. The substrate itself is bought from a substrate fab. It shares the collage with Unimicron because assembly has to meet a substrate.') },
  { id: 'nanya', title: loc('南亚电路板', 'Nan Ya PCB'), sub: loc('台湾 · ABF / BT', 'Taiwan · ABF / BT'), text: loc('ABF 和 BT 两类有机基板。BT 多见于引线键合和存储，ABF 多见于更细的倒装。这是材料路线，逃逸公式不变。', 'Organic substrates in both ABF and BT. BT shows up more on wire-bond and memory; ABF shows up more on finer flip-chip. That is a material route. The escape formula stays the same.') },
  { id: 'kyocera', title: loc('京瓷', 'Kyocera'), sub: loc('日本 · 陶瓷', 'Japan · ceramic'), text: loc('陶瓷封装是它被认出来的原因，也做有机基板。陶瓷就是上面三种结构里的第三种：耐高温、气密，成本高。', 'Ceramic packages are what the name is recognized for, and it also builds organic substrates. Ceramic is the third structure above: high temperature, hermetic, at higher cost.') },
  { id: 'semco', title: loc('三星电机', 'Samsung Electro-Mechanics'), sub: loc('韩国 · FC-BGA', 'Korea · FC-BGA'), text: loc('做 FC-BGA 一类封装基板。这是三星电机，不是三星电子那家做芯片的公司。基板厂供应封装用的板，芯片公司是客户。', 'Builds FC-BGA package substrates. This is Samsung Electro-Mechanics, the component maker, rather than Samsung Electronics the chip company. A substrate fab supplies the board used in the package; the chip company is the customer.') },
  { id: 'shinko', title: loc('新光电气', 'Shinko Electric'), sub: loc('日本 · 倒装基板', 'Japan · flip-chip substrate'), text: loc('倒装用的封装基板。要做的事仍是把芯片节距拉开到板级。', 'Package substrates for flip-chip. The job is still fanning chip pitch out to board pitch.') },
  { id: 'simmtech', title: loc('Simmtech', 'Simmtech'), sub: loc('韩国 · 存储基板', 'Korea · memory substrates'), text: loc('存储器封装基板做得比较多。节距和层数通常没有高端 CPU 基板那么狠，但还是积层板，不是普通消费电子 PCB。', 'Memory package substrates are a large part of the work. Pitch and layer count are usually less extreme than a high-end CPU substrate, and it is still a build-up board, a different object from a consumer PCB.') },
  { id: 'daeduck', title: loc('大德电子', 'Daeduck'), sub: loc('韩国 · 存储 / FC-BGA', 'Korea · memory / FC-BGA'), text: loc('存储和 FC-BGA 基板。和 Simmtech 一样，记成有机基板的供应方。它不做测试用的负载板。', 'Memory and FC-BGA substrates. Like Simmtech, remember it as a supplier of organic substrates. It does not build the load board used in test.') },
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
  { id: 'q9', prompt: loc('这些公司名字会改变逃逸公式吗？', 'Do these company names change the escape formula?'), options: [
    { id: 'a', text: loc('会，每家厂有自己的公式', 'Yes, each fab has its own formula') },
    { id: 'b', text: loc('不会。公式只看节距、焊盘和线距；名字用来认出谁做有机积层、谁做陶瓷', 'No. The formula uses pitch, pad and space; the names say who builds organic build-up and who builds ceramic') },
    { id: 'c', text: loc('只影响颜色', 'Only the color') },
  ], answer: 'b', explain: loc('floor((节距−焊盘−间距)/(线宽+间距)) 里没有厂名。厂名说明谁能做这种层数和材料。日月光的主业是封测。', 'floor((pitch−pad−space)/(line+space)) has no fab name in it. The name says who can build that layer count and material. ASE main business is assembly and test.') },
]

export function MfgSubstratePage({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [kindId, setKindId] = useState<SubstrateKind>(KINDS[0].id)
  const [stackId, setStackId] = useState(STACK[0].id)
  const [makerId, setMakerId] = useState(MAKERS[0].id)
  const [h, setH] = useState(70)
  const [w, setW] = useState(50)
  const [th, setTh] = useState(15)
  const [eps, setEps] = useState(3.3)
  const [pitch, setPitch] = useState(180)
  const [pad, setPad] = useState(90)
  const [line, setLine] = useState(20)
  const kind = KINDS.find((item) => item.id === kindId) ?? KINDS[0]
  const maker = MAKERS.find((item) => item.id === makerId) ?? MAKERS[0]
  const z0 = microstripZ0(w, h, th, eps)
  const escape = escapeTraces(pitch, pad, line, line)
  const zHit = useSticky(h === 50 && w === 40 && th === 15 && near(eps, 3.3, 0.001))
  const tuneHit = useSticky(near(z0, 50, 3))
  const escHit = useSticky(pitch === 150 && pad === 80 && line === 15 && escape === 1)
  const zeroHit = useSticky(escape === 0)
  const ceramicHit = useSticky(makerId === 'kyocera')
  const osatHit = useSticky(makerId === 'ase')
  const taskZ = loc('把介质厚调到 50、线宽 40、线厚 15、εr 3.3，读特性阻抗。', 'Set dielectric to 50, width 40, thickness 15 and εr 3.3, then read the characteristic impedance.')
  const taskTune = loc('改线宽或介质厚，把阻抗调到 50 Ω 附近（±3 Ω）。', 'Change width or dielectric thickness until impedance is near 50 Ω (±3 Ω).')
  const taskEsc = loc('把节距调到 150、焊盘 80、线距 15，读两颗焊盘之间能走出几根线。', 'Set pitch to 150, pad to 80 and line/space to 15, then read how many traces fit between pads.')
  const taskZero = loc('把逃逸根数调成 0，再决定是加层还是放宽规则。', 'Make the escape count 0, then decide whether to add a layer or relax the rules.')
  const taskCeramic = loc('在公司卡片里点京瓷，读它对应哪一种基板结构。', 'On the company cards, select Kyocera and read which substrate structure it matches.')
  const taskOsat = loc('点日月光，读它在这条供应链上干什么。', 'Select ASE and read what it does on this supply chain.')

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
        { id: 't5', text: taskCeramic, done: ceramicHit.hit },
        { id: 't6', text: taskOsat, done: osatHit.hit },
      ]}
      onReset={() => {
        setKindId(KINDS[0].id)
        setStackId(STACK[0].id)
        setMakerId(MAKERS[0].id)
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
        ceramicHit.reset()
        osatHit.reset()
      }}
      learn={
        <div className="mfg-lab">
          <p>{t(loc('基板把芯片上的细间距扇出到板上的粗间距，同时走电源和地。点一种结构，读它适合什么。', 'A substrate fans the chip’s fine pitch out to the board’s coarse pitch, and it carries power and ground. Click a kind and read where it fits.'))}</p>
          <Cards items={KINDS} activeId={kindId} cols={3} onPick={(item) => setKindId(item.id)} />
          <p>{t(kind.text)}</p>
          <SubstrateSignalPath key={kindId} kind={kindId} />
          {kindId === 'org' && <>
          <p>{t(loc('点一层，辨认有机积层基板中的阻焊、积层、芯板和球焊盘。', 'Select a layer to locate the mask, build-up layers, core and ball pads in the organic substrate.'))}</p>
          <DiagramChoices label={loc('基板积层截面层', 'Substrate cross-section layers')} items={STACK} value={stackId} onPick={setStackId} />
          <CrossSection title={loc('有机积层基板从芯片侧到球端', 'Organic substrate from die side to ball side')} active={stackId}
            caption={loc('中心芯板提供支撑，上下积层布线通过微孔连接。阻焊在外层留出焊盘开口。', 'The core provides support. Microvias link the top and bottom build-up wiring to adjacent layers. Solder mask leaves pad openings on the outer surface.')}
            parts={[
              ['core', 10, 40, 80, 23, 'dielectric'], ['bu1', 10, 28, 80, 12, 'copper'],
              ['bu2', 10, 63, 80, 12, 'copper'], ['sm', 10, 22, 32, 6, 'unit'], ['sm', 58, 22, 32, 6, 'unit'],
              ['ball', 22, 75, 10, 7, 'seed'], ['ball', 45, 75, 10, 7, 'seed'], ['ball', 68, 75, 10, 7, 'seed'],
            ]} />
          </>}
          <p>{t(loc('微带线阻抗用 IPC 近似：Z0 = 87 / √(εr+1.41) × ln(5.98h / (0.8w+t))。介质更厚或线更窄，阻抗更高；εr 更大，阻抗更低。', 'Microstrip impedance uses an IPC approximation: Z0 = 87 / √(εr+1.41) × ln(5.98h / (0.8w+t)). A thicker dielectric or a narrower line raises impedance; a larger εr lowers it.'))}</p>
          <p>{t(loc('两颗焊盘之间能走的线数 = floor( (节距 − 焊盘 − 间距) / (线宽 + 间距) )。算出来是 0，这一层就扇不出去，要加一层或放宽线距。', 'Traces between two pads = floor( (pitch − pad − space) / (line + space) ). A result of 0 means this layer cannot escape, so add a layer or relax the line and space.'))}</p>
          <p>{t(loc('下面十个名字来自一张基板厂拼图，用来把结构和工厂对上。产品组合会变，这里不排名，也不当采购清单。点一家读它做什么。', 'The ten names below come from a collage of substrate fabs, so the structure can be matched to a factory. The product mix changes. This is not a ranking and not a shopping list. Click one and read what it builds.'))}</p>
          <Cards items={MAKERS} activeId={makerId} cols={2} onPick={(item) => setMakerId(item.id)} />
          <p>{t(maker.text)}</p>
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
            <Formula rule="Z₀ ≈ 87/√(εᵣ + 1.41) · ln(5.98h/(0.8w + t))" value={`${z0.toFixed(1)} Ω`} note={loc("图里上方是宽 w、厚 t 的铜走线；h 是走线底到参考平面之间的介质厚度，εᵣ 是相对介电常数。这个经验式用于教学微带近似。", "The upper trace is width w and thickness t. h is the dielectric height from its base to the reference plane. εᵣ is relative permittivity. This is a teaching approximation for microstrip.")}><CrossSection title={loc('走线与参考平面', 'Trace and reference plane')}
              caption={loc(`w = ${w} µm，t = ${th} µm，h = ${h} µm，εᵣ = ${eps}`, `w = ${w} µm, t = ${th} µm, h = ${h} µm, εᵣ = ${eps}`)}
              parts={[[ 'dielectric', 10, 72 - h / 2, 80, h / 2, 'dielectric' ], ['trace', 50 - w / 4, 72 - h / 2 - th / 2, w / 2, th / 2, 'copper'], ['plane', 10, 72, 80, 6, 'copper']]} /></Formula>
            <After show={zHit.hit} text={loc('这组尺寸代入近似式，得到约 74.2 Ω。它高于常见的 50 Ω，因为线相对介质偏窄。', 'Those sizes in the approximation give about 74.2 Ω. That is above the usual 50 Ω because the line is narrow for this dielectric.')} />
          </Drill>
          <Drill n={2} title={taskTune}>
            <p>{t(loc('继续用上面的四个旋钮。线加宽或介质变薄，阻抗会往下走。', 'Keep using the four knobs above. A wider line or a thinner dielectric brings impedance down.'))}</p>
            <Readout items={[
              { label: loc('对数的无量纲输入（长度均用 µm）', 'Dimensionless logarithm argument (all lengths in µm)'),
                value: `5.98 × ${h} / (0.8 × ${w} + ${th}) ≈ ${(5.98 * h / (0.8 * w + th)).toFixed(3)}` },
              { label: loc('你算出的 Z0', 'Z0 you got'),
                value: `87 / √(${eps} + 1.41) × ln(${(5.98 * h / (0.8 * w + th)).toFixed(3)}) ≈ ${z0.toFixed(1)} Ω` },
            ]} />
            <After show={tuneHit.hit} text={loc('落到 50±3 Ω，说明线宽、介质厚和 εr 配到了目标。只改线宽、不动 h 和 εr，往往调不到。', 'Landing inside 50±3 Ω means width, dielectric thickness and εr now match the target. Changing width alone, and leaving h and εr, often cannot get there.')} />
          </Drill>
          <Drill n={3} title={taskEsc}>
            <div className="knobs">
              <Knob label={loc('节距', 'Pitch')} value={pitch} unit="µm" min={120} max={200} step={10} onChange={setPitch} />
              <Knob label={loc('焊盘', 'Pad')} value={pad} unit="µm" min={60} max={100} step={10} onChange={setPad} />
              <Knob label={loc('线/距', 'Line/space')} value={line} unit="µm" min={10} max={25} step={5} onChange={setLine} />
            </div>
            <Formula rule="n = max(0, ⌊(p − d − s) / (w + s)⌋)" value={`max(0, ⌊(${pitch} − ${pad} − ${line}) / (${line} + ${line})⌋) = ${escape}`} note={loc("节距 p 减去焊盘直径 d，得到可用间隙。n 根线占 n·w，包含两边的 n+1 个绝缘间距。这里 w=s，算出负数时按 0 根处理。", "Pitch p minus pad diameter d gives the gap. n traces take n·w plus n+1 clearance spaces including both edges. Here w=s. A negative result means zero traces.")}><EscapeDiagram pitch={pitch} pad={pad} line={line} count={escape} /></Formula>
            <After show={escHit.hit} text={loc('(150−80−15) / (15+15) = 1.83，向下取整是 1。两颗焊盘之间只够走一根线。', '(150−80−15) / (15+15) = 1.83, which floors to 1. Only one trace fits between the two pads.')} />
          </Drill>
          <Drill n={4} title={taskZero}>
            <p>{t(loc('把节距缩小或焊盘、线距加大，直到根数变成 0。', 'Shrink the pitch, or grow the pad or the line/space, until the count becomes 0.'))}</p>
            <Readout items={[{ label: loc('你算出的逃逸根数', 'Escape traces you got'), value: `${escape}` }]} />
            <After show={zeroHit.hit} text={loc('空隙比一根线加一个间距还小，这一层扇不出去。要么再加一层走线，要么放宽线宽和间距。层数会在下一课连乘进良率。', 'The gap is smaller than one line plus one space, so this layer cannot escape. Add a routing layer, or relax width and space. Layer count multiplies into yield in the next lesson.')} />
          </Drill>
          <Drill n={5} title={taskCeramic}>
            <p>{t(loc('用上面的公司卡片。', 'Use the company cards above.'))}</p>
            <After show={ceramicHit.hit} text={loc('京瓷这里代表陶瓷。耐高温、气密，成本高，就是三种结构里的第三种。有机积层仍是 VDUT-MFG1 的默认。', 'Kyocera stands here for ceramic: high temperature, hermetic, at higher cost. That is the third of the three structures. Organic build-up stays the VDUT-MFG1 default.')} />
          </Drill>
          <Drill n={6} title={taskOsat}>
            <p>{t(loc('继续用上面的公司卡片。', 'Keep using the company cards above.'))}</p>
            <After show={osatHit.hit} text={loc('日月光做组装和成品测试。芯片要贴上去的那块基板，来自欣兴、揖斐电、京瓷这类工厂。拼图把它们放在一起，是因为封装要接基板。', 'ASE assembles the package and runs final test. The substrate the chip lands on comes from a fab such as Unimicron, Ibiden or Kyocera. The collage puts them together because assembly has to meet a substrate.')} />
          </Drill>
        </div>
      }
      misconceptions={[
        loc('基板只是小 PCB。节距、材料和翘曲要求都更严。', 'A substrate is not just a small PCB. Pitch, materials and warpage are tighter.'),
        loc('层数越多越好。成本和良率会一起掉。', 'More layers are not always better. Cost and yield fall together.'),
        loc('阻抗只跟线宽有关。h 和 εr 同样重要。', 'Impedance is not width-only. h and εr matter as much.'),
        loc('拼图里的每个标志都在造基板。日月光的主业是封测，基板向基板厂购买。', 'Every mark in that collage builds substrates. ASE main business is assembly and test; the substrate is bought from a substrate fab.'),
      ]}
      takeaway={[
        loc('剖面 = core + 积层 + 微孔/PTH + 阻焊。', 'The stack is core + build-up + microvia/PTH + solder mask.'),
        loc('先算 Z0 和逃逸容量，再决定层数。', 'Compute Z0 and escape capacity before choosing layer count.'),
      ]}
      quiz={QUIZ}
    />
  )
}
