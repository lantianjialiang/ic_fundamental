import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Cards, Knob, Readout, Seg } from '../fund/parts'
import { controlLimits, cpk, sheetResistance4pt, viaChainResistance } from './core'
import { ControlPlot } from './figs'
import { MFG_META } from './meta'
import { After, COMMON, Drill, PackLesson, near, useSticky } from './shell'

const PARAMS = [
  { id: 'vth', title: loc('Vth', 'Vth'), text: loc('阈值电压。WAT 看工艺中心，不测产品功能。', 'Threshold. WAT watches the process center, not product function.') },
  { id: 'rs', title: loc('薄层电阻', 'Sheet resistance'), text: loc('四探针 Rs=(π/ln2)·V/I。', 'Four-point probe Rs=(π/ln2)·V/I.') },
  { id: 'via', title: loc('通孔链', 'Via chain'), text: loc('R=N·R_via，用来抓接触孔开路。', 'R=N·R_via, used to catch open contacts.') },
]

const SITES = [
  { id: '5', n: 5, title: loc('5 点', '5 sites') },
  { id: '9', n: 9, title: loc('9 点', '9 sites') },
  { id: '13', n: 13, title: loc('13 点', '13 sites') },
]

const BASE = [0.5, 0.498, 0.501, 0.503, 0.497, 0.5, 0.502, 0.499, 0.5, 0.512, 0.518, 0.525]

const QUIZ = [
  { id: 'q1', prompt: loc('WAT 测的是？', 'What does WAT measure?'), options: [
    { id: 'a', text: loc('每颗产品 die 的功能', 'Function of every product die') },
    { id: 'b', text: loc('划片道测试键上的工艺参数', 'Process parameters on scribe-lane TEG') },
    { id: 'c', text: loc('封装后规格', 'The packaged spec') },
  ], answer: 'b', explain: loc('WAT 在 CP 之前，判断晶圆工艺是否合格出货。', 'WAT sits before CP and judges whether the process may ship.') },
  { id: 'q2', prompt: loc('WAT 通过是否等于每颗 die 都好？', 'Does a WAT pass mean every die is good?'), options: [
    { id: 'a', text: loc('是，可以跳过 CP', 'Yes; skip CP') },
    { id: 'b', text: loc('不是。WAT 抽样工艺，CP 才测每颗电路', 'No. WAT samples the process; CP tests every circuit') },
    { id: 'c', text: loc('WAT 比 CP 更严', 'WAT is stricter than CP') },
  ], answer: 'b', explain: loc('抽样过的工艺仍可能有随机缺陷。', 'A sampled process can still have random defects.') },
  { id: 'q3', prompt: loc('V=1 mV、I=1 mA 的四探针 Rs？', 'Four-point Rs at V=1 mV, I=1 mA?'), options: [
    { id: 'a', text: loc('1 Ω/sq', '1 Ω/sq') },
    { id: 'b', text: loc('4.532 Ω/sq', '4.532 Ω/sq') },
    { id: 'c', text: loc('1000 Ω/sq', '1000 Ω/sq') },
  ], answer: 'b', explain: loc('(π/ln2)·V/I ≈ 4.532。', '(π/ln2)·V/I ≈ 4.532.') },
  { id: 'q4', prompt: loc('控制图只看超限够不够？', 'Is “beyond the limit” enough on a control chart?'), options: [
    { id: 'a', text: loc('够，没超限就稳定', 'Yes; in-limit means stable') },
    { id: 'b', text: loc('不够，连续偏一侧或渐变也是失控', 'No; a run on one side or a drift is also out of control') },
    { id: 'c', text: loc('只要 Cpk>1', 'Cpk>1 is enough') },
  ], answer: 'b', explain: loc('规则包括超限和连续多点同侧。', 'Rules include points beyond limits and runs on one side.') },
  { id: 'q5', prompt: loc('Vth 均值 0.50、σ=0.01、限 0.45–0.55 的 Cpk？', 'Cpk for mean 0.50, σ=0.01, limits 0.45–0.55?'), options: [
    { id: 'a', text: loc('1.00', '1.00') },
    { id: 'b', text: loc('1.667', '1.667') },
    { id: 'c', text: loc('2.00', '2.00') },
  ], answer: 'b', explain: loc('min((0.55−0.50),(0.50−0.45))/(3×0.01)=1.667。', 'min((0.55−0.50),(0.50−0.45))/(3×0.01)=1.667.') },
  { id: 'q6', prompt: loc('TEG 放在哪里？', 'Where does TEG sit?'), options: [
    { id: 'a', text: loc('产品电路中间', 'In the middle of the product circuit') },
    { id: 'b', text: loc('划片道上，不占产品面积', 'In the scribe lane, not on product area') },
    { id: 'c', text: loc('封装基板', 'On the substrate') },
  ], answer: 'b', explain: loc('切割时划片道被锯掉，所以测试键放这里。', 'The scribe is sawn away, so the test keys live there.') },
  { id: 'q7', prompt: loc('10000 个 2 Ω 通孔的链电阻？', 'Chain resistance of 10 000 vias at 2 Ω?'), options: [
    { id: 'a', text: loc('2 Ω', '2 Ω') },
    { id: 'b', text: loc('20 kΩ', '20 kΩ') },
    { id: 'c', text: loc('200 Ω', '200 Ω') },
  ], answer: 'b', explain: loc('N·R_via=2e4 Ω。', 'N·R_via=2e4 Ω.') },
  { id: 'q8', prompt: loc('WAT 数据为什么还要存？', 'Why keep WAT data?'), options: [
    { id: 'a', text: loc('给 PAT / 追溯和工艺反馈，也可进 STDF', 'For PAT, traceability and process feedback; it can also go into STDF') },
    { id: 'b', text: loc('测完就扔', 'Throw it away after the test') },
    { id: 'c', text: loc('只给客户看广告', 'Only for marketing') },
  ], answer: 'a', explain: loc('和 CP 晶圆图对上，才能解释良率。', 'It has to line up with the CP wafer map to explain yield.') },
]

