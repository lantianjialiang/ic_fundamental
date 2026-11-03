import { useLocale } from '../../i18n/LocaleContext'
import { Hit } from '../prep/common'
import { BLOCK_FIG, S, fill } from './picOverviewData'
import { BLOCK_IDS, type BlockId } from './picOverviewModel'

const BG = '#0d1117'
const BOX = '#161b22'
const EDGE = '#3d4756'
const TEXT = '#c9d1d9'
const MUTED = '#8b949e'
const GOLD = '#e8c45a'

const W = 720
const H = 132
const BOX_W = 163
const BOX_H = 78
const GAP = 12
const X0 = 16
const Y0 = 28

export function PicOverviewFig({ block, onPick }: { block: BlockId; onPick: (id: BlockId) => void }) {
  const { t } = useLocale()
  const name = t(BLOCK_FIG[block].title)
  return (
    <figure className="pic-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t(fill(S.figAria, { name }))} className="pic-svg">
        <rect width={W} height={H} rx={10} fill={BG} />
        {BLOCK_IDS.map((id, index) => {
          const x = X0 + index * (BOX_W + GAP)
          const active = id === block
          const title = t(BLOCK_FIG[id].title)
          const sub = t(BLOCK_FIG[id].sub)
          return (
            <Hit key={id} label={t(fill(S.hitAria, { name: title }))} active={active} onPick={() => onPick(id)}>
              <rect x={x} y={Y0} width={BOX_W} height={BOX_H} rx={8} fill={active ? '#242018' : BOX} stroke={active ? GOLD : EDGE} strokeWidth={active ? 2.5 : 1} />
              <text x={x + BOX_W / 2} y={Y0 + 32} textAnchor="middle" fill={TEXT} fontSize={13}>
                {title}
              </text>
              <text x={x + BOX_W / 2} y={Y0 + 54} textAnchor="middle" fill={MUTED} fontSize={11}>
                {sub}
              </text>
            </Hit>
          )
        })}
      </svg>
      <p className="pic-summary">{t(fill(S.figSelected, { name }))}</p>
    </figure>
  )
}
