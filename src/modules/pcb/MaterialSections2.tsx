import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Callout, Cards, Seg } from '../fund/parts'
import { Related, type PrepNote } from '../prep/common'
import { LAM_COMPARE, LAM_OPTS } from './data/pcbMaterialCopper'
import { CRITERIA, FILTERS, FINISHES, ORDER_OPTS, shelfMid, viewFinishes, type CritId, type Finish, type FilterId, type FinishId } from './data/pcbMaterialFinish'
import { LAYER_BY_ID, layerNote, type LayerKind } from './data/pcbMaterialLayers'
import { CONCERNS, MASK_ITEMS, METRICS, SCENARIOS, SPECIALS, type MaskItemId, type MetricId, type ScenarioId, type SpecialId } from './data/pcbMaterialSpecial'
import { S } from './data/pcbMaterial'
import { BarsFig } from './MaterialFigs5'
import { FinishFig, MaskFig } from './MaterialFigs4'
import { LAM_KINDS, LaminateFig } from './MaterialFigs3'
import { Group, Line, type PanelProps } from './MaterialSections'

const L2 = {
  what: loc('是什么：', 'What it is: '),
  use: loc('用在哪里：', 'Used for: '),
  price: loc('代价：', 'The price: '),
  cmpItem: loc('比较项', 'Item'),
  cmpPp: loc('半固化片', 'Prepreg'),
  cmpCore: loc('芯板', 'Core'),
  lamBefore: loc(
    '压合前：五张料叠在一起，内层线路之间还是空的，半固化片里的树脂没有完全固化，所以还软、还没粘住。',
    'Before pressing: five sheets are stacked with empty gaps between the inner traces, and the resin in the prepreg is not fully cured, so it is still soft and not yet bonded.',
  ),
  lamAfter: loc(
    '压合后：加热加压让半固化片里的树脂先熔化、挤进线路之间的空隙，再固化成硬的绝缘层，所以半固化片比压合前薄；芯板早已固化，位置没动。线路越厚、铜越密，需要的树脂越多，半固化片就要选更厚或更高含胶量的。',
    'After pressing: heat and pressure melt the prepreg resin so it flows into the gaps between traces and then cures into a hard insulator, which is why the prepreg is thinner than before; the core was already cured and has not moved. Thicker, denser copper needs more resin, so choose thicker or higher-resin-content prepreg.',
  ),
  sortHint: loc('点任一行，看它的结构和厚度。', 'Click any row to see its structure and thickness.'),
}

const kindNote = (k: LayerKind): PrepNote => ({ kicker: S.kickerLam, title: LAYER_BY_ID(k).name, text: layerNote(LAYER_BY_ID(k), 'four') })

