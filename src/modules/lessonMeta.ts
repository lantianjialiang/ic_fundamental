import { type LText } from '../i18n/locale'

/** 一课的标题与学习目标。未开放的课也要显示目标，所以和正文分开放 */
export type LessonMeta = { title: LText; goal: LText }
