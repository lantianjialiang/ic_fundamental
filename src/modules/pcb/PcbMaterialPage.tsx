import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { Callout } from '../fund/parts'
import { RefParas, type PrepNote } from '../prep/common'
import { INTRO, S, TAKEAWAY } from './data/pcbMaterial'
import { STACK_KINDS, STACK_OPTS } from './data/pcbMaterialLayers'
import { QUIZ } from './data/pcbMaterialQuiz'
import { PCB_META } from './meta'
import { CopperPanel, Fr4Panel, StackPanel, TgPanel, stackNote } from './MaterialSections'
import { ChoosePanel, FinishPanel, LaminatePanel, MaskPanel, SpecialPanel } from './MaterialSections2'
import '../prep/prep.css'
import './pcbMaterial.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const FIRST_STACK = STACK_OPTS[0].id

export function PcbMaterialPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [note, setNote] = useState<PrepNote | null>(null)
  const shown = note ?? stackNote(FIRST_STACK, STACK_KINDS[FIRST_STACK][0])
  const panel = { onNote: setNote, onOpen: onModuleChange }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PCB_META.pcbMaterial.title)}
      goal={t(PCB_META.pcbMaterial.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="pcbStack"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.stackTitle)} note={t(S.stackNote)}>
        <StackPanel {...panel} />
      </Section>

      <Section title={t(S.fr4Title)} note={t(S.fr4Note)}>
        <Fr4Panel {...panel} />
      </Section>

      <Section title={t(S.tgTitle)} note={t(S.tgNote)}>
        <TgPanel {...panel} />
      </Section>

      <Section title={t(S.copperTitle)} note={t(S.copperNote)}>
        <CopperPanel {...panel} />
      </Section>

      <Section title={t(S.lamTitle)} note={t(S.lamNote)}>
        <LaminatePanel {...panel} />
      </Section>

      <Section title={t(S.maskTitle)} note={t(S.maskNote)}>
        <MaskPanel {...panel} />
      </Section>

      <Section title={t(S.finishTitle)} note={t(S.finishNote)}>
        <FinishPanel {...panel} />
      </Section>

      <Section title={t(S.specialTitle)} note={t(S.specialNote)}>
        <SpecialPanel {...panel} />
      </Section>

      <Section title={t(S.chooseTitle)}>
        <ChoosePanel {...panel} />
      </Section>

      <Section title={t(S.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((item) => (
            <p key={item.en}>{t(item)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.quizTitle)} note={t(S.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>
    </LessonFrame>
  )
}
