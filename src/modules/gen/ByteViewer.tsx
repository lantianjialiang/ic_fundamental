import { Fragment, useMemo } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { S } from './genStdfData'
import { type ParsedField, type ParseResult } from './model/stdf'

type Props = {
  bytes: Uint8Array
  parsed: ParseResult
  /** 当前选中字段的 id（即 parsed.fields 的下标） */
  selected: number | null
  onPick: (field: ParsedField) => void
}

const hex2 = (n: number) => n.toString(16).toUpperCase().padStart(2, '0')
const hex4 = (n: number) => n.toString(16).toUpperCase().padStart(4, '0')

function fmtValue(field: ParsedField): string {
  const v = field.value
  if (typeof v === 'string') {
    return `"${v}"`
  }
  if (field.type === 'R4') {
    return String(Number(v.toPrecision(7)))
  }
  if (field.type === 'raw') {
    return `${v} B`
  }
  return String(v)
}

/** 字节浏览器：十六进制与字段表互相联动。点字节选中所在字段，点字段高亮它占用的字节。 */
export function ByteViewer({ bytes, parsed, selected, onPick }: Props) {
  const { t } = useLocale()

  const owner = useMemo(() => {
    const map = new Int32Array(bytes.length).fill(-1)
    for (const field of parsed.fields) {
      for (let i = field.offset; i < field.offset + field.size && i < map.length; i++) {
        map[i] = field.id
      }
    }
    return map
  }, [bytes, parsed])

  const selectedField = selected !== null ? parsed.fields[selected] : undefined
  const selRecord = selectedField ? selectedField.record : -1
  const rowStarts: number[] = []
  for (let start = 0; start < bytes.length; start += 16) {
    rowStarts.push(start)
  }

  const detect = parsed.le === true ? t(S.detectLE) : parsed.le === false ? t(S.detectBE) : t(S.detectNone)

  return (
    <div className="gen-bytes-wrap">
      <p className="gen-bytes__detect">
        <b>{t(S.detectLabel)}</b>
        <span>{detect}</span>
      </p>
      <div className="gen-bytes" role="group">
        {rowStarts.map((start) => {
          const end = Math.min(start + 16, bytes.length)
          const cells: number[] = []
          for (let i = start; i < end; i++) {
            cells.push(i)
          }
          return (
            <div className="gen-bytes__row" key={start}>
              <span className="gen-bytes__off">{hex4(start)}</span>
              {cells.map((i) => {
                const fid = owner[i]
                const field = fid >= 0 ? parsed.fields[fid] : undefined
                const isSel = field !== undefined && fid === selected
                const isRec = field !== undefined && !isSel && field.record === selRecord
                const cls = `gen-bytes__byte${isSel ? ' is-sel' : ''}${isRec ? ' is-rec' : ''}`
                return (
                  <button
                    key={i}
                    type="button"
                    className={cls}
                    aria-label={`${hex4(i)} ${hex2(bytes[i])} ${field ? field.name : ''}`}
                    aria-pressed={isSel}
                    onClick={() => {
                      if (field) {
                        onPick(field)
                      }
                    }}
                  >
                    {hex2(bytes[i])}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>

      <div className="gen-fields">
        <table>
          <thead>
            <tr>
              <th>{t(S.colOffset)}</th>
              <th>{t(S.colField)}</th>
              <th>{t(S.colType)}</th>
              <th>{t(S.colValue)}</th>
            </tr>
          </thead>
          <tbody>
            {parsed.records.map((rec) => (
              <Fragment key={rec.index}>
                <tr className="gen-fields__rec">
                  <th colSpan={4}>{`#${rec.index + 1} ${rec.name} @${hex4(rec.offset)} · ${rec.length + 4} B`}</th>
                </tr>
                {rec.fields.map((field) => (
                  <tr key={field.id} className={field.id === selected ? 'is-sel' : field.record === selRecord ? 'is-rec' : ''}>
                    <td>
                      <button type="button" className="gen-fields__pick" onClick={() => onPick(field)}>
                        {hex4(field.offset)}
                      </button>
                    </td>
                    <td>{field.name}</td>
                    <td>{field.type}</td>
                    <td>{fmtValue(field)}</td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
