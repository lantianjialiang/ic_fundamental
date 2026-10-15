import { loc } from '../i18n/locale'
import type { FaqGroup } from './faq'

/** PCB 入门（L 轨）的常见问题 */
export const PCB_FAQ_GROUP: FaqGroup = {
  id: 'pcb',
  title: loc('PCB 入门', 'PCB basics'),
  items: [
    {
      id: 'even-layers',
      q: loc('多层板的层数为什么一般取偶数？', 'Why are multilayer boards usually an even number of layers?'),
      a: loc(
        '偶数层上下对称，压合时受力和热应力平衡，板子不容易翘曲。奇数层的结构不对称，更容易弯。叠层的具体选法见 {@pcbStack}。',
        'An even stack is symmetric top to bottom, so the forces and thermal stresses during lamination balance and the board is less likely to warp. An odd stack is asymmetric and bows more easily. How to choose the stack: {@pcbStack}.',
      ),
      lessons: ['pcbStack'],
    },
    {
      id: 'blind-buried',
      q: loc('盲孔、埋孔、通孔怎么区分？', 'How do blind, buried and through vias differ?'),
      a: loc(
        '通孔贯穿整板。盲孔从外层连到某个内层，只能从一面看到。埋孔只连内层，两面都看不到。盲孔和埋孔要分步钻孔压合，成本更高。见 {@pcbStack}。',
        'A through via runs the full board. A blind via joins an outer layer to an inner layer and is visible from one face. A buried via joins inner layers only and is hidden from both faces. Blind and buried vias need staged drilling and lamination, so they cost more. See {@pcbStack}.',
      ),
      lessons: ['pcbStack'],
    },
    {
      id: 'min-trace-why',
      q: loc('线宽为什么不能无限细？', 'Why can traces not be made arbitrarily thin?'),
      a: loc(
        '蚀刻会侧向腐蚀，线顶比设计窄，线越细，相对损失越大。铜越厚、蚀刻因子越差，能稳定做出的最细线就越粗。最小线宽线距是工厂能力的极限，见 {@pcbFab}。',
        'Etching undercuts sideways, so the top of the trace comes out narrower than drawn, and the thinner the line the bigger the relative loss. Thicker copper and a worse etch factor raise the finest line a fab can make reliably. The minimum trace and space are the fab’s limits: {@pcbFab}.',
      ),
      lessons: ['pcbFab'],
    },
    {
      id: 'mask-opening',
      q: loc('阻焊为什么要在焊盘上开窗？', 'Why is solder mask opened over pads?'),
      a: loc(
        '焊盘要露出铜才能焊接。其他地方被阻焊盖住，防止焊锡在相邻线路之间桥接。阻焊与焊盘的距离、丝印的位置都由工厂的对位精度决定，见 {@pcbFab}、{@pcbDfm}。',
        'A pad has to expose copper to be soldered. Mask covers everything else so solder cannot bridge neighbouring traces. The mask clearance and the legend position depend on the fab’s registration accuracy: {@pcbFab}, {@pcbDfm}.',
      ),
      lessons: ['pcbFab', 'pcbDfm'],
    },
    {
      id: 'drc-pass',
      q: loc('DRC 全部通过，板子就一定能做吗？', 'If DRC passes, can the board always be made?'),
      a: loc(
        '不一定。DRC 只检查你设定的规则，规则本身要和工厂能力对齐。装配、测试、散热等 DFM / DFA 问题也不在 DRC 的检查范围内。见 {@pcbTools}、{@pcbDfm}。',
        'Not necessarily. DRC checks only the rules you set, and those rules must match the fab’s capability. Assembly, test and thermal DFM / DFA issues are outside what DRC checks. See {@pcbTools} and {@pcbDfm}.',
      ),
      lessons: ['pcbTools', 'pcbDfm'],
    },
    {
      id: 'decap-near',
      q: loc('去耦电容为什么要尽量靠近芯片的电源脚？', 'Why place decoupling capacitors as close as possible to the chip’s supply pins?'),
      a: loc(
        '电容的作用是在芯片需要瞬时电流时就近供电。连线越长、过孔越多，回路电感越大，电压跌落也越大。见 {@pcbLayout}。',
        'A decoupling capacitor supplies the chip’s instantaneous current locally. Longer traces and more vias add loop inductance, and the supply dips more. See {@pcbLayout}.',
      ),
      lessons: ['pcbLayout'],
    },
    {
      id: 'diff-equal',
      q: loc('差分对为什么要等长、等距？', 'Why must a differential pair be length-matched and evenly spaced?'),
      a: loc(
        '差分对靠两根线上的信号互为反相，来抵消共模噪声。两根线长度不等会造成时序偏差；间距变化会改变阻抗，削弱抵消效果。见 {@pcbLayout}。',
        'A differential pair cancels common-mode noise because its two signals are opposite. Unequal lengths skew the timing, and changing spacing changes the impedance, weakening the cancellation. See {@pcbLayout}.',
      ),
      lessons: ['pcbLayout'],
    },
    {
      id: 'impedance-what',
      q: loc('特性阻抗由什么决定？', 'What sets the characteristic impedance?'),
      a: loc(
        '由线宽、线与参考平面之间的介质厚度、介质的介电常数和铜厚决定。线越宽、介质越薄，阻抗越低。具体计算见 {@pcbBasics}。',
        'It depends on trace width, the dielectric thickness between the trace and its reference plane, the dielectric constant and the copper thickness. Wider traces and thinner dielectric give lower impedance. Calculations: {@pcbBasics}.',
      ),
      lessons: ['pcbBasics'],
    },
    {
      id: 'gerber-what',
      q: loc('把设计交给工厂和装配厂，需要哪些文件？', 'What files go to the fab and the assembler?'),
      a: loc(
        '工厂至少需要 Gerber 图形文件（每层铜箔、阻焊、丝印）、钻孔文件和叠层说明。装配还需要 BOM 和贴片坐标文件。见 {@pcbSupply}。',
        'The fab needs the Gerber artwork (copper, mask and legend for each layer), the drill files and a stack-up note. The assembler also needs the BOM and the pick-and-place coordinate file. See {@pcbSupply}.',
      ),
      lessons: ['pcbSupply'],
    },
  ],
}
