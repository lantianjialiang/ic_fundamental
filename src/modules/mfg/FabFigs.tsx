import { useEffect, useRef, type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import './fab.css'

const SILICON = loc('硅衬底', 'Silicon substrate')
const DEVICE = loc('源漏与栅极', 'Source, drain and gate')
const CONTACT = loc('接触孔', 'Contacts')
const METAL = loc('金属层与过孔', 'Metal layers and vias')
const FILM = loc('待刻蚀薄膜', 'Film to etch')
const RESIST = loc('光刻胶', 'Photoresist')

export function FabFigure({ title, caption, children }: { title: LText; caption: LText; children: ReactNode }) {
  const { t } = useLocale()
  return (
    <figure className="fab-figure">
      <h4>{t(title)}</h4>
      {children}
      <figcaption>{t(caption)}</figcaption>
    </figure>
  )
}

export function FabChoices<T extends string>({ label, items, value, onChange }: {
  label: LText
  items: readonly { id: T; title: LText }[]
  value: T
  onChange: (id: T) => void
}) {
  const { t } = useLocale()
  return (
    <div className="fab-choices" role="group" aria-label={t(label)}>
      {items.map(({ id, title }) => (
        <button key={id} type="button" aria-pressed={id === value} onClick={() => onChange(id)}>{t(title)}</button>
      ))}
    </div>
  )
}

function Block({ x, y, w, h, tone }: { x: number; y: number; w: number; h: number; tone: string }) {
  return <span className={`fab-block fab-${tone}`} style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }} />
}

function Legend({ items }: { items: readonly (readonly [string, LText])[] }) {
  const { t } = useLocale()
  return <ul className="fab-legend">{items.map(([tone, label]) => <li key={tone}><i className={`fab-${tone}`} />{t(label)}</li>)}</ul>
}

export function LayerCut({ layer, caption }: { layer: string; caption: LText }) {
  return (
    <FabFigure title={loc('从硅衬底到多层金属', 'From silicon to stacked metal')} caption={caption}>
      <div className="fab-cut" aria-hidden="true">
        <Block x={8} y={14} w={84} h={58} tone="oxide" />
        <Block x={8} y={72} w={84} h={19} tone="silicon" />
        <div className={layer === 'feol' ? '' : 'fab-muted'}>
          <Block x={27} y={72} w={14} h={8} tone="device" />
          <Block x={59} y={72} w={14} h={8} tone="device" />
          <Block x={42} y={69} w={16} h={3} tone="oxide" />
          <Block x={43} y={59} w={14} h={10} tone="device" />
        </div>
        <div className={layer === 'meol' ? '' : 'fab-muted'}>
          <Block x={31} y={49} w={5} h={23} tone="contact" />
          <Block x={64} y={49} w={5} h={23} tone="contact" />
        </div>
        <div className={layer === 'beol' ? '' : 'fab-muted'}>
          <Block x={16} y={42} w={25} h={7} tone="metal" />
          <Block x={59} y={42} w={25} h={7} tone="metal" />
          <Block x={23} y={24} w={36} h={7} tone="metal" />
          <Block x={64} y={24} w={18} h={7} tone="metal" />
          <Block x={27} y={31} w={5} h={11} tone="metal" />
          <Block x={73} y={31} w={5} h={11} tone="metal" />
        </div>
      </div>
      <Legend items={[[ 'silicon', SILICON ], [ 'device', DEVICE ], [ 'contact', CONTACT ], [ 'metal', METAL ]]} />
    </FabFigure>
  )
}

export const PATTERN_STEPS = [
  { id: 'dep', title: loc('沉积', 'Deposit'), text: loc('先在硅片表面沉积连续薄膜。下一步会在薄膜上涂胶，用光刻定义哪些区域要保留。', 'Deposit a continuous film on the silicon. The next step coats it with resist and defines which regions to keep.') },
  { id: 'litho', title: loc('光刻', 'Pattern'), text: loc('涂胶、曝光和显影后，紫色光刻胶只留在需要保护的区域。胶层有了图形，下方薄膜仍然连续。', 'Coating, exposure and development leave purple resist over the regions to protect. The film beneath is still continuous.') },
  { id: 'etch', title: loc('刻蚀', 'Etch'), text: loc('刻蚀去掉开口处的薄膜，胶下的薄膜保留下来。此时图形已从光刻胶转移到薄膜。', 'Etching clears the exposed film. The film beneath the resist survives, transferring the pattern into the film.') },
  { id: 'clean', title: loc('去胶与清洗', 'Strip and clean'), text: loc('去除剩余胶和残留物，留下已成形的薄膜。这是一个图形转移实例，其他结构会用不同的工艺组合。', 'Remove the remaining resist and residue to expose the patterned film. Other structures use different combinations of operations.') },
] as const

