import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Knob, Readout } from '../fund/parts'
import { diesPerWafer, poissonYield, rayleighCdNm } from './core'
import { FabChoices, LayerCut, OperationCut, PATTERN_STEPS, PatternCut, ResolutionFigure, WaferLayout, YieldFigure, type FabOperation } from './FabFigs'
import { MFG_META } from './meta'
import { After, COMMON, Drill, PackLesson, useSticky } from './shell'

const LAYERS = [
  { id: 'feol', title: loc('FEOL', 'FEOL'), text: loc('在硅里做出晶体管：阱、栅、源漏、隔离。', 'Transistors in silicon: wells, gates, source/drain, isolation.') },
  { id: 'meol', title: loc('MEOL', 'MEOL'), text: loc('接触孔和局部互连，把晶体管接到金属。', 'Contacts and local interconnect that reach the first metal.') },
  { id: 'beol', title: loc('BEOL', 'BEOL'), text: loc('多层金属与介质。互连延时和可靠性主要在这里。', 'Stacked metal and dielectric. Interconnect delay and reliability live here.') },
]

const START_ORDER = ['etch', 'litho', 'clean', 'dep']
const RIGHT_ORDER = PATTERN_STEPS.map((p) => p.id)

const TOOLS = [
  { id: 'duv', title: loc('DUV 193 nm', 'DUV 193 nm'), k1: 0.3, lambda: 193, na: 1.35, minNa: 0.8, maxNa: 1.35 },
  { id: 'euv', title: loc('EUV 13.5 nm', 'EUV 13.5 nm'), k1: 0.4, lambda: 13.5, na: 0.33, minNa: 0.25, maxNa: 0.55 },
]

const QUIZ = [
  { id: 'q1', prompt: loc('FEOL 主要做什么？', 'What does FEOL mainly build?'), options: [
    { id: 'a', text: loc('多层金属互连', 'Stacked metal interconnect') },
    { id: 'b', text: loc('晶体管本身', 'The transistors themselves') },
    { id: 'c', text: loc('封装基板', 'The package substrate') },
  ], answer: 'b', explain: loc('FEOL 在硅里做器件；BEOL 才是金属互连。', 'FEOL builds devices in silicon; BEOL is the metal stack.') },
  { id: 'q2', prompt: loc('光刻在一片晶圆上发生几次？', 'How often does lithography happen on one wafer?'), options: [
    { id: 'a', text: loc('只一次，做出全部图形', 'Once, for every pattern') },
    { id: 'b', text: loc('许多图形层分别用光刻定义', 'Many patterned layers are defined separately') },
    { id: 'c', text: loc('只在 BEOL', 'Only in BEOL') },
  ], answer: 'b', explain: loc('晶体管和互连都由多次图形化逐步形成，所以会反复曝光。', 'Transistors and interconnect are built through repeated patterning and exposure.') },
  { id: 'q3', prompt: loc('die 面积变大时，成本为什么不是线性涨？', 'Why does cost not rise linearly with die area?'), options: [
    { id: 'a', text: loc('每片 die 数更少，而且 Poisson 良率随面积下降', 'Fewer dies per wafer, and Poisson yield falls with area') },
    { id: 'b', text: loc('光刻变便宜', 'Lithography gets cheaper') },
    { id: 'c', text: loc('D0 会自动变小', 'D0 shrinks by itself') },
  ], answer: 'a', explain: loc('DPW 下降，同时 Y=exp(−D0·A) 也下降，好 die 更少。', 'DPW drops and Y=exp(−D0·A) drops, so good dies fall faster.') },
  { id: 'q4', prompt: loc('Rayleigh 公式 CD = k1·λ/NA。λ 更短会怎样？', 'Rayleigh CD = k1·λ/NA. What if λ is shorter?'), options: [
    { id: 'a', text: loc('分辨率变差', 'Resolution gets worse') },
    { id: 'b', text: loc('可印更细的线', 'Finer lines can be printed') },
    { id: 'c', text: loc('和 NA 无关', 'NA no longer matters') },
  ], answer: 'b', explain: loc('λ 减小或 NA 增大，CD 变小。数字是教学示意。', 'Smaller λ or larger NA shrinks CD. Numbers are teaching illustrations.') },
  { id: 'q5', prompt: loc('划片道变宽会怎样？', 'What happens if the scribe lane gets wider?'), options: [
    { id: 'a', text: loc('DPW 下降，因为有效面积变大', 'DPW falls because the effective die area grows') },
    { id: 'b', text: loc('DPW 上升', 'DPW rises') },
    { id: 'c', text: loc('只影响 WAT', 'It only affects WAT') },
  ], answer: 'a', explain: loc('A=(w+s)(h+s)，划片道算进占用面积。', 'A=(w+s)(h+s); the scribe is part of the occupied area.') },
  { id: 'q6', prompt: loc('BEOL 除了连线还影响什么？', 'Besides wiring, what else does BEOL affect?'), options: [
    { id: 'a', text: loc('只影响颜色', 'Only the color') },
    { id: 'b', text: loc('互连延时、功耗和可靠性', 'Interconnect delay, power and reliability') },
    { id: 'c', text: loc('晶体管阈值', 'Transistor Vth') },
  ], answer: 'b', explain: loc('RC 延时、电迁移、介质击穿都在金属层。', 'RC delay, electromigration and dielectric breakdown sit in the metal stack.') },
  { id: 'q7', prompt: loc('300 mm、10×10 mm、无划片道的 DPW 约多少？', 'DPW for 300 mm, 10×10 mm, no scribe?'), options: [
    { id: 'a', text: loc('约 400', 'About 400') },
    { id: 'b', text: loc('约 640', 'About 640') },
    { id: 'c', text: loc('约 900', 'About 900') },
  ], answer: 'b', explain: loc('π(d/2)²/A − πd/√(2A) ≈ 640。教学示意。', 'π(d/2)²/A − πd/√(2A) ≈ 640. Teaching illustration.') },
  { id: 'q8', prompt: loc('CMP 的作用是？', 'What is CMP for?'), options: [
    { id: 'a', text: loc('把表面磨平，给下一层光刻焦点', 'Planarize so the next lithography layer can focus') },
    { id: 'b', text: loc('注入杂质', 'Implant dopants') },
    { id: 'c', text: loc('切割晶圆', 'Saw the wafer') },
  ], answer: 'a', explain: loc('不平坦会让光刻失焦和套刻变差。', 'Relief throws lithography out of focus and hurts overlay.') },
]

