import { loc, type LText } from '../../../i18n/locale'
import { type QuizQuestion } from '../../../lab/QuizList'

/* ---------- 1. 样品 ---------- */

export const SAMPLE_LEAD: LText[] = [
  loc('程序写完，第一件事是给样品编序列号并保存起来。可能的话，测试工程师自己留几颗，和交给生产的样品分开放。'),
  loc('每颗样品都要有一份完整的 Datalog（带序列号）。Datalog 上还要写明：测试程序版本、用的哪台测试机、测试日期。将来出了测试问题，这些信息极有价值。'),
]

export type FieldId = 'sn' | 'rev' | 'tester' | 'date' | 'full'

export const FIELDS: Array<{ id: FieldId; label: LText; line: string }> = [
  { id: 'sn', label: loc('序列号'), line: 'S/N        : 0003' },
  { id: 'rev', label: loc('程序版本'), line: 'PROGRAM    : sram256x4.prg  REV 1.2' },
  { id: 'tester', label: loc('测试机'), line: 'TESTER     : T05 (HP-83000 #2)' },
  { id: 'date', label: loc('日期'), line: 'DATE       : 2026-10-10 14:32' },
  { id: 'full', label: loc('全部测试项的读数'), line: 'OS 20/20 -0.65V | IDD 3.1mA | IIL/IIH max 0.8uA | VOL 0.37V | VOH 3.85V | tPD 23.6ns | FUNC PASS' },
]

export const TRACE_QS: Array<{ id: string; need: FieldId[]; q: LText }> = [
  { id: 'same', need: ['sn', 'full'], q: loc('量产良率掉了。拿出当初的 3 号样品重测，结果和当初一样吗？') },
  { id: 'rev', need: ['rev'], q: loc('是不是程序改版以后才出的问题？') },
  { id: 'tester', need: ['tester'], q: loc('是不是换了一台测试机？') },
  { id: 'date', need: ['date'], q: loc('样品是什么时候测的？之后硬件、程序又改过什么？') },
]

/* ---------- 2. 查 Margin ---------- */

export const MARGIN_LEAD: LText[] = [
  loc('Margin（余量）指一个参数在出现 Fail 之前还能被改变多少。程序完成后要逐项验证余量。'),
  loc('尽量用系统工具，例如 VLS 和 Shmoo。有的测试机能把所有参数一起拉偏 ±某个百分比。电压、电流、时序都要拉一遍，结果存档备查。'),
  loc('某个参数离 Fail 很近，将来多半会变成量产良率问题。目标是在量产之前发现并解决它。'),
]

export type MarginParam = { id: string; name: string; kind: LText; spec: number; fail: number; unit: string; text: LText }

const K_IN = loc('输入条件')
const K_OUT = loc('输出限值')
const K_TIME = loc('时序')

/** fail：芯片真实失效点（对输入条件），或芯片实测值（对输出限值） */
export const MARGIN_PARAMS: MarginParam[] = [
  { id: 'vddmin', name: 'VDD min', kind: K_IN, spec: 4.5, fail: 4.05, unit: 'V', text: loc('VDD 降到 4.05 V 才 Fail，比 4.5 V 规格低 10%。') },
  { id: 'vddmax', name: 'VDD max', kind: K_IN, spec: 5.5, fail: 6.1, unit: 'V', text: loc('VDD 升到 6.1 V 才出问题。') },
  { id: 'vil', name: 'VIL', kind: K_IN, spec: 0.8, fail: 1.12, unit: 'V', text: loc('VIL 一直加到 1.12 V，芯片才把“0”认错。余量很大。') },
  { id: 'vih', name: 'VIH', kind: K_IN, spec: 2.0, fail: 1.55, unit: 'V', text: loc('VIH 降到 1.55 V 芯片才把“1”认错。') },
  { id: 'vol', name: 'VOL', kind: K_OUT, spec: 0.4, fail: 0.372, unit: 'V', text: loc('实测 VOL 0.372 V，离 0.4 V 上限只差 7%。不同批次的工艺波动就可能让它 Fail。') },
  { id: 'voh', name: 'VOH', kind: K_OUT, spec: 2.4, fail: 3.85, unit: 'V', text: loc('实测 VOH 3.85 V，远高于 2.4 V 下限。') },
  { id: 'iol', name: 'IOL', kind: K_IN, spec: 8, fail: 13.6, unit: 'mA', text: loc('负载电流加到 13.6 mA，VOL 才超限。') },
  { id: 'per', name: 'Period', kind: K_TIME, spec: 50, fail: 47.6, unit: 'ns', text: loc('周期缩到 47.6 ns 就 Fail——只有不到 5% 的余量。这是将来的良率问题，要在量产前查清楚。') },
  { id: 'su', name: 'Setup', kind: K_TIME, spec: 10, fail: 6.5, unit: 'ns', text: loc('建立时间缩到 6.5 ns 才 Fail。') },
  { id: 'tpd', name: 'tPD', kind: K_OUT, spec: 25, fail: 23.6, unit: 'ns', text: loc('实测 tPD 23.6 ns，离 25 ns 上限只有 5.6%。慢一点的芯片就会掉出来。') },
  { id: 'idd', name: 'IDD', kind: K_OUT, spec: 5, fail: 3.4, unit: 'mA', text: loc('实测 3.4 mA，离 5 mA 上限还有 32%。') },
]

