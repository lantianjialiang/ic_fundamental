import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Cards, Knob, Readout, Seg } from '../fund/parts'
import { layerYield, panelUnits } from './core'
import { LayerBars } from './figs'
import { MFG_META } from './meta'
import { After, COMMON, Drill, PackLesson, near, useSticky } from './shell'

const STEPS = [
  { id: 'core', title: loc('Core / 覆铜', 'Core / CCL'), text: loc('刚性芯板。', 'The stiff core.') },
  { id: 'drill', title: loc('钻孔 / PTH', 'Drill / PTH'), text: loc('打穿 core 的镀通孔。', 'Plated holes through the core.') },
  { id: 'bu', title: loc('积层 + 激光孔', 'Build-up + laser via'), text: loc('贴膜、激光钻孔、去钻污、化学铜。', 'Film, laser drill, desmear, electroless Cu.') },
  { id: 'sap', title: loc('图形 / SAP', 'Pattern / SAP'), text: loc('干膜、电镀、闪蚀。细线走半加成。', 'Dry film, plate, flash etch. Fine lines need SAP.') },
  { id: 'mask', title: loc('阻焊 / 表面', 'Mask / finish'), text: loc('开窗后做 ENIG 等表面处理（概念示例）。', 'Openings then a finish such as ENIG (conceptual example).') },
]

const PROCESS = [
  { id: 'sub', title: loc('减成法', 'Subtractive') },
  { id: 'sap', title: loc('SAP / mSAP', 'SAP / mSAP') },
]

const QUIZ = [
  { id: 'q1', prompt: loc('8 层、单层良率 0.97 的累计良率？', 'Stacked yield of 8 layers at 0.97 each?'), options: [
    { id: 'a', text: loc('0.97', '0.97') },
    { id: 'b', text: loc('约 0.784', 'About 0.784') },
    { id: 'c', text: loc('1.00', '1.00') },
  ], answer: 'b', explain: loc('Y=0.97^8≈0.7837。层数会连乘惩罚。', 'Y=0.97^8≈0.7837. Layers multiply the penalty.') },
  { id: 'q2', prompt: loc('500 mm 面板、边缘 10、单元 50、间距 2 能排几个？', 'How many 50 mm units on a 500 mm panel, 10 mm margin, 2 mm gap?'), options: [
    { id: 'a', text: loc('64', '64') },
    { id: 'b', text: loc('81', '81') },
    { id: 'c', text: loc('100', '100') },
  ], answer: 'b', explain: loc('可用 480 mm，(480+2)/(50+2)=9，9×9=81，利用率 0.81。', 'Usable 480 mm; (480+2)/(50+2)=9; 9×9=81; utilization 0.81.') },
  { id: 'q3', prompt: loc('线宽 10 µm 该用哪种图形法？', 'Which pattern method for 10 µm lines?'), options: [
    { id: 'a', text: loc('减成法蚀刻', 'Subtractive etch') },
    { id: 'b', text: loc('SAP / mSAP', 'SAP / mSAP') },
    { id: 'c', text: loc('任意', 'Either') },
  ], answer: 'b', explain: loc('减成法侧蚀做不了那么细。', 'Subtractive undercut cannot hold that width.') },
  { id: 'q4', prompt: loc('表面处理只是外观吗？', 'Is surface finish only cosmetic?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是：它保证可焊性和接触可靠性', 'No: it protects solderability and contact reliability') },
    { id: 'c', text: loc('可以省略', 'It can be skipped') },
  ], answer: 'b', explain: loc('ENIG / ENEPIG / OSP 是概念示例，作用是可焊和防氧化。', 'ENIG / ENEPIG / OSP are conceptual examples for solderability and oxidation.') },
  { id: 'q5', prompt: loc('层数增加还会带来什么？', 'What else grows with layer count?'), options: [
    { id: 'a', text: loc('只变电气更好', 'Only electrical quality') },
    { id: 'b', text: loc('周期、成本、翘曲和良率损失', 'Cycle time, cost, warpage and yield loss') },
    { id: 'c', text: loc('自动提高利用率', 'Utilization rises by itself') },
  ], answer: 'b', explain: loc('每一层都重复积层循环。', 'Each layer repeats the build-up loop.') },
  { id: 'q6', prompt: loc('AOI 能替代电气测试吗？', 'Can AOI replace electrical test?'), options: [
    { id: 'a', text: loc('能', 'Yes') },
    { id: 'b', text: loc('不能：AOI 看外形，电气测开短路', 'No: AOI sees shape; electrical test finds opens/shorts') },
    { id: 'c', text: loc('AOI 测电阻', 'AOI measures resistance') },
  ], answer: 'b', explain: loc('两者互补，见下一课飞针。', 'They complement each other; flying probe is next.') },
  { id: 'q7', prompt: loc('基板良率是不是总接近 100%？', 'Is substrate yield always near 100%?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是，细线多层时累计良率会掉到 80% 左右', 'No; fine-line stacks can sit near 80%') },
    { id: 'c', text: loc('比晶圆还高且恒定', 'Always higher than wafer yield') },
  ], answer: 'b', explain: loc('0.97^8 已经不到 80%。', '0.97^8 is already under 80%.') },
  { id: 'q8', prompt: loc('PTH 和激光微孔谁先做？', 'Which is first, PTH or laser microvia?'), options: [
    { id: 'a', text: loc('先做 core 的 PTH，再一层层积层打微孔', 'Core PTH first, then microvias layer by layer') },
    { id: 'b', text: loc('先打所有微孔再压 core', 'All microvias, then the core') },
    { id: 'c', text: loc('同时一次钻完', 'All holes in one drill') },
  ], answer: 'a', explain: loc('积层是后加的，微孔跟着每一层走。', 'Build-up is added later; microvias follow each layer.'),
  },
]

