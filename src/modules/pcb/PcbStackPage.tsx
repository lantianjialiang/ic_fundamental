import { useState } from 'react'
import { LessonRefText } from '../../home/LessonRefText'
import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { Callout, Cards, Knob, Seg } from '../fund/parts'
import { RefP, RefParas, Related, type PrepNote } from '../prep/common'
import { INTRO, S, TAKEAWAY, WHY } from './data/pcbStack'
import { QUIZ } from './data/pcbStackQuiz'
import {
  costIndex,
  countKind,
  dielectricKinds,
  KIND_COLOR,
  KIND_LABEL,
  layerPos,
  spanText,
  STACKS,
  VIA_COLOR,
  VIA_IDS,
  VIA_NAME,
  viaSpan,
  type StackDef,
  type ViaId,
} from './data/pcbStackModel'
import { TERMS, VIAS } from './data/pcbStackVia'
import { PCB_META } from './meta'
import { ViaFig } from './StackFigs'
import { TermFig } from './StackFigs2'
import { StackScene, type SceneVia } from './StackScene'
import '../prep/prep.css'
import './pcbStack.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }
type Focus = 'why' | 'stack' | 'via' | 'term'

function Line({ label, text, onOpen }: { label: LText; text: LText; onOpen: (id: ModuleId) => void }) {
  const { t } = useLocale()
  return (
    <p>
      <b>{t(label)}</b>
      <LessonRefText text={text} onOpenLesson={onOpen} />
    </p>
  )
}