export const marginPct = (p: MarginParam) => (Math.abs(p.fail - p.spec) / p.spec) * 100
/** 拉偏 x% 后的条件或限值：朝着失效点的方向走 */
export const pushed = (p: MarginParam, x: number) => p.spec * (1 + Math.sign(p.fail - p.spec) * (x / 100))

export const RISK_PCT = 10

export const MARGIN_MSG = {
  none: loc('还没有参数 Fail。继续往右拉，看谁先倒下。'),
  fail: loc('已经 Fail 的参数：{x}。在真实测试机上，这一步会告诉你哪一项最先撑不住。'),
  risk: loc('余量小于 10% 的参数（金色）最危险：{x}。它们今天能 Pass，换一批晶圆、换一个温度就可能 Fail。'),
}

/* ---------- 3. Shmoo 每个向量 ---------- */

export const SHMOO_VDD = [4.0, 4.25, 4.5, 4.75, 5.0, 5.25, 5.5, 5.75, 6.0]
export const SHMOO_VIL = [0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8]
export const SPEC_VDD = 5.0
export const SPEC_VIL = 0.8

export type ShmooVec = { id: string; name: string; k: number; holes: Array<[number, number]>; text: LText }

export const SHMOO_VECS: ShmooVec[] = [
  { id: 'march', name: 'march.pat', k: 0.3, holes: [], text: loc('边界平滑，随 VDD 升高，能容忍的 VIL 也升高——正常。') },
  { id: 'checker', name: 'checker.pat', k: 0.28, holes: [], text: loc('边界比 march 稍低，但依然平滑、连续——正常。不同图形的边界本来就会有点差别。') },
  { id: 'walk', name: 'walk1.pat', k: 0.3, holes: [[5.0, 0.8], [5.25, 0.8], [5.0, 1.0]], text: loc('Pass 区中间有一个洞，而且就落在规格点（VDD 5 V、VIL 0.8 V）旁边！可能是图形敏感、噪声或时序临界。要在量产前查清楚。') },
  { id: 'decode', name: 'addr_dec.pat', k: 0.31, holes: [], text: loc('边界平滑——正常。') },
]

export function shmooPass(v: ShmooVec, vdd: number, vil: number) {
  if (v.holes.some(([a, b]) => a === vdd && b === vil)) return false
  return vdd >= 4.25 && vil <= v.k * vdd - 0.1
}

export const SHMOO_LEAD: LText[] = [
  loc('可能的话，给每一个测试向量都画 Shmoo 图，找洞或其它不规则的地方。画 VDD vs. VIL/VIH，以及 VDD vs. 输出延迟。结果存档。'),
  loc('一个工作正常的向量，Shmoo 的 Pass 区应该是连续的一整块，边界平滑。'),
]

export const SHMOO_RIGHT = loc('答对了。')
export const SHMOO_WRONG = loc('这个向量的图看起来没问题，再看看别的。')

/* ---------- 4. 验证分 Bin ---------- */

export type FailKind = { id: string; label: LText; expect: number; prog: number; text: LText }

