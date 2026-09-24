import { loc, type LText } from '../../../i18n/locale'

export type KindId = 'power' | 'in' | 'out' | 'idd' | 'speed'
export type FamilyId = 'dc' | 'ac'

export const KINDS: Array<{ id: KindId; labelKey: 'kindPower' | 'kindIn' | 'kindOut' | 'kindIdd' | 'kindSpeed' }> = [
  { id: 'power', labelKey: 'kindPower' },
  { id: 'in', labelKey: 'kindIn' },
  { id: 'out', labelKey: 'kindOut' },
  { id: 'idd', labelKey: 'kindIdd' },
  { id: 'speed', labelKey: 'kindSpeed' },
]

export type SpecId = 'vdd' | 'vih' | 'vil' | 'voh' | 'vol' | 'idd' | 'fmax'

export const SPECS: Array<{
  id: SpecId
  name: string
  limit: LText
  kind: KindId
  family: FamilyId
  familyNote: LText
  method: LText
}> = [
  {
    id: 'vdd',
    name: 'VDD',
    limit: loc('3.3 V'),
    kind: 'power',
    family: 'dc',
    familyNote: loc('DC'),
    method: loc('先给规定电源电压，再看电流、再开后续测试。没有稳妥的 VDD，后面的 0/1 都不可信。'),
  },
  {
    id: 'vih',
    name: 'VIH',
    limit: loc('≥ 2.0 V'),
    kind: 'in',
    family: 'dc',
    familyNote: loc('DC'),
    method: loc('ATE 把输入赶到规格边沿 2.0 V，看 DUT 是否仍按 Logic 1 工作。这是输入门槛，不是输出电压。'),
  },
  {
    id: 'vil',
    name: 'VIL',
    limit: loc('≤ 0.8 V'),
    kind: 'in',
    family: 'dc',
    familyNote: loc('DC'),
    method: loc('ATE 把输入赶到 0.8 V，看 DUT 是否仍按 Logic 0 工作。和 VIH 一对，都是输入阈值。'),
  },
  {
    id: 'voh',
    name: 'VOH',
    limit: loc('≥ 2.4 V'),
    kind: 'out',
    family: 'dc',
    familyNote: loc('DC'),
    method: loc('让输出为 1，PMU 或 Comparator 看电压是否还够 2.4 V。测的是输出驱动，不是输入门槛。'),
  },
  {
    id: 'vol',
    name: 'VOL',
    limit: loc('≤ 0.4 V'),
    kind: 'out',
    family: 'dc',
    familyNote: loc('DC'),
    method: loc('让输出为 0，看电压是否还压得住 0.4 V。和 VOH 一对，都是输出驱动能力。'),
  },
  {
    id: 'idd',
    name: 'IDD',
    limit: loc('< 20 mA'),
    kind: 'idd',
    family: 'dc',
    familyNote: loc('DC'),
    method: loc('按规定模式供电，量电源电流。超了就是功耗不合格，不是功能 Pattern 错了一拍。'),
  },
  {
    id: 'fmax',
    name: 'fMAX',
    limit: loc('100 MHz'),
    kind: 'speed',
    family: 'ac',
    familyNote: loc('AC / Functional'),
    method: loc('提高时钟或缩短周期，看功能是否仍对。这是速度，不是静态电压门槛。'),
  },
]

export type PipeId = 'datasheet' | 'spec' | 'method' | 'setup' | 'program' | 'result'

export const PIPE: Array<{ id: PipeId; title: LText; text: LText }> = [
  {
    id: 'datasheet',
    title: loc('Datasheet'),
    text: loc('器件必须满足什么。写给用户和 Test Engineer，还不是机器指令。'),
  },
  {
    id: 'spec',
    title: loc('Test Specification'),
    text: loc('测哪些项、上下限多少、判 Pass / Fail 的依据。从 Datasheet 翻译过来。'),
  },
  {
    id: 'method',
    title: loc('Test Method'),
    text: loc('这一项用 DC、Functional 还是 AC，Force 什么、Measure 什么。'),
  },
  {
    id: 'setup',
    title: loc('Tester Setup'),
    text: loc('落到机器上的 Level / Timing / Pattern。还没写成完整程序。'),
  },
  {
    id: 'program',
    title: loc('Test Program'),
    text: loc('ATE 真正执行的流程：先测什么、失败去哪个 Bin。'),
  },
  {
    id: 'result',
    title: loc('Pass / Fail'),
    text: loc('和规格比完的结果。测试到这里才结束，不是写完代码就结束。'),
  },
]

export type VihStepId = 'sheet' | 'force' | 'logic' | 'look' | 'judge'

