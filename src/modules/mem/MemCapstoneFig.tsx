import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { BIN_LABEL, FIG } from './memCapstoneData'
import { type Bin, BIN_NO, type Outcome, SIDE, SIZE, BATCH } from './memCapstoneModel'

const CELL = 24
const PAD = 10
const ARRAY_SIZE = PAD * 2 + CELL * SIDE

/** 单颗器件的 8×8 阵列：红色为功能测试读错的地址，金色为保持测试读回 0 的单元 */
export function ArrayFig({ outcome }: { outcome: Outcome }) {
  const { t } = useLocale()
  const failed = new Set<number>(outcome.march === null ? [] : outcome.march.failAddrs)
  const weak = new Set<number>(outcome.weakCells)
  const colorOf = (addr: number): string => {
    if (failed.has(addr)) {
      return 'var(--red)'
    }
    if (weak.has(addr)) {
      return 'var(--gold)'
    }
    return 'var(--fig-box)'
  }
  const cells: ReactNode[] = []
  for (let addr = 0; addr < SIZE; addr += 1) {
    const row = Math.floor(addr / SIDE)
    const col = addr % SIDE
    cells.push(
      <rect
        key={addr}
        x={PAD + col * CELL + 1}
        y={PAD + row * CELL + 1}
        width={CELL - 2}
        height={CELL - 2}
        rx="3"
        fill={colorOf(addr)}
        stroke={failed.has(addr) || weak.has(addr) ? 'none' : 'var(--line-2)'}
      >
        <title>{t(FIG.cellAddr(addr))}</title>
      </rect>,
    )
  }
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${ARRAY_SIZE} ${ARRAY_SIZE}`} className="term-fig__svg" role="img" aria-label={t(FIG.arrayAria)}>
        <rect width={ARRAY_SIZE} height={ARRAY_SIZE} rx="10" fill="var(--well)" />
        {cells}
      </svg>
      <figcaption>{t(FIG.arrayCap)}</figcaption>
    </figure>
  )
}

const T_MAX_NS = 12
const X0 = 20
const X1 = 340

/** 访问时间横条与时序限值：条的末端越过竖线即时序失败 */
export function TimingFig({ tAcc, limit }: { tAcc: number; limit: number }) {
  const { t } = useLocale()
  const scale = (X1 - X0) / T_MAX_NS
  const ok = tAcc <= limit
  const barLen = Math.min(tAcc, T_MAX_NS) * scale
  const limitX = X0 + Math.min(limit, T_MAX_NS) * scale
  const accText = `tAcc ${tAcc.toFixed(2)} ns`
  const limitText = `${t(loc('限值', 'Limit'))} ${limit.toFixed(1)} ns`
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 360 84" className="term-fig__svg" role="img" aria-label={t(FIG.timingAria)}>
        <rect width="360" height="84" rx="10" fill="var(--well)" />
        <text x={X0} y={16} fill={ok ? 'var(--green)' : 'var(--red)'} fontSize="11" fontFamily="var(--mono)">
          {accText}
        </text>
        <text x={X1} y={16} textAnchor="end" fill="var(--gold)" fontSize="11" fontFamily="var(--mono)">
          {limitText}
        </text>
        <rect x={X0} y={30} width={barLen} height={22} rx="3" fill={ok ? 'var(--green)' : 'var(--red)'} />
        <line x1={limitX} x2={limitX} y1={24} y2={58} stroke="var(--gold)" strokeWidth="2" />
        <line x1={X0} x2={X1} y1={64} y2={64} stroke="var(--line-2)" strokeWidth="1" />
        <text x={X0} y={78} fill="var(--muted)" fontSize="9" fontFamily="var(--mono)">
          0 ns
        </text>
        <text x={X1} y={78} textAnchor="end" fill="var(--muted)" fontSize="9" fontFamily="var(--mono)">
          {`${T_MAX_NS} ns`}
        </text>
      </svg>
      <figcaption>{t(FIG.timingCap)}</figcaption>
    </figure>
  )
}

const BINS: Bin[] = ['pass', 'timing', 'functional', 'retention']
const BASE_Y = 106
const MAX_H = 66

/** 批次的 Bin 分布：四根柱子，柱顶标出器件数 */
export function BinFig({ counts }: { counts: Record<Bin, number> }) {
  const { t } = useLocale()
  const bars: ReactNode[] = []
  BINS.forEach((bin, index) => {
    const n = counts[bin]
    const h = (n / BATCH) * MAX_H
    const cx = 50 + index * 100
    const fill = bin === 'pass' ? 'var(--green)' : 'var(--red)'
    bars.push(
      <g key={bin}>
        <rect x={cx - 22} y={BASE_Y - h} width="44" height={h} rx="3" fill={fill} />
        <text x={cx} y={BASE_Y - h - 5} textAnchor="middle" fill="var(--text)" fontSize="11" fontFamily="var(--mono)">
          {String(n)}
        </text>
        <text x={cx} y={122} textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
          {`Bin ${BIN_NO[bin]}`}
        </text>
        <text x={cx} y={137} textAnchor="middle" fill="var(--muted)" fontSize="9">
          {t(BIN_LABEL[bin])}
        </text>
      </g>,
    )
  })
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 400 146" className="term-fig__svg" role="img" aria-label={t(FIG.binAria)}>
        <rect width="400" height="146" rx="10" fill="var(--well)" />
        <line x1="20" x2="380" y1={BASE_Y} y2={BASE_Y} stroke="var(--line-2)" strokeWidth="1" />
        {bars}
      </svg>
      <figcaption>{t(FIG.binCap)}</figcaption>
    </figure>
  )
}
