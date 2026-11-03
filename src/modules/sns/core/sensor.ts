/**
 * CIS 与加速度计的教学模型（VDUT-CIS1 / VDUT-ACC1）。
 * 帧默认不超过 512×512；PTC 用差帧去掉固定模式。
 */

import { diffVar, frameMean, type Rect } from './frames.ts'

export type { Rect }

export type CisParams = {
  w: number
  h: number
  /** 转换增益 K，e⁻/DN */
  kEperDn: number
  readNoiseE: number
  fwcE: number
  darkE25PerS: number
  /** 暗电流翻倍的温度间隔（°C），教学示意 */
  darkDoubleC: number
  /** PRNU，相对标准差（0.01 = 1%） */
  prnu: number
  /** 左右 shading 的峰峰值，占均值的比例（0.1 = 10%） */
  shadingPct: number
  defects: { dead: number; hot: number; low: number; clusterProb: number }
  blackLevelDn: number
  adcBits: number
  /** 二阶非线性系数，0 为线性 */
  nonlin?: number
}

export type FrameOpts = {
  exposureS: number
  /** 平均信号电子产生率，e⁻/s/像素（PRNU 与 shading 之前） */
  illumE: number
  tempC: number
  seed: number
}

const HOT_EXTRA_E = 8000

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function gaussian(rand: () => number): number {
  let u = 0
  while (u === 0) u = rand()
  const v = rand()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

function poisson(rand: () => number, mean: number): number {
  if (mean <= 0) return 0
  if (mean > 40) return Math.max(0, mean + Math.sqrt(mean) * gaussian(rand))
  const limit = Math.exp(-mean)
  let k = 0
  let p = 1
  do {
    k += 1
    p *= rand()
  } while (p > limit && k < 200)
  return k - 1
}

export type DefectKind = 'ok' | 'dead' | 'hot' | 'low'

/** 由种子决定哪些像素是死点、热点、低灵敏点。簇概率把一部分缺陷扩成 2×2 */
export function defectMask(p: CisParams, seed: number): Uint8Array {
  const mask = new Uint8Array(p.w * p.h)
  const rand = mulberry32(seed ^ 0x9e3779b9)
  const place = (count: number, kind: number) => {
    let left = count
    let guard = 0
    while (left > 0 && guard < p.w * p.h * 4) {
      guard += 1
      const x = Math.floor(rand() * p.w)
      const y = Math.floor(rand() * p.h)
      const cluster = rand() < p.defects.clusterProb
      const size = cluster ? 2 : 1
      let wrote = false
      for (let dy = 0; dy < size; dy += 1) {
        for (let dx = 0; dx < size; dx += 1) {
          const xx = Math.min(p.w - 1, x + dx)
          const yy = Math.min(p.h - 1, y + dy)
          const i = yy * p.w + xx
          if (mask[i] === 0) {
            mask[i] = kind
            wrote = true
          }
        }
      }
      if (wrote) left -= 1
    }
  }
  place(p.defects.dead, 1)
  place(p.defects.hot, 2)
  place(p.defects.low, 3)
  return mask
}

function prnuField(p: CisParams): Float32Array {
  const rand = mulberry32(0x51a70000 + p.w * 131 + p.h)
  const out = new Float32Array(p.w * p.h)
  for (let i = 0; i < out.length; i += 1) out[i] = gaussian(rand)
  return out
}

/** 生成一帧 DN。同一组参数和种子得到同一帧 */
export function genFrame(p: CisParams, o: FrameOpts): Float32Array {
  const rand = mulberry32(o.seed >>> 0)
  const mask = defectMask(p, 1)
  const gain = prnuField(p)
  const darkRate = p.darkE25PerS * 2 ** ((o.tempC - 25) / p.darkDoubleC)
  const full = 2 ** p.adcBits - 1
  const out = new Float32Array(p.w * p.h)
  const nonlin = p.nonlin ?? 0
  for (let y = 0; y < p.h; y += 1) {
    for (let x = 0; x < p.w; x += 1) {
      const i = y * p.w + x
      const shade = 1 + p.shadingPct * (2 * (x / Math.max(p.w - 1, 1)) - 1)
      let signal = o.illumE * o.exposureS * (1 + p.prnu * gain[i]) * shade
      const kind = mask[i]
      if (kind === 1) signal = 0
      else if (kind === 3) signal *= 0.25
      let electrons = poisson(rand, Math.max(0, signal)) + poisson(rand, Math.max(0, darkRate * o.exposureS))
      if (kind === 2) electrons += HOT_EXTRA_E
      electrons += p.readNoiseE * gaussian(rand)
      if (nonlin !== 0 && p.fwcE > 0) {
        const u = electrons / p.fwcE
        electrons *= 1 - nonlin * u * u
      }
      electrons = Math.min(Math.max(0, electrons), p.fwcE)
      const dn = p.blackLevelDn + electrons / p.kEperDn
      out[i] = Math.min(full, Math.max(0, dn))
    }
  }
  return out
}

export type PtcPoint = { mean: number; variance: number }
export type PtcResult = {
  k: number
  readNoiseE: number
  fwcE: number
  dr: number
  snrMax: number
  points: PtcPoint[]
}

/**
 * 差帧法 PTC。mean 是 ROI 均值减暗场；var = var(f1−f2)/2。
 * 散粒噪声区 σ² = μ/K + σ²_read，斜率的倒数是 K。
 */
export function ptc(
  frames: Array<{ f1: Float32Array; f2: Float32Array; roi: Rect }>,
  dark: Float32Array | null,
  w: number,
): PtcResult {
  const points: PtcPoint[] = frames.map((item) => {
    const meanPair = (frameMean(item.f1, w, item.roi) + frameMean(item.f2, w, item.roi)) / 2
    const darkMean = dark ? frameMean(dark, w, item.roi) : 0
    return { mean: meanPair - darkMean, variance: diffVar(item.f1, item.f2, w, item.roi) }
  })
  const ordered = [...points].sort((a, b) => a.mean - b.mean)
  let peakVar = 0
  let cut = ordered.length
  for (let i = 0; i < ordered.length; i += 1) {
    if (ordered[i].variance >= peakVar) peakVar = ordered[i].variance
    else if (ordered[i].mean > 10 && ordered[i].variance < peakVar * 0.65) {
      cut = i
      break
    }
  }
  const fitOn = ordered.slice(0, cut).filter((p) => p.mean > 1)
  const used = fitOn.length >= 3 ? fitOn : ordered.filter((p) => p.mean > 1)
  const { slope, intercept } = linReg(
    used.map((p) => p.mean),
    used.map((p) => p.variance),
  )
  const k = slope > 1e-9 ? 1 / slope : Number.POSITIVE_INFINITY
  const readDn = Math.sqrt(Math.max(intercept, 0))
  const readNoiseE = readDn * k
  const sat = points.reduce((m, p) => Math.max(m, p.mean), 0)
  const fwcE = sat * k
  const dr = readNoiseE > 0 ? fwcE / readNoiseE : 0
  return { k, readNoiseE, fwcE, dr, snrMax: Math.sqrt(Math.max(fwcE, 0)), points }
}

export type DefectMap = {
  kind: DefectKind[]
  counts: { dead: number; hot: number; low: number }
  clusters: number
}

/**
 * 缺陷分类。阈值是相对亮场中位数的比例（dead、low）和暗场绝对 DN（hot）。
 * 簇：上下左右相邻的缺陷像素算同一个簇。
 */
export function classifyDefects(
  flat: Float32Array,
  dark: Float32Array,
  w: number,
  th: { dead: number; hot: number; low: number },
): DefectMap {
  const h = Math.round(flat.length / w)
  const resp = new Float32Array(flat.length)
  for (let i = 0; i < flat.length; i += 1) resp[i] = flat[i] - dark[i]
  const med = median(Array.from(resp))
  const kind: DefectKind[] = new Array(flat.length).fill('ok')
  const counts = { dead: 0, hot: 0, low: 0 }
  for (let i = 0; i < flat.length; i += 1) {
    if (resp[i] < th.dead * med) {
      kind[i] = 'dead'
      counts.dead += 1
    } else if (dark[i] > th.hot) {
      kind[i] = 'hot'
      counts.hot += 1
    } else if (resp[i] < th.low * med) {
      kind[i] = 'low'
      counts.low += 1
    }
  }
  return { kind, counts, clusters: countClusters(kind, w, h) }
}

function countClusters(kind: DefectKind[], w: number, h: number): number {
  const seen = new Uint8Array(kind.length)
  let clusters = 0
  const stack: number[] = []
  for (let i = 0; i < kind.length; i += 1) {
    if (kind[i] === 'ok' || seen[i]) continue
    clusters += 1
    stack.push(i)
    seen[i] = 1
    while (stack.length > 0) {
      const cur = stack.pop() as number
      const x = cur % w
      const y = (cur / w) | 0
      const nbrs = [
        x > 0 ? cur - 1 : -1,
        x + 1 < w ? cur + 1 : -1,
        y > 0 ? cur - w : -1,
        y + 1 < h ? cur + w : -1,
      ]
      for (const n of nbrs) {
        if (n >= 0 && !seen[n] && kind[n] !== 'ok') {
          seen[n] = 1
          stack.push(n)
        }
      }
    }
  }
  return clusters
}

export function linearity(
  means: number[],
  exposures: number[],
  range: [number, number],
): { maxDevPct: number; atIndex: number } {
  const peak = Math.max(...means, 0)
  const idx = means
    .map((mean, index) => ({ mean, index, exposure: exposures[index] }))
    .filter((p) => p.mean >= range[0] * peak && p.mean <= range[1] * peak)
  if (idx.length < 2) return { maxDevPct: 0, atIndex: 0 }
  const { slope, intercept } = linReg(
    idx.map((p) => p.exposure),
    idx.map((p) => p.mean),
  )
  let maxDev = 0
  let atIndex = idx[0].index
  for (const point of idx) {
    const fit = slope * point.exposure + intercept
    const dev = fit === 0 ? 0 : (Math.abs(point.mean - fit) / Math.abs(fit)) * 100
    if (dev > maxDev) {
      maxDev = dev
      atIndex = point.index
    }
  }
  return { maxDevPct: maxDev, atIndex }
}

/** 去掉一次平面后的空间标准差 / 均值。removeShading 为假时直接用整帧 */
export function prnu(frames: Float32Array[], dark: Float32Array[], w: number, removeShading: boolean): number {
  const avg = new Float32Array(frames[0].length)
  for (const frame of frames) {
    for (let i = 0; i < avg.length; i += 1) avg[i] += frame[i]
  }
  const darkAvg = new Float32Array(avg.length)
  for (const frame of dark) {
    for (let i = 0; i < darkAvg.length; i += 1) darkAvg[i] += frame[i]
  }
  const nF = frames.length
  const nD = Math.max(dark.length, 1)
  const signal = new Float32Array(avg.length)
  for (let i = 0; i < signal.length; i += 1) signal[i] = avg[i] / nF - (dark.length ? darkAvg[i] / nD : 0)
  const values = removeShading ? removePlane(signal, w) : signal
  const mean = frameMean(values, w)
  let acc = 0
  for (let i = 0; i < values.length; i += 1) {
    const d = values[i] - mean
    acc += d * d
  }
  const std = Math.sqrt(acc / Math.max(values.length - 1, 1))
  return mean === 0 ? 0 : std / Math.abs(mean)
}

/** 测得 PRNU² = 真值² + (σt/μ)² / N */
export function prnuMeasured(prnuTrue: number, sigmaOverMu: number, nFrames: number): number {
  return Math.sqrt(prnuTrue * prnuTrue + (sigmaOverMu * sigmaOverMu) / Math.max(nFrames, 1))
}

/** 光源非均匀与器件 PRNU 按功率相加 */
export function prnuWithSource(prnuTrue: number, sourceNonuniform: number): number {
  return Math.sqrt(prnuTrue * prnuTrue + sourceNonuniform * sourceNonuniform)
}

function removePlane(signal: Float32Array, w: number): Float32Array {
  const h = Math.round(signal.length / w)
  let sx = 0
  let sy = 0
  let sz = 0
  let sxx = 0
  let syy = 0
  let sxy = 0
  let sxz = 0
  let syz = 0
  const n = signal.length
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const z = signal[y * w + x]
      sx += x
      sy += y
      sz += z
      sxx += x * x
      syy += y * y
      sxy += x * y
      sxz += x * z
      syz += y * z
    }
  }
  const det =
    n * (sxx * syy - sxy * sxy) - sx * (sx * syy - sxy * sy) + sy * (sx * sxy - sxx * sy)
  const a = det === 0 ? sz / n : (sz * (sxx * syy - sxy * sxy) - sx * (sxz * syy - sxy * syz) + sy * (sxz * sxy - sxx * syz)) / det
  const b = det === 0 ? 0 : (n * (sxz * syy - sxy * syz) - sz * (sx * syy - sxy * sy) + sy * (sx * syz - sxz * sy)) / det
  const c = det === 0 ? 0 : (n * (sxx * syz - sxz * sxy) - sx * (sx * syz - sxz * sy) + sz * (sx * sxy - sxx * sy)) / det
  const out = new Float32Array(n)
  const meanPlane = a + (b * (w - 1)) / 2 + (c * (h - 1)) / 2
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      out[y * w + x] = signal[y * w + x] - (a + b * x + c * y) + meanPlane
    }
  }
  return out
}