export const FAIL_KINDS: FailKind[] = [
  { id: 'good', label: loc('好片（不制造 Fail）'), expect: 1, prog: 1, text: loc('全部 Pass，进 Bin 1。') },
  { id: 'os', label: loc('开短路'), expect: 7, prog: 7, text: loc('抬起一根管脚制造开路，进 Bin 7，正确。') },
  { id: 'idd', label: loc('IDD 超限'), expect: 6, prog: 6, text: loc('把 IDD 限值临时调低制造 Fail，进 Bin 6，正确。') },
  { id: 'func', label: loc('功能'), expect: 5, prog: 5, text: loc('改一个期望值制造功能 Fail，进 Bin 5，正确。') },
  { id: 'leak', label: loc('输入漏电'), expect: 4, prog: 1, text: loc('配错了！漏电 Fail 以后程序没有跳到 Fail Bin，继续往下跑，最后进了 Bin 1——坏片被当成好片出货。这就是为什么每一类 Fail 都要亲手制造一次。') },
  { id: 'vout', label: loc('VOH / VOL'), expect: 3, prog: 3, text: loc('加大负载电流制造 VOL Fail，进 Bin 3，正确。') },
  { id: 'ac', label: loc('AC tPD'), expect: 2, prog: 2, text: loc('把 Strobe 提前制造 tPD Fail，进 Bin 2，正确。') },
]

export const BIN_LEAD: LText[] = [
  loc('分 Bin 和测试汇总的例程也必须验证。每一类测试都要制造一次 Fail，看它是否进了正确的 Bin。记下制造了哪些 Fail，再打一份汇总，确认汇总也是对的。'),
]

export const TEMP_RANGES: Array<{ id: string; label: LText; lo: number; hi: number }> = [
  { id: 'com', label: loc('商业级 0–70 °C'), lo: 0, hi: 70 },
  { id: 'ind', label: loc('工业级 −40–85 °C'), lo: -40, hi: 85 },
  { id: 'mil', label: loc('军品级 −55–125 °C'), lo: -55, hi: 125 },
]

export const TEMP_TEXT: LText[] = [
  loc('在规定的温度范围内测试芯片。如果表现良好，把温度范围再扩展 10% 重测一遍。潜在问题越早发现越好。结果记录存档。'),
]

export const HANDLER_TEXT = loc('如果芯片要在晶圆测试或自动分选机上测，要把探针台 / 分选机实际装起来，验证分 Bin 信号、温度控制、接触都正常——手测通过不代表上了机器也没问题。')

/* ---------- 5. 文档包 ---------- */

export const DOCS: Array<{ id: string; label: LText; why: LText }> = [
  {
    id: 'summary',
    label: loc('开发摘要与偏离说明'),
    why: loc('总结整个开发过程，特别注明和测试规格不一致的地方，并引用 Shmoo 图、Datalog、备忘录等支持材料。写上测试时间和特殊要求（外部硬件、非标准分选等），以及和设计、产品工程师、客户之间的往来记录。'),
  },
  {
    id: 'listing',
    label: loc('程序源码清单'),
    why: loc('按首次发布时的原样附上源码，最好再存一份编译后的清单。电子版最方便，纸质版到哪里都能看。'),
  },
  {
    id: 'flow',
    label: loc('程序流程图与分 Bin'),
    why: loc('画出所有测试的流程，并标明每一项 Fail 进哪个 Bin。别人看一眼就知道程序在做什么。'),
  },
  {
    id: 'datalog',
    label: loc('序列化 Datalog + 空座 Datalog'),
    why: loc('附上带序列号、包含所有测试结果的完整 Datalog。再附一份空座 Datalog：检查每一项都 Fail，漏电和电流读数也要看。'),
  },
  {
    id: 'spec',
    label: loc('测试规格'),
    why: loc('附上开发程序时依据的那一版测试规格。规格以后会改，必须知道程序是按哪一版写的。'),
  },
  {
    id: 'hw',
    label: loc('硬件文档（足以重建）'),
    why: loc('图纸加文字说明，覆盖所有测试硬件。信息要足够完整，让别人不看原硬件也能再做出几套。'),
  },
  {
    id: 'std',
    label: loc('至少 5 颗标准品'),
    why: loc('文档包里至少放 5 颗标准品，都要编序列号并有 Datalog。将来任何一台机器、任何一套硬件，都可以拿它们来对照。'),
  },
  {
    id: 'backup',
    label: loc('备份与归档'),
    why: loc('最终程序多备份几份：一份放文档包，一份自己留。开发过程的所有文件（仿真文件、测试用例等）也压缩存档。每份备份都要标清楚，一眼能认出里面是什么。'),
  },
]

