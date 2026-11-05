import { APK_KNOWLEDGE } from '../modules/apk/knowledge'
import type { ModuleId } from '../modules/catalog'
import type { GlossaryTerm } from './terms'

export const APK_TERMS: GlossaryTerm[] = APK_KNOWLEDGE.flatMap((k) => k.terms)
export const APK_EXTRA_LESSONS: Array<Record<string, ModuleId[]>> = APK_KNOWLEDGE.map((k) => k.extraLessons)
