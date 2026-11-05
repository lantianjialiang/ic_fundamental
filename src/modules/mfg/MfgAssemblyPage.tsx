import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Cards, Knob, Readout, Seg } from '../fund/parts'
import { flowYieldCost, product } from './core'
import { YieldBars } from './figs'
import { MFG_META } from './meta'
import { After, COMMON, Drill, PackLesson, near, useSticky } from './shell'

const PKGS = [
  { id: 'wb', title: loc('引线键合 BGA', 'Wire-bond BGA'), text: loc('贴片 → 焊线 → 塑封 → 植球。电感较大，成本较低。', 'Attach → wire → mold → ball. Larger inductance, lower cost.') },
  { id: 'fc', title: loc('倒装 BGA', 'Flip-chip BGA'), text: loc('倒装回流 → 底部填充 → 植球。面阵互连，热和翘曲更敏感。', 'Flip, reflow → underfill → ball. Area-array interconnect; more sensitive to heat and warpage.') },
]

const STEPS_WB = [
  { id: 'thin', title: loc('减薄', 'Thin'), y: 0.999, cost: 0.2 },
  { id: 'saw', title: loc('切割', 'Saw'), y: 0.998, cost: 0.3 },
  { id: 'attach', title: loc('贴片', 'Die attach'), y: 0.998, cost: 0.4 },
  { id: 'bond', title: loc('键合', 'Bond'), y: 0.995, cost: 0.8 },
  { id: 'mold', title: loc('塑封', 'Mold'), y: 0.998, cost: 0.5 },
  { id: 'ball', title: loc('植球', 'Ball'), y: 0.997, cost: 0.4 },
  { id: 'mark', title: loc('打标', 'Mark'), y: 0.999, cost: 0.1 },
]

const QUIZ = [
  { id: 'q1', prompt: loc('默认 7 步良率乘积？', 'Product of the default 7 step yields?'), options: [
    { id: 'a', text: loc('1.000', '1.000') },
    { id: 'b', text: loc('0.9841', '0.9841') },
    { id: 'c', text: loc('0.900', '0.900') },
  ], answer: 'b', explain: loc('0.999×0.998×0.998×0.995×0.998×0.997×0.999≈0.9841。', '0.999×0.998×0.998×0.995×0.998×0.997×0.999≈0.9841.') },
  { id: 'q2', prompt: loc('FT 失败都是封装造成的吗？', 'Are FT fails always assembly?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是：还有 CP 漏检和应力激发', 'No: CP escapes and stress-activated fails also show up') },
    { id: 'c', text: loc('只可能是 Socket', 'Only the socket') },
  ], answer: 'b', explain: loc('fallout 要分解来源，不能一锅端。', 'Split the fallout; do not dump it all on assembly.') },
  { id: 'q3', prompt: loc('CP 覆盖率从 0.97 降到 0.90 会怎样？', 'What if CP coverage falls from 0.97 to 0.90?'), options: [
    { id: 'a', text: loc('封装后报废变多，因为坏 die 被装进去了', 'More post-assembly scrap, because bad die were packaged') },
    { id: 'b', text: loc('更便宜', 'It gets cheaper') },
    { id: 'c', text: loc('没有影响', 'No effect') },
  ], answer: 'a', explain: loc('坏 die 被封装的损失 = 该点之后已发生的步骤成本。', 'The cost of packaging a bad die is every step after that point.') },
  { id: 'q4', prompt: loc('组装良率可以当 100% 忽略吗？', 'Can assembly yield be treated as 100%?'), options: [
    { id: 'a', text: loc('可以', 'Yes') },
    { id: 'b', text: loc('不可以，连乘之后往往掉到 98% 左右', 'No; the product often sits near 98%') },
    { id: 'c', text: loc('只在倒装时要算', 'Only for flip-chip') },
  ], answer: 'b', explain: loc('每步 0.99 看起来很高，七步就不高了。', '0.99 per step looks high; seven steps are not.') },
  { id: 'q5', prompt: loc('老化放在流程的哪里？', 'Where does burn-in sit?'), options: [
    { id: 'a', text: loc('CP 之前', 'Before CP') },
    { id: 'b', text: loc('封装后、出货前，用于筛早期失效', 'After assembly, before ship, to screen infant mortality') },
    { id: 'c', text: loc('只在设计阶段', 'Only in design') },
  ], answer: 'b', explain: loc('细节见可靠性课 {@relBurnIn}。', 'Detail in the reliability lesson {@relBurnIn}.') },
  { id: 'q6', prompt: loc('引线键合和倒装的关键差别？', 'Key difference of wire-bond vs flip-chip?'), options: [
    { id: 'a', text: loc('倒装是面阵凸点，键合是周边焊线', 'Flip-chip is an area-array bump; wire-bond is a peripheral wire') },
    { id: 'b', text: loc('倒装不需要测试', 'Flip-chip needs no test') },
    { id: 'c', text: loc('键合更快所以一定更贵', 'Wire-bond is faster so always costlier') },
  ], answer: 'a', explain: loc('倒装还要底部填充，翘曲更敏感。', 'Flip-chip also needs underfill and is more warpage-sensitive.') },
  { id: 'q7', prompt: loc('SLT 是什么？', 'What is SLT?'), options: [
    { id: 'a', text: loc('系统级测试，用接近应用的板子再跑一遍', 'System-level test on a board close to the application') },
    { id: 'b', text: loc('一种光刻胶', 'A photoresist') },
    { id: 'c', text: loc('基板飞针', 'Substrate flying probe') },
  ], answer: 'a', explain: loc('ATE 覆盖不到的系统交互在这里抓。', 'System interactions that ATE misses are caught here.') },
  { id: 'q8', prompt: loc('CP 是不是越严越好？', 'Is stricter CP always better?'), options: [
    { id: 'a', text: loc('是，永远少报废', 'Yes; always less scrap') },
    { id: 'b', text: loc('不一定：过杀会丢掉好 die，也要算测试时间', 'Not always: overkill throws away good die and burns test time') },
    { id: 'c', text: loc('应该取消 CP', 'Cancel CP') },
  ], answer: 'b', explain: loc('覆盖率和过杀要一起权衡。', 'Coverage and overkill are traded together.'),
  },
]