export function LaminatePanel({ onNote, onOpen }: PanelProps) {
  const { t } = useLocale()
  const [phase, setPhase] = useState<'before' | 'after'>(LAM_OPTS[0].id)
  const [kind, setKind] = useState<LayerKind>(LAM_KINDS[0])
  const info = LAYER_BY_ID(kind)
  return (
    <>
      <Seg options={LAM_OPTS} value={phase} onChange={setPhase} />
      <LaminateFig
        phase={phase}
        active={kind}
        onPick={(k) => {
          setKind(k)
          onNote(kindNote(k))
        }}
      />
      <Callout tone={phase === 'before' ? undefined : 'ok'}>
        <p>{t(phase === 'before' ? L2.lamBefore : L2.lamAfter)}</p>
      </Callout>
      <Callout>
        <p>
          <b>{t(info.name)}</b>
        </p>
        <Line label={loc('材料：', 'Material: ')} text={info.mat} />
        <Line label={loc('典型厚度：', 'Typical thickness: ')} text={info.thick('four')} />
        <Line label={loc('作用：', 'Role: ')} text={info.role} />
      </Callout>
      <div className="prep-table-wrap">
        <table className="prep-table">
          <thead>
            <tr>
              <th>{t(L2.cmpItem)}</th>
              <th>{t(L2.cmpPp)}</th>
              <th>{t(L2.cmpCore)}</th>
            </tr>
          </thead>
          <tbody>
            {LAM_COMPARE.map((row) => (
              <tr key={row.k.en}>
                <td>
                  <b>{t(row.k)}</b>
                </td>
                <td>{t(row.pp)}</td>
                <td>{t(row.core)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Related ids={['pcbStack', 'pcbFab']} onOpen={onOpen} />
    </>
  )
}

export function MaskPanel({ onNote, onOpen }: PanelProps) {
  const { t } = useLocale()
  const [id, setId] = useState<MaskItemId>(MASK_ITEMS[0].id)
  const item = MASK_ITEMS.find((m) => m.id === id) ?? MASK_ITEMS[0]
  return (
    <>
      <MaskFig
        active={id}
        onPick={(mid) => {
          const m = MASK_ITEMS.find((x) => x.id === mid) ?? MASK_ITEMS[0]
          setId(mid)
          onNote({ kicker: S.kickerMask, title: m.name, text: m.text })
        }}
      />
      <Callout tone={id === 'silkBad' ? 'bad' : undefined}>
        <p>
          <b>{t(item.name)}</b>
        </p>
        <p>{t(item.text)}</p>
      </Callout>
      <Related ids={['pcbFab', 'pcbDfm']} onOpen={onOpen} />
    </>
  )
}

function Dots({ n }: { n: number }) {
  return (
    <span className="pcbMaterial-dots" role="img" aria-label={`${n}/5`}>
      {'●'.repeat(n)}
      <span>{'●'.repeat(5 - n)}</span>
    </span>
  )
}

const finishNote = (f: Finish): PrepNote => ({
  kicker: S.kickerFinish,
  title: f.name,
  text: loc(`结构：${f.struct.zh} 厚度：${f.thick.zh} 优点：${f.good.zh} 缺点：${f.bad.zh}`, `Structure: ${f.struct.en} Thickness: ${f.thick.en} Strengths: ${f.good.en} Weaknesses: ${f.bad.en}`),
})

export function FinishPanel({ onNote, onOpen }: PanelProps) {
  const { t } = useLocale()
  const [crit, setCrit] = useState<CritId>(CRITERIA[0].id)
  const [filter, setFilter] = useState<FilterId>(FILTERS[0].id)
  const [order, setOrder] = useState<'best' | 'worst'>(ORDER_OPTS[0].id)
  const [picked, setPicked] = useState<FinishId | null>(null)
  const rows = viewFinishes(crit, filter, order)
  const sel = rows.find((r) => r.id === picked) ?? rows[0] ?? FINISHES[0]
  const apply = (c: CritId, f: FilterId, o: 'best' | 'worst') => {
    setCrit(c)
    setFilter(f)
    setOrder(o)
    const next = viewFinishes(c, f, o)
    const keep = next.find((r) => r.id === picked) ?? next[0]
    if (keep) {
      onNote(finishNote(keep))
    }
  }
  const pick = (f: Finish) => {
    setPicked(f.id)
    onNote(finishNote(f))
  }
  const head = (key: keyof typeof S, id: CritId) => <th className={crit === id ? 'is-sorted' : ''}>{t(S[key])}</th>
  return (
    <>
      <Group label={S.sortBy}>
        <Seg options={CRITERIA.map((c) => ({ id: c.id, label: c.label }))} value={crit} onChange={(c) => apply(c, filter, order)} />
        <Seg options={ORDER_OPTS} value={order} onChange={(o) => apply(crit, filter, o)} />
      </Group>
      <Group label={S.filterBy}>
        <Seg options={FILTERS.map((f) => ({ id: f.id, label: f.label }))} value={filter} onChange={(f) => apply(crit, f, order)} />
      </Group>
      <div className="prep-table-wrap">
        <table className="prep-table pcbMaterial-table">
          <thead>
            <tr>
              <th>{t(S.colFinish)}</th>
              {head('colCost', 'cost')}
              {head('colSolder', 'solder')}
              {head('colFlat', 'flat')}
              {head('colShelf', 'shelf')}
              {head('colFine', 'fine')}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6}>{t(S.empty)}</td>
              </tr>
            ) : (
              rows.map((f) => (
                <tr key={f.id} className={`pcbMaterial-row${sel.id === f.id ? ' is-active' : ''}`} onClick={() => pick(f)}>
                  <td>
                    <button type="button" className="pcbMaterial-pick" aria-pressed={sel.id === f.id} onClick={() => pick(f)}>
                      {t(f.name)}
                    </button>
                  </td>
                  <td>{`${f.cost.toFixed(2)}×`}</td>
                  <td>
                    <Dots n={f.solder} />
                  </td>
                  <td>
                    <Dots n={f.flat} />
                  </td>
                  <td>{f.shelf[0] === f.shelf[1] ? `${f.shelf[0]}` : `${f.shelf[0]}–${f.shelf[1]}`} {t(S.monthsUnit)}</td>
                  <td>
                    <Dots n={f.fine} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <p className="prep-muted">{t(L2.sortHint)}</p>
      <FinishFig active={sel.id} onPick={(id) => pick(FINISHES.find((f) => f.id === id) ?? FINISHES[0])} />
      <Callout>
        <p>
          <b>{t(sel.name)}</b>
        </p>
        <Line label={S.structure} text={sel.struct} />
        <Line label={S.thickness} text={sel.thick} />
        <Line label={S.good} text={sel.good} />
        <Line label={S.bad} text={sel.bad} />
        <Line label={S.useFor} text={sel.use} />
        <p className="prep-muted">{`${t(S.colShelf)}: ${shelfMid(sel)} ${t(S.monthsUnit)}`}</p>
      </Callout>
      <Related ids={['pPackage', 'pcbSupply', 'pcbFab']} onOpen={onOpen} />
    </>
  )
}

export function SpecialPanel({ onNote, onOpen }: PanelProps) {
  const { t } = useLocale()
  const [metric, setMetric] = useState<MetricId>(METRICS[0].id)
  const [id, setId] = useState<SpecialId>(SPECIALS[0].id)
  const spec = METRICS.find((m) => m.id === metric) ?? METRICS[0]
  const mat = SPECIALS.find((m) => m.id === id) ?? SPECIALS[0]
  const noteOf = (m: (typeof SPECIALS)[number]): PrepNote => ({
    kicker: S.kickerSpecial,
    title: m.name,
    text: loc(`${m.what.zh} 用在：${m.use.zh} 代价：${m.price.zh}`, `${m.what.en} Used for: ${m.use.en} The price: ${m.price.en}`),
  })
  return (
    <>
      <Group label={S.metricLabel}>
        <Seg options={METRICS.map((m) => ({ id: m.id, label: m.label }))} value={metric} onChange={setMetric} />
      </Group>
      <BarsFig
        metric={metric}
        active={id}
        onPick={(sid) => {
          setId(sid)
          onNote(noteOf(SPECIALS.find((m) => m.id === sid) ?? SPECIALS[0]))
        }}
      />
      <Callout>
        <p>{t(spec.note)}</p>
      </Callout>
      <Callout>
        <p>
          <b>{t(mat.name)}</b>
        </p>
        <Line label={L2.what} text={mat.what} />
        <Line label={L2.use} text={mat.use} />
        <Line label={L2.price} text={mat.price} />
      </Callout>
      <Related ids={['pcbStack', 'pcbSupply']} onOpen={onOpen} />
    </>
  )
}

export function ChoosePanel({ onNote, onOpen }: PanelProps) {
  const { t } = useLocale()
  const [cid, setCid] = useState(CONCERNS[0].id)
  const [sid, setSid] = useState<ScenarioId>(SCENARIOS[0].id)
  const concern = CONCERNS.find((c) => c.id === cid) ?? CONCERNS[0]
  const sc = SCENARIOS.find((s) => s.id === sid) ?? SCENARIOS[0]
  const scNote = (s: (typeof SCENARIOS)[number]): PrepNote => ({
    kicker: S.kickerChoose,
    title: s.label,
    text: loc(`${s.base.zh}；${s.copper.zh}；${s.finish.zh}。${s.why.zh}`, `${s.base.en}; ${s.copper.en}; ${s.finish.en}. ${s.why.en}`),
  })
  return (
    <>
      <Cards
        items={CONCERNS}
        activeId={cid}
        cols={3}
        onPick={(c) => {
          setCid(c.id)
          onNote({ kicker: S.kickerChoose, title: c.title, text: c.text })
        }}
      />
      <Callout>
        <p>
          <b>{t(concern.title)}</b>
        </p>
        <p>{t(concern.text)}</p>
      </Callout>
      <Group label={S.chooseNote}>
        <Seg
          options={SCENARIOS.map((s) => ({ id: s.id, label: s.label }))}
          value={sid}
          onChange={(id) => {
            setSid(id)
            onNote(scNote(SCENARIOS.find((s) => s.id === id) ?? SCENARIOS[0]))
          }}
        />
      </Group>
      <Callout>
        <p>
          <b>{t(sc.label)}</b>
        </p>
        <Line label={S.chooseBase} text={sc.base} />
        <Line label={S.chooseCopper} text={sc.copper} />
        <Line label={S.chooseFinish} text={sc.finish} />
        <Line label={S.chooseWhy} text={sc.why} />
      </Callout>
      <Related ids={['pcbStack', 'pcbSupply', 'pPackage']} onOpen={onOpen} />
    </>
  )
}