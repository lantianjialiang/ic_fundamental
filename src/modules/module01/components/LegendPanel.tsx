import { useLocale } from '../../../i18n/LocaleContext'
import { type LText } from '../../../i18n/locale'
import { ui } from '../../../i18n/ui'
import { type TestFlow } from '../data/layout'
import { ballName, buildSignalPath, type PathHopId } from '../data/paths'

type LegendPanelProps = {
  flow: TestFlow
  selectedChannel: number | null
  onSelect: (channel: number | null) => void
}

export function LegendPanel({ flow, selectedChannel, onSelect }: LegendPanelProps) {
  const { t } = useLocale()
  const layers =
    flow === 'FT'
      ? [t(ui.m02.layerDut), 'Socket', 'Load Board', 'ATE']
      : ['ATE', 'Probe Card', t(ui.m02.layerNeedles), t(ui.m02.layerWafer)]
  const path = selectedChannel !== null ? buildSignalPath(flow, selectedChannel, 1) : null

  return (
    <aside className="legend">
      <h2>{t(ui.m02.legend)}</h2>
      <p className="legend__hint">{t(ui.m02.legendHint)}</p>
      <ol className="legend__layers">
        {layers.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ol>

      <h2>{t(ui.m02.pcbTitle)}</h2>
      <ul className="legend__layers">
        <li>{t(ui.m02.pcbTop)}</li>
        <li>{t(ui.m02.pcbInner)}</li>
        <li>{t(ui.m02.pcbBottom)}</li>
        <li>{t(ui.m02.pcbVia)}</li>
      </ul>

      <h2>{t(ui.m02.pathTitle)}</h2>
      {path ? (
        <div className="legend__path">
          <p className="legend__path-title">
            CH{path.channel + 1}
            {flow === 'FT' ? ` → ${ballName(path.channel)}` : ` → ${t(ui.m02.diePad)}`}
          </p>
          <ol>
            {path.hopIds.map((id, index) => (
              <li key={`${id}-${index}`}>{hopLabel(id, path.channel, ballName(path.channel), t)}</li>
            ))}
          </ol>
          <button type="button" className="lab__btn" onClick={() => onSelect(null)}>
            {t(ui.m02.clear)}
          </button>
        </div>
      ) : (
        <p className="legend__hint">{t(ui.m02.noChannel)}</p>
      )}
    </aside>
  )
}

function hopLabel(
  id: PathHopId,
  channel: number,
  ball: string,
  t: (text: LText | string) => string,
): string {
  const n = channel + 1
  switch (id) {
    case 'ateCh':
      return `${t(ui.hop.ateCh)} ${n}`
    case 'lbBottom':
      return t(ui.hop.lbBottom)
    case 'via1':
      return `${t(ui.hop.via)} 1`
    case 'inner':
      return t(ui.hop.inner)
    case 'via2':
      return `${t(ui.hop.via)} 2`
    case 'lbTop':
      return `${t(ui.hop.lbTop)} ${ball}`
    case 'socketPin':
      return t(ui.hop.socketPin)
    case 'socketContact':
      return t(ui.hop.socketContact)
    case 'dutBall':
      return `${t(ui.hop.dutBall)} ${ball}`
    case 'pcTop':
      return t(ui.hop.pcTop)
    case 'pcBottom':
      return t(ui.hop.pcBottom)
    case 'needleContact':
      return t(ui.hop.needleContact)
    case 'needleTip':
      return t(ui.hop.needleTip)
    case 'diePad':
      return t(ui.hop.diePad)
  }
}
