import { useState } from 'react'
import { useLocale } from '../../../i18n/LocaleContext'
import { fmtVal, type ProgramItem } from '../api'
import { itemCondition, itemLabel, tf } from '../model'
import { S } from '../text'

type Props = {
  program: ProgramItem[]
  stopOnFirstFail: boolean
  onToggleStop: () => void
  onResetLimits: () => void
  onUpdate: (id: string, patch: Partial<ProgramItem>) => void
}

/** ProgramPanel：可编辑的测试程序表（限值、启停） */
export function ProgramPanel({ program, stopOnFirstFail, onToggleStop, onResetLimits, onUpdate }: Props) {
  const { t, locale } = useLocale()
  const [edits, setEdits] = useState<Record<string, string>>({})
  const [note, setNote] = useState<{ kind: 'ok' | 'bad'; text: string } | null>(null)

  const commit = (item: ProgramItem, field: 'lsl' | 'usl') => {
    const key = item.id + ':' + field
    const raw = edits[key]
    if (raw === undefined) return
    const text = raw.trim()
    let value: number | null = null
    if (text !== '') {
      const num = Number(text)
      if (!Number.isFinite(num)) {
        setNote({ kind: 'bad', text: t(S.program.badNumber) })
        setEdits((prev) => {
          const next = { ...prev }
          delete next[key]
          return next
        })
        return
      }
      value = num
    }
    const lsl = field === 'lsl' ? value : item.lsl
    const usl = field === 'usl' ? value : item.usl
    if (lsl !== null && usl !== null && lsl >= usl) {
      setNote({ kind: 'bad', text: t(S.program.badOrder) })
      setEdits((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
      return
    }
    onUpdate(item.id, { [field]: value })
    setEdits((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
    setNote({ kind: 'ok', text: tf(t, S.program.updated, { name: itemLabel(item.id, t) }) })
  }

  return (
    <div className="atesim-stack">
      <section className="atesim-card">
        <div className="atesim-card__head">
          <h2>{t(S.program.title)}</h2>
          <div className="atesim-actions">
            <button type="button" className="lab__btn" onClick={onToggleStop}>
              {tf(t, S.program.stopToggle, { state: t(stopOnFirstFail ? S.common.on : S.common.off) })}
            </button>
            <button type="button" className="lab__btn" onClick={onResetLimits}>
              {t(S.program.resetLimits)}
            </button>
          </div>
        </div>

        <div className="atesim-scroll">
          <table className="dtable atesim-table">
            <thead>
              <tr>
                <th>{t(S.program.colNo)}</th>
                <th>{t(S.program.colItem)}</th>
                <th>{t(S.program.colCondition)}</th>
                <th>{t(S.program.colUnit)}</th>
                <th>{t(S.program.colLsl)}</th>
                <th>{t(S.program.colUsl)}</th>
                <th>Bin</th>
                <th>{t(S.program.colTime)}</th>
                <th>{t(S.program.colOn)}</th>
              </tr>
            </thead>
            <tbody>
              {program.map((item) => {
                const lslKey = item.id + ':lsl'
                const uslKey = item.id + ':usl'
                return (
                  <tr key={item.id} className={item.enabled ? '' : 'is-off'}>
                    <td className="num">{item.order}</td>
                    <td>
                      <b>{itemLabel(item.id, t)}</b>
                      {/* 中文界面下补一行英文术语，英文界面下就重复了 */}
                      {locale === 'zh' ? <span className="atesim-sub">{item.name}</span> : null}
                    </td>
                    <td className="atesim-cond">{itemCondition(item.id, t)}</td>
                    <td className="num">{item.unit}</td>
                    <td>
                      <input
                        className="atesim-input"
                        inputMode="decimal"
                        aria-label={t(S.program.colLsl) + ' ' + itemLabel(item.id, t)}
                        value={edits[lslKey] ?? (item.lsl === null ? '' : fmtVal(item.lsl, item.digits))}
                        placeholder={t(S.common.noLimit)}
                        onChange={(e) => setEdits((prev) => ({ ...prev, [lslKey]: e.target.value }))}
                        onBlur={() => commit(item, 'lsl')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commit(item, 'lsl')
                        }}
                      />
                    </td>
                    <td>
                      <input
                        className="atesim-input"
                        inputMode="decimal"
                        aria-label={t(S.program.colUsl) + ' ' + itemLabel(item.id, t)}
                        value={edits[uslKey] ?? (item.usl === null ? '' : fmtVal(item.usl, item.digits))}
                        placeholder={t(S.common.noLimit)}
                        onChange={(e) => setEdits((prev) => ({ ...prev, [uslKey]: e.target.value }))}
                        onBlur={() => commit(item, 'usl')}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commit(item, 'usl')
                        }}
                      />
                    </td>
                    <td className="num">{item.bin}</td>
                    <td className="num">{item.timeMs} ms</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={item.enabled}
                        aria-label={t(S.program.colOn) + ' ' + itemLabel(item.id, t)}
                        onChange={(e) => onUpdate(item.id, { enabled: e.target.checked })}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="atesim-hint">{t(S.program.hint)}</p>
        {note ? (
          <p className={'atesim-note ' + (note.kind === 'bad' ? 'is-bad' : 'is-ok')}>{note.text}</p>
        ) : null}
      </section>

      <section className="atesim-card">
        <h3>{t(S.program.notesTitle)}</h3>
        <ul className="atesim-bullets">
          {S.program.notes.map((text, index) => (
            <li key={index}>{t(text)}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
