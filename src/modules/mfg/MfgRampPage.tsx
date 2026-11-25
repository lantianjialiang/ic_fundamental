import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Cards, Knob } from '../fund/parts'
import { d0Learning, murphyYield, negBinomialYield, poissonYield, product, unitCost } from './core'
import { Plot } from './ProcessDiagrams'
import { Formula, ScaleBars, YieldStages } from './FlowVisuals'
import { YieldPatternFig } from './YieldPatternFig'
import { MFG_META } from './meta'
import { After, COMMON, Drill, PackLesson, near, useSticky } from './shell'

const MODELS = [
  { id: 'poi', title: loc('Poisson', 'Poisson'), text: loc('Y=exp(−AD)。假设缺陷完全随机。', 'Y=exp(−AD). Defects are fully random.') },
  { id: 'mur', title: loc('Murphy', 'Murphy'), text: loc('Y=((1−e^{−AD})/AD)²。对中等聚集更宽松。', 'Y=((1−e^{−AD})/AD)². A bit kinder to moderate clustering.') },
  { id: 'nb', title: loc('负二项', 'Neg. binomial'), text: loc('Y=(1+AD/α)^{−α}。α 越小，缺陷越成团。', 'Y=(1+AD/α)^{−α}. Smaller α means tighter clusters.') },
]

const QUIZ = [
  { id: 'q1', prompt: loc('AD=0.5（A=1 cm²）时 Poisson 良率？', 'Poisson yield at AD=0.5 (A=1 cm²)?'), options: [
    { id: 'a', text: loc('0.6065', '0.6065') },
    { id: 'b', text: loc('0.5000', '0.5000') },
    { id: 'c', text: loc('0.9000', '0.9000') },
  ], answer: 'a', explain: loc('exp(−0.5)=0.6065。', 'exp(−0.5)=0.6065.') },
  { id: 'q2', prompt: loc('同一 AD、α=2 的负二项？', 'Neg. binomial at the same AD, α=2?'), options: [
    { id: 'a', text: loc('0.50', '0.50') },
    { id: 'b', text: loc('0.64', '0.64') },
    { id: 'c', text: loc('1.00', '1.00') },
  ], answer: 'b', explain: loc('(1+0.5/2)^{−2}=0.64。聚集让部分 die 更干净。', '(1+0.5/2)^{−2}=0.64. Clustering leaves some dies cleaner.') },
  { id: 'q3', prompt: loc('总良率 0.95×0.85×0.97×0.99？', 'Total yield 0.95×0.85×0.97×0.99?'), options: [
    { id: 'a', text: loc('0.8500', '0.8500') },
    { id: 'b', text: loc('0.7754', '0.7754') },
    { id: 'c', text: loc('0.9900', '0.9900') },
  ], answer: 'b', explain: loc('线×CP×组装×FT。各阶段不能孤立优化。', 'Line×CP×assembly×FT. Stages cannot be optimized in isolation.') },
  { id: 'q4', prompt: loc('D00=0.5、D∞=0.1、τ=6、t=6 的 D0？', 'D0 at D00=0.5, D∞=0.1, τ=6, t=6?'), options: [
    { id: 'a', text: loc('0.50', '0.50') },
    { id: 'b', text: loc('0.2472', '0.2472') },
    { id: 'c', text: loc('0.10', '0.10') },
  ], answer: 'b', explain: loc('D∞+(D00−D∞)e^{−t/τ}=0.1+0.4/e≈0.2472。', 'D∞+(D00−D∞)e^{−t/τ}=0.1+0.4/e≈0.2472.') },
  { id: 'q5', prompt: loc('爬坡期 D0 是恒定的吗？', 'Is D0 constant during ramp?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是，学习曲线会把它拉向 D∞', 'No; a learning curve pulls it toward D∞') },
    { id: 'c', text: loc('只会变大', 'It only grows') },
  ], answer: 'b', explain: loc('所以前几个月的良率预测不能用量产 D0。', 'Early months cannot use the mature D0.') },
  { id: 'q6', prompt: loc('模型越复杂越准吗？', 'Is a more complex model always more accurate?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不一定，取决于你有没有聚集数据', 'Not necessarily; it depends on whether you have clustering data') },
    { id: 'c', text: loc('Poisson 永远最差', 'Poisson is always worst') },
  ], answer: 'b', explain: loc('没有数据时，复杂模型只是多几个自由参数。', 'Without data, extra parameters are just extra knobs.') },
  { id: 'q7', prompt: loc('SPC 在爬坡里看什么？', 'What does SPC watch during ramp?'), options: [
    { id: 'a', text: loc('WAT / CP / FT 是否漂移，而不是只看月底平均', 'Whether WAT / CP / FT drift, not only the month-end average') },
    { id: 'b', text: loc('只看股价', 'Only the share price') },
    { id: 'c', text: loc('只看一次 Cpk', 'A single Cpk') },
  ], answer: 'a', explain: loc('一次 WAT 偏移就能预告 CP 良率下降。', 'One WAT shift can preview a CP yield drop.') },
  { id: 'q8', prompt: loc('数据闭环指什么？', 'What is the data loop?'), options: [
    { id: 'a', text: loc('WAT→CP→FT→RMA 反馈回设计和工艺', 'WAT→CP→FT→RMA feeding design and process') },
    { id: 'b', text: loc('只把 STDF 存盘', 'Only archiving STDF') },
    { id: 'c', text: loc('只给客户看良率', 'Only showing yield to the customer') },
  ], answer: 'a', explain: loc('没有回馈，爬坡只是等时间。', 'Without feedback, ramp is just waiting.'),
  },
]

