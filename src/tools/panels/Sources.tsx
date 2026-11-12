import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { formatEng, parseMeasure } from '../convert'
import { Field, Outcome, Seg } from '../ui'

const MODES = [
  { id: 'series', label: loc('电压源串联', 'Voltage sources in series') },
  { id: 'parallel', label: loc('电流源并联', 'Current sources in parallel') },
]

export function SourcesTool() {
  const { t } = useLocale()
  const [mode, setMode] = useState('series')
  const [countText, setCountText] = useState('2')
  const [voltageText, setVoltageText] = useState('5')
  const [currentText, setCurrentText] = useState('0.02')
  const series = mode === 'series'
  const count = parseMeasure(countText)
  const value = parseMeasure(series ? voltageText : currentText)
  const unit = series ? 'V' : 'A'
  const total = count !== null && value !== null ? count * value : NaN
  const valid = count !== null && Number.isSafeInteger(count) && count > 0 && value !== null && value > 0 && Number.isFinite(total)
  const symbol = series ? 'V' : 'I'

  return (
    <>
      <Seg label={loc('电源连接方式', 'Source connection')} items={MODES} activeId={mode} onPick={setMode} />
      <div className="tools-circuit-layout">
        {series ? (
          <svg className="tools-schematic" viewBox="0 0 224 180" role="img" aria-label={t(loc('两只电压源同向串联示例。上方电源的负极连接下方电源的正极，输出取自两端。', 'Two series-aiding voltage sources. The upper source’s negative terminal connects to the lower source’s positive terminal. Output is taken across the outer terminals.'))}>
            <path d="M70 19v18m0 36v34m0 36v18" />
            <circle cx="70" cy="16" r="3" />
            <circle cx="70" cy="164" r="3" />
            <circle cx="70" cy="55" r="18" />
            <circle cx="70" cy="125" r="18" />
            <path d="M66 49h8m-4-4v8m-4 8h8M66 119h8m-4-4v8m-4 8h8" />
            <text x="99" y="55">V₁</text>
            <text x="99" y="125">V₂</text>
            <text x="87" y="16">+</text>
            <text x="87" y="164">−</text>
            <text x="131" y="90" className="tools-schematic__target">Vout</text>
          </svg>
        ) : (
          <svg className="tools-schematic" viewBox="0 0 224 180" role="img" aria-label={t(loc('两只电流源同向并联示例。两条支路共用上下节点，电流在上方汇合后流向负载。', 'Two parallel current sources point in the same direction. They share both nodes, and their currents combine at the upper node before flowing to the load.'))}>
            <path d="M44 72V41h129m-129 67v31h129M109 72V41m0 67v31M143 37l5 4-5 4" />
            <circle cx="44" cy="90" r="18" />
            <circle cx="109" cy="90" r="18" />
            <circle cx="176" cy="41" r="3" />
            <circle cx="176" cy="139" r="3" />
            <circle cx="109" cy="41" r="2.5" className="tools-schematic__junction" />
            <circle cx="109" cy="139" r="2.5" className="tools-schematic__junction" />
            <path d="M44 100V80m-4 5 4-5 4 5M109 100V80m-4 5 4-5 4 5" />
            <text x="69" y="90">I₁</text>
            <text x="134" y="90">I₂</text>
            <text x="132" y="23" className="tools-schematic__target">Iout</text>
          </svg>
        )}
        <div className="tools-fields">
          <Field id="tools-source-count" label={loc('相同电源的数量', 'Number of identical sources')} value={countText} onChange={setCountText} />
          {series ? (
            <Field id="tools-source-voltage" label={loc('单个电压（V）', 'Voltage per source (V)')} value={voltageText} onChange={setVoltageText} />
          ) : (
            <Field id="tools-source-current" label={loc('单个电流（A）', 'Current per source (A)')} value={currentText} onChange={setCurrentText} />
          )}
        </div>
      </div>
      <Outcome
        tone={valid ? 'ok' : 'bad'}
        text={valid
          ? loc(
              `${symbol}out = ${count} × ${formatEng(value, unit)} = ${formatEng(total, unit)}。`,
              `${symbol}out = ${count} × ${formatEng(value, unit)} = ${formatEng(total, unit)}.`,
            )
          : loc('请输入有效的电源数量和正的单源输出值。数量须为整数。', 'Enter a valid whole number of sources and a positive output per source.')}
      />
      <p className="tools-hint">
        {t(series
          ? loc('图中以两个源为例。实际串联时，电源输出须支持浮地串联，整串电流受额定电流最小的电源限制。', 'The diagram shows two sources. For real supplies, the outputs must support floating series operation. The lowest current rating limits the string.')
          : loc('图中以两个源为例。实际并联时，各源须支持并联，负载电压须落在每个电流源都能稳流的输出电压范围内。', 'The diagram shows two sources. For real supplies, each source must support parallel operation, and the load voltage must stay within every source’s compliance range.'))}
      </p>
    </>
  )
}
