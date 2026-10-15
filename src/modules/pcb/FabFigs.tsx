import { type ReactNode } from 'react'
import { frameIndex, type FrameId } from './data/pcbFabModel'
import { GEO, INNER_CU, OPENINGS, OUTER_CU, VIA_PAD, gapsOf, type Span } from './data/pcbFabRules'

export const COLOR = {
  cu: '#c8793f',
  cuPlated: '#e29a5a',
  core: '#4c6a45',
  pp: '#9aa85c',
  film: '#5aa2ff',
  filmHard: '#2a58b5',
  sn: '#d3dae1',
  mask: '#2e9d4f',
  maskSoft: '#8fcf6a',
  maskHard: '#23803f',
  maskCured: '#1c6b34',
  ink: '#f6f6f6',
  ni: '#8f9aa6',
  au: '#f2c94c',
  smear: '#8a5a34',
  oxide: '#3a2418',
  uv: '#b388ff',
  etchant: '#5fd6c0',
  heat: '#ff8a4c',
  steel: '#aab3bd',
  glass: '#9fb3c8',
}

const W = GEO.width
const HX0 = GEO.viaX - GEO.holeR
const HX1 = GEO.viaX + GEO.holeR

/** 去掉孔位那一段 */
export function splitHole(spans: Span[]): Span[] {
  const out: Span[] = []
  for (const [x, w] of spans) {
    if (x + w <= HX0 || x >= HX1) {
      out.push([x, w])
    } else {
      if (x < HX0) {
        out.push([x, HX0 - x])
      }
      if (x + w > HX1) {
        out.push([HX1, x + w - HX1])
      }
    }
  }
  return out
}

export function Rects({ spans, y, h, fill, opacity }: { spans: Span[]; y: number; h: number; fill: string; opacity?: number }) {
  return (
    <>
      {spans.map(([x, w]) => (
        <rect key={`${x}-${w}`} x={x} y={y} width={w} height={h} fill={fill} opacity={opacity} />
      ))}
    </>
  )
}

type TrapProps = { x: number; w: number; yTop: number; yBase: number; u: number; fill: string; sl?: boolean; sr?: boolean; coat?: boolean }

function Trap({ x, w, yTop, yBase, u, fill, sl = true, sr = true, coat = false }: TrapProps) {
  const l = sl ? u : 0
  const r = sr ? u : 0
  const pts = `${x},${yBase} ${x + w},${yBase} ${x + w - r},${yTop} ${x + l},${yTop}`
  return (
    <>
      {coat ? <polygon points={pts} fill={COLOR.au} stroke={COLOR.au} strokeWidth="5.5" strokeLinejoin="round" /> : null}
      {coat ? <polygon points={pts} fill={COLOR.ni} stroke={COLOR.ni} strokeWidth="3.5" strokeLinejoin="round" /> : null}
      <polygon points={pts} fill={fill} />
    </>
  )
}

/** 一组铜线路；钻孔之后，压过孔的焊盘被孔分成左右两半 */
function CuSpans({ spans, yTop, yBase, u, drilled, fill, coatFrom }: { spans: Span[]; yTop: number; yBase: number; u: number; drilled: boolean; fill: string; coatFrom?: number }) {
  const nodes: ReactNode[] = []
  for (const [x, w] of spans) {
    const coat = coatFrom !== undefined && x >= coatFrom
    const hit = drilled && x < HX1 && x + w > HX0
    if (hit) {
      nodes.push(<Trap key={`${x}a`} x={x} w={HX0 - x} yTop={yTop} yBase={yBase} u={u} fill={fill} sr={false} coat={coat} />)
      nodes.push(<Trap key={`${x}b`} x={HX1} w={x + w - HX1} yTop={yTop} yBase={yBase} u={u} fill={fill} sl={false} coat={coat} />)
    } else {
      nodes.push(<Trap key={x} x={x} w={w} yTop={yTop} yBase={yBase} u={u} fill={fill} coat={coat} />)
    }
  }
  return <>{nodes}</>
}

