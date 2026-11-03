import { PIC_KNOWLEDGE } from '../modules/pic/knowledge'
import type { ModuleId } from '../modules/catalog'
import type { GlossaryTerm } from './terms'

/** 硅光 / 共封装光学轨道的主词条 */
export const PIC_TERMS: GlossaryTerm[] = PIC_KNOWLEDGE.flatMap((k) => k.terms)

/** 硅光轨道对已有词条的课程补充 */
export const PIC_EXTRA_LESSONS: Array<Record<string, ModuleId[]>> = PIC_KNOWLEDGE.map((k) => k.extraLessons)
