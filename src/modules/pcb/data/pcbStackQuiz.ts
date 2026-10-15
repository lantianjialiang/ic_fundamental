import { loc } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'
import { DIM } from './pcbStackVia'

// 孔环按同一组示意尺寸算出，题目里的数字和图一致
const RING = ((DIM.pad - DIM.drill) / 2).toFixed(2)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc(
      '一块带高速信号的板从 2 层改成 4 层，最主要的好处是？',
      'A board with fast signals moves from 2 layers to 4. What is the main benefit?',
    ),
    options: [
      { id: 'a', text: loc('铜的导电性变好了', 'The copper conducts better') },
      { id: 'b', text: loc('信号下面有了一整块地平面做参考，回流路径变短', 'Each signal gets a solid ground plane beneath it, so the return path gets shorter') },
      { id: 'c', text: loc('板子变得更便宜', 'The board gets cheaper') },
    ],
    answer: 'b',
    explain: loc(
      '4 层可以把两层内层专门做成地和电源平面；信号的回流电流沿正下方的平面走，回路面积小，辐射和串扰就低。层数多价格只会更高，铜本身的导电性不变。',
      'Four layers let the two inner layers be dedicated ground and power planes; the return current runs along the plane right below the trace, so the loop is small and radiation and crosstalk fall. More layers raise the price, and the copper itself conducts the same.',
    ),
  },
  {
    id: 'q2',
    prompt: loc('下面哪一种是常用的 4 层叠法（从顶层到底层）？', 'Which one is a common 4-layer stack-up (top to bottom)?'),
    options: [
      { id: 'a', text: loc('Sig / Sig / GND / PWR', 'Sig / Sig / GND / PWR') },
      { id: 'b', text: loc('GND / Sig / Sig / PWR', 'GND / Sig / Sig / PWR') },
      { id: 'c', text: loc('Sig / GND / PWR / Sig', 'Sig / GND / PWR / Sig') },
    ],
    answer: 'c',
    explain: loc(
      'Sig / GND / PWR / Sig 里两层信号都紧邻一个平面。a 里 L1 信号旁边是另一层信号，没有平面；b 把平面放在外层，元件和走线就没地方放，两个内层信号还相邻，容易串扰。',
      'In Sig / GND / PWR / Sig both signal layers sit next to a plane. In a the L1 signal has only another signal layer beside it, no plane; in b the planes are outside, leaving no room for parts and traces, and the two inner signal layers are adjacent, which invites crosstalk.',
    ),
  },
  {
    id: 'q3',
    prompt: loc(
      '一个过孔从 L2 连到 L3，板子的顶面和底面都看不到它，它叫什么？',
      'A via joins L2 to L3 and cannot be seen from either face of the board. What is it?',
    ),
    options: [
      { id: 'a', text: loc('盲孔', 'Blind via') },
      { id: 'b', text: loc('通孔', 'Through via') },
      { id: 'c', text: loc('埋孔', 'Buried via') },
    ],
    answer: 'c',
    explain: loc(
      '两端都在内层、两面都看不见的叫埋孔。盲孔至少有一端在外层；通孔从顶面一直到底面；激光微孔也有一端在外层，只跨一层。',
      'A via with both ends on inner layers and invisible from both faces is a buried via. A blind via has at least one end on an outer layer, a through via runs from top to bottom, and a laser microvia also starts at an outer layer and crosses just one layer.',
    ),
  },
  {
    id: 'q4',
    prompt: loc(
      '信号过孔穿过 GND 平面时，平面上为什么要挖一个比焊盘大的圆洞？',
      'Why is a hole larger than the pad cut in the GND plane where a signal via passes through it?',
    ),
    options: [
      { id: 'a', text: loc('让孔和平面保持绝缘，否则信号短路到地', 'To keep the hole insulated from the plane; otherwise the signal shorts to ground') },
      { id: 'b', text: loc('让焊接时热量能散得更快', 'So heat can leave faster during soldering') },
      { id: 'c', text: loc('让钻头的定位误差有余量', 'To leave margin for the drill’s positioning error') },
    ],
    answer: 'a',
    explain: loc(
      '这个圆洞叫反焊盘，作用是在孔和平面之间留一圈绝缘间隙。b 说的是热焊盘（用辐条限制散热），c 说的是孔环；反焊盘是相反的需求：不让孔和平面接触。',
      'This hole is the antipad, and it leaves a ring of insulating gap between the hole and the plane. Option b describes thermal relief (spokes that limit heat loss) and c the annular ring; the antipad does the opposite job: it keeps the hole from touching the plane.',
    ),
  },
  {
    id: 'q5',
    prompt: loc(
      `钻孔直径 ${DIM.drill.toFixed(2)} mm、焊盘直径 ${DIM.pad.toFixed(2)} mm，单边孔环是多少？`,
      `With a ${DIM.drill.toFixed(2)} mm drill and a ${DIM.pad.toFixed(2)} mm pad, what is the annular ring on each side?`,
    ),
    options: [
      { id: 'a', text: loc('0.30 mm', '0.30 mm') },
      { id: 'b', text: loc('0.45 mm', '0.45 mm') },
      { id: 'c', text: loc(`${RING} mm`, `${RING} mm`) },
    ],
    answer: 'c',
    explain: loc(
      `孔环 = (焊盘直径 − 钻孔直径) ÷ 2 = (${DIM.pad.toFixed(2)} − ${DIM.drill.toFixed(2)}) ÷ 2 = ${RING} mm。0.30 是两边加起来的差，不是单边。`,
      `Annular ring = (pad − drill) ÷ 2 = (${DIM.pad.toFixed(2)} − ${DIM.drill.toFixed(2)}) ÷ 2 = ${RING} mm. The 0.30 mm is the total over both sides, not one side.`,
    ),
  },
]
