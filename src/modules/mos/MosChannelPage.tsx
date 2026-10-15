import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { StepControls, useStepPlayer } from '../../lab/StepPlayer'
import { type ModuleId } from '../catalog'
import { Callout, Cards, Knob, Readout, Seg, fmtV } from '../fund/parts'
import { RefP, RefParas, Related, type PrepNote } from '../prep/common'
import { INTRO, PARTS, S, TAKEAWAY, type PartId } from './data/mosChannel'
import { CAP_STEPS, POL_COLS, POL_WHY, VTH_CARDS, VTH_FORMULA, type CapStep } from './data/mosChannelCards'
import { accRatio, channelRatio, chState, depletionRatio, gateRatio, VGS_RANGE, VT_ABS, vnOf, vthOf, type Dev } from './data/mosChannelModel'
import { QUIZ } from './data/mosChannelQuiz'
import { RO, STATE_SHORT, STATE_TEXT, FIG } from './data/mosChannelText'
import { MOS_META } from './meta'
import { DeviceFig } from './ChannelFigs'
import { ChargePlot, VthPlot } from './ChannelFigs2'
import '../prep/prep.css'
import './mosChannel.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const DEVS: Array<{ id: Dev; label: LText }> = [
  { id: 'n', label: S.nmos },
  { id: 'p', label: S.pmos },
]

type Focus = 'part' | 'anim' | 'cap' | 'vth' | 'pol'

const stepVn = (step: CapStep, dev: Dev) => step.vn ?? VT_ABS[dev]
const r2 = (v: number) => Math.round(v * 100) / 100
const pct = (r: number) => `${Math.round(r * 100)} %`

