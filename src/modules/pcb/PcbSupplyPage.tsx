import { useState } from 'react'
import { LessonRefText } from '../../home/LessonRefText'
import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { StepControls, useStepPlayer } from '../../lab/StepPlayer'
import { type ModuleId } from '../catalog'
import { Callout, Cards } from '../fund/parts'
import { RefP, RefParas, Related, type PrepNote } from '../prep/common'
import { BUY, LIFECYCLE } from './data/pcbSupplyBuy'
import { NODES } from './data/pcbSupplyFlow'
import { CHANNELS, FILES } from './data/pcbSupplyParts'
import { PANEL_ITEMS } from './data/pcbSupplyMake'
import { QUIZ } from './data/pcbSupplyQuiz'
import { ZONES } from './data/pcbSupplyReflow'
import { SMT } from './data/pcbSupplySmt'
import { INTRO, S, TAKEAWAY } from './data/pcbSupply'
import { PCB_META } from './meta'
import { ChannelFig, FlowFig } from './SupplyFigs'
import { PanelFig } from './SupplyFigs2'
import { SmtFig } from './SupplyFigs4'
import { CostPanel, ReflowPanel } from './SupplySections'
import '../prep/prep.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }
type Focus = 'node' | 'file' | 'channel' | 'buy' | 'cost' | 'panel' | 'smt' | 'zone'

function Line({ label, text, onOpen }: { label: LText; text: LText; onOpen: (id: ModuleId) => void }) {
  const { t } = useLocale()
  return (
    <p>
      <b>{t(label)}</b>
      <LessonRefText text={text} onOpenLesson={onOpen} />
    </p>
  )
}