export function MfgSubFabPage({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [stepId, setStepId] = useState(STEPS[0].id)
  const [procId, setProcId] = useState(PROCESS[0].id)
  const [layers, setLayers] = useState(6)
  const [yLayer, setYLayer] = useState(0.99)
  const [line, setLine] = useState(20)
  const [panel, setPanel] = useState(400)
  const [unit, setUnit] = useState(50)
  const [gap, setGap] = useState(4)
  const step = STEPS.find((item) => item.id === stepId) ?? STEPS[0]
  const y = layerYield(yLayer, layers)
  const layout = panelUnits(panel, panel, 10, unit, unit, gap)
  const needSap = line <= 10
  const yHit = useSticky(layers === 8 && near(yLayer, 0.97, 0.001))
  const panelHit = useSticky(panel === 500 && unit === 50 && gap === 2)
  const sapHit = useSticky(line === 10 && procId === 'sap')
  const dropHit = useSticky(layers >= 12)
  const taskY = loc('把层数调到 8、单层良率调到 0.97，读累计良率。', 'Set 8 layers and per-layer yield to 0.97, then read the stacked yield.')
  const taskPanel = loc('把面板调到 500、单元 50、间距 2，读能排几颗、利用率多少。', 'Set the panel to 500, the unit to 50 and the gap to 2, then read the unit count and utilization.')
  const taskSap = loc('把线宽调到 10 µm，并选上能做这种细线的图形法。', 'Set the line width to 10 µm and pick the pattern method that can hold that width.')
  const taskDrop = loc('把层数加到 12，读累计良率掉了多少。', 'Raise the layer count to 12 and read how far the stacked yield falls.')

  return (
    <PackLesson
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      meta={MFG_META.mfgSubFab}
      nextId="mfgFlying"
      nextLabel={loc('下一课：飞针与治具', 'Next: flying probe and fixture')}
      later={loc('开短路要靠下一课的基板测试抓住，不要留到封装后。', 'Opens and shorts belong in the next lesson’s substrate test, not after assembly.')}
      intro={[
        loc('基板从芯板做起，再一层层往上长。先看每一步在加什么，再算层数和排版怎样吃掉良率。', 'A substrate starts from the core and grows one layer at a time. See what each step adds, then see how layer count and panel layout eat yield.'),
        loc('ENIG 等表面处理名是概念示例。数字是教学示意。', 'Finish names such as ENIG are conceptual examples. Numbers are teaching illustrations.'),
      ]}
      related={['mfgSubstrate', 'mfgFlying', 'pcbFab']}
      kicker={COMMON.kicker}
      asideTitle={step.title}
      asideText={step.text}
      notice={COMMON.vendor}
      tasks={[
        { id: 't1', text: taskY, done: yHit.hit },
        { id: 't2', text: taskPanel, done: panelHit.hit },
        { id: 't3', text: taskSap, done: sapHit.hit },
        { id: 't4', text: taskDrop, done: dropHit.hit },
      ]}
      onReset={() => {
        setStepId(STEPS[0].id)
        setProcId(PROCESS[0].id)
        setLayers(6)
        setYLayer(0.99)
        setLine(20)
        setPanel(400)
        setUnit(50)
        setGap(4)
        yHit.reset()
        panelHit.reset()
        sapHit.reset()
        dropHit.reset()
      }}
      learn={
        <div className="mfg-lab">
          <p>{t(loc('点一步，读它加在基板的哪一层上。芯板的通孔先做，积层和微孔是后加上去的。', 'Click a step and read which layer it adds. The core’s plated holes come first; build-up and microvias are added later.'))}</p>
          <Cards items={STEPS} activeId={stepId} cols={3} onPick={(item) => setStepId(item.id)} />
          <p>{t(step.text)}</p>
          <p>{t(loc('累计良率 = 单层良率的层数次方。0.97 看起来很高，乘 8 次就不再接近 1。层数加一倍，惩罚再乘一次。', 'Stacked yield = per-layer yield raised to the layer count. 0.97 looks high; raised to the 8th power it is no longer near 1. Doubling the layers multiplies the penalty again.'))}</p>
          <p>{t(loc('面板四周留 10 mm 工艺边。一行能排的颗数 = floor( (可用边长 + 间距) / (单元边长 + 间距) )。利用率 = 颗数 × 单元面积 / 面板面积，间距和边缘都不算进有用面积。', 'The panel keeps a 10 mm process margin. Units in one row = floor( (usable side + gap) / (unit side + gap) ). Utilization = count × unit area / panel area. Gaps and the margin are not useful area.'))}</p>
          <p>{t(loc('减成法是先铺满铜再蚀掉不要的，侧蚀会把细线咬窄。10 µm 这一级改用 SAP / mSAP：先做图形再镀上铜。', 'Subtractive lays copper everywhere and etches away the rest; undercut narrows a fine line. At 10 µm, switch to SAP / mSAP: pattern first, then plate the copper.'))}</p>
        </div>
      }
      practice={
        <div className="mfg-lab">
          <Drill n={1} title={taskY}>
            <LayerBars
              layers={Array.from({ length: layers }, (_, i) => ({
                id: `l${i}`,
                title: loc(`层 ${i + 1}`, `Layer ${i + 1}`),
                color: i % 2 ? '#d8c48a' : '#c4a15a',
              }))}
              activeId="l0"
              onPick={() => undefined}
            />
            <div className="knobs">
              <Knob label={loc('层数', 'Layers')} value={layers} unit="" min={4} max={14} step={2} onChange={setLayers} />
              <Knob label={loc('单层良率', 'Yield / layer')} value={yLayer} unit="" min={0.94} max={0.99} step={0.01} onChange={setYLayer} />
            </div>
            <Readout items={[{ label: loc('你算出的累计良率', 'Stacked yield you got'), value: y.toFixed(4) }]} />
            <After show={yHit.hit} text={loc('0.97 的 8 次方约是 0.7837。每一层都要做对，所以层数是连乘，不是平均。', '0.97 to the 8th power is about 0.7837. Every layer has to come out right, so the count is a product, not an average.')} />
          </Drill>
          <Drill n={2} title={taskPanel}>
            <div className="knobs">
              <Knob label={loc('面板边长', 'Panel size')} value={panel} unit="mm" min={400} max={500} step={50} onChange={setPanel} />
              <Knob label={loc('单元边长', 'Unit size')} value={unit} unit="mm" min={40} max={60} step={10} onChange={setUnit} />
              <Knob label={loc('间距', 'Gap')} value={gap} unit="mm" min={2} max={6} step={2} onChange={setGap} />
            </div>
            <Readout items={[
              { label: loc('你算出的颗数', 'Units you got'), value: `${layout.n}` },
              { label: loc('利用率', 'Utilization'), value: layout.utilization.toFixed(3) },
            ]} />
            <After show={panelHit.hit} text={loc('可用边长 480 mm。(480+2)/(50+2)=9，9×9=81 颗。81×50×50 / 500² = 0.81，剩下的是边缘和间距。', 'Usable side 480 mm. (480+2)/(50+2)=9, so 9×9=81 units. 81×50×50 / 500² = 0.81. The rest is margin and gaps.')} />
          </Drill>
          <Drill n={3} title={taskSap}>
            <Seg options={PROCESS.map((item) => ({ id: item.id, label: item.title }))} value={procId} onChange={setProcId} />
            <Knob label={loc('线宽', 'Line width')} value={line} unit="µm" min={10} max={25} step={5} onChange={setLine} />
            <After show={sapHit.hit} text={needSap
              ? loc('10 µm 已经到减成法侧蚀守不住的宽度，所以用 SAP / mSAP。', '10 µm is already too fine for subtractive undercut, so use SAP / mSAP.')
              : loc('线宽和图形法还没同时对上。', 'Line width and the pattern method are not both set yet.')} />
          </Drill>
          <Drill n={4} title={taskDrop}>
            <Knob label={loc('层数', 'Layers')} value={layers} unit="" min={4} max={14} step={2} onChange={setLayers} />
            <Readout items={[{ label: loc('你算出的累计良率', 'Stacked yield you got'), value: y.toFixed(4) }]} />
            <After show={dropHit.hit} text={loc('层数从少加到 12，同一个单层良率要再乘几次，累计良率明显下降。多出来的层如果只是为了走线，电气和良率要一起算。', 'Raising the count to 12 multiplies the same per-layer yield a few more times, so stacked yield falls clearly. Extra layers added only for routing have to be priced together with yield.')} />
          </Drill>
        </div>
      }
      misconceptions={[
        loc('层数只影响电气。它也影响良率、成本和翘曲。', 'Layer count is not only electrical. It also hits yield, cost and warpage.'),
        loc('基板良率总是接近 100%。细线多层会连乘掉下去。', 'Substrate yield is not always near 100%. Fine-line stacks multiply down.'),
        loc('表面处理只是外观。没有它焊盘会氧化、虚焊。', 'Finish is not cosmetic. Without it pads oxidize and solder poorly.'),
      ]}
      takeaway={[
        loc('Y = y_layer^n；面板利用率决定单颗基板成本。', 'Y = y_layer^n; panel utilization sets substrate unit cost.'),
        loc('10 µm 级细线走 SAP；减成法侧蚀做不到。', '10 µm-class lines need SAP; subtractive undercut cannot hold them.'),
      ]}
      quiz={QUIZ}
    />
  )
}