export const VIH_STEPS: Array<{ id: VihStepId; title: LText; text: LText }> = [
  {
    id: 'sheet',
    title: loc('Datasheet: VIH ≥ 2.0 V'),
    text: loc('规格先说：输入至少 2.0 V 才必须被认成 1。Test Spec 把这句话收成可判定的一项。'),
  },
  {
    id: 'force',
    title: loc('ATE 给 DUT 输入 2.0 V'),
    text: loc('测法选在规格边沿。不是随便给 3.3 V 看一眼——那测不出门槛。'),
  },
  {
    id: 'logic',
    title: loc('DUT 应识别为 Logic 1'),
    text: loc('芯片内部应把这根脚当成 1。ATE 自己看不见“认成”，要靠后面的行为。'),
  },
  {
    id: 'look',
    title: loc('Tester 看后续输出 / 功能是否按 1 工作'),
    text: loc('Drive 给完，还要 Compare 或测后续脚。方法已经从规格走到了 Tester Setup。'),
  },
  {
    id: 'judge',
    title: loc('PASS / FAIL'),
    text: loc('按 1 工作就过，否则失败。DC 课会把这一条做成可拖电压的实验。'),
  },
]

export const TAKEAWAY = loc(
  'Test Engineer 的日常经常不是先写代码，而是把 Datasheet 译成 Test Spec，再选方法、设 Tester，最后才是 Program 和 Pass / Fail。',
)

export type QuizId = 'q1' | 'q2' | 'q3' | 'q4' | 'q5'

export type QuizQuestion = {
  id: QuizId
  prompt: LText
  options: Array<{ id: string; text: LText }>
  answer: string
  explain: LText
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'q1',
    prompt: loc('Test Engineer 日常更常先做哪件事？'),
    options: [
      { id: 'code', text: loc('一上来就写 Tester 代码') },
      { id: 'trans', text: loc('把 Datasheet 变成机器可执行的测试') },
      { id: 'fix', text: loc('把失效芯片修好再出货') },
      { id: 'art', text: loc('画 Load Board 的 3D 爆炸图') },
    ],
    answer: 'trans',
    explain: loc(
      '代码是后面的事。先有规格、方法和判定，程序才知道测什么、怎么判。',
    ),
  },
  {
    id: 'q2',
    prompt: loc('Datasheet 和 Test Specification 差在哪？'),
    options: [
      { id: 'same', text: loc('同一份文件，只是换个封面') },
      { id: 'ok', text: loc('Datasheet 写必须满足什么；Test Spec 写测什么、怎么判') },
      { id: 'bin', text: loc('Datasheet 是 Bin 号，Test Spec 是 Socket') },
      { id: 'pmu', text: loc('Datasheet 就是 PMU') },
    ],
    answer: 'ok',
    explain: loc(
      '规格是目标。Test Spec 才是测试清单：测哪些项、上下限、Pass / Fail 依据。',
    ),
  },
  {
    id: 'q3',
    prompt: loc('整门课的主线，正确顺序是？'),
    options: [
      { id: 'rev', text: loc('先写 Program，再回头找 Datasheet') },
      {
        id: 'ok',
        text: loc('Datasheet → Test Spec → Method → Tester Setup → Program → Pass / Fail'),
      },
      { id: 'skip', text: loc('有 Pattern 就够了，不用规格') },
      { id: 'ate', text: loc('先买 ATE，规格以后再说') },
    ],
    answer: 'ok',
    explain: loc(
      '后面讲 VIH、DC、Functional，都走这一条。不要从程序倒着学。',
    ),
  },
  {
    id: 'q4',
    prompt: loc('教学表里的 IDD < 20 mA，首先是哪一类？'),
    options: [
      { id: 'in', text: loc('输入阈值') },
      { id: 'speed', text: loc('速度') },
      { id: 'idd', text: loc('功耗') },
      { id: 'out', text: loc('输出驱动') },
    ],
    answer: 'idd',
    explain: loc('IDD 是电源电流。先归到功耗，再落到 DC 测法。'),
  },
  {
    id: 'q5',
    prompt: loc('测 VIH ≥ 2.0 V，为什么要给 2.0 V，而不是只给 3.3 V？'),
    options: [
      { id: 'easy', text: loc('3.3 V 更接近真实使用，门槛不用测') },
      { id: 'edge', text: loc('要在规格边沿确认 DUT 仍按 Logic 1 工作') },
      { id: 'pmu', text: loc('VIH 只能用开短路测') },
      { id: 'mhz', text: loc('VIH 其实是频率') },
    ],
    answer: 'edge',
    explain: loc(
      '舒适电压只能证明“够高时能当 1”。规格要的是：低到 2.0 V 仍然是 1。',
    ),
  },
]
