import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import { MEM_META } from './meta'
import { StructureFig } from './StructureFig'
import './memStructure.css'
import { INTRO, MAP_OPTIONS, MISCONCEPTIONS, QUIZ, S, TAKEAWAY, taskItems, verdictOf } from './structureData'
import { DEFAULT_STRUCTURE, SIZE, analyseStructure, type StructureState } from './structureModel'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function MemStructurePage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<StructureState>(DEFAULT_STRUCTURE)
  const analysis = useMemo(() => analyseStructure(state), [state])
  const verdict = verdictOf(state, analysis)
  const update = (patch: Partial<StructureState>) => setState((prev) => ({ ...prev, ...patch }))

  let nextText = t(S.none)
  if (analysis.next !== null && analysis.dist === null) {
    nextText = t(S.crossBank)
  } else if (analysis.dist !== null) {
    nextText = `${analysis.dist}`
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MEM_META.memStructure.title)}
      goal={t(MEM_META.memStructure.goal)}
      kicker={t(S.kicker)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="memRw"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state, analysis)} onReset={() => setState(DEFAULT_STRUCTURE)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['vector', 'memRw', 'memFault']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="mst-controls">
          <Knob label={S.addrLabel} value={state.addr} unit="" min={0} max={SIZE - 1} step={1} onChange={(addr) => update({ addr })} />
          <div className="mst-field">
            <span className="mst-field__label">{t(S.mapLabel)}</span>
            <Seg options={MAP_OPTIONS} value={state.mapping} onChange={(mapping) => update({ mapping })} />
          </div>
        </div>
        <p className="mst-note">{t(S.mapNote)}</p>

        <div className="mst-grid">
          <StructureFig analysis={analysis} mapping={state.mapping} addr={state.addr} />
          <div className="mst-cell">
            <Readout
              items={[
                { label: S.rBank, value: `${analysis.cell.bank}` },
                { label: S.rRow, value: `${analysis.cell.row}` },
                { label: S.rCol, value: `${analysis.cell.col}` },
                { label: S.rIndex, value: `${analysis.index}` },
                { label: S.rNext, value: nextText },
              ]}
            />
          </div>
        </div>
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
