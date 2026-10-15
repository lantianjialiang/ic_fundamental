import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { StepControls, useStepPlayer } from '../../lab/StepPlayer'
import { type ModuleId } from '../catalog'
import { Callout, Cards, Knob, Readout, Seg } from '../fund/parts'
import { RefP, RefParas, Related, type PrepNote } from '../prep/common'
import { CALC_TEXT, FRAMES, INTRO, NOISE_TEXT, PARTS, PHASE_TEXT, POWERS, QUIZ, REGION_NAME, S, TAKEAWAY, type PartId, type PowerId } from './data/mosInverter'
import { FL, PHASE_SHORT } from './data/mosInverterFig'
import { gainAt, KEY, opState, phaseOf, SweepFig } from './InverterFigs'
import { dynPower, fmtE, fmtP, NoiseFig, PowerFig, StructFig } from './InverterFigs2'
import { MOS_META } from './meta'
import { VDD } from './model'
import '../prep/prep.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const SENDS = [
  { id: 'one', label: S.send1 },
  { id: 'zero', label: S.send0 },
] as const
type SendId = (typeof SENDS)[number]['id']

/** 前级输出最差的电平，叠加噪声后，后级是否仍读对 */
function noiseRead(send: SendId, noise: number) {
  if (send === 'one') {
    const vr = KEY.voh - noise
    return { vr, margin: vr - KEY.vih, ok: vr >= KEY.vih }
  }
  const vr = KEY.vol + noise
  return { vr, margin: KEY.vil - vr, ok: vr <= KEY.vil }
}

const round2 = (v: number) => Math.round(v * 100) / 100

