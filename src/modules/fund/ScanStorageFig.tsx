import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import './scanStorageFig.css'

const PATTERN = [
  { id: 'b0', value: 1 }, { id: 'b1', value: 1 }, { id: 'b2', value: 0 }, { id: 'b3', value: 1 },
]
const STREAM = [...PATTERN].reverse()

export function ScanStorageFig() {
  const { t } = useLocale()
  const [clocks, setClocks] = useState(0)
  const loaded = STREAM.slice(0, clocks).reverse()
  const newest = loaded[0]
  return (
    <figure className="term-fig scan-storage" data-shift-clocks={clocks}>
      <div className="scan-storage__views">
        <div>
          <strong>{t(loc('并行管脚存储 · 同一拍', 'Per-pin memory · one cycle'))}</strong>
          <ol className="scan-storage__bits">
            {PATTERN.map((bit, i) => <li key={bit.id}>
              <span>{`Pin ${i + 1}`}</span><code>{bit.id} = {bit.value}</code>
            </li>)}
          </ol>
        </div>
        <div>
          <strong>{t(loc('Scan 串行存储 · 从左送入', 'Serial Scan memory · shift in from left'))}</strong>
          <ol className="scan-storage__bits" aria-label={t(loc('移入顺序', 'Shift order'))}>
            {STREAM.map((bit, i) => <li key={bit.id} data-reached={i < clocks} data-new={i === clocks - 1}>
              <span>{`CLK ${i + 1}`}</span><code>{bit.id} = {bit.value}</code>
            </li>)}
          </ol>
          <ol className="scan-storage__bits" data-scan-registers aria-label={t(loc('当前触发器内容', 'Current register contents'))}>
            {PATTERN.map(({ id }, i) => <li key={id} data-new={i === 0 && !!newest}>
              <span>{`FF${i + 1}`}</span><code>{loaded[i] ? `${loaded[i].id} = ${loaded[i].value}` : '—'}</code>
            </li>)}
          </ol>
        </div>
      </div>
      <div className="row-actions">
        <button type="button" className="lab__btn lab__btn--primary" disabled={clocks >= STREAM.length}
          onClick={() => setClocks(clocks + 1)}>{t(loc('移入一位', 'Shift one bit'))}</button>
        <button type="button" className="lab__btn" disabled={clocks === 0}
          onClick={() => setClocks(0)}>{t(loc('清空示例', 'Clear example'))}</button>
      </div>
      <figcaption aria-live="polite">
        {t(clocks === STREAM.length
          ? loc('四拍结束，FF1–FF4 中的位序与左侧并行目标一致。', 'After four clocks, FF1–FF4 match the parallel target order.')
          : newest ? loc(`第 ${clocks} 拍把 ${newest.id} 移进 FF1，前一拍的位各右移一级。`, `Clock ${clocks} shifts ${newest.id} into FF1 and moves the earlier bits one cell to the right.`)
            : loc('为使最先进入的位最终落到 FF4，串行文件先送 b3，再送 b2、b1、b0。', 'To put the first bit into FF4 at the end, serial memory sends b3 first, followed by b2, b1 and b0.'))}
      </figcaption>
    </figure>
  )
}
