import { useState, type ReactNode } from 'react'
import { useLocale } from '../../../i18n/LocaleContext'
import { fmtVal, type CustomDef, ATE, type ProgramItem } from '../api'
import {
  answerSummary,
  defToDraft,
  draftToDef,
  itemLabel,
  optionList,
  summarizeChanges,
  symptomList,
  templateDefs,
  tf,
  validateCustom,
  type CustomDraft,
} from '../model'
import { S, type TFn } from '../text'

type Props = {
  draft: CustomDraft
  program: ProgramItem[]
  customScenarios: CustomDef[]
  editingId: string | null
  note: { kind: 'ok' | 'bad'; text: string } | null
  onChange: (next: CustomDraft) => void
  onSaveRun: () => void
  onSave: () => void
  onSaveAs: () => void
  onNew: () => void
  onClear: () => void
  onExport: () => void
  onImport: (file: File) => void
  onEditSaved: (id: string) => void
  onDeleteSaved: (id: string) => void
  onExportSaved: (id: string) => void
}

const COUNTS = [100, 200, 500, 1000, 2000, 5000]
const RETESTS = [0, 1, 2, 3]

/** NumInput：允许暂时留空/半输入的数值框，提交时换算成引擎单位 */
function NumInput({
  value,
  scale = 1,
  ariaLabel,
  onCommit,
  placeholder,
  wide = false,
}: {
  value: number | undefined
  scale?: number
  ariaLabel: string
  onCommit: (value: number | undefined) => void
  placeholder?: string
  wide?: boolean
}) {
  const [text, setText] = useState<string | null>(null)
  const shown =
    text !== null
      ? text
      : value === undefined || value === null || Number.isNaN(value)
        ? ''
        : String(Number((value * scale).toFixed(4)))
  return (
    <input
      className={'atesim-input' + (wide ? ' atesim-input--wide' : '')}
      inputMode="decimal"
      aria-label={ariaLabel}
      placeholder={placeholder}
      value={shown}
      onChange={(e) => {
        const raw = e.target.value
        setText(raw)
        const trimmed = raw.trim()
        if (trimmed === '') {
          onCommit(undefined)
          return
        }
        const num = Number(trimmed)
        if (Number.isFinite(num)) onCommit(num / scale)
      }}
      onBlur={() => setText(null)}
    />
  )
}

/** Field：带说明的标签 + 数值框（说明用 title，鼠标悬停可看） */
function Field({
  label,
  tip,
  children,
}: {
  label: string
  tip?: string
  children: ReactNode
}) {
  return (
    <label className="atesim-field" title={tip}>
      <span>{label}</span>
      {children}
    </label>
  )
}