export function MosInverterPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const frames = useStepPlayer(FRAMES.length, 2200)
  const [part, setPart] = useState<PartId>(PARTS[0].id)
  const [vin, setVin] = useState(0)
  const [send, setSend] = useState<SendId>(SENDS[0].id)
  const [noise, setNoise] = useState(0.5)
  const [power, setPower] = useState<PowerId>(POWERS[0].id)
  const [cPf, setCPf] = useState(10)
  const [vSup, setVSup] = useState(VDD)
  const [fMhz, setFMhz] = useState(100)
  const [note, setNote] = useState<PrepNote | null>(null)

  const partItem = PARTS.find((p) => p.id === part) ?? PARTS[0]
  const shown: PrepNote = note ?? { kicker: S.kickerPart, title: partItem.title, text: partItem.text }

  const st = opState(vin)
  const phase = phaseOf(st)
  const level = st.vout > KEY.vih ? FL.outHigh : st.vout < KEY.vil ? FL.outLow : FL.outMid

  const frame = FRAMES[frames.step]
  const frameState = opState(frame.vin)
  const framePhase = PHASE_TEXT[frame.id]
  const showFrame = (i: number) => {
    const item = PHASE_TEXT[FRAMES[i].id]
    setNote({ kicker: S.kickerPhase, title: item.title, text: item.text })
  }
  const framePlayer = {
    ...frames,
    next: () => {
      showFrame(Math.min(frames.step + 1, FRAMES.length - 1))
      frames.next()
    },
    goTo: (i: number) => {
      showFrame(i)
      frames.goTo(i)
    },
    toggle: () => {
      setNote(null)
      frames.toggle()
    },
  }

  const read = noiseRead(send, noise)
  const pickNoise = (nextSend: SendId, nextNoise: number) => {
    const r = noiseRead(nextSend, nextNoise)
    setNote({ kicker: S.kickerNoise, title: S.noiseTitle, text: r.ok ? NOISE_TEXT.ok : NOISE_TEXT.bad })
  }

  const powerItem = POWERS.find((p) => p.id === power) ?? POWERS[0]
  const p = dynPower(cPf, vSup, fMhz)
  const pHalf = dynPower(cPf, vSup / 2, fMhz)
  const eCycle = cPf * 1e-12 * vSup * vSup
  const showCalc = () => setNote({ kicker: S.kickerPower, title: S.calcTitle, text: CALC_TEXT })

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MOS_META.mosInverter.title)}
      goal={t(MOS_META.mosInverter.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="mosGates"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.structTitle)} note={t(S.structNote)}>
        <Cards
          items={PARTS}
          activeId={part}
          cols={3}
          onPick={(item) => {
            setPart(item.id)
            setNote(null)
          }}
        />
        <StructFig
          active={part}
          onPick={(id) => {
            setPart(id)
            setNote(null)
          }}
        />
        <Callout>
          <p>
            <b>{t(partItem.title)}</b>
          </p>
          <RefP text={partItem.text} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['pDigital', 'fBasics', 'mosSwitch', 'mosRegion']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.sweepTitle)} note={t(S.sweepNote)}>
        <div className="knob-row">
          <Knob
            label={S.vin}
            value={vin}
            unit="V"
            min={0}
            max={VDD}
            step={0.01}
            onChange={(v) => {
              const next = round2(v)
              setVin(next)
              const item = PHASE_TEXT[phaseOf(opState(next))]
              setNote({ kicker: S.kickerSweep, title: item.title, text: item.text })
            }}
          />
        </div>
        <SweepFig vin={vin} />
        <Readout
          items={[
            { label: S.vout, value: `${st.vout.toFixed(2)} V · ${t(level)}` },
            { label: S.idd, value: `${(st.idd * 1e3).toFixed(3)} mA`, state: st.idd > 1e-4 ? 'fail' : undefined },
            { label: S.gain, value: gainAt(vin).toFixed(1) },
            { label: S.nReg, value: t(REGION_NAME[st.nReg]) },
            { label: S.pReg, value: t(REGION_NAME[st.pReg]) },
            { label: S.phase, value: t(PHASE_SHORT[phase]) },
          ]}
        />
        <Callout tone={phase === 'vm' ? 'warn' : undefined}>
          <p>
            <b>{t(PHASE_TEXT[phase].title)}</b>
          </p>
          <RefP text={PHASE_TEXT[phase].text} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['mosRegion', 'mosSwitch', 'mosGates']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.phaseTitle)} note={t(S.phaseNote)}>
        <SweepFig vin={frame.vin} />
        <StepControls player={framePlayer} stepLabels={FRAMES.map((f) => PHASE_SHORT[f.id])} />
        <Readout
          items={[
            { label: S.vin, value: `${frame.vin.toFixed(2)} V` },
            { label: S.vout, value: `${frameState.vout.toFixed(2)} V` },
            { label: S.idd, value: `${(frameState.idd * 1e3).toFixed(3)} mA` },
          ]}
        />
        <Callout>
          <p>
            <b>{`${frames.step + 1}. ${t(framePhase.title)}`}</b>
          </p>
          <RefP text={framePhase.text} onOpen={onModuleChange} />
        </Callout>
        <Callout tone="warn">
          <p>{t(S.phaseWhy)}</p>
          <p>
            <b>{t(S.satWin)}</b>
            {`: ${KEY.satLo.toFixed(2)} – ${KEY.satHi.toFixed(2)} V`}
          </p>
        </Callout>
        <Related ids={['mosRegion', 'mosDynamic']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.noiseTitle)} note={t(S.noiseNote)}>
        <Seg
          options={SENDS.map((s) => ({ id: s.id, label: s.label }))}
          value={send}
          onChange={(id) => {
            setSend(id)
            pickNoise(id, noise)
          }}
        />
        <div className="knob-row">
          <Knob
            label={S.noise}
            value={noise}
            unit="V"
            min={0}
            max={2}
            step={0.05}
            onChange={(v) => {
              const next = round2(v)
              setNoise(next)
              pickNoise(send, next)
            }}
          />
        </div>
        <NoiseFig send1={send === 'one'} vr={read.vr} />
        <Readout
          items={[
            { label: 'VM', value: `${KEY.vm.toFixed(2)} V` },
            { label: 'VIL / VIH', value: `${KEY.vil.toFixed(2)} / ${KEY.vih.toFixed(2)} V` },
            { label: 'VOL / VOH', value: `${KEY.vol.toFixed(2)} / ${KEY.voh.toFixed(2)} V` },
            { label: 'NML = VIL − VOL', value: `${KEY.nml.toFixed(2)} V` },
            { label: 'NMH = VOH − VIH', value: `${KEY.nmh.toFixed(2)} V` },
          ]}
        />
        <Readout
          items={[
            { label: S.received, value: `${read.vr.toFixed(2)} V` },
            { label: S.margin, value: `${read.margin.toFixed(2)} V` },
            { label: S.verdict, value: t(read.ok ? S.readOk : S.readBad), state: read.ok ? 'pass' : 'fail' },
          ]}
        />
        <Callout tone={read.ok ? 'ok' : 'bad'}>
          <p>{t(read.ok ? NOISE_TEXT.ok : NOISE_TEXT.bad)}</p>
        </Callout>
        <Callout>
          <RefP text={NOISE_TEXT.vtc} onOpen={onModuleChange} />
          <RefP text={NOISE_TEXT.unity} onOpen={onModuleChange} />
          <RefP text={NOISE_TEXT.margins} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['fBasics', 'pDigital', 'fDc', 'dc']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.powerTitle)} note={t(S.powerNote)}>
        <Cards
          items={POWERS}
          activeId={power}
          cols={3}
          onPick={(item) => {
            setPower(item.id)
            setNote({ kicker: S.kickerPower, title: item.title, text: item.text })
          }}
        />
        <Callout>
          <p>
            <b>{t(powerItem.title)}</b>
          </p>
          <RefP text={powerItem.text} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['fDc', 'dc', 'vate', 'mosDynamic']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.calcTitle)}>
        <div className="knob-row">
          <Knob
            label={S.cap}
            value={cPf}
            unit="pF"
            min={1}
            max={100}
            step={1}
            onChange={(v) => {
              setCPf(v)
              showCalc()
            }}
          />
          <Knob
            label={S.volt}
            value={vSup}
            unit="V"
            min={0.5}
            max={VDD}
            step={0.05}
            onChange={(v) => {
              setVSup(round2(v))
              showCalc()
            }}
          />
          <Knob
            label={S.freq}
            value={fMhz}
            unit="MHz"
            min={1}
            max={500}
            step={1}
            onChange={(v) => {
              setFMhz(v)
              showCalc()
            }}
          />
        </div>
        <PowerFig c={cPf} v={vSup} f={fMhz} />
        <Readout
          items={[
            { label: S.pNow, value: fmtP(p) },
            { label: S.pHalf, value: fmtP(pHalf) },
            { label: S.eCycle, value: fmtE(eCycle) },
            { label: S.iAvg, value: `${((p / vSup) * 1e3).toFixed(2)} mA` },
          ]}
        />
        <Callout tone="warn">
          <p>{t(CALC_TEXT)}</p>
        </Callout>
        <Related ids={['mosGates', 'mosDynamic']} onOpen={onModuleChange} />
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
