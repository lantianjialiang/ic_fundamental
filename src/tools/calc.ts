import { K_LAYER, currentForWidthMil, widthMilForCurrent, type LayerKind } from '../modules/pcb/data/pcbBasicsModel'
import { MM_PER_MIL, OZ_MIL } from './convert'

export const WIDTHS = [8, 16, 32, 64] as const
export type BitWidth = (typeof WIDTHS)[number]

export function maskOf(width: number): bigint {
  return (1n << BigInt(width)) - 1n
}

/** 截到低 width 位。负数按无限符号位的补码取低位，所以 -1 在 8 位里是 0xFF。 */
export function lowBits(value: bigint, width: number): bigint {
  return value & maskOf(width)
}

export function signedFromBits(bits: bigint, width: number): bigint {
  const sign = 1n << BigInt(width - 1)
  return bits & sign ? bits - (sign << 1n) : bits
}

/** 同宽度内取负：按位取反再加 1，再截断。 */
export function negateBits(bits: bigint, width: number): bigint {
  return lowBits(~bits + 1n, width)
}

export function intRange(width: number) {
  const sign = 1n << BigInt(width - 1)
  return { unsignedMax: maskOf(width), signedMin: -sign, signedMax: sign - 1n }
}

export function fitsWidth(value: bigint, width: number): boolean {
  const range = intRange(width)
  return value >= range.signedMin && value <= range.unsignedMax
}

export type BitCalc = {
  a: bigint
  b: bigint
  and: bigint
  or: bigint
  xor: bigint
  not: bigint
  shl: bigint
  shr: bigint
  field: bigint
  fieldMask: bigint
}

export function bitCalc(a: bigint, b: bigint, width: number, shift: number, hi: number, lo: number): BitCalc | null {
  if (![shift, hi, lo].every(Number.isInteger)) return null
  if (hi < lo || lo < 0 || hi >= width || shift < 0 || shift > 64) return null
  const m = maskOf(width)
  const aa = a & m
  const bb = b & m
  const sh = BigInt(shift)
  const fieldMask = maskOf(hi - lo + 1) << BigInt(lo)
  return {
    a: aa,
    b: bb,
    and: aa & bb,
    or: aa | bb,
    xor: aa ^ bb,
    not: ~aa & m,
    shl: (aa << sh) & m,
    shr: aa >> sh,
    field: (aa & fieldMask) >> BigInt(lo),
    fieldMask,
  }
}

export function formatHexWidth(value: bigint, width: number): string {
  const digits = Math.ceil(width / 4)
  return (value & maskOf(width)).toString(16).toUpperCase().padStart(digits, '0')
}

export function formatBits(value: bigint, width: number): string {
  const raw = (value & maskOf(width)).toString(2).padStart(width, '0')
  const parts: string[] = []
  for (let i = raw.length; i > 0; i -= 4) parts.unshift(raw.slice(Math.max(0, i - 4), i))
  return parts.join(' ')
}

export function parseBytes(text: string): number[] | null {
  const groups = text.trim().split(/[\s_,:-]+/).map((part) => part.replace(/^0x/i, ''))
  if (!groups.every((group) => /^(?:[\da-f]{2})+$/i.test(group))) return null
  const hex = groups.join('')
  if (hex.length > 32) return null
  const bytes: number[] = []
  for (let i = 0; i < hex.length; i += 2) bytes.push(Number.parseInt(hex.slice(i, i + 2), 16))
  return bytes
}

export function intFromBytes(bytes: number[], little: boolean): bigint {
  const order = little ? [...bytes].reverse() : bytes
  return order.reduce((value, byte) => (value << 8n) | BigInt(byte), 0n)
}

export function asciiByte(byte: number): string {
  return byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : '·'
}

export type FloatKind = 'f32' | 'f64'
export type FloatClass = 'normal' | 'subnormal' | 'zero' | 'inf' | 'nan'

const FLOAT_SPEC = {
  f32: { width: 32, expBits: 8, manBits: 23, bias: 127 },
  f64: { width: 64, expBits: 11, manBits: 52, bias: 1023 },
} as const

