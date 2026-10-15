import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { Hit } from '../prep/common'
import { COLOR } from './FabFigs'
import { S } from './data/pcbMaterial'
import { LAYER_BY_ID, STACK_KINDS, type LayerKind, type StackId } from './data/pcbMaterialLayers'
import { type Span } from './data/pcbFabRules'

export const X0 = 30
export const X1 = 400
const VB_H = 292

// 示意像素厚度，不按比例
const H = { silk: 8, over: 10, cuOut: 16, plate: 6, cuIn: 12, pp: 30, core2: 110, core4: 80 }
const PAD: Span = [250, 60]
const OPEN_PAD = 6
const OUTER_TOP: Span[] = [[34, 28], [78, 28], [122, 28], PAD, [330, 40]]
const OUTER_BOT: Span[] = [[34, 60], [110, 90], [220, 70], [320, 60]]
const SILK_TOP: Span[] = [[44, 56], [150, 40], [330, 36]]
const SILK_BOT: Span[] = [[100, 60], [250, 40]]
const INNER_END = 388

export const COLORS: Record<LayerKind, string> = {
  silk: COLOR.ink,
  mask: COLOR.mask,
  finish: COLOR.au,
  cuOuter: COLOR.cuPlated,
  prepreg: COLOR.pp,
  cuInner: COLOR.cu,
  core: COLOR.core,
}

function subtract(spans: Span[], cut: Span): Span[] {
  const out: Span[] = []
  const [cx, cw] = cut
  for (const [x, w] of spans) {
    if (x + w <= cx || x >= cx + cw) {
      out.push([x, w])
    } else {
      if (x < cx) {
        out.push([x, cx - x])
      }
      if (x + w > cx + cw) {
        out.push([cx + cw, x + w - cx - cw])
      }
    }
  }
  return out
}

function gapsOf(spans: Span[]): Span[] {
  const sorted = [...spans].sort((a, b) => a[0] - b[0])
  const out: Span[] = []
  let cursor = X0
  for (const [x, w] of sorted) {
    if (x > cursor) {
      out.push([cursor, x - cursor])
    }
    cursor = x + w
  }
  if (cursor < X1) {
    out.push([cursor, X1 - cursor])
  }
  return out
}

function layout(stack: StackId) {
  const four = stack === 'four'
  const core = four ? H.core4 : H.core2
  const total = 2 * (H.silk + H.over + H.cuOut) + core + (four ? 2 * (H.pp + H.cuIn) : 0)
  const y0 = 30 + (232 - total) / 2
  const maskTop = y0 + H.silk
  const cuTop = maskTop + H.over
  const dTop = cuTop + H.cuOut
  const dBot = dTop + total - 2 * (H.silk + H.over + H.cuOut)
  const cuBotBot = dBot + H.cuOut
  const maskBotBot = cuBotBot + H.over
  return { four, core, y0, maskTop, cuTop, dTop, dBot, cuBotBot, maskBotBot, silkBotBot: maskBotBot + H.silk }
}

export function Weave({ y, h, x0 = X0, x1 = X1 }: { y: number; h: number; x0?: number; x1?: number }) {
  const rows = Math.max(1, Math.floor(h / 18))
  const pitch = h / rows
  const ry = Math.min(5, pitch / 2 - 3)
  const out: ReactNode[] = []
  for (let r = 0; r < rows; r++) {
    for (let x = x0 + 9 + (r % 2) * 11; x < x1 - 6; x += 22) {
      out.push(<ellipse key={`${r}-${x}`} cx={x} cy={y + pitch * (r + 0.5)} rx={8} ry={ry} fill={COLOR.glass} opacity={0.5} />)
    }
  }
  return <>{out}</>
}

function Bars({ spans, y, h, fill }: { spans: Span[]; y: number; h: number; fill: string }) {
  return (
    <>
      {spans.map(([x, w]) => (
        <rect key={`${x}-${w}`} x={x} y={y} width={w} height={h} fill={fill} />
      ))}
    </>
  )
}

