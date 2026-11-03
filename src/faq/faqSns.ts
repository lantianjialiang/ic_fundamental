import { loc } from '../i18n/locale'
import { SNS_KNOWLEDGE } from '../modules/sns/knowledge'
import type { FaqGroup } from './faq'

/** 传感器 / CIS 的常见问题 */
export const SNS_FAQ_GROUP: FaqGroup = {
  id: 'sensor',
  title: loc('传感器 / CIS', 'Sensors / CIS'),
  items: SNS_KNOWLEDGE.flatMap((k) => k.faqs),
}
