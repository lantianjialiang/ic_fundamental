import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Diagram, DiagramChoices, DiagramLegend, Formula, ScaleBars, StagePlayer } from './FlowVisuals'
import { layerYield, panelUnits } from './core'

const VIEWS = [
  { id: 'panel', title: loc('整张面板', 'Full panel') },
  { id: 'row', title: loc('一行单元', 'One row') },
  { id: 'unit', title: loc('单颗基板', 'One substrate') },
] as const
export type PanelView = (typeof VIEWS)[number]['id']

export function PanelLayout({ width, height, unit, gap, margin, view, onView }: {
  width: number; height: number; unit: number; gap: number; margin: number; view: PanelView; onView: (id: PanelView) => void
}) {
  const { t } = useLocale()
  const { nx, ny, n, utilization } = panelUnits(width, height, margin, unit, unit, gap)
  const usedX = nx * unit + (nx - 1) * gap
  const usedY = ny * unit + (ny - 1) * gap
  const title = loc('从生产面板到单颗封装基板', 'From the production panel to one substrate')
  const caption = {
    panel: loc('Panel 是基板厂成批加工的整张生产板。同一张板上的单元一起经历层压、图形、镀铜和检测；成品可按订单分割为单颗，或交付为更小的条带。', 'A panel is a production sheet. Its units share lamination, patterning, plating and inspection. The finished panel can be separated into individual substrates or delivered in smaller strips.'),
    row: loc('亮色标出一行。相邻单元之间有间距 g，一行 n 颗只需要 n−1 道间距。右侧空白是剩余可用区，再放一颗还要加上间距。', 'The highlighted row of n units uses n−1 gaps of width g. The right-hand remainder must fit another unit plus its preceding gap to add a column.'),
    unit: loc('亮色是一颗封装基板的占地。同一颗基板最终承载裸片，并把芯片侧的细间距连接扇出到板侧。整板利用率计算只计各单元的面积。', 'The highlighted footprint is one package substrate. It will support the die and fan out its fine-pitch connections to the board side. Gross panel utilization counts only the substrate footprints.'),
  }[view]
  return (
    <Diagram title={title} caption={caption}>
      <DiagramChoices label={title} items={VIEWS} value={view} onPick={onView} />
      <div className="subfab-panel-body">
        <div className="subfab-panel-map">
          <div className="subfab-panel" role="img" aria-label={t(loc(`${nx} 列 × ${ny} 行，${n} 颗基板`, `${nx} columns by ${ny} rows, ${n} substrates`))} style={{ aspectRatio: width / height }}>
            <div className="subfab-panel-field" style={{ inset: `${100 * margin / height}% ${100 * margin / width}%` }}>
              <div className="subfab-panel-grid" style={{
                width: `${100 * usedX / (width - 2 * margin)}%`, height: `${100 * usedY / (height - 2 * margin)}%`,
                gridTemplateColumns: `repeat(${nx}, 1fr)`, gridTemplateRows: `repeat(${ny}, 1fr)`,
                columnGap: `${100 * gap / usedX}%`, rowGap: `${100 * gap / usedY}%`,
              }}>
                {Array.from({ length: n }, (_, i) => <span key={i} data-highlight={view === 'panel' || (view === 'row' ? i < nx : i === 0)} />)}
              </div>
            </div>
          </div>
          <DiagramLegend items={[[ 'unit', loc('基板单元', 'Substrate unit') ], [ 'space', loc('间距与余量', 'Gaps and remainder') ], [ 'edge', loc('工艺边', 'Process border') ]]} />
        </div>
        <div className="subfab-panel-formulas">
          <Formula rule="Uₓ = W − 2m · Uᵧ = H − 2m" value={`${width - 2 * margin} × ${height - 2 * margin} mm`}
            note={loc('每个方向两边都要留出工艺边 m，例如设备夹持、定位和测试图形。实际工艺边和面板尺寸由工厂及设备决定。', 'Reserve a process border m on both sides of each axis for handling, alignment or test features. Actual borders and sheet dimensions depend on the shop and equipment.')} />
          <Formula rule="Nᵢ = ⌊(Uᵢ + g) / (s + g)⌋" value={`${nx} × ${ny} = ${n}`}
            note={loc(`s = ${unit} mm 是单元边长，g = ${gap} mm 是相邻单元间距。由 n·s + (n−1)·g ≤ U 得到公式，向下取整。X、Y 方向的剩余宽度分别是 ${width - 2 * margin - usedX} mm 和 ${height - 2 * margin - usedY} mm。`, `Unit size s = ${unit} mm and gap g = ${gap} mm. Apply n·s + (n−1)·g ≤ U and round down. Leftover width and height are ${width - 2 * margin - usedX} mm and ${height - 2 * margin - usedY} mm.`)} />
          <Formula rule="η = NₓNᵧ × s² / (W × H)" value={`${n} × ${unit}² / (${width} × ${height}) = ${(100 * utilization).toFixed(1)}%`}
            note={loc('利用率描述几何占板，分母是整张面板，分子只加基板单元。边缘、间距、余量都占板；调整宽高时，颗数和利用率可能朝不同方向变化。合格率还需另算。', 'Utilization is geometric. Divide total substrate footprint by gross sheet area. Borders, gaps and remainders still occupy sheet area. Changing the sheet size can move count and utilization in different directions. Yield is calculated separately.')} />
        </div>
      </div>
    </Diagram>
  )
}

