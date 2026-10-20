import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import { ANA_META } from './meta'
import { LimitFig } from './OverviewFig'
import {
  INTRO,
  MISCONCEPTIONS,
  QUIZ,
  S,
  SPEC_TEXT,
  TAKEAWAY,
  coverageVerdict,
  joinText,
  taskItems,
  vrefNote,
} from './overviewData'
import {
  SPEC_ITEMS,
  VREF,
  VREF_AXIS_HI,
  VREF_AXIS_LO,
  VREF_DEFAULT,
  VREF_TYP,
  coverage,
  fmtLimit,
  gapMv,
  inLimits,
  type SpecId,
  type SpecItem,
} from './overviewModel'
import './ana.css'
import './overview.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

/** 初始一项都不勾：checkbox 没有预选，由学生自己判断 */
const DEFAULT_SELECTED: SpecId[] = []

export function AnaOverviewPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [selected, setSelected] = useState<SpecId[]>(DEFAULT_SELECTED)
  const [vref, setVref] = useState<number>(VREF_DEFAULT)
  const cov = coverage(selected)
  const verdict = coverageVerdict(cov)
  const vrefOk = inLimits(vref, VREF)

  const toggle = (id: SpecId) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }
  const reset = () => {
    setSelected(DEFAULT_SELECTED)
    setVref(VREF_DEFAULT)
  }
  const namesOf = (items: SpecItem[]) => t(joinText(items.map((item) => SPEC_TEXT[item.id].name), S.sep))

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ANA_META.anaOverview.title)}
      goal={t(ANA_META.anaOverview.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="anaResources"
      nextLabel={`${t(S.nextPrefix)}${t(ANA_META.anaResources.title)}`}
      extra={<TaskList items={taskItems(selected, vref)} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['pDigital', 'ate', 'spec', 'anaMeasure']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="ov-table-wrap">
          <table className="ov-spec">
            <thead>
              <tr>
                <th className="ov-spec__check">{t(S.colPick)}</th>
                <th>{t(S.colName)}</th>
                <th>{t(S.colSym)}</th>
                <th>min</th>
                <th>typ</th>
                <th>max</th>
                <th>{t(S.colUnit)}</th>
                <th>{t(S.colCond)}</th>
              </tr>
            </thead>
            <tbody>
              {SPEC_ITEMS.map((item) => {
                const picked = selected.includes(item.id)
                const text = SPEC_TEXT[item.id]
                return (
                  <tr key={item.id} className={picked ? 'is-picked' : undefined}>
                    <td className="ov-spec__check">
                      <input type="checkbox" checked={picked} onChange={() => toggle(item.id)} aria-label={t(text.name)} />
                    </td>
                    <td>{t(text.name)}</td>
                    <td className="ov-spec__sym">{item.symbol}</td>
                    <td>{fmtLimit(item.min, item.digits)}</td>
                    <td>{fmtLimit(item.typ, item.digits)}</td>
                    <td>{fmtLimit(item.max, item.digits)}</td>
                    <td>{item.unit}</td>
                    <td className="ov-spec__cond">{t(text.cond)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div className="ana-cell">
          <Readout
            items={[
              {
                label: S.rMissing,
                value: cov.missing.length === 0 ? t(S.none) : `${cov.missing.length} · ${namesOf(cov.missing)}`,
                state: cov.missing.length === 0 ? 'pass' : 'fail',
              },
              {
                label: S.rExtra,
                value: cov.extra.length === 0 ? t(S.none) : `${cov.extra.length} · ${namesOf(cov.extra)}`,
                state: cov.extra.length === 0 ? 'pass' : 'fail',
              },
            ]}
          />
        </div>

        <div className="ana-grid">
          <LimitFig value={vref} />
          <div className="ana-cell">
            <Knob
              label={S.measured}
              value={vref}
              unit="V"
              min={VREF_AXIS_LO}
              max={VREF_AXIS_HI}
              step={0.001}
              onChange={setVref}
            />
            <Readout
              items={[
                { label: S.rInLimit, value: t(vrefOk ? S.yes : S.no), state: vrefOk ? 'pass' : 'fail' },
                { label: S.rGap, value: `${gapMv(vref, VREF_TYP)} mV` },
              ]}
            />
            <p className="ov-note">{t(vrefNote(vref))}</p>
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
