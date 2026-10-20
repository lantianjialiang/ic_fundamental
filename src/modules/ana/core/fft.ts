/**
 * FFT 与窗函数（教学用，点数必须是 2 的幂）。
 * 窗函数用周期形式：w[k] = f(2πk/N)，这是谱分析里常用的写法。
 */

export type WindowKind = 'rect' | 'hann' | 'blackman-harris'

/** 窗函数系数。rect：全 1；hann：0.5 − 0.5·cos；blackman-harris：四项，旁瓣约 −92 dB */
export function windowCoefficients(kind: WindowKind, n: number): Float64Array {
  const w = new Float64Array(n)
  for (let k = 0; k < n; k += 1) {
    const x = (2 * Math.PI * k) / n
    if (kind === 'rect') {
      w[k] = 1
    } else if (kind === 'hann') {
      w[k] = 0.5 - 0.5 * Math.cos(x)
    } else {
      w[k] = 0.35875 - 0.48829 * Math.cos(x) + 0.14128 * Math.cos(2 * x) - 0.01168 * Math.cos(3 * x)
    }
  }
  return w
}

/** 原地 radix-2 Cooley–Tukey FFT；re、im 长度必须相同且为 2 的幂 */
export function fftInPlace(re: Float64Array, im: Float64Array): void {
  const n = re.length
  for (let i = 1, j = 0; i < n; i += 1) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) {
      j ^= bit
    }
    j ^= bit
    if (i < j) {
      const tr = re[i]
      re[i] = re[j]
      re[j] = tr
      const ti = im[i]
      im[i] = im[j]
      im[j] = ti
    }
  }
  for (let size = 2; size <= n; size <<= 1) {
    const half = size >> 1
    const angle = (-2 * Math.PI) / size
    for (let start = 0; start < n; start += size) {
      for (let k = 0; k < half; k += 1) {
        const wr = Math.cos(angle * k)
        const wi = Math.sin(angle * k)
        const a = start + k
        const b = a + half
        const tr = re[b] * wr - im[b] * wi
        const ti = re[b] * wi + im[b] * wr
        re[b] = re[a] - tr
        im[b] = im[a] - ti
        re[a] += tr
        im[a] += ti
      }
    }
  }
}

/**
 * 单边幅度谱（与 x 同单位）。返回 N/2 个点，第 k 个对应频率 k·fs/N。
 * 按窗的相干增益校正：一个整周期正弦的谱峰值 = 它的峰值幅度。直流点不乘 2。
 */
export function amplitudeSpectrum(x: Float64Array, kind: WindowKind): Float64Array {
  const n = x.length
  const w = windowCoefficients(kind, n)
  const re = new Float64Array(n)
  const im = new Float64Array(n)
  let coherentGain = 0
  for (let k = 0; k < n; k += 1) {
    re[k] = x[k] * w[k]
    coherentGain += w[k]
  }
  fftInPlace(re, im)
  const amp = new Float64Array(n / 2)
  for (let k = 0; k < n / 2; k += 1) {
    const mag = Math.hypot(re[k], im[k])
    amp[k] = (k === 0 ? mag : 2 * mag) / coherentGain
  }
  return amp
}

/** 幅度转 dB（相对参考幅度 ref）；下限 1e-12 防止 log(0) */
export function toDb(amp: number, ref: number): number {
  return 20 * Math.log10(Math.max(amp, 1e-12) / ref)
}
