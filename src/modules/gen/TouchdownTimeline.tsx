import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Seg } from '../fund/parts'
import { touchdownS, type MsParams } from './model/multisite'
import './touchdownTimeline.css'

const VIEWS = [
  { id: 'current', label: loc('当前 Site 数', 'Current site count') },
  { id: 'best', label: loc('最低成本的 Site 数', 'Lowest-cost site count') },
] as const
const STEPS = [
  { id: 'index', label: loc('换位', 'Index') },
  { id: 'parallel', label: loc('并行', 'Parallel') },
  { id: 'serial', label: loc('逐站串行', 'Per-site serial') },
  { id: 'retest', label: loc('平均重测开销', 'Average retest overhead') },
] as const

export function TouchdownTimeline({ params, current, best }: { params: MsParams; current: number; best: number }) {
  const { t } = useLocale()
  const [view, setView] = useState<(typeof VIEWS)[number]['id']>('current')
  const n = view === 'best' ? best : current
  const td = touchdownS(params, n)
  const times = [params.indexS, params.parS, n * params.serS, td * params.retest]
  const total = td * (1 + params.retest)
  const sec = (value: number) => `${value.toFixed(3)} s`
  return (
    <figure className="term-fig touchdown-time" data-timeline-sites={n}>
      <Seg options={VIEWS} value={view} onChange={setView} />
      <div className="touchdown-time__bar" aria-hidden="true">
        {STEPS.map(({ id }, i) => (
          <div key={id} data-stage={id} style={{ flexGrow: times[i] }} hidden={times[i] === 0}>
            {id === 'serial' && times[i] > 0 && Array.from({ length: n }, (_, j) => <span key={j} />)}
          </div>
        ))}
      </div>
      <dl className="touchdown-time__legend">
        {STEPS.map(({ id, label }, i) => <div key={id} data-stage={id}>
          <dt>{t(label)}</dt>
          <dd>{id === 'serial' ? `${n} × ${sec(params.serS)} = ` : ''}{sec(times[i])}</dd>
        </div>)}
      </dl>
      <figcaption aria-live="polite">
        {t(loc(`${n} 个 Site 共享一次换位和并行测试。串行段按每个 Site 分格。重测段是许多批次摊到一轮的平均预算。含重测合计 ${sec(total)}。`,
          `${n} sites share one index and one parallel test. One cell per site represents the serial phase. The retest band is an average per touchdown across many runs. Total including retest is ${sec(total)}.`))}
      </figcaption>
    </figure>
  )
}