type PatternStep = (typeof PATTERN_STEPS)[number]['id']

export function PatternCut({ step, onStep }: { step: PatternStep; onStep: (step: PatternStep) => void }) {
  const active = PATTERN_STEPS.find((item) => item.id === step) ?? PATTERN_STEPS[0]
  const title = loc('把图形从光刻胶转移到薄膜', 'Transfer the resist pattern into the film')
  return (
    <FabFigure title={title} caption={active.text}>
      <FabChoices label={title} items={PATTERN_STEPS} value={step} onChange={onStep} />
      <div className="fab-cut fab-cut--short" aria-hidden="true">
        <Block x={8} y={66} w={84} h={25} tone="silicon" />
        {step === 'dep' || step === 'litho'
          ? <Block x={8} y={52} w={84} h={14} tone="film" />
          : [21, 59].map((x) => <Block key={x} x={x} y={52} w={20} h={14} tone="film" />)}
        {(step === 'litho' || step === 'etch') &&
          [21, 59].map((x) => <Block key={x} x={x} y={38} w={20} h={14} tone="resist" />)}
      </div>
      <Legend items={[[ 'silicon', SILICON ], [ 'film', FILM ], [ 'resist', RESIST ]]} />
    </FabFigure>
  )
}

const FINISH_STEPS = [
  { id: 'implant', title: loc('离子注入', 'Ion implantation'), text: loc('紫色掩膜提供选择性遮挡，开口内的离子进入硅。图中青色区域表示掺杂，源漏可由这类步骤形成。', 'A purple mask blocks the ions selectively. Ions enter the silicon through the opening. The turquoise region represents doping, which can be used to form source and drain.') },
  { id: 'cmp', title: loc('CMP 整平', 'CMP planarization'), text: loc('虚线是抛光前的起伏轮廓。CMP 去掉高出的材料，让下一次曝光面对更平坦的表面，便于保持焦点。', 'The dashed outline is the uneven surface before polishing. CMP removes the excess material to leave a flatter surface for the next exposure to stay in focus.') },
] as const

export type FabOperation = (typeof FINISH_STEPS)[number]['id']

export function OperationCut({ operation, onOperation }: { operation: FabOperation; onOperation: (id: FabOperation) => void }) {
  const active = FINISH_STEPS.find((item) => item.id === operation) ?? FINISH_STEPS[0]
  const title = loc('局部掺杂与表面整平', 'Local doping and surface planarization')
  return (
    <FabFigure title={title} caption={active.text}>
      <FabChoices label={title} items={FINISH_STEPS} value={operation} onChange={onOperation} />
      <div className="fab-cut fab-cut--short" aria-hidden="true">
        <Block x={8} y={63} w={84} h={28} tone="silicon" />
        {operation === 'implant' ? (
          <>
            <Block x={8} y={50} w={28} h={13} tone="resist" />
            <Block x={64} y={50} w={28} h={13} tone="resist" />
            <Block x={36} y={63} w={28} h={12} tone="device" />
            <span className="fab-ions">↓ ↓ ↓</span>
          </>
        ) : (
          <>
            <Block x={8} y={50} w={84} h={13} tone="film" />
            <span className="fab-relief" />
          </>
        )}
      </div>
      <Legend items={operation === 'implant'
        ? [['silicon', SILICON], ['resist', loc('掩膜', 'Mask')], ['device', loc('掺杂区', 'Doped region')]]
        : [['silicon', SILICON], ['film', loc('整平后的薄膜', 'Planarized film')]]} />
    </FabFigure>
  )
}

type WaferGeometry = { wafer: number; dieW: number; dieH: number; scribe: number; edge: number }
const WAFER_SIZE = 420
const WAFER_DIAMETER = 382

