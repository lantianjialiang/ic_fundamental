// 长度和铜厚与 PCB 课同一套常数，避免工具和课里的 1 mil、1 oz 对不上
import { MM_PER_MIL, OZ_MIL } from '../modules/pcb/data/pcbBasicsModel'

export { MM_PER_MIL, OZ_MIL }

/** 1 inch = 25.4 mm；1 mil = 25.4 µm，两个 25.4 是同一换算 */
export const MM_PER_IN = MM_PER_MIL * 1000
export const UM_PER_MIL = MM_PER_IN
export const MM_PER_UM = MM_PER_MIL / UM_PER_MIL
/** 1 oz 铜箔 = 1.378 mil × 25.4 = 35.001 µm，板厂写成 35 µm */
export const UM_PER_OZ = OZ_MIL * UM_PER_MIL
export const MM_PER_OZ = OZ_MIL * MM_PER_MIL

const MAX_BITS = 256

export type RadixBase = 2 | 8 | 10 | 16

const PREFIX: Partial<Record<RadixBase, RegExp>> = {
  2: /^0b/i,
  8: /^0o/i,
  16: /^0x/i,
}

export type ParseDigits =
  | { ok: true; value: bigint }
  | { ok: false; reason: 'empty' | 'digit' | 'long' }

/**
 * 解析整数。负号保留在数值上（不是补码）。
 * 0b / 0o / 0x 按前缀决定进制，不再看当前输入框；没有前缀时用 base。
 */
export function parseDigits(text: string, base: RadixBase): ParseDigits {
  let body = text.trim().replace(/[\s_]/g, '')
  if (!body) return { ok: false, reason: 'empty' }
  let negative = false
  if (body[0] === '+' || body[0] === '-') {
    negative = body[0] === '-'
    body = body.slice(1)
  }
  if (!body) return { ok: false, reason: 'empty' }
  let use: RadixBase = base
  if (/^0x/i.test(body)) {
    use = 16
    body = body.slice(2)
  } else if (/^0b/i.test(body)) {
    use = 2
    body = body.slice(2)
  } else if (/^0o/i.test(body)) {
    use = 8
    body = body.slice(2)
  } else {
    const prefix = PREFIX[base]
    if (prefix?.test(body)) body = body.replace(prefix, '')
  }
  if (!body) return { ok: false, reason: 'empty' }
  const alphabet = '0123456789abcdef'.slice(0, use)
  const lower = body.toLowerCase()
  if ([...lower].some((ch) => !alphabet.includes(ch))) return { ok: false, reason: 'digit' }
  const magnitude = BigInt(use === 16 ? `0x${lower}` : use === 8 ? `0o${lower}` : use === 2 ? `0b${lower}` : lower)
  if (magnitude > 0n && magnitude.toString(2).length > MAX_BITS) return { ok: false, reason: 'long' }
  return { ok: true, value: negative ? -magnitude : magnitude }
}

/** 从右往左每 group 位插入一个空格。group <= 0 时不分组。 */
export function groupDigits(raw: string, group: number): string {
  if (group <= 0) return raw
  const parts: string[] = []
  for (let i = raw.length; i > 0; i -= group) parts.unshift(raw.slice(Math.max(0, i - group), i))
  return parts.join(' ')
}

export function formatBase(value: bigint, base: RadixBase, grouped: boolean): string {
  const negative = value < 0n
  let raw = (negative ? -value : value).toString(base)
  if (base === 16) raw = raw.toUpperCase()
  const group = !grouped ? 0 : base === 2 ? 4 : base === 8 ? 3 : base === 16 ? 2 : 0
  return `${negative ? '-' : ''}${groupDigits(raw, group)}`
}

export function bitLength(value: bigint): number {
  const magnitude = value < 0n ? -value : value
  if (magnitude === 0n) return 1
  return magnitude.toString(2).length
}

/** 工程计数法，单位本身不加前缀（Hz、Ω、V、A、s、F、W）。 */
export function formatEng(value: number, unit: string): string {
  if (!Number.isFinite(value)) return '—'
  if (value === 0) return `0 ${unit}`
  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)
  const powers: Array<[number, string]> = [
    [1e12, 'T'],
    [1e9, 'G'],
    [1e6, 'M'],
    [1e3, 'k'],
    [1, ''],
    [1e-3, 'm'],
    [1e-6, 'µ'],
    [1e-9, 'n'],
    [1e-12, 'p'],
  ]
  const chosen = powers.find(([scale]) => abs >= scale) ?? powers[powers.length - 1]
  const number = String(Number((abs / chosen[0]).toPrecision(6)))
  return `${sign}${number} ${chosen[1]}${unit}`
}

export function parseMeasure(text: string): number | null {
  const body = text.trim().replace(/,/g, '')
  if (!body || body === '-' || body === '.' || body === '-.') return null
  if (!/^[+-]?(\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?$/i.test(body)) return null
  const value = Number(body)
  return Number.isFinite(value) ? value : null
}

/** 去掉二进制浮点尾巴，常规 PCB 数量级保持可往返。 */
export function formatMeasure(value: number): string {
  if (!Number.isFinite(value) || value === 0) return '0'
  const abs = Math.abs(value)
  if (abs >= 1e7 || abs < 1e-6) return Number(value.toPrecision(5)).toExponential()
  return String(Number(value.toPrecision(10)))
}
