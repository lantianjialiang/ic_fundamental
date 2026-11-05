import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Cards, Knob, Readout } from '../fund/parts'
import { poissonYield, siliconPerGoodMm2 } from './core'
import { PackageCut, YieldBars } from '../mfg/figs'
import { After, COMMON, Drill, PackLesson, near, useSticky } from '../mfg/shell'
import { APK_META } from './meta'

const KINDS = [
  { id: 'd2', title: loc('2D', '2D'), text: loc('引线键合或倒装，die 躺在基板上。', 'Wire-bond or flip-chip; the die sits on the substrate.') },
  { id: 'd25', title: loc('2.5D', '2.5D'), text: loc('中介层把多个 die 并排放在一起，用细线互连。', 'An interposer places several dies side by side with fine wiring.') },
  { id: 'd3', title: loc('3D', '3D'), text: loc('die 竖向堆叠，靠 TSV 或混合键合。', 'Dies stack vertically through TSVs or hybrid bonding.') },
  { id: 'fo', title: loc('扇出 / SiP', 'Fan-out / SiP'), text: loc('RDL 重新布线，或多个功能封进同一壳体。', 'RDL redistributes I/O, or several functions share one shell.') },
]

const PARTS = [
  { id: 'lid', title: loc('盖板', 'Lid'), y: 18, h: 16, color: '#b0b8c0' },
  { id: 'die', title: loc('Die / chiplet', 'Die / chiplet'), y: 38, h: 28, color: '#7eb8c9' },
  { id: 'bump', title: loc('凸点', 'Bumps'), y: 68, h: 12, color: '#f4d27a' },
  { id: 'intp', title: loc('中介层 / TSV', 'Interposer / TSV'), y: 82, h: 28, color: '#9ec27c' },
  { id: 'c4', title: loc('C4', 'C4'), y: 112, h: 12, color: '#d8a45a' },
  { id: 'sub', title: loc('基板', 'Substrate'), y: 126, h: 36, color: '#c4a15a' },
  { id: 'ball', title: loc('焊球', 'Balls'), y: 164, h: 14, color: '#b0b8c0' },
]

