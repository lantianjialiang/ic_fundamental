import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Cards, Knob, Readout } from '../fund/parts'
import { knownGoodProb } from './core'
import { flowYieldCost } from '../mfg/core'
import { After, COMMON, Drill, PackLesson, near, useSticky } from '../mfg/shell'
import { APK_META } from './meta'

const INSERTS = [
  { id: 'kgd', title: loc('Die 级 KGD', 'Die-level KGD'), text: loc('GPU/ASIC 和 DRAM 先分选。覆盖率决定漏进堆栈的坏片。', 'Sort GPU/ASIC and DRAM first. Coverage sets how many bad dice enter the stack.') },
  { id: 'tsv', title: loc('TSV / 中介层', 'TSV / interposer'), text: loc('无源开短路，细节距难直接扎。', 'Passive opens/shorts; fine pitch is hard to probe.') },
  { id: 'kgs', title: loc('KGS 堆栈测试', 'KGS stack test'), text: loc('经基底 die 测已堆好的 HBM。', 'Test the stacked HBM through the base die.') },
  { id: 'post', title: loc('贴装后互连', 'Post-attach link'), text: loc('D2D / HBM 通道靠环回，不再扎微凸点。', 'D2D / HBM channels use loopback; micro-bumps are not probed again.') },
  { id: 'pkg', title: loc('封装 / SLT', 'Package / SLT'), text: loc('成品和系统级。晚发现会报废 GPU+中介层。', 'Final and system-level. A late find scraps the GPU plus interposer.') },
]

const QUIZ = [
  { id: 'q1', prompt: loc('无 KGD 时 8 层 0.9 × 基底 0.95 × 键合 0.97？', 'No KGD: 8×0.9 × base 0.95 × bond 0.97?'), options: [
    { id: 'a', text: loc('约 0.397', 'About 0.397') },
    { id: 'b', text: loc('0.90', '0.90') },
    { id: 'c', text: loc('0.97', '0.97') },
  ], answer: 'a', explain: loc('0.9^8×0.95×0.97≈0.3967。', '0.9^8×0.95×0.97≈0.3967.') },
  { id: 'q2', prompt: loc('DRAM KGD c=0.99 后的堆栈良率？', 'Stack yield after DRAM KGD at c=0.99?'), options: [
    { id: 'a', text: loc('仍约 0.40', 'Still about 0.40') },
    { id: 'b', text: loc('约 0.913', 'About 0.913') },
    { id: 'c', text: loc('1.00', '1.00') },
  ], answer: 'b', explain: loc('knownGoodProb(0.9,0.99)^8×0.95×0.97≈0.9133。', 'knownGoodProb(0.9,0.99)^8×0.95×0.97≈0.9133.') },
  { id: 'q3', prompt: loc('每一步都测最安全吗？', 'Is testing at every step the safest cheap option?'), options: [
    { id: 'a', text: loc('是，永远最便宜', 'Yes; always cheapest') },
    { id: 'b', text: loc('不是：测试成本会堆起来，要和报废比', 'No: test cost stacks up and must be compared with scrap') },
    { id: 'c', text: loc('只测最后一步', 'Only the last step') },
  ], answer: 'b', explain: loc('GPU 贴装后再发现 HBM 坏，报废的是整颗贵封装。', 'Finding a bad HBM after GPU attach scraps the expensive package.') },
  { id: 'q4', prompt: loc('堆栈组装后还能对每层直接探测吗？', 'Can each layer be probed after stacking?'), options: [
    { id: 'a', text: loc('能', 'Yes') },
    { id: 'b', text: loc('不能，只能经基底 die / DFT', 'No; only through the base die / DFT') },
    { id: 'c', text: loc('只对最上层', 'Top layer only') },
  ], answer: 'b', explain: loc('IEEE 1838 / 1149.1 / 1500 等是概念，以现行标准为准。', 'IEEE 1838 / 1149.1 / 1500 are conceptual; follow the current standards.') },
  { id: 'q5', prompt: loc('KGD 通过就不会在封装后失效吗？', 'Does a KGD pass mean no fail after package?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是：覆盖率缺口和键合缺陷仍在', 'No: coverage holes and bond defects remain') },
    { id: 'c', text: loc('只可能 Socket 坏', 'Only the socket can fail') },
  ], answer: 'b', explain: loc('KGS 就是为了抓键合后的堆栈。', 'KGS exists to catch the stack after bonding.') },
  { id: 'q6', prompt: loc('KGD 和 KGS 的差别？', 'KGD vs KGS?'), options: [
    { id: 'a', text: loc('KGD 是单颗裸片，KGS 是已堆好的堆栈', 'KGD is a single die; KGS is an already stacked stack') },
    { id: 'b', text: loc('没有差别', 'No difference') },
    { id: 'c', text: loc('KGS 更早', 'KGS is earlier') },
  ], answer: 'a', explain: loc('HBM 通常先做成 KGS 再贴到中介层。', 'HBM is usually built as KGS before attach to the interposer.') },
  { id: 'q7', prompt: loc('HBM 第 3 层 Fail 集中更像什么？', 'What does a cluster of HBM layer-3 fails suggest?'), options: [
    { id: 'a', text: loc('该层 DRAM 或该次键合，而不是随机整栈', 'That DRAM layer or that bond, not a random whole-stack fail') },
    { id: 'b', text: loc('一定是 GPU', 'Always the GPU') },
    { id: 'c', text: loc('一定是基板', 'Always the substrate') },
  ], answer: 'a', explain: loc('分层 Bin 才能把问题定位到层。', 'Per-layer bins locate the problem to a layer.') },
  { id: 'q8', prompt: loc('STDF 在先进封装里还要多记什么？', 'What extra should STDF carry in advanced packaging?'), options: [
    { id: 'a', text: loc('层 / Site / 堆栈身份，才能追溯', 'Layer / site / stack identity, so it can be traced') },
    { id: 'b', text: loc('什么都不用多记', 'Nothing extra') },
    { id: 'c', text: loc('只记封装外形', 'Only the package outline') },
  ], answer: 'a', explain: loc('解析器见 {@genStdf}。', 'Parser: {@genStdf}.'),
  },
]

