import { useEffect, useRef } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import './hardwareVisuals.css'

export type Point = readonly [x: number, y: number]

export const ink = {
  light: '#e4f0f8', label: '#b6c9d9', guide: '#598099', trace: '#66e4cf',
  gold: '#ffcd82', copper: '#d88e58', steel: '#779fb6', dark: '#21394d',
  wafer: '#7eacf2', board: '#256b69', shadow: '#0c1724', red: '#ffad95',
}

export function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, fill: string, stroke?: string, radius = 4) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, radius)
  ctx.fillStyle = fill
  ctx.fill()
  if (stroke) {
    ctx.lineWidth = 1
    ctx.strokeStyle = stroke
    ctx.stroke()
  }
}

export function line(ctx: CanvasRenderingContext2D, points: readonly Point[], color: string, width = 2, dash: number[] = []) {
  ctx.beginPath()
  points.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y))
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.setLineDash(dash)
  ctx.stroke()
  ctx.setLineDash([])
}

export function curve(ctx: CanvasRenderingContext2D, path: string, color: string, width: number) {
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.stroke(new Path2D(path))
}

export function dot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
}

export function label(ctx: CanvasRenderingContext2D, x: number, y: number, value: string, color = ink.label, align: CanvasTextAlign = 'left', size = 19) {
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.font = `600 ${size}px system-ui, sans-serif`
  ctx.fillText(value, x, y)
}

export function leader(ctx: CanvasRenderingContext2D, x: number, y: number, elbow: number, end: number, value: string) {
  const right = end > x
  line(ctx, [[x, y], [elbow, y], [end, y]], ink.guide, 1.5)
  dot(ctx, x, y, 2.8, ink.label)
  label(ctx, end + (right ? 7 : -7), y, value, ink.label, right ? 'left' : 'right')
}

export function HardwareCanvas({ description, value = 0, draw, scene }: {
  description: LText
  value?: number
  draw: (ctx: CanvasRenderingContext2D, value: number, t: (text: LText) => string) => void
  scene: string
}) {
  const { t } = useLocale()
  const canvas = useRef<HTMLCanvasElement>(null)
  const shown = useRef(value)
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d')
    if (!ctx) return
    const from = shown.current
    const paint = (position: number) => {
      shown.current = position
      ctx.setTransform(2, 0, 0, 2, 0, 0)
      ctx.clearRect(0, 0, 600, 310)
      ctx.save()
      draw(ctx, position, t)
      ctx.restore()
    }
    if (from === value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      paint(value)
      return
    }
    const start = performance.now()
    let frame = 0
    const animate = (now: number) => {
      const progress = Math.max(0, Math.min(1, (now - start) / 270))
      paint(from + (value - from) * (1 - (1 - progress) ** 3))
      if (progress < 1) frame = requestAnimationFrame(animate)
    }
    paint(from)
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [draw, t, value])
  return <canvas ref={canvas} className="hardware-canvas" width={1200} height={620} role="img" aria-label={t(description)} data-scene={scene} />
}