const QUIZ = [
  { id: 'q1', prompt: loc('光罩极限 26×33 mm 是多少？', 'What is the 26×33 mm reticle limit?'), options: [
    { id: 'a', text: loc('500 mm²', '500 mm²') },
    { id: 'b', text: loc('858 mm²', '858 mm²') },
    { id: 'c', text: loc('1000 mm²', '1000 mm²') },
  ], answer: 'b', explain: loc('26×33=858。再大就要拼接或拆 chiplet。', '26×33=858. Larger needs stitching or chiplets.') },
  { id: 'q2', prompt: loc('D0=0.1、800 mm² 单片良率？', 'Poisson yield at D0=0.1, 800 mm²?'), options: [
    { id: 'a', text: loc('约 0.45', 'About 0.45') },
    { id: 'b', text: loc('0.90', '0.90') },
    { id: 'c', text: loc('1.00', '1.00') },
  ], answer: 'a', explain: loc('exp(−0.1×8)≈0.449。大 die 良率掉得很快。', 'exp(−0.1×8)≈0.449. Large-die yield falls fast.') },
  { id: 'q3', prompt: loc('拆成 4 个 200 mm² 的良率？', 'Yield of four 200 mm² chiplets?'), options: [
    { id: 'a', text: loc('仍是 0.45', 'Still 0.45') },
    { id: 'b', text: loc('约 0.82', 'About 0.82') },
    { id: 'c', text: loc('0.20', '0.20') },
  ], answer: 'b', explain: loc('exp(−0.1×2)≈0.819。前提是拆开后能测成 KGD。', 'exp(−0.1×2)≈0.819. Only if each piece can be tested as KGD.') },
  { id: 'q4', prompt: loc('chiplet 一定更便宜吗？', 'Are chiplets always cheaper?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不一定：组装、测试和互连会吃掉硅上的节省', 'Not always: assembly, test and interconnect can eat the silicon saving') },
    { id: 'c', text: loc('永远更贵', 'Always more expensive') },
  ], answer: 'b', explain: loc('好硅消耗面积更低，但封装账单会涨。', 'Silicon per good die falls, but the package bill rises.') },
  { id: 'q5', prompt: loc('2.5D 和 3D 只是叫法不同吗？', 'Are 2.5D and 3D only names?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是：2.5D 并排走中介层，3D 竖向堆叠', 'No: 2.5D is side-by-side on an interposer; 3D stacks vertically') },
    { id: 'c', text: loc('3D 一定不用 TSV', '3D never uses TSVs') },
  ], answer: 'b', explain: loc('热、测试访问和良率连乘也不一样。', 'Heat, test access and yield product differ too.') },
  { id: 'q6', prompt: loc('先进封装只为性能吗？', 'Is advanced packaging only for performance?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是：还有良率、成本和异构工艺', 'No: also yield, cost and heterogeneous processes') },
    { id: 'c', text: loc('只为外观', 'Only cosmetics') },
  ], answer: 'b', explain: loc('把 DRAM 和逻辑用不同节点做，再封在一起。', 'DRAM and logic can use different nodes, then share a package.') },
  { id: 'q7', prompt: loc('RDL 是什么？', 'What is RDL?'), options: [
    { id: 'a', text: loc('重布线层，把焊盘重新排到新的节距', 'A redistribution layer that moves pads to a new pitch') },
    { id: 'b', text: loc('一种光刻机', 'A stepper') },
    { id: 'c', text: loc('老化炉', 'A burn-in oven') },
  ], answer: 'a', explain: loc('扇出封装主要靠 RDL。', 'Fan-out packages lean on RDL.') },
  { id: 'q8', prompt: loc('chiplet 的测试前提是？', 'What test premise do chiplets need?'), options: [
    { id: 'a', text: loc('拆开后能单独测准，也就是 KGD', 'Each piece can be tested on its own — KGD') },
    { id: 'b', text: loc('封装后再测一次就够', 'One test after assembly is enough') },
    { id: 'c', text: loc('不用测', 'No test') },
  ], answer: 'a', explain: loc('测不准就只是把坏硅拼在一起。综合课 {@apkFlow}。', 'Without that you are only stacking bad silicon. Capstone: {@apkFlow}.'),
  },
]

