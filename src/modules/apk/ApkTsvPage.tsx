import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Cards, Knob, Readout } from '../fund/parts'
import { daisyChainResistance, tsvLinerCapacitance, tsvResistance } from './core'
import { TEACH } from '../mfg/core'
import { After, COMMON, Drill, PackLesson, near, useSticky } from '../mfg/shell'
import { APK_META } from './meta'

const STEPS = [
  { id: 'etch', title: loc('刻蚀', 'Etch'), text: loc('在硅上打孔。via-first / middle / last 决定何时打。', 'A hole in silicon. Via-first / middle / last sets when.') },
  { id: 'lin', title: loc('绝缘 / 种子', 'Liner / seed'), text: loc('绝缘层决定对衬底电容和漏电。', 'The liner sets substrate capacitance and leakage.') },
  { id: 'fill', title: loc('铜填充', 'Cu fill'), text: loc('空洞会让电阻升高。', 'A void raises resistance.') },
  { id: 'thin', title: loc('减薄 / 露出', 'Thin / reveal'), text: loc('减到数十 µm，需载片和临时键合。', 'Thinned to tens of µm; a carrier and temporary bond are needed.') },
]

const QUIZ = [
  { id: 'q1', prompt: loc('直径 5 µm、长 50 µm 的 TSV 电阻？', 'TSV resistance at 5 µm diameter, 50 µm length?'), options: [
    { id: 'a', text: loc('约 42.8 mΩ', 'About 42.8 mΩ') },
    { id: 'b', text: loc('42 Ω', '42 Ω') },
    { id: 'c', text: loc('4 Ω', '4 Ω') },
  ], answer: 'a', explain: loc('R=ρL/(πr²)，r=2.5 µm。电阻其实很小。', 'R=ρL/(πr²), r=2.5 µm. The resistance is small.') },
  { id: 'q2', prompt: loc('tox=0.2 µm 时绝缘层电容量级？', 'Liner capacitance order at tox=0.2 µm?'), options: [
    { id: 'a', text: loc('约 141 fF', 'About 141 fF') },
    { id: 'b', text: loc('141 pF', '141 pF') },
    { id: 'c', text: loc('1 µF', '1 µF') },
  ], answer: 'a', explain: loc('同轴近似 C=2πε₀εrL/ln((r+tox)/r)。', 'Coaxial C=2πε₀εrL/ln((r+tox)/r).') },
  { id: 'q3', prompt: loc('一条超长菊花链够不够？', 'Is one very long daisy chain enough?'), options: [
    { id: 'a', text: loc('够', 'Yes') },
    { id: 'b', text: loc('不够：单个缺陷被稀释，要分段', 'No: one defect is diluted; segment the chain') },
    { id: 'c', text: loc('链越长越灵敏', 'Longer is more sensitive') },
  ], answer: 'b', explain: loc('N=1000 时一个 ×10 的孔几乎看不见。', 'At N=1000 a ×10 via almost disappears.') },
  { id: 'q4', prompt: loc('TSV 只是电学问题吗？', 'Is a TSV only an electrical problem?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是：应力、禁布区和可靠性同样重要', 'No: stress, keep-out zone and reliability matter too') },
    { id: 'c', text: loc('只影响颜色', 'Only color') },
  ], answer: 'b', explain: loc('KOZ 会占掉晶体管面积。', 'The KOZ steals transistor area.') },
  { id: 'q5', prompt: loc('针孔缺陷该测什么？', 'What measurement catches a pinhole?'), options: [
    { id: 'a', text: loc('对衬底漏电', 'Leakage to the substrate') },
    { id: 'b', text: loc('只测电阻', 'Resistance only') },
    { id: 'c', text: loc('只看外观', 'Visual only') },
  ], answer: 'a', explain: loc('空洞抬电阻，针孔漏电，开路则链断。', 'A void raises R, a pinhole leaks, an open breaks the chain.') },
  { id: 'q6', prompt: loc('为什么要临时键合？', 'Why temporary bonding?'), options: [
    { id: 'a', text: loc('减薄后的晶圆太脆，需要载片撑着', 'A thinned wafer is fragile and needs a carrier') },
    { id: 'b', text: loc('为了更好看', 'For looks') },
    { id: 'c', text: loc('代替 TSV', 'It replaces TSVs') },
  ], answer: 'a', explain: loc('测完还要解键合，本身也是良率风险。', 'It must later debond, which is itself a yield risk.') },
  { id: 'q7', prompt: loc('TSV 电阻很大吗？', 'Is TSV resistance large?'), options: [
    { id: 'a', text: loc('很大，容易测', 'Large and easy to measure') },
    { id: 'b', text: loc('通常很小，难的是抓缺陷', 'Usually small; the hard part is catching a defect') },
    { id: 'c', text: loc('无穷大', 'Infinite') },
  ], answer: 'b', explain: loc('所以要 Kelvin 和分段链。', 'Hence Kelvin and segmented chains.') },
  { id: 'q8', prompt: loc('禁布区（KOZ）是什么？', 'What is a keep-out zone?'), options: [
    { id: 'a', text: loc('TSV 周围不能放灵敏晶体管的区域', 'A region around the TSV where sensitive transistors cannot sit') },
    { id: 'b', text: loc('封装外壳', 'The package lid') },
    { id: 'c', text: loc('一种焊料', 'A solder') },
  ], answer: 'a', explain: loc('应力会漂 Vth。', 'Stress shifts Vth.'),
  },
]

