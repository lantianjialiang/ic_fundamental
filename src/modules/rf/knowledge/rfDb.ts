import { loc } from '../../../i18n/locale'
import type { AnaKnowledge } from '../../ana/knowledge/types'

/** RF-02 dB / dBm / dBc：对数单位、绝对功率与相对功率 */
export const RF_DB_KNOWLEDGE: AnaKnowledge = {
  terms: [
    {
      id: 'decibel',
      term: 'dB',
      name: loc('分贝（dB）', 'Decibel (dB)'),
      def: loc(
        '两个功率之比的对数：dB = 10·log10(P₂ / P₁)。它只是比值，没有绝对大小：+3 dB ≈ 2 倍功率，−10 dB = 1/10。增益与损耗都用 dB 写，直接相加。见 {@rfDb}。',
        'The logarithm of a power ratio: dB = 10·log10(P₂ / P₁). It is a ratio with no absolute size: +3 dB ≈ 2× power, −10 dB = 1/10. Gains and losses are written in dB and simply added. See {@rfDb}.',
      ),
      lessons: ['rfDb'],
    },
    {
      id: 'dbm',
      term: 'dBm',
      name: loc('分贝毫瓦（dBm）', 'Decibel-milliwatt (dBm)'),
      def: loc(
        '以 1 mW 为基准的绝对功率：dBm = 10·log10(P / 1 mW)。0 dBm = 1 mW，30 dBm = 1 W，−30 dBm = 1 µW。见 {@rfDb}。',
        'Absolute power referenced to 1 mW: dBm = 10·log10(P / 1 mW). 0 dBm = 1 mW, 30 dBm = 1 W, −30 dBm = 1 µW. See {@rfDb}.',
      ),
      lessons: ['rfDb'],
    },
    {
      id: 'dbc',
      term: 'dBc',
      name: loc('相对载波的分贝（dBc）', 'Decibel relative to carrier (dBc)'),
      def: loc(
        '以载波功率为基准的相对值：dBc = 10·log10(P_spur / P_carrier)，通常为负。杂散的绝对功率 = 载波 dBm + dBc。见 {@rfDb}。',
        'A level relative to the carrier power: dBc = 10·log10(P_spur / P_carrier), usually negative. Absolute spur power = carrier dBm + dBc. See {@rfDb}.',
      ),
      lessons: ['rfDb'],
    },
  ],
  extraLessons: {},
  faqs: [
    {
      id: 'rf-db-vs-dbm',
      q: loc('dB 和 dBm 有什么区别？', 'What is the difference between dB and dBm?'),
      a: loc(
        'dB 是两个功率的比值，没有绝对大小；dBm 是相对 1 mW 的绝对功率。说“增益 10 dB”是比值，说“输出 10 dBm”是 10 mW 的绝对功率。见 {@rfDb}。',
        'dB is a ratio of two powers and has no absolute size; dBm is an absolute power referenced to 1 mW. "10 dB gain" is a ratio, while "10 dBm output" is an absolute 10 mW. See {@rfDb}.',
      ),
      lessons: ['rfDb'],
    },
    {
      id: 'rf-db-add-not-power',
      q: loc('dB 可以直接相加，那 mW 能直接用 dB 的加法吗？', 'dB values add. Can mW values be added the same way?'),
      a: loc(
        '不能。dB 相加对应功率相乘：+3 dB 再 +3 dB 是 +6 dB，即 2 × 2 = 4 倍，不是 6 倍。级联的增益用 dB 相加最方便；把 mW 当成 dB 去加，结果会差很多。见 {@rfDb}。',
        'No. Adding dB corresponds to multiplying powers: +3 dB plus +3 dB is +6 dB, i.e. 2 × 2 = 4 times, not 6 times. Cascaded gains are easiest to add in dB; treating mW as if it were dB gives a very wrong answer. See {@rfDb}.',
      ),
      lessons: ['rfDb'],
    },
    {
      id: 'rf-dbc-how',
      q: loc('杂散的 dBc 怎么换算成绝对功率？', 'How do I convert a spur in dBc to absolute power?'),
      a: loc(
        '绝对 dBm = 载波 dBm + dBc。例如载波 0 dBm，杂散 −40 dBc，杂散就是 −40 dBm，即 100 nW（0.1 µW）。见 {@rfDb}。',
        'Absolute dBm = carrier dBm + dBc. For example, with a 0 dBm carrier and a spur at −40 dBc, the spur is −40 dBm, i.e. 100 nW (0.1 µW). See {@rfDb}.',
      ),
      lessons: ['rfDb'],
    },
  ],
}
