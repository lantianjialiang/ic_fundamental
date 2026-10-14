import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { StepControls, useStepPlayer } from '../../lab/StepPlayer'
import { type ModuleId } from '../catalog'
import { Callout } from '../fund/parts'
import { RefParas, RefP, Related, type PrepNote } from './common'
import { INTRO, QUIZ, ROLES, S, STAGES, SUPPLY, TAKEAWAY, TESTER, type RoleId, type SupplyId } from './data/industry'
import { ChainFig, RoleMatrix } from './IndustryFigs'
import './prep.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function PrepIndustryPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const player = useStepPlayer(STAGES.length, 1800)
  const [supply, setSupply] = useState<SupplyId | null>(null)
  const [role, setRole] = useState<RoleId>(ROLES[0].id)
  const [note, setNote] = useState<PrepNote | null>(null)

  const stage = STAGES[player.step]
  const roleItem = ROLES.find((item) => item.id === role) ?? ROLES[0]
  const shown: PrepNote = note ?? { kicker: S.kickerChain, title: stage.title, text: stage.text }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.pIndustry.title)}
      goal={t(ui.pIndustry.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="pHistory"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.chainTitle)} note={t(S.chainNote)}>
        <ChainFig
          step={player.step}
          supply={supply}
          onStage={(i) => {
            player.goTo(i)
            setSupply(null)
            setNote(null)
          }}
          onSupply={(id) => {
            setSupply(id)
            const item = SUPPLY.find((s) => s.id === id)
            if (item) {
              setNote({ kicker: S.kickerChain, title: item.title, text: item.text })
            }
          }}
        />
        <StepControls
          player={{
            ...player,
            next: () => {
              setNote(null)
              setSupply(null)
              player.next()
            },
            toggle: () => {
              setNote(null)
              setSupply(null)
              player.toggle()
            },
          }}
          stepLabels={STAGES.map((s) => s.title)}
        />
        <Callout tone={stage.test ? 'warn' : undefined}>
          <RefP text={stage.text} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['intro', 'connection', 'fAte']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.rolesTitle)} note={t(S.rolesNote)}>
        <RoleMatrix
          active={role}
          onPick={(id) => {
            setRole(id)
            const item = ROLES.find((r) => r.id === id)
            if (item) {
              setNote({ kicker: S.kickerRole, title: item.full, text: item.text })
            }
          }}
        />
        <Callout>
          <p>
            <b>{t(roleItem.title)}</b> · {t(roleItem.full)}
          </p>
          <p>{t(roleItem.text)}</p>
          <p className="prep-muted">{t(roleItem.examples)}</p>
        </Callout>
      </Section>

      <Section title={t(S.testerTitle)}>
        <RefParas paras={TESTER} onOpen={onModuleChange} />
        <Related ids={['intro', 'fIntro', 'fCreate']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((item) => (
            <p key={item.zh}>{t(item)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.quizTitle)} note={t(S.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>
    </LessonFrame>
  )
}
