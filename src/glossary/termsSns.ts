import { SNS_KNOWLEDGE } from '../modules/sns/knowledge'
import type { ModuleId } from '../modules/catalog'
import type { GlossaryTerm } from './terms'

/** 传感器 / CIS 轨道的主词条 */
export const SNS_TERMS: GlossaryTerm[] = SNS_KNOWLEDGE.flatMap((k) => k.terms)

/** 传感器 / CIS 轨道对已有词条的课程补充 */
export const SNS_EXTRA_LESSONS: Array<Record<string, ModuleId[]>> = SNS_KNOWLEDGE.map((k) => k.extraLessons)