export function MfgWatPage({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [paramId, setParamId] = useState(PARAMS[0].id)
  const [siteId, setSiteId] = useState(SITES[0].id)
  const [vMv, setVMv] = useState(2)
  const [iMa, setIMa] = useState(2)
  const [nVia, setNVia] = useState(1000)
  const [rVia, setRVia] = useState(2)
  const [mean, setMean] = useState(0.52)
  const [sigma, setSigma] = useState(0.02)
  const [drift, setDrift] = useState(false)
  const param = PARAMS.find((item) => item.id === paramId) ?? PARAMS[0]
  const site = SITES.find((item) => item.id === siteId) ?? SITES[0]
  const rs = sheetResistance4pt(vMv * 1e-3, iMa * 1e-3)
  const chain = viaChainResistance(nVia, rVia)
  const cpkNow = cpk(mean, sigma, 0.45, 0.55)
  const limits = controlLimits(0.5, 0.01, site.n)
  const points = BASE.map((p, i) => (drift && i >= 8 ? p : i >= 8 ? 0.5 : p))
  const hits = points.filter((p) => p > limits.ucl || p < limits.lcl).length
  const rsHit = useSticky(near(vMv, 1, 0.01) && near(iMa, 1, 0.01))
  const viaHit = useSticky(nVia === 10000 && rVia === 2)
  const cpkHit = useSticky(near(mean, 0.5, 0.001) && near(sigma, 0.01, 0.001))
  const driftHit = useSticky(drift && hits > 0)
  const siteHit = useSticky(siteId === '9')
  const taskRs = loc('把电压调到 1 mV、电流调到 1 mA，读薄层电阻。', 'Set voltage to 1 mV and current to 1 mA, then read the sheet resistance.')
  const taskVia = loc('把通孔数调到 10000、单孔 2 Ω，读整条链的电阻。', 'Set 10,000 vias at 2 Ω each, then read the chain resistance.')
  const taskCpk = loc('把 Vth 均值调到 0.50、σ 调到 0.01，读 Cpk。', 'Set the Vth mean to 0.50 and σ to 0.01, then read Cpk.')
  const taskDrift = loc('打开渐变漂移，看控制图上哪些点越出了限。', 'Turn on the drift and see which points leave the limits.')
  const taskSites = loc('把测点数调到 9，读控制限怎样变窄。', 'Switch to 9 sites and read how the control limits tighten.')

  return (
    <PackLesson
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      meta={MFG_META.mfgWat}
      nextId="mfgCp"
      nextLabel={loc('下一课：CP 与良率管理', 'Next: CP and yield management')}
      later={loc('Force/Measure 细节见 {@anaMeasure}、{@anaSmu}；STDF 见 {@genStdf}。', 'Force/measure detail: {@anaMeasure}, {@anaSmu}; STDF: {@genStdf}.')}
      intro={[
        loc('WAT（也叫 PCM/ET）在晶圆制造结束后、CP 之前。它测划片道上的测试键，判断工艺是否合格，不测产品电路。', 'WAT (also PCM/ET) sits after fab and before CP. It measures TEG in the scribe to judge the process, not the product circuit.'),
        loc('先看四探针、通孔链、Cpk 和控制图各自在回答什么，再调数字。数字是教学示意。', 'First see what the four-point probe, the via chain, Cpk and the control chart each answer, then change the numbers. Numbers are teaching illustrations.'),
      ]}
      related={['anaStats', 'genStdf', 'mfgCp']}
      kicker={COMMON.kicker}
      asideTitle={param.title}
      asideText={param.text}
      tasks={[
        { id: 't1', text: taskRs, done: rsHit.hit },
        { id: 't2', text: taskVia, done: viaHit.hit },
        { id: 't3', text: taskCpk, done: cpkHit.hit },
        { id: 't4', text: taskDrift, done: driftHit.hit },
        { id: 't5', text: taskSites, done: siteHit.hit },
      ]}
      onReset={() => {
        setParamId(PARAMS[0].id)
        setSiteId(SITES[0].id)
        setVMv(2)
        setIMa(2)
        setNVia(1000)
        setRVia(2)
        setMean(0.52)
        setSigma(0.02)
        setDrift(false)
        rsHit.reset()
        viaHit.reset()
        cpkHit.reset()
        driftHit.reset()
        siteHit.reset()
      }}
      learn={
        <div className="mfg-lab">
          <p>{t(loc('WAT 看的是工艺，不是产品功能。点一项，读它在测什么。', 'WAT watches the process, not product function. Click one and read what it measures.'))}</p>
          <Cards items={PARAMS} activeId={paramId} cols={3} onPick={(item) => setParamId(item.id)} />
          <p>{t(param.text)}</p>
          <p>{t(loc('四探针把电流打进薄层，量另外两针的电压。薄层电阻 Rs = (π / ln 2) × V / I。π/ln2 约是 4.53，所以 Rs 不是 V/I 本身。', 'A four-point probe forces current into the film and measures voltage on the other two needles. Sheet resistance Rs = (π / ln 2) × V / I. π/ln2 is about 4.53, so Rs is not V/I itself.'))}</p>
          <p>{t(loc('通孔链把很多通孔串起来。链电阻 = 个数 × 单孔电阻。链太长是为了把很小的单孔电阻放大到好测的范围，也用来抓开路。', 'A via chain strings many vias together. Chain resistance = count × one-via resistance. The long chain amplifies a tiny via resistance into something easy to measure, and it catches opens.'))}</p>
          <p>{t(loc('规格是 0.45–0.55 V。Cpk = min(上限−均值, 均值−下限) / (3σ)。σ 越小、均值越靠近中间，Cpk 越大，工艺离规格边越远。', 'The spec is 0.45–0.55 V. Cpk = min(upper−mean, mean−lower) / (3σ). A smaller σ and a mean nearer the center make Cpk larger, so the process sits farther from the spec edge.'))}</p>
          <p>{t(loc('控制限 = 中心 ± 3σ/√n。n 是这一组的测点数，点越多，限越窄，因为均值的波动变小。连续往一边漂，即使还没画出限，也说明工艺在变。', 'Control limits = center ± 3σ/√n. n is the site count in the group. More sites make the limits narrower, because the mean jitters less. A run drifting to one side means the process is moving, even before a point crosses the line.'))}</p>
        </div>
      }
      practice={
        <div className="mfg-lab">
          <Drill n={1} title={taskRs}>
            <div className="knobs">
              <Knob label={loc('V', 'V')} value={vMv} unit="mV" min={1} max={5} step={1} onChange={setVMv} />
              <Knob label={loc('I', 'I')} value={iMa} unit="mA" min={1} max={5} step={1} onChange={setIMa} />
            </div>
            <Readout items={[{ label: loc('你算出的 Rs', 'Rs you got'), value: `${rs.toFixed(3)} Ω/sq` }]} />
            <After show={rsHit.hit} text={loc('1 mV / 1 mA 再乘 π/ln2，得到约 4.532 Ω/sq。若只做 V/I，会得到 1 Ω/sq，那漏掉了薄层的几何系数。', '1 mV / 1 mA times π/ln2 is about 4.532 Ω/sq. V/I alone would give 1 Ω/sq and would miss the sheet geometry factor.')} />
          </Drill>
          <Drill n={2} title={taskVia}>
            <div className="knobs">
              <Knob label={loc('通孔数', 'Via count')} value={nVia} unit="" min={1000} max={10000} step={1000} onChange={setNVia} />
              <Knob label={loc('单孔电阻', 'R via')} value={rVia} unit="Ω" min={1} max={5} step={1} onChange={setRVia} />
            </div>
            <Readout items={[{ label: loc('你算出的链电阻', 'Chain resistance you got'), value: `${chain.toFixed(0)} Ω` }]} />
            <After show={viaHit.hit} text={loc('10000 × 2 Ω = 20 kΩ。单孔只有 2 Ω，直接测很容易被引线电阻淹没，串成链之后开路或偏高才会明显。', '10,000 × 2 Ω = 20 kΩ. A single 2 Ω via is easy to hide under lead resistance; in a chain, an open or a high via stands out.')} />
          </Drill>
          <Drill n={3} title={taskCpk}>
            <div className="knobs">
              <Knob label={loc('Vth 均值', 'Vth mean')} value={mean} unit="V" min={0.46} max={0.54} step={0.01} onChange={setMean} />
              <Knob label={loc('σ', 'σ')} value={sigma} unit="V" min={0.01} max={0.04} step={0.01} onChange={setSigma} />
            </div>
            <Readout items={[{ label: loc('你算出的 Cpk', 'Cpk you got'), value: cpkNow.toFixed(3) }]} />
            <After show={cpkHit.hit} text={loc('均值在 0.50，离两边各 0.05 V，除以 3×0.01，Cpk = 1.667。均值一偏，就改用更近的那一边，所以 Cpk 取两边里更小的。', 'The mean is 0.50, 0.05 V from each side. Divide by 3×0.01 and Cpk is 1.667. If the mean shifts, use the nearer side, so Cpk takes the smaller of the two.')} />
          </Drill>
          <Drill n={4} title={taskDrift}>
            <ControlPlot points={points} mean={0.5} lcl={limits.lcl} ucl={limits.ucl} />
            <label>
              <input type="checkbox" checked={drift} onChange={(event) => setDrift(event.target.checked)} />
              {t(loc('注入渐变漂移', 'Inject a drift'))}
            </label>
            <Readout items={[{ label: loc('越出控制限的点数', 'Points beyond the limits'), value: `${hits}` }]} />
            <After show={driftHit.hit} text={loc('后半段被抬高之后，会有点越过上限。没越限之前那一串已经都在中心同一侧，这本身就是失控，不能只等红点。', 'After the second half is lifted, points cross the upper limit. Even before that, the run sits on one side of the center. That run is already out of control; do not wait only for a red point.')} />
          </Drill>
          <Drill n={5} title={taskSites}>
            <Seg options={SITES.map((item) => ({ id: item.id, label: item.title }))} value={siteId} onChange={setSiteId} />
            <ControlPlot points={points} mean={0.5} lcl={limits.lcl} ucl={limits.ucl} />
            <Readout items={[{ label: loc('当前控制限半宽', 'Current limit half-width'), value: ((limits.ucl - limits.lcl) / 2).toFixed(4) }]} />
            <After show={siteHit.hit} text={loc('限宽正比于 1/√n。从 5 点改到 9 点，√n 变大，同一套 σ 下控制限更窄，均值的小偏移更容易被看见。', 'Limit width scales as 1/√n. Going from 5 sites to 9 increases √n, so the same σ draws a narrower limit and a small shift in the mean is easier to see.')} />
          </Drill>
        </div>
      }
      misconceptions={[
        loc('WAT 通过则每颗 die 都好。WAT 抽样工艺，CP 才测产品。', 'A WAT pass does not make every die good. WAT samples the process; CP tests the product.'),
        loc('WAT 测的是产品电路。它测的是测试键。', 'WAT does not measure the product circuit. It measures TEG.'),
        loc('控制图只看超限。趋势和同侧连续同样是失控。', 'A control chart is not only about points beyond limits. Drift and runs count too.'),
      ]}
      takeaway={[
        loc('WAT 判断工艺，CP 判断每颗电路。两者相关，但不互相替代。', 'WAT judges the process; CP judges each circuit. They correlate; they do not replace each other.'),
        loc('Rs=(π/ln2)·V/I；Cpk 与 UCL/LCL=μ±3σ/√n 用来看稳不稳。', 'Rs=(π/ln2)·V/I; Cpk and UCL/LCL=μ±3σ/√n say whether the process is stable.'),
      ]}
      quiz={QUIZ}
    />
  )
}