export function encodeFloat(value: number, kind: FloatKind): bigint {
  if (kind === 'f32') {
    const buffer = new ArrayBuffer(4)
    new Float32Array(buffer)[0] = value
    return BigInt(new Uint32Array(buffer)[0])
  }
  const buffer = new ArrayBuffer(8)
  new Float64Array(buffer)[0] = value
  return new BigUint64Array(buffer)[0]
}

export function decodeFloat(bits: bigint, kind: FloatKind): { value: number; sign: number; exp: number; man: bigint; cls: FloatClass; unbiased: number } {
  const spec = FLOAT_SPEC[kind]
  const stored = bits & maskOf(spec.width)
  const sign = Number((stored >> BigInt(spec.width - 1)) & 1n)
  const exp = Number((stored >> BigInt(spec.manBits)) & maskOf(spec.expBits))
  const man = stored & maskOf(spec.manBits)
  const maxExp = (1 << spec.expBits) - 1
  let cls: FloatClass = 'normal'
  let unbiased = exp - spec.bias
  if (exp === 0) {
    cls = man === 0n ? 'zero' : 'subnormal'
    unbiased = 1 - spec.bias
  } else if (exp === maxExp) {
    cls = man === 0n ? 'inf' : 'nan'
    unbiased = exp
  }
  const value = kind === 'f32' ? float32FromBits(stored) : float64FromBits(stored)
  return { value, sign, exp, man, cls, unbiased }
}

function float32FromBits(bits: bigint): number {
  const buffer = new ArrayBuffer(4)
  new Uint32Array(buffer)[0] = Number(bits & 0xffffffffn)
  return new Float32Array(buffer)[0]
}

function float64FromBits(bits: bigint): number {
  const buffer = new ArrayBuffer(8)
  new BigUint64Array(buffer)[0] = bits & maskOf(64)
  return new Float64Array(buffer)[0]
}

export function splitFloatBits(bits: bigint, kind: FloatKind): { sign: string; exp: string; man: string } {
  const spec = FLOAT_SPEC[kind]
  const raw = (bits & maskOf(spec.width)).toString(2).padStart(spec.width, '0')
  return {
    sign: raw.slice(0, 1),
    exp: raw.slice(1, 1 + spec.expBits),
    man: raw.slice(1 + spec.expBits),
  }
}

export function parseFloatBits(text: string, kind: FloatKind): bigint | null {
  const body = text.trim().replace(/[\s_]/g, '').replace(/^0x/i, '')
  const width = FLOAT_SPEC[kind].width / 4
  if (!body || body.length > width || /[^0-9a-fA-F]/.test(body)) return null
  return BigInt(`0x${body}`)
}

export function timerCalc(clockHz: number, prescaler: number, count: number, high: number) {
  if (!Number.isFinite(clockHz) || clockHz <= 0) return null
  if (![prescaler, count, high].every(Number.isSafeInteger) || prescaler <= 0 || count <= 0 || high < 0 || high > count) return null
  const tick = prescaler / clockHz
  const period = (prescaler * count) / clockHz
  const freq = clockHz / (prescaler * count)
  const duty = high / count
  return { tick, period, freq, duty }
}

export function traceFromCurrent(amp: number, dT: number, oz: number, layer: LayerKind) {
  if (!(amp > 0) || !(dT > 0) || !(oz > 0)) return null
  const widthMil = widthMilForCurrent(amp, dT, oz, layer)
  const area = widthMil * oz * OZ_MIL
  return { widthMil, widthMm: widthMil * MM_PER_MIL, area, k: K_LAYER[layer] }
}

export function currentFromTrace(widthMm: number, dT: number, oz: number, layer: LayerKind) {
  if (!(widthMm > 0) || !(dT > 0) || !(oz > 0)) return null
  const widthMil = widthMm / MM_PER_MIL
  const amp = currentForWidthMil(widthMil, dT, oz, layer)
  const area = widthMil * oz * OZ_MIL
  return { amp, area, k: K_LAYER[layer], widthMil }
}

/** IPC-2141A 差分拟合。Z0 是单根走线的单端阻抗，s 是边到边间距。 */
export function diffImpedance(z0: number, gap: number, height: number, microstrip: boolean) {
  if (!(z0 > 0) || !(gap > 0) || !(height > 0)) return null
  const ratio = gap / height
  const k = microstrip ? 0.48 * Math.exp(-0.96 * ratio) : 0.347 * Math.exp(-2.9 * ratio)
  return { k, zDiff: 2 * z0 * (1 - k), uncoupled: 2 * z0 }
}

