import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Cards, Knob, Readout, Seg } from '../fund/parts'
import { diesPerWafer, poissonYield, rayleighCdNm } from './core'
import { WaferDisk } from './figs'
import { MFG_META } from './meta'
import { After, COMMON, Drill, PackLesson, useSticky } from './shell'

const LAYERS = [
  { id: 'feol', title: loc('FEOL', 'FEOL'), text: loc('在硅里做出晶体管：阱、栅、源漏、隔离。', 'Transistors in silicon: wells, gates, source/drain, isolation.') },
  { id: 'meol', title: loc('MEOL', 'MEOL'), text: loc('接触孔和局部互连，把晶体管接到金属。', 'Contacts and local interconnect that reach the first metal.') },
  { id: 'beol', title: loc('BEOL', 'BEOL'), text: loc('多层金属与介质。互连延时和可靠性主要在这里。', 'Stacked metal and dielectric. Interconnect delay and reliability live here.') },
]

const PROCESS = [
  { id: 'dep', title: loc('沉积', 'Deposition') },
  { id: 'litho', title: loc('光刻', 'Lithography') },
  { id: 'etch', title: loc('刻蚀', 'Etch') },
  { id: 'imp', title: loc('注入', 'Implant') },
  { id: 'cmp', title: loc('CMP', 'CMP') },
  { id: 'clean', title: loc('清洗', 'Clean') },
]

const START_ORDER = ['cmp', 'litho', 'etch', 'dep', 'imp', 'clean']
const RIGHT_ORDER = PROCESS.map((p) => p.id)

const TOOLS = [
  { id: 'duv', title: loc('DUV 193 nm', 'DUV 193 nm'), k1: 0.3, lambda: 193, na: 1.35, target: 42.9 },
  { id: 'euv', title: loc('EUV 13.5 nm', 'EUV 13.5 nm'), k1: 0.4, lambda: 13.5, na: 0.33, target: 16.4 },
]