export function ApkFlowPage({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [insId, setInsId] = useState(INSERTS[0].id)
  const [kgdOn, setKgdOn] = useState(true)
  const [lateId, setLateId] = useState('')
  const [kgsOn, setKgsOn] = useState(false)
  const [cov, setCov] = useState(0.9)
  const [testCost, setTestCost] = useState(8)
  const ins = INSERTS.find((item) => item.id === insId) ?? INSERTS[0]
  const yBare = 0.9 ** 8 * 0.95 * 0.97
  const yKgd = knownGoodProb(0.9, cov) ** 8 * 0.95 * 0.97
  const stackY = kgdOn ? yKgd : yBare
  const nodes = [
    { name: 'dram', yield: kgdOn ? knownGoodProb(0.9, cov) : 0.9, stepCost: 20, testCost: kgdOn ? testCost : 0 },
    { name: 'stack', yield: stackY, stepCost: 40, testCost: kgsOn ? testCost : 0 },
    { name: 'gpu', yield: 0.85, stepCost: 300, testCost: kgdOn ? testCost : 0 },
    { name: 'attach', yield: kgsOn ? 0.99 : 0.97, stepCost: 100, testCost: 4 },
    { name: 'pkg', yield: 0.98, stepCost: 80, testCost: 6 },
  ]
  const flow = flowYieldCost(nodes)
  const bareHit = useSticky(!kgdOn)
  const kgdHit = useSticky(kgdOn && near(cov, 0.99, 0.001))
  const kgsHit = useSticky(kgdOn && kgsOn)
  const costHit = useSticky(testCost !== 8)
  const lateHit = useSticky(lateId === 'pkg')
  const taskBare = loc('关掉裸片分选，读 8 层堆栈的良率。', 'Turn off die sort and read the yield of the 8-layer stack.')
  const taskKgd = loc('打开裸片分选，把覆盖率调到 0.99，再读堆栈良率。', 'Turn die sort back on, set coverage to 0.99, and read the stack yield again.')
  const taskKgs = loc('在贴 GPU 之前打开堆栈测试，读报废成本怎样变。', 'Turn on the stack test before the GPU is attached, and read how scrap cost changes.')
  const taskCost = loc('改一下每次插入的测试成本，读每颗好封装的成本。', 'Change the test cost of each insertion and read the cost per good package.')
  const taskLate = loc('选出已经晚到会把 GPU 一起报废的那一次测试。', 'Pick the test that is late enough to scrap the GPU along with the fault.')

  return (
    <PackLesson
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      meta={APK_META.apkFlow}
      nextId="mfgOverview"
      nextLabel={loc('回到制造流程总览', 'Back to the manufacturing overview')}
      later={loc('STDF 见 {@genStdf}；成本/Site 见 {@genMultisite}；基板测试见 {@mfgFlying}。', 'STDF: {@genStdf}; cost/sites: {@genMultisite}; substrate test: {@mfgFlying}.')}
      intro={[
        loc('先进封装的测试账是：在哪里插入、覆盖多少、晚发现会报废多贵。VDUT-APK1 默认 GPU + 4 个 HBM + 中介层。', 'The advanced-package test ledger is: where to insert, how much coverage, and how expensive a late find is. VDUT-APK1 defaults to a GPU + 4 HBM + interposer.'),
        loc('标准名（1838 / 1149.1 / 1500）只作概念，以现行标准为准。', 'Standard names (1838 / 1149.1 / 1500) are conceptual; follow the current standards.'),
      ]}
      related={['genStdf', 'genMultisite', 'mfgFlying', 'mfgCp', 'apkStack']}
      kicker={COMMON.kicker}
      asideTitle={ins.title}
      asideText={ins.text}
      notice={COMMON.specNote}
      tasks={[
        { id: 't1', text: taskBare, done: bareHit.hit },
        { id: 't2', text: taskKgd, done: kgdHit.hit },
        { id: 't3', text: taskKgs, done: kgsHit.hit },
        { id: 't4', text: taskCost, done: costHit.hit },
        { id: 't5', text: taskLate, done: lateHit.hit },
      ]}
      onReset={() => {
        setInsId(INSERTS[0].id)
        setLateId('')
        setKgdOn(true)
        setKgsOn(false)
        setCov(0.9)
        setTestCost(8)
        bareHit.reset()
        kgdHit.reset()
        kgsHit.reset()
        costHit.reset()
        lateHit.reset()
      }}
      learn={
        <div className="mfg-lab">
          <p>{t(loc('测试可以插在不同的地方。点一次，读它抓的是裸片、堆栈、互连还是成品。', 'Test can be inserted in different places. Click one and read whether it catches a bare die, a stack, a link or the finished part.'))}</p>
          <Cards items={INSERTS} activeId={insId} cols={3} onPick={(item) => setInsId(item.id)} />
          <p>{t(ins.text)}</p>
          <p>{t(loc('不做裸片分选时，8 层 DRAM 按 0.9 连乘，再乘基底 0.95 和键合 0.97。层数在指数上，所以掉得很快。', 'Without die sort, eight DRAM layers multiply 0.9, then the base 0.95 and the bond 0.97. The layer count is an exponent, so the yield falls fast.'))}</p>
          <p>{t(loc('裸片分选之后，每一层用 P(好|通过) 代替 0.9。覆盖率越高，漏进堆栈的坏片越少。堆栈测试（KGS）是贴上贵的 GPU 之前，经基底 die 再确认一次。', 'After die sort, each layer uses P(good|pass) instead of 0.9. Higher coverage lets fewer bad dies into the stack. The stack test (KGS) checks once more through the base die, before the expensive GPU is attached.'))}</p>
          <p>{t(loc('每多插一次测试，测试成本就叠上去；每少插一次，坏片就带着后面已经做过的 GPU 和中介层报废。两边要一起看。', 'Every extra test adds test cost. Every test you skip lets a bad die scrap the GPU and interposer already built behind it. Both sides have to be read together.'))}</p>
        </div>
      }
      practice={
        <div className="mfg-lab">
          <Drill n={1} title={taskBare}>
            <label>
              <input type="checkbox" checked={kgdOn} onChange={(event) => setKgdOn(event.target.checked)} />
              {t(loc('启用裸片分选', 'Enable die sort'))}
            </label>
            <Readout items={[{ label: loc('你看到的堆栈良率', 'Stack yield you are reading'), value: (kgdOn ? yKgd : yBare).toFixed(4) }]} />
            <After show={bareHit.hit} text={loc('关掉分选后，0.9 的 8 次方 × 0.95 × 0.97 ≈ 0.397。八层各自 90%，乘完只剩四成左右。', 'With sort off, 0.9 to the 8th × 0.95 × 0.97 ≈ 0.397. Eight layers at 90% each leave only about four tenths.')} />
          </Drill>
          <Drill n={2} title={taskKgd}>
            <Knob label={loc('覆盖率', 'Coverage')} value={cov} unit="" min={0.9} max={0.99} step={0.01} onChange={setCov} />
            <label>
              <input type="checkbox" checked={kgdOn} onChange={(event) => setKgdOn(event.target.checked)} />
              {t(loc('启用裸片分选', 'Enable die sort'))}
            </label>
            <Readout items={[{ label: loc('分选后的堆栈良率', 'Stack yield after sort'), value: yKgd.toFixed(4) }]} />
            <After show={kgdHit.hit} text={loc('覆盖率 0.99 时，单层“通过且是好的”约 0.9989，8 次方之后再乘 0.95 和 0.97，堆栈约 0.913。和没分选的 0.397 比，差在那些没被放进来的坏片。', 'At coverage 0.99, one layer’s “passed and good” is about 0.9989. To the 8th power, times 0.95 and 0.97, the stack is about 0.913. Against 0.397 with no sort, the gap is the bad dies that were not placed.')} />
          </Drill>
          <Drill n={3} title={taskKgs}>
            <label>
              <input type="checkbox" checked={kgsOn} onChange={(event) => setKgsOn(event.target.checked)} />
              {t(loc('贴 GPU 前先做堆栈测试', 'Test the stack before attaching the GPU'))}
            </label>
            <Readout items={[{ label: loc('报废成本', 'Scrap cost'), value: flow.scrapCost.toFixed(1) }]} />
            <After show={kgsHit.hit} text={loc('堆栈测试把键合后的坏堆挡在 GPU 之前。报废的是相对便宜的堆栈，不是已经贴上的 GPU 和中介层。', 'The stack test stops a bad bonded stack before the GPU. The scrap is the cheaper stack, not a GPU and interposer already attached.')} />
          </Drill>
          <Drill n={4} title={taskCost}>
            <Knob label={loc('每次插入的测试成本', 'Test cost per insertion')} value={testCost} unit="" min={2} max={16} step={2} onChange={setTestCost} />
            <Readout items={[
              { label: loc('每颗好封装', 'Cost per good package'), value: flow.costPerGood.toFixed(1) },
              { label: loc('测试成本', 'Test cost'), value: flow.testCost.toFixed(1) },
            ]} />
            <After show={costHit.hit} text={loc('测试成本加在每一颗上，好封装的成本跟着升。它要和少测一次所多出来的报废比，不是测得越多越划算。', 'Test cost is added on every unit, so the cost per good package rises with it. Compare that with the extra scrap from skipping a test. More test is not automatically the better deal.')} />
          </Drill>
          <Drill n={5} title={taskLate}>
            <div className="mfg-assign__picks">
              {INSERTS.map((item) => (
                <button key={item.id} type="button" className={lateId === item.id ? 'is-active' : ''} onClick={() => setLateId(item.id)}>{t(item.title)}</button>
              ))}
            </div>
            <After show={lateId !== ''} text={lateId === 'pkg'
              ? loc('封装和系统级测试时，GPU 和中介层都已经做完。这一步发现 HBM 坏，报废的是整颗贵封装。所以能在裸片和堆栈阶段抓住的，不要留到这里。', 'At package and system test, the GPU and interposer are already built. Finding a bad HBM here scraps the whole expensive package. Catch it at die sort or at the stack test instead.')
              : loc('再看这一步发生时 GPU 贴了没有。贴上之后才测，坏的 HBM 会把 GPU 一起报废。那是封装 / 系统级这一次。', 'Ask whether the GPU is already attached at this step. A test after attach scraps the GPU with a bad HBM. That is the package / system step.')} />
          </Drill>
        </div>
      }
      misconceptions={[
        loc('每一步都测最安全。测试成本会堆起来，要和报废比。', 'Testing every step is not automatically cheapest. Test cost stacks up against scrap.'),
        loc('堆栈组装后仍可对每层直接探测。只能经基底 die。', 'Layers cannot be probed after stacking. Access is through the base die.'),
        loc('KGD 通过就不会在封装后失效。覆盖率和键合缺陷仍在。', 'A KGD pass does not freeze the part. Coverage holes and bond defects remain.'),
      ]}
      takeaway={[
        loc('晚发现会报废 GPU 和中介层；KGD/KGS 把缺陷挡在贴装之前。', 'A late find scraps the GPU and interposer; KGD/KGS stop the defect before attach.'),
        loc('0.9^8×0.95×0.97≈0.397；加上 c=0.99 的 KGD 后约 0.913。', '0.9^8×0.95×0.97≈0.397; with KGD at c=0.99 it is about 0.913.'),
      ]}
      quiz={QUIZ}
    />
  )
}
