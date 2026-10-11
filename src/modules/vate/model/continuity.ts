/**
 * 开短路（Continuity）教学模型（纯函数，无 React、无文案）。
 * 数值仅为教学示例；实际开短路的激励极性、电流、钳位和判定窗口因 ATE 平台和器件而异。
 *
 * 电路：8 脚芯片，Pin 4 = GND（基准 0 V），Pin 8 = VDD，其余 6 个是信号脚。
 * 每个信号脚：焊盘(pad) —R_PIN— 结点(junction)，结点上有对 GND 的下二极管和对 VDD 的上二极管。
 * VDD 节点上有 GND→VDD 的电源钳位二极管和内核等效负载 R_CORE。
 * 缺陷接在焊盘上：对地 / 对 VDD / 两脚之间 R_SHORT；开路 = 测试机到焊盘断开；高接触电阻 = 串在测试机和焊盘之间。
 * 测一个脚时：PMU 对它加电流（带电压钳位），其它信号脚和 VDD 按设置接 0 V 或浮空。
 * 用带阻尼的牛顿法解节点方程；结果和求解顺序无关，没有任何随机量。
 */

export type PinId = 'p1' | 'p2' | 'p3' | 'p4' | 'p5' | 'p6' | 'p7' | 'p8'
export type PinKind = 'sig' | 'gnd' | 'vdd'

export const PINS: Array<{ id: PinId; no: number; name: string; kind: PinKind }> = [
  { id: 'p1', no: 1, name: 'IN0', kind: 'sig' },
  { id: 'p2', no: 2, name: 'IN1', kind: 'sig' },
  { id: 'p3', no: 3, name: 'IN2', kind: 'sig' },
  { id: 'p4', no: 4, name: 'GND', kind: 'gnd' },
  { id: 'p5', no: 5, name: 'OUT', kind: 'sig' },
  { id: 'p6', no: 6, name: 'EN', kind: 'sig' },
  { id: 'p7', no: 7, name: 'CLK', kind: 'sig' },
  { id: 'p8', no: 8, name: 'VDD', kind: 'vdd' },
]
export const SIG_PINS: PinId[] = PINS.filter((p) => p.kind === 'sig').map((p) => p.id)

/** 保护二极管：结压降 0.625 V @ 100 µA，n·Vt = 40 mV；加上 R_PIN 后焊盘读数约 0.65 V */
export const DIODE_VJ = 0.625
export const DIODE_IREF = 100e-6
export const DIODE_NVT = 0.04
export const DIODE_IS = DIODE_IREF / Math.exp(DIODE_VJ / DIODE_NVT)
/** 焊盘到二极管结的等效串联电阻（Ω）：大电流时压降明显变大 */
export const R_PIN = 250
/** 正常接触电阻、硬短路电阻（Ω） */
export const RC_GOOD = 1
export const R_SHORT = 1
/** 未上电内核在 VDD 与 GND 之间的等效负载（Ω） */
export const R_CORE = 50e3
/** 电源钳位二极管的面积倍数（相对单个保护二极管） */
export const RAIL_IS_MULT = 20
/** 每个节点对地的极小电导，避免浮空节点让矩阵奇异 */
const GMIN = 1e-12
/** 判为“边缘”：落在窗口内，但和同条件下的好片参考值相差超过这个值（V） */
export const MARGIN_V = 0.15

export type DefectKind = 'none' | 'open' | 'pinPin' | 'pinGnd' | 'pinVdd' | 'contact'
export type Defect = { kind: DefectKind; a: PinId; b: PinId; rc: number }
export type Bias = 'gnd' | 'float'

export type OsConfig = {
  /** 带符号的 Force 电流（µA），正 = 流进管脚 */
  forceUa: number
  /** 电压钳位幅值（V），对称 ±clampV */
  clampV: number
  /** 带符号的门限（V）：Open 门限的绝对值要大于 Short 门限 */
  openTh: number
  shortTh: number
  others: Bias
  vdd: Bias
}

export type OsVerdict = 'pass' | 'marginal' | 'open' | 'short' | 'abort'
export type OsAbort = 'window' | null

export type PinMeasure = {
  /** 测试机端读到的电压（V） */
  vm: number
  /** 实际送进去的电流（µA） */
  iUa: number
  clamped: boolean
}

export type OsRow = PinMeasure & {
  pin: PinId
  verdict: OsVerdict
  /** 同条件下无缺陷好片的读数，用来判“边缘” */
  golden: PinMeasure
}

export type OsResult = {
  abort: OsAbort
  rows: OsRow[]
  /** Force 方向和判定窗口方向不一致 */
  polarityMismatch: boolean
  zeroForce: boolean
  /** 钳位比好片读数还小：好脚也会撞钳位 */
  clampBelowDiode: boolean
  /** 钳位比 Open 门限还小：开路脚读不到门限外 */
  clampInsideWindow: boolean
  /** +I 测上二极管时 VDD 浮空：电流没有回路 */
  posWithVddFloat: boolean
}

