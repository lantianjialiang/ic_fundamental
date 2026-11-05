import { loc } from '../i18n/locale'
import { APK_KNOWLEDGE } from '../modules/apk/knowledge'
import type { FaqGroup } from './faq'

export const APK_FAQ_GROUP: FaqGroup = {
  id: 'apk',
  title: loc('先进封装', 'Advanced packaging'),
  items: APK_KNOWLEDGE.flatMap((k) => k.faqs),
}