function Arrows({ spans, y1, y2, color }: { spans: Span[]; y1: number; y2: number; color: string }) {
  const nodes: ReactNode[] = []
  for (const [x, w] of spans) {
    const n = Math.max(1, Math.round(w / 22))
    for (let i = 0; i < n; i++) {
      const cx = x + (w * (i + 0.5)) / n
      nodes.push(<line key={`l${x}-${i}`} x1={cx} y1={y1} x2={cx} y2={y2 - 4} stroke={color} strokeWidth="1.6" />)
      nodes.push(<polygon key={`h${x}-${i}`} points={`${cx - 3},${y2 - 5} ${cx + 3},${y2 - 5} ${cx},${y2}`} fill={color} />)
    }
  }
  return <>{nodes}</>
}

function Plate({ y, blocks }: { y: number; blocks: Span[] }) {
  return (
    <g>
      <rect x="0" y={y} width={W} height="5" fill={COLOR.glass} opacity="0.45" />
      <Rects spans={blocks} y={y} h={5} fill="#0b0d10" />
    </g>
  )
}

const HEAT: Span[] = [[26, 20], [90, 20], [190, 20], [258, 20], [320, 20]]

/** 板的上半部分（从外表面到中心线）；下半部分由外面翻转得到 */
export function Half({ f }: { f: number }) {
  const at = (id: FrameId) => f === frameIndex(id)
  const from = (id: FrameId) => f >= frameIndex(id)
  const drilled = from('drill')
  const pressed = from('press')
  const holeCut = (s: Span[]) => (drilled ? splitHole(s) : s)
  const full: Span[] = [[0, W]]
  const gapsIn = gapsOf(INNER_CU, W)
  const gapsOut = gapsOf(OUTER_CU, W)
  const hard = gapsOf(OPENINGS, W)
  const lift = at('layup') ? -46 : 0
  const coat = from('panel') ? 4 : at('electroless') ? 2 : 0
  const traced = from('etch2')
  const plated = from('pattern') && !traced
  const cw = from('pattern') ? 7 : from('panel') ? 4 : 1.5
  const wallTop = from('pattern') ? 96 : from('panel') ? 102 : 104

  return (
    <g>
      <Rects spans={holeCut(full)} y={148} h={27.5} fill={COLOR.core} />
      {from('layup') ? (
        pressed ? <Rects spans={holeCut(full)} y={114} h={34} fill={COLOR.pp} /> : <rect x="0" y={114 - 24} width={W} height="26" fill={COLOR.pp} opacity="0.85" />
      ) : null}
      {from('maskCoat') ? <MaskLayer f={f} hard={hard} /> : null}
      {f < frameIndex('etch1') ? (
        <rect x="0" y="140" width={W} height="8" fill={COLOR.cu} />
      ) : (
        <g stroke={at('oxide') || at('layup') ? COLOR.oxide : 'none'} strokeWidth="2">
          <CuSpans spans={INNER_CU} yTop={140} yBase={148} u={2.5} drilled={drilled} fill={COLOR.cu} />
        </g>
      )}
      {at('dfLam1') ? <Rects spans={full} y={130} h={10} fill={COLOR.film} opacity={0.85} /> : null}
      {at('exp1') ? <Rects spans={gapsIn} y={130} h={10} fill={COLOR.film} opacity={0.85} /> : null}
      {at('exp1') || at('dev1') || at('etch1') ? <Rects spans={INNER_CU} y={130} h={10} fill={COLOR.filmHard} /> : null}
      {from('layup') && !traced ? (
        <g transform={`translate(0 ${lift})`}>
          <Rects spans={holeCut(full)} y={106} h={8} fill={COLOR.cu} />
          {coat > 0 ? <Rects spans={holeCut(full)} y={106 - coat} h={coat} fill={COLOR.cuPlated} /> : null}
          {plated ? <Rects spans={holeCut(OUTER_CU)} y={96} h={6} fill={COLOR.cuPlated} /> : null}
          {plated ? <Rects spans={holeCut(OUTER_CU)} y={93} h={3} fill={COLOR.sn} /> : null}
        </g>
      ) : null}
      {traced ? (
        <g>
          <CuSpans spans={OUTER_CU} yTop={96} yBase={114} u={3} drilled fill={COLOR.cuPlated} coatFrom={from('enig') ? VIA_PAD[0] : undefined} />
          {!from('stripSn') ? <Rects spans={splitHole(OUTER_CU)} y={93} h={3} fill={COLOR.sn} /> : null}
        </g>
      ) : null}
      {drilled ? <rect x={HX0} y="60" width={HX1 - HX0} height="116" fill="var(--well)" /> : null}
      {drilled ? <Wall f={f} cw={cw} wallTop={wallTop} /> : null}
      {at('dfLam2') ? <Rects spans={full} y={92} h={10} fill={COLOR.film} opacity={0.85} /> : null}
      {at('exp2') ? <Rects spans={OUTER_CU} y={92} h={10} fill={COLOR.film} opacity={0.85} /> : null}
      {at('exp2') || at('dev2') || at('pattern') ? <Rects spans={gapsOut} y={92} h={10} fill={COLOR.filmHard} /> : null}
      {at('exp1') ? <Plate y={112} blocks={gapsIn} /> : null}
      {at('exp1') ? <Arrows spans={INNER_CU} y1={92} y2={110} color={COLOR.uv} /> : null}
      {at('exp2') ? <Plate y={78} blocks={OUTER_CU} /> : null}
      {at('exp2') ? <Arrows spans={gapsOut} y1={58} y2={76} color={COLOR.uv} /> : null}
      {at('maskExp') ? <Plate y={78} blocks={OPENINGS} /> : null}
      {at('maskExp') ? <Arrows spans={hard} y1={58} y2={76} color={COLOR.uv} /> : null}
      {at('etch1') ? <Arrows spans={gapsIn} y1={102} y2={126} color={COLOR.etchant} /> : null}
      {at('etch2') ? <Arrows spans={gapsOut} y1={64} y2={90} color={COLOR.etchant} /> : null}
      {at('press') ? <rect x="0" y="98" width={W} height="6" fill={COLOR.steel} /> : null}
      {at('press') ? <Arrows spans={HEAT} y1={66} y2={94} color={COLOR.heat} /> : null}
      {at('maskCure') ? <Arrows spans={HEAT} y1={60} y2={84} color={COLOR.heat} /> : null}
      {at('drill') ? <SmearMarks /> : null}
    </g>
  )
}