export function ApkTsvPage({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [stepId, setStepId] = useState(STEPS[0].id)
  const [dia, setDia] = useState(8)
  const [len, setLen] = useState(80)
  const [tox, setTox] = useState(0.4)
  const [n, setN] = useState(200)
  const [rBump, setRBump] = useState(0.05)
  const [defect, setDefect] = useState(false)
  const [seg, setSeg] = useState(1)
  const step = STEPS.find((item) => item.id === stepId) ?? STEPS[0]
  const r = tsvResistance(TEACH.rhoCu, len * 1e-6, (dia / 2) * 1e-6)
  const c = tsvLinerCapacitance(3.9, len * 1e-6, (dia / 2) * 1e-6, tox * 1e-6)
  const chain = daisyChainResistance(n, r, rBump, defect ? [{ index: 0, factor: 10 }] : [])
  const base = n * (r + rBump)
  const delta = (chain - base) / base
  const perSeg = n / seg
  const segDelta = defect ? (r * 9) / (perSeg * (r + rBump)) : 0
  const rHit = useSticky(dia === 5 && len === 50)
  const cHit = useSticky(dia === 5 && len === 50 && near(tox, 0.2, 0.05))
  const chainHit = useSticky(n === 1000 && defect)
  const segHit = useSticky(seg === 10 && defect)
  const taskR = loc('把直径调到 5 µm、长度调到 50 µm，读单孔电阻。', 'Set diameter to 5 µm and length to 50 µm, then read the via resistance.')
  const taskC = loc('把绝缘层调到 0.2 µm，读孔对硅的电容。', 'Set the liner to 0.2 µm and read the via-to-silicon capacitance.')
  const taskChain = loc('把链上的孔数调到 1000，并注入一个电阻放大 10 倍的空洞，读整链偏差。', 'Set the chain to 1000 vias and inject one void at 10× resistance, then read the full-chain shift.')
  const taskSeg = loc('把分段数调到 10，读单段偏差怎样变得明显。', 'Set the segment count to 10 and read how the per-segment shift stands out.')

  return (
    <PackLesson
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      meta={APK_META.apkTsv}
      nextId="apkHbm"
      nextLabel={loc('下一课：HBM', 'Next: HBM')}
      later={loc('Kelvin 测量见 {@pwrKelvin}、{@anaMeasure}。', 'Kelvin measurements: {@pwrKelvin}, {@anaMeasure}.')}
      intro={[
        loc('TSV 是打穿硅的铜孔：刻蚀、绝缘、填充、减薄露出。电阻通常很小，难测的是空洞、针孔和开路。', 'A TSV is a copper via through silicon: etch, liner, fill, thin and reveal. Resistance is usually small; voids, pinholes and opens are the hard catches.'),
        loc('默认铜电阻率 1.68×10⁻⁸ Ω·m，数字是教学示意。', 'Default copper resistivity is 1.68×10⁻⁸ Ω·m. Numbers are teaching illustrations.'),
      ]}
      related={['pwrKelvin', 'anaMeasure', 'apkHbm']}
      kicker={COMMON.kicker}
      asideTitle={step.title}
      asideText={step.text}
      tasks={[
        { id: 't1', text: taskR, done: rHit.hit },
        { id: 't2', text: taskC, done: cHit.hit },
        { id: 't3', text: taskChain, done: chainHit.hit },
        { id: 't4', text: taskSeg, done: segHit.hit },
      ]}
      onReset={() => {
        setStepId(STEPS[0].id)
        setDia(8)
        setLen(80)
        setTox(0.4)
        setN(200)
        setRBump(0.05)
        setDefect(false)
        setSeg(1)
        rHit.reset()
        cHit.reset()
        chainHit.reset()
        segHit.reset()
      }}
      learn={
        <div className="mfg-lab">
          <p>{t(loc('点一步，读孔是什么时候打、什么时候填铜。', 'Click a step and read when the hole is etched and when the copper goes in.'))}</p>
          <Cards items={STEPS} activeId={stepId} cols={4} onPick={(item) => setStepId(item.id)} />
          <p>{t(step.text)}</p>
          <p>{t(loc('单孔电阻 R = ρ × 长度 / (π × 半径²)。铜的电阻率这一课用 1.68×10⁻⁸ Ω·m。孔又短又粗时，电阻只有几十毫欧，难测的不是这个数，而是空洞和开路。', 'Via resistance R = ρ × length / (π × radius²). This lesson uses 1.68×10⁻⁸ Ω·m for copper. A short, wide via is only tens of milliohms. The hard measurement is a void or an open, not this small number.'))}</p>
          <p>{t(loc('孔壁电容 C = 2π × ε × 长度 / ln( (半径+绝缘厚) / 半径 )。ε 用二氧化硅的 3.9×ε0。绝缘越薄，电容越大。', 'Liner capacitance C = 2π × ε × length / ln( (radius+liner) / radius ). ε uses silicon dioxide, 3.9×ε0. A thinner liner means more capacitance.'))}</p>
          <p>{t(loc('菊花链把很多孔串起来好测。一个空洞把单孔电阻放大 10 倍，摊到 1000 个孔上几乎看不见。把链分成几段，同一颗空洞在短段里占比就大了。', 'A daisy chain strings many vias so the resistance is easy to measure. A void that multiplies one via by 10 almost disappears across 1000 vias. Split the chain, and the same void is a large fraction of a short segment.'))}</p>
        </div>
      }
      practice={
        <div className="mfg-lab">
          <Drill n={1} title={taskR}>
            <div className="knobs">
              <Knob label={loc('直径', 'Diameter')} value={dia} unit="µm" min={2} max={10} step={1} onChange={setDia} />
              <Knob label={loc('长度', 'Length')} value={len} unit="µm" min={30} max={100} step={10} onChange={setLen} />
            </div>
            <Readout items={[{ label: loc('你算出的单孔电阻', 'Via resistance you got'), value: `${(r * 1000).toFixed(2)} mΩ` }]} />
            <After show={rHit.hit} text={loc('半径 2.5 µm、长 50 µm，R ≈ 42.8 mΩ。这么小的电阻，两线测量会被引线电阻淹没，所以要四线。', 'At a 2.5 µm radius and 50 µm length, R ≈ 42.8 mΩ. A resistance this small is buried by the leads in a two-wire measurement, so use four wires.')} />
          </Drill>
          <Drill n={2} title={taskC}>
            <Knob label={loc('绝缘层 tox', 'Liner tox')} value={tox} unit="µm" min={0.2} max={0.6} step={0.2} onChange={setTox} />
            <Readout items={[{ label: loc('你算出的电容', 'Capacitance you got'), value: `${(c * 1e15).toFixed(1)} fF` }]} />
            <After show={cHit.hit} text={loc('绝缘 0.2 µm 时，孔壁电容约 141 fF。它和电阻一起决定这个孔对旁边信号的拖累。', 'At a 0.2 µm liner the wall capacitance is about 141 fF. Together with the resistance, it sets how much this via loads a nearby signal.')} />
          </Drill>
          <Drill n={3} title={taskChain}>
            <div className="knobs">
              <Knob label={loc('链上 TSV 数', 'TSVs in chain')} value={n} unit="" min={200} max={1000} step={200} onChange={setN} />
              <Knob label={loc('凸点电阻', 'Bump R')} value={rBump} unit="Ω" min={0.02} max={0.1} step={0.01} onChange={setRBump} />
            </div>
            <label>
              <input type="checkbox" checked={defect} onChange={(event) => setDefect(event.target.checked)} />
              {t(loc('注入一个电阻 ×10 的空洞', 'Inject one void at ×10 resistance'))}
            </label>
            <Readout items={[{ label: loc('整链相对偏差', 'Full-chain relative shift'), value: `${(delta * 100).toFixed(2)}%` }]} />
            <After show={chainHit.hit} text={loc('1000 个孔里只有一个变成 10 倍，整链电阻只挪了一点点，相对偏差不到 2%。只看整链，这个空洞会被当成噪声。', 'One via in 1000 becomes 10×, and the full chain barely moves. The relative shift stays under 2%. Looking only at the whole chain treats that void as noise.')} />
          </Drill>
          <Drill n={4} title={taskSeg}>
            <Knob label={loc('分段数', 'Segments')} value={seg} unit="" min={1} max={10} step={1} onChange={setSeg} />
            <Readout items={[{ label: loc('单段相对偏差', 'Per-segment relative shift'), value: `${(segDelta * 100).toFixed(2)}%` }]} />
            <After show={segHit.hit} text={loc('分成 10 段后，同一颗空洞落在大约 100 个孔的一段里，这一段的偏差就明显了。所以菊花链要分段测，不能只报一个总数。', 'After 10 segments, the same void sits in a segment of about 100 vias, and that segment’s shift stands out. A daisy chain has to be measured in segments, not as one total.')} />
          </Drill>
        </div>
      }
      misconceptions={[
        loc('TSV 电阻很大。通常只有几十毫欧，难的是缺陷。', 'TSV resistance is not large. Tens of milliohms are typical; defects are the hard part.'),
        loc('一条超长链足够。缺陷会被稀释，要分段。', 'One long chain is not enough. Defects are diluted; segment it.'),
        loc('TSV 只是电学问题。应力和 KOZ 会占面积。', 'A TSV is not only electrical. Stress and the KOZ steal area.'),
      ]}
      takeaway={[
        loc('R=ρL/(πr²)，C=2πεL/ln((r+tox)/r)。', 'R=ρL/(πr²), C=2πεL/ln((r+tox)/r).'),
        loc('菊花链要分段，才能看见单个空洞。', 'Daisy chains must be segmented to see a single void.'),
      ]}
      quiz={QUIZ}
    />
  )
}
