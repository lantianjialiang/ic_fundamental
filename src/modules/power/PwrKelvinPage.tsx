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
import { contactVerdict, hvVerdict, INTRO, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, taskItems } from './pwrKelvinData'
import { LAB_TAB_IDS, PwrKelvinLab, type LabTab } from './PwrKelvinLab'
import { analyseContact, analyseHv, DEFAULT_CONTACT, DEFAULT_HV, type ContactState, type HvState } from './pwrKelvinModel'
import './pwrKelvin.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function PwrKelvinPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [tab, setTab] = useState<LabTab>(LAB_TAB_IDS[0])
  const [contact, setContact] = useState<ContactState>(DEFAULT_CONTACT)
  const [hv, setHv] = useState<HvState>(DEFAULT_HV)
  const ca = useMemo(() => analyseContact(contact), [contact])
  const ha = useMemo(() => analyseHv(hv), [hv])
  const verdict = tab === 'contact' ? contactVerdict(contact, ca) : hvVerdict(hv, ha)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PWR_META.pwrKelvin.title)}
      goal={t(PWR_META.pwrKelvin.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="pwrGate"
      nextLabel={t(S.next)}
      extra={
        <TaskList
          items={taskItems(contact, ca, hv, ha)}
          onReset={() => {
            setContact(DEFAULT_CONTACT)
            setHv(DEFAULT_HV)
          }}
        />
      }
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['pwrStatic', 'anaMeasure', 'anaLeak', 'anaSmu']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <PwrKelvinLab
          tab={tab}
          onTab={setTab}
          contact={contact}
          onContact={(patch) => setContact((prev) => ({ ...prev, ...patch }))}
          hv={hv}
          onHv={(patch) => setHv((prev) => ({ ...prev, ...patch }))}
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
