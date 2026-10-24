import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, type Card, Cards, Explain, Knob, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import '../hs/hs.css'
import { REL_META } from './meta'
import {
  CASE_TEXT,
  GROUP_NAME,
  INTRO,
  MISCONCEPTIONS,
  PRODUCT_TEXT,
  QUIZ,
  ROLE_NAME,
  S,
  STD_NAME,
  TAKEAWAY,
  TEST_NAME,
  taskItems,
  verdictOf,
} from './relAutoData'
import { GradeFig, TempFig } from './RelAutoFig'
import {
  type AutoState,
  CASES,
  DEFAULT_AUTO,
  GRADES,
  type GradeId,
  gradeVerdict,
  GROUPS,
  type GroupId,
  groupsCorrect,
  needOf,
  PRODUCTS,
  ROLES,
  type RoleId,
  ROOM_C,
  rolesCorrect,
  type SelectableId,
  STANDARDS,
  type StdId,
  tempCoverage,
  TESTS,
  type TestId,
  VDUT_GRADE,
} from './relAutoModel'
import './relAuto.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

/** 产品卡：顺序与 PRODUCTS 一致，第一张是默认选中的发动机舱传感器接口 */
const PRODUCT_CARDS: Card[] = PRODUCTS.map((product) => ({
  id: product.id,
  title: PRODUCT_TEXT[product.id].title,
  sub: PRODUCT_TEXT[product.id].sub,
  text: PRODUCT_TEXT[product.id].sub,
}))

/** 失效案例卡：副标题是先暴露它的试验，说明文字在卡片下方 */
const CASE_CARDS: Card[] = CASES.map((item) => ({
  id: item.id,
  title: CASE_TEXT[item.id].title,
  sub: TEST_NAME[item.test],
  text: CASE_TEXT[item.id].reason,
}))

const GRADE_OPTIONS = GRADES.map((row) => ({ id: String(row.grade), label: `Grade ${row.grade}` }))

/** 下拉框的值是字符串，换回有效的 id；取不到时退回第一项 */
const asGroup = (value: string): GroupId => GROUPS.find((group) => group === value) ?? GROUPS[0]
const asRole = (value: string): RoleId => ROLES.find((role) => role === value) ?? ROLES[0]

