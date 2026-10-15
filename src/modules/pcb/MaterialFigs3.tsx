import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Hit } from '../prep/common'
import { COLOR } from './FabFigs'
import { S } from './data/pcbMaterial'
import { LAM_OPTS, OZ_OPTS, type FoilId, type OzId } from './data/pcbMaterialCopper'
import { LAYER_BY_ID, ozToUm, type LayerKind } from './data/pcbMaterialLayers'
import { Weave } from './MaterialFigs'

const L = {
  thickTitle: loc('铜箔厚度（按比例）', 'Foil thickness (to scale)'),
  grainTitle: loc('晶粒结构（示意）', 'Grain structure (schematic)'),
  ed: loc('ED 电解铜', 'ED copper'),
  ra: loc('RA 压延铜', 'RA copper'),
  edSub: loc('晶粒竖立', 'Upright grains'),
  raSub: loc('晶粒平躺', 'Flat grains'),
  heat: loc('加热 + 加压', 'Heat + pressure'),
  foil: loc('外层铜箔', 'Outer copper foil'),
  foilSub: loc('0.5 oz，电镀在钻孔后', '0.5 oz, plated after drilling'),
  ppSub: loc('B 阶段树脂，不带铜', 'B-stage resin, no copper'),
  innerSub: loc('芯板表面蚀刻出的线路', 'Traces etched on the core'),
  coreSub: loc('C 阶段，已固化', 'C-stage, already cured'),
}

const SCALE = 1.2
const FOIL_COL = { x0: 20, w: 110, gap: 20, base: 190 }
const BROWN = '#a85f2c'

function zigzag(x: number, y: number, w: number, depth: number, step: number): string {
  const pts = [`${x},${y}`]
  for (let px = x; px < x + w; px += step) {
    pts.push(`${px + step / 2},${y + depth}`, `${Math.min(px + step, x + w)},${y}`)
  }
  return pts.join(' ')
}

function Grains({ x, y, w, h, foil }: { x: number; y: number; w: number; h: number; foil: FoilId }) {
  const out: ReactNode[] = []
  if (foil === 'ed') {
    for (let px = x + 7; px < x + w; px += 7) {
      out.push(<line key={px} x1={px} y1={y} x2={px} y2={y + h} stroke={BROWN} strokeWidth="0.9" />)
    }
    return <>{out}</>
  }
  for (let py = y + 6; py < y + h; py += 6) {
    out.push(<line key={py} x1={x} y1={py} x2={x + w} y2={py} stroke={BROWN} strokeWidth="0.9" />)
  }
  return <>{out}</>
}

