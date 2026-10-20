/**
 * RF 课程共用的数字格式化（纯函数，无 DOM）。
 * formatSi(2.4e9, 'Hz') → "2.4 GHz"；formatSi(0.125, 'm') → "125 mm"；formatSi(1e-3, 'W') → "1 mW"。
 * 前缀按 1000 倍一档选择；数值保留 digits 位有效数字。
 */

const PREFIXES: Array<{ exp: number; sym: string }> = [
  { exp: 12, sym: 'T' },
  { exp: 9, sym: 'G' },
  { exp: 6, sym: 'M' },
  { exp: 3, sym: 'k' },
  { exp: 0, sym: '' },
  { exp: -3, sym: 'm' },
  { exp: -6, sym: 'µ' },
  { exp: -9, sym: 'n' },
  { exp: -12, sym: 'p' },
]

export function formatSi(value: number, unit: string, digits = 4): string {
  if (value === 0) {
    return `0 ${unit}`
  }
  if (!Number.isFinite(value)) {
    return `∞ ${unit}`
  }
  const abs = Math.abs(value)
  let hit = PREFIXES[PREFIXES.length - 1]
  for (const prefix of PREFIXES) {
    if (abs >= 10 ** prefix.exp) {
      hit = prefix
      break
    }
  }
  const scaled = Number((value / 10 ** hit.exp).toPrecision(digits))
  return `${scaled} ${hit.sym}${unit}`
}

/** 定点小数；无穷大显示为 ∞（RL、失配损耗在 |Γ| = 0 或 1 时会出现） */
export function fmtNum(value: number, digits: number): string {
  if (Number.isNaN(value)) {
    return '—'
  }
  if (!Number.isFinite(value)) {
    return '∞'
  }
  return value.toFixed(digits)
}

export function fmtFixed(value: number, digits: number, unit: string): string {
  return `${fmtNum(value, digits)} ${unit}`
}
