import { useState, type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LabShell } from '../../lab/LabShell'
import { type ModuleId } from '../catalog'
import {
  CHAIN,
  CHIP_TYPES,
  DIAGRAM,
  TERMS,
  type ChainId,
  type DiagramId,
  type TermId,
} from './data/content'

type Module00PageProps = {
  moduleId: ModuleId
  onModuleChange: (id: ModuleId) => void
  onOpenConnection: () => void
}

type Focus =
  | { kind: 'chain'; id: ChainId }
  | { kind: 'term'; id: TermId }
  | { kind: 'chip'; id: string }
  | { kind: 'diagram'; id: DiagramId }

export function Module00Page({ moduleId, onModuleChange, onOpenConnection }: Module00PageProps) {
  const [focus, setFocus] = useState<Focus>({ kind: 'chain', id: 'cp' })
  const { t } = useLocale()
  const detail = resolveDetail(focus, t)

  return (
    <LabShell
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.m01.title)}
      goal={t(ui.m01.goal)}
      scroll
    >
      <div className="lab__body intro">
        <main className="intro__main">
          <section className="intro__section">
            <h2>{t(ui.m01.whatTitle)}</h2>
            <p>{t(ui.m01.whatBody)}</p>
          </section>

          <section className="intro__section">
            <h2>{t(ui.m01.chainTitle)}</h2>
            <div className="chain">
              {CHAIN.map((step, index) => (
                <div key={step.id} className="chain__item">
                  {index > 0 ? <div className="chain__arrow" aria-hidden="true">↓</div> : null}
                  <button
                    type="button"
                    className={`chain__node${focus.kind === 'chain' && focus.id === step.id ? ' is-active' : ''}${step.id === 'cp' || step.id === 'ft' ? ' is-test' : ''}`}
                    onClick={() => setFocus({ kind: 'chain', id: step.id })}
                  >
                    <strong>{step.title}</strong>
                    <span>{t(step.subtitle)}</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="intro__section">
            <h2>{t(ui.m01.chipsTitle)}</h2>
            <div className="chips">
              {CHIP_TYPES.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  className={`chips__card${focus.kind === 'chip' && focus.id === chip.id ? ' is-active' : ''}`}
                  onClick={() => setFocus({ kind: 'chip', id: chip.id })}
                >
                  <span className="chips__en">{chip.name}</span>
                  <strong>{t(chip.title)}</strong>
                  <span className="chips__ex">{t(chip.examples)}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="intro__section">
            <h2>{t(ui.m01.termsTitle)}</h2>
            <div className="terms">
              {TERMS.map((term) => (
                <button
                  key={term.id}
                  type="button"
                  className={`terms__item${focus.kind === 'term' && focus.id === term.id ? ' is-active' : ''}`}
                  onClick={() => setFocus({ kind: 'term', id: term.id })}
                >
                  <img src={term.image} alt="" className="terms__thumb" />
                  {term.name}
                </button>
              ))}
            </div>
          </section>

          <section className="intro__section">
            <h2>{t(ui.m01.diagramTitle)}</h2>
            <p className="intro__note">{t(ui.m01.diagramNote)}</p>
            <div className="sys">
              <DiagramBox id="program" focus={focus} onFocus={setFocus} />
              <div className="sys__arrow">↓</div>
              <div className="sys__row">
                <DiagramBox id="controller" focus={focus} onFocus={setFocus} />
                <span className="sys__link">→</span>
                <DiagramBox id="ate" focus={focus} onFocus={setFocus} />
              </div>
              <div className="sys__arrow">↓</div>
              <div className="sys__split">
                <DiagramBox id="pe" focus={focus} onFocus={setFocus} />
                <DiagramBox id="pmu" focus={focus} onFocus={setFocus} />
              </div>
              <div className="sys__arrow">↓</div>
              <DiagramBox id="loadboard" focus={focus} onFocus={setFocus} />
              <div className="sys__arrow">↓</div>
              <DiagramBox id="socket" focus={focus} onFocus={setFocus} />
              <div className="sys__arrow">↓</div>
              <DiagramBox id="dut" focus={focus} onFocus={setFocus} />
              <div className="sys__arrow">↓</div>
              <DiagramBox id="result" focus={focus} onFocus={setFocus} />
            </div>
          </section>
        </main>

        <aside className="legend intro__aside">
          <h2>{detail.kicker}</h2>
          <p className="legend__path-title">{detail.title}</p>
          <p className="legend__hint">{detail.text}</p>
          {detail.extra}
          <button type="button" className="lab__btn lab__btn--primary" onClick={onOpenConnection}>
            {t(ui.m01.next)}
          </button>
        </aside>
      </div>
    </LabShell>
  )
}

function DiagramBox({
  id,
  focus,
  onFocus,
}: {
  id: DiagramId
  focus: Focus
  onFocus: (focus: Focus) => void
}) {
  const item = DIAGRAM.find((node) => node.id === id)
  if (!item) return null
  return (
    <button
      type="button"
      className={`sys__box${focus.kind === 'diagram' && focus.id === id ? ' is-active' : ''}`}
      onClick={() => onFocus({ kind: 'diagram', id })}
    >
      {item.title}
    </button>
  )
}

function resolveDetail(
  focus: Focus,
  t: (text: LText | string) => string,
): {
  kicker: string
  title: string
  text: string
  extra?: ReactNode
} {
  if (focus.kind === 'chain') {
    const step = CHAIN.find((item) => item.id === focus.id)
    return { kicker: t(ui.m01.kickerChain), title: step?.title ?? '', text: step ? t(step.text) : '' }
  }
  if (focus.kind === 'term') {
    const term = TERMS.find((item) => item.id === focus.id)
    return {
      kicker: t(ui.m01.kickerTerm),
      title: term ? `${term.name} · ${t(term.full)}` : '',
      text: term ? t(term.text) : '',
      extra: term ? (
        <figure className="glossary-fig">
          <img src={term.image} alt={t(term.caption)} />
          <figcaption>
            {t(term.caption)}
            <span>{t(term.credit)}</span>
          </figcaption>
        </figure>
      ) : null,
    }
  }
  if (focus.kind === 'chip') {
    const chip = CHIP_TYPES.find((item) => item.id === focus.id)
    if (!chip) return { kicker: t(ui.m01.kickerChip), title: '', text: '' }
    return {
      kicker: t(ui.m01.kickerChip),
      title: `${chip.name} · ${t(chip.title)}`,
      text: t(chip.theory),
      extra: (
        <div>
          <p className="legend__hint">{t(ui.m01.chipParams)}</p>
          <ul>
            {chip.params.map((param) => (
              <li key={t(param)}>{t(param)}</li>
            ))}
          </ul>
        </div>
      ),
    }
  }
  const node = DIAGRAM.find((item) => item.id === focus.id)
  return {
    kicker: t(ui.m01.kickerDiagram),
    title: node?.title ?? '',
    text: node ? t(node.text) : '',
  }
}
