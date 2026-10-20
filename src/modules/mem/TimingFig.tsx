import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { type DeviceId, SHMOO_PERIODS, SHMOO_STROBES, shmooPass, tAAOf, windowOf } from './memTimingModel'

/* 读数据有效窗口：横向时间条 */
const CW = 480
const CH = 132
const X0 = 40
const XW = 420
/** 横轴上限固定为 14.5 ns，所有周期的窗口都落在图内，比例尺不随设置变化 */
const T_MAX = 14.5
const TOP = 40
const AXIS_Y = 100
const WAVE_TICKS = [0, 2, 4, 6, 8, 10, 12, 14]

const K = XW / T_MAX

function xOf(t: number): number {
  return X0 + t * K
}

const WAVE = {
  aria: loc(
    '读数据有效窗口：绿色带是 tAA 到 T + tOH 之间的有效数据，采样线落在带内即 PASS',
    'Read data-valid window: the green band is valid data from tAA to T + tOH; a strobe line inside the band means PASS',
  ),
  cap: loc(
    '绿色带是有效窗口 [tAA, T + tOH]。左侧实线是地址改变（t = 0）；中间的虚线是下一个地址改变的时刻 T；右侧实线是 T + tOH。',
    'The green band is the valid window [tAA, T + tOH]. The solid line on the left is the address change at t = 0; the dashed line is the next address change at T; the solid line on the right is T + tOH.',
  ),
  strobe: loc('采样', 'Strobe'),
  unit: loc('ns，时间单位', 'ns, time unit'),
}

