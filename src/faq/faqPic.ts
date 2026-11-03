import { loc } from '../i18n/locale'
import { PIC_KNOWLEDGE } from '../modules/pic/knowledge'
import type { FaqGroup } from './faq'

/** 硅光 / 共封装光学的常见问题 */
export const PIC_FAQ_GROUP: FaqGroup = {
  id: 'cpo',
  title: loc('硅光 / 共封装光学', 'Silicon photonics / CPO'),
  items: PIC_KNOWLEDGE.flatMap((k) => k.faqs),
}
