import { MODULE_IDS, type ModuleId } from './modules/catalog'
import { TRACKS, type TrackId, trackOfLesson } from './tracks/catalog'

export type Screen =
  | { kind: 'home' }
  | { kind: 'track'; track: TrackId }
  | { kind: 'lesson'; track: TrackId; moduleId: ModuleId }

const isTrack = (value: string): value is TrackId => TRACKS.some((item) => item.id === value)
const isModule = (value: string): value is ModuleId => (MODULE_IDS as readonly string[]).includes(value)

/** 地址格式：#/ 首页，#/轨道ID 轨道页，#/轨道ID/课程ID 单课 */
export function parseHash(hash: string): Screen {
  const [trackPart, lessonPart] = hash.replace(/^#\/?/, '').split('/')
  if (!trackPart || !isTrack(trackPart)) return { kind: 'home' }
  if (!lessonPart) return { kind: 'track', track: trackPart }
  if (!isModule(lessonPart)) return { kind: 'track', track: trackPart }
  return { kind: 'lesson', track: trackOfLesson(lessonPart, trackPart), moduleId: lessonPart }
}

export function screenHash(screen: Screen): string {
  if (screen.kind === 'home') return '#/'
  if (screen.kind === 'track') return `#/${screen.track}`
  return `#/${screen.track}/${screen.moduleId}`
}
