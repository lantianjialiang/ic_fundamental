import { loc } from '../i18n/locale'
import { MEM_KNOWLEDGE } from '../modules/mem/knowledge'
import type { FaqGroup } from './faq'

/** 存储器测试的常见问题 */
export const MEM_FAQ_GROUP: FaqGroup = {
  id: 'mem',
  title: loc('存储器测试', 'Memory test'),
  items: MEM_KNOWLEDGE.flatMap((k) => k.faqs),
}
