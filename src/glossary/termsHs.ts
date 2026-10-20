import { HS_KNOWLEDGE } from '../modules/hs/knowledge'
import type { ModuleId } from '../modules/catalog'
import type { GlossaryTerm } from './terms'

/** 高速接口课程（HS）的主词条，来自各课的 knowledge 文件 */
export const HS_TERMS: GlossaryTerm[] = HS_KNOWLEDGE.flatMap((k) => k.terms)

/** 高速接口课程对已有词条的课程补充 */
export const HS_EXTRA_LESSONS: Array<Record<string, ModuleId[]>> = HS_KNOWLEDGE.map((k) => k.extraLessons)