/* ---------------- 电路求解 ---------------- */

const GND = -1
const XMAX = 40

type Elem =
  | { kind: 'g'; a: number; b: number; g: number }
  | { kind: 'd'; a: number; b: number; is: number }

/** 二极管电流及其导数；指数在 v/nVt > XMAX 后线性外延，避免溢出 */
function diode(v: number, is: number): [number, number] {
  const x = v / DIODE_NVT
  if (x > XMAX) {
    const e = Math.exp(XMAX)
    return [is * (e * (1 + x - XMAX) - 1), (is * e) / DIODE_NVT]
  }
  const e = Math.exp(x)
  return [is * (e - 1), (is * e) / DIODE_NVT]
}

function solveLinear(a: number[][], b: number[]): number[] {
  const n = b.length
  const m = a.map((row, i) => [...row, b[i]])
  for (let c = 0; c < n; c++) {
    let p = c
    for (let r = c + 1; r < n; r++) if (Math.abs(m[r][c]) > Math.abs(m[p][c])) p = r
    ;[m[c], m[p]] = [m[p], m[c]]
    const piv = m[c][c] || 1e-30
    for (let r = c + 1; r < n; r++) {
      const f = m[r][c] / piv
      if (f === 0) continue
      for (let k = c; k <= n; k++) m[r][k] -= f * m[c][k]
    }
  }
  const x = new Array<number>(n).fill(0)
  for (let r = n - 1; r >= 0; r--) {
    let s = m[r][n]
    for (let k = r + 1; k < n; k++) s -= m[r][k] * x[k]
    x[r] = s / (m[r][r] || 1e-30)
  }
  return x
}

/** 牛顿法求节点电压：elems 为元件，inject[i] 为注入节点 i 的电流 */
function solve(n: number, elems: Elem[], inject: number[]): number[] {
  const v = new Array<number>(n).fill(0)
  for (let iter = 0; iter < 600; iter++) {
    const f = new Array<number>(n).fill(0)
    const j = Array.from({ length: n }, () => new Array<number>(n).fill(0))
    for (let i = 0; i < n; i++) {
      f[i] = GMIN * v[i] - inject[i]
      j[i][i] = GMIN
    }
    for (const e of elems) {
      const va = e.a === GND ? 0 : v[e.a]
      const vb = e.b === GND ? 0 : v[e.b]
      const [i, g] = e.kind === 'g' ? [e.g * (va - vb), e.g] : diode(va - vb, e.is)
      if (e.a !== GND) {
        f[e.a] += i
        j[e.a][e.a] += g
        if (e.b !== GND) j[e.a][e.b] -= g
      }
      if (e.b !== GND) {
        f[e.b] -= i
        j[e.b][e.b] += g
        if (e.a !== GND) j[e.b][e.a] -= g
      }
    }
    const dv = solveLinear(
      j,
      f.map((x) => -x),
    )
    const big = Math.max(...dv.map(Math.abs))
    const s = big > 0.1 ? 0.1 / big : 1
    for (let i = 0; i < n; i++) v[i] += s * dv[i]
    if (big < 1e-9) break
  }
  return v
}

const sigIndex = (pin: PinId) => SIG_PINS.indexOf(pin)
const padNode = (k: number) => 2 * k
const juncNode = (k: number) => 2 * k + 1
const VDD_NODE = 2 * SIG_PINS.length
const NODES = VDD_NODE + 1

/** 某个脚到测试机的接触电阻；开路为 Infinity */
function contactOf(defect: Defect, pin: PinId): number {
  if (defect.kind === 'open' && defect.a === pin) return Infinity
  if (defect.kind === 'contact' && defect.a === pin) return defect.rc
  return RC_GOOD
}