export function MfgFabPage({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [layerId, setLayerId] = useState(LAYERS[0].id)
  const [patternStep, setPatternStep] = useState<(typeof PATTERN_STEPS)[number]['id']>('dep')
  const [operation, setOperation] = useState<FabOperation>('implant')
  const [wafer, setWafer] = useState(300)
  const [dieW, setDieW] = useState(12)
  const [dieH, setDieH] = useState(12)
  const [scribe, setScribe] = useState(0.2)
  const [edge, setEdge] = useState(0)
  const [d0, setD0] = useState(0.15)
  const [toolId, setToolId] = useState(TOOLS[0].id)
  const [na, setNa] = useState(TOOLS[0].na)
  const [k1, setK1] = useState(TOOLS[0].k1)
  const [order, setOrder] = useState(START_ORDER)
  const layer = LAYERS.find((item) => item.id === layerId) ?? LAYERS[0]
  const tool = TOOLS.find((item) => item.id === toolId) ?? TOOLS[0]
  const reference = tool.id === 'duv' ? TOOLS[1] : TOOLS[0]
  const dpw = diesPerWafer(wafer, dieW, dieH, scribe, edge)
  const y = poissonYield(d0, dieW * dieH)
  const good = Math.round(dpw * y)
  const cd = rayleighCdNm(k1, tool.lambda, na)
  const baseline = wafer === 300 && dieW === 10 && dieH === 10 && edge === 0
  const bare = useSticky(baseline && scribe === 0)
  const yielded = useSticky(baseline && d0 === 0.1 && scribe === 0)
  const scribed = useSticky(baseline && scribe === 0.1)
  const ordered = useSticky(order.every((id, i) => id === RIGHT_ORDER[i]))
  const compared = useSticky(toolId === 'euv')
  const taskDpw = loc('调到 300 mm、10×10 mm、划片道和边缘排除均为 0，读出每片颗数。', 'Set 300 mm, 10×10 mm, with scribe and edge exclusion both zero. Read the dies per wafer.')
  const taskGood = loc('在同一颗尺寸上把 D0 调到 0.1 /cm²，读出好 die。', 'On that same die size, set D0 to 0.1 /cm² and read the good dies.')
  const taskScribe = loc('把划片道调到 0.1 mm，读每片颗数怎样变。', 'Set the scribe to 0.1 mm and read how dies per wafer change.')
  const taskOrder = loc('按薄膜图形转移的顺序排列四个步骤。', 'Put the four film pattern-transfer steps in order.')
  const taskCd = loc('切换到 EUV，比较两组参数的预计线宽。', 'Switch to EUV and compare the predicted widths of the two parameter sets.')
  const selectTool = (id: string) => {
    const preset = TOOLS.find((item) => item.id === id) ?? TOOLS[0]
    setToolId(preset.id)
    setNa(preset.na)
    setK1(preset.k1)
  }
  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir
    if (next < 0 || next >= order.length) return
    setOrder((prev) => {
      const copy = [...prev]
      ;[copy[index], copy[next]] = [copy[next], copy[index]]
      return copy
    })
  }

  return (
    <PackLesson
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      meta={MFG_META.mfgFab}
      nextId="mfgNre"
      nextLabel={loc('下一课：光罩、MPW 与 NRE', 'Next: masks, MPW and NRE')}
      later={loc('晶圆排布和每次并测颗数会影响 CP 的落针次数，见 {@mfgCp}。', 'Die layout and the number of sites tested in parallel affect CP touchdowns; see {@mfgCp}.')}
      intro={[
        loc('晶圆制造把晶体管做在硅里（FEOL），再用多层金属连起来（BEOL）。先读每一层在做什么、每片能放多少颗、光刻能印多细，再动手调。', 'Wafer fab builds transistors in silicon (FEOL), then wires them with stacked metal (BEOL). Read what each layer does, how many dies fit, and how fine lithography can print, then adjust the controls.'),
        loc('VDUT-MFG1 用 300 mm 晶圆来举例。数字是教学示意。', 'VDUT-MFG1 uses a 300 mm wafer as the example. Numbers are teaching illustrations.'),
      ]}
      related={['pSilicon', 'mfgCp', 'mfgWat']}
      kicker={COMMON.kicker}
      asideTitle={layer.title}
      asideText={layer.text}
      tasks={[
        { id: 't1', text: taskDpw, done: bare.hit },
        { id: 't2', text: taskGood, done: yielded.hit },
        { id: 't3', text: taskScribe, done: scribed.hit },
        { id: 't4', text: taskOrder, done: ordered.hit },
        { id: 't5', text: taskCd, done: compared.hit },
      ]}
      onReset={() => {
        setLayerId(LAYERS[0].id)
        setPatternStep('dep')
        setOperation('implant')
        setWafer(300)
        setDieW(12)
        setDieH(12)
        setScribe(0.2)
        setEdge(0)
        setD0(0.15)
        selectTool(TOOLS[0].id)
        setOrder(START_ORDER)
        bare.reset()
        yielded.reset()
        scribed.reset()
        ordered.reset()
        compared.reset()
      }}
      learn={
        <div className="mfg-lab">
          <FabChoices label={loc('截面工艺段', 'Cross-section stages')} items={LAYERS} value={layerId} onChange={setLayerId} />
          <LayerCut layer={layerId} caption={layer.text} />
          <PatternCut step={patternStep} onStep={setPatternStep} />
          <OperationCut operation={operation} onOperation={setOperation} />
        </div>
      }
      practice={
        <div className="mfg-lab fab-practice">
          <Drill n={1} title={taskDpw}>
            <div className="knobs">
              <Knob label={loc('晶圆直径', 'Wafer diameter')} value={wafer} unit="mm" min={200} max={300} step={50} onChange={setWafer} />
              <Knob label={loc('die 宽', 'Die width')} value={dieW} unit="mm" min={6} max={16} step={1} onChange={setDieW} />
              <Knob label={loc('die 高', 'Die height')} value={dieH} unit="mm" min={6} max={16} step={1} onChange={setDieH} />
              <Knob label={loc('划片道', 'Scribe')} value={scribe} unit="mm" min={0} max={0.4} step={0.1} onChange={setScribe} />
              <Knob label={loc('边缘排除', 'Edge exclusion')} value={edge} unit="mm" min={0} max={5} step={1} onChange={setEdge} />
            </div>
            <WaferLayout wafer={wafer} dieW={dieW} dieH={dieH} scribe={scribe} edge={edge} dpw={dpw} />
            <After show={bare.hit} text={loc('300 mm、10×10 mm、划片道为 0 时，公式给出约 640 颗。减号那一项是因为圆边切不到完整的 die。', 'At 300 mm, 10×10 mm and no scribe, the formula gives about 640 dies. The subtracted term is the edge, where a full die does not fit.')} />
          </Drill>
          <Drill n={2} title={taskGood}>
            <Knob label={loc('D0', 'D0')} value={d0} unit="/cm²" min={0.05} max={0.3} step={0.05} onChange={setD0} />
            <YieldFigure d0={d0} area={dieW * dieH / 100} yieldRate={y} dpw={dpw} good={good} />
            <After show={yielded.hit} text={loc('D0=0.1 /cm²、面积 1 cm² 时，exp(−0.1)≈0.905，再乘约 640 颗，好 die 约 579。面积越大，这个指数掉得越快。', 'At D0=0.1 /cm² and 1 cm², exp(−0.1)≈0.905. Times about 640 dies, that is about 579 good dies. A larger area makes this exponential fall faster.')} />
          </Drill>
          <Drill n={3} title={taskScribe}>
            <Knob label={loc('划片道', 'Scribe')} value={scribe} unit="mm" min={0} max={0.4} step={0.1} onChange={setScribe} />
            <Readout items={[{ label: loc('你算出的每片颗数', 'Dies per wafer you got'), value: `${dpw}` }]} />
            <After show={scribed.hit} text={loc('0.1 mm 划片道让每颗占用变成 10.1×10.1 mm，每片约 627 颗。颗数变少，是因为同一片圆被切成更大的格子。', 'A 0.1 mm scribe makes each die occupy 10.1×10.1 mm, about 627 dies per wafer. The same circle is tiled with larger cells, so fewer dies fit.')} />
          </Drill>
          <Drill n={4} title={taskOrder}>
            <p>{t(loc('对照上面每个词的作用，用箭头排。排对之后，下面解释为什么是这个顺序。', 'Use what each word does above, and reorder with the arrows. When the order is right, the reason appears below.'))}</p>
            <ol className="mfg-sort">
              {order.map((id, index) => {
                const step = PATTERN_STEPS.find((p) => p.id === id) ?? PATTERN_STEPS[0]
                return (
                  <li key={id}>
                    <button type="button" aria-label={t(loc(`上移${step.title.zh}`, `Move ${step.title.en} up`))} onClick={() => move(index, -1)} disabled={index === 0}>↑</button>
                    <span>{t(step.title)}</span>
                    <button type="button" aria-label={t(loc(`下移${step.title.zh}`, `Move ${step.title.en} down`))} onClick={() => move(index, 1)} disabled={index === order.length - 1}>↓</button>
                  </li>
                )
              })}
            </ol>
            <After show={ordered.hit} text={loc('沉积提供连续薄膜，光刻用胶定义开口，刻蚀把开口转移到薄膜，最后去胶并清理残留。', 'Deposition provides a continuous film. Lithography defines openings in resist, etching transfers them to the film, and stripping and cleaning remove the residue.')} />
          </Drill>
          <Drill n={5} title={taskCd}>
            <FabChoices label={loc('光刻参数预设', 'Lithography presets')} items={TOOLS} value={toolId} onChange={selectTool} />
            <div className="knobs">
              <Knob label={loc('数值孔径 NA', 'Numerical aperture NA')} value={na} unit="" min={tool.minNa} max={tool.maxNa} step={0.01} onChange={setNa} />
              <Knob label={loc('工艺系数 k₁', 'Process factor k₁')} value={k1} unit="" min={0.25} max={0.45} step={0.01} onChange={setK1} />
            </div>
            <ResolutionFigure lambda={tool.lambda} na={na} k1={k1} cd={cd}
              reference={{ title: reference.title, cd: rayleighCdNm(reference.k1, reference.lambda, reference.na) }} />
            <After show={compared.hit} text={loc('两组预设给出约 42.9 nm 和 16.4 nm。比较时留意三项输入都变了；想单独看 NA 的影响，可在同一组预设内只拖动 NA。', 'The presets give about 42.9 nm and 16.4 nm. All three inputs change between presets. Adjust only NA within one preset to isolate its effect.')} />
          </Drill>
        </div>
      }
      misconceptions={[
        loc('die 越大成本只是线性增加。其实每片颗数更少，良率还随面积下降。', 'A larger die is not a linear cost. You get fewer dies per wafer and yield falls with area.'),
        loc('晶体管和多层互连由多次图形化逐步形成，整片晶圆会经历多次光刻。', 'Many patterning operations build transistors and interconnect, so each wafer goes through lithography repeatedly.'),
        loc('BEOL 只是连线，不影响速度。金属 RC 会吃掉延时。', 'BEOL is not “just wires”. Metal RC eats delay.'),
      ]}
      takeaway={[
        loc('FEOL 做晶体管，MEOL 把器件接到第一层金属，BEOL 用金属和过孔完成多层布线。', 'FEOL builds transistors, MEOL contacts link them to the first metal layer, and BEOL routes across layers using metal and vias.'),
        loc('DPW 用含划片道的占用面积估算每片颗数；Poisson 良率用裸 die 面积估算零缺陷概率。相乘得到预计好 die 数。', 'DPW uses area including the scribe lane to estimate the gross count. Poisson yield uses bare die area to estimate the zero-defect probability. Multiply to estimate good dies.'),
      ]}
      quiz={QUIZ}
    />
  )
}