export function PcbSupplyPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const smt = useStepPlayer(SMT.length, 2400)
  const [focus, setFocus] = useState<Focus>('node')
  const [nodeId, setNodeId] = useState(NODES[0].id)
  const [fileId, setFileId] = useState(FILES[0].id)
  const [chanId, setChanId] = useState(CHANNELS[0].id)
  const [buyId, setBuyId] = useState(BUY[0].id)
  const [panelId, setPanelId] = useState(PANEL_ITEMS[0].id)
  const [zone, setZone] = useState(ZONES[0].id)

  const node = NODES.find((n) => n.id === nodeId) ?? NODES[0]
  const file = FILES.find((f) => f.id === fileId) ?? FILES[0]
  const chan = CHANNELS.find((c) => c.id === chanId) ?? CHANNELS[0]
  const buy = BUY.find((b) => b.id === buyId) ?? BUY[0]
  const panel = PANEL_ITEMS.find((p) => p.id === panelId) ?? PANEL_ITEMS[0]
  const zoneItem = ZONES.find((z) => z.id === zone) ?? ZONES[0]
  const step = SMT[smt.step]

  const notes: Record<Focus, PrepNote> = {
    node: { kicker: S.kickerFlow, title: node.name, text: node.design },
    file: { kicker: S.kickerFiles, title: file.title, text: file.text },
    channel: { kicker: S.kickerChannel, title: chan.title, text: chan.text },
    buy: { kicker: S.kickerBuy, title: buy.title, text: buy.text },
    cost: { kicker: S.kickerCost, title: S.costTitle, text: S.costNote },
    panel: { kicker: S.kickerPanel, title: panel.name, text: panel.text },
    smt: { kicker: S.kickerSmt, title: step.title, text: step.text },
    zone: { kicker: S.kickerReflow, title: zoneItem.name, text: zoneItem.text },
  }
  const shown = notes[focus]

  const smtPlayer = {
    ...smt,
    next: () => {
      setFocus('smt')
      smt.next()
    },
    goTo: (i: number) => {
      setFocus('smt')
      smt.goTo(i)
    },
    toggle: () => {
      setFocus('smt')
      smt.toggle()
    },
    reset: () => {
      setFocus('smt')
      smt.reset()
    },
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(PCB_META.pcbSupply.title)}
      goal={t(PCB_META.pcbSupply.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="pcbFlow"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.flowTitle)} note={t(S.flowNote)}>
        <FlowFig
          active={nodeId}
          onPick={(id) => {
            setNodeId(id)
            setFocus('node')
          }}
        />
        <Callout>
          <p>
            <b>{t(node.name)}</b>
          </p>
          <Line label={S.inputs} text={node.inputs} onOpen={onModuleChange} />
          <Line label={S.outputs} text={node.outputs} onOpen={onModuleChange} />
          <Line label={S.delays} text={node.delays} onOpen={onModuleChange} />
          <Line label={S.design} text={node.design} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['pcbFab', 'pcbFlow', 'pcbDfm']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.filesTitle)} note={t(S.filesNote)}>
        <Cards
          items={FILES}
          activeId={fileId}
          cols={3}
          onPick={(item) => {
            setFileId(item.id as typeof fileId)
            setFocus('file')
          }}
        />
        <Callout>
          <p>
            <b>{`${t(file.title)} · ${t(file.sub)}`}</b>
          </p>
          <Line label={S.whatLabel} text={file.text} onOpen={onModuleChange} />
          <Line label={S.usedLabel} text={file.used} onOpen={onModuleChange} />
          <Line label={S.trapLabel} text={file.trap} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['pcbTools', 'pcbFlow', 'pcbDfm']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.channelTitle)} note={t(S.channelNote)}>
        <ChannelFig
          active={chanId}
          onPick={(id) => {
            setChanId(id)
            setFocus('channel')
          }}
        />
        <Callout tone={chanId === 'broker' ? 'warn' : undefined}>
          <p>
            <b>{t(chan.title)}</b>
          </p>
          <RefP text={chan.text} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['pIndustry', 'pcbFlow']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.buyTitle)} note={t(S.buyNote)}>
        <Cards
          items={BUY}
          activeId={buyId}
          cols={3}
          onPick={(item) => {
            setBuyId(item.id as typeof buyId)
            setFocus('buy')
          }}
        />
        <Callout>
          <p>
            <b>{t(buy.title)}</b>
          </p>
          <RefP text={buy.text} onOpen={onModuleChange} />
          <RefP text={buy.design} onOpen={onModuleChange} />
        </Callout>
        <h3>{t(S.lifeTitle)}</h3>
        <div className="prep-table-wrap">
          <table className="prep-table">
            <thead>
              <tr>
                <th>{t(S.lifeState)}</th>
                <th>{t(S.lifeMeaning)}</th>
                <th>{t(S.lifeAction)}</th>
              </tr>
            </thead>
            <tbody>
              {LIFECYCLE.map((row) => (
                <tr key={row.id}>
                  <td>
                    <b>{row.name}</b>
                  </td>
                  <td>{t(row.meaning)}</td>
                  <td>{t(row.action)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title={t(S.costTitle)} note={t(S.costNote)}>
        <div onPointerDown={() => setFocus('cost')} onKeyDown={() => setFocus('cost')}>
          <CostPanel />
        </div>
        <Related ids={['pcbMaterial', 'pcbStack', 'pcbFab']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.panelTitle)} note={t(S.panelNote)}>
        <PanelFig
          active={panelId}
          onPick={(id) => {
            setPanelId(id)
            setFocus('panel')
          }}
        />
        <Callout>
          <p>
            <b>{t(panel.name)}</b>
          </p>
          <p>{t(panel.text)}</p>
        </Callout>
        <Related ids={['pcbBasics', 'pcbDfm']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.smtTitle)} note={t(S.smtNote)}>
        <SmtFig step={smt.step} onPick={smtPlayer.goTo} />
        <StepControls player={smtPlayer} stepLabels={SMT.map((s) => s.short)} />
        <Callout>
          <p>
            <b>{`${smt.step + 1}. ${t(step.title)}`}</b>
          </p>
          <RefP text={step.text} onOpen={onModuleChange} />
          <Line label={S.flawLabel} text={step.flaw} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['pPackage', 'fAte', 'pcbDfm']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.reflowTitle)} note={t(S.reflowNote)}>
        <ReflowPanel
          zone={zone}
          onZone={(id) => {
            setZone(id)
            setFocus('zone')
          }}
        />
        <Related ids={['pcbMaterial', 'pcbFab']} onOpen={onModuleChange} />
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
