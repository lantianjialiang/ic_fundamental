import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { type ModuleId } from '../catalog'
import { Callout, Cards, Knob, Readout, Seg } from '../fund/parts'
import { RefP, RefParas, Related, type PrepNote } from '../prep/common'
import { INTRO, PASS_DEVS, PASS_INPUTS, PASS_LABEL, RDS_LABEL, RDS_NOTE, RDS_TEXT2, S, TAKEAWAY, passCase } from './data/mosSwitch'
import { APPROACHES, BOOT_PHASES, CASE_LIST, LED_LABEL, LEVELS, NEED_LABEL, bootPhaseNote, caseNote, needText, stateLine, type GpioLevel } from './data/mosSwitchCases'
import { CHIP_RON, BOARD, condLoss, passCurve, passInputLevel, passTarget, passVgsEnd, rdsOn, switchState, type PassDev, type PassInput } from './data/mosSwitchModel'
import { QUIZ } from './data/mosSwitchQuiz'
import { MOS_META } from './meta'
import { PassFig, RdsFig } from './SwitchFigs'
import { LedFig, NeedFig } from './SwitchFigs2'
import { BootFig } from './SwitchFigs3'
import '../prep/prep.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

export function MosSwitchPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [dev, setDev] = useState<PassDev>(PASS_DEVS[0].id)
  const [input, setInput] = useState<PassInput>(PASS_INPUTS[0].id)
  const [cPf, setCPf] = useState(1)
  const [iLoad, setILoad] = useState(3)
  const [vgs, setVgs] = useState(3.3)
  const [caseId, setCaseId] = useState(CASE_LIST[0].id)
  const [level, setLevel] = useState<GpioLevel>(LEVELS[0].id)
  const [vload, setVload] = useState(12)
  const [vgsFull, setVgsFull] = useState(10)
  const [phase, setPhase] = useState(BOOT_PHASES[0].id)
  const [approach, setApproach] = useState(APPROACHES[0].id)
  const [note, setNote] = useState<PrepNote | null>(null)

  const pass = passCase(dev, input)
  const shown: PrepNote = note ?? { kicker: S.kickerPass, title: pass.title, text: pass.text }

  const target = passTarget(dev, input)
  const vin = passInputLevel(input)
  const curve = useMemo(() => passCurve(dev, input, cPf), [dev, input, cPf])
  const good = Math.abs(target - vin) < 0.005

  const rds = rdsOn(vgs)
  const on = vgs > BOARD.vth
  const loss = on ? condLoss(iLoad, rds) : 0

  const high = level === 'high'
  const st = switchState(caseId, high)
  const cNote = caseNote(caseId)

  const bootNote = bootPhaseNote(phase)
  const approachItem = APPROACHES.find((a) => a.id === approach) ?? APPROACHES[0]

  const pickPass = (d: PassDev, i: PassInput) => {
    const c = passCase(d, i)
    setNote({ kicker: S.kickerPass, title: c.title, text: c.text })
  }
  const pickCase = (id: typeof caseId, lv: GpioLevel) => {
    const c = caseNote(id)
    setNote({ kicker: S.kickerLed, title: c.title, text: stateLine(id, lv === 'high') })
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MOS_META.mosSwitch.title)}
      goal={t(MOS_META.mosSwitch.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="mosInverter"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.passTitle)} note={t(S.passNote)}>
        <Seg
          options={PASS_DEVS}
          value={dev}
          onChange={(id) => {
            setDev(id)
            pickPass(id, input)
          }}
        />
        <Seg
          options={PASS_INPUTS}
          value={input}
          onChange={(id) => {
            setInput(id)
            pickPass(dev, id)
          }}
        />
        <div className="knob-row">
          <Knob
            label={PASS_LABEL.cKnob}
            value={cPf}
            unit="pF"
            min={0.5}
            max={5}
            step={0.5}
            onChange={(v) => {
              setCPf(v)
              pickPass(dev, input)
            }}
          />
        </div>
        <PassFig dev={dev} input={input} cPf={cPf} />
        <Readout
          items={[
            { label: PASS_LABEL.input, value: `${vin.toFixed(2)} V` },
            { label: PASS_LABEL.out, value: `${target.toFixed(2)} V`, state: good ? 'pass' : 'fail' },
            { label: PASS_LABEL.loss, value: `${Math.abs(vin - target).toFixed(2)} V` },
            { label: PASS_LABEL.vgs, value: `${passVgsEnd(dev, input).toFixed(2)} V` },
            { label: PASS_LABEL.settle, value: curve.tSettle === null ? `> ${curve.tMax.toFixed(0)} ns` : `${curve.tSettle.toFixed(1)} ns` },
          ]}
        />
        <Callout tone={pass.tone}>
          <p>
            <b>{t(pass.title)}</b>
          </p>
          <RefP text={pass.detail} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['mosChannel', 'mosRegion', 'mosGates', 'mosInverter']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.rdsTitle)} note={t(S.rdsNote)}>
        <div className="knob-row">
          <Knob label={RDS_LABEL.idKnob} value={iLoad} unit="A" min={0.5} max={10} step={0.5} onChange={setILoad} />
          <Knob
            label={RDS_LABEL.vgsKnob}
            value={vgs}
            unit="V"
            min={3}
            max={10}
            step={0.1}
            onChange={(v) => {
              const next = Math.round(v * 10) / 10
              setVgs(next)
              setNote({ kicker: S.kickerRds, title: S.rdsTitle, text: RDS_NOTE })
            }}
          />
        </div>
        <RdsFig id={iLoad} vgs={vgs} />
        <Readout
          items={[
            { label: RDS_LABEL.rds, value: on ? `${(rds * 1000).toFixed(1)} mΩ` : '∞' },
            { label: RDS_LABEL.drop, value: `${(iLoad * (on ? rds : 0)).toFixed(3)} V` },
            { label: RDS_LABEL.loss, value: `${loss.toFixed(3)} W` },
            { label: RDS_LABEL.chip, value: `${CHIP_RON.toFixed(0)} Ω` },
          ]}
        />
        <Callout tone="warn">
          <p>{t(RDS_NOTE)}</p>
          <RefP text={RDS_TEXT2} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['mosReal', 'mosSelect', 'pMeasure']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.ledTitle)} note={t(S.ledNote)}>
        <Seg
          options={CASE_LIST}
          value={caseId}
          onChange={(id) => {
            setCaseId(id)
            pickCase(id, level)
          }}
        />
        <Seg
          options={LEVELS}
          value={level}
          onChange={(id) => {
            setLevel(id)
            pickCase(caseId, id)
          }}
        />
        <LedFig
          id={caseId}
          high={high}
          onToggle={() => {
            const next: GpioLevel = high ? 'low' : 'high'
            setLevel(next)
            pickCase(caseId, next)
          }}
        />
        <Readout
          items={[
            { label: LED_LABEL.vg, value: `${st.vg.toFixed(1)} V` },
            { label: LED_LABEL.vgs, value: `${st.vgs.toFixed(2)} V` },
            { label: LED_LABEL.state, value: t(st.on ? LED_LABEL.on : LED_LABEL.off), state: st.on ? 'pass' : st.fail ? 'fail' : undefined },
            { label: LED_LABEL.current, value: `${(st.i * 1000).toFixed(2)} mA` },
            { label: LED_LABEL.led, value: t(st.lit ? LED_LABEL.lit : LED_LABEL.dark), state: st.lit ? 'pass' : st.fail ? 'fail' : undefined },
          ]}
        />
        <Callout tone={st.fail ? 'bad' : cNote.tone}>
          <p>
            <b>{t(cNote.title)}</b>
          </p>
          <p>{t(stateLine(caseId, high))}</p>
          <RefP text={cNote.detail} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['mosApps', 'pParts', 'dc', 'fDc']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.needTitle)} note={t(S.needNote)}>
        <div className="knob-row">
          <Knob
            label={NEED_LABEL.loadKnob}
            value={vload}
            unit="V"
            min={1}
            max={24}
            step={1}
            onChange={(v) => {
              setVload(v)
              setNote({ kicker: S.kickerNeed, title: S.needTitle, text: needText(v, vgsFull) })
            }}
          />
          <Knob
            label={NEED_LABEL.vgsKnob}
            value={vgsFull}
            unit="V"
            min={4.5}
            max={10}
            step={0.5}
            onChange={(v) => {
              setVgsFull(v)
              setNote({ kicker: S.kickerNeed, title: S.needTitle, text: needText(vload, v) })
            }}
          />
        </div>
        <NeedFig vload={vload} vgsFull={vgsFull} />
        <Callout tone="warn">
          <p>{t(needText(vload, vgsFull))}</p>
        </Callout>
        <Related ids={['mosRegion', 'mosApps', 'mosSelect']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.bootTitle)} note={t(S.bootNote)}>
        <Seg
          options={BOOT_PHASES}
          value={phase}
          onChange={(id) => {
            setPhase(id)
            const n = bootPhaseNote(id)
            setNote({ kicker: S.kickerBoot, title: n.title, text: n.text })
          }}
        />
        <BootFig phase={phase} />
        <Callout tone={bootNote.tone}>
          <p>
            <b>{t(bootNote.title)}</b>
          </p>
          <p>{t(bootNote.text)}</p>
        </Callout>
        <Cards
          items={APPROACHES}
          activeId={approach}
          cols={3}
          onPick={(item) => {
            setApproach(item.id)
            setNote({ kicker: S.kickerBoot, title: item.title, text: item.text })
          }}
        />
        <Callout>
          <p>
            <b>{t(approachItem.title)}</b>
          </p>
          <RefP text={approachItem.text} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['mosApps', 'mosDynamic', 'mosSelect', 'mosGates']} onOpen={onModuleChange} />
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