export function ApkOverviewPage({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [kindId, setKindId] = useState(KINDS[0].id)
  const [partId, setPartId] = useState(PARTS[0].id)
  const [quizPart, setQuizPart] = useState('')
  const [d0, setD0] = useState(0.2)
  const [area, setArea] = useState(400)
  const [n, setN] = useState(1)
  const kind = KINDS.find((item) => item.id === kindId) ?? KINDS[0]
  const part = PARTS.find((item) => item.id === partId) ?? PARTS[0]
  const piece = area / n
  const yMono = poissonYield(d0, area)
  const ySplit = poissonYield(d0, piece)
  const siMono = siliconPerGoodMm2(d0, area)
  const siSplit = n * siliconPerGoodMm2(d0, piece)
  const monoHit = useSticky(near(d0, 0.1, 0.001) && area === 800 && n === 1)
  const splitHit = useSticky(near(d0, 0.1, 0.001) && area === 800 && n === 4)
  const siHit = useSticky(splitHit.hit)
  const partHit = useSticky(quizPart === 'ball')
  const taskMono = loc('把 D0 调到 0.1、总面积调到 800、chiplet 数保持 1，读单片良率。', 'Set D0 to 0.1, total area to 800 and chiplets to 1, then read the monolithic yield.')
  const taskSplit = loc('把同一块面积拆成 4 颗，读单颗良率。', 'Split that same area into 4 pieces and read the yield of one piece.')
  const taskSi = loc('在拆成 4 颗的设置下，读两种做法各自要消耗多少硅才得到一颗好的。', 'With the 4-piece setting, read how much silicon each approach spends to get one good die.')
  const taskPart = loc('在剖面上点到焊球，读它为什么在最外面。', 'On the cross-section, click the solder balls and read why they sit on the outside.')

  return (
    <PackLesson
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      meta={APK_META.apkOverview}
      nextId="apkBond"
      nextLabel={loc('下一课：封装互连', 'Next: package interconnect')}
      later={loc('全流程位置见 {@mfgOverview}；KGD 综合见 {@apkFlow}。', 'Where this sits in the full flow: {@mfgOverview}; KGD capstone: {@apkFlow}.')}
      intro={[
        loc('单片大芯片会撞上光罩极限和良率。先看 2D、2.5D、3D 各把 die 放在哪，再算拆开之后良率为什么变。', 'A large monolithic die hits the reticle limit and yield. See where 2D, 2.5D and 3D put the dies, then calculate why splitting changes yield.'),
        loc('贯穿案例 VDUT-APK1：GPU/ASIC + 4 个 HBM + 中介层 + 基板。数字是教学示意。', 'Running example VDUT-APK1: GPU/ASIC + 4 HBM stacks + interposer + substrate. Numbers are teaching illustrations.'),
      ]}
      related={['mfgOverview', 'apkFlow', 'picFlow']}
      kicker={COMMON.kicker}
      asideTitle={part.title}
      asideText={kind.text}
      notice={COMMON.vendor}
      tasks={[
        { id: 't1', text: taskMono, done: monoHit.hit },
        { id: 't2', text: taskSplit, done: splitHit.hit },
        { id: 't3', text: taskSi, done: siHit.hit },
        { id: 't4', text: taskPart, done: partHit.hit },
      ]}
      onReset={() => {
        setKindId(KINDS[0].id)
        setPartId(PARTS[0].id)
        setQuizPart('')
        setD0(0.2)
        setArea(400)
        setN(1)
        monoHit.reset()
        splitHit.reset()
        siHit.reset()
        partHit.reset()
      }}
      learn={
        <div className="mfg-lab">
          <p>{t(loc('四种摆法。点一种，读 die 是躺在基板上、并排在中介层上，还是竖着叠。', 'Four arrangements. Click one and read whether the die lies on a substrate, sits side by side on an interposer, or stacks vertically.'))}</p>
          <Cards items={KINDS} activeId={kindId} cols={4} onPick={(item) => setKindId(item.id)} />
          <p>{t(kind.text)}</p>
          <p>{t(loc('光罩一次曝光大约盖住 26×33 mm，也就是 858 mm²。再大就要拼接，或者把一颗大 die 拆成几颗 chiplet。', 'One reticle exposure covers about 26×33 mm, which is 858 mm². Larger than that needs stitching, or the big die has to be split into chiplets.'))}</p>
          <p>{t(loc('良率按 Poisson：Y = exp(−D0 × 面积)。面积用 cm²。800 mm² 是 8 cm²。面积变成四分之一，指数里的乘积也变成四分之一，良率会高很多。前提是每颗都能单独测准。', 'Yield follows Poisson: Y = exp(−D0 × area), with area in cm². 800 mm² is 8 cm². At a quarter of the area the product inside the exponential is also a quarter, so yield is much higher. That only helps if each piece can be tested on its own.'))}</p>
          <p>{t(loc('得到一颗好 die 要消耗的硅 ≈ 面积 / 良率。单片良率低，就要投进更多硅才换来一颗好的。', 'Silicon spent per good die ≈ area / yield. A low monolithic yield means more silicon has to be started to finish one good die.'))}</p>
          <p>{t(loc('点剖面里的一层，看信号从 die 出去要经过凸点、中介层、C4、基板，最后才是板上的焊球。', 'Click a layer in the cross-section. A signal leaves the die through bumps, the interposer, C4 and the substrate, and only then the board-level balls.'))}</p>
          <PackageCut parts={PARTS} activeId={partId} onPick={setPartId} />
          <p>{t(part.title)}</p>
        </div>
      }
      practice={
        <div className="mfg-lab">
          <Drill n={1} title={taskMono}>
            <div className="knobs">
              <Knob label={loc('D0', 'D0')} value={d0} unit="/cm²" min={0.05} max={0.5} step={0.05} onChange={setD0} />
              <Knob label={loc('总面积', 'Total area')} value={area} unit="mm²" min={200} max={800} step={200} onChange={setArea} />
              <Knob label={loc('chiplet 数', 'Chiplets')} value={n} unit="" min={1} max={8} step={1} onChange={setN} />
            </div>
            <Readout items={[{ label: loc('你算出的单片良率', 'Monolithic yield you got'), value: yMono.toFixed(3) }]} />
            <After show={monoHit.hit} text={loc('800 mm² = 8 cm²，exp(−0.1×8) ≈ 0.449。面积在指数里，所以大 die 的良率掉得很快。', '800 mm² = 8 cm², and exp(−0.1×8) ≈ 0.449. Area sits in the exponential, so a large die’s yield falls fast.')} />
          </Drill>
          <Drill n={2} title={taskSplit}>
            <Knob label={loc('chiplet 数', 'Chiplets')} value={n} unit="" min={1} max={8} step={1} onChange={setN} />
            <YieldBars items={[{ title: loc('单片', 'Mono'), value: yMono }, { title: loc('拆开后的一颗', 'One piece'), value: ySplit }]} />
            <Readout items={[{ label: loc('你算出的单颗良率', 'Piece yield you got'), value: ySplit.toFixed(3) }]} />
            <After show={splitHit.hit} text={loc('4 颗各 200 mm² = 2 cm²，exp(−0.1×2) ≈ 0.819。每颗都好测了，才能把这个良率用上。', 'Four pieces of 200 mm² are 2 cm² each, and exp(−0.1×2) ≈ 0.819. That yield is usable only if each piece can be tested.')} />
          </Drill>
          <Drill n={3} title={taskSi}>
            <Readout items={[
              { label: loc('单片：一颗好的要多少硅', 'Mono: silicon per good die'), value: `${siMono.toFixed(0)} mm²` },
              { label: loc('拆分：四颗合起来', 'Split: all four pieces'), value: `${siSplit.toFixed(0)} mm²` },
            ]} />
            <After show={siHit.hit} text={loc('单片约 800/0.449 ≈ 1780 mm² 才换一颗好的。拆开后每颗约 200/0.819，四颗合计约 977 mm²。硅省下来了，封装和测试的账单会在后面几课加回去。', 'The monolithic die spends about 800/0.449 ≈ 1780 mm² per good die. Split, each piece is about 200/0.819, and four of them are about 977 mm². The silicon is saved; package and test bills come back in the later lessons.')} />
          </Drill>
          <Drill n={4} title={taskPart}>
            <PackageCut parts={PARTS} activeId={quizPart} onPick={setQuizPart} />
            <After show={quizPart !== ''} text={quizPart === 'ball'
              ? loc('焊球在最外面，因为它要焊到系统板上。在它里面，die 的信号已经走过凸点、中介层和基板。越往外才发现的缺陷，里面这些都已经做完了。', 'The balls are on the outside because they solder to the system board. Inside them, the die’s signals have already crossed bumps, the interposer and the substrate. A defect found this far out has already paid for all of that.')
              : loc('再看位置。焊球贴着系统板，在剖面的最外一层。凸点、中介层和基板都在它里面。', 'Look at the position again. The balls meet the system board, on the outer layer of the drawing. Bumps, the interposer and the substrate are inside them.')} />
          </Drill>
        </div>
      }
      misconceptions={[
        loc('chiplet 一定更便宜。封装和测试账单可能把硅上的节省吃掉。', 'Chiplets are not automatically cheaper. Package and test can eat the silicon saving.'),
        loc('2.5D 与 3D 只是叫法。一个并排，一个堆叠。', '2.5D and 3D are not just names. One is side-by-side, the other stacks.'),
        loc('先进封装只为性能。良率和异构工艺同样是动因。', 'Advanced packaging is not only for speed. Yield and mixed processes matter too.'),
      ]}
      takeaway={[
        loc('光罩极限 858 mm²；大面积良率按 exp(−D0·A) 掉。', 'Reticle limit 858 mm²; large-area yield falls as exp(−D0·A).'),
        loc('chiplet 能省硅，前提是拆开后能测成 KGD。', 'Chiplets save silicon only if the pieces can be tested as KGD.'),
      ]}
      quiz={QUIZ}
    />
  )
}
