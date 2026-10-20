import { MEM_KNOWLEDGE } from '../modules/mem/knowledge'
import type { ModuleId } from '../modules/catalog'
import type { GlossaryTerm } from './terms'

/** 存储器测试课程（MEM）的主词条，来自各课的 knowledge 文件 */
export const MEM_TERMS: GlossaryTerm[] = MEM_KNOWLEDGE.flatMap((k) => k.terms)

/** 存储器测试课程对已有词条的课程补充 */
export const MEM_EXTRA_LESSONS: Array<Record<string, ModuleId[]>> = MEM_KNOWLEDGE.map((k) => k.extraLessons)