export const COPPER_PROCESSES = [
  { id: 'sub', title: loc('减成法', 'Subtractive'), start: loc('整面铜箔', 'Blanket copper foil') },
  { id: 'sap', title: loc('SAP · 半加成', 'SAP · semi-additive'), start: loc('介质上的薄种子铜', 'Thin seed copper on dielectric') },
  { id: 'msap', title: loc('mSAP · 改良半加成', 'mSAP · modified semi-additive'), start: loc('薄铜箔及导电底层', 'Thin foil and conductive base') },
] as const
export type CopperProcess = (typeof COPPER_PROCESSES)[number]['id']

const COPPER_STEPS = [
  { id: '0', title: loc('起始材料', 'Starting material') },
  { id: '1', title: loc('显影图形', 'Develop pattern') },
  { id: '2', title: loc('蚀刻或电镀', 'Etch or plate') },
  { id: '3', title: loc('去胶', 'Strip resist') },
  { id: '4', title: loc('成品截面', 'Finished section') },
] as const

const EXPLAIN = {
  sub: [
    loc('起点是一整层达到布线厚度的铜箔，压在介质上。要留下的线已包含在这层铜里。', 'The dielectric is clad in a blanket copper foil at wiring thickness. The eventual lines already exist within that foil.'),
    loc('紫色干膜覆盖要保留的导线，未来的线间空白露出铜。', 'Purple resist covers the future traces and exposes the copper in the future spaces.'),
    loc('蚀液从开口向下清掉大面积铜，也会从侧面侵到胶下。剖面上的梯形和悬出的光刻胶表示侧蚀。', 'Etchant clears exposed copper down to the dielectric and also attacks sideways under the mask. The tapered lines and overhanging resist illustrate undercut.'),
    loc('剥掉保护干膜，留下铜线。截面上部比掩膜定义的宽度更窄。', 'Strip the protective resist. The upper trace is narrower than the resist image.'),
    loc('最终线宽和间距受初始铜厚、侧蚀、设备与补偿共同影响。细线对相同侧蚀量更敏感。', 'Final line and space depend on starting copper thickness, undercut, equipment and compensation. A fixed amount of undercut has a larger effect on finer traces.'),
  ],
  sap: [
    loc('从绝缘介质起步，在其表面沉积连续薄铜种子层，给后续电镀提供导电路径。', 'Start with an insulating dielectric and deposit a continuous thin copper seed so that subsequent electroplating can carry current.'),
    loc('干膜盖住未来的间距，导线位置开窗。留线处的胶极性和减成法示例相反。', 'Resist covers the future spaces and opens windows at the future traces. This reverses the keep-or-remove geometry shown for the subtractive route.'),
    loc('铜在开窗内电镀长厚。种子层贯通开窗，干膜限定横向形状。', 'Copper grows by electroplating inside the openings. The seed layer connects the openings electrically while the resist defines the sides.'),
    loc('去胶后，厚铜线已经成形，但底部连续种子铜仍把两根线连在一起。', 'The plated traces remain after stripping, but the continuous seed layer still connects them.'),
    loc('闪蚀清掉裸露的薄种子铜，使两线绝缘。仍可能轻微侵蚀线侧，去铜量通常小于厚铜减成工艺。', 'Flash etching clears the thin exposed seed copper and isolates the traces. It can still attack the sidewalls, but usually removes less copper than thick-foil subtractive etching.'),
  ],
  msap: [
    loc('典型 mSAP 从薄铜箔覆铜材料出发，可结合减薄与孔金属化形成可镀的薄导电底层。图中把这层底铜合画。', 'A typical mSAP route starts from thin copper-clad material. Thinning and via metallization can prepare the thin conductive base, drawn here as one layer.'),
    loc('和 SAP 一样，未来导线在干膜开窗内，线间区域由干膜覆盖。', 'As in SAP, future traces are open in the resist, and spaces are covered.'),
    loc('在薄底铜上图形电镀。厚线长在开窗区，线间底铜仍连成一片。', 'Pattern-plate on the thin copper base. The lines grow in the openings while the base copper still spans the spaces.'),
    loc('去除干膜，露出走线之间仍然连续的底铜。', 'Strip the resist to expose the remaining continuous base copper between traces.'),
    loc('差分蚀刻清掉线间底铜，保留较厚的电镀线。实际底铜厚度和侧蚀取决于材料、前处理与工艺。', 'Differential etching clears the base copper between traces while the thicker plated copper remains. Base thickness and undercut depend on materials, pretreatment and process.'),
  ],
}