export function MfgRampPage({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [modelId, setModelId] = useState(MODELS[0].id)
  const [ad, setAd] = useState(0.3)
  const [d00, setD00] = useState(0.5)
  const [sample, setSample] = useState(0)
  const [months, setMonths] = useState(2)
  const [lineY, setLineY] = useState(0.9)
  const [cpY, setCpY] = useState(0.8)
  const [asmY, setAsmY] = useState(0.95)
  const [ftY, setFtY] = useState(0.97)
  const [nre, setNre] = useState(2)
  const [volumeK, setVolumeK] = useState(20)
  const model = MODELS.find((item) => item.id === modelId) ?? MODELS[0]
  const d0 = d0Learning(d00, 0.1, 6, months)
  const yPoi = poissonYield(d0, 100)
  const yMur = murphyYield(ad, 100)
  const yNb = negBinomialYield(ad, 100, 2)
  const yPoiAd = poissonYield(ad, 100)
  const total = product([lineY, cpY, asmY, ftY])
  const unit = unitCost(nre * 1e6, volumeK * 1000, 8)
  const points = Array.from({ length: 12 }, (_, i) => 0.5 + (i > 6 ? 0.02 * (i - 6) : 0) * (months > 4 ? 1 : 0))
  const modelHit = useSticky(near(ad, 0.5, 0.001))
  const totalHit = useSticky(near(lineY, 0.95, 0.001) && near(cpY, 0.85, 0.001) && near(asmY, 0.97, 0.001) && near(ftY, 0.99, 0.001))
  const learnHit = useSticky(months === 6 && near(d00, 0.5, 0.001))
  const driftHit = useSticky(months > 4)
  const costHit = useSticky(unit < 20)
  const taskModel = loc('把 AD 调到 0.5，读三种模型各自的良率。', 'Set AD to 0.5 and read each model’s yield.')
  const taskTotal = loc('把线、CP、组装、FT 调成 0.95、0.85、0.97、0.99，读总良率。', 'Set line, CP, assembly and FT to 0.95, 0.85, 0.97 and 0.99, then read the total yield.')
  const taskLearn = loc('起始 D0 保持 0.5，把月份调到 6，读这时的 D0 和 Poisson 良率。', 'Keep the starting D0 at 0.5, set the month to 6, and read D0 and the Poisson yield.')
  const taskDrift = loc('把月份推过 4，看控制图后半段怎样离开中心。', 'Push the month past 4 and watch the second half of the chart leave the center.')
  const taskCost = loc('把月产量往上调，直到单颗成本降到 20 以下。', 'Raise monthly volume until the unit cost falls below 20.')

  return (
    <PackLesson
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      meta={MFG_META.mfgRamp}
      nextId="apkOverview"
      nextLabel={loc('下一轨：先进封装', 'Next track: advanced packaging')}
      later={loc('STDF 解析见 {@genStdf}；统计见 {@anaStats}；CPO 的连乘思想见 {@picFlow}。', 'STDF parsing: {@genStdf}; stats: {@anaStats}; the same yield-product idea in CPO: {@picFlow}.')}
      intro={[
        loc('量产爬坡把前面各课收在一张账上：良率模型、各阶段连乘、D0 学习曲线、SPC 和 NRE 摊销。贯穿案例仍是 VDUT-MFG1。', 'The ramp puts the earlier lessons on one ledger: yield models, stage products, a D0 learning curve, SPC and NRE amortization. The running example is still VDUT-MFG1.'),
        loc('模型数字是教学示意，不是代工厂数据。', 'Model numbers are teaching illustrations, not foundry data.'),
      ]}
      related={['genStdf', 'anaStats', 'picFlow', 'mfgWat', 'mfgNre']}
      kicker={COMMON.kicker}
      asideTitle={model.title}
      asideText={model.text}
      tasks={[
        { id: 't1', text: taskModel, done: modelHit.hit },
        { id: 't2', text: taskTotal, done: totalHit.hit },
        { id: 't3', text: taskLearn, done: learnHit.hit },
        { id: 't4', text: taskDrift, done: driftHit.hit },
        { id: 't5', text: taskCost, done: costHit.hit },
      ]}
      onReset={() => {
        setModelId(MODELS[0].id)
        setAd(0.3)
        setD00(0.5)
        setMonths(2)
        setSample(0)
        setLineY(0.9)
        setCpY(0.8)
        setAsmY(0.95)
        setFtY(0.97)
        setNre(2)
        setVolumeK(20)
        modelHit.reset()
        totalHit.reset()
        learnHit.reset()
        driftHit.reset()
        costHit.reset()
      }}
      learn={
        <div className="mfg-lab">
          <p>{t(loc('三种模型都用 AD：A 是面积（这里按 1 cm²），D 是每平方厘米的缺陷数。点一种，读它假设缺陷怎样分布。', 'All three models use AD: A is area (1 cm² here) and D is defects per square centimetre. Click one and read how it assumes defects are spread.'))}</p>
          <Cards items={MODELS} activeId={modelId} cols={3} onPick={(item) => setModelId(item.id)} />
          <YieldPatternFig model={modelId} ad={ad} yieldRate={modelId === 'mur' ? yMur : modelId === 'nb' ? yNb : yPoiAd} />
          <p>{t(model.text)}</p>
          <p>{t(loc('Poisson 假设缺陷完全随机，Y=exp(−AD)。Murphy 对中等成团更宽松。负二项 Y=(1+AD/α)^(−α)，α 越小越成团，一部分 die 更干净，所以同样的 AD 良率更高。', 'Poisson assumes fully random defects, Y=exp(−AD). Murphy is kinder to moderate clustering. The negative binomial is Y=(1+AD/α)^(−α); a smaller α means tighter clusters, some dies stay cleaner, and yield at the same AD is higher.'))}</p>
          <p>{t(loc('总良率 = 线良率 × CP × 组装 × FT。任何一段变差，总良率跟着乘下去，不能把四段拿来平均。', 'Total yield = line × CP × assembly × FT. If one stage gets worse, the total multiplies it in. The four stages are not averaged.'))}</p>
          <p>{t(loc('爬坡时缺陷密度 D0(t) = D∞ + (D00 − D∞) × e^(−t/τ)。这一课 D∞=0.1、τ=6 个月。时间越长，D0 越靠近成熟值，但前几个月不能直接用成熟良率。', 'During ramp, D0(t) = D∞ + (D00 − D∞) × e^(−t/τ). This lesson uses D∞=0.1 and τ=6 months. D0 moves toward the mature value, and the early months cannot use the mature yield.'))}</p>
          <p>{t(loc('单颗成本 = NRE ÷ 月产量 + 可变成本。可变成本这一课按 8 计。产量不够时，一次性费用会把单颗抬得很高。', 'Unit cost = NRE ÷ monthly volume + variable cost. Variable cost is 8 in this lesson. At low volume the one-time bill lifts every unit.'))}</p>
        </div>
      }
      practice={
        <div className="mfg-lab">
          <Drill n={1} title={taskModel}>
            <Knob label={loc('AD', 'AD')} value={ad} unit="" min={0.2} max={0.6} step={0.1} onChange={setAd} />
            <Formula
              rule="Y_P = e⁻ˣ · Y_M = [(1 − e⁻ˣ)/x]² · Y_NB = (1 + x/α)⁻ᵅ"
              value={`x = ${ad.toFixed(1)}, α = 2`}
              note={loc("x = A×D₀ 是单颗平均缺陷数。Poisson 假设独立均匀；Murphy 和负二项用不同分布描述不均匀性。图用同一个 0–100% 刻度。", "x = A×D₀ is the mean defect count per die. Poisson uses uniform independent defects. Murphy and the negative binomial use different distributions for uneven defects. All bars share a 0–100% scale.")}
            >
              <ScaleBars max={1} items={[
                { title: loc('Poisson', 'Poisson'), value: yPoiAd, display: `${(100 * yPoiAd).toFixed(2)}%` },
                { title: loc('Murphy', 'Murphy'), value: yMur, display: `${(100 * yMur).toFixed(2)}%` },
                { title: loc('负二项', 'Negative binomial'), value: yNb, display: `${(100 * yNb).toFixed(2)}%` },
              ]} />
            </Formula>
            <After show={modelHit.hit} text={loc('AD=0.5 时，Poisson = exp(−0.5) ≈ 0.6065，Murphy ≈ 0.6193，负二项（α=2）= (1+0.5/2)^(−2) = 0.64。成团越强，同样的平均缺陷下好 die 越多。', 'At AD=0.5, Poisson = exp(−0.5) ≈ 0.6065, Murphy ≈ 0.6193, and the negative binomial (α=2) = (1+0.5/2)^(−2) = 0.64. Stronger clustering leaves more good dies at the same average defect count.')} />
          </Drill>
          <Drill n={2} title={taskTotal}>
            <div className="knobs">
              <Knob label={loc('线良率', 'Line yield')} value={lineY} unit="" min={0.9} max={0.99} step={0.01} onChange={setLineY} />
              <Knob label={loc('CP 良率', 'CP yield')} value={cpY} unit="" min={0.8} max={0.95} step={0.01} onChange={setCpY} />
              <Knob label={loc('组装良率', 'Assembly yield')} value={asmY} unit="" min={0.95} max={0.99} step={0.01} onChange={setAsmY} />
              <Knob label={loc('FT 良率', 'FT yield')} value={ftY} unit="" min={0.97} max={0.995} step={0.005} onChange={setFtY} />
            </div>
            <Formula rule="Y_total = Y_line × Y_CP × Y_asm × Y_FT" value={`${lineY} × ${cpY} × ${asmY} × ${ftY} ≈ ${total.toFixed(4)}`} note={loc("条形从同一批投入开始，逐段乘当前工序的条件通过率。", "Each bar starts with the same input population and applies the current step’s conditional pass rate.")}><YieldStages stages={[
                { title: loc('过制造线', 'After line'), rate: lineY }, { title: loc('过 CP', 'After CP'), rate: cpY },
                { title: loc('过组装', 'After assembly'), rate: asmY }, { title: loc('过 FT', 'After FT'), rate: ftY },
              ]} /></Formula>
            <After show={totalHit.hit} text={loc('0.95×0.85×0.97×0.99 ≈ 0.7754。四段相乘，最差的 CP 把总良率拉到 0.85 以下，不是四段的平均。', '0.95×0.85×0.97×0.99 ≈ 0.7754. The four stages multiply, and the weakest one, CP, pulls the total below 0.85. That is not the average of the four.')} />
          </Drill>
          <Drill n={3} title={taskLearn}>
            <div className="knobs">
              <Knob label={loc('起始 D00', 'Start D00')} value={d00} unit="/cm²" min={0.2} max={0.6} step={0.1} onChange={setD00} />
              <Knob label={loc('月份 t', 'Month t')} value={months} unit="" min={0} max={12} step={1} onChange={setMonths} />
            </div>
            <Formula rule="D(t) = D∞ + (D_start − D∞)exp(−t/τ)" value={`D(${months}) = ${d0.toFixed(4)} /cm²; Y = ${yPoi.toFixed(4)}`} note={loc("D∞ 是成熟缺陷密度 0.10/cm²，τ=6 月是时间常数。一个 τ 后，距离成熟值的差剩 e⁻¹。面积为 1 cm²，代入 Y=exp(−D·A)。", "D∞ is mature density, 0.10/cm², and τ=6 months. After one τ the excess remaining is e⁻¹. Area is 1 cm² for Y=exp(−D·A).")}><Plot title={loc('缺陷密度随爬坡月份变化', 'Defect density over the ramp')}
                points={Array.from({ length: 13 }, (_, i) => d0Learning(d00, 0.1, 6, i))}
                labels={Array.from({ length: 13 }, (_, i) => t(loc(`第 ${i} 月`, `Month ${i}`)))}
                selected={months} onPick={setMonths} min={0.08} max={0.62} unit="/cm²"
                guides={[{ label: 'D∞', value: 0.1 }]}
                caption={loc('移动月份游标，观察曲线如何逐步接近成熟基线。', 'Move the month cursor to see the curve approach the mature baseline.')} /></Formula>
            <After show={learnHit.hit} text={loc('D0 = 0.1 + (0.5−0.1)×e^(−6/6) ≈ 0.2472。面积 1 cm² 时 Poisson = exp(−0.2472) ≈ 0.781。第 6 个月还没到成熟的 0.1，不能直接用成熟良率排产。', 'D0 = 0.1 + (0.5−0.1)×e^(−6/6) ≈ 0.2472. On 1 cm², Poisson = exp(−0.2472) ≈ 0.781. Month 6 has not reached the mature 0.1, so the mature yield cannot be used to plan output yet.')} />
          </Drill>
          <Drill n={4} title={taskDrift}>
            <Knob label={loc('月份 t', 'Month t')} value={months} unit="" min={0} max={12} step={1} onChange={setMonths} />
            <Plot title={loc('爬坡批次控制图', 'Control chart for ramp lots')} points={points}
              labels={points.map((_, i) => t(loc(`批次 ${i + 1}`, `Lot ${i + 1}`)))} selected={sample} onPick={setSample} min={0.45} max={0.62} unit="V"
              guides={[{ label: 'LCL', value: 0.47, alert: true }, { label: 'CL', value: 0.5 }, { label: 'UCL', value: 0.53, alert: true }]}
              caption={loc('此模拟在月份超过 4 时注入向上漂移。逐点读值，并区分中心线和控制限。', 'The example adds upward drift after month 4. Read individual points and distinguish the center line from the limits.')} />
            <After show={driftHit.hit} text={loc('后半段离开中心，是工艺在漂，不是月底平均还能看。这种偏移要回到 WAT 和 CP，不能只等 FT 的月报。', 'The later points leave the center, so the process is drifting. A month-end average will not show it. Map that shift back to WAT and CP; do not wait for the FT monthly report.')} />
          </Drill>
          <Drill n={5} title={taskCost}>
            <div className="knobs">
              <Knob label={loc('NRE（百万）', 'NRE (M)')} value={nre} unit="" min={1} max={4} step={0.5} onChange={setNre} />
              <Knob label={loc('月产量（千）', 'Monthly volume (k)')} value={volumeK} unit="k" min={10} max={200} step={10} onChange={setVolumeK} />
            </div>
            <Formula
              rule="C = NRE / Q + v"
              value={`${(nre * 1e6).toLocaleString()} / ${(volumeK * 1000).toLocaleString()} + 8 = ${unit.toFixed(2)}`}
              note={loc("这里用 Q 颗作为一次性费用的摊销分母，可变成本每颗为 8。", "Q is the volume over which the one-time cost is spread. Variable cost is 8 per unit.")}
            >
              <ScaleBars max={unit} items={[
                { title: loc('固定费用摊销', 'Amortized NRE'), value: unit - 8 },
                { title: loc('每颗可变成本', 'Variable cost per unit'), value: 8 },
              ]} />
            </Formula>
            <After show={costHit.hit} text={loc('单颗 = NRE ÷ 产量 + 8。NRE 停在 2 百万时，产量要到大约 17 万颗，摊销才降到让单颗低于 20。产量停在低位时，一次性费用会占掉单颗里的大部分。', 'Unit = NRE ÷ volume + 8. With NRE at 2 million, volume has to reach about 170,000 before amortization lets the unit fall below 20. At a low volume the one-time bill is most of the unit cost.')} />
          </Drill>
        </div>
      }
      misconceptions={[
        loc('模型越复杂越准。没有聚集数据时，多参数只是更会拟合噪声。', 'A richer model is not automatically righter. Extra parameters fit noise if you lack clustering data.'),
        loc('爬坡期 D0 恒定。学习曲线会把它拉下来。', 'D0 is not constant on the ramp. The learning curve pulls it down.'),
        loc('各阶段良率可以孤立优化。总良率是连乘。', 'Stage yields cannot be optimized in isolation. Total yield is a product.'),
      ]}
      takeaway={[
        loc('总良率 = 线 × CP × 组装 × FT；D0(t)=D∞+(D00−D∞)e^{−t/τ}。', 'Total yield = line × CP × assembly × FT; D0(t)=D∞+(D00−D∞)e^{−t/τ}.'),
        loc('WAT 偏移要立刻对到 CP/FT，数据不闭环就没有爬坡。', 'A WAT shift must be mapped onto CP/FT; without a data loop there is no ramp.'),
      ]}
      quiz={QUIZ}
    />
  )
}
