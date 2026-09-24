import { useState, type ReactNode } from 'react'
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

  const detail = resolveDetail(focus)

  return (
    <LabShell
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title="Module 01 — What is semiconductor test?"
      goal="先建立产业链和测试概念。现在不讲 Timing、Strobe 和仪器细节。"
      scroll
    >
      <div className="lab__body intro">
        <main className="intro__main">
          <section className="intro__section">
            <h2>半导体测试到底在干什么？</h2>
            <p>
              芯片从晶圆到出货，每一步都可能做出失效器件。测试不是把芯片修好，而是用 ATE
              自动判断每一颗 DUT 能不能进入下一道工序或出货。不同芯片（数字、模拟、Memory、RF）要测的参数不同，后面要学的理论也不同。
            </p>
          </section>

          <section className="intro__section">
            <h2>产业链里的测试位置</h2>
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
                    <span>{step.subtitle}</span>
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="intro__section">
            <h2>不同芯片，测试不一样</h2>
            <div className="chips">
              {CHIP_TYPES.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  className={`chips__card${focus.kind === 'chip' && focus.id === chip.id ? ' is-active' : ''}`}
                  onClick={() => setFocus({ kind: 'chip', id: chip.id })}
                >
                  <span className="chips__en">{chip.name}</span>
                  <strong>{chip.title}</strong>
                  <span className="chips__ex">{chip.examples}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="intro__section">
            <h2>必须先认识的词</h2>
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
            <h2>最重要的一张图</h2>
            <p className="intro__note">点击方块看一句话。Pin Electronics / PMU 只放位置，不讲原理。</p>
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
            下一课：DUT 如何接到 ATE
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

function resolveDetail(focus: Focus): {
  kicker: string
  title: string
  text: string
  extra?: ReactNode
} {
  if (focus.kind === 'chain') {
    const step = CHAIN.find((item) => item.id === focus.id)
    return { kicker: '产业链', title: step?.title ?? '', text: step?.text ?? '' }
  }
  if (focus.kind === 'term') {
    const term = TERMS.find((item) => item.id === focus.id)
    return {
      kicker: '术语',
      title: term ? `${term.name} · ${term.full}` : '',
      text: term?.text ?? '',
      extra: term ? (
        <figure className="glossary-fig">
          <img src={term.image} alt={term.caption} />
          <figcaption>
            {term.caption}
            <span>{term.credit}</span>
          </figcaption>
        </figure>
      ) : null,
    }
  }
  if (focus.kind === 'chip') {
    const chip = CHIP_TYPES.find((item) => item.id === focus.id)
    if (!chip) return { kicker: '芯片类型', title: '', text: '' }
    return {
      kicker: '芯片类型',
      title: `${chip.name} · ${chip.title}`,
      text: chip.theory,
      extra: (
        <div>
          <p className="legend__hint">典型参数（先混个脸熟）：</p>
          <ul>
            {chip.params.map((param) => (
              <li key={param}>{param}</li>
            ))}
          </ul>
        </div>
      ),
    }
  }
  const node = DIAGRAM.find((item) => item.id === focus.id)
  return { kicker: '系统框图', title: node?.title ?? '', text: node?.text ?? '' }
}
