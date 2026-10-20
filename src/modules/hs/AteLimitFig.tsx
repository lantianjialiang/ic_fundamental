import { useEffect, useRef } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { S } from './ateLimitData'
import {
  EYE_START,
  EYE_TRACES,
  LEVEL_MV,
  MASK_FLAT_UI,
  MASK_HALF_UI,
  MASK_MV,
  NYQUIST_GHZ,
  SPU,
  inMask,
  responseDb,
  type AteState,
} from './ateLimitModel'

const CW = 360
const CH = 240
const PAD_L = 42
const PAD_R = 12
const PAD_T = 12
const PAD_B = 28
/** 纵轴范围 ±VMAX mV */
const VMAX = 500
const PLOT_W = CW - PAD_L - PAD_R
const PLOT_H = CH - PAD_T - PAD_B

/** 2 UI 的横轴：0–2 UI 映射到绘图区宽度 */
const xOf = (ui: number) => PAD_L + (ui / 2) * PLOT_W
const yOf = (mv: number) => PAD_T + ((VMAX - mv) / (2 * VMAX)) * PLOT_H

/** 示波器风格的深色底，颜色写死：canvas 读不到 CSS 变量 */
const BG = '#0d1117'
const TRACE = 'rgba(88, 166, 255, 0.16)'
const GRID = '#3d4756'
const LABEL = '#8b949e'
const MASK_COLOR = '#e8c45a'
const HIT_COLOR = '#f85149'

/** 把一段 2 UI 的叠加波形画出来：淡蓝迹线、mask 六边形、落进 mask 的采样点（红） */
function drawEye(ctx: CanvasRenderingContext2D, wave: Float64Array) {
  ctx.fillStyle = BG
  ctx.fillRect(0, 0, CW, CH)

  ctx.strokeStyle = GRID
  ctx.lineWidth = 1
  ctx.setLineDash([4, 3])
  ctx.beginPath()
  ctx.moveTo(PAD_L, yOf(0))
  ctx.lineTo(PAD_L + PLOT_W, yOf(0))
  ctx.stroke()
  ctx.setLineDash([])
  for (const ui of [0, 1, 2]) {
    ctx.beginPath()
    ctx.moveTo(xOf(ui), PAD_T)
    ctx.lineTo(xOf(ui), PAD_T + PLOT_H)
    ctx.stroke()
  }

  ctx.fillStyle = LABEL
  ctx.font = '11px Consolas, ui-monospace, monospace'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  for (const mv of [LEVEL_MV, 0, -LEVEL_MV]) {
    ctx.fillText(mv > 0 ? `+${mv}` : `${mv}`, PAD_L - 6, yOf(mv))
  }
  ctx.textBaseline = 'top'
  ctx.textAlign = 'center'
  ctx.fillText('0', xOf(0), PAD_T + PLOT_H + 6)
  ctx.fillText('1 UI', xOf(1), PAD_T + PLOT_H + 6)
  ctx.fillText('2 UI', xOf(2), PAD_T + PLOT_H + 6)

  ctx.strokeStyle = TRACE
  ctx.lineWidth = 1
  const hits: Array<[number, number]> = []
  for (let n = 0; n < EYE_TRACES; n += 1) {
    const start = EYE_START + n * SPU
    ctx.beginPath()
    for (let k = 0; k <= 2 * SPU; k += 1) {
      const v = wave[start + k]
      const x = xOf(k / SPU)
      const y = yOf(v)
      if (k === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
      const u = Math.min(Math.abs(k / SPU - 0.5), Math.abs(k / SPU - 1.5))
      if (inMask(u, v)) {
        hits.push([x, y])
      }
    }
    ctx.stroke()
  }

  const hexes: Array<[number, number]> = [
    [-MASK_HALF_UI, 0],
    [-MASK_FLAT_UI, MASK_MV],
    [MASK_FLAT_UI, MASK_MV],
    [MASK_HALF_UI, 0],
    [MASK_FLAT_UI, -MASK_MV],
    [-MASK_FLAT_UI, -MASK_MV],
  ]
  ctx.strokeStyle = MASK_COLOR
  ctx.lineWidth = 1.5
  for (const centre of [0.5, 1.5]) {
    ctx.beginPath()
    for (let i = 0; i < hexes.length; i += 1) {
      const [du, mv] = hexes[i]
      const x = xOf(centre + du)
      const y = yOf(mv)
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()
    ctx.stroke()
  }

  ctx.fillStyle = HIT_COLOR
  for (const [x, y] of hits) {
    ctx.fillRect(x - 1.5, y - 1.5, 3, 3)
  }
}

/** 眼图 canvas：波形由页面算好传入，这里只负责画 */
export function EyeCanvas({ wave, label, caption }: { wave: Float64Array; label: LText; caption: LText }) {
  const { t } = useLocale()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) {
      return
    }
    const ctx = canvas.getContext('2d')
    if (ctx === null) {
      return
    }
    drawEye(ctx, wave)
  }, [wave])

  return (
    <figure className="term-fig">
      <canvas ref={canvasRef} width={CW} height={CH} className="hs-eye" role="img" aria-label={t(label)} />
      <figcaption>{t(caption)}</figcaption>
    </figure>
  )
}