export type OhmKey = 'v' | 'i' | 'r' | 'p'
export type OhmPair = 'vi' | 'vr' | 'vp' | 'ir' | 'ip' | 'rp'

export function solveOhm(known: Partial<Record<OhmKey, number>>):
  | { ok: true; v: number; i: number; r: number; p: number; pair: OhmPair }
  | { ok: false; reason: 'count' | 'zero' | 'domain' } {
  const keys = (['v', 'i', 'r', 'p'] as const).filter((key) => known[key] !== undefined && Number.isFinite(known[key]))
  if (keys.length !== 2) return { ok: false, reason: 'count' }
  const { v, i, r, p } = known
  const has = (key: OhmKey) => keys.includes(key)
  const done = (vv: number, ii: number, rr: number, pp: number, pair: OhmPair) =>
    [vv, ii, rr, pp].every(Number.isFinite) ? { ok: true as const, v: vv, i: ii, r: rr, p: pp, pair } : { ok: false as const, reason: 'domain' as const }
  if (has('v') && has('i')) {
    if (i === 0) return { ok: false, reason: 'zero' }
    return done(v!, i!, v! / i!, v! * i!, 'vi')
  }
  if (has('v') && has('r')) {
    if (r === 0) return { ok: false, reason: 'zero' }
    return done(v!, v! / r!, r!, (v! * v!) / r!, 'vr')
  }
  if (has('v') && has('p')) {
    if (v === 0) return { ok: false, reason: 'zero' }
    return done(v!, p! / v!, (v! * v!) / p!, p!, 'vp')
  }
  if (has('i') && has('r')) return done(i! * r!, i!, r!, i! * i! * r!, 'ir')
  if (has('i') && has('p')) {
    if (i === 0) return { ok: false, reason: 'zero' }
    return done(p! / i!, i!, p! / (i! * i!), p!, 'ip')
  }
  if (r! === 0 || r! * p! < 0) return { ok: false, reason: r === 0 ? 'zero' : 'domain' }
  return done(Math.sqrt(p! * r!), Math.sqrt(p! / r!), r!, p!, 'rp')
}

export function dividerOut(vin: number, r1: number, r2: number) {
  if (!Number.isFinite(vin) || !(r1 > 0) || !(r2 > 0)) return null
  const vout = (vin * r2) / (r1 + r2)
  return { vout, current: vin / (r1 + r2) }
}

export function dividerR1(vin: number, vout: number, r2: number) {
  if (!(r2 > 0) || vout === 0 || vin === vout) return null
  const r1 = (r2 * (vin - vout)) / vout
  return r1 > 0 ? r1 : null
}

export function dividerR2(vin: number, vout: number, r1: number) {
  if (!(r1 > 0) || vin === vout) return null
  const r2 = (r1 * vout) / (vin - vout)
  return r2 > 0 ? r2 : null
}

export function ledLimit(vs: number, vf: number, current: number) {
  if (!(vf > 0)) return { ok: false as const, reason: 'forward' as const }
  if (!(current > 0)) return { ok: false as const, reason: 'current' as const }
  if (!(vs - vf > 0)) return { ok: false as const, reason: 'drop' as const }
  const drop = vs - vf
  return { ok: true as const, r: drop / current, p: drop * current, drop }
}

export function rcForward(resistance: number, capacitance: number) {
  if (!(resistance > 0) || !(capacitance > 0)) return null
  const tau = resistance * capacitance
  return { tau, fc: 1 / (2 * Math.PI * tau) }
}

export function capacitanceFor(fc: number, resistance: number) {
  if (!(fc > 0) || !(resistance > 0)) return null
  return 1 / (2 * Math.PI * resistance * fc)
}

export function resistanceFor(fc: number, capacitance: number) {
  if (!(fc > 0) || !(capacitance > 0)) return null
  return 1 / (2 * Math.PI * fc * capacitance)
}

