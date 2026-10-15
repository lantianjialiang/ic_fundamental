import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { Callout, Cards, Knob, Readout, Seg, fmtOhm } from '../fund/parts'
import { RefP, RefParas, Related, type PrepNote } from '../prep/common'
import { DUAL, GATES, INTRO, S, TAKEAWAY, type DualId } from './data/mosGates'
import { COMBO_ITEMS, S2, TG_ITEMS, TG_REASON, type ComboKind, type TgKind } from './data/mosGatesTg'
import { S3 } from './data/mosGatesBuild'
import { QUIZ } from './data/mosGatesQuiz'
import { GatesBuilder } from './GatesBuilder'
import { TruthTable, WhyInvFig } from './GatesFigs'
import { TgFig, tgRon } from './GatesFigs2'
import { MuxFig } from './GatesFigs3'
import { GateNetFig } from './GatesNet'
import { GATE_DEFS, conducts, outLevel, rowInputs, withComp, type Bit, type GateId } from './gatesModel'
import { MOS_META } from './meta'
import { VDD, VTN, VTP } from './model'
import '../prep/prep.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

function BitSeg({ name, value, onChange }: { name: string; value: Bit; onChange: (v: Bit) => void }) {
  return (
    <Seg
      options={[
        { id: '0', label: `${name} = 0` },
        { id: '1', label: `${name} = 1` },
      ]}
      value={value === 1 ? '1' : '0'}
      onChange={(id) => onChange(id === '1' ? 1 : 0)}
    />
  )
}