function CopperCut({ method, step, line, space }: { method: CopperProcess; step: number; line: number; space: number }) {
  const sub = method === 'sub'
  const base = sub ? 22 : method === 'msap' ? 7 : 3.5
  const lineW = line * 0.8
  const pitch = (line + space) * 0.8
  const traces = [50 - pitch / 2 - lineW / 2, 50 + pitch / 2 - lineW / 2]
  const masks = sub ? traces.map((x) => [x, lineW]) : [[8, traces[0] - 8], [traces[0] + lineW, pitch - lineW], [traces[1] + lineW, 92 - traces[1] - lineW]]
  const shape = (x: number, width: number, bottom: number, height: number, tone: string, taper = false) =>
    <span key={`${tone}-${x}`} className={`subfab-block flow-tone-${tone}${taper ? ' subfab-taper' : ''}`}
      style={{ left: `${x}%`, width: `${width}%`, bottom: `${bottom}%`, height: `${height}%` }} />
  return (
    <div className="flow-canvas subfab-cut" aria-hidden="true">
      {shape(8, 84, 12, 24, 'dielectric')}
      {(sub ? step < 2 : step < 4) && shape(8, 84, 36, base, sub ? 'copper' : 'seed')}
      {step >= 2 && traces.map((x) => shape(x, lineW, sub || step === 4 ? 36 : 36 + base, sub ? base : 24 + (step === 4 ? base : 0), 'copper', sub))}
      {(step === 1 || step === 2) && masks.map(([x, width]) => shape(x, width, 36 + base, sub ? 12 : 29, 'resist'))}
    </div>
  )
}

export function CopperWalkthrough({ method, step, compare, line, space, onMethod, onStep, onCompare }: {
  method: CopperProcess; step: number; compare: boolean; line: number; space: number
  onMethod: (id: CopperProcess) => void; onStep: (i: number) => void; onCompare: (value: boolean) => void
}) {
  const { t } = useLocale()
  const title = loc('同一层布线，三种做法', 'Three ways to form one wiring layer')
  const shown = compare ? COPPER_PROCESSES : COPPER_PROCESSES.filter((process) => process.id === method)
  return (
    <Diagram title={title} caption={loc('L/S 是标称线宽与线距。截面放大了厚度和侧蚀以便对照，图中的倾斜量没有标定。实际可量产的 L/S 需核对工厂规则、铜厚以及对准和良率数据。', 'L/S is nominal line width and spacing. Thickness and taper are exaggerated and uncalibrated. Check the supplier design rules, copper thickness, alignment and production yield for manufacturable L/S.')}>
      <DiagramChoices label={title} items={COPPER_PROCESSES} value={method} onPick={onMethod} />
      <label><input type="checkbox" checked={compare} onChange={(event) => onCompare(event.target.checked)} /> {t(loc('三种工艺并排对照', 'Compare all three processes'))}</label>
      <DiagramChoices label={loc('布线步骤', 'Patterning steps')} items={COPPER_STEPS} value={String(step)} onPick={(id) => onStep(Number(id))} />
      <StagePlayer count={COPPER_STEPS.length} step={step} onStep={onStep} />
      <div className="flow-axis"><span>L / S</span><strong>{line} / {space} µm</strong></div>
      <div className="subfab-comparison">
        {shown.map(({ id, title: name, start }) => (
          <div key={id}>
            <div className="subfab-method-title"><b>{t(name)}</b><small>{t(start)}</small></div>
            <CopperCut method={id} step={step} line={line} space={space} />
            <p>{t(EXPLAIN[id][step])}</p>
          </div>
        ))}
      </div>
      <DiagramLegend items={[[ 'dielectric', loc('介质', 'Dielectric') ], [ 'seed', loc('种子层或薄底铜', 'Seed or thin base copper') ], [ 'copper', loc('布线铜', 'Trace copper') ], [ 'resist', loc('干膜', 'Resist') ]]} />
    </Diagram>
  )
}

