import { loc, type LText } from '../../../i18n/locale'
import { type ViaId } from './pcbStackModel'

export type ViaCardId = ViaId | 'hdi'

export const VIAS: Array<{ id: ViaCardId; title: LText; sub: LText; text: LText; use: LText; cost: LText }> = [
  {
    id: 'through',
    title: loc('通孔 Through via', 'Through via'),
    sub: loc('全板：L1–L6', 'Whole board: L1–L6'),
    text: loc(
      '用机械钻头从顶面一直钻到底面，再把孔壁镀铜。孔贯穿所有层，所以经过不属于自己网络的平面时，平面上要挖反焊盘避开；一个通孔会在每一层留下孔位，把内层的走线空间切掉一块。',
      'A mechanical drill goes from the top face to the bottom face and the wall is then copper-plated. The hole crosses every layer, so where it passes a plane that is not its own net, the plane needs an antipad cut around it; each through via leaves a hole on every layer and takes a bite out of the inner routing space.',
    ),
    use: loc('最常用，几乎所有板子都有；插件元件的引脚孔也是通孔。', 'The default on nearly every board; the lead holes of through-hole parts are through holes too.'),
    cost: loc('最便宜：钻孔和电镀都在压合之后一次做完（见 {@pcbFab}）。', 'Cheapest: drilling and plating happen once after lamination (see {@pcbFab}).'),
  },
  {
    id: 'blind',
    title: loc('盲孔 Blind via', 'Blind via'),
    sub: loc('外层 → 内层：L1–L2', 'Outer → inner: L1–L2'),
    text: loc(
      '从一个外层打到某个内层就停，另一面看不到孔。它不穿过下面的层，所以下面的层可以在这个位置照常走线或放孔。盲孔可以只穿一层，也可以穿过几层；常见做法是对应的几层先压合，钻孔镀铜后再和其余层整板压合。',
      'It starts at an outer layer and stops at an inner one, so the hole is not visible from the other face. It does not cross the layers below, which stay free for traces or other holes at that spot. A blind via may cross one layer or several; the usual way is to press those layers first, drill and plate, then laminate them with the rest of the board.',
    ),
    use: loc('BGA 下面的扇出、内层要避开的地方；机械钻的盲孔孔径比微孔大。', 'Fan-out under BGAs and places where inner layers must stay free; a mechanically drilled blind via is larger than a microvia.'),
    cost: loc('贵：要分次压合，还要控制钻孔深度，不能钻穿。', 'More expensive: it needs sequential lamination and depth-controlled drilling that must not break through.'),
  },
  {
    id: 'buried',
    title: loc('埋孔 Buried via', 'Buried via'),
    sub: loc('内层 ↔ 内层：L2–L3', 'Inner ↔ inner: L2–L3'),
    text: loc(
      '两端都在内层，板的任何一面都看不到。做法是先在芯板上钻孔、镀铜、做完内层图形，再和别的层压在一起。这里画的 L2–L3 埋孔是示意：它把 L2 的地和 L3 的走线连起来，并释放外层和 L4 以下的空间。',
      'Both ends are on inner layers and neither face of the board shows it. The hole is drilled and plated in a core, the inner layers are imaged, and only then is the core pressed with the other layers. The L2–L3 buried via drawn here is illustrative: it joins the L2 ground to a L3 trace and keeps the outer layers and everything below L4 free.',
    ),
    use: loc('高密度的多层板，需要让外层元件和过孔位置完全自由。', 'Dense multilayer boards where the outer layers and via sites must stay completely free.'),
    cost: loc('最贵之一：孔要在压合之前做，每个埋孔层对都是一次额外的压合。', 'Among the most expensive: the hole is made before lamination, so each buried layer pair is one more lamination cycle.'),
  },
  {
    id: 'micro',
    title: loc('微孔 Microvia', 'Microvia'),
    sub: loc('激光，只跨一层：L1–L2', 'Laser, one layer: L1–L2'),
    text: loc(
      '用激光烧出来的小孔，直径一般小于 0.15 mm，只穿过一层介质，孔是上大下小的锥形，常用电镀铜填平。深径比小，所以孔很浅，只能跨相邻的两层。',
      'A small hole burned by a laser, typically under 0.15 mm in diameter, crossing a single dielectric layer; it is a cone, wider at the top than the bottom, and is often filled with plated copper. The aspect ratio must stay small, so the hole is shallow and can only span two adjacent layers.',
    ),
    use: loc('间距 0.5 mm 以下的 BGA / CSP 扇出，可以直接打在焊盘里。', 'Fan-out of BGAs and CSPs under 0.5 mm pitch; it can sit right in the pad.'),
    cost: loc('比机械孔贵，但让板子能更小、更薄。', 'Costlier than a mechanical hole, but lets the board be smaller and thinner.'),
  },
  {
    id: 'hdi',
    title: loc('HDI 简介', 'HDI in brief'),
    sub: loc('高密度互连', 'High-density interconnect'),
    text: loc(
      'HDI 是用微孔、细线、小焊盘把板做得更密的一类板。常用「1+N+1」这样的写法：中间是 N 层普通芯板，上下各一层用激光微孔连出来的「积层」。微孔可以错开叠（staggered），也可以填铜后直接叠起来（stacked），多次积层越多，板越贵。',
      'HDI is the family of boards made denser with microvias, finer traces and smaller pads. It is often written “1+N+1”: N ordinary core layers in the middle and one laser-via “build-up” layer on each face. Microvias can be staggered or, once filled with copper, stacked directly; the more build-up cycles, the higher the price.',
    ),
    use: loc('手机、可穿戴、0.4 mm 间距的 BGA；普通教学板用不到。', 'Phones, wearables, 0.4 mm pitch BGAs; ordinary teaching boards do not need it.'),
    cost: loc('每多一次积层就多一轮压合和激光钻孔，价格明显高于普通多层板。', 'Each extra build-up adds a lamination and laser-drilling round, so HDI costs clearly more than a normal multilayer board.'),
  },
]