export function MosGatesPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [gate, setGate] = useState<GateId>(GATES[0].id)
  const [a, setA] = useState<Bit>(0)
  const [b, setB] = useState<Bit>(0)
  const [dualId, setDualId] = useState<DualId>(DUAL[0].id)
  const [tgKind, setTgKind] = useState<TgKind>(TG_ITEMS[0].id)
  const [pass, setPass] = useState<'1' | '0'>('1')
  const [vin, setVin] = useState(0)
  const [tEn, setTEn] = useState<Bit>(0)
  const [tA, setTA] = useState<Bit>(0)
  const [combo, setCombo] = useState<ComboKind>(COMBO_ITEMS[0].id)
  const [ca, setCa] = useState<Bit>(0)
  const [cb, setCb] = useState<Bit>(0)
  const [cs, setCs] = useState<Bit>(0)
  const [note, setNote] = useState<PrepNote | null>(null)

  const gateItem = GATES.find((g) => g.id === gate) ?? GATES[0]
  const shown: PrepNote = note ?? { kicker: S.kickerGate, title: gateItem.title, text: gateItem.text }
  const def = GATE_DEFS[gate]
  const gateSig = withComp({ A: a, B: b })
  const gateOut = outLevel(def.pun, def.pdn, gateSig)
  const row = a * 2 + b
  const pickRow = (i: number) => {
    const bits = rowInputs(def.inputs, i)
    setA(bits.A)
    setB(bits.B)
    setNote({ kicker: S.kickerGate, title: gateItem.title, text: gateItem.rows[i] })
  }

  const dualItem = DUAL.find((d) => d.id === dualId) ?? DUAL[0]
  const tgItem = TG_ITEMS.find((i) => i.id === tgKind) ?? TG_ITEMS[0]
  const en = pass === '1'
  const now = tgRon(vin)
  const nOn = en && VDD - vin - VTN > 1e-9
  const pOn = en && vin + VTP > 1e-9
  let tgReason = TG_REASON.mid
  if (!en) {
    tgReason = TG_REASON.open
  } else if (!pOn) {
    tgReason = TG_REASON.low
  } else if (!nOn) {
    tgReason = TG_REASON.high
  }
  const triDef = GATE_DEFS.tri
  const triSig = withComp({ EN: tEn, A: tA })
  const triOut = outLevel(triDef.pun, triDef.pdn, triSig)
  const triOutText = triOut === 'Z' ? t(S2.hiz) : triOut
  const pickTri = (i: number) => {
    const bits = rowInputs(triDef.inputs, i)
    setTEn(bits.EN)
    setTA(bits.A)
  }

  const comboItem = COMBO_ITEMS.find((i) => i.id === combo) ?? COMBO_ITEMS[0]
  const xor = combo === 'xor'
  const selV: Bit = xor ? ca : cs
  const v0: Bit = xor ? cb : ca
  const v1: Bit = xor ? ((1 - cb) as Bit) : cb
  const comboY: Bit = selV === 1 ? v1 : v0

  const onOff = (v: boolean) => t(v ? S2.on : S2.off)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MOS_META.mosGates.title)}
      goal={t(MOS_META.mosGates.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="mosDynamic"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.gateTitle)} note={t(S.gateNote)}>
        <Seg
          options={GATES.map((g) => ({ id: g.id, label: g.label }))}
          value={gate}
          onChange={(id) => {
            setGate(id)
            setNote(null)
          }}
        />
        <div className="knob-row">
          <BitSeg
            name="A"
            value={a}
            onChange={(v) => {
              setA(v)
              setNote({ kicker: S.kickerGate, title: gateItem.title, text: gateItem.rows[v * 2 + b] })
            }}
          />
          <BitSeg
            name="B"
            value={b}
            onChange={(v) => {
              setB(v)
              setNote({ kicker: S.kickerGate, title: gateItem.title, text: gateItem.rows[a * 2 + v] })
            }}
          />
        </div>
        <GateNetFig pun={def.pun} pdn={def.pdn} sig={gateSig} label="Y" caption={t(S.gateCap)} />
        <Readout
          items={[
            { label: 'A', value: `${a}` },
            { label: 'B', value: `${b}` },
            { label: 'Y', value: gateOut, state: gateOut === '1' ? 'pass' : undefined },
            { label: S.up, value: t(conducts(def.pun, gateSig) ? S.conduct : S.open) },
            { label: S.down, value: t(conducts(def.pdn, gateSig) ? S.conduct : S.open) },
          ]}
        />
        <Callout>
          <p>
            <b>{t(gateItem.title)}</b>
          </p>
          <p>{t(gateItem.rows[row])}</p>
          <p>{t(gateItem.tail)}</p>
        </Callout>
        <TruthTable names={def.inputs} out="Y" yOf={(i) => outLevel(def.pun, def.pdn, withComp(rowInputs(def.inputs, i)))} active={row} onPick={pickRow} />
        <Related ids={['pDigital', 'fBasics', 'func', 'mosInverter']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.dualTitle)} note={t(S.dualNote)}>
        <Cards
          items={DUAL}
          activeId={dualId}
          cols={3}
          onPick={(item) => {
            setDualId(item.id)
            setNote({ kicker: S.kickerDual, title: item.title, text: item.text })
          }}
        />
        <Callout>
          <p>
            <b>{t(dualItem.title)}</b>
          </p>
          <p>{t(dualItem.text)}</p>
          <p>{t(dualItem.detail)}</p>
        </Callout>
        {dualItem.id === 'inv' ? (
          <WhyInvFig />
        ) : (
          <div className="prep-table-wrap">
            <table className="prep-table">
              <thead>
                <tr>
                  <th>{t(S.tblWire)}</th>
                  <th>{t(S.tblN)}</th>
                  <th>{t(S.tblP)}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <b>{t(S.tblSer)}</b>
                  </td>
                  <td>{t(S.tblSerN)}</td>
                  <td>{t(S.tblSerP)}</td>
                </tr>
                <tr>
                  <td>
                    <b>{t(S.tblPar)}</b>
                  </td>
                  <td>{t(S.tblParN)}</td>
                  <td>{t(S.tblParP)}</td>
                </tr>
              </tbody>
            </table>
            <p className="prep-muted">{t(S.tblNote)}</p>
          </div>
        )}
        <Related ids={['mosSwitch', 'mosInverter', 'pDigital', 'fBasics']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S2.tgTitle)} note={t(S2.tgNote)}>
        <Seg
          options={TG_ITEMS.map((i) => ({ id: i.id, label: i.label }))}
          value={tgKind}
          onChange={(id) => {
            setTgKind(id)
            const item = TG_ITEMS.find((i) => i.id === id) ?? TG_ITEMS[0]
            setNote({ kicker: S2.kickerTg, title: item.title, text: item.text })
          }}
        />
        {tgKind === 'tg' ? (
          <div>
            <Seg
              options={[
                { id: '1', label: S2.ctrlOn },
                { id: '0', label: S2.ctrlOff },
              ]}
              value={pass}
              onChange={setPass}
            />
            <div className="knob-row">
              <Knob label={S2.vin} value={vin} unit="V" min={0} max={VDD} step={0.05} onChange={(v) => setVin(Math.round(v * 100) / 100)} />
            </div>
            <TgFig en={en} vin={vin} />
            <Readout
              items={[
                { label: S2.nState, value: onOff(nOn), state: nOn ? 'pass' : undefined },
                { label: S2.pState, value: onOff(pOn), state: pOn ? 'pass' : undefined },
                { label: S2.ron, value: en ? fmtOhm(now.total) : '∞' },
                { label: S2.vout, value: en ? `${vin.toFixed(2)} V` : t(S2.hiz) },
              ]}
            />
            <Callout>
              <p>{t(tgReason)}</p>
            </Callout>
          </div>
        ) : (
          <div>
            <div className="knob-row">
              <BitSeg name="EN" value={tEn} onChange={setTEn} />
              <BitSeg name="A" value={tA} onChange={setTA} />
            </div>
            <GateNetFig pun={triDef.pun} pdn={triDef.pdn} sig={triSig} label="Y" caption={t(S.gateCap)} />
            <Readout
              items={[
                { label: 'EN', value: `${tEn}` },
                { label: 'A', value: `${tA}` },
                { label: 'Y', value: triOutText, state: triOut === 'Z' ? undefined : 'pass' },
              ]}
            />
            <TruthTable names={triDef.inputs} out="Y" yOf={(i) => outLevel(triDef.pun, triDef.pdn, withComp(rowInputs(triDef.inputs, i)))} active={tEn * 2 + tA} onPick={pickTri} />
          </div>
        )}
        <Callout>
          <p>
            <b>{t(tgItem.title)}</b>
          </p>
          <p>{t(tgItem.text)}</p>
          <RefP text={tgItem.detail} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['mosSwitch', 'mosRegion', 'fDc', 'func']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S2.comboTitle)} note={t(S2.comboNote)}>
        <Seg
          options={COMBO_ITEMS.map((i) => ({ id: i.id, label: i.label }))}
          value={combo}
          onChange={(id) => {
            setCombo(id)
            const item = COMBO_ITEMS.find((i) => i.id === id) ?? COMBO_ITEMS[0]
            setNote({ kicker: S2.kickerCombo, title: item.title, text: item.text })
          }}
        />
        <div className="knob-row">
          {xor ? null : <BitSeg name="S" value={cs} onChange={setCs} />}
          <BitSeg name="A" value={ca} onChange={setCa} />
          <BitSeg name="B" value={cb} onChange={setCb} />
        </div>
        <MuxFig kind={combo} a={ca} b={cb} s={cs} />
        <Readout
          items={[
            { label: S2.gateOn, value: selV === 0 ? 'TG0' : 'TG1' },
            { label: 'Y', value: `${comboY}`, state: comboY === 1 ? 'pass' : undefined },
          ]}
        />
        <Callout>
          <p>
            <b>{t(comboItem.title)}</b>
          </p>
          <p>{t(comboItem.text)}</p>
          <RefP text={comboItem.detail} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['pDigital', 'fBasics', 'mosDynamic']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S3.buildTitle)} note={t(S3.buildNote)}>
        <GatesBuilder onNote={setNote} />
        <Related ids={['pDigital', 'func', 'mosInverter']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.takeawayTitle)}>
        <Callout tone="warn">
          {TAKEAWAY.map((item) => (
            <p key={item.zh}>{t(item)}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.quizTitle)} note={t(S.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>
    </LessonFrame>
  )
}
