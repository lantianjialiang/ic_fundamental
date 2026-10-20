import { loc } from '../i18n/locale'
import { ANA_KNOWLEDGE } from '../modules/ana/knowledge'
import type { FaqGroup } from './faq'

/** 模拟 / 混合信号测试的常见问题，来自各课的 knowledge 文件 */
export const ANA_FAQ_GROUP: FaqGroup = {
  id: 'ana',
  title: loc('模拟与混合信号测试', 'Analog and mixed-signal test'),
  items: ANA_KNOWLEDGE.flatMap((knowledge) => knowledge.faqs),
}
