import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Diagram } from './FlowVisuals'

const DIES = Array.from({ length: 81 }, (_, i) => ({ i, x: i % 9 - 4, y: Math.floor(i / 9) - 4 }))
  .filter(({ x, y }) => Math.hypot(Math.abs(x) + .5, Math.abs(y) + .5) < 4.65)
const EVEN = [...DIES].sort((a, b) => ((a.i * 29) % 83) - ((b.i * 29) % 83))
const CLUSTERS = [...DIES].sort((a, b) => {
  const distance = (x: number, y: number) => Math.min(Math.hypot(x + 2, y - 1), Math.hypot(x - 2, y + 2))
  return distance(a.x, a.y) - distance(b.x, b.y)
})
const OFFSETS = [[-4, -3], [3, -2], [1, 4]]

export function YieldPatternFig({ model, ad, yieldRate }: { model: string; ad: number; yieldRate: number }) {
  const { t } = useLocale()
  const total = Math.round(DIES.length * ad)
  const hits = Array.from({ length: total }, (_, i) => model === 'nb' ? CLUSTERS[Math.floor(i / 3)]
    : model === 'mur' ? EVEN[Math.floor(i * .8)] : EVEN[i])
  const counts = new Map<number, number>()
  for (const hit of hits) counts.set(hit.i, (counts.get(hit.i) ?? 0) + 1)
  const title = loc('同样的缺陷数，可能落在不同数量的裸片上', 'Equal defect counts can affect different numbers of dies')
  return (
    <Diagram title={title} caption={loc('圆点和裸片数用于说明分布为何会影响良率。旁边的模型良率由 AD 和模型公式计算。', 'The dots illustrate why spatial distribution changes yield. The model yield is calculated from AD using the selected formula.')}>
      <svg viewBox="0 0 380 217" className="flow-technical-svg" role="img" aria-label={t(title)} data-yield-pattern={model} data-hits={total}>
        <circle cx="107" cy="107" r="87" fill="#203b54" stroke="#91adc3" strokeWidth="2" />
        {DIES.map(({ i, x, y }) => {
          const n = counts.get(i) ?? 0
          const px = 107 + x * 18
          const py = 107 + y * 18
          return <g key={i} data-hit-die={n > 0}>
            <rect x={px - 8} y={py - 8} width="16" height="16" rx="2" fill={n ? '#674b3d' : '#347a75'} />
            {OFFSETS.slice(0, n).map(([dx, dy], index) => <circle key={index} cx={px + dx} cy={py + dy} r="2.4" fill="#ffda82" />)}
          </g>
        })}
        <text x="212" y="62">{t(loc('示意缺陷数', 'Example defects'))} · {total}</text>
        <text x="212" y="93">{t(loc('有缺陷裸片', 'Affected dies'))} · {counts.size}</text>
        <text x="212" y="124">AD = {ad.toFixed(1)}</text>
        <text x="212" y="155">{t(loc('模型良率', 'Model yield'))} · {(100 * yieldRate).toFixed(2)}%</text>
      </svg>
    </Diagram>
  )
}
