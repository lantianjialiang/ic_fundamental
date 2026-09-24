import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

export const VOLTS = [0.8, 0.9, 1.0, 1.1, 1.2]
export const FREQS = [50, 70, 90, 110, 130, 150]

export function cellPass(v: number, f: number): boolean {
  return f <= 40 + v * 80
}

export const YIELD = loc(
  '量产 Bin 钉在一个条件：比如 1.0 V / 100 MHz。Shmoo 解释为什么 Cond A Pass、Cond B Fail。Yield 是固定条件下的通过比例，不是边界本身。',
)

export const TAKEAWAY = loc(
  'Characterization 问芯片能工作到什么边界。量产测试通常只钉一个点。',
)

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('Shmoo 格子里的 P / F 怎么来的？'),
    options: [
      { id: 'guess', text: loc('随便涂颜色') },
      { id: 'same', text: loc('同一套 Functional + Timing，只改这个 (V, f)') },
      { id: 'dc', text: loc('只测开短路') },
      { id: 'bin', text: loc('按 Bin 号上色') },
    ],
    answer: 'same',
    explain: loc('条件在变，向量和时序定义还是那一套。'),
  },
  {
    id: 'q2',
    prompt: loc('量产测试和表征差在哪？'),
    options: [
      { id: 'same', text: loc('没有差别') },
      { id: 'ok', text: loc('量产钉一个条件判 Bin；表征扫边界') },
      { id: 'slow', text: loc('表征一定更慢所以更准') },
      { id: '3d', text: loc('表征必须用 3D') },
    ],
    answer: 'ok',
    explain: loc('Yield 是固定点上的通过率。Shmoo 告诉你这个点离悬崖有多远。'),
  },
  {
    id: 'q3',
    prompt: loc('为什么高电压的格子往往更能 Pass 高频率？'),
    options: [
      { id: 'luck', text: loc('随机') },
      { id: 'drive', text: loc('电压裕量更大，延迟通常更小，窗口更宽') },
      { id: 'scan', text: loc('电压就是扫描使能') },
      { id: 'open', text: loc('高压会把开路修掉') },
    ],
    answer: 'drive',
    explain: loc('这是教学示意，不是每颗芯片的物理定律。点格子看边界形状。'),
  },
  {
    id: 'q4',
    prompt: loc('Bin 和 Shmoo 如何对齐？'),
    options: [
      { id: 'ok', text: loc('Bin 是固定条件的判定；Shmoo 解释条件一变为什么翻盘') },
      { id: 'swap', text: loc('Shmoo 替代 Bin') },
      { id: 'm01', text: loc('和 M01 的 Yield 无关') },
      { id: 'alu', text: loc('只有 ALU 才有 Bin') },
    ],
    answer: 'ok',
    explain: loc('回扣第一课的 Yield / Bin：量产给一个答案，表征画出那道墙。'),
  },
]

export function cellText(v: number, f: number, pass: boolean): LText {
  return pass
    ? loc(`在 ${v.toFixed(1)} V / ${f} MHz，同一套功能向量 Pass。`)
    : loc(`在 ${v.toFixed(1)} V / ${f} MHz Fail。量产如果钉在这里，Bin 就会红。`)
}
