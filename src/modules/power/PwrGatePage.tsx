import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import '../hs/hs.css'
import { PWR_META } from './meta'
import { gateVerdict, INTRO, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, taskItems } from './pwrGateData'
import { PwrGateLab } from './PwrGateLab'
import { analyseGate, DEFAULT_GATE, type GateState } from './pwrGateModel'
import './pwrGate.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function PwrGatePage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [gate, setGate] = useState<GateState>(DEFAULT_GATE)
  const [guess, setGuess] = useState<string>('')
  const a = useMemo(() => analyseGate(gate), [gate])
  const verdict = gateVerdict(gate, a)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PWR_META.pwrGate.title)}
      goal={t(PWR_META.pwrGate.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="pwrDpt"
      nextLabel={t(S.next)}
      extra={
        <TaskList
          items={taskItems(gate, a, guess)}
          onReset={() => {
            setGate(DEFAULT_GATE)
            setGuess('')
          }}
        />
      }
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['pwrSelector', 'pwrStatic', 'pwrKelvin', 'anaDynamic']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <PwrGateLab
          gate={gate}
          onGate={(patch) => setGate((prev) => ({ ...prev, ...patch }))}
          guess={guess}
          onGuess={setGuess}
        />
      </Section>

      <Section title={t(S.misTitle)}>
        <Callout tone="warn">
          {MISCONCEPTIONS.map((item, index) => (
            <p key={index}>{`${index + 1}. ${t(item)}`}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.takeawayTitle)}>
        <Callout tone="ok">
          <p>{t(TAKEAWAY)}</p>
        </Callout>
      </Section>

      <Section title={t(S.quizTitle)} note={t(S.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>
    </LessonFrame>
  )
}