/** E24 / E96 的每十倍程有效数字，单位是“×10^n”。 */
export const E24 = [10, 11, 12, 13, 15, 16, 18, 20, 22, 24, 27, 30, 33, 36, 39, 43, 47, 51, 56, 62, 68, 75, 82, 91]
export const E96 = [
  100, 102, 105, 107, 110, 113, 115, 118, 121, 124, 127, 130, 133, 137, 140, 143, 147, 150, 154, 158, 162, 165, 169, 174, 178, 182, 187, 191, 196, 200, 205, 210, 215, 221, 226, 232, 237, 243, 249, 255, 261, 267, 274, 280, 287, 294, 301, 309, 316, 324, 332, 340, 348, 357, 365, 374, 383, 392, 402, 412, 422, 432, 442, 453, 464, 475, 487, 499, 511, 523, 536, 549, 562, 576, 590, 604, 619, 634, 649, 665, 681, 698, 715, 732, 750, 768, 787, 806, 825, 845, 866, 887, 909, 931, 953, 976,
]

export function nearestSeries(ohms: number, series: readonly number[], base: number) {
  if (!(ohms > 0)) return null
  const exp = Math.floor(Math.log10(ohms))
  let best = series[0] * 10 ** (exp - Math.floor(Math.log10(base)))
  let bestErr = Infinity
  for (let decade = exp - 2; decade <= exp + 2; decade += 1) {
    const scale = 10 ** (decade - Math.floor(Math.log10(base)))
    for (const sig of series) {
      const value = sig * scale
      const err = Math.abs(value - ohms) / ohms
      if (err < bestErr) {
        best = value
        bestErr = err
      }
    }
  }
  const neighbors = seriesValuesNear(ohms, series, base)
  return { value: best, errorPct: ((best - ohms) / ohms) * 100, low: neighbors.low, high: neighbors.high }
}

function seriesValuesNear(ohms: number, series: readonly number[], base: number) {
  const all: number[] = []
  const exp = Math.floor(Math.log10(ohms))
  for (let decade = exp - 2; decade <= exp + 2; decade += 1) {
    const scale = 10 ** (decade - Math.floor(Math.log10(base)))
    for (const sig of series) all.push(sig * scale)
  }
  all.sort((a, b) => a - b)
  let low = all[0]
  let high = all[all.length - 1]
  for (const value of all) {
    if (value <= ohms) low = value
    if (value >= ohms) {
      high = value
      break
    }
  }
  return { low, high }
}

export const DIGIT_COLORS = ['black', 'brown', 'red', 'orange', 'yellow', 'green', 'blue', 'violet', 'grey', 'white'] as const
export const COLOR_HEX: Record<(typeof DIGIT_COLORS)[number] | 'gold' | 'silver', string> = {
  black: '#222222',
  brown: '#8a4b08',
  red: '#c62828',
  orange: '#ef6c00',
  yellow: '#f9a825',
  green: '#2e7d32',
  blue: '#1565c0',
  violet: '#6a1b9a',
  grey: '#757575',
  white: '#f5f5f5',
  gold: '#d4a017',
  silver: '#b0b0b0',
}

export type BandCount = 4 | 5

/** 4 环：两位有效数字；5 环：三位。乘数是 10 的指数，-1 金，-2 银。 */
export function valueFromBands(digits: number[], exp: number): number {
  const sig = digits.reduce((acc, digit) => acc * 10 + digit, 0)
  return sig * 10 ** exp
}

export function bandsFromValue(ohms: number, count: BandCount): { digits: number[]; exp: number; exact: boolean } | null {
  if (!(ohms > 0)) return null
  const figures = count === 4 ? 2 : 3
  let exp = Math.floor(Math.log10(ohms)) - (figures - 1)
  let sig = ohms / 10 ** exp
  if (sig >= 10 ** figures) {
    sig /= 10
    exp += 1
  }
  const rounded = Math.round(sig)
  const bandExp = exp + (rounded >= 10 ** figures ? 1 : 0)
  if (bandExp < -2 || bandExp > 9) return null
  const sigClamped = rounded >= 10 ** figures ? Math.round(rounded / 10) : rounded
  const digits: number[] = []
  let rest = sigClamped
  for (let i = 0; i < figures; i += 1) {
    const place = 10 ** (figures - 1 - i)
    digits.push(Math.floor(rest / place))
    rest %= place
  }
  const rebuilt = valueFromBands(digits, bandExp)
  return { digits, exp: bandExp, exact: Math.abs(rebuilt - ohms) <= ohms * 1e-9 }
}
