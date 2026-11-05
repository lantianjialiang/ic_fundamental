import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Cards, Knob, Readout } from '../fund/parts'
import { knownGoodProb, stackYieldD2W, stackYieldW2W } from './core'
import { YieldBars } from '../mfg/figs'
import { After, COMMON, Drill, PackLesson, near, useSticky } from '../mfg/shell'
import { APK_META } from './meta'

const MODES = [
  { id: 'w2w', title: loc('W2W', 'W2W'), text: loc('整片对整片。好 die 可能对上坏 die。', 'Whole wafer to whole wafer. A good die can land on a bad one.') },
  { id: 'd2w', title: loc('D2W + KGD', 'D2W + KGD'), text: loc('先测再贴。P(good|pass)=Y/(Y+(1−Y)(1−c))。', 'Test then place. P(good|pass)=Y/(Y+(1−Y)(1−c)).') },
]

const QUIZ = [
  { id: 'q1', prompt: loc('Y1=0.9、Y2=0.85、bond=0.98 的 W2W？', 'W2W yield at Y1=0.9, Y2=0.85, bond=0.98?'), options: [
    { id: 'a', text: loc('0.7497', '0.7497') },
    { id: 'b', text: loc('0.9000', '0.9000') },
    { id: 'c', text: loc('0.9800', '0.9800') },
  ], answer: 'a', explain: loc('0.9×0.85×0.98=0.7497。', '0.9×0.85×0.98=0.7497.') },
  { id: 'q2', prompt: loc('Y=0.9、c=0.99 的 P(good|pass)？', 'P(good|pass) at Y=0.9, c=0.99?'), options: [
    { id: 'a', text: loc('0.90', '0.90') },
    { id: 'b', text: loc('0.99889', '0.99889') },
    { id: 'c', text: loc('1.00', '1.00') },
  ], answer: 'b', explain: loc('Y/(Y+(1−Y)(1−c))=0.9/(0.9+0.1×0.01)=0.99889。', 'Y/(Y+(1−Y)(1−c))=0.9/(0.9+0.1×0.01)=0.99889.') },
  { id: 'q3', prompt: loc('KGD 就是 100% 好吗？', 'Is KGD 100% good?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是，只在覆盖率范围内“已知”', 'No; it is “known” only inside the coverage') },
    { id: 'c', text: loc('覆盖率无关', 'Coverage does not matter') },
  ], answer: 'b', explain: loc('c=1 时才是 1。漏检会进堆栈。', 'Only c=1 gives 1. Escapes enter the stack.') },
  { id: 'q4', prompt: loc('W2W 一定更便宜吗？', 'Is W2W always cheaper?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不一定：良率连乘可能把硅浪费掉', 'Not always: the yield product can waste silicon') },
    { id: 'c', text: loc('永远更贵', 'Always costlier') },
  ], answer: 'b', explain: loc('层数一多，W2W 掉得很快。', 'With more layers W2W falls fast.') },
  { id: 'q5', prompt: loc('键合良率可以忽略吗？', 'Can bond yield be ignored?'), options: [
    { id: 'a', text: loc('可以', 'Yes') },
    { id: 'b', text: loc('不可以：它要乘 n−1 次', 'No: it is raised to n−1') },
    { id: 'c', text: loc('只在 W2W 存在', 'Only in W2W') },
  ], answer: 'b', explain: loc('8 层就有 7 次键合。', 'Eight layers means seven bonds.') },
  { id: 'q6', prompt: loc('face-to-face 和 face-to-back 的差别？', 'Face-to-face vs face-to-back?'), options: [
    { id: 'a', text: loc('面对面可直接混合键合；背对还要 TSV 穿到背面', 'Face-to-face can hybrid-bond; face-to-back still needs TSVs to the back') },
    { id: 'b', text: loc('没有差别', 'No difference') },
    { id: 'c', text: loc('只影响颜色', 'Only color') },
  ], answer: 'a', explain: loc('3D 的测试访问也因此不同。', 'Test access differs too.') },
  { id: 'q7', prompt: loc('c=1 时 knownGoodProb？', 'knownGoodProb at c=1?'), options: [
    { id: 'a', text: loc('等于 Y', 'Equals Y') },
    { id: 'b', text: loc('等于 1', 'Equals 1') },
    { id: 'c', text: loc('等于 0', 'Equals 0') },
  ], answer: 'b', explain: loc('覆盖完整时，通过即是好。', 'With full coverage, a pass is good.') },
  { id: 'q8', prompt: loc('漏检（escape）是什么？', 'What is an escape?'), options: [
    { id: 'a', text: loc('坏 die 被测成通过，带进堆栈', 'A bad die that passed and entered the stack') },
    { id: 'b', text: loc('好 die 被杀掉', 'A good die thrown away') },
    { id: 'c', text: loc('键合空洞', 'A bond void') },
  ], answer: 'a', explain: loc('过杀是另一面：好的被丢掉。', 'Overkill is the other side: good parts thrown away.'),
  },
]

