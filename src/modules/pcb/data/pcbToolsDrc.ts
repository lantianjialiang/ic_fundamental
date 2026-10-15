import { loc, type LText } from '../../../i18n/locale'

export const DS = {
  kickerKey: loc('快捷键', 'Shortcut'),
  mm: 'mm',
  mil: 'mil',
  fabMin: loc('板厂能力', 'Fab capability'),
  yourRule: loc('你设的规则', 'Your rule'),
  margin: loc('余量', 'Margin'),
  knobClr: loc('线距规则', 'Clearance rule'),
  knobExp: loc('阻焊扩展（单边）', 'Mask expansion (per side)'),
  padGap: loc('焊盘间距', 'Pad gap'),
  bridge: loc('剩下的阻焊桥', 'Remaining mask bridge'),
  calcTitle: loc('试一试：规则比板厂能力宽松会怎样', 'Try it: what if the rule is looser than the fab'),
  calcCap: loc(
    '示意：焊盘间距按 0.5 mm 脚距、0.25 mm 焊盘宽算出 0.25 mm；板厂最小阻焊桥取 0.1 mm（典型值，以板厂为准）。',
    'Illustration: the pad gap is 0.25 mm for 0.5 mm pitch with 0.25 mm pads; the fab minimum mask bridge is taken as 0.1 mm (typical, the fab decides).',
  ),
  clrOk: loc('规则不低于板厂能力：DRC 通过，工厂也做得出来。', 'The rule is at or above the fab capability: DRC passes and the fab can build it.'),
  clrBad: loc(
    '规则比板厂能力还小：DRC 照样能通过，但工厂做不出，会被退单或悄悄改线宽。',
    'The rule is below the fab capability: DRC will still pass, but the fab cannot build it and will reject the order or quietly change the traces.',
  ),
  brOk: loc('阻焊桥够宽，细脚距焊盘之间会留下一条绿油。', 'The bridge is wide enough, so a strip of mask stays between the fine-pitch pads.'),
  brBad: loc(
    '阻焊桥太窄：工厂做不出这么窄的绿油，会把焊盘之间整条开窗，回流时容易连锡。',
    'The bridge is too narrow: the fab cannot print mask that thin and opens the whole gap between pads, so solder can bridge during reflow.',
  ),
  ring: loc('孔环宽度 = (盘 − 孔) / 2', 'Annular ring = (pad − hole) / 2'),
  ringNote: loc(
    '这里的孔环按「板厂典型 / 建议设置」两组数算出；孔环越宽，钻孔偏一点也不会钻破焊盘。',
    'The ring is computed here from the typical fab and the suggested pair; the wider the ring, the more drill wander it tolerates before breaking out of the pad.',
  ),
}

export const FAB_CLR = 0.15
export const FAB_BRIDGE = 0.1
export const PAD_GAP = 0.25

export function maskBridge(expansion: number) {
  return PAD_GAP - 2 * expansion
}

export type Val = { k?: LText; mm: number }

export type DrcId = 'clr' | 'width' | 'via' | 'hole' | 'mask' | 'silk'

export type DrcRule = {
  id: DrcId
  name: string
  checks: LText
  fab: Val[]
  set: Val[]
  why: LText
}

const wMin = loc('最小', 'min')
const wPref = loc('常用', 'pref')
const wHole = loc('孔', 'hole')
const wDia = loc('盘', 'pad')
const wExp = loc('扩展', 'exp')
const wBr = loc('桥', 'bridge')