export const DOC_DONE = loc('文档包齐了。三环活页夹是个好办法：把这些按顺序放好，交给生产和以后接手的人。')

/* ---------- 带走 & 复习 ---------- */

export const TAKEAWAY: LText[] = [
  loc('样品编序列号保存，Datalog 写清程序版本、机台、日期。'),
  loc('Margin = 参数离 Fail 还有多远。余量小的参数，就是将来的良率问题。'),
  loc('每个向量都画 Shmoo：正常的 Pass 区是连续的一块，有洞就要查。'),
  loc('每一类 Fail 都亲手制造一次，确认进对 Bin、汇总正确；温度范围再扩 10% 测一遍。'),
  loc('文档包：摘要、源码、流程图、Datalog、规格、硬件、标准品、备份——缺一不可。'),
]

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('为什么必须保存样品？'),
    options: [
      { id: 'a', text: loc('以后出了测试问题，可以用这些有完整 Datalog 的已知样品对照，分清是芯片变了，还是程序、硬件、机台变了') },
      { id: 'b', text: loc('可以卖给客户') },
      { id: 'c', text: loc('为了凑够库存数量') },
      { id: 'd', text: loc('用来做闩锁破坏测试') },
    ],
    answer: 'a',
    explain: loc('样品 + 序列号 + 完整 Datalog（程序版本、机台、日期）就是一把“标准尺”，出问题时极有价值。'),
  },
  {
    id: 'q2',
    prompt: loc('Margin（余量）指的是什么？'),
    options: [
      { id: 'a', text: loc('规格上限和下限之间的差') },
      { id: 'b', text: loc('一个参数在出现 Fail 之前还能被改变多少') },
      { id: 'c', text: loc('测试时间还能缩短多少') },
      { id: 'd', text: loc('芯片的利润率') },
    ],
    answer: 'b',
    explain: loc('余量越小，参数越接近失效点，量产中越容易因工艺波动而 Fail。'),
  },
  {
    id: 'q3',
    prompt: loc('如果一个测试向量工作正常，它的 VDD vs. VIL Shmoo 图应该没有“洞”。这句话对吗？'),
    options: [
      { id: 'a', text: loc('对') },
      { id: 'b', text: loc('错') },
    ],
    answer: 'a',
    explain: loc('正常向量的 Pass 区是连续的一块。中间出现洞，说明有图形敏感、噪声或时序临界之类的问题。'),
  },
  {
    id: 'q4',
    prompt: loc('测试程序文档包里必须包含哪些东西？哪一组最完整？'),
    options: [
      { id: 'a', text: loc('只要程序源码就够了') },
      { id: 'b', text: loc('开发摘要、程序清单、流程图与分 Bin、序列化 Datalog、测试规格、硬件文档、标准品、备份') },
      { id: 'c', text: loc('设计原理图、晶圆价格、员工名单') },
      { id: 'd', text: loc('只要 Shmoo 图和 Datalog') },
    ],
    answer: 'b',
    explain: loc('原题要求至少列出四项。这些东西合在一起，才能让别人不靠你本人就能理解、运行、重建这套测试。'),
  },
  {
    id: 'q5',
    prompt: loc('整体拉偏 5% 时，Period 和 tPD 就 Fail 了，其它参数都还有 20% 以上余量。应该怎么办？'),
    options: [
      { id: 'a', text: loc('反正在规格点能 Pass，不用管') },
      { id: 'b', text: loc('把这两项从程序里删掉') },
      { id: 'c', text: loc('这两项会变成量产良率问题，应在量产前和设计 / 产品工程师一起查清原因并解决') },
    ],
    answer: 'c',
    explain: loc('余量小的参数今天能过，换一批晶圆、换个温度就可能大量 Fail。提前发现、提前解决。'),
  },
  {
    id: 'q6',
    prompt: loc('验证分 Bin 时，为什么要把每一类 Fail 都亲手制造一次？'),
    options: [
      { id: 'a', text: loc('为了把芯片测坏') },
      { id: 'b', text: loc('只有这样才能发现分 Bin 配错，比如某项 Fail 后程序没跳 Bin，坏片落进 Bin 1') },
      { id: 'c', text: loc('为了延长测试时间') },
    ],
    answer: 'b',
    explain: loc('好片只会走“全部 Pass”这一条路，Fail 的分支平时根本走不到。不亲手触发，配错了也看不出来。'),
  },
]