export function MfgAssemblyPage({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [pkgId, setPkgId] = useState(PKGS[0].id)
  const [stepId, setStepId] = useState(STEPS_WB[0].id)
  const [cpCov, setCpCov] = useState(0.97)
  const [burnIn, setBurnIn] = useState(false)
  const [folded, setFolded] = useState(false)
  const pkg = PKGS.find((item) => item.id === pkgId) ?? PKGS[0]
  const step = STEPS_WB.find((item) => item.id === stepId) ?? STEPS_WB[0]
  const ys = STEPS_WB.map((s) => (pkgId === 'fc' && s.id === 'bond' ? 0.993 : s.y))
  const asmY = product(ys)
  const nodes = STEPS_WB.map((s, i) => ({ name: s.id, yield: ys[i], stepCost: s.cost, testCost: 0 }))
  const flow = flowYieldCost(nodes)
  const escape = (1 - 0.9) * (1 - cpCov)
  const extra = burnIn ? 0.4 : 0
  const foldHit = useSticky(folded && pkgId === 'wb')
  const covHit = useSticky(near(cpCov, 0.9, 0.001))
  const fcHit = useSticky(pkgId === 'fc')
  const biHit = useSticky(burnIn)
  const taskFold = loc('用引线键合这七步的良率做连乘，读累计是多少。', 'Multiply the seven wire-bond step yields and read the product.')
  const taskCov = loc('把 CP 覆盖率调到 0.90，读漏检怎样变。', 'Set CP coverage to 0.90 and read how the escape changes.')
  const taskFc = loc('切换到倒装，读键合这一步的良率怎样变。', 'Switch to flip-chip and read how the bond step’s yield changes.')
  const taskBi = loc('打开老化，读每颗成本怎样变。', 'Turn on burn-in and read how the cost per unit changes.')

  return (
    <PackLesson
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      meta={MFG_META.mfgAssembly}
      nextId="mfgRamp"
      nextLabel={loc('下一课：良率模型与爬坡', 'Next: yield models and ramp')}
      later={loc('Handler / Socket 见 {@connection}；老化见 {@relBurnIn}；先进封装差异见 {@apkOverview}。', 'Handler / socket: {@connection}; burn-in: {@relBurnIn}; advanced-package differences: {@apkOverview}.')}
      intro={[
        loc('组装把 KGD 做成可出货的封装：减薄、切割、贴片、键合或倒装、塑封、植球。后面是 FT、老化、SLT 和 OQC。', 'Assembly turns KGD into a shippable package: thin, saw, attach, wire-bond or flip-chip, mold, ball. Then FT, burn-in, SLT and OQC.'),
        loc('先看每一步在防什么，再把良率连乘、看覆盖率和老化。数字是教学示意。', 'See what each step protects against, then multiply the yields and look at coverage and burn-in. Numbers are teaching illustrations.'),
      ]}
      related={['connection', 'relBurnIn', 'apkBond', 'mfgCp']}
      kicker={COMMON.kicker}
      asideTitle={step.title}
      asideText={pkg.text}
      tasks={[
        { id: 't1', text: taskFold, done: foldHit.hit },
        { id: 't2', text: taskCov, done: covHit.hit },
        { id: 't3', text: taskFc, done: fcHit.hit },
        { id: 't4', text: taskBi, done: biHit.hit },
      ]}
      onReset={() => {
        setPkgId(PKGS[0].id)
        setStepId(STEPS_WB[0].id)
        setCpCov(0.97)
        setBurnIn(false)
        setFolded(false)
        foldHit.reset()
        covHit.reset()
        fcHit.reset()
        biHit.reset()
      }}
      learn={
        <div className="mfg-lab">
          <p>{t(loc('两种封装的顺序不一样。点一种，读互连是焊线还是焊球。', 'The two packages run in a different order. Click one and read whether the interconnect is a wire or a bump.'))}</p>
          <Seg options={PKGS.map((item) => ({ id: item.id, label: item.title }))} value={pkgId} onChange={setPkgId} />
          <p>{t(pkg.text)}</p>
          <p>{t(loc('点一步，看它自己的良率。每一步都小于 1，连乘之后会比任何单步都低。倒装时键合这一步用另一组示意良率。', 'Click a step and read its own yield. Every step is below 1, so the product sits below every single step. Flip-chip uses a different illustrative yield on the bond step.'))}</p>
          <Cards items={STEPS_WB.map((s) => ({ id: s.id, title: s.title, text: loc(`这一步 ${s.y}`, `This step ${s.y}`) }))} activeId={stepId} cols={4} onPick={(item) => setStepId(item.id)} />
          <p>{t(loc('CP 漏检示意 = (1−0.9) × (1−覆盖率)。0.9 是裸片里本来就坏的比例，覆盖率是 CP 抓到其中多少。抓得少，坏 die 会被封装进去，后面的钱已经花掉。', 'The CP-escape illustration is (1−0.9) × (1−coverage). 0.9 is the fraction of bare die that were already bad; coverage is how many of those CP catches. Catch fewer, and bad die get packaged after the money is spent.'))}</p>
          <p>{t(loc('老化是加应力，把早期失效提前暴露。这一课用每颗 +0.4 表示多出来的成本，是示意。', 'Burn-in adds stress so infant fails show up early. This lesson uses +0.4 per unit for the extra cost. That is an illustration.'))}</p>
        </div>
      }
      practice={
        <div className="mfg-lab">
          <Drill n={1} title={taskFold}>
            <p>{t(loc('确认上面停在引线键合，再连乘。倒装的键合良率不同，那一档留到第 3 步。', 'Leave the selector above on wire-bond, then multiply. Flip-chip uses a different bond yield; that is step 3.'))}</p>
            <YieldBars items={STEPS_WB.map((s, i) => ({ title: s.title, value: ys[i] }))} />
            <button type="button" onClick={() => setFolded(true)}>{t(loc('连乘这七步', 'Multiply these seven steps'))}</button>
            {folded ? <Readout items={[{ label: loc('你算出的累计良率', 'Product you got'), value: asmY.toFixed(4) }]} /> : null}
            <After show={foldHit.hit} text={loc('0.999×0.998×0.998×0.995×0.998×0.997×0.999 ≈ 0.9841。每一步都接近 1，乘在一起大约掉到 98.4%，不能把组装良率当成 100%。', '0.999×0.998×0.998×0.995×0.998×0.997×0.999 ≈ 0.9841. Each step is near 1, and together they sit near 98.4%. Assembly yield is not 100%.')} />
          </Drill>
          <Drill n={2} title={taskCov}>
            <Knob label={loc('CP 覆盖率', 'CP coverage')} value={cpCov} unit="" min={0.9} max={0.99} step={0.01} onChange={setCpCov} />
            <Readout items={[{ label: loc('你算出的漏检', 'Escape you got'), value: escape.toFixed(4) }]} />
            <After show={covHit.hit} text={loc('覆盖率 0.90 时，漏检 = 0.1 × 0.10 = 0.01。覆盖率 0.97 时只有 0.003。差出来的坏 die 会带着基板和组装的成本报废。', 'At coverage 0.90 the escape is 0.1 × 0.10 = 0.01. At 0.97 it is only 0.003. The extra bad dies scrap the substrate and assembly cost with them.')} />
          </Drill>
          <Drill n={3} title={taskFc}>
            <Seg options={PKGS.map((item) => ({ id: item.id, label: item.title }))} value={pkgId} onChange={setPkgId} />
            <Readout items={[{ label: loc('键合这一步的良率', 'Bond-step yield'), value: (pkgId === 'fc' ? 0.993 : 0.995).toFixed(3) }]} />
            <After show={fcHit.hit} text={loc('倒装这一步用 0.993，引线键合用 0.995。倒装对回流和翘曲更敏感，所以这一课把它画得略低。面阵互连换来的是更短的电感和更好的散热。', 'This lesson uses 0.993 for the flip-chip step and 0.995 for wire bond. Flip-chip is more sensitive to reflow and warpage, so it is drawn a bit lower. The area-array interconnect buys shorter inductance and better heat removal.')} />
          </Drill>
          <Drill n={4} title={taskBi}>
            <label>
              <input type="checkbox" checked={burnIn} onChange={(event) => setBurnIn(event.target.checked)} />
              {t(loc('加入老化', 'Add burn-in'))}
            </label>
            <Readout items={[
              { label: loc('每颗好品成本', 'Cost per good unit'), value: (flow.costPerGood + extra).toFixed(3) },
              { label: loc('报废成本', 'Scrap'), value: flow.scrapCost.toFixed(3) },
            ]} />
            <After show={biHit.hit} text={loc('老化在每颗上加 0.4。它抓的是早期失效，不是把 CP 或 FT 再做一遍，所以不能用它替代前面的测试。', 'Burn-in adds 0.4 on every unit. It catches infant fails. It is not another copy of CP or FT, so it does not replace the tests in front of it.')} />
          </Drill>
        </div>
      }
      misconceptions={[
        loc('组装良率≈100% 可以忽略。七步连乘就会掉到 98%。', 'Assembly yield is not 100%. Seven steps already sit near 98%.'),
        loc('FT 失败都是封装造成的。还有 CP 漏检和应力。', 'FT fails are not all assembly. CP escapes and stress also appear.'),
        loc('CP 越严越好。过杀会丢掉好 die。', 'Stricter CP is not always better. Overkill throws away good die.'),
      ]}
      takeaway={[
        loc('坏 die 被封装的损失，是该点之后已经花掉的钱。', 'The cost of packaging a bad die is the money already spent after that point.'),
        loc('FT / 老化 / SLT / OQC 抓的是不同缺陷，不能互相替代。', 'FT / burn-in / SLT / OQC catch different defects and do not replace each other.'),
      ]}
      quiz={QUIZ}
    />
  )
}
