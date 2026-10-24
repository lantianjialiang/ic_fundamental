import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Cards, Knob, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import '../hs/hs.css'
import { conductionLoss } from './core/power'
import { PWR_META } from './meta'
import { LossFig, RdsFig } from './PwrSelectorFig'
import {
  APP_CARDS,
  CLASS_LABEL,
  INTRO,
  MISCONCEPTIONS,
  PARAM_LABEL,
  QUIZ,
  RATING_SEG,
  S,
  TAKEAWAY,
  TYPE_SEG,
  fillL,
  taskItems,
  verdictOf,
} from './pwrSelectorData'
import {
  PARAM_GROUPS,
  PARAM_IDS,
  appOf,
  classOf,
  lossOf,
  ratingFit,
  type DevicePick,
  type ParamClass,
  type ParamId,
  type SelectorState,
  defaultSelector,
} from './pwrSelectorModel'
import './pwrSelector.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

/** 分类下拉框的类别，顺序与参数组一致 */
const CLASS_IDS: ParamClass[] = PARAM_GROUPS.map((group) => group.cls)

export function PwrSelectorPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<SelectorState>(() => defaultSelector())
  const [assign, setAssign] = useState<Partial<Record<ParamId, ParamClass>>>({})

  const app = appOf(state.appId)
  const pick: DevicePick = state.picks[app.id]
  const fit = ratingFit(app, pick.rating)
  const loss = lossOf(app, pick)
  const verdict = verdictOf(state)

  const update = (patch: Partial<SelectorState>) => setState((prev) => ({ ...prev, ...patch }))
  const setPick = (patch: Partial<DevicePick>) =>
    setState((prev) => ({
      ...prev,
      picks: { ...prev.picks, [prev.appId]: { ...prev.picks[prev.appId], ...patch } },
    }))

  const setClass = (id: ParamId, value: string) => {
    setAssign((prev) => {
      const next = { ...prev }
      if (value === 'none') {
        delete next[id]
      } else {
        next[id] = value as ParamClass
      }
      return next
    })
  }

  const assigned = PARAM_IDS.filter((id) => assign[id] !== undefined)
  const correct = assigned.filter((id) => assign[id] === classOf(id)).length
  let classStatus = S.classPartial
  if (correct === PARAM_IDS.length) {
    classStatus = S.classAll
  } else if (correct < assigned.length) {
    classStatus = S.classWrong
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PWR_META.pwrSelector.title)}
      goal={t(PWR_META.pwrSelector.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="pwrStatic"
      nextLabel={t(S.next)}
      extra={
        <TaskList
          items={taskItems(state, assign)}
          onReset={() => {
            setState(defaultSelector())
            setAssign({})
          }}
        />
      }
    >
      <Section title={t(S.introTitle)} note={t(S.introTitleNote)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['anaMeasure', 'mosSelect', 'mosDynamic']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <Cards items={APP_CARDS} activeId={state.appId} onPick={(item) => update({ appId: item.id })} cols={4} />
        <div className="hs-controls">
          <div className="hs-field">
            <span className="hs-field__label">{t(S.typeLabel)}</span>
            <Seg options={TYPE_SEG} value={pick.type} onChange={(type) => setPick({ type })} />
          </div>
          <div className="hs-field">
            <span className="hs-field__label">{t(S.ratingLabel)}</span>
            <Seg options={RATING_SEG} value={String(pick.rating)} onChange={(id) => setPick({ rating: Number(id) })} />
          </div>
        </div>

        <div className="hs-grid">
          <div className="pwr-figs">
            <RdsFig pick={pick} />
            <LossFig app={app} pick={pick} />
            <p className="pwr-formula">{t(S.formulaNote)}</p>
          </div>
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rBus, value: `${app.busV} V` },
                { label: S.rRatio, value: `${(pick.rating / app.busV).toFixed(2)} ×` },
                {
                  label: S.rFit,
                  value: t(fit === 'ok' ? S.fitOk : fit === 'low' ? S.fitLow : S.fitHigh),
                  state: fit === 'ok' ? 'pass' : 'fail',
                },
                { label: S.rCond, value: loss.offered ? `${loss.conduction.toFixed(2)} W` : t(S.noValue) },
                { label: S.rSw, value: loss.offered ? `${loss.switching.toFixed(2)} W` : t(S.noValue) },
                { label: S.rTotal, value: loss.offered ? `${loss.total.toFixed(2)} W` : t(S.rNone) },
              ]}
            />
            <div className="pwr-calc">
              <b>{t(S.calcTitle)}</b>
              <Knob label={S.calcI} value={state.calcI} unit="A" min={1} max={50} step={1} onChange={(calcI) => update({ calcI })} />
              <Knob label={S.calcR} value={state.calcR} unit="mΩ" min={1} max={20} step={1} onChange={(calcR) => update({ calcR })} />
              <Readout items={[{ label: S.calcP, value: `${conductionLoss(state.calcI, state.calcR / 1000).toFixed(2)} W` }]} />
            </div>
          </div>
        </div>
      </Section>

      <Section title={t(S.classTitle)} note={t(S.classNote)}>
        <ul className="pwr-class-table">
          {PARAM_IDS.map((id) => {
            const value = assign[id]
            const isRight = value !== undefined && value === classOf(id)
            const isWrong = value !== undefined && value !== classOf(id)
            return (
              <li key={id} className={`pwr-class-row${isRight ? ' is-right' : ''}${isWrong ? ' is-wrong' : ''}`}>
                <span>{t(PARAM_LABEL[id])}</span>
                <select
                  aria-label={`${t(S.classAria)}: ${t(PARAM_LABEL[id])}`}
                  value={value ?? 'none'}
                  onChange={(event) => setClass(id, event.target.value)}
                >
                  <option value="none">{t(S.unassigned)}</option>
                  {CLASS_IDS.map((cls) => (
                    <option key={cls} value={cls}>
                      {t(CLASS_LABEL[cls])}
                    </option>
                  ))}
                </select>
              </li>
            )
          })}
        </ul>
        <p className="pwr-formula">{t(fillL(S.classCount, { n: String(assigned.length) }))}</p>
        {assigned.length > 0 ? <p className="pwr-formula">{t(classStatus)}</p> : null}
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
