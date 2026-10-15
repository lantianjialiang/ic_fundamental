import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { StepControls, useStepPlayer } from '../../lab/StepPlayer'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { RefP, RefParas, Related, type PrepNote } from '../prep/common'
import { DIODE_LABEL, DIODE_MODES, INTRO, RECOVERY, S, type DiodeMode } from './data/mosReal'
import { QUIZ } from './data/mosRealQuiz'
import { CLAMP_FACTOR, ESD_LABEL, ESD_PARTS, ESD_STATES, ESD_TEXT, LATCH_STEPS, type EsdId, type EsdState } from './data/mosRealRel'
import { SCALE_LABEL, SCALE_NODE, SCALE_TEXT, TAKEAWAY } from './data/mosRealScale'
import { SUB_ITEMS, SUB_LABEL, SUB_TEXT, TEMP_LABEL, TEMP_NOTE, TEMP_TEXT, type SubId } from './data/mosRealSub'
import { MOS_META } from './meta'
import { VDD } from './model'
import { DiodeFig, fmtAmp, fmtTimes, pow10, SubFig } from './RealFigs'
import { EsdFig, TempFig } from './RealFigs2'
import { LatchFig } from './RealFigs3'
import { ScaleFig } from './RealFigs4'
import { bodyVf, energyRel, idTotal, ioffOf, NODES, PAR_TOTAL, rdsAt, shareHot, swing, T_REF, TEACH, vthAt, ztc, type NodeId } from './realModel'
import '../prep/prep.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const sci = (x: number) => {
  const e = Math.floor(Math.log10(x))
  return `${(x / 10 ** e).toFixed(1)} × ${pow10(e)}`
}