export function ApkStackPage({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [modeId, setModeId] = useState(MODES[0].id)
  const [y1, setY1] = useState(0.8)
  const [y2, setY2] = useState(0.8)
  const [bond, setBond] = useState(0.95)
  const [cov, setCov] = useState(0.9)
  const [layers, setLayers] = useState(4)
  const mode = MODES.find((item) => item.id === modeId) ?? MODES[0]
  const yW2 = stackYieldW2W([y1, y2], bond)
  const yD2 = stackYieldD2W([y1, y2], cov, bond)
  const kgd = knownGoodProb(0.9, cov)
  const dram = Array.from({ length: layers }, () => 0.9)
  const y8w = stackYieldW2W(dram, bond)
  const y8d = stackYieldD2W(dram, cov, bond)
  const wHit = useSticky(near(y1, 0.9, 0.001) && near(y2, 0.85, 0.001) && near(bond, 0.98, 0.001))
  const kHit = useSticky(near(cov, 0.99, 0.001))
  const layerHit = useSticky(layers === 8)
  const beatHit = useSticky(layers === 8 && near(cov, 0.99, 0.001) && y8d > y8w + 0.1)
  const taskW = loc('把两层良率调成 0.9 和 0.85、键合调成 0.98，读晶圆对晶圆的堆叠良率。', 'Set the two die yields to 0.9 and 0.85 and the bond to 0.98, then read the wafer-to-wafer stack yield.')
  const taskK = loc('把覆盖率调到 0.99，读“测过并且是好的”概率。', 'Set coverage to 0.99 and read the probability a passing die is actually good.')
  const taskL = loc('把 DRAM 层数调到 8，读两种贴法的堆叠良率。', 'Set the DRAM layers to 8 and read both placement yields.')
  const taskB = loc('在 8 层上把覆盖率调到 0.99，读先测再贴何时明显高于整片对贴。', 'On 8 layers, set coverage to 0.99 and read when test-then-place sits clearly above wafer-to-wafer.')

  return (
    <PackLesson
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      meta={APK_META.apkStack}
      nextId="apkD2d"
      nextLabel={loc('下一课：Die-to-Die', 'Next: die-to-die')}
      later={loc('KGD 覆盖率会决定整条先进封装测试账，见 {@apkFlow}。', 'KGD coverage sets the whole advanced-package test ledger; see {@apkFlow}.')}
      intro={[
        loc('3D 堆叠的良率是连乘：各层 die × 每一次键合。W2W 不能挑，D2W 先测成 KGD 再贴。', '3D stack yield is a product: each die × every bond. W2W cannot pick; D2W tests to KGD first.'),
        loc('混合键合把节距做细，也对平整度和清洁度更苛刻。', 'Hybrid bonding shrinks pitch and tightens planarity and cleanliness.'),
      ]}
      related={['apkFlow', 'apkTsv', 'apkBond']}
      kicker={COMMON.kicker}
      asideTitle={mode.title}
      asideText={mode.text}
      tasks={[
        { id: 't1', text: taskW, done: wHit.hit },
        { id: 't2', text: taskK, done: kHit.hit },
        { id: 't3', text: taskL, done: layerHit.hit },
        { id: 't4', text: taskB, done: beatHit.hit },
      ]}
      onReset={() => {
        setModeId(MODES[0].id)
        setY1(0.8)
        setY2(0.8)
        setBond(0.95)
        setCov(0.9)
        setLayers(4)
        wHit.reset()
        kHit.reset()
        layerHit.reset()
        beatHit.reset()
      }}
      learn={
        <div className="mfg-lab">
          <p>{t(loc('两种贴法。点一种，读它能不能把坏 die 挑出去。', 'Two ways to place dies. Click one and read whether it can reject a bad die.'))}</p>
          <Cards items={MODES} activeId={modeId} cols={2} onPick={(item) => setModeId(item.id)} />
          <p>{t(mode.text)}</p>
          <p>{t(loc('晶圆对晶圆：堆叠良率 = 各层良率连乘 × 键合良率的 (层数−1) 次方。好 die 可能正对着坏 die，没法挑。', 'Wafer to wafer: stack yield = the product of the die yields × bond yield to the power (layers−1). A good die can land on a bad one. There is no picking.'))}</p>
          <p>{t(loc('先测再贴时，用 P(好|通过) = Y / (Y + (1−Y)×(1−覆盖率)) 代替裸片良率。覆盖率不是 1，通过的片子里仍可能有漏网的坏片。裸片良率这一式用 0.9。', 'Test-then-place replaces the bare yield with P(good|pass) = Y / (Y + (1−Y)×(1−coverage)). Coverage is not 1, so a passing die can still be bad. This formula uses a bare yield of 0.9.'))}</p>
        </div>
      }
      practice={
        <div className="mfg-lab">
          <Drill n={1} title={taskW}>
            <div className="knobs">
              <Knob label={loc('Y1', 'Y1')} value={y1} unit="" min={0.8} max={0.95} step={0.05} onChange={setY1} />
              <Knob label={loc('Y2', 'Y2')} value={y2} unit="" min={0.8} max={0.95} step={0.05} onChange={setY2} />
              <Knob label={loc('键合良率', 'Bond yield')} value={bond} unit="" min={0.95} max={0.99} step={0.01} onChange={setBond} />
            </div>
            <Readout items={[{ label: loc('你算出的 W2W', 'W2W you got'), value: yW2.toFixed(4) }]} />
            <After show={wHit.hit} text={loc('0.9 × 0.85 × 0.98 = 0.7497。两层只乘一次键合。层数再增加，键合还要再乘。', '0.9 × 0.85 × 0.98 = 0.7497. Two layers multiply the bond once. More layers multiply it again.')} />
          </Drill>
          <Drill n={2} title={taskK}>
            <Knob label={loc('覆盖率 c', 'Coverage c')} value={cov} unit="" min={0.9} max={1} step={0.01} onChange={setCov} />
            <Readout items={[
              { label: loc('你算出的 P(好|通过)', 'P(good|pass) you got'), value: kgd.toFixed(5) },
              { label: loc('两层先测再贴', 'Two-layer test-then-place'), value: yD2.toFixed(4) },
            ]} />
            <After show={kHit.hit} text={loc('Y=0.9、c=0.99 时，P = 0.9 / (0.9 + 0.1×0.01) ≈ 0.99889。它很接近 1，但不是 1：每一千颗通过的里面仍有大约一颗漏网。', 'At Y=0.9 and c=0.99, P = 0.9 / (0.9 + 0.1×0.01) ≈ 0.99889. That is near 1, and it is not 1: about one passing die in a thousand is still bad.')} />
          </Drill>
          <Drill n={3} title={taskL}>
            <Knob label={loc('DRAM 层数', 'DRAM layers')} value={layers} unit="" min={4} max={8} step={1} onChange={setLayers} />
            <YieldBars items={[{ title: loc('W2W', 'W2W'), value: y8w }, { title: loc('D2W', 'D2W'), value: y8d }]} />
            <Readout items={[{ label: loc('W2W / D2W', 'W2W / D2W'), value: `${y8w.toFixed(3)} / ${y8d.toFixed(3)}` }]} />
            <After show={layerHit.hit} text={loc('8 层、每层 0.9，晶圆对晶圆要把 0.9 连乘 8 次，再乘 7 次键合，良率掉得很快。先测再贴用的是“通过且大概率是好的”，所以掉得慢。', 'Eight layers at 0.9 each: wafer-to-wafer multiplies 0.9 eight times and the bond seven times, so yield falls fast. Test-then-place uses “passed and probably good”, so it falls more slowly.')} />
          </Drill>
          <Drill n={4} title={taskB}>
            <Knob label={loc('覆盖率 c', 'Coverage c')} value={cov} unit="" min={0.9} max={1} step={0.01} onChange={setCov} />
            <Readout items={[{ label: loc('D2W − W2W', 'D2W − W2W'), value: (y8d - y8w).toFixed(3) }]} />
            <After show={beatHit.hit} text={loc('覆盖率到 0.99 且有 8 层时，先测再贴比整片对贴高出一截。差出来的就是那些没被贴上去的坏 die。覆盖率若停在 0.9，这条优势会小很多。', 'At coverage 0.99 and 8 layers, test-then-place sits well above wafer-to-wafer. The gap is the bad dies that were not placed. If coverage stays at 0.9, that advantage shrinks.')} />
          </Drill>
        </div>
      }
      misconceptions={[
        loc('KGD 就是 100% 好。它只在覆盖率里“已知”。', 'KGD is not 100% good. It is “known” only inside coverage.'),
        loc('W2W 一定更便宜。连乘会浪费硅。', 'W2W is not always cheaper. The product wastes silicon.'),
        loc('键合良率可忽略。它要乘 n−1 次。', 'Bond yield is not optional. It is raised to n−1.'),
      ]}
      takeaway={[
        loc('W2W = ΠYi × bond^(n−1)；D2W 先把 Yi 换成 P(good|pass)。', 'W2W = ΠYi × bond^(n−1); D2W first replaces Yi with P(good|pass).'),
        loc('覆盖率不足的漏检，会在堆叠后变成昂贵报废。', 'Escapes from thin coverage become expensive scrap after stacking.'),
      ]}
      quiz={QUIZ}
    />
  )
}