export function linReg(xs: number[], ys: number[]): { slope: number; intercept: number } {
  const n = xs.length
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  for (let i = 0; i < n; i += 1) {
    sx += xs[i]
    sy += ys[i]
    sxx += xs[i] * xs[i]
    sxy += xs[i] * ys[i]
  }
  const denom = n * sxx - sx * sx
  const slope = denom === 0 ? 0 : (n * sxy - sx * sy) / denom
  const intercept = n === 0 ? 0 : (sy - slope * sx) / n
  return { slope, intercept }
}

export function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const mid = sorted.length >> 1
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export function twoPoint(x0: number, y0: number, x1: number, y1: number): { s: number; b: number } {
  const s = x1 === x0 ? 0 : (y1 - y0) / (x1 - x0)
  return { s, b: y0 - s * x0 }
}

/** 通用传感器：out = S·x + b + nl·x² + 温漂·ΔT + 噪声 */
export function sensorSample(p: {
  s: number
  b: number
  nl: number
  noise: number
  tco: number
  x: number
  tempC: number
  rand: () => number
}): number {
  const ideal = p.s * p.x + p.b + p.nl * p.x * p.x + p.tco * (p.tempC - 25)
  return ideal + (p.noise === 0 ? 0 : p.noise * gaussian(p.rand))
}

