import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** PWR-08 综合测试程序：新术语、已有词条的课程补充、常见问题 */
export const PWR_PROGRAM_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'uis-sampling',
      term: 'UIS sampling',
      name: loc('UIS 抽样', 'UIS sampling'),
      def: loc(
        'UIS（非钳位感性开关）是雪崩应力测试，耗时长，而且会给被测器件施加应力。量产中常只抽取一部分 DUT 做 UIS；抽样率越高，潜在缺陷的漏检越少，但时间越长、成本越高。抽样率要由时间预算与漏检目标共同决定。见 {@pwrProgram}。',
        'UIS (unclamped inductive switching) is an avalanche-stress test. It is slow and stresses the device under test. In production only part of the DUTs are often sampled for UIS; a higher sampling rate cuts escapes of latent defects but adds time and cost. The rate should be set by both the time budget and the escape target. See {@pwrProgram}.',
      ),
      lessons: ['pwrProgram'],
    },
  ],
  extraLessons: {
    'part-average-testing': ['pwrProgram'],
    kelvin: ['pwrProgram'],
    'pulse-width': ['pwrProgram'],
    'test-program': ['pwrProgram'],
    'hard-bin': ['pwrProgram'],
    bin: ['pwrProgram'],
    yield: ['pwrProgram'],
    site: ['pwrProgram'],
    multisite: ['pwrProgram'],
    touchdown: ['pwrProgram'],
    uph: ['pwrProgram'],
    cot: ['pwrProgram'],
    stdf: ['pwrProgram'],
    'stop-on-fail': ['pwrProgram'],
    escape: ['pwrProgram'],
    overkill: ['pwrProgram'],
    cpk: ['pwrProgram'],
  },
  faqs: [
    {
      id: 'pwr-program-kelvin-first',
      q: loc('为什么接触检查要排在器件参数之前？', 'Why put the contact check before the device parameters?'),
      a: loc(
        'Kelvin 检查测的是接触电阻。接触不良时，Rds(on) 等参数会偏高，但原因在接触，不在器件。把 Kelvin 放在前面，接触不良的 DUT 会在 Bin 2 停下，不会以器件失效的形式进入统计。放在后面，它会被误记成 Bin 5。见 {@pwrProgram}。',
        'The Kelvin check measures contact resistance. With a bad contact, parameters such as Rds(on) read high, but the cause is the contact, not the device. With Kelvin first, a contact-fault DUT stops at bin 2 and does not enter the statistics as a device failure; placed later, it is recorded as bin 5. See {@pwrProgram}.',
      ),
      lessons: ['pwrProgram'],
    },
    {
      id: 'pwr-program-uis-sampling',
      q: loc('UIS 为什么不全测？', 'Why not run UIS on every part?'),
      a: loc(
        'UIS 是雪崩应力，单颗耗时最长，而且会给 DUT 施加应力。全测会超出时间预算，UPH 下降、COT 上升。常见做法是在预算内抽样，并用 PAT 等统计方法补足静态测试对边缘缺陷的覆盖。抽样率的取舍见 {@pwrUis} 与 {@pwrProgram}。',
        'UIS is an avalanche stress: it is the slowest item and it stresses the DUT. Full testing breaks the time budget, lowers UPH and raises COT. The usual practice is to sample within the budget and use statistical methods such as PAT to cover marginal defects that static tests miss. For the trade-off see {@pwrUis} and {@pwrProgram}.',
      ),
      lessons: ['pwrProgram'],
    },
    {
      id: 'pwr-program-pat-overkill',
      q: loc('PAT 会不会误杀好的器件？', 'Can PAT cause overkill on good parts?'),
      a: loc(
        '会。k 取得越小，限值越窄，越容易把正常但偏离中心的好器件判为失效（误杀）；k 取得越大，边缘缺陷越容易漏过（漏检）。k 的选择要同时看误杀与漏检，并以各公司规程为准。见 {@pwrProgram}。',
        'It can. The smaller k is, the narrower the limits, so normal but off-centre good parts are more likely to fail (overkill); the larger k is, the more marginal defects slip through (escapes). Choose k by weighing overkill against escapes, and follow each company’s procedure. See {@pwrProgram}.',
      ),
      lessons: ['pwrProgram'],
    },
    {
      id: 'pwr-program-stdf-check',
      q: loc('导出 STDF 之后要检查什么？', 'What should be checked after exporting STDF?'),
      a: loc(
        '至少两件事：一是用解析器读回，Bin 计数与仿真或产线记录一致；二是检查记录顺序（FAR、MIR、PIR、PTR、PRR、PCR、HBR、MRR 等）是否合法。能编码成字节不代表格式正确。见 {@genStdf} 与 {@pwrProgram}。',
        'At least two things: first, read it back with the parser and check that bin counts match the simulation or the line records; second, check that the record order (FAR, MIR, PIR, PTR, PRR, PCR, HBR, MRR and so on) is valid. Successful encoding does not prove the format is right. See {@genStdf} and {@pwrProgram}.',
      ),
      lessons: ['pwrProgram'],
    },
    {
      id: 'pwr-program-pulse-not-longer',
      q: loc('脉宽是不是越长，Rds(on) 测得越准？', 'Does a longer pulse make Rds(on) more accurate?'),
      a: loc(
        '不是。脉宽太长，自热让结温升高，Rds(on) 跟着漂，读数偏大。太短则采样还没稳定。量产要把脉宽停在自热还小、读数已经稳的那一段，不是越长越好。见 {@pwrStatic}、{@pwrProgram}。',
        'No. A long pulse lets self-heating raise the junction temperature, so Rds(on) drifts high. A pulse that is too short has not settled. Production parks the width where heating is still small and the reading is already stable — not as long as possible. See {@pwrStatic} and {@pwrProgram}.',
      ),
      lessons: ['pwrProgram', 'pwrStatic'],
    },
  ],
}