/** 一张时序条：窗口、采样线与刻度；采样线的颜色由窗口判定 */
export function WaveFig({ tAA, period, strobe }: { tAA: number; period: number; strobe: number }) {
  const { t } = useLocale()
  const win = windowOf(tAA, period)
  const pass = strobe >= win.lo && strobe <= win.hi
  const sx = xOf(strobe)
  const strobeText = `${t(WAVE.strobe)} ${String(Number(strobe.toFixed(2)))} ns`
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${CW} ${CH}`} className="mem-fig mtim-wave" role="img" aria-label={t(WAVE.aria)}>
        <rect x={X0} y={TOP} width={xOf(win.lo) - X0} height={AXIS_Y - TOP} className="mtim-bad" />
        <rect x={xOf(win.lo)} y={TOP} width={xOf(win.hi) - xOf(win.lo)} height={AXIS_Y - TOP} className="mtim-valid" />
        <rect x={xOf(win.hi)} y={TOP} width={X0 + XW - xOf(win.hi)} height={AXIS_Y - TOP} className="mtim-bad" />
        <line x1={X0} y1={AXIS_Y} x2={X0 + XW} y2={AXIS_Y} className="mtim-axis" />
        {WAVE_TICKS.map((tick) => (
          <g key={tick}>
            <line x1={xOf(tick)} y1={AXIS_Y} x2={xOf(tick)} y2={AXIS_Y + 4} className="mtim-axis" />
            <text x={xOf(tick)} y={AXIS_Y + 16} textAnchor="middle" className="mem-fig-text">
              {String(tick)}
            </text>
          </g>
        ))}
        <text x={X0 + XW} y={AXIS_Y + 30} textAnchor="end" className="mem-fig-text">
          {t(WAVE.unit)}
        </text>
        <line x1={X0} y1={TOP - 6} x2={X0} y2={AXIS_Y} className="mtim-edge" />
        <line x1={xOf(period)} y1={TOP} x2={xOf(period)} y2={AXIS_Y} className="mtim-next" />
        <line x1={xOf(win.lo)} y1={TOP - 6} x2={xOf(win.lo)} y2={AXIS_Y} className="mtim-edge" />
        <line x1={xOf(win.hi)} y1={TOP - 6} x2={xOf(win.hi)} y2={AXIS_Y} className="mtim-edge" />
        <line x1={sx} y1={TOP - 6} x2={sx} y2={AXIS_Y} className={pass ? 'mtim-strobe is-pass' : 'mtim-strobe is-fail'} />
        <text x={sx} y={18} textAnchor="middle" className={pass ? 'mtim-strobe-label is-pass' : 'mtim-strobe-label is-fail'}>
          {strobeText}
        </text>
      </svg>
      <figcaption>{t(WAVE.cap)}</figcaption>
    </figure>
  )
}

/* Shmoo：周期 × 采样点的通过图 */
const SHMOO_CELL_W = 36
const SHMOO_CELL_H = 11
const SHMOO_X0 = 44
const SHMOO_Y0 = 18

const SHMOO = {
  aria: loc(
    'Shmoo 图：横轴周期，纵轴采样点，绿色格子 PASS，灰色 FAIL，方框是当前设置',
    'Shmoo map: period on the horizontal axis, strobe on the vertical axis; green cells pass, grey cells fail, and the box marks the current setting',
  ),
  cap: loc(
    '每个格子是一次测量。纵轴是采样点 s（ns），数值从上往下递减；横轴是周期 T（ns）。方框是当前周期与最接近的整数采样点。',
    'Each cell is one measurement. The vertical axis is strobe s (ns), with values decreasing from top to bottom; the horizontal axis is period T (ns). The box marks the current period and the nearest whole-ns strobe.',
  ),
  axisY: loc('s（ns）', 's (ns)'),
  axisX: loc('周期 T（ns）', 'Period T (ns)'),
}

/** Shmoo 网格：每个格子是一次测量，颜色由模型的通过条件算出 */
export function ShmooFig({ device, strobe, period }: { device: DeviceId; strobe: number; period: number }) {
  const { t } = useLocale()
  const tAA = tAAOf(device)
  const cols = SHMOO_PERIODS.length
  const rows = SHMOO_STROBES.length
  const width = SHMOO_X0 + cols * SHMOO_CELL_W + 8
  const height = SHMOO_Y0 + rows * SHMOO_CELL_H + 40
  const curRow = Math.round(strobe)
  const curCol = SHMOO_PERIODS.indexOf(period)
  const showCur = curCol >= 0 && curRow >= 0 && curRow < rows
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${width} ${height}`} className="mtim-shmoo" role="img" aria-label={t(SHMOO.aria)}>
        <text x={4} y={12} className="mem-fig-text">
          {t(SHMOO.axisY)}
        </text>
        {SHMOO_STROBES.map((_, index) => {
          const s = SHMOO_STROBES[rows - 1 - index]
          const y = SHMOO_Y0 + index * SHMOO_CELL_H
          return (
            <g key={index}>
              {SHMOO_PERIODS.map((p, col) => {
                const pass = shmooPass(tAA, p, s)
                return (
                  <rect
                    key={col}
                    x={SHMOO_X0 + col * SHMOO_CELL_W}
                    y={y}
                    width={SHMOO_CELL_W - 1}
                    height={SHMOO_CELL_H - 1}
                    className={pass ? 'mtim-cell is-pass' : 'mtim-cell is-fail'}
                  />
                )
              })}
              {s % 2 === 0 ? (
                <text x={SHMOO_X0 - 6} y={y + SHMOO_CELL_H - 2} textAnchor="end" className="mem-fig-text">
                  {String(s)}
                </text>
              ) : null}
            </g>
          )
        })}
        {showCur ? (
          <rect
            x={SHMOO_X0 + curCol * SHMOO_CELL_W}
            y={SHMOO_Y0 + (rows - 1 - curRow) * SHMOO_CELL_H}
            width={SHMOO_CELL_W - 1}
            height={SHMOO_CELL_H - 1}
            className="mtim-cur"
          />
        ) : null}
        {SHMOO_PERIODS.map((p, col) => (
          <text
            key={col}
            x={SHMOO_X0 + col * SHMOO_CELL_W + (SHMOO_CELL_W - 1) / 2}
            y={SHMOO_Y0 + rows * SHMOO_CELL_H + 14}
            textAnchor="middle"
            className="mem-fig-text"
          >
            {String(p)}
          </text>
        ))}
        <text x={SHMOO_X0 + (cols * SHMOO_CELL_W) / 2} y={height - 4} textAnchor="middle" className="mem-fig-text">
          {t(SHMOO.axisX)}
        </text>
      </svg>
      <figcaption>{t(SHMOO.cap)}</figcaption>
    </figure>
  )
}
