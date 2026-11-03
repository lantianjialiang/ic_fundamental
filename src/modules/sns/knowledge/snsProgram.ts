import { loc } from '../../../i18n/locale'
import { type ModuleId } from '../../catalog'
import { type AnaKnowledge } from '../../ana/knowledge/types'

const asId = (id: string): ModuleId => id as ModuleId

/** SNS-09 量产程序：缺陷图、OTP、等级、帧时间 */
export const SNS_PROGRAM_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'sns-defect-map',
      term: 'Defect map',
      name: loc('缺陷图', 'Defect map'),
      def: loc(
        '标出每个坏点位置和类型的图。它要写进 OTP，后面的系统靠它替换坏点，不是一张只在测试端看的统计。见 {@snsProgram}。',
        'A map of where each bad pixel is and what type it is. It is written to OTP so a later system can replace those pixels. It is not a statistic that stays at the tester. See {@snsProgram}.',
      ),
      lessons: [asId('snsProgram')],
    },
    {
      id: 'sns-otp-map',
      term: 'OTP defect map',
      name: loc('写入 OTP 的缺陷图', 'OTP defect map'),
      def: loc(
        '把缺陷图和校准系数写进一次性存储器。写失败进 Bin 6，器件不能当成品出。记录格式的思路见 {@genStdf}。见 {@snsProgram}。',
        'The defect map and the calibration coefficients written into one-time memory. A failed write is bin 6, and the part cannot ship as a finished unit. The record idea is in {@genStdf}. See {@snsProgram}.',
      ),
      lessons: [asId('snsProgram')],
    },
    {
      id: 'sns-cis-grade',
      term: 'CIS grade',
      name: loc('CIS 等级（A/B/C）', 'CIS grade (A/B/C)'),
      def: loc(
        '通过前面各项之后的 Bin 1，再按缺陷数和簇分成 A、B、C。A 要求个数不超过上限并且没有簇。见 {@snsProgram}。',
        'Bin 1, after the earlier tests have passed, split into A, B and C by defect count and clusters. Grade A needs the count at or under the limit and no cluster. See {@snsProgram}.',
      ),
      lessons: [asId('snsProgram')],
    },
    {
      id: 'sns-frame-time',
      term: 'Frame time',
      name: loc('帧时间', 'Frame time'),
      def: loc(
        '拍一帧并读出所需的时间。总时间 = 帧数 × 帧时间 + 光源稳定 + 传输。UPH = 3600 / 总时间。见 {@snsProgram}。',
        'The time to shoot one frame and read it out. Total time = frames x frame time + light settle + transfer. UPH = 3600 / total time. See {@snsProgram}.',
      ),
      lessons: [asId('snsProgram')],
    },
  ],
  extraLessons: {
    stdf: [asId('snsProgram')],
    otp: [asId('snsProgram')],
    trim: [asId('snsProgram')],
    wafer: [asId('snsProgram')],
  },
  faqs: [
    {
      id: 'sns-program-frames',
      q: loc('亮场帧数是不是越多越好？', 'Are more bright frames always better?'),
      a: loc(
        '帧数多，PRNU 的时间项更小，测试时间也线性变长，UPH 下降。预算里要的是够用的 N。帧数降到很少时，prnuMeasured 的时间项变大，Bin 5 的误判会变多。见 {@snsProgram}。',
        'More frames shrink the PRNU temporal term, and the test time grows in proportion, so UPH falls. Inside a budget you want an N that is enough. With very few frames the temporal term in prnuMeasured grows, and more parts are falsely sent to bin 5. See {@snsProgram}.',
      ),
      lessons: [asId('snsProgram')],
    },
    {
      id: 'sns-program-grade',
      q: loc('分级能不能只看缺陷总数？', 'Can grading look only at the total defect count?'),
      a: loc(
        '不能。簇会把缺陷数很少的器件挡在 A 外面。A 要同时满足个数上限和“没有簇”，B 看更宽的个数，其余为 C，三者都在 Bin 1。见 {@snsProgram}。',
        'No. A cluster keeps a part out of grade A even when the count is small. A needs both the count limit and no cluster. B uses a wider count. The rest are C. All three sit in bin 1. See {@snsProgram}.',
      ),
      lessons: [asId('snsProgram')],
    },
    {
      id: 'sns-program-map-not-stat',
      q: loc('缺陷图是不是测试端看一眼的统计海报？', 'Is the defect map just a statistic poster at the tester?'),
      a: loc(
        '不是。缺陷图要写进 OTP，后面的系统靠坐标替换坏点。写不进去是 Bin 6，不是可以忽略的报表。只数缺陷总数、不留下位置，后面就没法修。见 {@snsProgram}。',
        'No. The map is written to OTP so a later system can replace bad pixels by coordinate. A failed write is bin 6, not a report you can ignore. Counting defects without keeping locations leaves nothing to repair later. See {@snsProgram}.',
      ),
      lessons: [asId('snsProgram')],
    },
  ],
}
