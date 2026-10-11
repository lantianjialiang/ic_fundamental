import { useLocale } from '../../../i18n/LocaleContext'
import {
  CHANNEL_COUNT,
  LAYERS,
  PHASES,
  STATIC_POSE,
  buildHops,
  contactFor,
  padIndexFor,
  type ContactPhase,
  type HopId,
  type LayerId,
  type Pkg,
  type ProbeType,
  type TestFlow,
} from '../data/layout'
import { HOP_TEXT, LAYER_TEXT, PHASE_TEXT, T } from '../data/text'

type LegendPanelProps = {
  flow: TestFlow
  pkg: Pkg
  probe: ProbeType
  selected: number | null
  onSelect: (channel: number | null) => void
  focus: LayerId | null
  onFocus: (id: LayerId) => void
  phase: ContactPhase
}

export function LegendPanel({ flow, pkg, probe, selected, onSelect, focus, onFocus, phase }: LegendPanelProps) {
  const { t } = useLocale()
  const phases = PHASES[flow]
  const phaseIndex = phases.indexOf(phase)

  const endpoint = (ch: number) => {
    if (flow === 'CP') return t(HOP_TEXT.diePad).replace('{name}', `P${padIndexFor(ch) + 1}`)
    const c = contactFor(pkg, ch)
    return t(pkg === 'BGA' ? HOP_TEXT.dutBall : HOP_TEXT.dutLead).replace('{name}', c.name)
  }

  const hopLabel = (id: HopId, ch: number): string => {
    switch (id) {
      case 'pe':
        return `${t(HOP_TEXT.pe)} · CH${ch + 1}`
      case 'cardEdge':
        return t(HOP_TEXT.cardEdge)
      case 'pogoTower':
        return t(HOP_TEXT.pogoTower)
      case 'lbBottom':
        return t(HOP_TEXT.lbBottom)
      case 'via1':
        return t(flow === 'FT' ? HOP_TEXT.ftVia1 : HOP_TEXT.cpVia1)
      case 'inner':
        return t(HOP_TEXT.inner)
      case 'via2':
        return t(flow === 'FT' ? HOP_TEXT.ftVia2 : HOP_TEXT.cpVia2)
      case 'lbTop':
        return t(HOP_TEXT.lbTop)
      case 'socketPin':
        return t(HOP_TEXT.socketPin)
      case 'dutTerm':
      case 'diePad':
        return endpoint(ch)
      case 'dutDie':
        return t(HOP_TEXT.dutDie)
      case 'pcTop':
        return t(HOP_TEXT.pcTop)
      case 'st':
        return t(HOP_TEXT.st)
      case 'needle':
        return t(probe === 'cantilever' ? HOP_TEXT.needleCantilever : HOP_TEXT.needleVertical)
    }
  }

  const hops = selected === null ? [] : buildHops(flow, pkg, probe, selected, STATIC_POSE[flow])

  return (
    <aside className="legend m01-legend">
      <h2>{t(T.layersTitle)}</h2>
      <p className="legend__hint">{t(T.layersHint)}</p>
      <ol className="m01-layers">
        {LAYERS[flow].map((id) => {
          const text = LAYER_TEXT[flow][id]
          if (!text) return null
          const active = focus === id
          return (
            <li key={id}>
              <button
                type="button"
                className={`m01-layers__btn${active ? ' is-active' : ''}`}
                aria-pressed={active}
                onClick={() => onFocus(id)}
              >
                <span className="m01-layers__name">{t(text.name)}</span>
                <span className="m01-layers__desc">{t(text.desc)}</span>
              </button>
            </li>
          )
        })}
      </ol>
      <p className="m01-note">{t(T.scaleNote)}</p>

      <h2>{t(T.phaseTitle)}</h2>
      {phase === 'idle' ? <p className="legend__hint">{t(T.phaseIdle)}</p> : null}
      <ol className="m01-phases">
        {phases.map((p, i) => (
          <li key={p} className={i === phaseIndex ? 'is-active' : phaseIndex > i ? 'is-done' : undefined}>
            {t(PHASE_TEXT[p])}
          </li>
        ))}
      </ol>

      <h2>{t(T.channelsTitle)}</h2>
      <div className="m01-channels" role="group" aria-label={t(T.channelsTitle)}>
        {Array.from({ length: CHANNEL_COUNT }, (_, ch) => (
          <button
            key={ch}
            type="button"
            className={`m01-channels__btn${selected === ch ? ' is-active' : ''}`}
            aria-pressed={selected === ch}
            onClick={() => onSelect(selected === ch ? null : ch)}
          >
            {`CH${ch + 1}`}
          </button>
        ))}
      </div>

      <h2>{t(T.pathTitle)}</h2>
      {selected !== null ? (
        <div className="legend__path">
          <p className="legend__path-title">{`CH${selected + 1} → ${endpoint(selected)}`}</p>
          <ol>
            {hops.map((hop, i) => (
              <li key={`${hop.id}-${i}`}>{hopLabel(hop.id, selected)}</li>
            ))}
          </ol>
          <button type="button" className="lab__btn" onClick={() => onSelect(null)}>
            {t(T.clear)}
          </button>
        </div>
      ) : (
        <p className="legend__hint">{t(T.noChannel)}</p>
      )}
      <p className="m01-note">{t(T.pulseLegend)}</p>

      <h2>{t(T.pcbTitle)}</h2>
      <p className="legend__hint">{t(T.pcbText)}</p>
    </aside>
  )
}
