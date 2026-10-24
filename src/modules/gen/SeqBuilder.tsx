import { useLocale } from '../../i18n/LocaleContext'
import { DUT_LABEL, ISSUE_TEXT, S } from './genStdfData'
import { type DutKey, type ValidationIssue } from './model/stdf'

type Props = {
  order: DutKey[]
  prrBin: number
  issues: ValidationIssue[]
  onMove: (index: number, delta: -1 | 1) => void
  onBin: (bin: number) => void
}

const BIN_CHOICES = [1, 2, 3, 4]

/** 记录组装：上移 / 下移排顺序；PRR 行里可以改 HARD_BIN；下方列出校验器的问题 */
export function SeqBuilder({ order, prrBin, issues, onMove, onBin }: Props) {
  const { t } = useLocale()
  return (
    <div className="gen-seq">
      <ol className="gen-seq__list">
        {order.map((key, index) => (
          <li key={key} className="gen-seq__item">
            <span className="gen-seq__no">{index + 1}</span>
            <span className="gen-seq__name">{t(DUT_LABEL[key])}</span>
            {key === 'PRR' ? (
              <label className="gen-seq__bin">
                <span>{t(S.binLabel)}</span>
                <select value={prrBin} aria-label={t(S.binLabel)} onChange={(event) => onBin(Number(event.target.value))}>
                  {BIN_CHOICES.map((bin) => (
                    <option key={bin} value={bin}>
                      {bin}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <span className="gen-seq__move">
              <button type="button" className="lab__btn" disabled={index === 0} onClick={() => onMove(index, -1)}>
                {t(S.moveUp)}
              </button>
              <button type="button" className="lab__btn" disabled={index === order.length - 1} onClick={() => onMove(index, 1)}>
                {t(S.moveDown)}
              </button>
            </span>
          </li>
        ))}
      </ol>
      {issues.length > 0 ? (
        <ul className="gen-seq__issues">
          {issues.map((issue, i) => (
            <li key={`${issue.code}-${i}`}>
              {t(S.issueLine).replace('{n}', String(issue.index + 1)).replace('{msg}', t(ISSUE_TEXT[issue.code]))}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
