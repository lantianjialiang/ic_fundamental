import type { FaqItem } from '../../../faq/faq'
import type { GlossaryTerm } from '../../../glossary/terms'
import type { ModuleId } from '../../catalog'

/**
 * 一课附带的术语表条目和常见问题。
 * 主代理会把所有课的内容汇总进 src/glossary/termsAna.ts 与 src/faq/faqAna.ts。
 */
export type AnaKnowledge = {
  /** 本课新出现的术语（主词条）；id 全站唯一 */
  terms: GlossaryTerm[]
  /** 已在别处定义的术语，在本课也讲到：只追加课程引用，不重复写词条 */
  extraLessons: Record<string, ModuleId[]>
  /** 本课的常见问题，id 以 ana- 开头 */
  faqs: FaqItem[]
}
