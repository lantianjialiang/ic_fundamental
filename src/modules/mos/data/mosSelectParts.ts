import { loc, type LText } from '../../../i18n/locale'

/** 以下全部是示意参数：器件虚构，数值取同类器件的典型量级。 */
/** 负载电源 V */
export const SUPPLY = 12
/** MCU 高电平 V */
export const VDRIVE = 3.3
/** Vds 额定至少是电源的倍数 */
export const VDS_MARGIN = 1.5
/** Id 额定至少是负载电流的倍数（Id 额定是 Tc = 25 °C 的值，不能满额用） */
export const ID_MARGIN = 1.5
/** 驱动电压减去 Vgs(th) 最大值，至少要留的余量 V */
export const VTH_MARGIN = 1
/** 结温设计上限 °C（绝对最大 150 °C） */
export const TJ_LIMIT = 125
export const TJ_MAX = 150
/** Rds(on) 温度系数 1/°C：125 °C 时约为 25 °C 的 1.5 倍 */
export const TEMPCO = 0.005
/** GPIO 单脚可持续输出的电流 mA（以所用 MCU 数据手册为准） */
export const GPIO_MA = 12
/** 栅极下拉电阻 kΩ */
export const RPD_K = 100
/** 栅极漏电 nA */
export const IGSS_NA = 100
/** 电感负载的电感 mH */
export const L_LOAD_MH = 1
/** 续流肖特基正向压降 V */
export const VF_DIODE = 0.5
/** 米勒平台电压 ≈ Vgs(th) 典型值 + 这个量 V */
export const VPL_OFFSET = 0.7

export type RdsSpec = { vgs: number; mohm: number }

export type Part = {
  id: 'a' | 'b' | 'c' | 'd'
  name: string
  pkg: string
  kind: LText
  /** V */
  vds: number
  /** A，Tc = 25 °C */
  idA: number
  /** 从低 Vgs 到高 Vgs 排列；mΩ，最大值，25 °C。手册没给的 Vgs 就不在里面 */
  rds: RdsSpec[]
  vth: { min: number; typ: number; max: number }
  vgsMax: number
  /** nC，以及测试时的 Vgs */
  qg: number
  qgV: number
  /** pF */
  ciss: number
  coss: number
  crss: number
  /** °C/W，典型 */
  theta: number
}

export const PARTS: Part[] = [
  {
    id: 'a',
    name: 'DEMO-A',
    pkg: 'SOT-23',
    kind: loc('逻辑电平，小封装', 'Logic-level, small package'),
    vds: 30,
    idA: 5.8,
    rds: [
      { vgs: 2.5, mohm: 38 },
      { vgs: 4.5, mohm: 28 },
      { vgs: 10, mohm: 24 },
    ],
    vth: { min: 0.5, typ: 0.8, max: 1.2 },
    vgsMax: 12,
    qg: 6,
    qgV: 4.5,
    ciss: 650,
    coss: 90,
    crss: 60,
    theta: 250,
  },
  {
    id: 'b',
    name: 'DEMO-B',
    pkg: 'TO-220',
    kind: loc('标准电平，10 V 驱动', 'Standard-level, 10 V drive'),
    vds: 60,
    idA: 9,
    rds: [{ vgs: 10, mohm: 270 }],
    vth: { min: 2, typ: 3, max: 4 },
    vgsMax: 20,
    qg: 15,
    qgV: 10,
    ciss: 360,
    coss: 85,
    crss: 35,
    theta: 62,
  },
  {
    id: 'c',
    name: 'DEMO-C',
    pkg: 'DPAK',
    kind: loc('逻辑电平，功率型', 'Logic-level, power part'),
    vds: 30,
    idA: 40,
    rds: [
      { vgs: 2.5, mohm: 14 },
      { vgs: 4.5, mohm: 10 },
      { vgs: 10, mohm: 8 },
    ],
    vth: { min: 0.6, typ: 1, max: 1.5 },
    vgsMax: 12,
    qg: 22,
    qgV: 4.5,
    ciss: 1800,
    coss: 280,
    crss: 160,
    theta: 50,
  },
  {
    id: 'd',
    name: 'DEMO-D',
    pkg: 'SOT-23',
    kind: loc('只标了 4.5 V 的 Rds(on)', 'Rds(on) given from 4.5 V only'),
    vds: 30,
    idA: 3,
    rds: [
      { vgs: 4.5, mohm: 60 },
      { vgs: 10, mohm: 45 },
    ],
    vth: { min: 1, typ: 1.5, max: 2 },
    vgsMax: 20,
    qg: 5,
    qgV: 4.5,
    ciss: 480,
    coss: 70,
    crss: 45,
    theta: 250,
  },
]

export type PartId = Part['id']

/** 取「不超过驱动电压的最高已标注 Vgs」那一点；一个都没有就返回最低点并标记 ok = false */
export function rdsAt(part: Part, vgs: number): { spec: RdsSpec; ok: boolean } {
  let best: RdsSpec | undefined
  for (const s of part.rds) {
    if (s.vgs <= vgs + 1e-9) {
      best = s
    }
  }
  return best ? { spec: best, ok: true } : { spec: part.rds[0], ok: false }
}

export const rdsRow = (part: Part, vgs: number): number | null => part.rds.find((s) => s.vgs === vgs)?.mohm ?? null

export type PkgId = 'sot23' | 'dpak' | 'to220'

export const PKGS: Array<{ id: PkgId; label: LText; theta: number }> = [
  { id: 'sot23', label: loc('SOT-23（小焊盘）', 'SOT-23 (min. pad)'), theta: 250 },
  { id: 'dpak', label: loc('DPAK（1 in² 铜）', 'DPAK (1 in² copper)'), theta: 50 },
  { id: 'to220', label: loc('TO-220（空气中）', 'TO-220 (free air)'), theta: 62 },
]

export type TopologyId = 'low' | 'highN' | 'highP'

export const TOPOLOGIES: Array<{ id: TopologyId; label: LText; hint: LText }> = [
  { id: 'low', label: loc('低边 NMOS（推荐）', 'Low-side NMOS (recommended)'), hint: loc('源极接地，MCU 直接给 Vgs', 'Source at ground; the MCU gives Vgs directly') },
  { id: 'highN', label: loc('高边 NMOS 直驱', 'High-side NMOS, direct drive'), hint: loc('源极跟着负载电压走', 'Source follows the load voltage') },
  { id: 'highP', label: loc('高边 PMOS 直驱', 'High-side PMOS, direct drive'), hint: loc('源极接 12 V，栅极要升到 12 V 才能关', 'Source at 12 V; the gate must rise to 12 V to turn off') },
]

export type LoadId = 'res' | 'ind'

export const LOADS: Array<{ id: LoadId; label: LText }> = [
  { id: 'res', label: loc('阻性（加热片、LED 灯带）', 'Resistive (heater, LED strip)') },
  { id: 'ind', label: loc('感性（继电器、电机、风扇）', 'Inductive (relay, motor, fan)') },
]

export type DiodeId = 'with' | 'without'

export const DIODES: Array<{ id: DiodeId; label: LText }> = [
  { id: 'with', label: loc('并联续流二极管', 'Flyback diode fitted') },
  { id: 'without', label: loc('不加二极管', 'No diode') },
]
