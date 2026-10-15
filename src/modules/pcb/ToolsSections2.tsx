import { useState } from 'react'
import { LessonRefText } from '../../home/LessonRefText'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Section } from '../../lab/LessonFrame'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { Related, type PrepNote } from '../prep/common'
import { S } from './data/pcbTools'
import {
  DRC_RULES,
  DS,
  FAB_BRIDGE,
  FAB_CLR,
  KEYS,
  KEY_GROUPS,
  maskBridge,
  PAD_GAP,
  type DrcId,
  type KeyGroup,
  type Val,
} from './data/pcbToolsDrc'

type Common = { onOpen: (id: ModuleId) => void; setNote: (n: PrepNote) => void }
type Unit = 'mm' | 'mil'

const UNITS: Array<{ id: Unit; label: string }> = [
  { id: 'mm', label: DS.mm },
  { id: 'mil', label: DS.mil },
]

function fmtLen(mm: number, unit: Unit) {
  if (unit === 'mm') {
    return `${mm} mm`
  }
  const m = mm / 0.0254
  const r = Math.round(m)
  return `${Math.abs(m - r) < 0.25 ? r : m.toFixed(1)} mil`
}

function round3(n: number) {
  return Math.round(n * 1000) / 1000
}

export function DrcSection({ onOpen, setNote }: Common) {
  const { t } = useLocale()
  const [unit, setUnit] = useState<Unit>(UNITS[0].id)
  const [id, setId] = useState<DrcId>(DRC_RULES[0].id)
  const [clr, setClr] = useState<number>(DRC_RULES[0].set[0].mm)
  const [exp, setExp] = useState<number>(DRC_RULES.find((r) => r.id === 'mask')?.set[0].mm ?? 0.05)
  const rule = DRC_RULES.find((r) => r.id === id) ?? DRC_RULES[0]
  const vals = (list: Val[]) => list.map((v) => `${v.k ? `${t(v.k)} ` : ''}${fmtLen(v.mm, unit)}`).join(' / ')
  const pick = (r: (typeof DRC_RULES)[number]) => {
    setId(r.id)
    setNote({ kicker: S.kickerRule, title: loc(r.name, r.name), text: r.why })
  }
  const clrOk = clr >= FAB_CLR - 1e-9
  const bridge = round3(maskBridge(exp))
  const brOk = bridge >= FAB_BRIDGE - 1e-9
  const sign = (n: number) => `${n >= 0 ? '+' : ''}${fmtLen(round3(n), unit)}`
  const via = DRC_RULES.find((r) => r.id === 'via')
  const ring = (list: Val[]) => (list[1].mm - list[0].mm) / 2
  return (
    <Section title={t(S.drcTitle)} note={t(S.drcNote)}>
      <div className="prep-actions">
        <span className="prep-muted">{t(S.unitSeg)}</span>
        <Seg options={UNITS} value={unit} onChange={setUnit} />
      </div>
      <div className="prep-table-wrap">
        <table className="prep-table">
          <thead>
            <tr>
              <th>{t(S.colRule)}</th>
              <th>{t(S.colChecks)}</th>
              <th>{t(S.colFab)}</th>
              <th>{t(S.colSet)}</th>
            </tr>
          </thead>
          <tbody>
            {DRC_RULES.map((r) => (
              <tr key={r.id} className={r.id === id ? 'pcbTools-on' : undefined}>
                <td>
                  <button type="button" className="pcbTools-rowbtn" aria-pressed={r.id === id} onClick={() => pick(r)}>
                    {r.name}
                  </button>
                </td>
                <td>{t(r.checks)}</td>
                <td>{vals(r.fab)}</td>
                <td>
                  <b>{vals(r.set)}</b>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="prep-muted">{t(S.drcCap)}</p>
      <Callout>
        <p>
          <b>{rule.name}</b>
        </p>
        <p>
          <LessonRefText text={rule.why} onOpenLesson={onOpen} />
        </p>
        {rule.id === 'via' && via ? (
          <p>
            {`${t(DS.ring)}: ${t(S.colFab)} ${fmtLen(round3(ring(via.fab)), unit)} / ${t(S.colSet)} ${fmtLen(round3(ring(via.set)), unit)}. `}
            {t(DS.ringNote)}
          </p>
        ) : null}
      </Callout>
      <h3>{t(DS.calcTitle)}</h3>
      <div className="knob-row">
        <Knob label={DS.knobClr} value={clr} unit="mm" min={0.08} max={0.3} step={0.01} onChange={setClr} />
      </div>
      <Readout
        items={[
          { label: DS.yourRule, value: fmtLen(clr, unit) },
          { label: DS.fabMin, value: fmtLen(FAB_CLR, unit) },
          { label: DS.margin, value: sign(clr - FAB_CLR), state: clrOk ? 'pass' : 'fail' },
        ]}
      />
      <Callout tone={clrOk ? 'ok' : 'bad'}>
        <p>{t(clrOk ? DS.clrOk : DS.clrBad)}</p>
      </Callout>
      <div className="knob-row">
        <Knob label={DS.knobExp} value={exp} unit="mm" min={0} max={0.15} step={0.01} onChange={setExp} />
      </div>
      <Readout
        items={[
          { label: DS.padGap, value: fmtLen(PAD_GAP, unit) },
          { label: DS.bridge, value: fmtLen(bridge, unit), state: brOk ? 'pass' : 'fail' },
          { label: DS.fabMin, value: `≥ ${fmtLen(FAB_BRIDGE, unit)}` },
        ]}
      />
      <Callout tone={brOk ? 'ok' : 'bad'}>
        <p>{t(brOk ? DS.brOk : DS.brBad)}</p>
      </Callout>
      <p className="prep-muted">{t(DS.calcCap)}</p>
      <Related ids={['pcbBasics', 'pcbFab', 'pcbDfm']} onOpen={onOpen} />
    </Section>
  )
}

export function KeysSection({ onOpen }: { onOpen: (id: ModuleId) => void }) {
  const { t } = useLocale()
  const [group, setGroup] = useState<KeyGroup>(KEY_GROUPS[0].id)
  const rows = KEYS.filter((k) => group === 'all' || k.group === group)
  return (
    <Section title={t(S.keyTitle)} note={t(S.keyNote)}>
      <Seg options={KEY_GROUPS} value={group} onChange={setGroup} />
      <div className="prep-table-wrap">
        <table className="prep-table">
          <thead>
            <tr>
              <th>{t(S.colKey)}</th>
              <th>{t(S.colWhen)}</th>
              <th>{t(S.colDoes)}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((k) => (
              <tr key={k.id}>
                <td>
                  <kbd className="pcbTools-keys">{k.keys}</kbd>
                </td>
                <td>{t(k.when)}</td>
                <td>{t(k.does)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Related ids={['pcbLayout', 'pcbBasics']} onOpen={onOpen} />
    </Section>
  )
}
