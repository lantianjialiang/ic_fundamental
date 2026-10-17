import { useEffect, useState } from 'react'
import { useLocale } from '../../../i18n/LocaleContext'
import { type Scenario } from '../api'
import { FIRST_OPTION, answerTextOf, optionLabel, optionList, scenarioMode, tf } from '../model'
import { type GradeOut, type ScoreRec } from '../state'
import { S } from '../text'

type Props = {
  scenarios: Scenario[]
  selectedId: string | null
  scores: Record<string, ScoreRec>
  grade: GradeOut | null
  loadedNote: string
  onSelect: (id: string) => void
  onLoadRun: (id: string) => void
  onRestore: () => void
  onSubmit: (sub: { rootCause: string; action: string; rootCauseText: string; actionText: string }) => void
}

/** ScenarioPanel：五个预置故障 + 已保存的自定义故障，载入运行并提交诊断 */
export function ScenarioPanel({
  scenarios,
  selectedId,
  scores,
  grade,
  loadedNote,
  onSelect,
  onLoadRun,
  onRestore,
  onSubmit,
}: Props) {
  const { t } = useLocale()
  const selected = scenarios.find((item) => item.id === selectedId) || null
  const mode = selected ? scenarioMode(selected) : 'none'
  const SEP = ' · '
  // 作答与标准答案都按当前语言现场拼，切语言时不会留着旧文案
  const given = () => {
    if (!grade) return ''
    const one = (kind: 'rootCause' | 'action') => {
      if (grade.mode === 'text') return (kind === 'rootCause' ? grade.rootText : grade.actionText).trim()
      const id = kind === 'rootCause' ? grade.rootCause : grade.action
      return id ? optionLabel(kind, id, t) : ''
    }
    return (one('rootCause') || t(S.scenario.noAnswer)) + SEP + (one('action') || t(S.scenario.noAnswer))
  }
  const standard = () => {
    if (!selected) return ''
    const one = (kind: 'rootCause' | 'action') =>
      answerTextOf(selected.correct, kind, t) || t(S.scenario.noAnswer)
    return one('rootCause') + SEP + one('action')
  }
  // 下拉框默认选第一项：界面上不留空选项
  const [root, setRoot] = useState(FIRST_OPTION.rootCause)
  const [action, setAction] = useState(FIRST_OPTION.action)
  const [rootText, setRootText] = useState('')
  const [actionText, setActionText] = useState('')
  const [hint, setHint] = useState(false)
  const [warn, setWarn] = useState('')

  // 换场景时把作答与提示清空，避免把上一题的答案带过来
  useEffect(() => {
    setRoot(FIRST_OPTION.rootCause)
    setAction(FIRST_OPTION.action)
    setRootText('')
    setActionText('')
    setHint(false)
    setWarn('')
  }, [selectedId])

  const submit = () => {
    if (mode === 'choice') {
      if (!root || !action) {
        setWarn(t(S.scenario.missingChoice))
        return
      }
    } else if (mode === 'text') {
      if (!rootText.trim() || !actionText.trim()) {
        setWarn(t(S.scenario.missingText))
        return
      }
    }
    setWarn('')
    onSubmit({ rootCause: root, action, rootCauseText: rootText, actionText: actionText })
  }

  return (
    <div className="atesim-scenario">
      <section className="atesim-card atesim-scenario__list">
        <div className="atesim-card__head">
          <h2>{t(S.tabs.scenario)}</h2>
          <span className="atesim-hint">{scenarios.length}</span>
        </div>
        <p className="atesim-hint">{t(S.scenario.lead)}</p>
        <div className="atesim-scenario__items">
          {scenarios.map((item) => {
            const rec = scores[item.id]
            const status = !rec || !rec.attempts
              ? t(S.scenario.statusNew)
              : rec.solved
                ? tf(t, S.scenario.statusSolved, { n: rec.best })
                : tf(t, S.scenario.statusBest, { n: rec.best })
            return (
              <button
                key={item.id}
                type="button"
                className={'atesim-scenario__item' + (item.id === selectedId ? ' is-active' : '')}
                onClick={() => onSelect(item.id)}
              >
                <b>{item.name}</b>
                <span className="atesim-scenario__tag">{item.tag}</span>
                <span className={'atesim-scenario__status' + (rec && rec.solved ? ' is-solved' : '')}>
                  {status}
                </span>
                <span className="atesim-scenario__open">
                  {t(item.isCustom ? S.scenario.customBadge : S.scenario.clickView)}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <section className="atesim-card atesim-scenario__detail">
        {!selected ? (
          <p className="atesim-empty">{t(S.scenario.noScenario)}</p>
        ) : (
          <>
            <div className="atesim-card__head">
              <h2>{selected.name}</h2>
              <span className="atesim-badge is-tag">{selected.tag}</span>
            </div>
            <p className="atesim-brief">{selected.brief}</p>
            <p className="atesim-stats">{selected.setup.describe}</p>

            <div className="atesim-taskbox">
              <h3>{t(S.scenario.yourTask)}</h3>
              <p>{selected.task}</p>
            </div>

            <div className="atesim-actions">
              <button
                type="button"
                className="lab__btn lab__btn--primary"
                onClick={() => onLoadRun(selected.id)}
              >
                {t(S.scenario.loadRun)}
              </button>
              <button type="button" className="lab__btn" onClick={() => setHint((prev) => !prev)}>
                {t(S.scenario.showHint)}
              </button>
              <button type="button" className="lab__btn" onClick={onRestore}>
                {t(S.scenario.exit)}
              </button>
            </div>

            {hint ? <p className="atesim-note is-ok">{tf(t, S.scenario.hintPrefix, { text: selected.hint })}</p> : null}
            {loadedNote ? <p className="atesim-note is-ok">{loadedNote}</p> : null}

            {mode === 'none' ? (
              <div className="callout">
                <p>{t(S.scenario.noAnswerBox)}</p>
              </div>
            ) : (
              <div className="atesim-answer">
                <h3>{t(S.scenario.diagnose)}</h3>
                {mode === 'choice' ? (
                  <div className="atesim-grid2">
                    <label className="atesim-field">
                      <span>{t(S.scenario.rootCause)}</span>
                      <select
                        className="atesim-select"
                        value={root}
                        onChange={(e) => setRoot(e.target.value)}
                      >
                        {optionList('rootCause', t).map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="atesim-field">
                      <span>{t(S.scenario.action)}</span>
                      <select
                        className="atesim-select"
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                      >
                        {optionList('action', t).map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                ) : (
                  <>
                    <label className="atesim-field">
                      <span>{t(S.scenario.textRoot)}</span>
                      <textarea
                        className="atesim-textarea"
                        rows={2}
                        placeholder={t(S.scenario.textRootPlaceholder)}
                        value={rootText}
                        onChange={(e) => setRootText(e.target.value)}
                      />
                    </label>
                    <label className="atesim-field">
                      <span>{t(S.scenario.textAction)}</span>
                      <textarea
                        className="atesim-textarea"
                        rows={2}
                        placeholder={t(S.scenario.textActionPlaceholder)}
                        value={actionText}
                        onChange={(e) => setActionText(e.target.value)}
                      />
                    </label>
                    <p className="atesim-hint">{t(S.scenario.textNote)}</p>
                  </>
                )}
                <div className="atesim-actions">
                  <button type="button" className="lab__btn lab__btn--primary" onClick={submit}>
                    {t(S.scenario.diagnose)}
                  </button>
                </div>
                {warn ? <p className="atesim-note is-bad">{warn}</p> : null}
              </div>
            )}

            {grade ? (
              <div className={'atesim-grade is-' + grade.level}>
                <p className="atesim-grade__line">
                  {grade.level === 'full'
                    ? tf(t, S.scenario.full, {
                        n: grade.score,
                        note: grade.attempts > 1 ? tf(t, S.scenario.retryNote, { n: grade.attempts }) : '',
                      })
                    : grade.level === 'partial'
                      ? tf(t, S.scenario.partial, {
                          n: grade.score,
                          note: grade.attempts > 1 ? tf(t, S.scenario.retryNote, { n: grade.attempts }) : '',
                        })
                      : t(S.scenario.none)}
                </p>

                <dl className="atesim-grade__dl">
                  <dt>{t(S.scenario.yourAnswer)}</dt>
                  <dd>{given()}</dd>
                  <dt>{t(S.scenario.standardAnswer)}</dt>
                  <dd>{standard()}</dd>
                </dl>

                {grade.rootHit ? (
                  <p className="atesim-hint">
                    {t(S.scenario.rootCause)} ·{' '}
                    {tf(t, S.scenario.hitLine, {
                      hit: grade.rootHit.hits,
                      total: grade.rootHit.total,
                      keys: grade.rootHit.hitKeys.length
                        ? tf(t, S.scenario.hitKeys, { list: grade.rootHit.hitKeys.join(' · ') })
                        : '',
                    })}
                  </p>
                ) : null}
                {grade.actionHit ? (
                  <p className="atesim-hint">
                    {t(S.scenario.action)} ·{' '}
                    {tf(t, S.scenario.hitLine, {
                      hit: grade.actionHit.hits,
                      total: grade.actionHit.total,
                      keys: grade.actionHit.hitKeys.length
                        ? tf(t, S.scenario.hitKeys, { list: grade.actionHit.hitKeys.join(' · ') })
                        : '',
                    })}
                  </p>
                ) : null}

                {grade.level !== 'full' ? (
                  <ul className="atesim-bullets">
                    {!grade.rootCorrect ? <li>{t(S.scenario.wrongRoot)}</li> : null}
                    {!grade.actionCorrect ? <li>{t(S.scenario.wrongAction)}</li> : null}
                    <li>{t(S.scenario.tryAgain)}</li>
                  </ul>
                ) : null}

                <h3>{t(S.scenario.explanation)}</h3>
                <p className="atesim-explain">{selected.explanation}</p>
              </div>
            ) : null}
          </>
        )}
      </section>
    </div>
  )
}