/** 测一个信号脚，返回测试机端读数 */
export function measurePin(defect: Defect, cfg: OsConfig, pin: PinId): PinMeasure {
  const t = sigIndex(pin)
  const iForce = cfg.forceUa * 1e-6
  const sign = cfg.forceUa >= 0 ? 1 : -1
  const rcT = contactOf(defect, pin)
  if (!Number.isFinite(rcT)) {
    return iForce === 0 ? { vm: 0, iUa: 0, clamped: false } : { vm: sign * cfg.clampV, iUa: 0, clamped: true }
  }

  const elems: Elem[] = []
  SIG_PINS.forEach((id, k) => {
    elems.push({ kind: 'g', a: padNode(k), b: juncNode(k), g: 1 / R_PIN })
    elems.push({ kind: 'd', a: GND, b: juncNode(k), is: DIODE_IS })
    elems.push({ kind: 'd', a: juncNode(k), b: VDD_NODE, is: DIODE_IS })
    if (k !== t && cfg.others === 'gnd') {
      const rc = contactOf(defect, id)
      if (Number.isFinite(rc)) elems.push({ kind: 'g', a: padNode(k), b: GND, g: 1 / rc })
    }
  })
  elems.push({ kind: 'd', a: GND, b: VDD_NODE, is: DIODE_IS * RAIL_IS_MULT })
  elems.push({ kind: 'g', a: VDD_NODE, b: GND, g: 1 / R_CORE })
  if (cfg.vdd === 'gnd') elems.push({ kind: 'g', a: VDD_NODE, b: GND, g: 1 / RC_GOOD })

  const gs = 1 / R_SHORT
  if (defect.kind === 'pinGnd') elems.push({ kind: 'g', a: padNode(sigIndex(defect.a)), b: GND, g: gs })
  if (defect.kind === 'pinVdd') elems.push({ kind: 'g', a: padNode(sigIndex(defect.a)), b: VDD_NODE, g: gs })
  if (defect.kind === 'pinPin' && defect.a !== defect.b) {
    elems.push({ kind: 'g', a: padNode(sigIndex(defect.a)), b: padNode(sigIndex(defect.b)), g: gs })
  }

  const inject = new Array<number>(NODES).fill(0)
  inject[padNode(t)] = iForce
  const v = solve(NODES, elems, inject)
  const vm = v[padNode(t)] + iForce * rcT
  if (Math.abs(vm) <= cfg.clampV || iForce === 0) return { vm, iUa: cfg.forceUa, clamped: false }

  // 超出钳位：PMU 变成电压源 ±clampV，经接触电阻接到焊盘
  const vc = sign * cfg.clampV
  const gc = 1 / rcT
  const clampElems: Elem[] = [...elems, { kind: 'g', a: padNode(t), b: GND, g: gc }]
  const clampInject = new Array<number>(NODES).fill(0)
  clampInject[padNode(t)] = vc * gc
  const vc2 = solve(NODES, clampElems, clampInject)
  return { vm: vc, iUa: (vc - vc2[padNode(t)]) * gc * 1e6, clamped: true }
}

/** 判定窗口是否有效：两个门限同号，且 |Open| > |Short| > 0 */
export function windowValid(cfg: OsConfig): boolean {
  const { openTh, shortTh } = cfg
  return openTh !== 0 && shortTh !== 0 && Math.sign(openTh) === Math.sign(shortTh) && Math.abs(openTh) > Math.abs(shortTh)
}

export function judge(m: PinMeasure, golden: PinMeasure, cfg: OsConfig): OsVerdict {
  if (m.clamped) return 'open'
  const neg = cfg.openTh < 0
  if (neg ? m.vm <= cfg.openTh : m.vm >= cfg.openTh) return 'open'
  if (neg ? m.vm >= cfg.shortTh : m.vm <= cfg.shortTh) return 'short'
  if (!golden.clamped && Math.abs(m.vm - golden.vm) > MARGIN_V) return 'marginal'
  return 'pass'
}

export const NO_DEFECT: Defect = { kind: 'none', a: SIG_PINS[0], b: SIG_PINS[1], rc: RC_GOOD }

export function runOs(defect: Defect, cfg: OsConfig, pins: PinId[]): OsResult {
  const valid = windowValid(cfg)
  const goldenRef = measurePin(NO_DEFECT, cfg, SIG_PINS[0])
  const posWithVddFloat = cfg.forceUa > 0 && cfg.vdd === 'float'
  const rows: OsRow[] = pins.map((pin) => {
    const golden = measurePin(NO_DEFECT, cfg, pin)
    if (!valid) return { pin, vm: 0, iUa: 0, clamped: false, verdict: 'abort', golden }
    const m = measurePin(defect, cfg, pin)
    return { pin, ...m, verdict: judge(m, golden, cfg), golden }
  })
  return {
    abort: valid ? null : 'window',
    rows,
    polarityMismatch: cfg.forceUa !== 0 && Math.sign(cfg.forceUa) !== Math.sign(cfg.openTh),
    zeroForce: cfg.forceUa === 0,
    clampBelowDiode: cfg.forceUa !== 0 && goldenRef.clamped && !posWithVddFloat,
    clampInsideWindow: cfg.clampV < Math.abs(cfg.openTh),
    posWithVddFloat,
  }
}

/** 诊断练习的标准答案比较：类型一致，管脚一致（两脚短路不分先后） */
export function sameDefect(a: Defect, b: Defect): boolean {
  if (a.kind !== b.kind) return false
  if (a.kind === 'none') return true
  if (a.kind === 'pinPin') return (a.a === b.a && a.b === b.b) || (a.a === b.b && a.b === b.a)
  return a.a === b.a
}
