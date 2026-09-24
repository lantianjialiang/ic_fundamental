import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export type NodeId = 'vdd' | 'gnd' | 'out' | 'pnp' | 'npn' | 'rwell' | 'rsub'

export const NODES: Array<{ id: NodeId; title: LText; text: LText; explain: LText[] }> = [
  {
    id: 'vdd',
    title: loc('VDD'),
    text: loc('电源。晶闸管一旦导通，电流从这里灌到地。'),
    explain: [loc('Latch-up 的电流不走功能数据脚，走电源轨。所以先看 IDD，不要只看哪一拍 Compare 错。')],
  },
  {
    id: 'gnd',
    title: loc('GND'),
    text: loc('地。低阻通路的另一端。'),
    explain: [loc('VDD–GND 被寄生晶闸管短起来。限流、掉电，再和普通 Continuity 短路区分。')],
  },
  {
    id: 'out',
    title: loc('I/O'),
    text: loc('过冲 / 欠冲常从 I/O 灌进衬底或阱，点着寄生管。'),
    explain: [loc('输出脚被 ESD 管、过冲钳到阱或衬底。测试夹具振铃、上电顺序错，都可能从这里灌触发电流。')],
  },
  {
    id: 'pnp',
    title: loc('寄生 PNP'),
    text: loc('P+（发射极）/ N 阱（基极）/ P 衬底（集电极）。不是画在原理图上的那只 PMOS。'),
    explain: [
      loc('CMOS 的 PMOS 做在 N 阱里。P+ 源漏、N 阱、P 衬底这三层，无意中就是一只 PNP。'),
      loc('阱电阻上的压降一旦让发射结正偏，这只管子就打开，把电流灌进衬底。'),
    ],
  },
  {
    id: 'npn',
    title: loc('寄生 NPN'),
    text: loc('N+（发射极）/ P 衬底（基极）/ N 阱（集电极）。和 PNP 互为正反馈。'),
    explain: [
      loc('NMOS 的 N+ 源漏、P 衬底、N 阱这三层，无意中就是一只 NPN。'),
      loc('衬底电流在 Rsub 上产生压降，NPN 打开，又给 PNP 的基极供电流。两只管子互相养活。'),
    ],
  },
  {
    id: 'rwell',
    title: loc('阱电阻 Rwell'),
    text: loc('N 阱不是理想导体。电流流过就有压降，能把寄生 PNP 的发射结正偏。'),
    explain: [loc('版图上阱接触太稀、阱太长，Rwell 就大，更容易被触发。DFT / 工艺会加密阱接触，这是防 Latch-up，不是 Scan。')],
  },
  {
    id: 'rsub',
    title: loc('衬底电阻 Rsub'),
    text: loc('P 衬底同样有电阻。衬底电流在这里产生压降，触发寄生 NPN。'),
    explain: [loc('和 Rwell 成对。触发电流 × 电阻 ≥ 0.7 V 量级，寄生发射结就正偏。')],
  },
]

export type WordId = 'parasitic' | 'p' | 'n' | 'pnp' | 'npn' | 'pnpn' | 'scr' | 'fb' | 'hold'