function MaskLayer({ f, hard }: { f: number; hard: Span[] }) {
  const at = (id: FrameId) => f === frameIndex(id)
  if (at('maskCoat')) {
    return <Rects spans={splitHole([[0, W]])} y={90} h={24} fill={COLOR.maskSoft} opacity={0.8} />
  }
  if (at('maskExp')) {
    return (
      <>
        <Rects spans={hard} y={90} h={24} fill={COLOR.maskHard} />
        <Rects spans={splitHole(OPENINGS)} y={90} h={24} fill={COLOR.maskSoft} opacity={0.8} />
      </>
    )
  }
  return <Rects spans={hard} y={90} h={24} fill={at('maskDev') ? COLOR.mask : COLOR.maskCured} />
}

function SmearMarks() {
  return (
    <>
      <rect x={HX0} y="139" width="3" height="10" fill={COLOR.smear} />
      <rect x={HX1 - 3} y="139" width="3" height="10" fill={COLOR.smear} />
    </>
  )
}

/** 孔壁：镀铜、锡、镍、金，都是贴着孔壁往孔中心长 */
function Wall({ f, cw, wallTop }: { f: number; cw: number; wallTop: number }) {
  const from = (id: FrameId) => f >= frameIndex(id)
  if (!from('electroless')) {
    return null
  }
  const layers: Array<[number, number, number, string]> = [[0, cw, wallTop, COLOR.cuPlated]]
  if (from('pattern') && !from('stripSn')) {
    layers.push([cw, 3, 93, COLOR.sn])
  }
  if (from('enig')) {
    layers.push([cw, 3.5, 92, COLOR.ni], [cw + 3.5, 1.5, 90.5, COLOR.au])
  }
  return (
    <>
      {layers.map(([off, w, top, fill]) => (
        <g key={off} fill={fill}>
          <rect x={HX0 + off} y={top} width={w} height={175.5 - top} />
          <rect x={HX1 - off - w} y={top} width={w} height={175.5 - top} />
        </g>
      ))}
    </>
  )
}