export function CopperFig({ oz, foil, onOz, onFoil }: { oz: OzId; foil: FoilId; onOz: (id: OzId) => void; onFoil: (id: FoilId) => void }) {
  const { t } = useLocale()
  const px = (id: FoilId) => (id === 'ed' ? 430 : 590)
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 250" className="term-fig__svg" role="group" aria-label={t(S.copperCap)}>
        <rect width="760" height="250" rx="10" fill="var(--well)" />
        <text x="20" y="24" fill="var(--muted)" fontSize="11">
          {t(L.thickTitle)}
        </text>
        <text x="430" y="24" fill="var(--muted)" fontSize="11">
          {t(L.grainTitle)}
        </text>
        {OZ_OPTS.map((o, i) => {
          const x = FOIL_COL.x0 + i * (FOIL_COL.w + FOIL_COL.gap)
          const h = ozToUm(o.oz) * SCALE
          const top = FOIL_COL.base - h
          const on = oz === o.id
          return (
            <Hit key={o.id} label={t(o.label)} active={on} onPick={() => onOz(o.id)}>
              <rect x={x - 6} y="44" width={FOIL_COL.w + 12} height="196" rx="8" fill={on ? 'var(--gold-bg)' : 'var(--card)'} stroke={on ? 'var(--gold)' : 'var(--line)'} strokeWidth={on ? 2 : 1} />
              <rect x={x} y={FOIL_COL.base} width={FOIL_COL.w} height="40" fill={COLOR.core} />
              {foil === 'ed' ? <polygon points={zigzag(x, FOIL_COL.base, FOIL_COL.w, 4, 7)} fill={COLOR.cuPlated} /> : null}
              <rect x={x} y={top} width={FOIL_COL.w} height={h} fill={COLOR.cuPlated} />
              <Grains x={x} y={top} w={FOIL_COL.w} h={h} foil={foil} />
              <text x={x + FOIL_COL.w / 2} y={top - 22} textAnchor="middle" fill="var(--text)" fontSize="12" fontWeight="700">
                {t(o.label)}
              </text>
              <text x={x + FOIL_COL.w / 2} y={top - 8} textAnchor="middle" fill="var(--text-2)" fontSize="11">
                {`≈ ${ozToUm(o.oz)} µm`}
              </text>
            </Hit>
          )
        })}
        {(['ed', 'ra'] as FoilId[]).map((id) => {
          const x = px(id)
          const on = foil === id
          const grains: ReactNode[] = []
          if (id === 'ed') {
            for (let gx = x + 8; gx < x + 132; gx += 12) {
              grains.push(<rect key={gx} x={gx} y="70" width="12" height="56" fill={Math.round((gx - x) / 12) % 2 === 0 ? '#d08a4e' : COLOR.cuPlated} stroke={BROWN} strokeWidth="0.6" />)
            }
          } else {
            for (let r = 0; r < 5; r++) {
              for (let gx = x + 8 - (r % 2) * 18; gx < x + 132; gx += 36) {
                const gx0 = Math.max(gx, x + 8)
                const gx1 = Math.min(gx + 36, x + 132)
                grains.push(<rect key={`${r}-${gx}`} x={gx0} y={70 + r * 11.2} width={gx1 - gx0} height="11.2" fill={(r + Math.round((gx - x) / 36)) % 2 === 0 ? '#d08a4e' : COLOR.cuPlated} stroke={BROWN} strokeWidth="0.6" />)
              }
            }
          }
          return (
            <Hit key={id} label={t(id === 'ed' ? L.ed : L.ra)} active={on} onPick={() => onFoil(id)}>
              <rect x={x} y="40" width="140" height="190" rx="8" fill={on ? 'var(--gold-bg)' : 'var(--card)'} stroke={on ? 'var(--gold)' : 'var(--line)'} strokeWidth={on ? 2 : 1} />
              <rect x={x + 8} y="126" width="124" height="50" fill={COLOR.core} />
              {id === 'ed' ? <polygon points={zigzag(x + 8, 126, 124, 5, 12)} fill={COLOR.cuPlated} /> : null}
              {grains}
              <text x={x + 70} y="198" textAnchor="middle" fill="var(--text)" fontSize="11" fontWeight="700">
                {t(id === 'ed' ? L.ed : L.ra)}
              </text>
              <text x={x + 70} y="216" textAnchor="middle" fill="var(--text-2)" fontSize="10">
                {t(id === 'ed' ? L.edSub : L.raSub)}
              </text>
            </Hit>
          )
        })}
      </svg>
      <figcaption>{t(S.copperCap)}</figcaption>
    </figure>
  )
}

const LX0 = 30
const LX1 = 420
const INNER_TOP: Array<[number, number]> = [[60, 40], [130, 40], [200, 60], [290, 40], [350, 40]]
const INNER_BOT: Array<[number, number]> = [[40, 60], [120, 50], [210, 40], [280, 70], [370, 30]]
export const LAM_KINDS: LayerKind[] = ['cuOuter', 'prepreg', 'cuInner', 'core']

