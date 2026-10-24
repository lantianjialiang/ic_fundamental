import { loc } from '../i18n/locale'
import { PWR_KNOWLEDGE } from '../modules/power/knowledge'
import type { FaqGroup } from './faq'

/** 功率器件测试的常见问题 */
export const PWR_FAQ_GROUP: FaqGroup = {
  id: 'power',
  title: loc('功率器件测试', 'Power device test'),
  items: PWR_KNOWLEDGE.flatMap((k) => k.faqs),
}