export type TermId = 'pad' | 'ring' | 'antipad' | 'thermal' | 'drill'

export const TERMS: Array<{ id: TermId; title: LText; sub: LText; text: LText; rule: LText }> = [
  {
    id: 'pad',
    title: loc('焊盘 Pad', 'Pad'),
    sub: loc('孔周围的铜', 'The copper around a hole'),
    text: loc(
      '每个过孔在它连接的那一层，都有一圈铜焊盘，走线从焊盘连到孔壁。外层的过孔焊盘通常被阻焊盖住；元件引脚的焊盘则开窗上锡。',
      'On every layer a via connects to it has a ring of copper, the pad, and the trace joins the pad and the barrel. Via pads on outer layers are usually covered by solder mask, while part-lead pads are opened up and tinned.',
    ),
    rule: loc('焊盘直径 = 钻孔直径 + 2 × 孔环。', 'Pad diameter = drill diameter + 2 × annular ring.'),
  },
  {
    id: 'ring',
    title: loc('孔环 Annular ring', 'Annular ring'),
    sub: loc('焊盘比孔多出的那圈铜', 'Copper left around the drill'),
    text: loc(
      '孔环是孔壁到焊盘外沿之间那圈铜。钻头会有定位误差，孔环给它留余量；孔环太薄，钻头稍偏就会钻出焊盘外面，孔壁和焊盘只剩一点点相连，热循环后容易裂开成开路。',
      'The annular ring is the copper between the hole wall and the outer edge of the pad. The drill has positioning error, and the ring is the margin for it; if the ring is too thin, a slightly wandering drill breaks out of the pad, the barrel touches the pad only a little, and it can crack open after thermal cycling.',
    ),
    rule: loc('孔环 = (焊盘直径 − 钻孔直径) ÷ 2；常规做法单边 0.15 mm 左右，以板厂能力表为准。', 'Annular ring = (pad − drill) ÷ 2; about 0.15 mm per side is common, but follow the fab’s capability table.'),
  },
  {
    id: 'antipad',
    title: loc('反焊盘 Antipad', 'Antipad'),
    sub: loc('平面上挖出的避让孔', 'The clearance hole in a plane'),
    text: loc(
      '过孔穿过一个不属于它的平面（比如信号过孔穿过地平面）时，要在平面上挖一个比焊盘大的圆形空洞，让孔和平面之间有绝缘间隙，否则信号就短路到平面了。反焊盘越大越安全，但会削弱平面，也影响阻抗。',
      'When a via passes through a plane that is not its own net, for example a signal via through the ground plane, a circular void larger than the pad is cut out of the plane so there is an insulating gap; without it the signal would short to the plane. A larger antipad is safer, but it weakens the plane and also changes impedance.',
    ),
    rule: loc('反焊盘直径 ≥ 焊盘直径 + 2 × 间隙；间隙按电压和板厂能力定。', 'Antipad diameter ≥ pad diameter + 2 × clearance; the clearance depends on voltage and the fab’s capability.'),
  },
  {
    id: 'thermal',
    title: loc('热焊盘 Thermal relief', 'Thermal relief'),
    sub: loc('用细辐条连到铜皮', 'Joined to the pour by thin spokes'),
    text: loc(
      '属于这个平面的孔（比如地过孔接地平面）如果整圈和铜皮相连，焊接时热量会马上被大铜皮吸走，焊点不容易热。热焊盘在焊盘周围挖一圈间隙，只留 2–4 根细辐条相连，既通电又限制散热。',
      'If a hole that belongs to the plane (a ground via on the ground plane) is joined to the copper all the way round, the big pour soaks up the heat and the joint is hard to warm. A thermal relief cuts a gap around the pad and leaves only 2–4 thin spokes, which still conduct current but limit heat loss.',
    ),
    rule: loc('辐条总宽要够电流；大电流的过孔要加宽辐条或改用直连（见 {@pcbBasics}）。', 'Total spoke width must carry the current; for high-current vias, widen the spokes or connect solid (see {@pcbBasics}).'),
  },
  {
    id: 'drill',
    title: loc('钻孔 Drill hole', 'Drill hole'),
    sub: loc('孔壁镀铜后的内径', 'Hole before and after plating'),
    text: loc(
      '钻头的直径是「钻孔直径」，孔壁镀铜后成品孔会略小，约小 2 × 镀层厚度。孔是在压合之后才钻、才镀铜的，所以孔壁是连通所有层的圆筒，而每层铜只在孔边露出一圈断面（见 {@pcbFab}）。',
      'The drill bit gives the “drill diameter”; after the wall is copper-plated the finished hole is a bit smaller, by about twice the plating thickness. A through hole is drilled and plated after lamination, so the barrel is a cylinder joining all layers, and each copper layer shows only a ring-shaped edge at the hole (see {@pcbFab}).',
    ),
    rule: loc('孔径越小越贵：低于 0.2 mm 的孔常要精密钻或激光钻。', 'Smaller is dearer: holes under 0.2 mm often need precision or laser drilling.'),
  },
]

/** 示意尺寸（毫米） */
export const DIM = { drill: 0.3, pad: 0.6, antipad: 1.0, spoke: 0.2 }
