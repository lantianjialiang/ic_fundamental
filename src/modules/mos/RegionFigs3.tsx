import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './data/mosRegionFig'
import { REGION_COLOR, T, regionName } from './RegionFigs'
import { nRegion, type Region } from './model'

const W = 760
const H = 240

function Arrow({ d, head, dir, on }: { d: string; head: [number, number]; dir: 'down' | 'right'; on: boolean }) {
  const color = on ? 'var(--text)' : 'var(--line-3)'
  const [x, y] = head
  const tri = dir === 'down' ? `${x - 4},${y - 7} ${x + 4},${y - 7} ${x},${y}` : `${x - 7},${y - 4} ${x - 7},${y + 4} ${x},${y}`
  return (
    <g stroke={color} fill={color} opacity={on ? 1 : 0.6}>
      <path d={d} fill="none" strokeWidth={on ? 2.5 : 1.5} />
      <polygon points={tri} stroke="none" />
    </g>
  )
}

function Decide({ x, y, w, text, on }: { x: number; y: number; w: number; text: string; on: boolean }) {
  return (
    <g opacity={on ? 1 : 0.45}>
      <rect x={x} y={y} width={w} height="40" rx="8" fill="var(--card)" stroke={on ? 'var(--text)' : 'var(--line-2)'} strokeWidth={on ? 2.5 : 1.5} />
      <T x={x + w / 2} y={y + 25} size={13} color="var(--text)" mono>{text}</T>
    </g>
  )
}

function Result({ x, id, formula, line, active }: { x: number; id: Region; formula: string; line: string; active: boolean }) {
  const { t } = useLocale()
  const color = REGION_COLOR[id]
  return (
    <g opacity={active ? 1 : 0.45}>
      <rect x={x} y="156" width="200" height="70" rx="8" fill={active ? color : 'var(--card)'} fillOpacity={active ? 0.14 : 1} stroke={active ? color : 'var(--line-2)'} strokeWidth={active ? 3 : 1.5} />
      <T x={x + 100} y={178} size={13} color={active ? color : 'var(--muted)'} bold>{t(regionName(id))}</T>
      <T x={x + 100} y={196} size={11} color="var(--text)" mono>{formula}</T>
      <T x={x + 100} y={214} size={10} color="var(--muted)">{line}</T>
    </g>
  )
}

export function FlowFig({ vgs, vds }: { vgs: number; vds: number }) {
  const { t } = useLocale()
  const region = nRegion(vgs, vds)
  const reachD2 = region !== 'cutoff'

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${W} ${H}`} className="term-fig__svg" role="img" aria-label={t(FIG.flowAria)}>
        <rect width={W} height={H} rx="10" fill="var(--well)" />
        <rect x="20" y="14" width="200" height="40" rx="8" fill="var(--card)" stroke="var(--text)" strokeWidth="2.5" />
        <T x={120} y={39} size={12} color="var(--text)">{t(FIG.flowStart)}</T>
        <Arrow d="M120 54 V79" head={[120, 86]} dir="down" on />

        <Decide x={20} y={86} w={200} text="Vgs ≤ Vth ?" on />
        <Decide x={280} y={86} w={200} text="Vds < Vov ?" on={reachD2} />

        <Arrow d="M120 126 V149" head={[120, 156]} dir="down" on={region === 'cutoff'} />
        <T x={128} y={146} anchor="start" size={11} color="var(--muted)">{t(FIG.yes)}</T>
        <Arrow d="M220 106 H273" head={[280, 106]} dir="right" on={reachD2} />
        <T x={250} y={98} size={11} color="var(--muted)">{t(FIG.no)}</T>

        <Arrow d="M380 126 V149" head={[380, 156]} dir="down" on={region === 'linear'} />
        <T x={388} y={146} anchor="start" size={11} color="var(--muted)">{t(FIG.yes)}</T>
        <Arrow d="M480 106 H640 V149" head={[640, 156]} dir="down" on={region === 'sat'} />
        <T x={560} y={98} size={11} color="var(--muted)">{t(FIG.no)}</T>

        <Result x={20} id="cutoff" formula="Id ≈ 0" line={t(FIG.cutoffLine)} active={region === 'cutoff'} />
        <Result x={280} id="linear" formula="Id ≈ k·Vov·Vds" line={t(FIG.linearLine)} active={region === 'linear'} />
        <Result x={540} id="sat" formula="Id = k/2·Vov²" line={t(FIG.satLine)} active={region === 'sat'} />
      </svg>
      <figcaption>{t(FIG.flowCap)}</figcaption>
    </figure>
  )
}