function drawWafer(canvas: HTMLCanvasElement, { wafer, dieW, dieH, scribe, edge }: WaferGeometry) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const center = WAFER_SIZE / 2
  const scale = WAFER_DIAMETER / wafer
  const radius = WAFER_DIAMETER / 2
  const usable = radius - edge * scale
  const pitchX = (dieW + scribe) * scale
  const pitchY = (dieH + scribe) * scale
  const cols = Math.ceil(radius / pitchX + 0.5)
  const rows = Math.ceil(radius / pitchY + 0.5)
  ctx.clearRect(0, 0, WAFER_SIZE, WAFER_SIZE)
  ctx.save()
  ctx.translate(center, center)
  ctx.beginPath()
  ctx.arc(0, 0, radius, 0, 2 * Math.PI)
  ctx.fillStyle = '#52382f'
  ctx.fill()
  ctx.clip()
  ctx.beginPath()
  ctx.arc(0, 0, usable, 0, 2 * Math.PI)
  ctx.fillStyle = '#152539'
  ctx.fill()
  ctx.clip()
  for (let row = -rows; row <= rows; row++) {
    for (let col = -cols; col <= cols; col++) {
      const full = Math.hypot((Math.abs(col) + 0.5) * pitchX, (Math.abs(row) + 0.5) * pitchY) <= usable
      ctx.fillStyle = full ? '#54cbbb' : '#d99753'
      ctx.fillRect((col - 0.5) * pitchX + 0.5, (row - 0.5) * pitchY + 0.5, Math.max(1, dieW * scale - 1), Math.max(1, dieH * scale - 1))
    }
  }
  ctx.restore()
  ctx.beginPath()
  ctx.arc(center, center, radius, 0, 2 * Math.PI)
  ctx.strokeStyle = '#a9c5da'
  ctx.lineWidth = 1.5
  ctx.stroke()
}

export function WaferLayout({ wafer, dieW, dieH, scribe, edge, dpw }: WaferGeometry & { dpw: number }) {
  const { t } = useLocale()
  const canvas = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (canvas.current) drawWafer(canvas.current, { wafer, dieW, dieH, scribe, edge })
  }, [wafer, dieW, dieH, scribe, edge])
  const x = dieW + scribe
  const y = dieH + scribe
  const area = x * y
  const d = wafer - 2 * edge
  const gross = Math.PI * (d / 2) ** 2 / area
  const loss = Math.PI * d / Math.sqrt(2 * area)
  return (
    <FabFigure title={loc('圆形晶圆如何排入矩形 die', 'How rectangular dies fit on a wafer')}
      caption={loc('图中网格为居中排布示意。DPW 用面积与圆边损失近似估算，实际颗数取决于排版与对准位置。', 'The drawing shows a centered grid. DPW estimates the count from area and edge loss. The actual count depends on layout and alignment.')}>
      <div className="fab-split">
        <div>
          <canvas ref={canvas} className="fab-wafer" width={WAFER_SIZE} height={WAFER_SIZE} role="img"
            aria-label={t(loc(`直径 ${wafer} mm、单侧边缘排除 ${edge} mm 的晶圆排布`, `Layout for a ${wafer} mm wafer with ${edge} mm radial edge exclusion`))} />
          <Legend items={[
            ['full', loc('完整 die', 'Full dies')],
            ['partial', loc('圆边截断', 'Clipped at rim')],
            ['rim', loc('边缘排除', 'Edge exclusion')],
          ]} />
        </div>
        <div className="fab-math">
          <div className="fab-pitch" aria-hidden="true" style={{ aspectRatio: x / y }}>
            <span className={scribe > 0 ? 'fab-pitch-gap' : undefined}>{dieW} × {dieH}</span>
          </div>
          <div className="fab-line"><b>Aₚ = (w + s)(h + s)</b><span>{x.toFixed(1)} × {y.toFixed(1)} = {area.toFixed(2)} mm²</span></div>
          <p>{t(loc('w、h 是裸 die 的宽和高，s 是相邻 die 共用的划片道宽。放大图用虚线标出划片道位置，间距有所夸张。', 'w and h are the bare die width and height. Adjacent dies share a lane of width s. The enlarged diagram marks the lane with exaggerated dashed lines.'))}</p>
          <div className="fab-line"><b>d = D − 2e</b><span>{wafer} − 2 × {edge} = {d} mm</span></div>
          <p>{t(loc('D 是标称直径，e 是单侧边缘排除宽度，直径两端各减一次。', 'D is the nominal diameter. Subtract the exclusion width e from both ends.'))}</p>
        </div>
      </div>
      <div className="fab-equation">
        <div className="fab-line"><b>DPW ≈ π(d/2)²/Aₚ − πd/√(2Aₚ)</b><span>{gross.toFixed(1)} − {loss.toFixed(1)} ≈ {dpw}</span></div>
        <p>{t(loc('第一项用可用圆面积除以单颗占用面积。第二项用圆周长 πd 除以等面积正方形格的对角线 √(2Aₚ)，估算橙色区域损失的颗数。结果用未四舍五入的中间值计算。', 'The first term divides usable disk area by the area occupied per die. The second divides the circumference πd by the diagonal √(2Aₚ) of an equivalent square site to estimate the rim loss shown in amber. The result uses unrounded terms.'))}</p>
      </div>
    </FabFigure>
  )
}

