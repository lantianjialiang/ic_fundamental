import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { type ModuleId } from '../catalog'
import { Knob } from '../fund/parts'
import { BuildUpCut, CopperWalkthrough, LayerSurvival, PanelLayout, SUBSTRATE_STAGES, type CopperProcess, type PanelView, type StackStage } from './SubFabVisuals'
import { MFG_META } from './meta'
import { After, COMMON, Drill, PackLesson, near, useSticky } from './shell'

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
  { id: 'q3', prompt: loc('要用薄种子铜在介质上形成细线，哪种做法符合？', 'Which route builds fine traces from thin seed copper deposited on dielectric?'), options: [
    { id: 'a', text: loc('减成法蚀刻', 'Subtractive etch') },
    { id: 'b', text: loc('SAP 图形电镀', 'SAP pattern plating') },
    { id: 'c', text: loc('直接在裸介质上电镀', 'Plate directly on bare dielectric') },
  ], answer: 'b', explain: loc('种子层提供电镀所需的导电路径；SAP 在开窗中镀厚，再闪蚀清掉暴露的种子铜。', 'The seed carries current for plating. SAP grows thick traces inside resist openings and flash-etches the exposed seed.') },
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
    { id: 'b', text: loc('累计良率取决于各层的条件通过率', 'Stacked yield depends on the conditional pass rate at each layer') },
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
  const [stepId, setStepId] = useState<StackStage>('core')
  const [procId, setProcId] = useState<CopperProcess>('sub')
  const [procStep, setProcStep] = useState(0)
  const [compare, setCompare] = useState(false)
  const [line, setLine] = useState(20)
  const [space, setSpace] = useState(20)
  const [layers, setLayers] = useState(6)
  const [yLayer, setYLayer] = useState(0.99)
  const [width, setWidth] = useState(400)
  const [height, setHeight] = useState(400)
  const [unit, setUnit] = useState(50)
  const [gap, setGap] = useState(4)
  const [margin, setMargin] = useState(10)
  const [panelView, setPanelView] = useState<PanelView>('panel')
  const step = SUBSTRATE_STAGES.find((item) => item.id === stepId) ?? SUBSTRATE_STAGES[0]
  const yHit = useSticky(layers === 8 && near(yLayer, 0.97, 0.001))
  const panelHit = useSticky(width === 500 && height === 500 && unit === 50 && gap === 2 && margin === 10)
  const sapHit = useSticky(compare && procStep === 4)
  const dropHit = useSticky(layers >= 12)
  const taskY = loc('把层数调到 8、单层良率调到 0.97，读累计良率。', 'Set 8 layers and per-layer yield to 0.97, then read the stacked yield.')
  const taskPanel = loc('把面板宽和高都调到 500 mm，保持工艺边 10 mm，单元 50 mm、间距 2 mm，读颗数和利用率。', 'Set both panel dimensions to 500 mm with a 10 mm border, 50 mm units and 2 mm spacing. Read the count and utilization.')
  const taskSap = loc('打开三种工艺对照，走到成品截面，比较线间铜是在何时清掉的。', 'Compare all three processes at the finished section. Identify when the copper between traces is cleared.')
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
        loc('基板从芯板做起，再一层层往上长。跟着同一块基板看每步增加的结构，再分别计算面板排版和累计良率。', 'A substrate starts from the core and grows one layer at a time. Follow its changing structure, then work out panel utilization and stacked yield.'),
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
        setStepId('core')
        setProcId('sub')
        setProcStep(0)
        setCompare(false)
        setSpace(20)
        setLayers(6)
        setYLayer(0.99)
        setLine(20)
        setWidth(400)
        setHeight(400)
        setMargin(10)
        setPanelView('panel')
        setUnit(50)
        setGap(4)
        yHit.reset()
        panelHit.reset()
        sapHit.reset()
        dropHit.reset()
      }}
      learn={<BuildUpCut value={stepId} onPick={setStepId} />}
      practice={
        <div className="mfg-lab">
          <Drill n={1} title={taskY}>
            <div className="knobs">
              <Knob label={loc('层数', 'Layers')} value={layers} unit="" min={4} max={14} step={2} onChange={setLayers} />
              <Knob label={loc('单层良率', 'Yield / layer')} value={yLayer} unit="" min={0.94} max={0.99} step={0.01} onChange={setYLayer} />
            </div>
            <LayerSurvival layers={layers} yieldRate={yLayer} />
            <After show={yHit.hit} text={loc('0.97 的 8 次方约为 78.37%。', '0.97 to the eighth power is about 78.37%.')} />
          </Drill>
          <Drill n={2} title={taskPanel}>
            <div className="knobs">
              <Knob label={loc('面板宽', 'Panel width')} value={width} unit="mm" min={400} max={550} step={25} onChange={setWidth} />
              <Knob label={loc('面板高', 'Panel height')} value={height} unit="mm" min={400} max={550} step={25} onChange={setHeight} />
              <Knob label={loc('工艺边', 'Process border')} value={margin} unit="mm" min={5} max={30} step={1} onChange={setMargin} />
              <Knob label={loc('单元边长', 'Unit size')} value={unit} unit="mm" min={40} max={60} step={5} onChange={setUnit} />
              <Knob label={loc('单元间距', 'Unit gap')} value={gap} unit="mm" min={2} max={6} step={1} onChange={setGap} />
            </div>
            <PanelLayout width={width} height={height} unit={unit} gap={gap} margin={margin} view={panelView} onView={setPanelView} />
            <After show={panelHit.hit} text={loc('500 × 500 mm 的示例排了 81 颗，利用率为 81%。试着缩小面板，观察整行或整列在临界尺寸处消失。', 'The 500 × 500 mm example fits 81 units at 81% utilization. Shrink the panel and watch an entire row or column disappear at the threshold.')} />
          </Drill>
          <Drill n={3} title={taskSap}>
            <div className="knobs">
              <Knob label={loc('标称线宽 L', 'Nominal line L')} value={line} unit="µm" min={10} max={35} step={5} onChange={setLine} />
              <Knob label={loc('标称线距 S', 'Nominal space S')} value={space} unit="µm" min={10} max={35} step={5} onChange={setSpace} />
            </div>
            <CopperWalkthrough method={procId} step={procStep} compare={compare} line={line} space={space}
              onMethod={setProcId} onStep={setProcStep} onCompare={setCompare} />
            <After show={sapHit.hit} text={loc('减成法在主蚀刻时清掉厚铜。SAP 和 mSAP 在线条镀厚、去胶后，再清掉线间的薄底铜。', 'Subtractive processing clears thick copper during the main etch. SAP and mSAP clear the thin base after plating and stripping the resist.')} />
          </Drill>
          <Drill n={4} title={taskDrop}>
            <Knob label={loc('层数', 'Layers')} value={layers} unit="" min={4} max={14} step={2} onChange={setLayers} />
            <LayerSurvival layers={layers} yieldRate={yLayer} />
            <After show={dropHit.hit} text={loc('每增加一层，就用同一个条件通过率再乘一次。增加走线层时，良率也会影响单颗成本。', 'Each additional layer applies another conditional pass rate. Yield also affects unit cost when adding routing layers.')} />
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
        loc('减成法保留整面铜箔的局部，SAP 和 mSAP 在薄导电底层上图形电镀。选型时同时核对线宽、线距、铜厚和量产能力。', 'Subtractive etching keeps portions of blanket foil. SAP and mSAP pattern-plate over a thin conductive base. Check both line and space, copper thickness, and manufacturing capability.'),
      ]}
      quiz={QUIZ}
    />
  )
}