export const DRC_RULES: DrcRule[] = [
  {
    id: 'clr',
    name: 'Electrical » Clearance',
    checks: loc('不同网络的铜（线、焊盘、过孔、铜皮）之间的最小间隙', 'Minimum gap between copper of different nets (traces, pads, vias, pours)'),
    fab: [{ mm: FAB_CLR }],
    set: [{ mm: 0.2 }],
    why: loc(
      '间隙小于工厂的蚀刻能力就会连铜短路。建议值比板厂能力大一点：蚀刻会让线宽有偏差，留一点余量成品率更高。',
      'A gap below the fab’s etching capability leaves copper bridged and shorted. Set it a little above the capability: etching varies, and some margin raises yield.',
    ),
  },
  {
    id: 'width',
    name: 'Routing » Width',
    checks: loc('走线宽度的最小、常用、最大值（可按网络类分别设）', 'Minimum, preferred and maximum trace width (can be set per net class)'),
    fab: [{ k: wMin, mm: 0.15 }],
    set: [
      { k: wMin, mm: 0.2 },
      { k: wPref, mm: 0.25 },
    ],
    why: loc(
      '线比工厂能蚀刻的更细会断线；线宽也决定载流，电源线要用另一条规则放宽到 0.5 mm 以上，不能和信号线共用（见 {@pcbBasics}）。',
      'A trace thinner than the fab can etch will break; width also sets current capacity, so supply nets need their own wider rule, not the signal rule (see {@pcbBasics}).',
    ),
  },
  {
    id: 'via',
    name: 'Routing » Routing Via Style',
    checks: loc('自动打的过孔的孔径和焊盘直径', 'Hole size and pad diameter of vias placed while routing'),
    fab: [
      { k: wHole, mm: 0.3 },
      { k: wDia, mm: 0.6 },
    ],
    set: [
      { k: wHole, mm: 0.4 },
      { k: wDia, mm: 0.8 },
    ],
    why: loc(
      '孔要比盘小得多，剩下的一圈铜叫孔环：钻孔有偏差，孔环太窄会钻破盘、孔壁镀铜接不上，板子就断路（见 {@pcbStack}）。',
      'The hole must be much smaller than the pad; the copper left around it is the annular ring. Drills wander, and a ring that is too thin breaks out of the pad so the plated barrel loses its connection (see {@pcbStack}).',
    ),
  },
  {
    id: 'hole',
    name: 'Manufacturing » Hole Size',
    checks: loc('所有钻孔（过孔和插件孔）允许的最小和最大孔径', 'Minimum and maximum diameter allowed for every drilled hole (vias and through-hole parts)'),
    fab: [{ k: wMin, mm: 0.3 }],
    set: [{ k: wMin, mm: 0.3 }],
    why: loc(
      '小于最小钻头的孔，工厂要么拒做、要么加价用更细的钻头；检查的是成品孔径，和孔环那条规则互不替代（见 {@pcbFab}）。',
      'A hole smaller than the fab’s smallest drill is refused or charged extra for a finer bit; this checks the finished hole size and does not replace the annular ring rule (see {@pcbFab}).',
    ),
  },
  {
    id: 'mask',
    name: 'Mask » Solder Mask Expansion',
    checks: loc('阻焊开窗比焊盘大多少（每边）', 'How much larger the solder-mask opening is than the pad (per side)'),
    fab: [
      { k: wExp, mm: 0.05 },
      { k: wBr, mm: FAB_BRIDGE },
    ],
    set: [{ k: wExp, mm: 0.05 }],
    why: loc(
      '开窗要略大于焊盘才能盖住对位误差，但太大会把相邻焊盘之间的阻焊桥吃掉。扩展值越大，细脚距芯片的焊盘之间越容易没有绿油（见下面的小实验）。',
      'The opening must be slightly larger than the pad to absorb registration error, but too large eats the mask bridge between neighbouring pads. The bigger the expansion, the likelier fine-pitch pads end up with no mask between them (see the experiment below).',
    ),
  },
  {
    id: 'silk',
    name: 'Manufacturing » Silk To Solder Mask Clearance',
    checks: loc('丝印和阻焊开窗（也就是露出来的焊盘）之间的最小距离', 'Minimum distance from silkscreen to the solder-mask opening (the exposed pad)'),
    fab: [{ mm: 0.15 }],
    set: [{ mm: 0.2 }],
    why: loc(
      '丝印油墨盖到焊盘上会焊不上锡。很多工厂会直接把压到焊盘的丝印切掉，所以你以为画在板上的字，成品上可能缺一块（见 {@pcbDfm}）。',
      'Silkscreen ink on a pad stops solder from wetting. Many fabs simply clip silkscreen that overlaps a pad, so text you drew may be missing a piece on the finished board (see {@pcbDfm}).',
    ),
  },
]

export type KeyGroup = 'all' | 'view' | 'edit' | 'route' | 'check'

export type KeyRow = { id: string; keys: string; group: Exclude<KeyGroup, 'all'>; when: LText; does: LText }

export const KEY_GROUPS: Array<{ id: KeyGroup; label: LText }> = [
  { id: 'all', label: loc('全部', 'All') },
  { id: 'view', label: loc('看图和测量', 'View and measure') },
  { id: 'edit', label: loc('放置和编辑', 'Place and edit') },
  { id: 'route', label: loc('布线时', 'While routing') },
  { id: 'check', label: loc('检查', 'Check') },
]

