import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Cards, Knob, Readout, Seg } from '../fund/parts'
import { allPairsIsolation, fixtureBreakEven, flyingProbeTimeS } from './core'
import { MFG_META } from './meta'
import { After, COMMON, Drill, PackLesson, near, useSticky } from './shell'

const STRATS = [
  { id: 'all', title: loc('全对绝缘', 'All-pairs isolation'), text: loc('每一对网络都测。对数 = N(N−1)/2，网络一多就会爆炸。', 'Every pair of nets is tested. The count is N(N−1)/2, and it explodes as nets grow.') },
  { id: 'near', title: loc('相邻网络', 'Adjacent nets'), text: loc('只测物理相邻，数量 ≈ N·k，会漏掉不相邻的桥接。', 'Only physical neighbors, about N·k pairs; distant bridges can escape.') },
]

const DEFECTS = [
  { id: 'open', title: loc('开路', 'Open'), text: loc('同一网络两端不通。连续电阻应低于阈值（如 <10 Ω，示意）。', 'The same net does not connect end to end. Continuity should sit below a threshold (e.g. <10 Ω, illustrative).') },
  { id: 'short', title: loc('短路', 'Short'), text: loc('不同网络粘在一起。绝缘电阻应远高于阈值。', 'Different nets are joined. Isolation should sit far above the threshold.') },
  { id: 'highz', title: loc('高阻', 'High-Z'), text: loc('似通非通。四线 Kelvin 才能分清真开路和接触电阻。', 'Almost open. Four-wire Kelvin tells a true open from contact resistance.') },
]

const QUIZ = [
  { id: 'q1', prompt: loc('N=5000 的全对绝缘对数？', 'All-pairs isolation count at N=5000?'), options: [
    { id: 'a', text: loc('5000', '5000') },
    { id: 'b', text: loc('12,497,500', '12,497,500') },
    { id: 'c', text: loc('25,000', '25,000') },
  ], answer: 'b', explain: loc('N(N−1)/2=12,497,500。所以量产常用相邻策略。', 'N(N−1)/2=12,497,500. Volume usually uses neighbors.') },
  { id: 'q2', prompt: loc('20000 点、0.1 s、4 针的飞针时间？', 'Flying-probe time for 20 000 points, 0.1 s, 4 probes?'), options: [
    { id: 'a', text: loc('50 s', '50 s') },
    { id: 'b', text: loc('500 s', '500 s') },
    { id: 'c', text: loc('2000 s', '2000 s') },
  ], answer: 'b', explain: loc('(20000×0.1)/4=500 s。', '(20000×0.1)/4=500 s.') },
  { id: 'q3', prompt: loc('飞针一定比治具好吗？', 'Is flying probe always better than a fixture?'), options: [
    { id: 'a', text: loc('是，永远更便宜', 'Yes, always cheaper') },
    { id: 'b', text: loc('不是：小批量飞针灵活，大批量治具摊销后更便宜', 'No: flying probe is flexible at low volume; a fixture wins after amortization') },
    { id: 'c', text: loc('治具永远更好', 'A fixture always wins') },
  ], answer: 'b', explain: loc('盈亏平衡 = 治具 NRE / (飞针单颗 − 治具单颗)。', 'Break-even = fixture NRE / (fly unit − fixture unit).') },
  { id: 'q4', prompt: loc('电气测试能代替 AOI 吗？', 'Can electrical test replace AOI?'), options: [
    { id: 'a', text: loc('能', 'Yes') },
    { id: 'b', text: loc('不能：缺口、污渍、错位要靠光学', 'No: nicks, soil and mis-registration need optics') },
    { id: 'c', text: loc('AOI 测电阻', 'AOI measures ohms') },
  ], answer: 'b', explain: loc('两者抓不同缺陷。', 'They catch different defects.') },
  { id: 'q5', prompt: loc('低电阻开路该怎么测？', 'How should a low-ohm open be measured?'), options: [
    { id: 'a', text: loc('两线就够', 'Two-wire is enough') },
    { id: 'b', text: loc('四线 Kelvin，去掉线阻', 'Four-wire Kelvin, to drop lead resistance') },
    { id: 'c', text: loc('只看电容', 'Capacitance only') },
  ], answer: 'b', explain: loc('和功率课的 Kelvin 是同一件事。', 'Same idea as Kelvin in the power lessons.') },
  { id: 'q6', prompt: loc('治具 NRE=30000、飞针单颗 5、治具单颗 0.15 的盈亏平衡？', 'Break-even at fixture NRE 30000, fly 5, fixture 0.15?'), options: [
    { id: 'a', text: loc('约 6186', 'About 6186') },
    { id: 'b', text: loc('30000', '30000') },
    { id: 'c', text: loc('100', '100') },
  ], answer: 'a', explain: loc('30000/(5−0.15)≈6186。教学示意。', '30000/(5−0.15)≈6186. Teaching illustration.') },
  { id: 'q7', prompt: loc('相邻策略的代价？', 'Cost of the neighbor strategy?'), options: [
    { id: 'a', text: loc('没有代价', 'None') },
    { id: 'b', text: loc('不相邻网络之间的桥接可能漏检', 'A bridge between distant nets can escape') },
    { id: 'c', text: loc('时间更长', 'It takes longer') },
  ], answer: 'b', explain: loc('用时间换覆盖，要写进测试计划。', 'You trade time for coverage; write it into the plan.') },
  { id: 'q8', prompt: loc('飞针适合什么？', 'When does flying probe fit?'), options: [
    { id: 'a', text: loc('样品、小批量、多品种', 'Samples, low volume, many part numbers') },
    { id: 'b', text: loc('千万级单一品种', 'Tens of millions of one part') },
    { id: 'c', text: loc('只测晶圆', 'Wafers only') },
  ], answer: 'a', explain: loc('没有治具 NRE，换线快。', 'No fixture NRE and fast changeover.'),
  },
]

