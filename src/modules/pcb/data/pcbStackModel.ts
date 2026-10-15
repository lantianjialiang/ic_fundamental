import { loc, type LText } from '../../../i18n/locale'

export type LayerKind = 'sig' | 'gnd' | 'pwr'
export type StackId = 'l2' | 'l4' | 'l4g' | 'l6'
export type ViaId = 'through' | 'blind' | 'buried' | 'micro'

export const KIND_LABEL: Record<LayerKind, LText> = {
  sig: loc('信号', 'Signal'),
  gnd: loc('地 GND', 'Ground GND'),
  pwr: loc('电源 PWR', 'Power PWR'),
}

export const KIND_COLOR: Record<LayerKind, string> = {
  sig: '#c8963c',
  gnd: '#4f86c6',
  pwr: '#c4574a',
}

export type StackDef = {
  id: StackId
  count: number
  short: LText
  title: LText
  layers: LayerKind[]
  text: LText
  reason: LText
  use: LText
}

export const STACKS: StackDef[] = [
  {
    id: 'l2',
    count: 2,
    short: loc('2 层', '2 layers'),
    title: loc('2 层：Top / Bottom', '2 layers: Top / Bottom'),
    layers: ['sig', 'sig'],
    text: loc(
      '只有一块芯板，两面是铜：顶层放元件、走线，底层走线和铺地。没有内层，也就没有专门的参考平面；回流电流只能沿着线旁边的地铜皮或地线走，所以要把地铺得尽量完整。',
      'One core with copper on both faces: the top layer carries parts and traces, the bottom carries traces and ground pour. There is no inner layer and so no dedicated reference plane; return current has to find ground copper or a ground trace beside the signal, so the ground pour must be as continuous as possible.',
    ),
    reason: loc(
      '没有平面，信号线下面的参考靠铺铜凑出来：简单、便宜，但线一多、频率一高就会被地的缺口限制。',
      'With no plane, the reference under a trace is made up from pour; it is simple and cheap, but a crowded or fast design runs into the gaps in that ground.',
    ),
    use: loc('简单控制板、LED 灯板、传感器小板、低速接口。', 'Simple control boards, LED boards, small sensor boards, slow interfaces.'),
  },
  {
    id: 'l4',
    count: 4,
    short: loc('4 层 Sig/GND/PWR/Sig', '4 layers Sig/GND/PWR/Sig'),
    title: loc('4 层：Sig / GND / PWR / Sig', '4 layers: Sig / GND / PWR / Sig'),
    layers: ['sig', 'gnd', 'pwr', 'sig'],
    text: loc(
      '最常见的 4 层叠法：两层信号在外面，两层平面在里面。第 1 层和第 2 层之间用薄的半固化片，第 2 层地平面离顶层信号很近，回流路径短；第 3 层电源平面和第 4 层信号靠得近。',
      'The most common 4-layer arrangement: two signal layers outside, two planes inside. A thin prepreg sits between L1 and L2, so the ground plane is close under the top signals and the return path is short; the power plane at L3 sits close to the L4 signals.',
    ),
    reason: loc(
      '每个信号层的邻层都是平面，信号有明确的参考，外层走线还可以直接用过孔接到内层的地和电源。',
      'Every signal layer has a plane next to it, so each signal has a clear reference, and outer traces can reach the inner ground and power with short vias.',
    ),
    use: loc('单片机、FPGA 小系统、USB / 以太网等中速数字板。', 'Microcontroller or small FPGA boards, USB / Ethernet and other mid-speed digital boards.'),
  },
  {
    id: 'l4g',
    count: 4,
    short: loc('4 层 Sig/GND/GND/Sig', '4 layers Sig/GND/GND/Sig'),
    title: loc('4 层变体：Sig / GND / GND / Sig', '4-layer variant: Sig / GND / GND / Sig'),
    layers: ['sig', 'gnd', 'gnd', 'sig'],
    text: loc(
      '两个内层都做地，电源在外层用宽线或铺铜走。两个地平面用过孔连在一起，每个信号层都紧贴一个地，回流和屏蔽都更好。',
      'Both inner layers are ground, and power runs on the outer layers as wide traces or pours. The two ground planes are tied together with vias, so every signal layer sits against a ground, which helps return paths and shielding.',
    ),
    reason: loc(
      '代价是电源没有整块平面，供电阻抗和去耦要靠外层铜皮和电容；适合电源轨少、重视 EMI 的板子。',
      'The price is that power has no full plane, so supply impedance and decoupling rely on outer pours and capacitors; it suits boards with few rails that care about EMI.',
    ),
    use: loc('电源轨很少的混合信号板、对辐射敏感的板。', 'Mixed-signal boards with few rails, boards sensitive to emissions.'),
  },
  {
    id: 'l6',
    count: 6,
    short: loc('6 层 Sig/GND/Sig/PWR/GND/Sig', '6 layers Sig/GND/Sig/PWR/GND/Sig'),
    title: loc('6 层：Sig / GND / Sig / PWR / GND / Sig', '6 layers: Sig / GND / Sig / PWR / GND / Sig'),
    layers: ['sig', 'gnd', 'sig', 'pwr', 'gnd', 'sig'],
    text: loc(
      '常被推荐的 6 层叠法：L1、L6 是外层信号，L3 是夹在地（L2）和电源（L4）之间的内层信号；L4 电源和 L5 地隔着薄介质贴在一起，形成低阻抗的电源平面对。',
      'A commonly recommended 6-layer arrangement: L1 and L6 are outer signals, and L3 is an inner signal between the ground at L2 and the power at L4; the L4 power and L5 ground sit close together across a thin dielectric and form a low-impedance plane pair.',
    ),
    reason: loc(
      '每一层信号都紧邻一个平面，而且没有两层信号相邻，层间串扰小；另一种 Sig/GND/Sig/Sig/PWR/Sig 多一层可走线，但 L3、L4 两层信号相邻，必须互相垂直走线。',
      'Every signal layer is adjacent to a plane and no two signal layers are adjacent, so crosstalk between layers stays low. The alternative Sig/GND/Sig/Sig/PWR/Sig gives one more routing layer, but L3 and L4 are signal layers next to each other and must be routed at right angles.',
    ),
    use: loc('DDR、高速串行接口、较多电源轨的处理器板。', 'Processor boards with DDR, high-speed serial links and many rails.'),
  },
]

