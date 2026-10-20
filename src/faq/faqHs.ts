import { loc } from '../i18n/locale'
import { HS_KNOWLEDGE } from '../modules/hs/knowledge'
import type { FaqGroup } from './faq'

/** 高速信号测试的常见问题 */
export const HS_FAQ_GROUP: FaqGroup = {
  id: 'hs',
  title: loc('高速信号测试', 'High-speed signal test'),
  items: HS_KNOWLEDGE.flatMap((k) => k.faqs),
}
