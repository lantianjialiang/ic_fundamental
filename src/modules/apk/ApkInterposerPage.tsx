import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { type ModuleId } from '../catalog'
import { Cards, Knob, Readout } from '../fund/parts'
import { floorplanArea, rcDelayPs, RETICLE_MM2 } from './core'
import { TEACH } from '../mfg/core'
import { After, COMMON, Drill, PackLesson, useSticky } from '../mfg/shell'
import { APK_META } from './meta'

const KINDS = [
  { id: 'si', title: loc('硅中介层', 'Silicon interposer'), text: loc('含 TSV 的硅片 + 细线 RDL。CoWoS-S 类是概念示例。', 'Silicon with TSVs plus fine RDL. CoWoS-S-class is a conceptual example.') },
  { id: 'rdl', title: loc('RDL 中介层', 'RDL interposer'), text: loc('有机/重布线中介层。CoWoS-R 类是概念示例。', 'Organic / RDL interposer. CoWoS-R-class is a conceptual example.') },
  { id: 'bridge', title: loc('局部硅桥', 'Local silicon bridge'), text: loc('只在 die 缝里嵌一小块硅。EMIB / CoWoS-L 类是概念示例。', 'A small silicon bridge in the die seam. EMIB / CoWoS-L-class are conceptual examples.') },
]

const FLOW = [
  { id: 'cow', title: loc('chip-on-wafer', 'chip-on-wafer') },
  { id: 'uf', title: loc('底部填充 / 减薄', 'Underfill / thin') },
  { id: 'os', title: loc('中介层上基板', 'Interposer on substrate') },
  { id: 'asm', title: loc('基板组装', 'Substrate assembly') },
  { id: 'ft', title: loc('封装级测试', 'Package test') },
  { id: 'slt', title: loc('SLT', 'SLT') },
]
const START = ['os', 'cow', 'slt', 'uf', 'ft', 'asm']
const RIGHT = FLOW.map((s) => s.id)

const QUIZ = [
  { id: 'q1', prompt: loc('中介层只是垫片吗？', 'Is an interposer just a spacer?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是：它承载高密度布线，连接 GPU 与 HBM', 'No: it carries dense wiring between GPU and HBM') },
    { id: 'c', text: loc('只散热', 'Only heat') },
  ], answer: 'b', explain: loc('没有这些细线，HBM 的宽接口走不出去。', 'Without those fine traces the wide HBM interface cannot escape.') },
  { id: 'q2', prompt: loc('所有 2.5D 都用硅中介层吗？', 'Do all 2.5D packages use silicon interposers?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是：还有 RDL 中介层和局部硅桥', 'No: RDL interposers and local silicon bridges also exist') },
    { id: 'c', text: loc('只用陶瓷', 'Only ceramic') },
  ], answer: 'b', explain: loc('厂商名只作概念分类。', 'Vendor names are only a conceptual classification.') },
  { id: 'q3', prompt: loc('5 mm、2 µm×1 µm 铜线的电阻？', 'R of a 5 mm, 2 µm × 1 µm copper trace?'), options: [
    { id: 'a', text: loc('42 Ω', '42 Ω') },
    { id: 'b', text: loc('0.42 Ω', '0.42 Ω') },
    { id: 'c', text: loc('420 Ω', '420 Ω') },
  ], answer: 'a', explain: loc('ρL/A=1.68e-8×5e-3/(2e-12)=42 Ω。', 'ρL/A=1.68e-8×5e-3/(2e-12)=42 Ω.') },
  { id: 'q4', prompt: loc('同一条线 C≈1 pF 时的 RC 延时？', 'RC delay of that trace at C≈1 pF?'), options: [
    { id: 'a', text: loc('约 16 ps', 'About 16 ps') },
    { id: 'b', text: loc('16 ns', '16 ns') },
    { id: 'c', text: loc('1 µs', '1 µs') },
  ], answer: 'a', explain: loc('0.38·R·C≈16 ps。短，但仍是分布式 RC。', '0.38·R·C≈16 ps. Short, but still distributed RC.') },
  { id: 'q5', prompt: loc('为什么 chip-on-wafer 在前？', 'Why chip-on-wafer first?'), options: [
    { id: 'a', text: loc('中介层还在晶圆形态时更好贴、更好测', 'The interposer is still a wafer, so attach and test are easier') },
    { id: 'b', text: loc('随便排', 'Order does not matter') },
    { id: 'c', text: loc('先上基板再贴 die 更便宜', 'Die-on-substrate first is cheaper') },
  ], answer: 'a', explain: loc('晶圆级平行处理，再切成单个 2.5D。', 'Wafer-level parallelism, then singulation into 2.5D parts.') },
  { id: 'q6', prompt: loc('中介层越大越好吗？', 'Is a larger interposer always better?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是：成本、翘曲，超过 858 mm² 还要拼接', 'No: cost, warpage, and stitching above 858 mm²') },
    { id: 'c', text: loc('只影响颜色', 'Only color') },
  ], answer: 'b', explain: loc('光罩极限是硬约束。', 'The reticle limit is a hard constraint.') },
  { id: 'q7', prompt: loc('光罩极限面积？', 'Reticle-limit area?'), options: [
    { id: 'a', text: loc('858 mm²', '858 mm²') },
    { id: 'b', text: loc('300 mm²', '300 mm²') },
    { id: 'c', text: loc('无限制', 'Unlimited') },
  ], answer: 'a', explain: loc('26×33=858。', '26×33=858.') },
  { id: 'q8', prompt: loc('基板和中介层是同一层吗？', 'Are substrate and interposer the same layer?'), options: [
    { id: 'a', text: loc('是', 'Yes') },
    { id: 'b', text: loc('不是：中介层在 die 下面，再通过 C4 上到基板', 'No: the interposer sits under the dies, then C4s down to the substrate') },
    { id: 'c', text: loc('基板更细', 'The substrate is finer') },
  ], answer: 'b', explain: loc('基板课见 {@mfgSubstrate}。', 'Substrate lesson: {@mfgSubstrate}.'),
  },
]