export function StackFig({ stack, active, onPick }: { stack: StackId; active: LayerKind; onPick: (k: LayerKind) => void }) {
  const { t } = useLocale()
  const g = layout(stack)
  const kinds = STACK_KINDS[stack]
  const opening: Span = [PAD[0] - OPEN_PAD, PAD[1] + 2 * OPEN_PAD]
  const gate = (k: LayerKind) => (active === k ? 1 : 0.6)
  const wrap = (k: LayerKind, children: ReactNode) => (
    <Hit label={t(LAYER_BY_ID(k).name)} active={active === k} onPick={() => onPick(k)}>
      <g opacity={gate(k)}>{children}</g>
    </Hit>
  )
  const maskTopSpans = subtract([[X0, X1 - X0]], opening)
  const topGaps = subtract(gapsOf(OUTER_TOP), opening)
  const botGaps = gapsOf(OUTER_BOT)
  const ppTopY = g.dTop
  const in1Y = g.dTop + H.pp
  const coreY = g.four ? in1Y + H.cuIn : g.dTop
  const in2Y = coreY + g.core
  const pp2Y = in2Y + H.cuIn
  // 图例：每种层只列一次，行距固定
  const rowY = (i: number) => 40 + (7 - kinds.length) * 17 + i * 34
  const target: Record<LayerKind, [number, number]> = {
    silk: [348, g.y0 + H.silk / 2],
    mask: [386, g.maskTop + H.over / 2],
    finish: [PAD[0] + PAD[1] + 3, g.cuTop - 2],
    cuOuter: [350, g.cuTop + H.cuOut / 2],
    prepreg: [380, ppTopY + H.pp / 2],
    cuInner: [INNER_END - 4, in1Y + H.cuIn / 2],
    core: [380, coreY + g.core / 2],
  }
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 760 ${VB_H}`} className="term-fig__svg" role="group" aria-label={t(S.stackCap)}>
        <rect width="760" height={VB_H} rx="10" fill="var(--well)" />
        <text x={X0} y="18" fill="var(--muted)" fontSize="11">
          {t(S.topSide)}
        </text>
        <text x={X1} y="18" textAnchor="end" fill="var(--muted)" fontSize="11">
          {t(S.edgeLabel)}
        </text>
        <text x={X0} y={VB_H - 8} fill="var(--muted)" fontSize="11">
          {t(S.bottomSide)}
        </text>
        <text x={PAD[0] + PAD[1] / 2} y={g.y0 - 6} textAnchor="middle" fill="var(--muted)" fontSize="11">
          {t(S.padLabel)}
        </text>
        {wrap(
          'core',
          <>
            <rect x={X0} y={coreY} width={X1 - X0} height={g.core} fill={COLOR.core} />
            <Weave y={coreY} h={g.core} />
          </>,
        )}
        {g.four
          ? wrap(
              'prepreg',
              <>
                <rect x={X0} y={ppTopY} width={X1 - X0} height={H.pp} fill={COLOR.pp} />
                <rect x={X0} y={pp2Y} width={X1 - X0} height={H.pp} fill={COLOR.pp} />
                <Weave y={ppTopY} h={H.pp} />
                <Weave y={pp2Y} h={H.pp} />
              </>,
            )
          : null}
        {g.four
          ? wrap(
              'cuInner',
              <>
                <rect x={X0} y={in1Y} width={INNER_END - X0} height={H.cuIn} fill={COLOR.cu} />
                <rect x={X0} y={in2Y} width={INNER_END - X0} height={H.cuIn} fill={COLOR.cu} />
              </>,
            )
          : null}
        {wrap(
          'finish',
          <>
            <rect x={PAD[0] - 5} y={g.cuTop - 7} width={PAD[1] + 10} height={H.cuOut + 7} fill={COLOR.au} />
            <rect x={PAD[0] - 3} y={g.cuTop - 5} width={PAD[1] + 6} height={H.cuOut + 5} fill={COLOR.ni} />
          </>,
        )}
        {wrap(
          'cuOuter',
          <>
            <Bars spans={OUTER_TOP} y={g.cuTop + H.plate} h={H.cuOut - H.plate} fill={COLOR.cu} />
            <Bars spans={OUTER_TOP} y={g.cuTop} h={H.plate} fill={COLOR.cuPlated} />
            <Bars spans={OUTER_BOT} y={g.dBot} h={H.cuOut - H.plate} fill={COLOR.cu} />
            <Bars spans={OUTER_BOT} y={g.dBot + H.cuOut - H.plate} h={H.plate} fill={COLOR.cuPlated} />
          </>,
        )}
        {wrap(
          'mask',
          <>
            <Bars spans={maskTopSpans} y={g.maskTop} h={H.over} fill={COLOR.mask} />
            <Bars spans={topGaps} y={g.cuTop} h={H.cuOut} fill={COLOR.mask} />
            <rect x={X0} y={g.cuBotBot} width={X1 - X0} height={H.over} fill={COLOR.mask} />
            <Bars spans={botGaps} y={g.dBot} h={H.cuOut} fill={COLOR.mask} />
          </>,
        )}
        {wrap(
          'silk',
          <>
            <Bars spans={SILK_TOP} y={g.y0} h={H.silk} fill={COLOR.ink} />
            <Bars spans={SILK_BOT} y={g.maskBotBot} h={H.silk} fill={COLOR.ink} />
          </>,
        )}
        <line x1={X1} y1={g.y0} x2={X1} y2={g.silkBotBot} stroke="var(--text-2)" strokeWidth="1" strokeDasharray="3 3" />
        <g pointerEvents="none">
          {kinds.map((k, i) => (
            <g key={k}>
              <circle cx={target[k][0]} cy={target[k][1]} r="2.5" fill="var(--text)" />
              <polyline
                points={`${target[k][0]},${target[k][1]} ${X1 + 14},${target[k][1]} 440,${rowY(i) + 15}`}
                fill="none"
                stroke="var(--text-2)"
                strokeWidth="1"
                opacity="0.7"
              />
            </g>
          ))}
        </g>
        {kinds.map((k, i) => {
          const info = LAYER_BY_ID(k)
          const on = active === k
          return (
            <Hit key={k} label={t(info.name)} active={on} onPick={() => onPick(k)}>
              <rect x="444" y={rowY(i)} width="304" height="30" rx="6" fill={on ? 'var(--gold-bg)' : 'var(--card)'} stroke={on ? 'var(--gold)' : 'var(--line)'} strokeWidth={on ? 2 : 1} />
              <rect x="452" y={rowY(i) + 8} width="14" height="14" rx="3" fill={COLORS[k]} stroke="var(--line)" />
              <text x="476" y={rowY(i) + 13} fill={on ? 'var(--text)' : 'var(--text-2)'} fontSize="12" fontWeight="700">
                {t(info.name)}
              </text>
              <text x="476" y={rowY(i) + 25} fill="var(--muted)" fontSize="10">
                {t(info.tag(stack))}
              </text>
            </Hit>
          )
        })}
      </svg>
      <figcaption>{t(S.stackCap)}</figcaption>
    </figure>
  )
}
