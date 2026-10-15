import { useState } from 'react'
import { LessonRefText } from '../../home/LessonRefText'
import { useLocale } from '../../i18n/LocaleContext'
import { Section } from '../../lab/LessonFrame'
import { Callout, Cards } from '../fund/parts'
import { Related } from '../prep/common'
import { S } from './data/pcbDfm'
import { GERBER, PROJECTS, SHEET, type LayerId, type ProjectId } from './data/pcbDfmCap'
import { CASES } from './data/pcbDfmErrors'
import { joinText, M } from './data/pcbDfmMore'
import { CaseFig, GerberFig } from './DfmFigs'
import { Meter, type Common } from './PcbDfmSections'

// Cards 要求有 text 字段，这里只用来选中，不显示
const CASE_CARDS = CASES.map((c) => ({ id: c.id, title: c.title, sub: c.sub, text: c.root }))
const PROJECT_CARDS = PROJECTS.map((p) => ({ id: p.id, title: p.title, sub: p.sub, text: p.sub }))

export function CaseSection({ onOpen, setNote }: Common) {
  const { t } = useLocale()
  const [id, setId] = useState<string>(CASES[0].id)
  const item = CASES.find((c) => c.id === id) ?? CASES[0]
  return (
    <Section title={t(S.caseTitle)} note={t(S.caseNote)}>
      <Cards
        items={CASE_CARDS}
        activeId={id}
        cols={4}
        onPick={(card) => {
          const c = CASES.find((x) => x.id === card.id) ?? CASES[0]
          setId(c.id)
          setNote({ kicker: S.kickerCase, title: c.title, text: joinText([c.root, c.repair]) })
        }}
      />
      <CaseFig item={item} />
      <Callout>
        <p>
          <b>{t(item.title)}</b>
        </p>
        <dl className="pcbDfm-detail">
          <dt>{t(S.symptom)}</dt>
          <dd>{t(item.symptom)}</dd>
          <dt>{t(S.root)}</dt>
          <dd>{t(item.root)}</dd>
          <dt>{t(S.repair)}</dt>
          <dd>{t(item.repair)}</dd>
          <dt>{t(S.prevent)}</dt>
          <dd>
            <LessonRefText text={item.prevent} onOpenLesson={onOpen} />
          </dd>
        </dl>
      </Callout>
      <Related ids={['pcbFlow', 'pcbStack', 'pcbSupply', 'fOpens', 'pmu']} onOpen={onOpen} />
    </Section>
  )
}

export function CapstoneSection({ onOpen, setNote }: Common) {
  const { t } = useLocale()
  const [project, setProject] = useState<ProjectId>(PROJECTS[0].id)
  const [layer, setLayer] = useState<LayerId>(GERBER[0].id)
  const [ticked, setTicked] = useState<string[]>([])
  const proj = PROJECTS.find((p) => p.id === project) ?? PROJECTS[0]
  const gerber = GERBER.find((g) => g.id === layer) ?? GERBER[0]
  const total = SHEET.reduce((sum, g) => sum + g.items.length, 0)
  const open = SHEET.map((g) => ({ group: g, left: g.items.filter((i) => !ticked.includes(i.id)) })).filter((x) => x.left.length > 0)

  const pickLayer = (id: LayerId) => {
    const g = GERBER.find((x) => x.id === id)
    setLayer(id)
    if (g) {
      setNote({ kicker: S.kickerLayer, title: g.name, text: g.text })
    }
  }
  const toggle = (id: string) => {
    setTicked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
    if (GERBER.some((g) => g.id === id)) {
      pickLayer(id as LayerId)
    }
  }

  return (
    <Section title={t(S.capTitle)} note={t(S.capNote)}>
      <Cards
        items={PROJECT_CARDS}
        activeId={project}
        cols={2}
        onPick={(card) => {
          const p = PROJECTS.find((x) => x.id === card.id) ?? PROJECTS[0]
          setProject(p.id)
          setNote({ kicker: S.kickerCap, title: p.title, text: p.blocks[0] })
        }}
      />
      <Callout>
        <p>
          <b>{t(S.capMust)}</b>
        </p>
        <ul>
          {proj.blocks.map((b) => (
            <li key={b.zh}>{t(b)}</li>
          ))}
        </ul>
      </Callout>
      <GerberFig active={layer} ticked={new Set(ticked)} onPick={pickLayer} />
      <Callout>
        <p>
          <b>{t(S.layerIs)}</b>
          {`${gerber.ext} · ${t(gerber.name)}`}
        </p>
        <p>{t(gerber.text)}</p>
      </Callout>

      <h3>{t(S.sheetTitle)}</h3>
      <div className="pcbDfm-actions">
        <span className="pcbDfm-found">
          {t(M.progress)} <b>{`${ticked.length} / ${total}`}</b>
        </span>
        <button type="button" className="lab__btn" onClick={() => setTicked(SHEET.flatMap((g) => g.items.map((i) => i.id)))}>
          {t(M.tickAll)}
        </button>
        <button type="button" className="lab__btn" onClick={() => setTicked([])}>
          {t(M.clearChecks)}
        </button>
      </div>
      <Meter done={ticked.length} total={total} label={t(M.progress)} />
      {SHEET.map((g) => (
        <div key={g.id} className="pcbDfm-group">
          <h3>{t(g.title)}</h3>
          {g.items.map((item) => {
            const on = ticked.includes(item.id)
            return (
              <label key={item.id} className={`pcbDfm-check${on ? ' is-on' : ''}`}>
                <input type="checkbox" checked={on} onChange={() => toggle(item.id)} />
                <span>{t(item.text)}</span>
              </label>
            )
          })}
        </div>
      ))}
      <Callout tone={open.length === 0 ? 'ok' : 'warn'}>
        {open.length === 0 ? (
          <p>{t(S.allDone)}</p>
        ) : (
          <>
            <p>
              <b>{t(S.missingTitle)}</b>
            </p>
            <ul className="pcbDfm-missing">
              {open.map((x) => (
                <li key={x.group.id}>
                  <b>{t(x.group.title)}</b>
                  {' → '}
                  {x.left.map((i) => t(i.text)).join(' / ')}
                </li>
              ))}
            </ul>
          </>
        )}
      </Callout>
      <Related ids={['pcbFlow', 'pcbBasics', 'pcbTools', 'pcbFab', 'pcbSupply', 'fProgram', 'connection']} onOpen={onOpen} />
    </Section>
  )
}
