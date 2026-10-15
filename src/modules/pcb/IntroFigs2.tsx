import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { Hit } from '../prep/common'
import { LEVELS, LEVEL_LABEL, type LevelId } from './data/pcbIntro'
import { C, Rects, Txt } from './IntroFigs'

const PW = 168
const PH = 168
const GAP = 24
const X0 = 8
const Y0 = 6
const W = '#e6edf3'
const BOARD = '#2e7d46'

function Zoom({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return <rect x={x} y={y} width={w} height={h} rx="3" fill="none" stroke="var(--gold)" strokeWidth="1.6" strokeDasharray="5 3" />
}

function Chip({ x, y, w, h, label }: { x: number; y: number; w: number; h: number; label?: string }) {
  return (
    <>
      <rect x={x} y={y} width={w} height={h} rx="2" fill={C.body} stroke="#4a525e" />
      {label ? (
        <Txt x={x + w / 2} y={y + h / 2 + 4} size={10} fill={W}>
          {label}
        </Txt>
      ) : null}
    </>
  )
}

function SystemPanel() {
  const { t } = useLocale()
  return (
    <>
      <rect x="12" y="14" width="144" height="144" rx="6" fill="none" stroke="var(--text-2)" strokeWidth="1.5" />
      <Chip x={20} y={22} w={52} h={34} label={t(LEVEL_LABEL.psu)} />
      <circle cx="122" cy="42" r="17" fill="none" stroke="var(--text-2)" strokeWidth="1.5" />
      {[0, 90, 180, 270].map((a) => (
        <ellipse key={a} cx="122" cy="34" rx="4" ry="8" fill="var(--text-2)" opacity="0.7" transform={`rotate(${a} 122 42)`} />
      ))}
      <Txt x={122} y={72}>{t(LEVEL_LABEL.fan)}</Txt>
      <path d="M46 56 V84 M108 53 V84" stroke="var(--text-2)" strokeWidth="1.5" fill="none" />
      <rect x="30" y="84" width="108" height="60" rx="3" fill={BOARD} stroke="#1f5a32" />
      <Txt x={84} y={118} fill={W}>PCB</Txt>
      <Zoom x={26} y={80} w={116} h={68} />
    </>
  )
}

function BoardPanel() {
  const { t } = useLocale()
  return (
    <>
      <rect x="8" y="20" width="152" height="132" rx="4" fill={BOARD} stroke="#1f5a32" />
      <Chip x={24} y={32} w={44} h={44} label={t(LEVEL_LABEL.mcu)} />
      <Chip x={84} y={32} w={44} h={24} label={t(LEVEL_LABEL.mem)} />
      <Chip x={136} y={70} w={24} h={40} label={t(LEVEL_LABEL.io)} />
      <Chip x={30} y={106} w={20} h={20} />
      <Chip x={58} y={108} w={22} h={16} />
      <Chip x={90} y={108} w={7} h={16} />
      <Chip x={102} y={108} w={7} h={16} />
      <Txt x={72} y={140} size={10} fill={W}>{t(LEVEL_LABEL.power)}</Txt>
      <Zoom x={20} y={96} w={104} h={50} />
    </>
  )
}

function ModulePanel() {
  const { t } = useLocale()
  return (
    <>
      <rect x="8" y="28" width="152" height="116" rx="4" fill={BOARD} stroke="#1f5a32" />
      <path d="M62 70 H80 M112 70 H120 M62 80 H72 V96 H150 V82" stroke={C.cu} strokeWidth="3" fill="none" />
      <Chip x={22} y={52} w={40} h={36} />
      <rect x="80" y="58" width="32" height="24" rx="2" fill="#6b7280" stroke="#4a525e" />
      <rect x="120" y="62" width="10" height="20" fill="#b8955a" />
      <rect x="138" y="62" width="10" height="20" fill="#b8955a" />
      <Zoom x={116} y={56} w={36} h={32} />
      <Txt x={42} y={118}>{t(LEVEL_LABEL.ic)}</Txt>
      <Txt x={96} y={118}>{t(LEVEL_LABEL.ind)}</Txt>
      <Txt x={134} y={118}>{t(LEVEL_LABEL.cap)}</Txt>
    </>
  )
}

function PartPanel() {
  const { t } = useLocale()
  return (
    <>
      <rect x="8" y="110" width="152" height="30" fill={BOARD} />
      <Rects spans={[[30, 66], [102, 138]]} y={104} h={6} fill={C.cu} />
      <rect x="56" y="78" width="56" height="26" fill="#a98f6c" />
      <rect x="50" y="78" width="8" height="26" fill={C.steel} />
      <rect x="110" y="78" width="8" height="26" fill={C.steel} />
      <path d="M32 104 Q44 102 50 86 V104 Z M136 104 Q124 102 118 86 V104 Z" fill={C.sn} />
      <Txt x={8} y={50} anchor="start">{t(LEVEL_LABEL.term)}</Txt>
      <path d="M30 56 L52 82" stroke="var(--muted)" fill="none" />
      <Txt x={100} y={50}>{t(LEVEL_LABEL.body)}</Txt>
      <path d="M84 55 V76" stroke="var(--muted)" fill="none" />
      <Txt x={166} y={70} anchor="end">{t(LEVEL_LABEL.solder)}</Txt>
      <path d="M150 75 L128 94" stroke="var(--muted)" fill="none" />
      <Txt x={48} y={162}>{t(LEVEL_LABEL.pad)}</Txt>
      <path d="M48 148 V112" stroke="var(--muted)" fill="none" />
    </>
  )
}

const PANELS: Record<LevelId, () => ReactNode> = {
  system: SystemPanel,
  board: BoardPanel,
  module: ModulePanel,
  part: PartPanel,
}

export function LevelFig({ active, onPick }: { active: LevelId; onPick: (id: LevelId) => void }) {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 222" className="term-fig__svg" role="group" aria-label={t(LEVEL_LABEL.caption)}>
        <defs>
          <marker id="introZoom" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L8 4 L0 8 Z" fill="var(--text-2)" />
          </marker>
        </defs>
        <rect width="760" height="222" rx="10" fill="var(--well)" />
        {LEVELS.map((lv, i) => {
          const ox = X0 + i * (PW + GAP)
          const on = active === lv.id
          const Panel = PANELS[lv.id]
          return (
            <g key={lv.id}>
              {i > 0 ? <line x1={ox - GAP + 3} y1={Y0 + PH / 2} x2={ox - 3} y2={Y0 + PH / 2} stroke="var(--text-2)" strokeWidth="1.6" markerEnd="url(#introZoom)" /> : null}
              <Hit label={t(lv.title)} active={on} onPick={() => onPick(lv.id)}>
                <rect x={ox} y={Y0} width={PW} height={PH} rx="8" fill="var(--card)" stroke={on ? 'var(--gold)' : 'var(--line)'} strokeWidth={on ? 2.5 : 1} />
                <g transform={`translate(${ox} ${Y0})`}>
                  <Panel />
                </g>
                <Txt x={ox + PW / 2} y={Y0 + PH + 18} size={12} fill={on ? 'var(--text)' : 'var(--text-2)'} bold>
                  {t(lv.title)}
                </Txt>
                <Txt x={ox + PW / 2} y={Y0 + PH + 33} size={9.5} fill="var(--muted)">
                  {t(lv.example)}
                </Txt>
              </Hit>
            </g>
          )
        })}
      </svg>
      <figcaption>{t(LEVEL_LABEL.caption)}</figcaption>
    </figure>
  )
}