export const POS_LABEL = {
  top: loc('顶层', 'Top'),
  bottom: loc('底层', 'Bottom'),
}

export function layerPos(index: number, count: number): LText | null {
  if (index === 0) {
    return POS_LABEL.top
  }
  if (index === count - 1) {
    return POS_LABEL.bottom
  }
  return null
}

/** 层间介质：多层板外层是半固化片、内层是芯板，交替；2 层只有一块芯板 */
export function dielectricKinds(count: number): Array<'core' | 'pp'> {
  const out: Array<'core' | 'pp'> = []
  for (let i = 0; i < count - 1; i += 1) {
    out.push(count === 2 || i % 2 === 1 ? 'core' : 'pp')
  }
  return out
}

/** 过孔跨越的层（1 起算，含两端）；该叠层没有这种过孔时返回 null */
export function viaSpan(id: ViaId, count: number): [number, number] | null {
  if (id === 'through') {
    return count >= 2 ? [1, count] : null
  }
  if (id === 'blind' || id === 'micro') {
    return count >= 4 ? [1, 2] : null
  }
  return count >= 6 ? [2, 3] : null
}

export const VIA_IDS: ViaId[] = ['through', 'blind', 'buried', 'micro']

/** 3D 图里每种过孔的颜色和板面 x 位置（z 都是 0），颜色同时用在开关旁的色块上 */
export const VIA_COLOR: Record<ViaId, string> = {
  through: '#f2c14e',
  blind: '#3fb59a',
  buried: '#a672e0',
  micro: '#ff7a59',
}
export const VIA_X: Record<ViaId, number> = {
  through: -1.05,
  blind: -0.35,
  buried: 0.35,
  micro: 1.05,
}

export const VIA_NAME: Record<ViaId, LText> = {
  through: loc('通孔', 'Through'),
  blind: loc('盲孔', 'Blind'),
  buried: loc('埋孔', 'Buried'),
  micro: loc('微孔', 'Microvia'),
}

/** 教学用的相对价格指数（示意参数）：2 层 = 1.0，每多 2 层加 0.8 */
export function costIndex(count: number): number {
  return 1 + 0.4 * (count - 2)
}

export function countKind(layers: LayerKind[], kind: LayerKind): number {
  return layers.filter((k) => k === kind).length
}

export function spanText(span: [number, number]): string {
  return `L${span[0]}–L${span[1]}`
}
