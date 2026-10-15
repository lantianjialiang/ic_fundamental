import { loc, type LText } from '../../../i18n/locale'

export type ZoneId = 'pre' | 'soak' | 'reflow' | 'cool'

export const ZONES: Array<{ id: ZoneId; name: LText; text: LText }> = [
  {
    id: 'pre',
    name: loc('预热', 'Preheat'),
    text: loc(
      '从室温升到约 150 °C，升温不要太快（约 1–3 °C/s）：太快元件会因热应力开裂，锡膏里的溶剂也会飞溅成锡珠。',
      'Rise from room temperature to about 150 °C, not too fast (about 1–3 °C/s): too fast and parts crack from thermal stress and the paste solvent spits out as solder balls.',
    ),
  },
  {
    id: 'soak',
    name: loc('保温', 'Soak'),
    text: loc(
      '在 150–200 °C 停留约 60–120 s：助焊剂活化，去掉焊盘和引脚上的氧化物，大元件和小元件、板子各处的温度趋于一致，这样后面熔化时才同步，不会立碑或没焊透。',
      'Dwell at 150–200 °C for about 60–120 s: flux activates and removes oxide from pads and leads, and large and small parts and all board areas even out in temperature, so they melt together later instead of tombstoning or failing to wet.',
    ),
  },
  {
    id: 'reflow',
    name: loc('回流', 'Reflow'),
    text: loc(
      '越过焊料熔点（SAC305 约 217 °C）后升到峰值，常取 240–250 °C，在熔点以上停留约 45–90 s。峰值太低或时间太短，焊料润湿不充分；峰值太高，会逼近塑封器件约 260 °C 的耐温上限，损坏元件。',
      'Pass the solder melting point (about 217 °C for SAC305) and rise to the peak, commonly 240–250 °C, staying above it for about 45–90 s. Too low a peak or too short a time wets poorly; too high nears the roughly 260 °C limit of moulded parts and damages them.',
    ),
  },
  {
    id: 'cool',
    name: loc('冷却', 'Cooling'),
    text: loc(
      '以约 2–4 °C/s 降温：冷得快，焊点晶粒细、强度好；冷得太慢，焊点粗糙发暗、界面脆；冷得太猛，则会产生热冲击。',
      'Cool at about 2–4 °C/s: a quick cool gives fine grains and a strong joint; too slow gives a coarse, dull joint with a brittle interface; too abrupt causes thermal shock.',
    ),
  },
]

export const REFLOW = {
  liquidus: 217,
  start: 25,
  preEnd: 150,
  preEndT: 90,
  soakEnd: 200,
  soakEndT: 180,
  rampUp: 1,
  dwell: 15,
  coolRate: 2,
  coolEnd: 100,
  windowLo: 240,
  windowHi: 250,
  talMin: 45,
  talMax: 90,
  peakMin: 225,
  peakMax: 260,
  tMax: 360,
}

/** 曲线拐点（时间 s，温度 °C）；回流段 = 保温结束 → 峰值停留结束 */
export function reflowPoints(peak: number) {
  const r = REFLOW
  const tPeak = r.soakEndT + (peak - r.soakEnd) / r.rampUp
  const tHoldEnd = tPeak + r.dwell
  const tCoolEnd = tHoldEnd + (peak - r.coolEnd) / r.coolRate
  return {
    pts: [
      [0, r.start],
      [r.preEndT, r.preEnd],
      [r.soakEndT, r.soakEnd],
      [tPeak, peak],
      [tHoldEnd, peak],
      [tCoolEnd, r.coolEnd],
    ] as Array<[number, number]>,
    tPeak,
    tHoldEnd,
    tCoolEnd,
  }
}

export function timeAboveLiquidus(peak: number) {
  const r = REFLOW
  if (peak <= r.liquidus) {
    return 0
  }
  return (peak - r.liquidus) / r.rampUp + r.dwell + (peak - r.liquidus) / r.coolRate
}

export type Verdict = 'cold' | 'ok' | 'hot'

export function reflowVerdict(peak: number): Verdict {
  const r = REFLOW
  if (peak > r.windowHi) {
    return 'hot'
  }
  if (peak < r.windowLo || timeAboveLiquidus(peak) < r.talMin) {
    return 'cold'
  }
  return 'ok'
}

export const VERDICT_TEXT: Record<Verdict, LText> = {
  cold: loc(
    '偏冷：峰值或熔点以上的时间不够，焊料来不及充分润湿焊盘，会出现冷焊、虚焊。',
    'Too cool: the peak or the time above melting is too small, so the solder cannot fully wet the pads and cold or dry joints result.',
  ),
  ok: loc(
    '在窗口内：焊料充分熔化并润湿，而元件还没有超过耐温。',
    'Inside the window: the solder melts and wets fully while parts stay within their temperature limit.',
  ),
  hot: loc(
    '偏热：峰值超过 250 °C，逼近塑封器件约 260 °C 的耐温上限，元件和板材受损的风险上升。',
    'Too hot: the peak exceeds 250 °C and nears the roughly 260 °C limit of moulded parts, so the risk of damaging parts and board rises.',
  ),
}
