import { MFG_KNOWLEDGE } from '../modules/mfg/knowledge'
import type { ModuleId } from '../modules/catalog'
import type { GlossaryTerm } from './terms'

export const MFG_TERMS: GlossaryTerm[] = MFG_KNOWLEDGE.flatMap((k) => k.terms)
export const MFG_EXTRA_LESSONS: Array<Record<string, ModuleId[]>> = MFG_KNOWLEDGE.map((k) => k.extraLessons)
