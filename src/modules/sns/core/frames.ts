/** 帧统计。帧按行优先的一维数组存放，索引 = y·w + x */

export type Rect = { x: number; y: number; w: number; h: number }

export function frameMean(frame: Float32Array, w: number, roi?: Rect): number {
  const box = roi ?? { x: 0, y: 0, w, h: Math.round(frame.length / w) }
  let sum = 0
  let n = 0
  for (let row = 0; row < box.h; row += 1) {
    const base = (box.y + row) * w + box.x
    for (let col = 0; col < box.w; col += 1) {
      sum += frame[base + col]
      n += 1
    }
  }
  return n === 0 ? 0 : sum / n
}

export function frameVar(frame: Float32Array, w: number, roi?: Rect): number {
  const box = roi ?? { x: 0, y: 0, w, h: Math.round(frame.length / w) }
  const mean = frameMean(frame, w, box)
  let acc = 0
  let n = 0
  for (let row = 0; row < box.h; row += 1) {
    const base = (box.y + row) * w + box.x
    for (let col = 0; col < box.w; col += 1) {
      const d = frame[base + col] - mean
      acc += d * d
      n += 1
    }
  }
  return n < 2 ? 0 : acc / (n - 1)
}

/** var(f1−f2)/2。两帧之差消掉固定模式，剩下时间噪声 */
export function diffVar(f1: Float32Array, f2: Float32Array, w: number, roi?: Rect): number {
  const box = roi ?? { x: 0, y: 0, w, h: Math.round(f1.length / w) }
  let sum = 0
  let n = 0
  for (let row = 0; row < box.h; row += 1) {
    const base = (box.y + row) * w + box.x
    for (let col = 0; col < box.w; col += 1) {
      sum += f1[base + col] - f2[base + col]
      n += 1
    }
  }
  const mean = n === 0 ? 0 : sum / n
  let acc = 0
  for (let row = 0; row < box.h; row += 1) {
    const base = (box.y + row) * w + box.x
    for (let col = 0; col < box.w; col += 1) {
      const d = f1[base + col] - f2[base + col] - mean
      acc += d * d
    }
  }
  const variance = n < 2 ? 0 : acc / (n - 1)
  return variance / 2
}

export function average(frames: Float32Array[]): Float32Array {
  const out = new Float32Array(frames[0]?.length ?? 0)
  if (frames.length === 0) return out
  for (const frame of frames) {
    for (let i = 0; i < out.length; i += 1) out[i] += frame[i]
  }
  const n = frames.length
  for (let i = 0; i < out.length; i += 1) out[i] /= n
  return out
}

/** 方差估计的相对误差 ≈ √(2/(n−1))，n 是 ROI 像素数 */
export function varRelError(n: number): number {
  return Math.sqrt(2 / Math.max(n - 1, 1))
}
