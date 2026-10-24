import { loc } from '../../i18n/locale'
import { type LessonMeta } from '../lessonMeta'

/** 数字轨道 latch 之后新增的两课（D15、D16），课序即它们在 digital 轨道 lessons 里的顺序 */
export const GEN_META: Record<'genStdf' | 'genMultisite', LessonMeta> = {
  genStdf: {
    title: loc('STDF 与 Datalog', 'STDF and Datalog'),
    goal: loc(
      '说清 Datalog 与 STDF 的关系；读懂记录头与字节序；区分 Part 级与 Test 级数据、Hard Bin 与 Soft Bin；用解析器读本地 .stdf 并算出 Pass / Fail、Bin 与 Cpk。',
      'Explain how a datalog relates to STDF; read the record header and byte order; tell part-level from test-level data and hard bins from soft bins; parse a local .stdf and compute Pass / Fail, bins and Cpk.',
    ),
  },
  genMultisite: {
    title: loc('Multi-site 与测试成本', 'Multi-site and Test Cost'),
    goal: loc(
      '用 T_td = T_idx + T_par + N·T_ser 解释 Site 数与 UPH、并行效率、COT 的关系；找出使 COT 最低的 Site 数；用 STDF 的 SITE_NUM 分组发现异常 Site。',
      'Use T_td = T_idx + T_par + N·T_ser to explain how the site count drives UPH, parallel efficiency and COT; find the site count with the lowest COT; use SITE_NUM grouping in STDF to find an abnormal site.',
    ),
  },
}
