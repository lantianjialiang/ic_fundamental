import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { Section } from '../../lab/LessonFrame'
import { Callout } from '../fund/parts'

type Props = { title: LText; note: LText; items: LText[] }

/** 课程最后的“预设知识”一节：正文里的数字与公式都从这里推出 */
export function PrereqSection({ title, note, items }: Props) {
  const { t } = useLocale()
  return (
    <Section title={t(title)} note={t(note)}>
      <Callout>
        {items.map((item, index) => (
          <p key={index}>{`${index + 1}. ${t(item)}`}</p>
        ))}
      </Callout>
    </Section>
  )
}
