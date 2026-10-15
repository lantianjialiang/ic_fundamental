import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { Hit } from '../prep/common'
import { type ChanMode, type MosType, type SymStyle, type TermId, TERMS } from './data/mosIntro'
import { TERM_ARIA, TERM_FIG } from './data/mosIntroFig'

export function T({ x, y, children, anchor = 'middle', color = 'var(--text-2)', size = 11, bold = false, mono = false }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; color?: string; size?: number; bold?: boolean; mono?: boolean }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontWeight={bold ? 700 : 400} fontFamily={mono ? 'var(--mono, monospace)' : undefined}>
      {children}
    </text>
  )
}

const INK = 'var(--text)'
const GOLD = 'var(--gold)'

/** 符号局部坐标：栅线在 x=0，D/S 引线在 x=80，体极引线伸到 x=110；高 120 */
export const TERM_POS: Record<TermId, [number, number]> = { g: [0, 60], d: [80, 0], s: [80, 120], b: [110, 60] }

type SymProps = {
  type: MosType
  style: SymStyle
  mode: ChanMode
  hi?: TermId | null
  chanColor?: string
  labels?: boolean
}

/**
 * MOS 符号。NMOS：D 在上、S 在下，体极箭头指向沟道；
 * PMOS：整体上下翻转（S 在上、D 在下），箭头从沟道指向外。
 * 增强型沟道画成断开的三段，耗尽型画成一条实线。
 * 3 端：体极引线折到源极；4 端：体极单独引到右侧。
 */
export function MosSymbol({ type, style, mode, hi = null, chanColor, labels = true }: SymProps) {
  const col = (id: TermId) => (hi === id ? GOLD : INK)
  const flip = type === 'p'
  const chan = chanColor ?? INK
  const arrow = type === 'n' ? '50,60 62,55 62,65' : '62,60 50,55 50,65'
  const top = type === 'n' ? 'D' : 'S'
  const bottom = type === 'n' ? 'S' : 'D'
  const four = style === 'four'
  return (
    <g fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <g transform={flip ? 'translate(0 120) scale(1 -1)' : undefined}>
        <path d="M0 60 H40 M40 30 V90" stroke={col('g')} />
        <path d={mode === 'enh' ? 'M50 28 V44 M50 52 V68 M50 76 V92' : 'M50 28 V92'} stroke={chan} />
        <path d="M50 36 H80 V0" stroke={col(flip ? 's' : 'd')} />
        <path d="M50 84 H80 V120" stroke={col(flip ? 'd' : 's')} />
        <path d={four ? 'M50 60 H110' : 'M50 60 H80 V84'} stroke={four ? col('b') : INK} />
        <polygon points={arrow} fill={four ? col('b') : INK} stroke="none" />
      </g>
      {labels ? (
        <g fill={INK} stroke="none" fontSize="13" fontWeight="700">
          <text x={-8} y={65} textAnchor="end">
            G
          </text>
          <text x={80} y={-8} textAnchor="middle">
            {top}
          </text>
          <text x={80} y={136} textAnchor="middle">
            {bottom}
          </text>
          {four ? (
            <text x={118} y={65} textAnchor="start">
              B
            </text>
          ) : null}
        </g>
      ) : null}
    </g>
  )
}

const ROW_Y = (k: number) => 48 + k * 52

export function TermFig({ term, onPick }: { term: TermId; onPick: (id: TermId) => void }) {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 280" className="term-fig__svg" role="img" aria-label={t(TERM_FIG.title)}>
        <rect width="760" height="280" rx="10" fill="var(--well)" />
        <rect x="10" y="10" width="310" height="260" rx="8" fill="var(--card)" stroke="var(--line)" />
        <rect x="330" y="10" width="420" height="260" rx="8" fill="var(--card)" stroke="var(--line)" />
        <T x={26} y={32} anchor="start" size={12} bold>
          {t(TERM_FIG.title)}
        </T>
        <g transform="translate(110 56) scale(1.5)">
          <MosSymbol type="n" style="four" mode="enh" hi={term} labels={false} />
          {TERMS.map((item) => {
            const [x, y] = TERM_POS[item.id]
            const active = term === item.id
            return (
              <Hit key={item.id} label={t(TERM_ARIA(item.name))} active={active} onPick={() => onPick(item.id)}>
                <circle cx={x} cy={y} r="9" fill={active ? GOLD : 'var(--card)'} stroke={active ? GOLD : 'var(--line-2)'} strokeWidth="1.5" />
                <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={active ? 'var(--bg, #111)' : INK}>
                  {item.name}
                </text>
              </Hit>
            )
          })}
        </g>
        {TERMS.map((item, k) => {
          const active = term === item.id
          const y = ROW_Y(k)
          return (
            <Hit key={item.id} label={t(TERM_ARIA(item.name))} active={active} onPick={() => onPick(item.id)}>
              <rect x="346" y={y} width="388" height="40" rx="8" fill={active ? 'var(--gold-bg-2)' : 'var(--fig-box-2)'} stroke={active ? GOLD : 'var(--line-2)'} />
              <circle cx="372" cy={y + 20} r="12" fill={active ? GOLD : 'var(--card)'} stroke={active ? GOLD : 'var(--line-2)'} />
              <T x={372} y={y + 24} color={active ? 'var(--bg, #111)' : INK} size={12} bold>
                {item.name}
              </T>
              <T x={396} y={y + 24} anchor="start" color={INK} size={12}>
                {t(TERM_FIG.brief[item.id])}
              </T>
            </Hit>
          )
        })}
      </svg>
      <figcaption>{t(TERM_FIG.cap)}</figcaption>
    </figure>
  )
}
