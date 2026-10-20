/**
 * RF-01 频率概述的教学模型（纯函数）。
 * 假设：自由空间（真空），光速 c = 3×10⁸ m/s；不考虑介质（PCB 等介质里波长会变短）。
 * 波长：λ = c / f。频段按 ITU 的 MF–EHF 划分，下限含、上限不含。
 * 滑块是对数刻度：位置 0–1000 线性映射到 log10(f)，覆盖 1 MHz 到约 316 GHz。
 */
import { loc, type LText } from '../../i18n/locale'

/** 自由空间光速，m/s（教学取整为 3×10⁸） */
export const C_LIGHT = 3e8

/** 滑块覆盖的 log10(f) 范围：1 MHz 到约 316 GHz */
export const LOG_MIN = 6
export const LOG_MAX = 11.5

/** 滑块步数 */
export const SLIDER_STEPS = 1000

export type Band = { code: string; low: number; high: number; name: LText; uses: LText }

/** 频段表，顺序即从低到高 */
export const BANDS: Band[] = [
  {
    code: 'MF',
    low: 0.3e6,
    high: 3e6,
    name: loc('MF 中波', 'MF (medium wave)'),
    uses: loc('AM 广播', 'AM broadcast'),
  },
  {
    code: 'HF',
    low: 3e6,
    high: 30e6,
    name: loc('HF 短波', 'HF (short wave)'),
    uses: loc('短波广播、业余无线电', 'shortwave broadcast, amateur radio'),
  },
  {
    code: 'VHF',
    low: 30e6,
    high: 300e6,
    name: loc('VHF 甚高频', 'VHF (very high frequency)'),
    uses: loc('FM 广播、对讲机', 'FM broadcast, two-way radio'),
  },
  {
    code: 'UHF',
    low: 300e6,
    high: 3e9,
    name: loc('UHF 特高频', 'UHF (ultra high frequency)'),
    uses: loc('蜂窝移动通信、GPS、Wi-Fi 2.4 GHz', 'cellular, GPS, Wi-Fi 2.4 GHz'),
  },
  {
    code: 'SHF',
    low: 3e9,
    high: 30e9,
    name: loc('SHF 超高频（微波）', 'SHF (microwave)'),
    uses: loc('Wi-Fi 5 GHz、雷达、5G 的 3–7 GHz 频段', 'Wi-Fi 5 GHz, radar, 5G 3–7 GHz bands'),
  },
  {
    code: 'EHF',
    low: 30e9,
    high: 300e9,
    name: loc('EHF 极高频（毫米波）', 'EHF (millimetre wave)'),
    uses: loc('5G 毫米波、车载雷达 77 GHz', '5G mmWave, 77 GHz automotive radar'),
  },
]

export type Scenario = { id: string; label: LText; freqHz: number }

/** 典型场景，显示顺序即数组顺序；默认取 [0] */
export const SCENARIOS: Scenario[] = [
  { id: 'fm', label: loc('FM 广播 100 MHz', 'FM radio 100 MHz'), freqHz: 100e6 },
  { id: 'gps', label: loc('GPS L1 1.575 GHz', 'GPS L1 1.575 GHz'), freqHz: 1.575e9 },
  { id: 'wifi24', label: loc('Wi-Fi 2.4 GHz', 'Wi-Fi 2.4 GHz'), freqHz: 2.4e9 },
  { id: 'wifi5', label: loc('Wi-Fi 5 GHz', 'Wi-Fi 5 GHz'), freqHz: 5e9 },
  { id: 'mmw', label: loc('5G 毫米波 28 GHz', '5G mmWave 28 GHz'), freqHz: 28e9 },
]

export type OverviewState = { freqHz: number }

export const DEFAULT_OVERVIEW: OverviewState = { freqHz: SCENARIOS[0].freqHz }

/** 滑块位置（0–1000）→ 频率（Hz） */
export function freqFromPos(pos: number): number {
  return 10 ** (LOG_MIN + ((LOG_MAX - LOG_MIN) * pos) / SLIDER_STEPS)
}

/** 频率（Hz）→ 滑块位置（0–1000，四舍五入） */
export function posFromFreq(freqHz: number): number {
  return Math.round(((Math.log10(freqHz) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * SLIDER_STEPS)
}

/** 自由空间波长 λ = c / f（m） */
export function wavelengthM(freqHz: number): number {
  return C_LIGHT / freqHz
}

/** 频率落在哪个频段；超出表的范围时返回 null */
export function bandOf(freqHz: number): Band | null {
  for (const band of BANDS) {
    if (freqHz >= band.low && freqHz < band.high) {
      return band
    }
  }
  return null
}

export type OverviewAnalysis = {
  /** 自由空间波长，m */
  lambdaM: number
  /** λ / 10，m：经验上超过它的走线或线缆要按射频（传输线）处理 */
  tenthM: number
  band: Band | null
}

export function analyseFreq(freqHz: number): OverviewAnalysis {
  const lambdaM = wavelengthM(freqHz)
  return { lambdaM, tenthM: lambdaM / 10, band: bandOf(freqHz) }
}
