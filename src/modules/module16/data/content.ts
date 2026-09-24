import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export type NodeId = 'vdd' | 'gnd' | 'out' | 'pnp' | 'npn' | 'rwell' | 'rsub'

export const NODES: Array<{ id: NodeId; title: LText; text: LText }> = [
  { id: 'vdd', title: loc('VDD'), text: loc('电源。晶闸管一旦导通，电流从这里灌到地。') },
  { id: 'gnd', title: loc('GND'), text: loc('地。低阻通路的另一端。') },
  { id: 'out', title: loc('输出管'), text: loc('过冲/欠冲常从 I/O 灌进衬底或阱，点着寄生管。') },
  { id: 'pnp', title: loc('寄生 PNP'), text: loc('和 NPN 组成 PNPN。一个导通会拉着另一个。') },
  { id: 'npn', title: loc('寄生 NPN'), text: loc('正反馈的另一半。触发后自己维持。') },
  { id: 'rwell', title: loc('阱电阻'), text: loc('阱上的压降让寄生管的发射结正偏。') },
  { id: 'rsub', title: loc('衬底电阻'), text: loc('衬底电流在电阻上产生压降，同样能触发。') },
]

export const LINKS: Array<{ id: string; title: LText; text: LText }> = [
  {
    id: 'seq',
    title: loc('上电顺序'),
    text: loc('I/O 先于电源、或电源脚之间不同步，都可能在寄生管上灌出触发电流。'),
  },
  {
    id: 'idd',
    title: loc('IDD 飙高'),
    text: loc('功能向量还在跑，电源电流突然像短路。先限流，不要当成普通 Fail 反复硬测。'),
  },
  {
    id: 'clamp',
    title: loc('输出被钳在异常电压'),
    text: loc('脚被拉到不像 0 也不像 1 的电位。改输入不一定回来。'),
  },
]

export const TAKEAWAY = loc(
  'Latch-up 是寄生晶闸管被触发后的低阻通路，不是功能向量写错。通常要掉电，只改输入不一定恢复。',
)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('Latch-up 是功能向量写错了吗？'),
    options: [
      { id: 'yes', text: loc('是，改期望就能好') },
      { id: 'no', text: loc('不是。是寄生 PNPN 被触发后的电源低阻通路') },
      { id: 'scan', text: loc('是扫描链太长') },
      { id: 'bin', text: loc('是 Bin 号冲突') },
    ],
    answer: 'no',
    explain: loc('向量错会按拍 Fail。Latch-up 是电流和电压失控，甚至要掉电。'),
  },
  {
    id: 'q2',
    prompt: loc('触发之后，只把输入改回 0，一定恢复吗？'),
    options: [
      { id: 'yes', text: loc('一定立刻恢复') },
      { id: 'no', text: loc('不一定。正反馈自己维持，通常要掉电') },
      { id: 'heat', text: loc('吹一下就好') },
      { id: 'xor', text: loc('再跑一遍 XOR 就好') },
    ],
    answer: 'no',
    explain: loc('holding current 还在，晶闸管不灭。ATE 上要限流、掉电，再和短路区分。'),
  },
  {
    id: 'q3',
    prompt: loc('测试时哪些现象要想到 Latch-up？'),
    options: [
      { id: 'one', text: loc('只有某一拍 Compare 错') },
      { id: 'ok', text: loc('上电顺序、IDD 突然飙高、输出钳在异常电压') },
      { id: 'name', text: loc('芯片丝印不清') },
      { id: 'fmax', text: loc('只有 fMAX 规格写了 100 MHz') },
    ],
    answer: 'ok',
    explain: loc('完整实验以后补。现在先能把它和普通功能 Fail、普通短路分开。'),
  },
]
