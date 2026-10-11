import { CanvasTexture, SRGBColorSpace } from 'three'
import type { Pkg } from './layout'

/** 用 Canvas 在本地生成丝印 / 打标 / die 图案贴图（离线，无需下载） */

const cache = new Map<string, CanvasTexture>()

function make(key: string, w: number, h: number, draw: (g: CanvasRenderingContext2D, w: number, h: number) => void) {
  const hit = cache.get(key)
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const g = canvas.getContext('2d')
  if (g) draw(g, w, h)
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  cache.set(key, tex)
  return tex
}

const MONO = 'Consolas, "Cascadia Mono", monospace'

/** Load Board 顶层丝印（透明底，白色线条与文字） */
export function lbSilkTexture() {
  return make('lb-silk', 1024, 800, (g, w, h) => {
    g.clearRect(0, 0, w, h)
    g.strokeStyle = '#eef2ea'
    g.fillStyle = '#eef2ea'
    g.lineWidth = 3
    g.strokeRect(14, 14, w - 28, h - 28)
    const sx = w / 4.6
    const cx = w / 2
    const cy = h / 2
    const sock = 2.1 * sx
    g.strokeRect(cx - sock / 2 - 6, cy - sock / 2 - 6, sock + 12, sock + 12)
    g.beginPath()
    g.moveTo(cx - sock / 2 - 22, cy + sock / 2 + 4)
    g.lineTo(cx - sock / 2 - 6, cy + sock / 2 + 22)
    g.lineTo(cx - sock / 2 - 22, cy + sock / 2 + 22)
    g.closePath()
    g.fill()
    g.font = `bold 30px ${MONO}`
    g.fillText('U1  DUT SOCKET', cx - sock / 2, cy - sock / 2 - 18)
    g.font = `bold 34px ${MONO}`
    g.fillText('DIB  LB-D02  REV B', 110, 64)
    g.font = `24px ${MONO}`
    g.fillText('IC-LAB TEST INTERFACE', 110, 96)
    g.fillText('J1', 30, h / 2 - 160)
    g.fillText('J2', w - 64, h / 2 - 160)
    for (const [x, y] of [
      [60, h - 60],
      [w - 60, h - 60],
      [60, 60],
      [w - 60, 60],
    ]) {
      g.beginPath()
      g.arc(x!, y!, 22, 0, Math.PI * 2)
      g.stroke()
    }
    g.font = `18px ${MONO}`
    for (let i = 0; i < 8; i += 1) {
      const x = cx + (i - 3.5) * 0.5 * sx
      g.fillText(`P${i + 1}`, x - 12, h - 26)
      g.fillText(`P${i + 9}`, x - 14, 138)
    }
    for (let i = 0; i < 6; i += 1) {
      const side = i < 3 ? -1 : 1
      const x = cx + side * 1.6 * sx
      const y = cy + ((i % 3) - 1) * 0.42 * sx
      g.strokeRect(x - 34, y - 24, 68, 48)
      g.fillText(`K${i + 1}`, x - 10, y - 30)
    }
  })
}

/** DUT 顶面激光打标；BGA 的 A1 在左前角，QFP 的 pin 1 在左后角 */
export function dutMarkTexture(pkg: Pkg) {
  return make(`dut-${pkg}`, 512, 512, (g, w, h) => {
    g.fillStyle = '#1a1b1e'
    g.fillRect(0, 0, w, h)
    for (let i = 0; i < 900; i += 1) {
      const v = 22 + Math.floor(Math.random() * 10)
      g.fillStyle = `rgb(${v},${v},${v + 2})`
      g.fillRect(Math.random() * w, Math.random() * h, 2, 2)
    }
    g.fillStyle = '#8b9097'
    g.textAlign = 'center'
    g.font = `bold 64px ${MONO}`
    g.fillText('ICLAB', w / 2, h / 2 - 34)
    g.font = `bold 46px ${MONO}`
    g.fillText(pkg === 'BGA' ? 'D02-A7B' : 'D02-Q64', w / 2, h / 2 + 30)
    g.font = `36px ${MONO}`
    g.fillText('2641  TW', w / 2, h / 2 + 86)
    const dotY = pkg === 'BGA' ? h - 60 : 60
    g.fillStyle = '#2b2d31'
    g.beginPath()
    g.arc(60, dotY, 26, 0, Math.PI * 2)
    g.fill()
    g.strokeStyle = '#4a4e55'
    g.lineWidth = 3
    g.stroke()
  })
}

/** 单颗 die 的版图：pad 环 + 若干逻辑 / SRAM 块 */
export function dieTexture() {
  return make('die', 256, 256, (g, w, h) => {
    g.fillStyle = '#2a3140'
    g.fillRect(0, 0, w, h)
    g.fillStyle = '#3b465c'
    g.fillRect(10, 10, w - 20, h - 20)
    const blocks: Array<[number, number, number, number, string]> = [
      [40, 40, 80, 70, '#4b5a7a'],
      [130, 40, 86, 70, '#5a4a72'],
      [40, 120, 176, 50, '#355a66'],
      [40, 178, 100, 38, '#5d6a52'],
      [148, 178, 68, 38, '#4b5a7a'],
    ]
    for (const [x, y, bw, bh, c] of blocks) {
      g.fillStyle = c
      g.fillRect(x, y, bw, bh)
    }
    g.strokeStyle = 'rgba(200,210,230,0.25)'
    g.lineWidth = 1
    for (let i = 0; i < 8; i += 1) {
      g.beginPath()
      g.moveTo(40, 120 + i * 6)
      g.lineTo(216, 120 + i * 6)
      g.stroke()
    }
    g.fillStyle = '#c9b06a'
    for (let i = 0; i < 9; i += 1) {
      const t = 28 + i * 25
      g.fillRect(t, 16, 12, 12)
      g.fillRect(t, h - 28, 12, 12)
      g.fillRect(16, t, 12, 12)
      g.fillRect(w - 28, t, 12, 12)
    }
  })
}

/** 探针卡 PCB 顶层丝印（圆形，透明底） */
export function pcSilkTexture() {
  return make('pc-silk', 1024, 1024, (g, w) => {
    g.clearRect(0, 0, w, w)
    g.strokeStyle = '#eef2ea'
    g.fillStyle = '#eef2ea'
    g.lineWidth = 3
    const c = w / 2
    g.beginPath()
    g.arc(c, c, c - 20, 0, Math.PI * 2)
    g.stroke()
    g.beginPath()
    g.arc(c, c, c * 0.68, 0, Math.PI * 2)
    g.stroke()
    g.textAlign = 'center'
    g.font = `bold 34px ${MONO}`
    g.fillText('PROBE CARD  PC-D02', c, c - c * 0.72)
    g.font = `24px ${MONO}`
    g.fillText('POGO RING  ·  18 BLOCKS', c, c + c * 0.78)
    for (let i = 0; i < 4; i += 1) {
      const a = Math.PI / 4 + (i * Math.PI) / 2
      g.beginPath()
      g.arc(c + Math.cos(a) * c * 0.62, c + Math.sin(a) * c * 0.62, 18, 0, Math.PI * 2)
      g.stroke()
    }
  })
}
