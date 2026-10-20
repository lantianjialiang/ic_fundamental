import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** MEM-11 测试覆盖率与良率：缺陷密度、测试逃逸（PPM）；覆盖率、良率、March 算法已在别处定义，这里补充课程 */
export const MEM_COVERAGE_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'defect-density',
      term: 'Defect density',
      name: loc('缺陷密度（λ）', 'Defect density (λ)'),
      def: loc(
        '单位面积或每颗器件上平均的缺陷数，本站用 λ 表示“每颗器件平均缺陷数”。缺陷服从泊松分布时，真实良率 = e^(−λ)。缺陷密度决定良率的上限，覆盖率只决定能抓出多少。见 {@memCoverage}。',
        'Average number of defects per unit area or per device; this site uses λ for the average defects per device. If defects follow a Poisson distribution, the true yield is e^(−λ). Defect density sets the yield ceiling, while coverage only decides how many defects are caught. See {@memCoverage}.',
      ),
      lessons: ['memCoverage'],
    },
    {
      id: 'test-escape',
      term: 'Test escape',
      name: loc('测试逃逸（PPM）', 'Test escape (PPM)'),
      def: loc(
        '有缺陷却通过了测试、被当作好品出货的器件。常用每百万颗（PPM）计。用覆盖率 c、缺陷密度 λ 估算：PPM = (1 − e^(−λ(1−c))) × 10⁶。覆盖率越高，逃逸越少。见 {@memCoverage}。',
        'Devices with defects that pass the test and ship as good parts, usually counted in parts per million (PPM). With coverage c and defect density λ: PPM = (1 − e^(−λ(1−c))) × 10⁶. Higher coverage means fewer escapes. See {@memCoverage}.',
      ),
      lessons: ['memCoverage'],
    },
  ],
  extraLessons: {
    'fault-coverage': ['memCoverage'],
    yield: ['memCoverage'],
    march: ['memCoverage'],
  },
  faqs: [
    {
      id: 'mem-cov-99-yield',
      q: loc('测试覆盖率 99% 以上，良率就一定高吗？', 'With test coverage above 99%, is yield necessarily high?'),
      a: loc(
        '不一定。覆盖率只说明注入的故障里有多少被抓到，良率由器件真的有多少缺陷决定。缺陷多的批次，即使覆盖率很高，测出来的良率也会低，而且这些坏品本来就不能出货。见 {@memCoverage}。',
        'Not necessarily. Coverage only says how many injected faults are caught, while yield depends on how many real defects a device has. In a batch with many defects, yield stays low even at high coverage, and those bad parts should not ship anyway. See {@memCoverage}.',
      ),
      lessons: ['memCoverage'],
    },
    {
      id: 'mem-cov-why-short-march',
      q: loc('既然 March C− 覆盖最全，为什么还用 MATS+ 或 MSCAN？', 'If March C− covers the most, why use MATS+ or MSCAN?'),
      a: loc(
        '因为测试时间就是成本。短算法耗时少，可以先做筛选，或用在缺陷少、故障类型单一的场合；关键器件、或者怀疑有跳变和耦合故障的工艺，再用覆盖更全的长算法。选择算法要看目标故障类型和成本。见 {@memCoverage}。',
        'Because test time is cost. A short algorithm takes less time and can screen first, or serve where defects are few and of one type; critical devices, or processes suspected of transition and coupling faults, use a longer algorithm with wider coverage. Choosing an algorithm means weighing the target fault types against cost. See {@memCoverage}.',
      ),
      lessons: ['memCoverage'],
    },
    {
      id: 'mem-cov-sample-size',
      q: loc('仿真里的覆盖率数字可靠吗？', 'Are the coverage numbers in the simulation reliable?'),
      a: loc(
        '只能用来比较算法的相对位置。仿真阵列只有 128 个单元、240 个随机故障，换一个种子，数字就会变。要得到可靠的覆盖率，需要按真实缺陷的统计分布抽样，并且样本足够大。见 {@anaStats}。',
        'They only show the relative position of the algorithms. The simulated array has 128 cells and 240 random faults, and a different seed changes the numbers. A reliable coverage figure needs sampling that follows the statistical distribution of real defects, with a large enough sample. See {@anaStats}.',
      ),
      lessons: ['memCoverage'],
    },
  ],
}