const RW = 480
const RH = 240
const RPL = 44
const RPR = 14
const RPT = 14
const RPB = 30
const FMAX = 15
const DBMAX = 12

const fx = (f: number) => RPL + (f / FMAX) * (RW - RPL - RPR)
/** 损耗越大越往下：0 dB 在顶端 */
const dy = (db: number) => RPT + (db / DBMAX) * (RH - RPT - RPB)

const SERIES_COLORS = {
  ate: '#e8c45a',
  fixture: '#58a6ff',
  path: '#f85149',
}

/** 频响图：ATE 通道、夹具与合成路径的损耗（dB）随频率变化；虚线标出 5 GHz 奈奎斯特频率 */
export function ResponseFig({ state }: { state: AteState }) {
  const { t } = useLocale()
  const freqs: number[] = []
  for (let f = 0; f <= FMAX; f += 0.25) {
    freqs.push(f)
  }
  const series = freqs.map((f) => ({ f, ...responseDb(f, state) }))
  const toPoints = (pick: (p: (typeof series)[number]) => number) =>
    series.map((p) => `${fx(p.f).toFixed(1)},${dy(pick(p)).toFixed(1)}`).join(' ')

  const ticksDb = [0, 3, 6, 9, 12]
  const ticksGhz = [0, 5, 10, 15]

  return (
    <figure className="term-fig ate-resp">
      <svg viewBox={`0 0 ${RW} ${RH}`} role="img" aria-label={t(S.respAria)} className="ate-resp__svg">
        <rect x={0} y={0} width={RW} height={RH} fill="#0d1117" rx={10} />
        {ticksDb.map((db) => (
          <g key={db}>
            <line x1={RPL} x2={RW - RPR} y1={dy(db)} y2={dy(db)} stroke="#3d4756" strokeWidth={1} />
            <text x={RPL - 6} y={dy(db)} fill="#8b949e" fontSize={11} textAnchor="end" dominantBaseline="middle">
              {`${db}`}
            </text>
          </g>
        ))}
        {ticksGhz.map((f) => (
          <text key={f} x={fx(f)} y={RH - RPB + 14} fill="#8b949e" fontSize={11} textAnchor="middle">
            {`${f}`}
          </text>
        ))}
        <line
          x1={fx(NYQUIST_GHZ)}
          x2={fx(NYQUIST_GHZ)}
          y1={RPT}
          y2={RH - RPB}
          stroke="#8b949e"
          strokeDasharray="4 3"
          strokeWidth={1}
        />
        <text x={fx(NYQUIST_GHZ) + 4} y={RPT + 10} fill="#8b949e" fontSize={11}>
          {'5 GHz'}
        </text>
        <polyline points={toPoints((p) => p.ate)} fill="none" stroke={SERIES_COLORS.ate} strokeWidth={2} />
        <polyline points={toPoints((p) => p.fixture)} fill="none" stroke={SERIES_COLORS.fixture} strokeWidth={2} />
        <polyline points={toPoints((p) => p.cascade)} fill="none" stroke={SERIES_COLORS.path} strokeWidth={2.5} />
      </svg>
      <ul className="ate-legend">
        <li>
          <span className="ate-legend__swatch" style={{ background: SERIES_COLORS.ate }} />
          {t(S.respAte)}
        </li>
        <li>
          <span className="ate-legend__swatch" style={{ background: SERIES_COLORS.fixture }} />
          {t(S.respFix)}
        </li>
        <li>
          <span className="ate-legend__swatch" style={{ background: SERIES_COLORS.path }} />
          {t(S.respPath)}
        </li>
      </ul>
      <figcaption>{t(S.respCap)}</figcaption>
    </figure>
  )
}
