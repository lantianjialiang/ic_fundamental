import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { Diagram, DiagramChoices, DiagramLegend } from './FlowVisuals'

type Part = readonly [id: string, x: number, y: number, width: number, height: number, tone: string]

export function CrossSection({ title, caption, parts, active }: {
  title: LText; caption: LText; parts: readonly Part[]; active?: string
}) {
  return (
    <Diagram title={title} caption={caption}>
      <div className="flow-canvas flow-cross" aria-hidden="true">
        {parts.map(([id, x, y, w, h, tone], i) => (
          <span key={i} className={`flow-part flow-tone-${tone}`} data-muted={!!active && id !== active}
            style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%` }} />
        ))}
      </div>
    </Diagram>
  )
}

export function PathStrip({ title, nodes, active, onPick, caption }: {
  title: LText; nodes: readonly { id: string; title: LText }[]; active: string; onPick: (id: string) => void; caption: LText
}) {
  return (
    <Diagram title={title} caption={caption}>
      <div className="flow-path"><DiagramChoices label={title} items={nodes} value={active} onPick={onPick} /></div>
    </Diagram>
  )
}

export function SeriesLinks({ count, label }: { count: number; label: LText }) {
  const { t } = useLocale()
  return (
    <div className="flow-series" aria-label={t(label)}>
      <span>A</span><i />
      {Array.from({ length: Math.min(count, 6) }, (_, i) => <b key={i} className={i === 3 && count > 6 ? 'flow-series-more' : ''}>{i === 3 && count > 6 ? '…' : ''}</b>)}
      <i /><span>B</span>
    </div>
  )
}

export function TouchdownGrid({ cols, rows, partial }: { cols: number; rows: number; partial: number }) {
  const [last, setLast] = useState(false)
  const title = loc('一次落针覆盖几个 site', 'Sites covered by one touchdown')
  return (
    <Diagram title={title} caption={loc('每格代表一个 site。这个计算把 die 理想地装进各组，只有最后一组可能空出位置；圆形晶圆上实际还会遇到几何边缘。', 'Each cell is one site. This calculation packs dies into ideal groups, with possible empty sites in the last group. A real circular wafer also constrains the layout.')}>
      <DiagramChoices label={title} value={last ? 'last' : 'first'} onPick={(id) => setLast(id === 'last')}
        items={[{ id: 'first', title: loc('满组', 'Full group') }, { id: 'last', title: loc('最后一组', 'Last group') }]} />
      <div className="flow-sites" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${cols}, 1.8rem)` }}>
        {Array.from({ length: cols * rows }, (_, i) => <span key={i} data-empty={last && i >= cols * rows - partial}>{i + 1}</span>)}
      </div>
      <DiagramLegend items={[[ 'unit', loc('已测试 site', 'Tested site') ], [ 'space', loc('空余 site', 'Unused site') ]]} />
    </Diagram>
  )
}

export function EscapeDiagram({ pitch, pad, line, count }: { pitch: number; pad: number; line: number; count: number }) {
  const scale = 70 / pitch
  return <CrossSection title={loc('从相邻焊盘之间逃线', 'Route between adjacent pads')}
    caption={loc(`两个焊盘的边缘之间剩 ${pitch - pad} µm。每根线宽 ${line} µm，还要在相邻导体之间留出 ${line} µm 的间距。`, `The pad edges leave ${pitch - pad} µm. Each trace uses ${line} µm of width and a ${line} µm spacing is needed between adjacent conductors.`)}
    parts={[
      ['pad1', 0, 22, pad * scale, 55, 'copper'],
      ['pad2', 70, 22, pad * scale, 55, 'copper'],
      ...Array.from({ length: count }, (_, i): Part => ['line', (pad + (2 * i + 1) * line) * scale, 8, line * scale, 84, 'unit']),
    ]} />
}

export function DefectCircuit({ defect, caption }: { defect: string; caption: LText }) {
  const [mode, setMode] = useState('continuity')
  const isolation = mode === 'isolation'
  const title = loc('飞针落点决定测导通还是绝缘', 'Probe positions select continuity or isolation')
  const expected = isolation
    ? defect === 'short' ? loc('低阻，网络间短路', 'Low resistance, nets shorted') : loc('高阻，网络间绝缘', 'High resistance, nets isolated')
    : defect === 'open' ? loc('高阻，路径断开', 'High resistance, trace open') : defect === 'highz' ? loc('有限电阻，但高于导通要求', 'Finite resistance, above continuity limit') : loc('低阻，同网导通', 'Low resistance, the net conducts')
  const { t } = useLocale()
  return (
    <Diagram title={title} caption={caption}>
      <DiagramChoices label={title} value={mode} onPick={setMode} items={[
        { id: 'continuity', title: loc('同网两端', 'Two ends of one net') }, { id: 'isolation', title: loc('跨两个网络', 'Across two nets') },
      ]} />
      <div className="flow-canvas flow-cross" aria-hidden="true">
        <span className="flow-defect-net" /><span className="flow-defect-net flow-defect-net--lower" />
        {defect === 'open' && <span className="flow-defect-break" />}
        {defect === 'highz' && <span className="flow-defect-neck" />}
        {defect === 'short' && <span className="flow-defect-bridge" />}
        <span className="flow-defect-pin">A</span><span className="flow-defect-pin" style={{ left: isolation ? '14%' : '84%', top: isolation ? '58%' : '20%' }}>B</span>
      </div>
      <strong>{t(expected)}</strong>
    </Diagram>
  )
}

export function Plot({ title, points, labels, selected, onPick, min, max, guides = [], unit = '', caption, valueAt }: {
  title: LText; points: readonly number[]; labels: readonly string[]; selected: number
  onPick: (i: number) => void; min: number; max: number
  guides?: readonly { label: string; value: number; alert?: boolean }[]; unit?: string; caption: LText
  valueAt?: (value: number) => string
}) {
  const { t } = useLocale()
  const at = Math.min(selected, points.length - 1)
  const x = (i: number) => 5 + 90 * i / Math.max(1, points.length - 1)
  const y = (value: number) => 8 + 84 * (max - value) / (max - min)
  const format = valueAt ?? ((v: number) => v.toFixed(3))
  const beyond = (value: number) => guides.some((g) => g.alert && (g.label === 'UCL' ? value > g.value : value < g.value))
  return (
    <Diagram title={title} caption={caption}>
      <div className="flow-canvas flow-plot" aria-hidden="true">
        {guides.map((g) => <span key={g.label} className={`flow-guide${g.alert ? ' is-limit' : ''}`} style={{ top: `${y(g.value)}%` }}>{g.label}</span>)}
        <div className="flow-plot-area">
          {points.slice(1).map((v, i) => {
            const x0 = x(i), x1 = x(i + 1), y0 = y(points[i]), y1 = y(v)
            return <i key={i} className="flow-segment" style={{ clipPath: `polygon(${x0}% ${y0 - .7}%,${x1}% ${y1 - .7}%,${x1}% ${y1 + .7}%,${x0}% ${y0 + .7}%)` }} />
          })}
          <i className="flow-cursor" style={{ left: `${x(at)}%` }} />
          {points.map((v, i) => <i key={i} className="flow-point" data-alert={beyond(v)} data-active={i === at} style={{ left: `${x(i)}%`, top: `${y(v)}%` }} />)}
        </div>
      </div>
      <div className="flow-axis"><span>{labels[0]}</span><span>{labels[labels.length - 1]}</span></div>
      <label className="flow-plot-control">
        <span>{t(loc('查看', 'Inspect'))} {labels[at]} · <strong>{format(points[at])} {unit}</strong>{beyond(points[at]) ? t(loc(' · 超出控制限', ' · Beyond control limit')) : ''}</span>
        <input type="range" min={0} max={points.length - 1} value={at} onChange={(e) => onPick(Number(e.target.value))} />
      </label>
      {!!guides.length && <div className="flow-axis">{guides.map((g) => <span key={g.label}>{g.label} {format(g.value)}</span>)}</div>}
    </Diagram>
  )
}

export function CpWaferMap({ dies, good, pattern, caption }: { dies: number; good: number; pattern: string; caption: LText }) {
  const { t } = useLocale()
  const size = Math.ceil(Math.sqrt(dies * 4 / Math.PI)) + 2
  const center = (size - 1) / 2
  const cells = Array.from({ length: size * size }, (_, i) => {
    const x = (i % size - center) / center
    const y = (Math.floor(i / size) - center) / center
    return { i, x, y, r: Math.hypot(x, y) }
  }).sort((a, b) => a.r - b.r).slice(0, dies)
  const score = (cell: (typeof cells)[number]) => {
    if (pattern === 'edge') return -cell.r
    if (pattern === 'scratch') return Math.abs(cell.y - .7 * cell.x - .16)
    return Math.hypot(cell.x + .35, cell.y - .23)
  }
  const failures = new Set([...cells].sort((a, b) => score(a) - score(b)).slice(0, dies - good).map((cell) => cell.i))
  return (
    <Diagram title={loc('CP 分选晶圆图', 'CP bin map')} caption={caption}>
      <div className="flow-wafer" role="img" aria-label={t(loc(`示意晶圆图，${good} 颗通过，${dies - good} 颗失败`, `Illustrative wafer map, ${good} pass, ${dies - good} fail`))}
        style={{ gridTemplateColumns: `repeat(${size}, 1fr)`, gridTemplateRows: `repeat(${size}, 1fr)` }}>
        {cells.map(({ i }) => <i key={i} data-fail={failures.has(i)} style={{ gridColumn: i % size + 1, gridRow: Math.floor(i / size) + 1 }} />)}
      </div>
      <DiagramLegend items={[[ 'unit', loc(`通过 ${good}`, `Pass ${good}`) ], [ 'copper', loc(`失败 ${dies - good}`, `Fail ${dies - good}`) ]]} />
    </Diagram>
  )
}

export function ReticleLayout({ projects }: { projects: number }) {
  const [selected, setSelected] = useState(0)
  const active = Math.min(selected, projects - 1)
  const title = loc('在同一光罩版图上分配项目', 'Allocate projects on a shared reticle')
  const { t } = useLocale()
  return (
    <Diagram title={title} caption={loc('每格代表一个项目的版图区域。这里按项目等额分摊，实际 MPW 常按占用面积、交付颗数和服务项目报价。', 'Each tile is one project region. The model splits cost equally. Real MPW quotes commonly depend on area, delivered die count and services.')}>
      <div className="flow-reticle" role="group" aria-label={t(title)}>
        {Array.from({ length: projects }, (_, i) => <button type="button" key={i} aria-pressed={i === active} onClick={() => setSelected(i)}>{i + 1}</button>)}
      </div>
      <strong>{t(loc(`当前项目 ${active + 1} / ${projects}`, `Selected project ${active + 1} / ${projects}`))}</strong>
    </Diagram>
  )
}

export function FourPointProbe({ voltage, current }: { voltage: number; current: number }) {
  const { t } = useLocale()
  return (
    <Diagram title={loc('外针送电流，内针量电压', 'Outer probes source current, inner probes sense voltage')}
      caption={loc('内针读同一薄膜上两点间的电压差。π/ln 2 几何因子适用于等间距探针和相对无限大的薄片近似。', 'The inner probes sense voltage across two points on the sheet. The π/ln 2 factor assumes evenly spaced probes and an effectively infinite thin sheet.')}>
      <div className="flow-four-point" aria-hidden="true">
        <span>I+</span><span>V+</span><span>V−</span><span>I−</span><i />
      </div>
      <DiagramLegend items={[[ 'copper', loc(`外针电流 ${current} mA`, `Outer current ${current} mA`) ], [ 'seed', loc(`内针压差 ${voltage} mV`, `Inner voltage ${voltage} mV`) ]]} />
      <span className="flow-axis">{t(loc('由左到右 I+、V+、V−、I−', 'From left to right: I+, V+, V−, I−'))}</span>
    </Diagram>
  )
}
export function CalendarTimeline<T extends string>({ steps, active, onPick }: {
  steps: readonly { id: T; title: LText; weeks: number }[]; active: T; onPick: (id: T) => void
}) {
  const { t } = useLocale()
  const serial = steps.filter((s) => s.id !== 'sub')
  const total = serial.reduce((sum, s) => sum + s.weeks, 0)
  const fab = serial.findIndex((s) => s.id === 'fab')
  const sub = steps.find((s) => s.id === 'sub')
  const beforeFab = serial.slice(0, fab).reduce((sum, s) => sum + s.weeks, 0)
  const title = loc('晶圆和基板并行，组装在汇合后启动', 'Wafer and substrate tracks merge before assembly')
  return (
    <Diagram title={title} caption={loc('横向长度对应示意周数。基板从晶圆制造开始时并行加工，组装要等 CP 后的合格裸片与基板两边都到齐。点击任一段查看产出。', 'Horizontal length shows illustrative weeks. The substrate route starts alongside wafer fabrication. Assembly waits for both sorted good dies and substrates. Select a stage to inspect its output.')}>
      <div className="flow-timeline" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${total}, 1fr)` }}>
        {serial.map((s, i) => <span key={s.id} data-active={s.id === active} title={t(s.title)}
          style={{ gridColumn: `${1 + serial.slice(0, i).reduce((sum, item) => sum + item.weeks, 0)} / span ${s.weeks}` }} />)}
        {sub && <span data-active={active === sub.id} title={t(sub.title)} style={{ gridColumn: `${beforeFab + 1} / span ${sub.weeks}` }} />}
      </div>
      <DiagramChoices label={title} items={steps.map((s) => ({ id: s.id, title: loc(`${s.title.zh} · ${s.weeks} 周`, `${s.title.en} · ${s.weeks} wk`) }))}
        value={active} onPick={onPick} />
    </Diagram>
  )
}
export function CostCrossover({ first, second, crossover }: {
  first: { title: LText; fixed: number; variable: number }
  second: { title: LText; fixed: number; variable: number }
  crossover: number
}) {
  const { t } = useLocale()
  const [position, setPosition] = useState(50)
  const maxVolume = crossover > 0 && Number.isFinite(crossover) ? Math.ceil(crossover * 1.5) : 100000
  const volume = Math.round(maxVolume * position / 100)
  const cost = (plan: typeof first, q: number) => plan.fixed + plan.variable * q
  const highest = Math.max(cost(first, maxVolume), cost(second, maxVolume))
  const y = (value: number) => 94 - 84 * value / highest
  const label = loc('比较同一产量下的总成本', 'Compare total costs at the same volume')
  return (
    <Diagram title={label} caption={loc('起点是固定费用，线的斜率是每多做一颗增加的可变成本。两线相交时总成本相同，因此每颗成本也相同。', 'The intercept is fixed cost and the slope is variable cost per extra unit. Where the lines meet at positive volume, both total and per-unit costs match.')}>
      <div className="flow-canvas flow-plot" aria-hidden="true">
        {[first, second].map((plan, i) => {
          const start = y(plan.fixed)
          const end = y(cost(plan, maxVolume))
          return <i key={plan.title.zh} className={`flow-segment flow-cost-line-${i}`}
            style={{ clipPath: `polygon(4% ${start - .8}%,96% ${end - .8}%,96% ${end + .8}%,4% ${start + .8}%)` }} />
        })}
        <i className="flow-cursor" style={{ left: `${4 + position * .92}%` }} />
      </div>
      <div className="flow-axis"><span>0</span><span>{maxVolume.toLocaleString()}</span></div>
      <label className="flow-plot-control">
        <span>{t(loc('比较产量', 'Compare volume'))} <strong>{volume.toLocaleString()}</strong></span>
        <input type="range" min={0} max={100} value={position} onChange={(event) => setPosition(Number(event.target.value))} />
      </label>
      <DiagramLegend items={[[ 'plotblue', loc(`${first.title.zh} ${cost(first, volume).toFixed(0)}`, `${first.title.en} ${cost(first, volume).toFixed(0)}`) ],
        [ 'plotamber', loc(`${second.title.zh} ${cost(second, volume).toFixed(0)}`, `${second.title.en} ${cost(second, volume).toFixed(0)}`) ]]} />
    </Diagram>
  )
}