export const KEYS: KeyRow[] = [
  {
    id: 'q',
    keys: 'Q',
    group: 'view',
    when: loc('看尺寸、设规则时', 'When reading sizes or setting rules'),
    does: loc('在 mm 和 mil 之间切换显示单位', 'Toggle the display unit between mm and mil'),
  },
  {
    id: 'shifts',
    keys: 'Shift + S',
    group: 'view',
    when: loc('多层板看某一层时', 'When inspecting one layer of a stack'),
    does: loc('单层模式：当前层正常显示，其他层变暗', 'Single-layer mode: the current layer shows normally and the others dim'),
  },
  {
    id: 'l',
    keys: 'L',
    group: 'view',
    when: loc('想开关某些层或对象显示时', 'When turning layers or object kinds on and off'),
    does: loc('打开 View Configuration 面板，设置层的显示', 'Open the View Configuration panel to set layer visibility'),
  },
  {
    id: 'ctrlm',
    keys: 'Ctrl + M',
    group: 'view',
    when: loc('量两点之间的距离时', 'When measuring between two points'),
    does: loc('测量距离：点两个点，弹出两点间距', 'Measure distance: click two points and the separation pops up'),
  },
  {
    id: 'jc',
    keys: 'J, C',
    group: 'view',
    when: loc('板上器件很多，要找某个位号时', 'When you need to find one designator on a busy board'),
    does: loc('Jump to Component：输入位号，视图跳到该器件', 'Jump to Component: type a designator and the view jumps to that part'),
  },
  {
    id: 'tab',
    keys: 'Tab',
    group: 'edit',
    when: loc('正在放置器件、焊盘、过孔、导线时', 'While placing a part, pad, via or wire'),
    does: loc('暂停并打开属性：放之前就能改位号、线宽、过孔大小', 'Pause and edit properties: change designator, width or via size before it lands'),
  },
  {
    id: 'space',
    keys: 'Spacebar',
    group: 'edit',
    when: loc('拖着器件放置或移动时', 'While dragging a part to place or move it'),
    does: loc('旋转：每按一次转 90 度', 'Rotate: 90 degrees for each press'),
  },
  {
    id: 'pv',
    keys: 'P, V',
    group: 'edit',
    when: loc('需要手动打过孔时', 'When you need to drop a via by hand'),
    does: loc('Place » Via：放置一个过孔', 'Place » Via: place one via'),
  },
  {
    id: 'pg',
    keys: 'P, G',
    group: 'edit',
    when: loc('做地铜皮时', 'When making a ground pour'),
    does: loc('Place » Polygon Pour：开始画铺铜区域', 'Place » Polygon Pour: start drawing a pour region'),
  },
  {
    id: 'pt',
    keys: 'P, T',
    group: 'route',
    when: loc('把飞线布成铜线时', 'When turning a ratsnest line into copper'),
    does: loc('Interactive Routing：从焊盘开始连线', 'Interactive Routing: start a track from a pad'),
  },
  {
    id: 'star',
    keys: '* (numpad)',
    group: 'route',
    when: loc('布线中途要换到另一面时', 'When a trace has to cross to the other side'),
    does: loc('切换到下一个信号层，并自动打一个过孔', 'Go to the next signal layer and drop a via automatically'),
  },
  {
    id: 'shiftspace',
    keys: 'Shift + Spacebar',
    group: 'route',
    when: loc('走线转角不合意时', 'When the trace corner is not what you want'),
    does: loc('循环切换转角形式：45 度、圆弧、90 度等', 'Cycle the corner style: 45 degree, arc, 90 degree and so on'),
  },
  {
    id: 'shiftr',
    keys: 'Shift + R',
    group: 'route',
    when: loc('布线被别的线挡住时', 'When another trace is in the way'),
    does: loc('循环切换遇障方式：忽略、推挤、绕行等', 'Cycle the obstacle mode: ignore, push, walk around and so on'),
  },
  {
    id: 'td',
    keys: 'T, D',
    group: 'check',
    when: loc('布线或铺铜之后、出图之前', 'After routing or pouring, before outputs'),
    does: loc('Tools » Design Rule Check：打开 DRC 对话框并运行', 'Tools » Design Rule Check: open the DRC dialog and run it'),
  },
]