export function LayerSurvival({ layers, yieldRate }: { layers: number; yieldRate: number }) {
  const result = layerYield(yieldRate, layers)
  const stages = [...new Set([0, 1, Math.floor(layers / 2), layers])]
  return (
    <Formula rule="Y = (y_layer)ⁿ" value={`${yieldRate.toFixed(2)} ^ ${layers} = ${(100 * result).toFixed(2)}%`}
      note={loc('每层对上一层留下的合格品再乘一次单层通过率。示例假定每步条件通过率相同。这里的层数作为良率阶段数，量产需按各层、各工序的实测损失建模。', 'Each layer multiplies the previous layer’s survivors by its pass rate. The example assumes the same conditional pass rate at every stage. Production models use measured losses by layer or operation.')}>
      <ScaleBars max={1} items={stages.map((n) => {
        const value = layerYield(yieldRate, n)
        return { title: loc(`通过 ${n} 层`, `After ${n} layers`), value, display: `${(100 * value).toFixed(1)}%` }
      })} />
    </Formula>
  )
}

const STACK = [
  { id: 'core', title: loc('覆铜芯板', 'Copper-clad core'), text: loc('先用芯板提供机械支撑和初始铜面。', 'The core provides mechanical support and the initial copper surfaces.') },
  { id: 'pth', title: loc('芯板通孔', 'Core PTH'), text: loc('钻穿芯板并镀孔壁，连接芯板两侧的铜。', 'Drill through the core and plate the wall to join the two faces.') },
  { id: 'buildup', title: loc('积层与微孔', 'Build-up and microvia'), text: loc('层压积层介质，激光开微孔露出下层焊盘，去钻污后再金属化。', 'Laminate build-up dielectric, laser-drill to a lower pad, then desmear and metallize.') },
  { id: 'pattern', title: loc('图形布线', 'Copper pattern'), text: loc('形成外层走线和镀铜微孔。有更多积层时重复积层、钻孔和布线。', 'Form outer traces and the plated microvia. Repeat build-up, drilling and patterning for additional layers.') },
  { id: 'finish', title: loc('阻焊与表面处理', 'Mask and finish'), text: loc('覆盖阻焊并留出焊盘窗口，对露出的焊盘做适当的表面处理，再检测和分割。', 'Apply solder mask with pad openings and finish the exposed pads before inspection and separation.') },
] as const
export type StackStage = (typeof STACK)[number]['id']
export { STACK as SUBSTRATE_STAGES }

export function BuildUpCut({ value, onPick }: { value: StackStage; onPick: (id: StackStage) => void }) {
  const stage = STACK.findIndex((item) => item.id === value)
  const title = loc('同一块基板如何从芯板长出积层', 'How build-up layers grow from the core')
  const block = (x: number, y: number, w: number, h: number, tone: string) =>
    <span className={`subfab-block flow-tone-${tone}`} style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }} />
  return (
    <Diagram title={title} caption={STACK[stage].text}>
      <DiagramChoices label={title} items={STACK} value={value} onPick={onPick} />
      <div className="flow-canvas subfab-cut" aria-hidden="true">
        {block(8, 44, 84, 32, 'dielectric')}
        {block(8, 39, 84, 5, 'copper')}{block(8, 76, 84, 5, 'copper')}
        {stage >= 1 && <>{block(28, 39, 9, 42, 'copper')}{block(30, 39, 5, 42, 'space')}</>}
        {stage >= 2 && <>{block(8, 24, 84, 15, 'dielectric')}{block(61, 24, 8, 15, stage === 2 ? 'space' : 'copper')}</>}
        {stage >= 3 && <>{block(53, 19, 24, 5, 'copper')}{block(17, 19, 20, 5, 'copper')}</>}
        {stage >= 4 && <>{block(8, 14, 49, 5, 'unit')}{block(73, 14, 19, 5, 'unit')}{block(57, 16, 16, 3, 'seed')}</>}
      </div>
      <DiagramLegend items={[[ 'dielectric', loc('介质 / 芯板', 'Dielectric / core') ], [ 'copper', loc('铜面 / 镀孔', 'Copper / plated vias') ], [ 'space', loc('孔腔', 'Open hole') ], [ 'unit', loc('阻焊', 'Solder mask') ]]} />
    </Diagram>
  )
}