export type AccelParams = {
  sVg: number
  offsetV: number
  /** 噪声密度，g/√Hz */
  nd: number
  bwHz: number
  /** 相对二阶项，(V/g) 的 x² 系数 / S */
  nonlin: number
  /** 温漂，V/°C */
  tco: number
}

/** 输出电压。倾角让有效加速度变成 a·cosθ */
export function accelModel(p: AccelParams, o: { aG: number; tiltDeg: number; tempC: number; seed: number }): number {
  const rand = mulberry32(o.seed >>> 0)
  const gEff = o.aG * Math.cos((o.tiltDeg * Math.PI) / 180)
  const ideal = p.offsetV + p.sVg * (gEff + p.nonlin * gEff * gEff) + p.tco * (o.tempC - 25)
  const sigmaG = p.nd * Math.sqrt(Math.max(p.bwHz, 0))
  return ideal + p.sVg * sigmaG * gaussian(rand)
}

/** 翻转法：轴向上、向下各读一次 */
export function flipCal(vPlus: number, vMinus: number): { offsetV: number; sVg: number } {
  return { offsetV: (vPlus + vMinus) / 2, sVg: (vPlus - vMinus) / 2 }
}

/** 倾角造成的灵敏度相对误差 1 − cosθ */
export function tiltSensitivityError(tiltDeg: number): number {
  return 1 - Math.cos((tiltDeg * Math.PI) / 180)
}

/** 带宽内噪声（与噪声密度同一单位）σ = ND·√BW */
export function noiseInBand(nd: number, bwHz: number): number {
  return nd * Math.sqrt(bwHz)
}

/** 列 ADC：K（e⁻/DN）= Vrange / (2^N · 总增益 V/e⁻) */
export function kElectronsPerDn(vRange: number, bits: number, gainVPerE: number): number {
  return vRange / (2 ** bits * gainVPerE)
}

/** 量化噪声（e⁻ rms）≈ K/√12 */
export function quantNoiseE(kEperDn: number): number {
  return kEperDn / Math.sqrt(12)
}
