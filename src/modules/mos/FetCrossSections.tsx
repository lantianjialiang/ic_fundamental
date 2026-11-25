import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'

/** 等轴测投影的立体示意图：用明暗三面表现体积，半透明栅极让内部沟道透出，直观呈现「栅极如何包裹沟道」。 */
type Bounds = [number, number, number, number, number, number] // x0,x1,y0,y1,z0,z1
type Part = { b: Bounds; color: string; opacity?: number }
type Structure = { name: string; wrap: LText; parts: Part[] }

const OX = 100
const OY = 96
const S = 30
const iso = (x: number, y: number, z: number): [number, number] => [OX + (x - z) * 0.866 * S, OY + ((x + z) * 0.5 - y) * S]
const pt = (p: [number, number]) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`
const poly = (ps: [number, number][]) => ps.map(pt).join(' ')

function faces([x0, x1, y0, y1, z0, z1]: Bounds) {
  const a = iso(x0, y1, z0)
  const b = iso(x1, y1, z0)
  const c = iso(x1, y1, z1)
  const d = iso(x0, y1, z1)
  const e = iso(x1, y0, z1)
  const f = iso(x0, y0, z1)
  const g = iso(x1, y0, z0)
  return {
    top: [a, b, c, d] as [number, number][],
    right: [b, g, e, c] as [number, number][],
    left: [d, c, e, f] as [number, number][],
  }
}

function IsoBox({ b, color, opacity = 1 }: Part) {
  const { top, right, left } = faces(b)
  const edge = { stroke: 'rgba(8,12,20,.55)', strokeWidth: 0.7, strokeLinejoin: 'round' as const }
  return (
    <g>
      <polygon points={poly(top)} fill={color} fillOpacity={opacity} {...edge} />
      <polygon points={poly(right)} fill={color} fillOpacity={opacity} {...edge} />
      <polygon points={poly(left)} fill={color} fillOpacity={opacity} {...edge} />
      <polygon points={poly(right)} fill="#000" fillOpacity={opacity * 0.2} />
      <polygon points={poly(left)} fill="#000" fillOpacity={opacity * 0.36} />
    </g>
  )
}

const SUB: Bounds = [-1.55, 1.55, -0.45, 0, -1.05, 1.05]
const SUBSTRATE = 'var(--panel-2)'
const GATE = 'var(--blue)'
const CHANNEL = 'var(--gold)'
const GATE_OPACITY = 0.62

function structures(): Structure[] {
  const wireYs = [0.6, 0.92, 1.24]
  return [
    {
      name: 'Planar FET',
      wrap: loc('栅极只在沟道上方控制。', 'The gate controls from above only.'),
      parts: [
        { b: SUB, color: SUBSTRATE },
        { b: [-0.95, 0.95, 0, 0.1, -0.22, 0.22], color: CHANNEL },
        { b: [-0.95, 0.95, 0.28, 0.82, -0.34, 0.34], color: GATE, opacity: GATE_OPACITY },
      ],
    },
    {
      name: 'FinFET',
      wrap: loc('栅极从顶面和两侧三面包裹鳍。', 'The gate wraps the fin on the top and both sides.'),
      parts: [
        { b: SUB, color: SUBSTRATE },
        { b: [-0.18, 0.18, 0, 1.05, -0.95, 0.95], color: CHANNEL },
        { b: [-0.62, 0.62, 0.2, 1.25, -0.42, 0.42], color: GATE, opacity: GATE_OPACITY },
      ],
    },
    {
      name: 'Nanowire GAA',
      wrap: loc('栅极四面环绕每根纳米线。', 'The gate surrounds each nanowire on all four sides.'),
      parts: [
        { b: SUB, color: SUBSTRATE },
        ...wireYs.map((y) => ({ b: [-1.08, 1.08, y - 0.09, y + 0.09, -0.11, 0.11] as Bounds, color: CHANNEL })),
        { b: [-0.95, 0.95, 0.3, 1.5, -0.9, 0.9], color: GATE, opacity: GATE_OPACITY },
      ],
    },
    {
      name: 'Nanosheet GAA',
      wrap: loc('栅极四面环绕每层更宽的纳米片。', 'The gate surrounds each wider nanosheet on all four sides.'),
      parts: [
        { b: SUB, color: SUBSTRATE },
        ...wireYs.map((y) => ({ b: [-1.08, 1.08, y - 0.05, y + 0.05, -0.62, 0.62] as Bounds, color: CHANNEL })),
        { b: [-0.95, 0.95, 0.3, 1.5, -0.9, 0.9], color: GATE, opacity: GATE_OPACITY },
      ],
    },
  ]
}

export function FetCrossSections() {
  const { t } = useLocale()
  return (
    <div className="home__grid" aria-label={t(loc('栅极与沟道立体结构', '3D gate and channel structures'))}>
      {structures().map((s) => (
        <figure key={s.name} className="term-fig">
          <svg viewBox="0 0 200 145" className="term-fig__svg" role="img" aria-label={`${s.name} — ${t(s.wrap)}`}>
            <g>{s.parts.map((part, i) => <IsoBox key={i} {...part} />)}</g>
          </svg>
          <figcaption>
            <b>{s.name}</b>
            <span style={{ display: 'block', color: 'var(--muted)', marginTop: 2 }}>{t(s.wrap)}</span>
          </figcaption>
        </figure>
      ))}
      <p className="intro__note" style={{ gridColumn: '1 / -1' }}>
        {t(loc(
          '立体示意：蓝色半透明块是栅极，金色是沟道，灰色是衬底；栅极与沟道之间的缝隙代表栅介质。为看清包裹关系，省略了源漏。四张图的关键差别是栅极从几个面控制沟道：上方 → 三面 → 四面环绕。',
          '3D view: translucent blue blocks are the gate, gold is the channel, grey is the substrate; the gap between gate and channel represents the gate dielectric. Source and drain are omitted to reveal the wrapping. The key difference across the four is how many sides the gate controls: top → three sides → all around.',
        ))}
      </p>
    </div>
  )
}
