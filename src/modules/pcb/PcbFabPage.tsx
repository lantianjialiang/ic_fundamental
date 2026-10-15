import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { useStepPlayer } from '../../lab/StepPlayer'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { RefP, RefParas, Related, type PrepNote } from '../prep/common'
import { EtchFig, etchVerdicts } from './FabEtchFig'
import { FabControls, FabLegend, FabTimeline } from './FabControls'
import { FabBoardFig } from './FabFigs2'
import { INTRO, QUIZ, RULE_ROWS, S, STEPS, TAKEAWAY, defectsOf } from './data/pcbFab'
import { FRAMES, firstFrameOfStep, stepOfFrame } from './data/pcbFabModel'
import { etchCheck, umToMil, type EtchLayer } from './data/pcbFabRules'
import { PCB_META } from './meta'
import '../prep/prep.css'
import './pcbFab.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const LAYERS: Array<{ id: EtchLayer; label: typeof S.layerInner }> = [
  { id: 'inner', label: S.layerInner },
  { id: 'outer', label: S.layerOuter },
]
const COMPS: Array<{ id: 'off' | 'on'; label: typeof S.compOff }> = [
  { id: 'off', label: S.compOff },
  { id: 'on', label: S.compOn },
]

export function PcbFabPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const player = useStepPlayer(FRAMES.length, 1500)
  const [picked, setPicked] = useState<string | null>(null)
  const [note, setNote] = useState<{ at: number; note: PrepNote } | null>(null)
  const [layer, setLayer] = useState<EtchLayer>(LAYERS[0].id)
  const [comp, setComp] = useState<'off' | 'on'>(COMPS[0].id)
  const [w, setW] = useState(100)
  const [s, setS] = useState(100)

  const frame = FRAMES[player.step]
  const stepIndex = stepOfFrame(player.step)
  const step = STEPS[stepIndex]
  const defects = defectsOf(step.id)
  const defect = defects.find((d) => `${step.id}/${d.id}` === picked) ?? defects[0]
  const shown: PrepNote = note && note.at === stepIndex ? note.note : { kicker: S.kickerStep, title: step.title, text: step.what }
  const result = etchCheck(layer, w, s, comp === 'on')
  const verdicts = etchVerdicts(result, w, comp === 'on')

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PCB_META.pcbFab.title)}
      goal={t(PCB_META.pcbFab.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="pcbSupply"
      nextLabel={t(S.next2)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['pcbMaterial', 'pcbStack', 'pSilicon']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.flowTitle)} note={t(S.flowNote)}>
        <FabTimeline
          active={stepIndex}
          onPick={(i) => {
            setNote(null)
            player.goTo(firstFrameOfStep(i))
          }}
        />
        <FabBoardFig frame={frame.id} hot={defect ? defect.hot : null} />
        <FabLegend />
        <FabControls player={player} onUse={() => setNote(null)} />
        <Callout>
          <p>
            <b>{`${stepIndex + 1}. ${t(step.title)} · ${t(frame.label)}`}</b>
          </p>
          <p>{t(frame.says)}</p>
          <p>
            <b>{t(S.what)}</b>
            {t(step.what)}
          </p>
          <p>
            <b>{t(S.equip)}</b>
            {t(step.equip)}
          </p>
        </Callout>
        <Callout tone="warn">
          <p>
            <b>{t(S.rule)}</b>
          </p>
          {step.rules.map((rule) => (
            <div key={rule.title.zh}>
              <p>
                <b>{t(rule.title)}</b>
              </p>
              <RefP text={rule.text} onOpen={onModuleChange} />
            </div>
          ))}
        </Callout>
        <h3>{t(S.defectTitle)}</h3>
        <p className="prep-muted">{t(S.defectNote)}</p>
        <Seg
          options={defects.map((d) => ({ id: d.id, label: d.title }))}
          value={defect.id}
          onChange={(id) => {
            const next = defects.find((d) => d.id === id) ?? defects[0]
            setPicked(`${step.id}/${next.id}`)
            setNote({ at: stepIndex, note: { kicker: S.kickerDefect, title: next.title, text: next.effect } })
          }}
        />
        <Callout tone="bad">
          <p>
            <b>{t(S.cause)}</b>
            {t(defect.cause)}
          </p>
          <p>
            <b>{t(S.effect)}</b>
            {t(defect.effect)}
          </p>
          <p>
            <b>{t(S.fix)}</b>
            {t(defect.fix)}
          </p>
        </Callout>
        <Related ids={['pcbMaterial', 'pcbStack', 'pSilicon', 'fOpens', 'pcbDfm']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.etchTitle)} note={t(S.etchNote)}>
        <div className="prep-actions">
          <Seg options={LAYERS} value={layer} onChange={setLayer} />
          <Seg options={COMPS} value={comp} onChange={setComp} />
        </div>
        <EtchFig layer={layer} w={w} s={s} comp={comp === 'on'} />
        <div className="knob-row">
          <Knob label={S.width} value={w} unit="µm" min={30} max={200} step={5} onChange={setW} />
          <Knob label={S.space} value={s} unit="µm" min={30} max={200} step={5} onChange={setS} />
        </div>
        <Readout
          items={[
            { label: S.undercut, value: `${result.u.toFixed(1)} µm` },
            { label: S.topW, value: `${Math.max(result.wt, 0).toFixed(0)} µm`, state: result.trace === 'ok' ? 'pass' : result.trace === 'open' ? 'fail' : undefined },
            { label: S.baseGap, value: `${Math.max(result.sf, 0).toFixed(0)} µm`, state: result.space === 'ok' ? 'pass' : 'fail' },
            { label: S.minWS, value: `${result.minW.toFixed(0)} / ${result.minS.toFixed(0)} µm (${umToMil(result.minW).toFixed(1)} / ${umToMil(result.minS).toFixed(1)} mil)` },
          ]}
        />
        {verdicts.map((v) => (
          <Callout key={v.text.zh} tone={v.tone === 'warn' ? undefined : v.tone}>
            <p>{t(v.text)}</p>
          </Callout>
        ))}
        <Related ids={['fOpens', 'pcbDfm']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.rulesTitle)} note={t(S.rulesNote)}>
        <div className="prep-table-wrap">
          <table className="prep-table">
            <thead>
              <tr>
                <th>{t(S.colStep)}</th>
                <th>{t(S.colRule)}</th>
                <th>{t(S.colValue)}</th>
                <th>{t(S.colWhy)}</th>
              </tr>
            </thead>
            <tbody>
              {RULE_ROWS.map((row) => (
                <tr key={row.rule.zh}>
                  <td>{t(row.step)}</td>
                  <td>
                    <b>{t(row.rule)}</b>
                  </td>
                  <td>{row.value}</td>
                  <td>{t(row.why)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Related ids={['pcbDfm', 'pcbStack']} onOpen={onModuleChange} />
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
