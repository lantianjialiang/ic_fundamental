/** 逻辑门网络模型：晶体管网络是串并联树，叶子 = 一只管子。纯逻辑，不含文字。 */

export type Bit = 0 | 1
export type Sig = Record<string, Bit>

/** g = 栅极接的信号名；p = true 表示 PMOS（输入 0 导通），否则 NMOS（输入 1 导通） */
export type Net = { k: 'leaf'; g: string; p?: boolean } | { k: 'ser'; c: Net[] } | { k: 'par'; c: Net[] }

export const nm = (g: string): Net => ({ k: 'leaf', g })
export const pm = (g: string): Net => ({ k: 'leaf', g, p: true })
export const ser = (...c: Net[]): Net => ({ k: 'ser', c })
export const par = (...c: Net[]): Net => ({ k: 'par', c })

export function leafOn(net: Net, sig: Sig): boolean {
  if (net.k !== 'leaf') {
    return false
  }
  return net.p ? sig[net.g] === 0 : sig[net.g] === 1
}

export function conducts(net: Net, sig: Sig): boolean {
  if (net.k === 'leaf') {
    return leafOn(net, sig)
  }
  if (net.k === 'ser') {
    return net.c.every((child) => conducts(child, sig))
  }
  return net.c.some((child) => conducts(child, sig))
}

/** 对偶：串联 ↔ 并联，NMOS ↔ PMOS，栅极信号不变 */
export function dual(net: Net): Net {
  if (net.k === 'leaf') {
    return { k: 'leaf', g: net.g, p: !net.p }
  }
  return { k: net.k === 'ser' ? 'par' : 'ser', c: net.c.map(dual) }
}

export function leafCount(net: Net): number {
  if (net.k === 'leaf') {
    return 1
  }
  return net.c.reduce((sum, child) => sum + leafCount(child), 0)
}

export function usedSignals(net: Net): string[] {
  if (net.k === 'leaf') {
    return [net.g]
  }
  return net.c.flatMap(usedSignals)
}

/** 给每个输入补上取反信号：A → nA。反相器本身不画，用这个信号代替 */
export function withComp(inputs: Record<string, Bit>): Sig {
  const sig: Sig = { ...inputs }
  for (const name of Object.keys(inputs)) {
    sig[`n${name}`] = inputs[name] === 1 ? 0 : 1
  }
  return sig
}

export function sigLabel(g: string): string {
  return g.length > 1 && g.startsWith('n') ? `¬${g.slice(1)}` : g
}

export type Level = '0' | '1' | 'Z' | 'X'

/** 上拉通、下拉断 = 1；反之 = 0；都断 = 高阻 Z；都通 = 冲突 X */
export function outLevel(pun: Net, pdn: Net, sig: Sig): Level {
  const up = conducts(pun, sig)
  const down = conducts(pdn, sig)
  if (up && down) {
    return 'X'
  }
  if (up) {
    return '1'
  }
  return down ? '0' : 'Z'
}

/** 第 i 行输入，names[0] 是最高位，和真值表书写顺序一致 */
export function rowInputs(names: string[], i: number): Record<string, Bit> {
  const out: Record<string, Bit> = {}
  names.forEach((name, k) => {
    out[name] = ((i >> (names.length - 1 - k)) & 1) as Bit
  })
  return out
}

export function rowIndex(names: string[], inputs: Record<string, Bit>): number {
  return names.reduce((acc, name) => acc * 2 + inputs[name], 0)
}

export type GateId = 'nand' | 'nor' | 'tri'

export type GateDef = { inputs: string[]; pdn: Net; pun: Net }

const NAND_PDN = ser(nm('A'), nm('B'))
const NOR_PDN = par(nm('A'), nm('B'))

export const GATE_DEFS: Record<GateId, GateDef> = {
  nand: { inputs: ['A', 'B'], pdn: NAND_PDN, pun: dual(NAND_PDN) },
  nor: { inputs: ['A', 'B'], pdn: NOR_PDN, pun: dual(NOR_PDN) },
  // 反相型三态门：电源侧是 ¬EN 的 PMOS 和地侧是 EN 的 NMOS，A 的两只管子都靠近输出
  tri: { inputs: ['EN', 'A'], pdn: ser(nm('A'), nm('EN')), pun: ser(pm('nEN'), pm('A')) },
}

/** 自己搭门的目标 */
export type TargetId = 'nand' | 'nor' | 'aoi'

export const TARGETS: Array<{ id: TargetId; inputs: string[]; fn: (v: Record<string, Bit>) => Bit }> = [
  { id: 'nand', inputs: ['A', 'B'], fn: (v) => (v.A === 1 && v.B === 1 ? 0 : 1) },
  { id: 'nor', inputs: ['A', 'B'], fn: (v) => (v.A === 1 || v.B === 1 ? 0 : 1) },
  { id: 'aoi', inputs: ['A', 'B', 'C'], fn: (v) => ((v.A === 1 && v.B === 1) || v.C === 1 ? 0 : 1) },
]

export type TplId = 's2' | 'p2' | 's3' | 'p3' | 'sp' | 'ps'

/** 下拉网络的槽位模板：x 是 3 个槽位里学员指派的信号 */
export const TEMPLATES: Array<{ id: TplId; slots: number; build: (x: string[]) => Net }> = [
  { id: 's2', slots: 2, build: (x) => ser(nm(x[0]), nm(x[1])) },
  { id: 'p2', slots: 2, build: (x) => par(nm(x[0]), nm(x[1])) },
  { id: 's3', slots: 3, build: (x) => ser(nm(x[0]), nm(x[1]), nm(x[2])) },
  { id: 'p3', slots: 3, build: (x) => par(nm(x[0]), nm(x[1]), nm(x[2])) },
  { id: 'sp', slots: 3, build: (x) => par(ser(nm(x[0]), nm(x[1])), nm(x[2])) },
  { id: 'ps', slots: 3, build: (x) => ser(par(nm(x[0]), nm(x[1])), nm(x[2])) },
]
