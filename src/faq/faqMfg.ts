import { loc } from '../i18n/locale'
import { MFG_KNOWLEDGE } from '../modules/mfg/knowledge'
import type { FaqGroup } from './faq'

export const MFG_FAQ_GROUP: FaqGroup = {
  id: 'mfg',
  title: loc('制造与封装流程', 'Manufacturing and package flow'),
  items: MFG_KNOWLEDGE.flatMap((k) => k.faqs),
}