export function YieldFigure({ d0, area, yieldRate, dpw, good }: { d0: number; area: number; yieldRate: number; dpw: number; good: number }) {
  const { t } = useLocale()
  const pct = (yieldRate * 100).toFixed(1)
  return (
    <FabFigure title={loc('从几何可排颗数到预计好 die', 'From gross sites to expected good dies')}
      caption={loc('模型假设缺陷均匀、独立出现，并且 die 内有致命缺陷就判为失效。图上是预计比例，量产良率取自实测。', 'The model assumes uniform, independent killer defects. A die fails if it contains at least one. The bar shows an expected fraction. Production yield comes from measurements.')}>
      <div className="fab-equation">
        <div className="fab-line"><b>μ = D₀ × A<sub>die</sub></b><span>{d0.toFixed(2)} /cm² × {area.toFixed(2)} cm² = {(d0 * area).toFixed(4)}</span></div>
        <p>{t(loc('D₀ 是每 cm² 的致命缺陷密度。A_die 只取裸 die 面积：宽×高（mm²）÷ 100，换算成 cm²。乘积 μ 是单颗的平均缺陷数。', 'D₀ counts killer defects per cm². A_die is bare die width × height, divided by 100 to convert mm² to cm². Their product μ is the mean defect count per die.'))}</p>
        <div className="fab-line"><b>Y = P(0) = exp(−μ)</b><span>{pct}%</span></div>
        <div className="fab-yield-track" aria-hidden="true"><span style={{ width: `${yieldRate * 100}%` }} /></div>
        <Legend items={[[ 'full', loc('零缺陷，预计好 die', 'Zero defects, expected good dies') ], [ 'partial', loc('至少一个缺陷', 'At least one defect') ]]} />
        <div className="fab-line"><b>{t(loc('预计好 die ≈ DPW × Y', 'Expected good dies ≈ DPW × Y'))}</b><span>{dpw} × {yieldRate.toFixed(4)} ≈ {good}</span></div>
      </div>
    </FabFigure>
  )
}

export function ResolutionFigure({ lambda, na, k1, cd, reference }: {
  lambda: number; na: number; k1: number; cd: number; reference: { title: LText; cd: number }
}) {
  const { t } = useLocale()
  return (
    <FabFigure title={loc('同一标尺下比较可印线宽', 'Compare printable widths on one scale')}
      caption={loc('CD 越小，模型预计能分辨的细节越细。试着只拖 NA，再切换光源比较另一组参数。', 'Smaller CD means finer resolvable detail in the model. Change NA by itself, then switch sources to compare a second parameter set.')}>
      <div className="fab-equation">
        <div className="fab-line"><b>CD = k₁ × λ / NA</b><span>{k1.toFixed(2)} × {lambda} nm / {na.toFixed(2)} = {cd.toFixed(1)} nm</span></div>
        <div className="fab-line"><b>{t(loc('当前线宽', 'Current width'))}</b><span>{cd.toFixed(1)} nm</span></div>
        <div className="fab-ruler" aria-hidden="true"><span style={{ width: `${cd / 120 * 100}%` }} /></div>
        <div className="fab-line"><b>{t(reference.title)} · {t(loc('预设参考', 'Reference preset'))}</b><span>{reference.cd.toFixed(1)} nm</span></div>
        <div className="fab-ruler fab-ruler--reference" aria-hidden="true"><span style={{ width: `${reference.cd / 120 * 100}%` }} /></div>
        <div className="fab-ruler-labels" aria-hidden="true"><span>0</span><span>30</span><span>60</span><span>90</span><span>120 nm</span></div>
        <p>{t(loc('λ 是曝光波长，NA 是光学系统收集衍射光的能力，k₁ 是由光刻胶、照明等工艺条件决定的无量纲系数。固定其他量时，增大 NA 或缩短 λ 都会减小 CD。图是教学模型，各组参数用于比较趋势。', 'λ is exposure wavelength, NA describes the optical system’s ability to collect diffracted light, and k₁ is a dimensionless process factor influenced by resist and illumination. With other terms fixed, increasing NA or shortening λ reduces CD. The values illustrate trends.'))}</p>
      </div>
    </FabFigure>
  )
}