export function LaminateFig({ phase, active, onPick }: { phase: 'before' | 'after'; active: LayerKind; onPick: (k: LayerKind) => void }) {
  const { t } = useLocale()
  const before = phase === 'before'
  const gap = before ? 22 : 0
  const ppH = before ? 30 : 26
  const foilTopY = before ? 44 : 92
  const ppTopY = foilTopY + 10 + gap
  const inTopY = ppTopY + ppH + gap
  const coreY = inTopY + 10
  const inBotY = coreY + 70
  const ppBotY = inBotY + 10 + gap
  const foilBotY = ppBotY + ppH + gap
  const names: Record<LayerKind, string> = {
    silk: '',
    mask: '',
    finish: '',
    cuOuter: t(L.foil),
    prepreg: t(LAYER_BY_ID('prepreg').name),
    cuInner: t(LAYER_BY_ID('cuInner').name),
    core: t(LAYER_BY_ID('core').name),
  }
  const subs: Partial<Record<LayerKind, string>> = { cuOuter: t(L.foilSub), prepreg: t(L.ppSub), cuInner: t(L.innerSub), core: t(L.coreSub) }
  const targetY: Partial<Record<LayerKind, number>> = { cuOuter: foilTopY + 5, prepreg: ppTopY + ppH / 2, cuInner: inTopY + 5, core: coreY + 35 }
  const gate = (k: LayerKind) => (active === k ? 1 : 0.6)
  const wrap = (k: LayerKind, children: ReactNode) => (
    <Hit label={names[k]} active={active === k} onPick={() => onPick(k)}>
      <g opacity={gate(k)}>{children}</g>
    </Hit>
  )
  const traces = (spans: Array<[number, number]>, y: number) =>
    spans.map(([x, w]) => <rect key={`${y}-${x}`} x={x} y={y} width={w} height="10" fill={COLOR.cu} />)
  // 压合后树脂流进线路之间的空隙
  const fill = (spans: Array<[number, number]>, y: number) => {
    const out: ReactNode[] = []
    let cursor = LX0
    for (const [x, w] of [...spans, [LX1, 0] as [number, number]]) {
      if (x > cursor) {
        out.push(<rect key={`${y}-f${x}`} x={cursor} y={y} width={x - cursor} height="10" fill={COLOR.pp} />)
      }
      cursor = x + w
    }
    return out
  }
  const rowY = (i: number) => 74 + i * 54
  const phaseLabel = LAM_OPTS.find((o) => o.id === phase) ?? LAM_OPTS[0]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 350" className="term-fig__svg" role="group" aria-label={t(S.lamCap)}>
        <defs>
          <marker id="lamArrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L8 4 L0 8 Z" fill="var(--text-2)" />
          </marker>
        </defs>
        <rect width="760" height="350" rx="10" fill="var(--well)" />
        <text x={LX0} y="20" fill="var(--text)" fontSize="12" fontWeight="700">
          {t(phaseLabel.label)}
        </text>
        {wrap(
          'core',
          <>
            <rect x={LX0} y={coreY} width={LX1 - LX0} height="70" fill={COLOR.core} />
            <Weave y={coreY} h={70} x0={LX0} x1={LX1} />
          </>,
        )}
        {wrap(
          'prepreg',
          <>
            <rect x={LX0} y={ppTopY} width={LX1 - LX0} height={ppH} fill={COLOR.pp} />
            <rect x={LX0} y={ppBotY} width={LX1 - LX0} height={ppH} fill={COLOR.pp} />
            <Weave y={ppTopY} h={ppH} x0={LX0} x1={LX1} />
            <Weave y={ppBotY} h={ppH} x0={LX0} x1={LX1} />
            {before ? null : fill(INNER_TOP, inTopY)}
            {before ? null : fill(INNER_BOT, inBotY)}
          </>,
        )}
        {wrap('cuInner', <>{traces(INNER_TOP, inTopY)}{traces(INNER_BOT, inBotY)}</>)}
        {wrap(
          'cuOuter',
          <>
            <rect x={LX0} y={foilTopY} width={LX1 - LX0} height="10" fill={COLOR.cu} />
            <rect x={LX0} y={foilBotY} width={LX1 - LX0} height="10" fill={COLOR.cu} />
          </>,
        )}
        {before ? (
          <g pointerEvents="none">
            <line x1="225" y1="8" x2="225" y2={foilTopY - 6} stroke="var(--text-2)" strokeWidth="1.6" markerEnd="url(#lamArrow)" />
            <text x="236" y="26" fill="var(--text-2)" fontSize="11">
              {t(L.heat)}
            </text>
            <line x1="225" y1="346" x2="225" y2={foilBotY + 16} stroke="var(--text-2)" strokeWidth="1.6" markerEnd="url(#lamArrow)" />
          </g>
        ) : null}
        <g pointerEvents="none">
          {LAM_KINDS.map((k, i) => (
            <g key={k}>
              <circle cx={LX1 - 10} cy={targetY[k] ?? 0} r="2.5" fill="var(--text)" />
              <polyline points={`${LX1 - 10},${targetY[k] ?? 0} ${LX1 + 14},${targetY[k] ?? 0} 456,${rowY(i) + 20}`} fill="none" stroke="var(--text-2)" strokeWidth="1" opacity="0.7" />
            </g>
          ))}
        </g>
        {LAM_KINDS.map((k, i) => {
          const on = active === k
          return (
            <Hit key={k} label={names[k]} active={on} onPick={() => onPick(k)}>
              <rect x="460" y={rowY(i)} width="286" height="40" rx="6" fill={on ? 'var(--gold-bg)' : 'var(--card)'} stroke={on ? 'var(--gold)' : 'var(--line)'} strokeWidth={on ? 2 : 1} />
              <text x="474" y={rowY(i) + 17} fill={on ? 'var(--text)' : 'var(--text-2)'} fontSize="12" fontWeight="700">
                {names[k]}
              </text>
              <text x="474" y={rowY(i) + 32} fill="var(--muted)" fontSize="10">
                {subs[k] ?? ''}
              </text>
            </Hit>
          )
        })}
      </svg>
      <figcaption>{t(S.lamCap)}</figcaption>
    </figure>
  )
}