const QUIZ = [
  { id: 'q1', prompt: loc('FEOL 主要做什么？', 'What does FEOL mainly build?'), options: [
    { id: 'a', text: loc('多层金属互连', 'Stacked metal interconnect') },
    { id: 'b', text: loc('晶体管本身', 'The transistors themselves') },
    { id: 'c', text: loc('封装基板', 'The package substrate') },
  ], answer: 'b', explain: loc('FEOL 在硅里做器件；BEOL 才是金属互连。', 'FEOL builds devices in silicon; BEOL is the metal stack.') },
  { id: 'q2', prompt: loc('光刻在一片晶圆上发生几次？', 'How often does lithography happen on one wafer?'), options: [
    { id: 'a', text: loc('只一次，做出全部图形', 'Once, for every pattern') },
    { id: 'b', text: loc('几乎每一层都要做一次', 'Almost once per layer') },
    { id: 'c', text: loc('只在 BEOL', 'Only in BEOL') },
  ], answer: 'b', explain: loc('每一层循环都有光刻，所以光罩层数很多。', 'Each layer loop has lithography, so the mask count is large.') },
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
  const [wafer, setWafer] = useState(300)
  const [dieW, setDieW] = useState(12)
  const [dieH, setDieH] = useState(12)
  const [scribe, setScribe] = useState(0.2)
  const [edge, setEdge] = useState(0)
  const [d0, setD0] = useState(0.15)
  const [toolId, setToolId] = useState(TOOLS[0].id)
  const [order, setOrder] = useState(START_ORDER)
  const layer = LAYERS.find((item) => item.id === layerId) ?? LAYERS[0]
  const tool = TOOLS.find((item) => item.id === toolId) ?? TOOLS[0]
  const dpw = diesPerWafer(wafer, dieW, dieH, scribe, edge)
  const y = poissonYield(d0, dieW * dieH)
  const good = Math.round(dpw * y)
  const cd = rayleighCdNm(tool.k1, tool.lambda, tool.na)
  const bare = useSticky(wafer === 300 && dieW === 10 && dieH === 10 && scribe === 0)
  const yielded = useSticky(d0 === 0.1 && dieW === 10 && dieH === 10 && scribe === 0)
  const scribed = useSticky(wafer === 300 && dieW === 10 && dieH === 10 && scribe === 0.1)
  const ordered = useSticky(order.every((id, i) => id === RIGHT_ORDER[i]))
  const compared = useSticky(toolId === 'euv')
  const taskDpw = loc('调到 300 mm、10×10 mm、划片道 0，读出每片颗数。', 'Set 300 mm, 10×10 mm and scribe 0, then read the dies per wafer.')
  const taskGood = loc('在同一颗尺寸上把 D0 调到 0.1 /cm²，读出好 die。', 'On that same die size, set D0 to 0.1 /cm² and read the good dies.')
  const taskScribe = loc('把划片道调到 0.1 mm，读每片颗数怎样变。', 'Set the scribe to 0.1 mm and read how dies per wafer change.')
  const taskOrder = loc('把一层里的步骤排成实际会做的顺序。', 'Put one layer’s steps into the order they actually run.')
  const taskCd = loc('读当前光刻机的线宽，再换到另一台，看波长怎样改线宽。', 'Read this tool’s line width, then switch tools and see how wavelength changes it.')
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
      later={loc('DPW 和排布决定 CP 的触点次数，见 {@mfgCp}。', 'DPW and the layout set CP touchdowns; see {@mfgCp}.')}
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
        setWafer(300)
        setDieW(12)
        setDieH(12)
        setScribe(0.2)
        setEdge(0)
        setD0(0.15)
        setToolId(TOOLS[0].id)
        setOrder(START_ORDER)
        bare.reset()
        yielded.reset()
        scribed.reset()
        ordered.reset()
        compared.reset()
      }}
      learn={
        <div className="mfg-lab">
          <p>{t(loc('晶圆从上到下分成三段。点一段，读它做的是器件还是连线。', 'A wafer splits into three blocks. Click one and read whether it builds devices or wires.'))}</p>
          <Cards items={LAYERS} activeId={layerId} cols={3} onPick={(item) => setLayerId(item.id)} />
          <p>{t(layer.text)}</p>
          <p>{t(loc('每一层都会用到下面这些动作。先记住每个词在干什么；顺序留到练习里排。', 'Every layer uses the actions below. Learn what each word does; the order is for the practice.'))}</p>
          <dl className="mfg-def">
            <div><dt>{t(loc('沉积', 'Deposition'))}</dt><dd>{t(loc('把一层材料铺到晶圆上。', 'Lay a film of material onto the wafer.'))}</dd></div>
            <div><dt>{t(loc('光刻', 'Lithography'))}</dt><dd>{t(loc('用光把图形转印到光刻胶上。几乎每一层都要做一次。', 'Print the pattern into photoresist with light. Almost every layer needs this once.'))}</dd></div>
            <div><dt>{t(loc('刻蚀', 'Etch'))}</dt><dd>{t(loc('按图形去掉不需要的材料。', 'Remove the material the pattern does not keep.'))}</dd></div>
            <div><dt>{t(loc('注入', 'Implant'))}</dt><dd>{t(loc('把杂质打进硅里，改变导电类型。不是每一层都有。', 'Drive dopants into the silicon to change how it conducts. Not every layer has this.'))}</dd></div>
            <div><dt>{t(loc('CMP', 'CMP'))}</dt><dd>{t(loc('把表面磨平。不平的话，下一层光刻对不上焦。', 'Polish the surface flat. Relief throws the next lithography layer out of focus.'))}</dd></div>
            <div><dt>{t(loc('清洗', 'Clean'))}</dt><dd>{t(loc('去掉颗粒和残留，避免它们变成缺陷。', 'Remove particles and residue so they do not become defects.'))}</dd></div>
          </dl>
          <p>{t(loc('每片晶圆能放的颗数 DPW ≈ π(d/2)²/A − πd/√(2A)。A 是一颗 die 占用的面积 (宽+划片道)×(高+划片道)，划片道越宽，A 越大，颗数越少。边缘排除是晶圆边上不能用的一圈。', 'Dies per wafer DPW ≈ π(d/2)²/A − πd/√(2A). A is the area one die occupies, (width+scribe)×(height+scribe). A wider scribe makes A larger and the count smaller. Edge exclusion is the unusable ring at the rim.'))}</p>
          <p>{t(loc('好 die ≈ DPW × exp(−D0×面积)。D0 是每平方厘米的缺陷个数。die 变大时，颗数变少，这个指数还再降一截，所以成本不是按面积线性涨。', 'Good dies ≈ DPW × exp(−D0×area). D0 is defects per square centimetre. A larger die means fewer dies, and the exponential falls too, so cost does not rise linearly with area.'))}</p>
          <p>{t(loc('能印多细用 CD = k1×λ/NA。λ 是光的波长，NA 是镜头的数值孔径。波长更短，或 NA 更大，CD 更小，线更细。', 'How fine you can print is CD = k1×λ/NA. λ is the wavelength and NA is the lens numerical aperture. A shorter wavelength or a larger NA makes CD smaller, so the line is finer.'))}</p>
        </div>
      }
      practice={
        <div className="mfg-lab">
          <Drill n={1} title={taskDpw}>
            <WaferDisk dies={dpw} good={good} label={loc(`当前每片 ${dpw} 颗`, `Currently ${dpw} dies per wafer`)} />
            <div className="knobs">
              <Knob label={loc('晶圆直径', 'Wafer diameter')} value={wafer} unit="mm" min={200} max={300} step={50} onChange={setWafer} />
              <Knob label={loc('die 宽', 'Die width')} value={dieW} unit="mm" min={6} max={16} step={1} onChange={setDieW} />
              <Knob label={loc('die 高', 'Die height')} value={dieH} unit="mm" min={6} max={16} step={1} onChange={setDieH} />
              <Knob label={loc('划片道', 'Scribe')} value={scribe} unit="mm" min={0} max={0.4} step={0.1} onChange={setScribe} />
              <Knob label={loc('边缘排除', 'Edge exclusion')} value={edge} unit="mm" min={0} max={5} step={1} onChange={setEdge} />
            </div>
            <Readout items={[{ label: loc('你算出的每片颗数', 'Dies per wafer you got'), value: `${dpw}` }]} />
            <After show={bare.hit} text={loc('300 mm、10×10 mm、划片道为 0 时，公式给出约 640 颗。减号那一项是因为圆边切不到完整的 die。', 'At 300 mm, 10×10 mm and no scribe, the formula gives about 640 dies. The subtracted term is the edge, where a full die does not fit.')} />
          </Drill>
          <Drill n={2} title={taskGood}>
            <Knob label={loc('D0', 'D0')} value={d0} unit="/cm²" min={0.05} max={0.3} step={0.05} onChange={setD0} />
            <Readout items={[{ label: loc('你算出的好 die', 'Good dies you got'), value: `${good}` }, { label: loc('Poisson 良率', 'Poisson yield'), value: y.toFixed(4) }]} />
            <After show={yielded.hit} text={loc('D0=0.1 /cm²、面积 1 cm² 时，exp(−0.1)≈0.905，再乘约 640 颗，好 die 约 579。面积越大，这个指数掉得越快。', 'At D0=0.1 /cm² and 1 cm², exp(−0.1)≈0.905. Times about 640 dies, that is about 579 good dies. A larger area makes this exponential fall faster.')} />
          </Drill>
          <Drill n={3} title={taskScribe}>
            <Knob label={loc('划片道', 'Scribe')} value={scribe} unit="mm" min={0} max={0.4} step={0.1} onChange={setScribe} />
            <Readout items={[{ label: loc('你算出的每片颗数', 'Dies per wafer you got'), value: `${dpw}` }]} />
            <After show={scribed.hit} text={loc('0.1 mm 划片道让每颗占用变成 10.1×10.1 mm，每片大约 626 颗。颗数变少，是因为同一片圆被切成更大的格子。', 'A 0.1 mm scribe makes each die occupy 10.1×10.1 mm, about 626 dies per wafer. The count falls because the same circle is tiled with larger cells.')} />
          </Drill>
          <Drill n={4} title={taskOrder}>
            <p>{t(loc('对照上面每个词的作用，用箭头排。排对之后，下面解释为什么是这个顺序。', 'Use what each word does above, and reorder with the arrows. When the order is right, the reason appears below.'))}</p>
            <ol className="mfg-sort">
              {order.map((id, index) => {
                const step = PROCESS.find((p) => p.id === id) ?? PROCESS[0]
                return (
                  <li key={id}>
                    <button type="button" onClick={() => move(index, -1)} disabled={index === 0}>↑</button>
                    <span>{t(step.title)}</span>
                    <button type="button" onClick={() => move(index, 1)} disabled={index === order.length - 1}>↓</button>
                  </li>
                )
              })}
            </ol>
            <After show={ordered.hit} text={loc('这一层的顺序是沉积 → 光刻 → 刻蚀 → 注入 → CMP → 清洗。光刻要在刻蚀之前，否则没有图形可跟；CMP 在后面，是为下一层准备焦点。', 'This layer runs deposition → lithography → etch → implant → CMP → clean. Lithography comes before etch, or there is no pattern to follow; CMP comes after, to focus the next layer.')} />
          </Drill>
          <Drill n={5} title={taskCd}>
            <Seg options={TOOLS.map((item) => ({ id: item.id, label: item.title }))} value={toolId} onChange={setToolId} />
            <Readout items={[{ label: loc('你算出的 CD', 'CD you got'), value: `${cd.toFixed(1)} nm` }]} />
            <After show={compared.hit} text={loc('DUV 193 nm、NA 1.35、k1=0.3 时 CD 约 42.9 nm。EUV 波长只有 13.5 nm，同一公式给出更小的 CD，所以能印更细的线。k1 和 NA 也会变，不是只看波长。', 'DUV at 193 nm, NA 1.35 and k1=0.3 gives a CD of about 42.9 nm. EUV’s wavelength is only 13.5 nm, so the same formula gives a smaller CD and a finer line. k1 and NA change too; wavelength is not the only term.')} />
          </Drill>
        </div>
      }
      misconceptions={[
        loc('die 越大成本只是线性增加。其实每片颗数更少，良率还随面积下降。', 'A larger die is not a linear cost. You get fewer dies per wafer and yield falls with area.'),
        loc('光刻只做一次。几乎每一层都要做。', 'Lithography is not once per wafer. It is almost once per layer.'),
        loc('BEOL 只是连线，不影响速度。金属 RC 会吃掉延时。', 'BEOL is not “just wires”. Metal RC eats delay.'),
      ]}
      takeaway={[
        loc('FEOL 做晶体管，BEOL 做互连；一层一层重复同一套循环。', 'FEOL builds transistors, BEOL builds interconnect; the same loop repeats layer by layer.'),
        loc('DPW≈π(d/2)²/A−πd/√(2A)，好 die = DPW·exp(−D0·A)。', 'DPW≈π(d/2)²/A−πd/√(2A); good dies = DPW·exp(−D0·A).'),
      ]}
      quiz={QUIZ}
    />
  )
}
