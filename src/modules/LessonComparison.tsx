import { useLocale } from '../i18n/LocaleContext'
import type { LText } from '../i18n/locale'

export type LessonComparisonData = {
  title: LText
  columns: readonly LText[]
  rows: readonly (readonly (LText | string)[])[]
  note?: LText
  source?: { label: string; href: string }
}

export function LessonComparison({ title, columns, rows, note, source }: LessonComparisonData) {
  const { t } = useLocale()
  const display = (cell: LText | string) => typeof cell === 'string' ? cell : t(cell)
  return (
    <div>
      <div style={{ overflowX: 'auto' }} tabIndex={0} role="region" aria-label={t(title)}>
        <table className="dtable">
          <caption>{t(title)}</caption>
          <thead>
            <tr>{columns.map((cell) => <th key={cell.en} scope="col">{t(cell)}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map(([heading, ...cells]) => (
              <tr key={display(heading)}>
                <th scope="row">{display(heading)}</th>
                {cells.map((cell, index) => <td key={columns[index + 1].en}>{display(cell)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {note && <p className="intro__note">{t(note)}</p>}
      {source && <p className="intro__note"><a href={source.href}>{source.label}</a></p>}
    </div>
  )
}
