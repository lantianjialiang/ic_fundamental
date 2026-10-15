import { useLocale } from '../../i18n/LocaleContext'
import { keyPick } from '../prep/common'
import { ERRORS, type ErrorId } from './data/pcbDfmErrors'
import { M } from './data/pcbDfmMore'
import { PCB } from './DfmFigs'
import { BoardArt } from './DfmFigs2'

type Rect = { x: number; y: number; w: number; h: number }

// 与 ERRORS 同序；每个区域盖住对应的元件，Fiducial 缺失盖在两个空角上
const HOT: Array<{ id: ErrorId; rects: Rect[] }> = [
  { id: 'pitch', rects: [{ x: 516, y: 44, w: 112, h: 72 }] },
  { id: 'silk', rects: [{ x: 448, y: 116, w: 64, h: 40 }] },
  { id: 'ring', rects: [{ x: 92, y: 112, w: 146, h: 36 }] },
  { id: 'tp', rects: [{ x: 400, y: 158, w: 280, h: 56 }] },
  {
    id: 'fid',
    rects: [
      { x: 24, y: 24, w: 52, h: 52 },
      { x: 684, y: 322, w: 54, h: 46 },
    ],
  },
  { id: 'edge', rects: [{ x: 58, y: 340, w: 104, h: 34 }] },
  { id: 'thermal', rects: [{ x: 404, y: 262, w: 136, h: 82 }] },
  { id: 'acid', rects: [{ x: 110, y: 205, w: 110, h: 70 }] },
  { id: 'polar', rects: [{ x: 80, y: 44, w: 60, h: 42 }] },
  { id: 'vip', rects: [{ x: 228, y: 262, w: 84, h: 86 }] },
]

export function BoardFig({ seen, showAll, last, onPick }: { seen: ErrorId[]; showAll: boolean; last: ErrorId | null; onPick: (id: ErrorId) => void }) {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 390" className="term-fig__svg" role="group" aria-label={t(M.boardAria)}>
        <rect width="760" height="390" rx="10" fill="var(--well)" />
        <BoardArt />
        {HOT.map((spot, idx) => {
          const shown = showAll || seen.includes(spot.id)
          const no = ERRORS.findIndex((e) => e.id === spot.id) + 1
          const first = spot.rects[0]
          const pick = () => onPick(spot.id)
          return (
            <g key={spot.id} role="button" tabIndex={0} aria-label={`${t(M.boardRegion)} ${idx + 1}`} aria-pressed={seen.includes(spot.id)} className="pcbDfm-hot" onClick={pick} onKeyDown={keyPick(pick)}>
              {spot.rects.map((r, k) => (
                <rect key={k} x={r.x} y={r.y} width={r.w} height={r.h} rx="6" fill={shown ? 'var(--red)' : 'transparent'} fillOpacity={shown ? 0.14 : 1} stroke={shown ? 'var(--red)' : 'none'} strokeWidth={last === spot.id ? 3 : 1.6} />
              ))}
              {shown ? (
                <g>
                  <circle cx={first.x + first.w} cy={first.y} r="9" fill="var(--red)" />
                  <text x={first.x + first.w} y={first.y + 4} textAnchor="middle" fill="#fff" fontSize="11" fontWeight="700">
                    {no}
                  </text>
                </g>
              ) : null}
            </g>
          )
        })}
      </svg>
      <figcaption>{t(M.boardCap)}</figcaption>
    </figure>
  )
}

/* ---------- 针床探针与测试点：三种情况 ---------- */

const PROBES = [
  { cx: 130, tone: 'var(--green)', label: M.probeGood },
  { cx: 380, tone: 'var(--red)', label: M.probeMask },
  { cx: 625, tone: 'var(--red)', label: M.probeSmall },
]
const TIP_Y = 106

function Probe({ cx }: { cx: number }) {
  return (
    <g>
      <rect x={cx - 10} y={140} width={20} height={58} fill={PCB.steel} stroke="var(--text-2)" strokeWidth="1" />
      <polygon points={`${cx - 6},140 ${cx - 6},124 ${cx},${TIP_Y} ${cx + 6},124 ${cx + 6},140`} fill={PCB.lead} stroke="var(--text-2)" strokeWidth="1" />
    </g>
  )
}

export function ProbeFig() {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 250" className="term-fig__svg" role="img" aria-label={t(M.probeAria)}>
        <rect width="760" height="250" rx="10" fill="var(--well)" />
        <rect x={20} y={62} width={720} height={34} fill={PCB.core} />
        <rect x={110} y={96} width={40} height={10} fill={PCB.copper} />
        <rect x={360} y={96} width={40} height={8} fill={PCB.copper} />
        <rect x={600} y={96} width={14} height={10} fill={PCB.copper} />
        <rect x={20} y={96} width={80} height={8} fill={PCB.mask} />
        <rect x={160} y={96} width={435} height={8} fill={PCB.mask} />
        <rect x={620} y={96} width={120} height={8} fill={PCB.mask} />
        <rect x={356} y={96} width={48} height={10} fill={PCB.mask} />
        <rect x={20} y={198} width={720} height={16} fill="var(--fig-box-2)" stroke="var(--line-2)" />
        {PROBES.map((p) => (
          <Probe key={p.cx} cx={p.cx} />
        ))}
        <text x={380} y={50} textAnchor="middle" fill="var(--text-2)" fontSize="12">
          {t(M.probeBoard)}
        </text>
        <text x={255} y={172} textAnchor="middle" fill="var(--text-2)" fontSize="12">
          {t(M.probeProbe)}
        </text>
        <text x={255} y={210} textAnchor="middle" fill="var(--muted)" fontSize="11">
          {t(M.probePlate)}
        </text>
        {PROBES.map((p) => (
          <text key={p.cx} x={p.cx} y={238} textAnchor="middle" fill={p.tone} fontSize="12" fontWeight="600">
            {t(p.label)}
          </text>
        ))}
      </svg>
      <figcaption>{t(M.probeCap)}</figcaption>
    </figure>
  )
}