export function MosRealPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [mode, setMode] = useState<DiodeMode>(DIODE_MODES[0].id)
  const [iLoad, setILoad] = useState(10)
  const [subId, setSubId] = useState<SubId>(SUB_ITEMS[0].id)
  const [vgs, setVgs] = useState(0.4)
  const [temp, setTemp] = useState(25)
  const [esdId, setEsdId] = useState<EsdId>(ESD_PARTS[0].id)
  const [vApplied, setVApplied] = useState(0)
  const [nodeId, setNodeId] = useState<NodeId>(NODES[0].id)
  const latch = useStepPlayer(LATCH_STEPS.length, 2400)
  const [note, setNote] = useState<PrepNote | null>(null)

  const modeItem = DIODE_MODES.find((m) => m.id === mode) ?? DIODE_MODES[0]
  const shown: PrepNote = note ?? { kicker: S.kickerDiode, title: modeItem.title, text: modeItem.text }

  // 体二极管：同一电流走二极管或沟道
  const vf = bodyVf(iLoad)
  const drop = iLoad * rdsAt(T_REF)
  const vsw = mode === 'dead' ? `= −${vf.toFixed(2)} V` : mode === 'sync' ? `= −${drop.toFixed(2)} V` : '≈ VIN'
  const vdsText = mode === 'dead' ? `−${vf.toFixed(2)} V` : mode === 'sync' ? `−${drop.toFixed(2)} V` : '+VIN'
  const lossW = mode === 'dead' ? vf * iLoad : mode === 'sync' ? iLoad * iLoad * rdsAt(T_REF) : 0
  const pathLabel = mode === 'dead' ? DIODE_LABEL.viaDiode : mode === 'sync' ? DIODE_LABEL.viaChannel : DIODE_LABEL.viaNone

  // 亚阈值
  const subItem = SUB_ITEMS.find((s) => s.id === subId) ?? SUB_ITEMS[0]
  const dev = { ...TEACH, n: subItem.n }
  const ioff = idTotal(0, VDD, temp, dev)
  const ioff25 = idTotal(0, VDD, T_REF, dev)
  const ion = idTotal(VDD, VDD, temp, dev)
  const idNow = idTotal(vgs, VDD, temp, dev)

  // 温度
  const ia = shareHot(temp)
  const tempNote: PrepNote = { kicker: S.kickerTemp, title: TEMP_NOTE.title, text: TEMP_NOTE.text }

  // ESD
  const esdItem = ESD_PARTS.find((p) => p.id === esdId) ?? ESD_PARTS[0]
  const stateOf = (v: number, abs: number): EsdState => {
    const a = Math.abs(v)
    if (a <= abs) {
      return 'safe'
    }
    return a < abs * CLAMP_FACTOR ? 'over' : 'clamp'
  }
  const esdState = stateOf(vApplied, esdItem.abs)
  const esdInfo = ESD_STATES[esdState]

  // 闩锁
  const latchItem = LATCH_STEPS[latch.step]
  const noteOfLatch = (i: number): PrepNote => ({ kicker: S.kickerLatch, title: LATCH_STEPS[i].title, text: LATCH_STEPS[i].text })
  const latchPlayer = {
    ...latch,
    next: () => {
      setNote(noteOfLatch(Math.min(latch.step + 1, LATCH_STEPS.length - 1)))
      latch.next()
    },
    goTo: (i: number) => {
      setNote(noteOfLatch(i))
      latch.goTo(i)
    },
    toggle: () => {
      setNote(noteOfLatch(latch.step))
      latch.toggle()
    },
    reset: () => {
      setNote(noteOfLatch(0))
      latch.reset()
    },
  }

  // 工艺缩放
  const node = NODES.find((n) => n.id === nodeId) ?? NODES[0]
  const nodeInfo = SCALE_NODE[node.id]
  const pickNode = (id: NodeId) => {
    setNodeId(id)
    setNote({ kicker: S.kickerScale, title: SCALE_NODE[id].title, text: SCALE_NODE[id].text })
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MOS_META.mosReal.title)}
      goal={t(MOS_META.mosReal.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="mosSelect"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.diodeTitle)} note={t(S.diodeNote)}>
        <Seg
          options={DIODE_MODES.map((m) => ({ id: m.id, label: m.label }))}
          value={mode}
          onChange={(id) => {
            setMode(id)
            const item = DIODE_MODES.find((m) => m.id === id) ?? DIODE_MODES[0]
            setNote({ kicker: S.kickerDiode, title: item.title, text: item.text })
          }}
        />
        <div className="knob-row">
          <Knob label={DIODE_LABEL.current} value={iLoad} unit="A" min={1} max={20} step={1} onChange={setILoad} />
        </div>
        <DiodeFig mode={mode} vsw={vsw} />
        <Readout
          items={[
            { label: DIODE_LABEL.vds, value: vdsText },
            { label: DIODE_LABEL.loss, value: `${lossW.toFixed(2)} W`, state: mode === 'dead' ? 'fail' : mode === 'sync' ? 'pass' : undefined },
            { label: DIODE_LABEL.path, value: t(pathLabel) },
          ]}
        />
        <Callout tone={modeItem.tone}>
          <p>
            <b>{t(modeItem.title)}</b>
          </p>
          <p>{t(modeItem.text)}</p>
        </Callout>
        <Callout tone="warn">
          <RefParas paras={RECOVERY} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['mosApps', 'pParts', 'mosPrimer', 'mosSwitch']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.subTitle)} note={t(S.subNote)}>
        <Seg
          options={SUB_ITEMS.map((s) => ({ id: s.id, label: s.label }))}
          value={subId}
          onChange={(id) => {
            setSubId(id)
            const item = SUB_ITEMS.find((s) => s.id === id) ?? SUB_ITEMS[0]
            setNote({ kicker: S.kickerSub, title: item.title, text: item.text })
          }}
        />
        <div className="knob-row">
          <Knob
            label={SUB_LABEL.vgs}
            value={vgs}
            unit="V"
            min={0}
            max={1.5}
            step={0.05}
            onChange={(v) => {
              setVgs(Math.round(v * 100) / 100)
              setNote({ kicker: S.kickerSub, title: subItem.title, text: subItem.text })
            }}
          />
          <Knob
            label={SUB_LABEL.temp}
            value={temp}
            unit="°C"
            min={-40}
            max={150}
            step={5}
            onChange={(v) => {
              setTemp(v)
              setNote(tempNote)
            }}
          />
        </div>
        <SubFig n={subItem.n} temp={temp} vgs={vgs} />
        <Readout
          items={[
            { label: SUB_LABEL.swing, value: `${(swing(temp, subItem.n) * 1000).toFixed(0)} mV` },
            { label: SUB_LABEL.id, value: fmtAmp(idNow) },
            { label: SUB_LABEL.ioff, value: fmtAmp(ioff) },
            { label: SUB_LABEL.ratio, value: fmtTimes(ioff / ioff25) },
            { label: SUB_LABEL.onoff, value: sci(ion / ioff) },
          ]}
        />
        <Callout>
          {SUB_TEXT.map((para) => (
            <RefP key={para.zh} text={para} onOpen={onModuleChange} />
          ))}
        </Callout>
        <Related ids={['mosRegion', 'dc', 'fDc', 'vate']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.tempTitle)} note={t(S.tempNote)}>
        <div className="knob-row">
          <Knob
            label={TEMP_LABEL.temp}
            value={temp}
            unit="°C"
            min={-40}
            max={150}
            step={5}
            onChange={(v) => {
              setTemp(v)
              setNote(tempNote)
            }}
          />
        </div>
        <TempFig temp={temp} />
        <Readout
          items={[
            { label: TEMP_LABEL.vth, value: `${vthAt(temp).toFixed(2)} V` },
            { label: TEMP_LABEL.rds, value: `${(rdsAt(temp) * 1000).toFixed(1)} mΩ` },
            { label: TEMP_LABEL.ratio, value: fmtTimes(rdsAt(temp) / rdsAt(T_REF)) },
            { label: TEMP_LABEL.ztc, value: `${ztc(temp).toFixed(2)} V` },
            { label: TEMP_LABEL.share, value: `${ia.toFixed(1)} / ${(PAR_TOTAL - ia).toFixed(1)} A` },
          ]}
        />
        {TEMP_TEXT.map((item) => (
          <Callout key={item.title.zh} tone={item.tone}>
            <p>
              <b>{t(item.title)}</b>
            </p>
            <RefP text={item.text} onOpen={onModuleChange} />
          </Callout>
        ))}
        <Related ids={['mosSelect', 'mosApps', 'mosSwitch']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.esdTitle)} note={t(S.esdNote)}>
        <Seg
          options={ESD_PARTS.map((p) => ({ id: p.id, label: p.label }))}
          value={esdId}
          onChange={(id) => {
            setEsdId(id)
            const item = ESD_PARTS.find((p) => p.id === id) ?? ESD_PARTS[0]
            setNote({ kicker: S.kickerEsd, title: item.title, text: item.text })
          }}
        />
        <div className="knob-row">
          <Knob
            label={ESD_LABEL.knob}
            value={vApplied}
            unit="V"
            min={-30}
            max={30}
            step={1}
            onChange={(v) => {
              setVApplied(v)
              const info = ESD_STATES[stateOf(v, esdItem.abs)]
              setNote({ kicker: S.kickerEsd, title: info.title, text: info.text })
            }}
          />
        </div>
        <EsdFig abs={esdItem.abs} vgs={vApplied} state={esdState} />
        <Readout
          items={[
            { label: ESD_LABEL.abs, value: `±${esdItem.abs} V` },
            { label: ESD_LABEL.state, value: t(esdInfo.short), state: esdState === 'safe' ? 'pass' : 'fail' },
            { label: ESD_LABEL.stress, value: `${((Math.abs(vApplied) / esdItem.abs) * 100).toFixed(0)} %` },
          ]}
        />
        <Callout tone={esdInfo.tone}>
          <p>
            <b>{t(esdInfo.title)}</b>
          </p>
          <p>{t(esdInfo.text)}</p>
        </Callout>
        <Callout>
          <RefParas paras={ESD_TEXT} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['fOpens', 'mosApps', 'mosSwitch', 'mosSelect']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.latchTitle)} note={t(S.latchNote)}>
        <LatchFig step={latch.step} />
        <StepControls player={latchPlayer} stepLabels={LATCH_STEPS.map((s) => s.title)} />
        <Callout tone={latch.step >= 3 ? 'bad' : 'warn'}>
          <p>
            <b>{`${latch.step + 1}. ${t(latchItem.title)}`}</b>
          </p>
          <RefP text={latchItem.text} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['latch', 'fLatch', 'pSilicon', 'mosChannel']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.scaleTitle)} note={t(S.scaleNote)}>
        <Seg options={NODES.map((n) => ({ id: n.id, label: { zh: n.name, en: n.name } }))} value={nodeId} onChange={pickNode} />
        <ScaleFig node={node} onPick={pickNode} />
        <Readout
          items={[
            { label: SCALE_LABEL.vdd, value: `${node.vdd.toFixed(1)} V` },
            { label: SCALE_LABEL.vth, value: `${node.dev.vth0.toFixed(2)} V` },
            { label: SCALE_LABEL.vthEff, value: `${(node.dev.vth0 - node.dev.dibl * node.vdd).toFixed(2)} V` },
            { label: SCALE_LABEL.dibl, value: `${(node.dev.dibl * 1000).toFixed(0)} mV/V` },
            { label: SCALE_LABEL.swing, value: `${(swing(T_REF, node.dev.n) * 1000).toFixed(0)} mV` },
            { label: SCALE_LABEL.ioff, value: fmtTimes(ioffOf(node) / ioffOf(NODES[0])) },
            { label: SCALE_LABEL.energy, value: fmtTimes(energyRel(node)) },
          ]}
        />
        <Callout>
          <p>
            <b>{t(nodeInfo.title)}</b>
          </p>
          <p>{t(nodeInfo.text)}</p>
        </Callout>
        {SCALE_TEXT.map((item) => (
          <Callout key={item.title.zh} tone={item.tone}>
            <p>
              <b>{t(item.title)}</b>
            </p>
            <RefP text={item.text} onOpen={onModuleChange} />
          </Callout>
        ))}
        <Related ids={['pHistory', 'pSilicon', 'mosInverter']} onOpen={onModuleChange} />
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
