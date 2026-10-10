import { loc, type LText } from '../../i18n/locale'

/** M08 / M09 共用：一张 CLK / DATA / OUT 上的全部标注 */
export type TimingMark =
  | 'drive'
  | 'strobe'
  | 'period'
  | 'setup'
  | 'hold'
  | 'tpd'
  | 'edge'
  | 'ctq'
  | 'fmax'

export const TIMING: Record<TimingMark, { title: string; text: LText; caption: LText }> = {
  drive: {
    title: 'Drive Edge',
    text: loc('Tester 把输入拉到新电平的边沿。图上 DATA 开始上升的那一点。输入从这一刻算新值。'),
    caption: loc('黄线扫到 DATA 上升沿 = Drive。太晚，后面的 Setup 可能不够。'),
  },
  strobe: {
    title: 'Strobe',
    text: loc('Tester 在这一拍“看一眼”输出的时刻，也叫 Receive / Compare。必须落在 OUT 已经稳定的窗口里。'),
    caption: loc('黄竖线落到 OUT 上就是 Strobe。窗口外：太早采旧值，太晚可能采到下一拍。'),
  },
  period: {
    title: 'Period',
    text: loc('相邻两个 CLK 上升沿之间的时间。一拍有多长。缩短 Period = 提高频率，fMAX 就是它的下限。'),
    caption: loc('沿 1 到沿 2 就是 Period。M09 会把 Period 往短里拖，直到功能 Fail。'),
  },
  setup: {
    title: 'Setup Time',
    text: loc('CLK 沿到来之前，DATA 必须已经稳住的最短时间（tSU）。不够，触发器可能采到亚稳态或错值。'),
    caption: loc('DATA 稳住 → CLK 沿，这段是 tSU。Period 缩短时，Setup 往往最先被吃掉。'),
  },
  hold: {
    title: 'Hold Time',
    text: loc('CLK 沿过后，DATA 还不能立刻变的最短时间（tH）。和 Setup 一前一后，都是相对时钟说的。'),
    caption: loc('CLK 沿 → DATA 才允许再变，这段是 tH。沿后马上改数据，这一拍会错。'),
  },
  tpd: {
    title: 'Propagation Delay',
    text: loc('组合逻辑：输入沿到输出沿的延迟（tPD）。IN/DATA 先变，OUT 过一会儿才跟。Strobe 必须晚于它。'),
    caption: loc('DATA 变 → OUT 才变，金色括号是 tPD。这就是 Strobe 不能贴着 Drive 的原因。'),
  },
  edge: {
    title: 'Rise / Fall Time',
    text: loc('沿自己从低爬到高（tr）或从高降到低（tf）要花的时间。不是瞬间。沿越慢，有效窗口越窄。'),
    caption: loc('DATA 斜边在动：10%→90% 是 tr，反过来是 tf。方波只是理想画法。'),
  },
  ctq: {
    title: 'Clock-to-Q',
    text: loc('寄存器：CLK 沿到 Q 输出有效的时间（tCQ）。组合看 tPD，触发器看 tCQ。'),
    caption: loc('CLK 上升沿之后，Q 才跟上。金色括号是 tCQ。不要和组合 tPD 混成一个词。'),
  },
  fmax: {
    title: 'fMAX',
    text: loc('功能仍对的最高时钟。Period 再短，同一套向量就开始 Fail。教学门槛对接 M05 的 100 MHz。'),
    caption: loc('Period 必须装得下 tCQ（或 tPD）+ tSU。再短，不是真值表反了，是来不及。'),
  },
}

export const M08_MARKS: TimingMark[] = ['drive', 'strobe', 'period', 'setup', 'hold', 'tpd']
export const M09_MARKS: TimingMark[] = ['tpd', 'edge', 'setup', 'hold', 'ctq', 'fmax']
