import { RF_KNOWLEDGE } from '../modules/rf/knowledge'
import type { ModuleId } from '../modules/catalog'
import type { GlossaryTerm } from './terms'

/** 射频测试课程（RF）的主词条，来自各课的 knowledge 文件 */
export const RF_TERMS: GlossaryTerm[] = RF_KNOWLEDGE.flatMap((k) => k.terms)

/** 射频测试课程对已有词条的课程补充 */
export const RF_EXTRA_LESSONS: Array<Record<string, ModuleId[]>> = RF_KNOWLEDGE.map((k) => k.extraLessons)
