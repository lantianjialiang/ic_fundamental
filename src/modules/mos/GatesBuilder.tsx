import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { Callout, Readout, Seg } from '../fund/parts'
import { type PrepNote } from '../prep/common'
import { S3, TARGET_TEXT, TPL_LABEL, msgMismatch, msgUnused } from './data/mosGatesBuild'
import { GateNetFig } from './GatesNet'
import { TruthTable } from './GatesFigs'
import { TARGETS, TEMPLATES, dual, leafCount, outLevel, rowInputs, usedSignals, withComp, type TargetId, type TplId } from './gatesModel'

type Props = { onNote: (note: PrepNote) => void }

export function GatesBuilder({ onNote }: Props) {
  const { t } = useLocale()
  const [targetId, setTargetId] = useState<TargetId>(TARGETS[0].id)
  const [tplId, setTplId] = useState<TplId>(TEMPLATES[0].id)
  const [slots, setSlots] = useState<string[]>(() => [0, 1, 2].map(() => TARGETS[0].inputs[0]))
  const [row, setRow] = useState(0)
  const [hint, setHint] = useState(false)

  const target = TARGETS.find((item) => item.id === targetId) ?? TARGETS[0]
  const tpl = TEMPLATES.find((item) => item.id === tplId) ?? TEMPLATES[0]
  const text = TARGET_TEXT[target.id]
  const names = target.inputs
  const fixed = [0, 1, 2].map((i) => (names.includes(slots[i]) ? slots[i] : names[0]))
  const pdn = tpl.build(fixed)
  const pun = dual(pdn)

  const rows = 2 ** names.length
  const evals = Array.from({ length: rows }, (_, i) => {
    const bits = rowInputs(names, i)
    const built = outLevel(pun, pdn, withComp(bits))
    const want = target.fn(bits)
    return { bits, built, want, ok: built === `${want}` }
  })
  const unused = names.filter((name) => !usedSignals(pdn).includes(name))
  const firstBad = evals.findIndex((item) => !item.ok)
  const pass = unused.length === 0 && firstBad < 0
  const badDesc = firstBad >= 0 ? names.map((name) => `${name}=${evals[firstBad].bits[name]}`).join(', ') : ''
  let message = S3.passText
  if (unused.length > 0) {
    message = msgUnused(unused.join(', '))
  } else if (firstBad >= 0) {
    message = msgMismatch(badDesc, evals[firstBad].want)
  }
  const activeRow = Math.min(row, rows - 1)
  const sig = withComp(evals[activeRow].bits)

  const pickTarget = (id: TargetId) => {
    const next = TARGETS.find((item) => item.id === id) ?? TARGETS[0]
    setTargetId(id)
    setSlots([next.inputs[0], next.inputs[0], next.inputs[0]])
    setRow(0)
    setHint(false)
    onNote({ kicker: S3.kickerBuild, title: TARGET_TEXT[id].label, text: TARGET_TEXT[id].need })
  }

  const setSlot = (i: number, name: string) => {
    setSlots((prev) => prev.map((value, k) => (k === i ? name : value)))
  }

  return (
    <div>
      <p className="prep-muted">{t(S3.step1)}</p>
      <Seg options={TARGETS.map((item) => ({ id: item.id, label: TARGET_TEXT[item.id].label }))} value={targetId} onChange={pickTarget} />
      <Callout>
        <p>
          <b>{`${t(text.label)}  ${t(text.rule)}`}</b>
        </p>
        <p>
          {t(S3.needHead)}
          {t(text.need)}
        </p>
      </Callout>
      <p className="prep-muted">{t(S3.step2)}</p>
      <Seg options={TEMPLATES.map((item) => ({ id: item.id, label: TPL_LABEL[item.id] }))} value={tplId} onChange={setTplId} />
      <p className="prep-muted">{t(S3.step3)}</p>
      {Array.from({ length: tpl.slots }, (_, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <b style={{ minWidth: 28, fontFamily: 'var(--mono)' }}>{`x${i + 1}`}</b>
          <Seg options={names.map((name) => ({ id: name, label: name }))} value={fixed[i]} onChange={(name) => setSlot(i, name)} />
        </div>
      ))}
      <GateNetFig pun={pun} pdn={pdn} sig={sig} label="Y" caption={t(S3.caption)} />
      <Readout
        items={[
          { label: S3.count, value: `${2 * leafCount(pdn)}` },
          { label: S3.result, value: t(pass ? S3.pass : S3.fail), state: pass ? 'pass' : 'fail' },
        ]}
      />
      <Callout tone={pass ? 'ok' : 'bad'}>
        <p>{t(message)}</p>
      </Callout>
      <div className="prep-actions">
        <button type="button" className="lab__btn" onClick={() => setHint(!hint)}>
          {t(hint ? S3.hintHide : S3.hintShow)}
        </button>
      </div>
      {hint ? (
        <Callout tone="warn">
          <p>{t(text.hint)}</p>
        </Callout>
      ) : null}
      <TruthTable
        names={names}
        out="Y"
        yOf={(i) => evals[i].built}
        active={activeRow}
        onPick={setRow}
        extra={{ head: `${t(S3.colTarget)} / ${t(S3.colJudge)}`, cell: (i) => `${evals[i].want} ${evals[i].ok ? '✓' : '✗'}`, bad: (i) => !evals[i].ok }}
      />
    </div>
  )
}
