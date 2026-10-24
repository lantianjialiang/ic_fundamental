import { PWR_KNOWLEDGE } from '../modules/power/knowledge'
import type { ModuleId } from '../modules/catalog'
import type { GlossaryTerm } from './terms'

/** 功率器件轨道（PWR 系列）的主词条，来自各课的 knowledge 文件 */
export const PWR_TERMS: GlossaryTerm[] = PWR_KNOWLEDGE.flatMap((k) => k.terms)

/** 功率器件轨道对已有词条的课程补充 */
export const PWR_EXTRA_LESSONS: Array<Record<string, ModuleId[]>> = PWR_KNOWLEDGE.map((k) => k.extraLessons)