export function ApkInterposerPage({ moduleId, onModuleChange }: { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [kindId, setKindId] = useState(KINDS[0].id)
  const [gpuW, setGpuW] = useState(20)
  const [hbmN, setHbmN] = useState(2)
  const [space, setSpace] = useState(2)
  const [margin, setMargin] = useState(2)
  const [lenMm, setLenMm] = useState(3)
  const [order, setOrder] = useState(START)
  const kind = KINDS.find((item) => item.id === kindId) ?? KINDS[0]
  const dies = [{ w: gpuW, h: gpuW }, ...Array.from({ length: hbmN }, () => ({ w: 12, h: 8 }))]
  const plan = floorplanArea(dies, space, margin)
  const rOhm = (TEACH.rhoCu * (lenMm * 1e-3)) / (2e-6 * 1e-6)
  const cF = 0.2e-12 * lenMm
  const delay = rcDelayPs(rOhm, cF)
  const stitchHit = useSticky(plan.needsStitching)
  const fitHit = useSticky(!plan.needsStitching && hbmN >= 4)
  const rcHit = useSticky(lenMm === 5)
  const orderHit = useSticky(order.every((id, i) => id === RIGHT[i]))
  const taskStitch = loc('把版图放大，直到面积超过一次曝光，读出要不要拼接。', 'Grow the floorplan until the area passes one exposure, and read whether it must be stitched.')
  const taskFit = loc('在不拼接的前提下，尽量多放 HBM。', 'Fit as many HBM stacks as you can without stitching.')
  const taskRc = loc('把走线长度调到 5 mm，读电阻和延时。', 'Set the trace length to 5 mm and read resistance and delay.')
  const taskOrder = loc('把六步排成实际会做的顺序。', 'Put the six steps into the order they actually run.')
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
      meta={APK_META.apkInterposer}
      nextId="apkStack"
      nextLabel={loc('下一课：3D 堆叠良率', 'Next: 3D stack yield')}
      later={loc('基板本身见 {@mfgSubstrate}、{@mfgSubFab}。', 'The substrate itself: {@mfgSubstrate}, {@mfgSubFab}.')}
      intro={[
        loc('中介层让 GPU/ASIC 和 HBM 用细线短距离相连。先看它是一整片硅、一层重布线，还是只在缝里嵌一小块，再算面积和走线。', 'An interposer lets a GPU/ASIC and HBM talk over short fine traces. See whether it is a full silicon plate, a redistribution layer, or a small bridge in the seam, then work the area and the trace.'),
        loc('CoWoS、EMIB 等是厂商技术名，仅作概念示例。', 'CoWoS, EMIB and similar names are vendor technology names, conceptual examples only.'),
      ]}
      related={['mfgSubstrate', 'mfgSubFab', 'apkHbm']}
      kicker={COMMON.kicker}
      asideTitle={kind.title}
      asideText={kind.text}
      notice={COMMON.vendor}
      tasks={[
        { id: 't1', text: taskStitch, done: stitchHit.hit },
        { id: 't2', text: taskFit, done: fitHit.hit },
        { id: 't3', text: taskRc, done: rcHit.hit },
        { id: 't4', text: taskOrder, done: orderHit.hit },
      ]}
      onReset={() => {
        setKindId(KINDS[0].id)
        setGpuW(20)
        setHbmN(2)
        setSpace(2)
        setMargin(2)
        setLenMm(3)
        setOrder(START)
        stitchHit.reset()
        fitHit.reset()
        rcHit.reset()
        orderHit.reset()
      }}
      learn={
        <div className="mfg-lab">
          <p>{t(loc('三种中介层。点一种，读细线做在整片硅上，还是只做在一小块桥上。厂商名只是分类例子。', 'Three interposers. Click one and read whether the fine wires sit on a full silicon plate or only on a small bridge. Vendor names are only category examples.'))}</p>
          <Cards items={KINDS} activeId={kindId} cols={3} onPick={(item) => setKindId(item.id)} />
          <p>{t(kind.text)}</p>
          <p>{t(loc('一次曝光大约 858 mm²。版图比这大，就要把图形拼起来，成本和翘曲一起涨。HBM 每颗按 12×8 mm 计，还要加上间距和边缘。', 'One exposure is about 858 mm². A larger floorplan has to be stitched, and cost and warpage rise with it. Each HBM here is 12×8 mm, plus spacing and margin.'))}</p>
          <p>{t(loc('短铜线仍是电阻和电容。R = ρ × 长度 / 截面积，这一课截面积用 2 µm × 1 µm，ρ 用铜的 1.68×10⁻⁸ Ω·m。电容按每毫米 0.2 pF 示意。延时 ≈ 0.38 × R × C。', 'A short copper trace is still resistance and capacitance. R = ρ × length / cross-section. This lesson uses 2 µm × 1 µm and copper at 1.68×10⁻⁸ Ω·m. Capacitance is illustrated as 0.2 pF per millimetre. Delay ≈ 0.38 × R × C.'))}</p>
          <dl className="mfg-def">
            <div><dt>chip-on-wafer</dt><dd>{t(loc('die 贴到还没切开的中介层晶圆上，一次可以贴很多颗。', 'Dies land on the interposer while it is still a wafer, so many can be placed at once.'))}</dd></div>
            <div><dt>{t(loc('底部填充 / 减薄', 'Underfill / thin'))}</dt><dd>{t(loc('保护凸点，并把叠好的晶圆减薄。', 'Protect the bumps and thin the stacked wafer.'))}</dd></div>
            <div><dt>{t(loc('中介层上基板', 'Interposer on substrate'))}</dt><dd>{t(loc('切下来的中介层再贴到封装基板。', 'The singulated interposer then lands on the package substrate.'))}</dd></div>
            <div><dt>{t(loc('基板组装', 'Substrate assembly'))}</dt><dd>{t(loc('基板这边的植球、打标。', 'Ball attach and mark on the substrate side.'))}</dd></div>
            <div><dt>{t(loc('封装级测试', 'Package test'))}</dt><dd>{t(loc('封装完成后的功能测试。', 'Functional test after the package is closed.'))}</dd></div>
            <div><dt>SLT</dt><dd>{t(loc('放到接近系统的环境里再跑一遍。', 'Run it again in something close to the real system.'))}</dd></div>
          </dl>
        </div>
      }
      practice={
        <div className="mfg-lab">
          <Drill n={1} title={taskStitch}>
            <div className="knobs">
              <Knob label={loc('GPU 边长', 'GPU edge')} value={gpuW} unit="mm" min={15} max={30} step={5} onChange={setGpuW} />
              <Knob label={loc('HBM 个数', 'HBM count')} value={hbmN} unit="" min={1} max={6} step={1} onChange={setHbmN} />
              <Knob label={loc('间距', 'Spacing')} value={space} unit="mm" min={1} max={4} step={1} onChange={setSpace} />
              <Knob label={loc('边缘', 'Margin')} value={margin} unit="mm" min={1} max={4} step={1} onChange={setMargin} />
            </div>
            <Readout items={[
              { label: loc('你算出的面积', 'Area you got'), value: `${plan.area.toFixed(0)} mm²` },
              { label: loc('一次曝光', 'One exposure'), value: `${RETICLE_MM2} mm²` },
            ]} />
            <After show={stitchHit.hit} text={loc('面积超过 858 mm²，一次曝光盖不住，图形要拼接。拼接会带来套刻误差，成本和翘曲也更高。', 'Past 858 mm² one exposure cannot cover the drawing, so the pattern is stitched. Stitching adds overlay error, and cost and warpage are higher.')} />
          </Drill>
          <Drill n={2} title={taskFit}>
            <Knob label={loc('HBM 个数', 'HBM count')} value={hbmN} unit="" min={1} max={6} step={1} onChange={setHbmN} />
            <Readout items={[
              { label: loc('你算出的面积', 'Area you got'), value: `${plan.area.toFixed(0)} mm²` },
              { label: loc('是否超过一次曝光', 'Past one exposure'), value: t(plan.needsStitching ? loc('超过', 'yes') : loc('没有', 'no')) },
            ]} />
            <After show={fitHit.hit} text={loc('4 颗 HBM 还能留在 858 mm² 里面。再往上加，面积越过一次曝光，就要拼接。所以“尽量多”是刚好不拼接的那个数，不是旋钮的最大值。', 'Four HBM stacks still fit inside 858 mm². Add more and the area crosses one exposure, so it must be stitched. “As many as possible” is the largest count that still does not stitch, not the top of the knob.')} />
          </Drill>
          <Drill n={3} title={taskRc}>
            <Knob label={loc('走线长度', 'Trace length')} value={lenMm} unit="mm" min={2} max={8} step={1} onChange={setLenMm} />
            <Readout items={[
              { label: loc('你算出的电阻', 'Resistance you got'), value: `${rOhm.toFixed(1)} Ω` },
              { label: loc('你算出的延时', 'Delay you got'), value: `${delay.toFixed(1)} ps` },
            ]} />
            <After show={rcHit.hit} text={loc('5 mm、截面积 2 µm×1 µm 时，R = 1.68×10⁻⁸ × 0.005 / 2×10⁻¹² = 42 Ω。电容约 1 pF，0.38×42×1 pF ≈ 16 ps。线很短，但已经是分布式 RC，不是理想导线。', 'At 5 mm and 2 µm×1 µm, R = 1.68×10⁻⁸ × 0.005 / 2×10⁻¹² = 42 Ω. Capacitance is about 1 pF, and 0.38×42×1 pF ≈ 16 ps. The trace is short, and it is already a distributed RC, not an ideal wire.')} />
          </Drill>
          <Drill n={4} title={taskOrder}>
            <p>{t(loc('对照上面每一步在什么形态下做。排对之后这里解释为什么。', 'Use what each step does, and which form the interposer is in. The reason appears when the order is right.'))}</p>
            <ol className="mfg-sort">
              {order.map((id, index) => {
                const step = FLOW.find((s) => s.id === id) ?? FLOW[0]
                return (
                  <li key={id}>
                    <button type="button" onClick={() => move(index, -1)} disabled={index === 0}>↑</button>
                    <span>{t(step.title)}</span>
                    <button type="button" onClick={() => move(index, 1)} disabled={index === order.length - 1}>↓</button>
                  </li>
                )
              })}
            </ol>
            <After show={orderHit.hit} text={loc('顺序是 chip-on-wafer → 底部填充 / 减薄 → 中介层上基板 → 基板组装 → 封装级测试 → SLT。die 要在中介层还是整片晶圆时贴上去，切下来再上基板，测试在封装完成之后。', 'The order is chip-on-wafer → underfill / thin → interposer on substrate → substrate assembly → package test → SLT. Dies land while the interposer is still a wafer. It is singulated before it meets the substrate, and test comes after the package is closed.')} />
          </Drill>
        </div>
      }
      misconceptions={[
        loc('中介层只是垫片。它承载 GPU 与 HBM 之间的高密度布线。', 'An interposer is not a spacer. It carries the dense GPU–HBM wiring.'),
        loc('中介层越大越好。成本和翘曲会一起涨，超光罩还要拼接。', 'Bigger is not better. Cost and warpage rise; beyond the reticle you stitch.'),
        loc('所有 2.5D 都用硅中介层。还有 RDL 和局部硅桥。', 'Not every 2.5D uses silicon. RDL and local bridges exist too.'),
      ]}
      takeaway={[
        loc('先 chip-on-wafer，再中介层上基板。超过 858 mm² 要拼接。', 'Chip-on-wafer first, then interposer-on-substrate. Past 858 mm² you stitch.'),
        loc('短细线仍是分布式 RC：0.38·R·C。', 'Short fine traces are still distributed RC: 0.38·R·C.'),
      ]}
      quiz={QUIZ}
    />
  )
}
