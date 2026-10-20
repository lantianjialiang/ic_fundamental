import { ANA_KNOWLEDGE } from '../modules/ana/knowledge'
import type { ModuleId } from '../modules/catalog'
import type { GlossaryTerm } from './terms'

/** 模拟课程（ANA-01 … ANA-15）的主词条，来自各课的 knowledge 文件 */
export const ANA_TERMS: GlossaryTerm[] = ANA_KNOWLEDGE.flatMap((knowledge) => knowledge.terms)

/** 模拟课程对已有词条的课程补充（每项是一张 词条 id → 课程 表，由 terms.ts 合并） */
export const ANA_EXTRA_LESSONS: Array<Record<string, ModuleId[]>> = ANA_KNOWLEDGE.map((knowledge) => knowledge.extraLessons)
