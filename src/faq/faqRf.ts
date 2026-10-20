import { loc } from '../i18n/locale'
import { RF_KNOWLEDGE } from '../modules/rf/knowledge'
import type { FaqGroup } from './faq'

/** 射频测试的常见问题 */
export const RF_FAQ_GROUP: FaqGroup = {
  id: 'rf',
  title: loc('射频测试', 'RF test'),
  items: RF_KNOWLEDGE.flatMap((k) => k.faqs),
}
