import { useEffect, useRef } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { FIG } from './eyeData'
import { LEVEL_MV, MASK_FLAT_UI, MASK_HALF_UI, MASK_MV, SPU, type EyeAnalysis } from './eyeModel'

const CW = 480
const CH = 260
const PAD_L = 46
const PAD_R = 14
const PAD_T = 14
const PAD_B = 30
/** 纵轴范围 ±VMAX mV */
const VMAX = 500
const PLOT_W = CW - PAD_L - PAD_R
const PLOT_H = CH - PAD_T - PAD_B

/** 2 UI 的横轴，0–2 UI 映射到绘图区宽度 */
const xOf = (ui: number) => PAD_L + (ui / 2) * PLOT_W
const yOf = (mv: number) => PAD_T + ((VMAX - mv) / (2 * VMAX)) * PLOT_H

/** 示波器风格的深色底，线条颜色写死：canvas 读不到 CSS 变量 */
const BG = '#0d1117'
const TRACE = 'rgba(88, 166, 255, 0.16)'
const GRID = '#3d4756'
const LABEL = '#8b949e'
const MASK_COLOR = '#e8c45a'
const HIT_COLOR = '#f85149'

function drawEye(ctx: CanvasRenderingContext2D, a: EyeAnalysis) {
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
  const segments = a.wave.length / SPU - 2
  for (let n = 0; n < segments; n += 1) {
    ctx.beginPath()
    for (let k = 0; k <= 2 * SPU; k += 1) {
      const x = xOf(k / SPU)
      const y = yOf(a.wave[n * SPU + k])
      if (k === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
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
  for (const hit of a.hitPoints) {
    ctx.fillRect(xOf(hit.x) - 1.5, yOf(hit.y) - 1.5, 3, 3)
  }
}

/** 眼图 canvas：分析结果由页面算好传入，这里只负责画 */
export function EyeFig({ analysis }: { analysis: EyeAnalysis }) {
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
    drawEye(ctx, analysis)
  }, [analysis])

  return (
    <figure className="term-fig">
      <canvas ref={canvasRef} width={CW} height={CH} className="hs-eye" role="img" aria-label={t(FIG.eyeAria)} />
      <figcaption>{t(FIG.eyeCap)}</figcaption>
    </figure>
  )
}