export function MfgFlyingPage({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [stratId, setStratId] = useState(STRATS[0].id)
  const [defId, setDefId] = useState(DEFECTS[0].id)
  const [nets, setNets] = useState(2000)
  const [points, setPoints] = useState(8000)
  const [move, setMove] = useState(0.2)
  const [probes, setProbes] = useState(2)
  const [nre, setNre] = useState(30000)
  const strat = STRATS.find((item) => item.id === stratId) ?? STRATS[0]
  const defect = DEFECTS.find((item) => item.id === defId) ?? DEFECTS[0]
  const pairs = stratId === 'all' ? allPairsIsolation(nets) : nets * 4
  const time = flyingProbeTimeS(points, move, probes)
  const flyUnit = time * 0.01
  const be = fixtureBreakEven(nre, flyUnit, 0.15)
  const pairHit = useSticky(nets === 5000 && stratId === 'all')
  const timeHit = useSticky(points === 20000 && near(move, 0.1, 0.001) && probes === 4)
  const beHit = useSticky(timeHit.hit && nre === 30000)
  const nearHit = useSticky(stratId === 'near')
  const taskPairs = loc('把网络数调到 5000，保持全对，读要测多少对。', 'Set the net count to 5000, keep all-pairs, and read how many pairs that is.')
  const taskTime = loc('把测试点调到 20000、每次移动 0.1 秒、飞针 4 根，读测完要多久。', 'Set 20,000 points, 0.1 s per move and 4 probes, then read how long the test takes.')
  const taskBe = loc('用上一步的飞针时间，治具 NRE 保持 30000，读治具何时比飞针便宜。', 'Using the flying-probe time from the previous step and fixture NRE of 30000, read when a fixture becomes cheaper.')
  const taskNear = loc('改成只测相邻网络，读对数怎样变，以及会漏掉什么。', 'Switch to adjacent nets only, and read how the pair count changes and what can be missed.')

  return (
    <PackLesson
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      meta={MFG_META.mfgFlying}
      nextId="mfgAssembly"
      nextLabel={loc('下一课：组装与成品测试', 'Next: assembly and final test')}
      later={loc('Kelvin 见 {@pwrKelvin}；NRE 账见 {@mfgNre}。', 'Kelvin: {@pwrKelvin}; the NRE ledger: {@mfgNre}.')}
      intro={[
        loc('基板电气测试抓开路、短路和绝缘。飞针没有治具 NRE，慢；针床治具快，但先要付钱。全对绝缘会组合爆炸。', 'Substrate electrical test catches opens, shorts and isolation. Flying probe has no fixture NRE and is slow; a bed-of-nails is fast after you pay for it. All-pairs isolation explodes combinatorially.'),
        loc('阈值（<10 Ω、>10 MΩ）是教学示意。', 'Thresholds (<10 Ω, >10 MΩ) are teaching illustrations.'),
      ]}
      related={['mfgNre', 'pwrKelvin', 'mfgSubFab']}
      kicker={COMMON.kicker}
      asideTitle={defect.title}
      asideText={defect.text}
      tasks={[
        { id: 't1', text: taskPairs, done: pairHit.hit },
        { id: 't2', text: taskTime, done: timeHit.hit },
        { id: 't3', text: taskBe, done: beHit.hit },
        { id: 't4', text: taskNear, done: nearHit.hit },
      ]}
      onReset={() => {
        setStratId(STRATS[0].id)
        setDefId(DEFECTS[0].id)
        setNets(2000)
        setPoints(8000)
        setMove(0.2)
        setProbes(2)
        setNre(30000)
        pairHit.reset()
        timeHit.reset()
        beHit.reset()
        nearHit.reset()
      }}
      learn={
        <div className="mfg-lab">
          <p>{t(loc('基板电气测试抓三类问题。点一类，读它在测通还是测不通。', 'Electrical test of a substrate catches three problems. Click one and read whether it checks continuity or isolation.'))}</p>
          <Cards items={DEFECTS} activeId={defId} cols={3} onPick={(item) => setDefId(item.id)} />
          <p>{t(defect.text)}</p>
          <p>{t(strat.text)}</p>
          <p>{t(loc('飞针没有治具的一次性费用，针逐点走。时间 = 测试点数 × 每次移动 ÷ 针数。这一课把机时按 0.01 / 秒摊到每一块板，治具做完后单颗按 0.15 计，都是示意。', 'Flying probe has no fixture NRE; the needles walk point by point. Time = points × move time ÷ probes. This lesson charges machine time at 0.01 per second onto each board, and a finished fixture at 0.15 per unit. Both are illustrations.'))}</p>
          <p>{t(loc('治具盈亏平衡产量 = 治具 NRE ÷ (飞针单颗 − 治具单颗)。产量低于它，飞针更便宜；高于它，治具把一次性费用摊薄了。', 'Fixture break-even volume = fixture NRE ÷ (flying-probe unit − fixture unit). Below it, flying probe is cheaper; above it, the fixture has amortized its one-time cost.'))}</p>
        </div>
      }
      practice={
        <div className="mfg-lab">
          <Drill n={1} title={taskPairs}>
            <Seg options={STRATS.map((item) => ({ id: item.id, label: item.title }))} value={stratId} onChange={setStratId} />
            <Knob label={loc('网络数', 'Nets')} value={nets} unit="" min={1000} max={5000} step={1000} onChange={setNets} />
            <Readout items={[{ label: loc('你算出的测试对数', 'Pairs you got'), value: pairs.toFixed(0) }]} />
            <After show={pairHit.hit} text={loc('5000×4999/2 = 12,497,500 对。全对在工程上测不完，所以量产常改测相邻网络。', '5000×4999/2 = 12,497,500 pairs. All-pairs cannot be finished in production, so volume test usually switches to neighboring nets.')} />
          </Drill>
          <Drill n={2} title={taskTime}>
            <div className="knobs">
              <Knob label={loc('测试点', 'Test points')} value={points} unit="" min={4000} max={20000} step={4000} onChange={setPoints} />
              <Knob label={loc('每次移动', 'Move time')} value={move} unit="s" min={0.1} max={0.3} step={0.1} onChange={setMove} />
              <Knob label={loc('飞针数', 'Probes')} value={probes} unit="" min={2} max={4} step={1} onChange={setProbes} />
            </div>
            <Readout items={[{ label: loc('你算出的飞针时间', 'Flying-probe time you got'), value: `${time.toFixed(1)} s` }]} />
            <After show={timeHit.hit} text={loc('(20000 × 0.1) / 4 = 500 秒。针数翻倍，时间减半，因为几根针同时在走。', '(20,000 × 0.1) / 4 = 500 seconds. Twice the probes halves the time, because several needles move at once.')} />
          </Drill>
          <Drill n={3} title={taskBe}>
            <Knob label={loc('治具 NRE', 'Fixture NRE')} value={nre} unit="" min={10000} max={40000} step={5000} onChange={setNre} />
            <Readout items={[{ label: loc('你算出的盈亏平衡产量', 'Break-even volume you got'), value: Number.isFinite(be) ? be.toFixed(0) : '—' }]} />
            <After show={beHit.hit} text={loc('500 秒 × 0.01 = 5，是飞针摊到每一块的钱。30000 / (5 − 0.15) ≈ 6186 块。不到这个量，花时间飞针更划算；超过它，先做治具更划算。', '500 seconds × 0.01 = 5, the flying-probe money on each board. 30000 / (5 − 0.15) ≈ 6186 boards. Below that, spending time on the flying probe costs less; above it, building the fixture costs less.')} />
          </Drill>
          <Drill n={4} title={taskNear}>
            <Seg options={STRATS.map((item) => ({ id: item.id, label: item.title }))} value={stratId} onChange={setStratId} />
            <Readout items={[{ label: loc('你算出的测试对数', 'Pairs you got'), value: pairs.toFixed(0) }]} />
            <After show={nearHit.hit} text={loc('相邻策略的对数大约是网络数的几倍，不再是平方。远处两根线桥在一起时，这种测法发现不了。', 'Adjacent pairs are a few times the net count, not the square. A bridge between two distant nets is invisible to this test.')} />
          </Drill>
        </div>
      }
      misconceptions={[
        loc('飞针一定比治具好或差。要看产量和换线。', 'Flying probe is not always better or worse. Volume and changeover decide.'),
        loc('所有网络对都要测。全对会爆炸，相邻是工程折中。', 'Not every pair must be tested. All-pairs explodes; neighbors are the engineering trade.'),
        loc('电气测试可以代替 AOI。外形缺陷要靠光学。', 'Electrical test does not replace AOI. Shape defects need optics.'),
      ]}
      takeaway={[
        loc('全对 = N(N−1)/2；飞针时间 = 点数×移动 / 针数。', 'All-pairs = N(N−1)/2; fly time = points×move / probes.'),
        loc('治具盈亏平衡 = NRE / (飞针单颗 − 治具单颗)。', 'Fixture break-even = NRE / (fly unit − fixture unit).'),
      ]}
      quiz={QUIZ}
    />
  )
}