export function MosChannelPage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [dev, setDev] = useState<Dev>(DEVS[0].id)
  const [part, setPart] = useState<PartId>(PARTS[0].id)
  const [vn, setVn] = useState(() => stepVn(CAP_STEPS[0], DEVS[0].id))
  const [card, setCard] = useState(VTH_CARDS[0].id)
  const [focus, setFocus] = useState<Focus>('part')
  const player = useStepPlayer(CAP_STEPS.length, 2400)

  const partItem = PARTS.find((p) => p.id === part) ?? PARTS[0]
  const vt = VT_ABS[dev]
  const st = chState(dev, vn)
  const vgs = r2(dev === 'n' ? vn : -vn)
  const stText = STATE_TEXT[dev][st]
  const jumpId = CAP_STEPS.find((s) => s.st === st)?.id

  const capStep = CAP_STEPS[player.step]
  const capVn = stepVn(capStep, dev)
  const capText = STATE_TEXT[dev][capStep.st]

  const cardItem = VTH_CARDS.find((c) => c.id === card) ?? VTH_CARDS[0]
  const polCol = POL_COLS.find((c) => c.id === dev) ?? POL_COLS[0]
  const sign = dev === 'n' ? '+' : '−'

  let shown: PrepNote = { kicker: S.kickerPart, title: partItem.title, text: partItem.text }
  if (focus === 'anim') {
    shown = { kicker: S.kickerState, title: stText.title, text: stText.text }
  } else if (focus === 'cap') {
    shown = { kicker: S.kickerCap, title: capText.title, text: capStep.balance[dev] }
  } else if (focus === 'vth') {
    shown = { kicker: S.kickerVth, title: cardItem.title, text: cardItem.text }
  } else if (focus === 'pol') {
    shown = { kicker: S.kickerPol, title: polCol.title, text: POL_WHY }
  }

  const pickDev = (id: Dev) => {
    setDev(id)
  }
  const devSeg = <Seg options={DEVS} value={dev} onChange={pickDev} />

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(MOS_META.mosChannel.title)}
      goal={t(MOS_META.mosChannel.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="mosRegion"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.partTitle)} note={t(S.partNote)}>
        {devSeg}
        <DeviceFig
          dev={dev}
          mode="parts"
          active={part}
          caption={FIG.partsCap}
          onPick={(id) => {
            setPart(id)
            setFocus('part')
          }}
        />
        <Cards
          items={PARTS}
          activeId={part}
          cols={3}
          onPick={(item) => {
            setPart(item.id)
            setFocus('part')
          }}
        />
        <Callout>
          <p>
            <b>{t(partItem.title)}</b>
          </p>
          <p>{t(partItem.text)}</p>
        </Callout>
        <Related ids={['pSilicon', 'mosPrimer', 'mosIntro']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.animTitle)} note={t(S.animNote)}>
        {devSeg}
        <p className="prep-muted">{t(S.jump)}</p>
        <Seg
          options={CAP_STEPS.map((s) => ({ id: s.id, label: s.label }))}
          value={jumpId ?? ''}
          onChange={(id) => {
            const target = CAP_STEPS.find((s) => s.id === id)
            if (target) {
              setVn(r2(stepVn(target, dev)))
              setFocus('anim')
            }
          }}
        />
        <div className="knob-row">
          <Knob
            label={S.vgs}
            value={vgs}
            unit="V"
            min={VGS_RANGE[dev].min}
            max={VGS_RANGE[dev].max}
            step={0.05}
            onChange={(v) => {
              setVn(r2(vnOf(dev, v)))
              setFocus('anim')
            }}
          />
        </div>
        <DeviceFig dev={dev} mode="anim" vn={vn} caption={FIG.animCap} />
        <Readout
          items={[
            { label: RO.state, value: t(STATE_SHORT[st]), state: st === 'inv' ? 'pass' : undefined },
            { label: dev === 'n' ? RO.overN : RO.overP, value: fmtV(r2(vgs - vthOf(dev))) },
            { label: RO.charge, value: pct(channelRatio(vn, vt)) },
            { label: RO.depth, value: pct(depletionRatio(vn, vt)) },
          ]}
        />
        <Callout tone={st === 'inv' ? 'ok' : undefined}>
          <p>
            <b>{t(stText.title)}</b>
          </p>
          <p>{t(stText.text)}</p>
        </Callout>
        <h3>{t(S.plotTitle)}</h3>
        <ChargePlot dev={dev} vn={vn} />
        <RefP text={S.afterAnim} onOpen={onModuleChange} />
        <Related ids={['mosRegion', 'mosIntro', 'pSilicon']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.capTitle)} note={t(S.capNote)}>
        {devSeg}
        <div onClickCapture={() => setFocus('cap')}>
          <StepControls player={player} stepLabels={CAP_STEPS.map((s) => s.label)} />
        </div>
        <DeviceFig dev={dev} mode="cap" vn={capVn} caption={FIG.capFigCap} />
        <Readout
          items={[
            { label: RO.gateQ, value: pct(gateRatio(capVn)) },
            { label: RO.accQ, value: pct(accRatio(capVn)) },
            { label: RO.depth, value: pct(depletionRatio(capVn, vt)) },
            { label: RO.charge, value: pct(channelRatio(capVn, vt)) },
          ]}
        />
        <Callout tone={capStep.st === 'inv' ? 'ok' : undefined}>
          <p>
            <b>{t(capText.title)}</b>
          </p>
          <p>{t(capText.text)}</p>
          <p>
            <b>{t(S.why)}</b>
            {t(capStep.balance[dev])}
          </p>
        </Callout>
        <Related ids={['mosIntro', 'pParts', 'mosDynamic']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.vthTitle)} note={t(S.vthNote)}>
        {devSeg}
        <Cards
          items={VTH_CARDS}
          activeId={card}
          cols={4}
          onPick={(item) => {
            setCard(item.id)
            setFocus('vth')
          }}
        />
        <VthPlot dev={dev} shift={cardItem.shift} />
        <Readout
          items={[
            { label: S.vthNow, value: `${sign}${vt.toFixed(2)} V` },
            ...(cardItem.shift > 0
              ? [
                  { label: FIG.vthAfter, value: `${sign}${(vt + cardItem.shift).toFixed(2)} V` },
                  { label: S.shift, value: `${sign}${cardItem.shift.toFixed(2)} V` },
                ]
              : []),
          ]}
        />
        <Callout>
          <p>
            <b>{t(cardItem.title)}</b>
          </p>
          <p>{t(cardItem.text)}</p>
          <p>{t(VTH_FORMULA)}</p>
        </Callout>
        <Related ids={['mosRegion', 'mosReal', 'mosSelect']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.polTitle)} note={t(S.polNote)}>
        <div className="prep-compare">
          {POL_COLS.map((col) => (
            <button
              key={col.id}
              type="button"
              className={`prep-compare__col${dev === col.id ? ' is-active' : ''}`}
              aria-pressed={dev === col.id}
              onClick={() => {
                pickDev(col.id)
                setFocus('pol')
              }}
            >
              <h3>{t(col.title)}</h3>
              <dl>
                {col.rows.map((row) => (
                  <div key={row.k.zh}>
                    <dt>{t(row.k)}</dt>
                    <dd>{t(row.v)}</dd>
                  </div>
                ))}
              </dl>
            </button>
          ))}
        </div>
        <Callout tone="warn">
          <p>{t(POL_WHY)}</p>
        </Callout>
        <Related ids={['mosIntro', 'mosSwitch', 'mosInverter', 'fLatch']} onOpen={onModuleChange} />
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