function WhyTable() {
  const { t } = useLocale()
  const rows: StackDef[] = STACKS.filter((s) => s.id !== 'l4g')
  return (
    <>
      <div className="prep-table-wrap">
        <table className="prep-table">
          <thead>
            <tr>
              <th>{t(S.tableLayers)}</th>
              <th>{t(S.tableSig)}</th>
              <th>{t(S.tablePlane)}</th>
              <th>{t(S.tableCost)}</th>
              <th>{t(S.tableUse)}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>
                  <b>{row.count}</b>
                </td>
                <td>{countKind(row.layers, 'sig')}</td>
                <td>{row.layers.length - countKind(row.layers, 'sig')}</td>
                <td>{`× ${costIndex(row.count).toFixed(1)}`}</td>
                <td>{t(row.use)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="pcbStack-cap">{t(S.tableCap)}</p>
    </>
  )
}

export function PcbStackPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [focus, setFocus] = useState<Focus>('why')
  const [whyId, setWhyId] = useState(WHY[0].id)
  const [stackId, setStackId] = useState(STACKS[0].id)
  const [explode, setExplode] = useState(50)
  const [viaOn, setViaOn] = useState<Record<ViaId, boolean>>({ through: false, blind: false, buried: false, micro: false, [VIA_IDS[0]]: true })
  const [viaCard, setViaCard] = useState(VIAS[0].id)
  const [termId, setTermId] = useState(TERMS[0].id)

  const why = WHY.find((w) => w.id === whyId) ?? WHY[0]
  const stack = STACKS.find((s) => s.id === stackId) ?? STACKS[0]
  const via = VIAS.find((v) => v.id === viaCard) ?? VIAS[0]
  const term = TERMS.find((x) => x.id === termId) ?? TERMS[0]
  const count = stack.count

  const notes: Record<Focus, PrepNote> = {
    why: { kicker: S.kickerWhy, title: why.title, text: why.text },
    stack: { kicker: S.kickerStack, title: stack.title, text: stack.text },
    via: { kicker: S.kickerVia, title: via.title, text: via.text },
    term: { kicker: S.kickerTerm, title: term.title, text: term.text },
  }
  const shown = notes[focus]

  const sceneLayers = stack.layers.map((kind, i) => {
    const pos = layerPos(i, count)
    return { kind, label: `L${i + 1}${pos ? ` ${t(pos)}` : ''} · ${t(KIND_LABEL[kind])}` }
  })
  const sceneVias: SceneVia[] = []
  for (const id of VIA_IDS) {
    const span = viaSpan(id, count)
    if (span && viaOn[id]) {
      sceneVias.push({ id, from: span[0], to: span[1], label: `${t(VIA_NAME[id])} ${spanText(span)}` })
    }
  }
  const diel = dielectricKinds(count)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PCB_META.pcbStack.title)}
      goal={t(PCB_META.pcbStack.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="pcbFab"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.whyTitle)} note={t(S.whyNote)}>
        <Cards
          items={WHY}
          activeId={whyId}
          cols={4}
          onPick={(item) => {
            setWhyId(item.id as typeof whyId)
            setFocus('why')
          }}
        />
        <Callout>
          <p>
            <b>{t(why.title)}</b>
          </p>
          <RefP text={why.text} onOpen={onModuleChange} />
        </Callout>
        <WhyTable />
        <Related ids={['pcbMaterial', 'pcbFab', 'pcbBasics']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.stackTitle)} note={t(S.stackNote)}>
        <Seg
          options={STACKS.map((s) => ({ id: s.id, label: s.short }))}
          value={stackId}
          onChange={(id) => {
            setStackId(id)
            setFocus('stack')
          }}
        />
        <div className="pcbStack-ctl">
          <div className="knob-row">
            <Knob
              label={S.explode}
              value={explode}
              unit="%"
              min={0}
              max={100}
              step={5}
              onChange={(value) => {
                setExplode(value)
                setFocus('stack')
              }}
            />
          </div>
        </div>
        <div className="pcbStack-vias">
          <span>{t(S.viaToggles)}</span>
          {VIA_IDS.map((id) => {
            const span = viaSpan(id, count)
            return (
              <label key={id} className={span ? '' : 'is-off'}>
                <input
                  type="checkbox"
                  checked={Boolean(span) && viaOn[id]}
                  disabled={!span}
                  onChange={(event) => {
                    setViaOn({ ...viaOn, [id]: event.target.checked })
                    setFocus('stack')
                  }}
                />
                <i style={{ background: VIA_COLOR[id] }} />
                {t(VIA_NAME[id])}
                {span ? <small>{spanText(span)}</small> : <small>{t(S.unavailable)}</small>}
              </label>
            )
          })}
        </div>
        <StackScene layers={sceneLayers} vias={sceneVias} explode={explode / 100} ariaLabel={t(S.viewAria)} fallback={t(S.noGl)} />
        <Callout>
          <p>
            <b>{t(stack.title)}</b>
          </p>
          <ul className="pcbStack-layers" aria-label={t(S.layerList)}>
            {stack.layers.map((kind, i) => (
              <li key={i} style={{ borderLeftColor: KIND_COLOR[kind] }}>
                {`L${i + 1} · ${t(KIND_LABEL[kind])}`}
              </li>
            ))}
          </ul>
          <p>
            <b>{t(S.dielLabel)}</b>
            {diel.map((d) => t(d === 'core' ? S.coreWord : S.ppWord)).join(' / ')}
          </p>
          <Line label={S.whyArr} text={stack.reason} onOpen={onModuleChange} />
          <Line label={S.useLabel} text={stack.use} onOpen={onModuleChange} />
          {sceneVias.length > 0 ? (
            <p>
              <b>{t(S.spans)}</b>
              {sceneVias.map((v) => `${t(VIA_NAME[v.id])} ${spanText([v.from, v.to])}`).join(' · ')}
            </p>
          ) : null}
        </Callout>
        <Related ids={['connection', 'pcbFab', 'pcbLayout']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.viaTitle)} note={t(S.viaNote)}>
        <ViaFig
          active={viaCard}
          onPick={(id) => {
            setViaCard(id)
            setFocus('via')
          }}
        />
        <Cards
          items={VIAS}
          activeId={viaCard}
          cols={3}
          onPick={(item) => {
            setViaCard(item.id)
            setFocus('via')
          }}
        />
        <Callout>
          <p>
            <b>{t(via.title)}</b>
          </p>
          <RefP text={via.text} onOpen={onModuleChange} />
          <Line label={S.viaWhere} text={via.use} onOpen={onModuleChange} />
          <Line label={S.viaCost} text={via.cost} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['pcbFab', 'pcbDfm', 'pPackage']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.termTitle)} note={t(S.termNote)}>
        <TermFig
          active={termId}
          onPick={(id) => {
            setTermId(id)
            setFocus('term')
          }}
        />
        <Cards
          items={TERMS}
          activeId={termId}
          cols={3}
          onPick={(item) => {
            setTermId(item.id as typeof termId)
            setFocus('term')
          }}
        />
        <Callout>
          <p>
            <b>{t(term.title)}</b>
          </p>
          <RefP text={term.text} onOpen={onModuleChange} />
          <Line label={S.termRule} text={term.rule} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['pcbBasics', 'pcbLayout', 'pcbDfm']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((item) => (
            <p key={item.en}>{t(item)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.quizTitle)} note={t(S.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>
    </LessonFrame>
  )
}
