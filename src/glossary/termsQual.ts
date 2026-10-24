import { REL_KNOWLEDGE } from '../modules/qual/knowledge'
import type { ModuleId } from '../modules/catalog'
import type { GlossaryTerm } from './terms'

/** 可靠性 / 车规轨道（REL 系列）的主词条，来自各课的 knowledge 文件 */
export const QUAL_TERMS: GlossaryTerm[] = REL_KNOWLEDGE.flatMap((k) => k.terms)

/** 可靠性 / 车规轨道对已有词条的课程补充 */
export const QUAL_EXTRA_LESSONS: Array<Record<string, ModuleId[]>> = REL_KNOWLEDGE.map((k) => k.extraLessons)