export function RelAutoPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [state, setState] = useState<AutoState>(DEFAULT_AUTO)
  const verdict = verdictOf(state)
  const { product } = state
  const grade: GradeId = product === 'vdut' ? VDUT_GRADE : state.grades[product]
  const need = needOf(product)
  const gradeCheck = gradeVerdict(grade, need)
  const gradeState = gradeCheck === 'right' ? 'pass' : gradeCheck === 'short' ? 'fail' : undefined
  const cover = tempCoverage(state.lowC, state.highC, VDUT_GRADE)
  const groupsDone = groupsCorrect(state.groups)
  const rolesDone = rolesCorrect(state.roles)
  const update = (patch: Partial<AutoState>) => setState((prev) => ({ ...prev, ...patch }))

  const pickProduct = (id: string) => {
    const hit = PRODUCTS.find((item) => item.id === id)
    if (hit) {
      update({ product: hit.id })
    }
  }
  const pickGrade = (value: string) => {
    const hit = GRADES.find((row) => String(row.grade) === value)
    if (hit && product !== 'vdut') {
      const id: SelectableId = product
      setState((prev) => ({ ...prev, grades: { ...prev.grades, [id]: hit.grade } }))
    }
  }
  const pickCase = (id: string) => {
    const hit = CASES.find((item) => item.id === id)
    if (hit) {
      update({ caseId: hit.id })
    }
  }
  const pickGroup = (test: TestId, value: string) => {
    const group = asGroup(value)
    setState((prev) => ({ ...prev, groups: { ...prev.groups, [test]: group } }))
  }
  const pickRole = (std: StdId, value: string) => {
    const role = asRole(value)
    setState((prev) => ({ ...prev, roles: { ...prev.roles, [std]: role } }))
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(REL_META.relAuto.title)}
      goal={t(REL_META.relAuto.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      nextId="relPat"
      nextLabel={t(S.next)}
      extra={<TaskList items={taskItems(state)} onReset={() => setState(DEFAULT_AUTO)} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['relStress', 'relFlow']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.gradeTitle)} note={t(S.gradeNote)}>
        <Cards items={PRODUCT_CARDS} activeId={product} onPick={(item) => pickProduct(item.id)} cols={4} />
        {product === 'vdut' ? (
          <p className="rel-auto-note">{t(S.vdutFixed)}</p>
        ) : (
          <div className="hs-field">
            <span className="hs-field__label">{t(S.gradeSeg)}</span>
            <Seg options={GRADE_OPTIONS} value={String(grade)} onChange={pickGrade} />
          </div>
        )}
        <div className="hs-grid">
          <div className="hs-cell">
            <GradeFig need={need} grade={grade} />
          </div>
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rNeed, value: `${need} °C` },
                { label: S.rRange, value: `${GRADES[grade].minC} ~ +${GRADES[grade].maxC} °C` },
                { label: S.rVerdict, value: t(verdict.title), state: gradeState },
              ]}
            />
          </div>
        </div>
        <table className="rel-auto-table">
          <caption>{t(S.tableCaption)}</caption>
          <thead>
            <tr>
              <th scope="col">{t(S.thGrade)}</th>
              <th scope="col">{t(S.thRange)}</th>
            </tr>
          </thead>
          <tbody>
            {GRADES.map((row) => (
              <tr key={row.grade} className={row.grade === grade ? 'is-current' : undefined}>
                <td>{`Grade ${row.grade}`}</td>
                <td>{`${row.minC} ~ +${row.maxC} °C`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>

      <Section title={t(S.tempTitle)} note={t(S.tempNote)}>
        <div className="hs-controls">
          <Knob label={S.lowLabel} value={state.lowC} unit="°C" min={-60} max={-10} step={5} onChange={(lowC) => update({ lowC })} />
          <Knob label={S.highLabel} value={state.highC} unit="°C" min={100} max={160} step={5} onChange={(highC) => update({ highC })} />
        </div>
        <div className="hs-grid">
          <div className="hs-cell">
            <TempFig lowC={state.lowC} highC={state.highC} />
          </div>
          <div className="hs-cell">
            <Readout
              items={[
                { label: S.rLow, value: `${state.lowC} °C`, state: cover.low ? 'pass' : 'fail' },
                { label: S.rRoom, value: `${ROOM_C} °C` },
                { label: S.rHigh, value: `${state.highC} °C`, state: cover.high ? 'pass' : 'fail' },
                { label: S.rCover, value: t(cover.low && cover.high ? S.yes : S.no), state: cover.low && cover.high ? 'pass' : 'fail' },
              ]}
            />
          </div>
        </div>
        <Callout>
          <p>{t(S.coldPurpose)}</p>
        </Callout>
      </Section>

      <Section title={t(S.casesTitle)} note={t(S.casesNote)}>
        <Cards items={CASE_CARDS} activeId={state.caseId} onPick={(item) => pickCase(item.id)} cols={4} />
        <Explain paras={[CASE_TEXT[state.caseId].reason]} />
      </Section>

      <Section title={t(S.groupsTitle)} note={t(S.groupsNote)}>
        <Readout items={[{ label: S.groupsCount, value: `${groupsDone} / ${TESTS.length}`, state: groupsDone === TESTS.length ? 'pass' : undefined }]} />
        <div className="rel-auto-rows">
          {TESTS.map((test) => (
            <div key={test} className="rel-auto-row">
              <span>{t(TEST_NAME[test])}</span>
              <select aria-label={t(TEST_NAME[test])} value={state.groups[test]} onChange={(e) => pickGroup(test, e.target.value)}>
                {GROUPS.map((group) => (
                  <option key={group} value={group}>{`${group} · ${t(GROUP_NAME[group])}`}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </Section>

      <Section title={t(S.stdTitle)} note={t(S.stdNote)}>
        <Readout items={[{ label: S.stdCount, value: `${rolesDone} / ${STANDARDS.length}`, state: rolesDone === STANDARDS.length ? 'pass' : undefined }]} />
        <div className="rel-auto-rows">
          {STANDARDS.map((std) => (
            <div key={std} className="rel-auto-row">
              <span>{STD_NAME[std]}</span>
              <select aria-label={STD_NAME[std]} value={state.roles[std]} onChange={(e) => pickRole(std, e.target.value)}>
                {ROLES.map((role) => (
                  <option key={role} value={role}>{t(ROLE_NAME[role])}</option>
                ))}
              </select>
            </div>
          ))}
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