/** CustomPanel：把「场景是一份 JSON 配置」做成表单 */
export function CustomPanel({
  draft,
  program,
  customScenarios,
  editingId,
  note,
  onChange,
  onSaveRun,
  onSave,
  onSaveAs,
  onNew,
  onClear,
  onExport,
  onImport,
  onEditSaved,
  onDeleteSaved,
  onExportSaved,
}: Props) {
  const { t } = useLocale()
  const def = ATE.Scenarios.sanitizeCustom(draftToDef(draft))
  const changes = summarizeChanges(def, t)
  const symptoms = symptomList(def, t)
  const errors = validateCustom(def, t).errors
  const editing = customScenarios.find((item) => item.id === editingId) || null

  const set = (patch: Partial<CustomDraft>) => onChange({ ...draft, ...patch })
  const setAnswer = (patch: Partial<CustomDraft['answer']>) =>
    onChange({ ...draft, answer: { ...draft.answer, ...patch } })
  const setRate = (key: string, value: number | undefined) =>
    set({ rates: { ...draft.rates, [key]: value } })
  const setShift = (key: string, value: number | undefined) =>
    set({ shifts: { ...draft.shifts, [key]: value } })
  const setInstrument = (key: string, value: number | undefined) =>
    set({ instrument: { ...draft.instrument, [key]: value } })
  const setLimit = (id: string, field: 'lsl' | 'usl', value: number | undefined) => {
    const current = draft.limits[id] || {}
    set({ limits: { ...draft.limits, [id]: { ...current, [field]: value } } })
  }
  const setBatch = (patch: Partial<CustomDraft['batch']>) =>
    set({ batch: { ...draft.batch, ...patch } })

  const templates = defsOf(t)
  const answerMode = draft.answer.mode

  return (
    <div className="atesim-stack">
      <section className="atesim-card">
        <div className="atesim-card__head">
          <h2>{t(S.custom.title)}</h2>
          <div className="atesim-actions">
            <button type="button" className="lab__btn" onClick={onNew}>
              {t(S.custom.newScenario)}
            </button>
            <button type="button" className="lab__btn" onClick={onClear}>
              {t(S.custom.clear)}
            </button>
          </div>
        </div>
        <p className="atesim-hint">{t(S.custom.lead)}</p>
        <div className="atesim-templates">
          <span>{t(S.custom.templateLead)}</span>
          {templates.map((item) => (
            <button
              key={item.id}
              type="button"
              className="lab__btn"
              onClick={() => onChange(item.draft)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="atesim-hint">
          {editing ? tf(t, S.custom.editing, { name: editing.name }) : t(S.custom.newBadge)}
        </p>

        <div className="atesim-grid2">
          <Field label={t(S.custom.name)} tip={t(S.custom.nameTip)}>
            <input
              className="atesim-input atesim-input--wide"
              value={draft.name}
              onChange={(e) => set({ name: e.target.value })}
            />
          </Field>
          <Field label={t(S.custom.brief)}>
            <input
              className="atesim-input atesim-input--wide"
              placeholder={t(S.custom.briefPlaceholder)}
              value={draft.brief}
              onChange={(e) => set({ brief: e.target.value })}
            />
          </Field>
        </div>
      </section>

      <section className="atesim-card">
        <h3>{t(S.custom.ratesTitle)}</h3>
        <div className="atesim-grid3">
          {RATES.map((item) => (
            <Field key={item.key} label={t(item.label)} tip={t(item.tip)}>
              <NumInput
                value={draft.rates[item.key]}
                scale={100}
                ariaLabel={t(item.label)}
                onCommit={(value) => setRate(item.key, value)}
              />
            </Field>
          ))}
        </div>
      </section>

      <section className="atesim-card">
        <h3>{t(S.custom.shiftTitle)}</h3>
        <div className="atesim-grid3 atesim-grid3--wide">
          {SHIFTS.map((item) => (
            <Field key={item.key} label={t(item.label)} tip={t(item.tip)}>
              <NumInput
                value={draft.shifts[item.key]}
                ariaLabel={t(item.label)}
                onCommit={(value) => setShift(item.key, value)}
              />
            </Field>
          ))}
        </div>
      </section>

      <section className="atesim-card">
        <h3>{t(S.custom.systemTitle)}</h3>
        <div className="atesim-grid4">
          {SYSTEM.map((item) => (
            <Field key={item.key} label={t(item.label)} tip={t(item.tip)}>
              <NumInput
                value={draft.instrument[item.key]}
                scale={item.scale}
                ariaLabel={t(item.label)}
                onCommit={(value) => setInstrument(item.key, value)}
              />
            </Field>
          ))}
        </div>
      </section>

      <section className="atesim-card">
        <h3>{t(S.custom.batchTitle)}</h3>
        <div className="atesim-grid3">
          <Field label={t(S.common.count)}>
            <select
              className="atesim-select"
              value={draft.batch.count}
              onChange={(e) => setBatch({ count: Number(e.target.value) })}
            >
              {COUNTS.map((count) => (
                <option key={count} value={count}>
                  {count} {t(S.common.dice)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t(S.common.retest)}>
            <select
              className="atesim-select"
              value={draft.batch.retest}
              onChange={(e) => setBatch({ retest: Number(e.target.value) })}
            >
              {RETESTS.map((retest) => (
                <option key={retest} value={retest}>
                  {t([S.lot.noRetest, S.lot.once, S.lot.twice, S.lot.thrice][retest] || S.lot.noRetest)}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t(S.common.seed)}>
            <NumInput
              value={draft.batch.seed}
              ariaLabel={t(S.common.seed)}
              wide
              onCommit={(value) => setBatch({ seed: value === undefined ? 0 : Math.round(value) })}
            />
          </Field>
        </div>
        <p className="atesim-hint">{t(S.custom.seedNote)}</p>
      </section>

      <section className="atesim-card">
        <h3>{t(S.custom.limitsTitle)}</h3>
        <div className="atesim-scroll">
          <table className="dtable atesim-table">
            <thead>
              <tr>
                <th>{t(S.custom.colItem)}</th>
                <th>{t(S.custom.colUnit)}</th>
                <th>{t(S.custom.colDefaultLsl)}</th>
                <th>{t(S.custom.colDefaultUsl)}</th>
                <th>{t(S.custom.colLsl)}</th>
                <th>{t(S.custom.colUsl)}</th>
              </tr>
            </thead>
            <tbody>
              {program.map((item) => (
                <tr key={item.id}>
                  <td>
                    <b>{itemLabel(item.id, t)}</b>
                  </td>
                  <td className="num">{item.unit}</td>
                  <td className="num">{item.lsl === null ? '—' : fmtVal(item.lsl, item.digits)}</td>
                  <td className="num">{item.usl === null ? '—' : fmtVal(item.usl, item.digits)}</td>
                  <td>
                    <NumInput
                      value={draft.limits[item.id]?.lsl ?? undefined}
                      ariaLabel={t(S.custom.colLsl) + ' ' + itemLabel(item.id, t)}
                      placeholder={t(S.custom.limitInherit)}
                      onCommit={(value) => setLimit(item.id, 'lsl', value)}
                    />
                  </td>
                  <td>
                    <NumInput
                      value={draft.limits[item.id]?.usl ?? undefined}
                      ariaLabel={t(S.custom.colUsl) + ' ' + itemLabel(item.id, t)}
                      placeholder={t(S.custom.limitInherit)}
                      onCommit={(value) => setLimit(item.id, 'usl', value)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="atesim-card">
        <h3>{t(S.custom.impactTitle)}</h3>
        {changes.length ? (
          <>
            <p className="atesim-hint">{t(S.custom.impactInject)}</p>
            <ul className="atesim-bullets">
              {changes.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </>
        ) : (
          <p className="atesim-hint">{t(S.custom.impactEmpty)}</p>
        )}
        <p className="atesim-hint">{t(S.custom.impactSymptoms)}</p>
        <ul className="atesim-bullets">
          {symptoms.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
        {errors.length ? (
          <ul className="atesim-errors">
            {errors.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : null}
      </section>

      <section className="atesim-card">
        <h3>{t(S.custom.answerTitle)}</h3>
        <p className="atesim-hint">{t(S.custom.answerHint)}</p>
        <Field label={t(S.custom.modeLabel)}>
          <select
            className="atesim-select"
            value={answerMode}
            onChange={(e) => {
              const next = e.target.value as CustomDraft['answer']['mode']
              // 文字判分用自己写的答案；切回选项判分时把 custom 清掉，免得留下无效选项
              setAnswer({
                mode: next,
                rootCause:
                  next === 'text' ? 'custom' : draft.answer.rootCause === 'custom' ? '' : draft.answer.rootCause,
                action:
                  next === 'text' ? 'custom' : draft.answer.action === 'custom' ? '' : draft.answer.action,
              })
            }}
          >
            <option value="none">{t(S.custom.modeNone)}</option>
            <option value="choice">{t(S.custom.modeChoice)}</option>
            <option value="text">{t(S.custom.modeText)}</option>
          </select>
        </Field>

        {answerMode !== 'none' ? (
          <>
            {answerMode === 'choice' ? (
              <div className="atesim-grid2">
                <Field label={t(S.custom.answerRoot)}>
                  <select
                    className="atesim-select"
                    value={draft.answer.rootCause}
                    onChange={(e) => setAnswer({ rootCause: e.target.value })}
                  >
                    <option value="">{t(S.scenario.pickRoot)}</option>
                    {optionList('rootCause', t).map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label={t(S.custom.answerAction)}>
                  <select
                    className="atesim-select"
                    value={draft.answer.action}
                    onChange={(e) => setAnswer({ action: e.target.value })}
                  >
                    <option value="">{t(S.scenario.pickAction)}</option>
                    {optionList('action', t).map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            ) : null}

            {answerMode === 'text' ? (
              <>
                <Field label={t(S.custom.answerTextLabelRoot)}>
                  <textarea
                    className="atesim-textarea"
                    rows={2}
                    placeholder={t(S.custom.answerTextRoot)}
                    value={draft.answer.rootCauseText}
                    onChange={(e) => setAnswer({ rootCauseText: e.target.value })}
                  />
                </Field>
                <Field label={t(S.custom.answerKeysLabelRoot)}>
                  <input
                    className="atesim-input atesim-input--wide"
                    placeholder={t(S.custom.answerKeysRoot)}
                    value={draft.answer.rootCauseKeys}
                    onChange={(e) => setAnswer({ rootCauseKeys: e.target.value })}
                  />
                </Field>
                <Field label={t(S.custom.answerTextLabelAction)}>
                  <textarea
                    className="atesim-textarea"
                    rows={2}
                    placeholder={t(S.custom.answerTextAction)}
                    value={draft.answer.actionText}
                    onChange={(e) => setAnswer({ actionText: e.target.value })}
                  />
                </Field>
                <Field label={t(S.custom.answerKeysLabelAction)}>
                  <input
                    className="atesim-input atesim-input--wide"
                    placeholder={t(S.custom.answerKeysAction)}
                    value={draft.answer.actionKeys}
                    onChange={(e) => setAnswer({ actionKeys: e.target.value })}
                  />
                </Field>
              </>
            ) : null}
          </>
        ) : null}

        <Field label={t(S.custom.explanation)}>
          <textarea
            className="atesim-textarea"
            rows={3}
            placeholder={t(S.custom.explanationPlaceholder)}
            value={draft.answer.explanation}
            onChange={(e) => setAnswer({ explanation: e.target.value })}
          />
        </Field>

        <p className="atesim-stats">{answerSummary(def, t)}</p>

        <div className="atesim-actions">
          <button type="button" className="lab__btn lab__btn--primary" onClick={onSaveRun}>
            {t(S.custom.saveRun)}
          </button>
          <button type="button" className="lab__btn" onClick={onSave}>
            {t(S.custom.save)}
          </button>
          <button type="button" className="lab__btn" onClick={onSaveAs}>
            {t(S.custom.saveAs)}
          </button>
          <button type="button" className="lab__btn" onClick={onExport}>
            {t(S.custom.exportJson)}
          </button>
          <label className="lab__btn atesim-file">
            {t(S.custom.importJson)}
            <input
              type="file"
              accept="application/json,.json"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onImport(file)
                e.target.value = ''
              }}
            />
          </label>
        </div>
        {note ? (
          <p className={'atesim-note ' + (note.kind === 'bad' ? 'is-bad' : 'is-ok')}>{note.text}</p>
        ) : null}
      </section>

      <section className="atesim-card">
        <div className="atesim-card__head">
          <h3>{tf(t, S.custom.mine, { n: customScenarios.length })}</h3>
        </div>
        <p className="atesim-hint">{t(S.custom.mineNote)}</p>
        {customScenarios.length ? (
          <ul className="atesim-mine">
            {customScenarios.map((item) => (
              <li key={item.id || item.name}>
                <b>{item.name}</b>
                <span className="atesim-hint">{item.brief}</span>
                <span className="atesim-mine__ops">
                  <button type="button" className="lab__btn" onClick={() => onEditSaved(item.id || '')}>
                    {t(S.custom.edit)}
                  </button>
                  <button type="button" className="lab__btn" onClick={() => onExportSaved(item.id || '')}>
                    {t(S.custom.exportOne)}
                  </button>
                  <button type="button" className="lab__btn" onClick={() => onDeleteSaved(item.id || '')}>
                    {t(S.custom.del)}
                  </button>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="atesim-empty">{t(S.custom.mineEmpty)}</p>
        )}
      </section>

      <MechSection />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 固定表单结构：数值范围与引擎的 CUSTOM_RANGES 对齐                    */
/* ------------------------------------------------------------------ */

const RATES: Array<{ key: string; label: typeof S.custom.rateOpen; tip: typeof S.custom.rateOpenTip }> = [
  { key: 'open', label: S.custom.rateOpen, tip: S.custom.rateOpenTip },
  { key: 'short', label: S.custom.rateShort, tip: S.custom.rateShortTip },
  { key: 'leak', label: S.custom.rateLeak, tip: S.custom.rateLeakTip },
  { key: 'idd', label: S.custom.rateIdd, tip: S.custom.rateIddTip },
  { key: 'speedTail', label: S.custom.rateTail, tip: S.custom.rateTailTip },
]

const SHIFTS: Array<{ key: string; label: typeof S.custom.shiftVoh; tip: typeof S.custom.shiftVohTip }> = [
  { key: 'iddDyn', label: S.custom.shiftIddDyn, tip: S.custom.shiftIddDynTip },
  { key: 'iddStdby', label: S.custom.shiftIddStdby, tip: S.custom.shiftIddStdbyTip },
  { key: 'fmax', label: S.custom.shiftFmax, tip: S.custom.shiftFmaxTip },
  { key: 'voh', label: S.custom.shiftVoh, tip: S.custom.shiftVohTip },
  { key: 'vol', label: S.custom.shiftVol, tip: S.custom.shiftVolTip },
  { key: 'leak', label: S.custom.shiftLeak, tip: S.custom.shiftLeakTip },
  { key: 'continuity', label: S.custom.shiftCont, tip: S.custom.shiftContTip },
]

const SYSTEM: Array<{ key: 'contactR' | 'contactVar' | 'contactDrift' | 'noiseScale'; label: typeof S.custom.contactR; tip: typeof S.custom.contactRTip; scale: number }> = [
  { key: 'contactR', label: S.custom.contactR, tip: S.custom.contactRTip, scale: 1 },
  { key: 'contactVar', label: S.custom.contactVar, tip: S.custom.contactVarTip, scale: 100 },
  { key: 'contactDrift', label: S.custom.contactDrift, tip: S.custom.contactDriftTip, scale: 1 },
  { key: 'noiseScale', label: S.custom.noiseScale, tip: S.custom.noiseScaleTip, scale: 1 },
]

/** defsOf：三个起步模板 → 表单草稿（数值来自 model.ts 的 templateDefs） */
function defsOf(t: TFn): Array<{ id: string; label: string; draft: CustomDraft }> {
  return templateDefs(t).map((item) => ({
    id: item.id,
    label: item.label,
    draft: defToDraft(item.def),
  }))
}

/** MechSection：注入机制说明（常驻显示的参考卡片，不折叠） */
function MechSection() {
  const { t } = useLocale()
  return (
    <section className="atesim-card atesim-mech">
      <div className="atesim-card__head">
        <h2>{t(S.mech.title)}</h2>
      </div>
      <p className="atesim-mech__lead">{t(S.mech.intro)}</p>

      <h3>{t(S.mech.defect.title)}</h3>
      <p>{t(S.mech.defect.body1)}</p>
      <p>{t(S.mech.defect.body2)}</p>
      <div className="atesim-scroll">
        <table className="dtable atesim-table">
          <thead>
            <tr>
              {S.mech.defect.tableHead.map((cell, index) => (
                <th key={index}>{t(cell)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {S.mech.defect.rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{t(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="atesim-hint">{t(S.mech.defect.note)}</p>

      <h3>{t(S.mech.shift.title)}</h3>
      <p>{t(S.mech.shift.body)}</p>
      <div className="atesim-scroll">
        <table className="dtable atesim-table">
          <thead>
            <tr>
              {S.mech.shift.tableHead.map((cell, index) => (
                <th key={index}>{t(cell)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {S.mech.shift.rows.map((row, index) => (
              <tr key={index}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{t(cell)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="atesim-hint">{t(S.mech.shift.note)}</p>

      <h3>{t(S.mech.system.title)}</h3>
      <p>{t(S.mech.system.p1)}</p>
      <p>{t(S.mech.system.p2)}</p>
      <p>{t(S.mech.system.p3)}</p>
      <p>{t(S.mech.system.p4)}</p>
      <p className="atesim-hint">{t(S.mech.system.note)}</p>

      <h3>{t(S.mech.limits.title)}</h3>
      <p>{t(S.mech.limits.body)}</p>

      <h3>{t(S.mech.combo.title)}</h3>
      <p>{t(S.mech.combo.body)}</p>
      <p className="atesim-hint">{t(S.mech.combo.note)}</p>
    </section>
  )
}
