import { MODULE_IDS, type ModuleId } from './modules/catalog'
import { TRACKS, type TrackId, trackOfLesson } from './tracks/catalog'

export type Screen =
  | { kind: 'home' }
  | { kind: 'track'; track: TrackId }
  | { kind: 'lesson'; track: TrackId; moduleId: ModuleId }
  | { kind: 'glossary'; termId?: string }
  | { kind: 'faq'; faqId?: string }

const isTrack = (value: string): value is TrackId => TRACKS.some((item) => item.id === value)
const isModule = (value: string): value is ModuleId => (MODULE_IDS as readonly string[]).includes(value)

/** 术语 / FAQ 条目 ID 只允许小写字母、数字和连字符；是否真的存在由页面再查一次 */
const isEntryId = (value: string | undefined): value is string => !!value && /^[a-z0-9][a-z0-9-]{0,63}$/.test(value)

/**
 * 地址格式：#/ 首页，#/轨道ID 轨道页，#/轨道ID/课程ID 单课；
 * #/glossary、#/glossary/术语ID 术语表；#/faq、#/faq/问题ID 常见问题
 */
export function parseHash(hash: string): Screen {
  const [trackPart, lessonPart] = hash.replace(/^#\/?/, '').split('/')
  if (trackPart === 'glossary') return isEntryId(lessonPart) ? { kind: 'glossary', termId: lessonPart } : { kind: 'glossary' }
  if (trackPart === 'faq') return isEntryId(lessonPart) ? { kind: 'faq', faqId: lessonPart } : { kind: 'faq' }
  if (!trackPart || !isTrack(trackPart)) return { kind: 'home' }
  if (!lessonPart) return { kind: 'track', track: trackPart }
  if (!isModule(lessonPart)) return { kind: 'track', track: trackPart }
  return { kind: 'lesson', track: trackOfLesson(lessonPart, trackPart), moduleId: lessonPart }
}

export function screenHash(screen: Screen): string {
  if (screen.kind === 'home') return '#/'
  if (screen.kind === 'glossary') return screen.termId ? `#/glossary/${screen.termId}` : '#/glossary'
  if (screen.kind === 'faq') return screen.faqId ? `#/faq/${screen.faqId}` : '#/faq'
  if (screen.kind === 'track') return `#/${screen.track}`
  return `#/${screen.track}/${screen.moduleId}`
}
