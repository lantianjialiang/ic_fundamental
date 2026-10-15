import { loc, type LText } from '../../../i18n/locale'

export type Fr4PartId = 'glass' | 'resin' | 'copper'

export const FR4_PARTS: Array<{ id: Fr4PartId; name: LText; text: LText }> = [
  {
    id: 'glass',
    name: loc('玻纤布（E 玻璃）', 'Glass cloth (E-glass)'),
    text: loc(
      '把很细的玻璃纤维纺成纱，再织成布，一经一纬上下交织。玻璃硬、热膨胀小，所以板子靠它保持强度和尺寸稳定；弱点是纱束之间疏密不均，高速信号走在纱束上和走在树脂上，介电常数会略有不同。',
      'Very fine glass fibres are spun into yarn and woven into cloth, warp and weft passing over and under each other. Glass is stiff and expands little, so it gives the board strength and dimensional stability; the weakness is that yarn bundles and gaps are uneven, so a high-speed signal over a bundle sees a slightly different dielectric constant than over resin.',
    ),
  },
  {
    id: 'resin',
    name: loc('环氧树脂', 'Epoxy resin'),
    text: loc(
      '树脂浸满玻纤布，固化后变成硬而绝缘的整体：它把玻纤粘在一起，也提供绝缘和阻燃（FR 的意思就是 Flame Retardant，阻燃，常加溴系或无卤阻燃剂）。树脂决定 Tg 和耐热，所以温度的问题主要出在这一部分。',
      'Resin saturates the cloth and cures into a hard insulating solid: it bonds the glass together and provides insulation and flame retardance (the FR in FR-4 means Flame Retardant, using brominated or halogen-free additives). The resin sets Tg and heat resistance, so temperature problems mostly come from this part.',
    ),
  },
  {
    id: 'copper',
    name: loc('覆铜箔', 'Copper cladding'),
    text: loc(
      '芯板两面压上铜箔，就是“覆铜板（CCL）”。铜箔朝树脂的一面是粗糙的，像一排小牙齿咬进树脂里，抗剥强度才够；蚀刻掉不要的铜，剩下的就是线路。',
      'Copper foil is pressed onto both faces of the core to make copper-clad laminate (CCL). The face toward the resin is rough, like small teeth biting into the resin, which gives the peel strength; etching away unwanted copper leaves the traces.',
    ),
  },
]

export type GradeId = 'std' | 'mid' | 'high'

export const T0 = 25
export const REFLOW_PEAK = 245
export const BARREL_PPM = 17
export const BOARD_UM = 1600

/** a1 / a2 是 Tg 前后的 Z 向热膨胀系数（ppm/°C），示意参数 */
export const GRADES: Array<{ id: GradeId; label: LText; tg: number; a1: number; a2: number; color: string; text: LText }> = [
  {
    id: 'std',
    label: loc('标准 Tg（130–140 °C）', 'Standard Tg (130–140 °C)'),
    tg: 135,
    a1: 50,
    a2: 260,
    color: '#e29a5a',
    text: loc(
      '标准 FR-4，最便宜，用在消费类和简单的 2 层板。过无铅回流时峰值远高于它的 Tg，板子会在回流里软化膨胀，层数多、板厚大时孔壁容易受力。',
      'Standard FR-4, the cheapest, used in consumer products and simple 2-layer boards. Lead-free reflow peaks far above its Tg, so the board softens and expands in reflow, and thick or high-layer-count boards stress the barrels.',
    ),
  },
  {
    id: 'mid',
    label: loc('中 Tg（约 150 °C）', 'Mid Tg (about 150 °C)'),
    tg: 150,
    a1: 45,
    a2: 240,
    color: '#9aa85c',
    text: loc(
      '中 Tg 板材，价格略高，多数 4–6 层的工控、通信板用它，能应付无铅回流和一般的工作温度。',
      'Mid-Tg laminate, slightly more expensive, used for most 4–6 layer industrial and communication boards; it copes with lead-free reflow and ordinary operating temperatures.',
    ),
  },
  {
    id: 'high',
    label: loc('高 Tg（≥ 170 °C）', 'High Tg (≥ 170 °C)'),
    tg: 175,
    a1: 40,
    a2: 200,
    color: '#5aa2ff',
    text: loc(
      '高 Tg 板材，贵、也更脆，用在车载、服务器、厚多层板和要多次回流返修的板子。Tg 高、Tg 之后膨胀也更小，所以过回流时孔壁受力小。',
      'High-Tg laminate, costlier and more brittle, used in automotive, servers, thick multilayers and boards that see repeated reflow and rework. A higher Tg and lower post-Tg expansion mean less stress on the barrels through reflow.',
    ),
  },
]

export type Grade = (typeof GRADES)[number]

/** 25 °C 起算的 Z 向累计膨胀（ppm） */
export function zExpandPpm(g: Grade, temp: number): number {
  if (temp <= g.tg) {
    return g.a1 * (temp - T0)
  }
  return g.a1 * (g.tg - T0) + g.a2 * (temp - g.tg)
}

/** 比铜孔壁多胀的部分（ppm）：就是拉裂孔壁的应变 */
export function mismatchPpm(g: Grade, temp: number): number {
  return zExpandPpm(g, temp) - BARREL_PPM * (temp - T0)
}

export function boardGrowthUm(g: Grade, temp: number): number {
  return (BOARD_UM * zExpandPpm(g, temp)) / 1e6
}

export const CTI_ROWS: Array<{ id: string; group: string; range: LText; board: LText; use: LText }> = [
  {
    id: 'plc3',
    group: 'PLC 3',
    range: loc('175–249', '175–249'),
    board: loc('普通 FR-4', 'Ordinary FR-4'),
    use: loc('低压消费类、信号板', 'Low-voltage consumer and signal boards'),
  },
  {
    id: 'plc2',
    group: 'PLC 2',
    range: loc('250–399', '250–399'),
    board: loc('改进型 FR-4', 'Improved FR-4'),
    use: loc('一般工控板', 'General industrial boards'),
  },
  {
    id: 'plc1',
    group: 'PLC 1',
    range: loc('400–599', '400–599'),
    board: loc('高 CTI FR-4', 'High-CTI FR-4'),
    use: loc('接市电的电源、适配器', 'Mains-powered supplies and adapters'),
  },
  {
    id: 'plc0',
    group: 'PLC 0',
    range: loc('≥ 600', '≥ 600'),
    board: loc('特殊高 CTI 板材', 'Special high-CTI laminate'),
    use: loc('高压、潮湿、污染严重的场合', 'High voltage, humid or heavily contaminated sites'),
  },
]
