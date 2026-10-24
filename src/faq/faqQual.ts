import { loc } from '../i18n/locale'
import { REL_KNOWLEDGE } from '../modules/qual/knowledge'
import type { FaqGroup } from './faq'

/** 可靠性 / 车规的常见问题 */
export const QUAL_FAQ_GROUP: FaqGroup = {
  id: 'qual',
  title: loc('可靠性 / 车规', 'Reliability / automotive'),
  items: REL_KNOWLEDGE.flatMap((k) => k.faqs),
}
