import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from './types'

/** ANA-15 综合：混合信号芯片测试程序：术语、已有词条的课程补充、常见问题 */
export const ANA_CAPSTONE_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'guardband',
      term: 'Guardband',
      name: loc('guardband（保护带）', 'Guardband'),
      def: loc(
        '把规格上下限向内收的一段余量，测试限值 = 规格 − guardband。它挡住落在规格边缘、靠测量噪声侥幸通过的坏片，代价是边缘的好品也会被判 Fail。收多少要在误杀与漏检之间取舍，见 {@anaCapstone}。',
        'A margin that pulls the spec limits inward: test limit = spec − guardband. It blocks bad parts near the spec edge that pass only because of measurement noise, at the cost of failing good parts near the edge too. How much to pull in is a trade-off between overkill and escape; see {@anaCapstone}.',
      ),
      lessons: ['anaCapstone'],
    },
    {
      id: 'cpk',
      term: 'Cpk',
      name: loc('过程能力指数', 'Process capability index (Cpk)'),
      def: loc(
        '批内测量值的均值 μ 与标准差 σ 相对规格余量的度量：Cpk = min(USL − μ, μ − LSL) ÷ (3σ)。按规格算，不随 guardband 变；Cpk 高只说明这批分布离规格远，不等于没有坏片，良率仍要逐颗统计。见 {@anaCapstone}。',
        'A measure of how far the batch mean μ and spread σ sit from the spec: Cpk = min(USL − μ, μ − LSL) ÷ (3σ). It is computed against the spec, so it does not change with guardband. A high Cpk means the distribution is far from the spec, not that there are no bad parts; yield must still be counted part by part. See {@anaCapstone}.',
      ),
      lessons: ['anaCapstone'],
    },
    {
      id: 'overkill',
      term: 'Overkill',
      name: loc('误杀（过杀）', 'Overkill'),
      def: loc(
        '好品被判 Fail 的情况，也就是真值在规格内却被测试程序判坏。限值收得过紧（含 guardband 过大）、测量噪声大，都会增加误杀。与之相对的是漏检（Escape）：坏片被判 Pass。见 {@anaCapstone}。',
        'Good parts judged as fails: the true value is within spec but the test program rejects the part. A limit that is too tight (including an oversized guardband) or high measurement noise increases overkill. Its counterpart is escape: bad parts judged as passes. See {@anaCapstone}.',
      ),
      lessons: ['anaCapstone'],
    },
    {
      id: 'stop-on-fail',
      term: 'stopOnFail',
      name: loc('遇 Fail 即停（stopOnFail）', 'Stop on fail (stopOnFail)'),
      def: loc(
        '测试程序的一个开关：某项 Fail 后立即停止，后面的项不再执行。它能省测试时间，省下多少只取决于失效比例与失效项的位置；排错和表征时要关掉，才能看到全部数据。见 {@anaCapstone}。',
        'A test-program switch: once an item fails, testing stops and the later items are skipped. It saves test time, and the amount saved depends only on the fail rate and where the fails sit. Turn it off for debug and characterization to see all the data. See {@anaCapstone}.',
      ),
      lessons: ['anaCapstone'],
    },
  ],
  extraLessons: {
    'test-program': ['anaCapstone'],
    bin: ['anaCapstone'],
    yield: ['anaCapstone'],
    dut: ['anaCapstone'],
  },
  faqs: [
    {
      id: 'ana-guardband-tradeoff',
      q: loc('guardband 是不是越大越安全？', 'Is a bigger guardband always safer?'),
      a: loc(
        '不是。guardband 只能挡住落在规格边缘、靠测量噪声侥幸通过的坏片；收得越多，限值越窄，落在窄出那一圈的好品就越多被误杀。它是误杀与漏检之间的取舍，要用 overkill 与 escape 两个数一起看，见 {@anaCapstone}。',
        'No. Guardband only blocks bad parts near the spec edge that pass only because of measurement noise. The more it narrows the limit, the more good parts in the narrowed band are failed. It is a trade-off between overkill and escape, so read both numbers together; see {@anaCapstone}.',
      ),
      lessons: ['anaCapstone', 'anaStats'],
    },
    {
      id: 'ana-cpk-vs-yield',
      q: loc('Cpk 很高，是不是就一定没有坏片？', 'If Cpk is high, does the batch definitely have no bad parts?'),
      a: loc(
        '不是。Cpk 只是批内均值与标准差相对规格的余量，几颗坏片可能只让它小幅下降。良率必须逐颗统计 Pass 与 Fail，Cpk 用来看过程是否稳定、余量是否足够，两者要一起用，见 {@anaCapstone}。',
        'No. Cpk only summarizes the batch mean and spread against the spec, and a few bad parts may lower it only slightly. Yield must be counted part by part as Pass or Fail. Use Cpk to judge process stability and margin, and yield to judge the batch; see {@anaCapstone}.',
      ),
      lessons: ['anaCapstone', 'anaStats'],
    },
    {
      id: 'ana-stop-on-fail-order',
      q: loc('开启 stopOnFail 后，测试项的顺序还重要吗？', 'With stopOnFail on, does the order of test items still matter?'),
      a: loc(
        '很重要。良品仍要跑完全部项，但失效的 DUT 会在第一个 Fail 处停下。把失效率高、耗时短的项放在前面，平均每颗的测试时间才会降下来；同时 Bin 取执行顺序中第一个 Fail 的项，调换顺序会改变 Bin 分布，见 {@anaCapstone}。',
        'Yes. Good parts still run every item, but a failing DUT stops at its first fail. Putting high-fail-rate, short items first lowers the average test time. Bin also comes from the first failing item in run order, so reordering changes the bin distribution; see {@anaCapstone}.',
      ),
      lessons: ['anaCapstone'],
    },
  ],
}