export const WORDS: Array<{ id: WordId; title: string; text: LText; explain: LText[] }> = [
  {
    id: 'parasitic',
    title: '寄生',
    text: loc('不是原理图上画的那只管子。CMOS 把 P 和 N 交替做在一起，额外长出来的结构。'),
    explain: [
      loc('“寄生”= 你没下单，硅里却有。PMOS / NMOS 是设计出来的；PNP / NPN / PNPN 是版图层叠的副产品。'),
      loc('所以 Latch-up 不是功能向量写错，是这块硅的结构被点着了。'),
    ],
  },
  {
    id: 'p',
    title: 'P',
    text: loc('P 型半导体：空穴多。图上常见于 PMOS 的源漏（P+）和整块 P 衬底。'),
    explain: [
      loc('P 接电源侧多：P+ 接到 VDD（PMOS 源）。P 衬底通常接地或偏置。'),
      loc('记住：P 不是“正电源”的缩写，是掺杂类型。'),
    ],
  },
  {
    id: 'n',
    title: 'N',
    text: loc('N 型半导体：电子多。图上常见于 N 阱，以及 NMOS 的源漏（N+）。'),
    explain: [
      loc('N 阱泡在 P 衬底里，里面再做 P+，就形成 PMOS。N+ 做在 P 衬底上，就是 NMOS。'),
      loc('P 和 N 交替出现四层，就是后面的 P-N-P-N。'),
    ],
  },
  {
    id: 'pnp',
    title: 'PNP',
    text: loc('三层：P–N–P。这里是寄生双极型管：发射极 P+、基极 N 阱、集电极 P 衬底。'),
    explain: [
      loc('双极型管靠两种载流子。发射结正偏就放大电流。'),
      loc('阱里的压降把 P+ / N 阱结正偏，PNP 导通，电流从 VDD 灌进衬底。'),
    ],
  },
  {
    id: 'npn',
    title: 'NPN',
    text: loc('三层：N–P–N。寄生的另一只：发射极 N+、基极 P 衬底、集电极 N 阱。'),
    explain: [
      loc('衬底压降把 N+ / P 衬底结正偏，NPN 导通，电流从阱抽到地。'),
      loc('它的集电极正好是 PNP 的基极所在的阱——两只管子交叉耦合。'),
    ],
  },
  {
    id: 'pnpn',
    title: 'PNPN',
    text: loc('四层叠：P–N–P–N。就是一只寄生晶闸管。从 VDD 的 P+ 到 GND 的 N+。'),
    explain: [
      loc('路径：P+（VDD）→ N 阱 → P 衬底 → N+（GND）。把 PNP 和 NPN 画在一起，共用中间两层。'),
      loc('四个字要拆开读：两只三极管，不是四个独立电源。'),
    ],
  },
  {
    id: 'scr',
    title: '晶闸管',
    text: loc('Thyristor / SCR。PNPN 的名字。触发后自己维持，电流降到维持电流以下才熄。'),
    explain: [
      loc('和功能门不同：门要时钟、要输入；晶闸管点着就锁住，改数据脚不一定回来。'),
      loc('ATE 上通常：限流 → 掉电 → 再上电。只重跑向量当普通 Fail，可能把芯片烫坏。'),
    ],
  },
  {
    id: 'fb',
    title: '正反馈',
    text: loc('PNP 的电流给 NPN 当基极电流，NPN 又给 PNP 当基极电流。互相养活。'),
    explain: [
      loc('负反馈会停；正反馈会锁。这就是“latch”。'),
      loc('所以只把输入改回 0 往往不够：环路已经不靠原来的触发源了。'),
    ],
  },
  {
    id: 'hold',
    title: '触发 / 维持',
    text: loc('触发电流点着它；维持电流（holding current）让它不灭。掉电是为了把电流降下去。'),
    explain: [
      loc('I/O 过冲、上电顺序、ESD 事件提供触发。一旦导通，电源自己供维持电流。'),
      loc('规格里会写 Latch-up 电流免疫。完整实验以后补；现在先能说出这两个电流。'),
    ],
  },
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
  'Latch-up = 寄生 PNPN 晶闸管被点着后的电源低阻通路。正反馈自己维持，通常要掉电。不是功能向量写错。',
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
    prompt: loc('“寄生 PNPN”里的“寄生”指什么？'),
    options: [
      { id: 'bug', text: loc('软件里的寄生电容模型') },
      { id: 'extra', text: loc('CMOS 版图里 P/N 交替多出来的结构，不是原理图上那只管子') },
      { id: 'esd', text: loc('就是 ESD 二极管的别名') },
      { id: 'ff', text: loc('就是 Flip-Flop') },
    ],
    answer: 'extra',
    explain: loc('P+ / N 阱 / P 衬底 / N+ 四层叠在一起，无意中就是晶闸管。'),
  },
  {
    id: 'q3',
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
    id: 'q4',
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
