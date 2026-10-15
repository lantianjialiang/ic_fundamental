import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { StepControls, useStepPlayer } from '../../lab/StepPlayer'
import { type ModuleId } from '../catalog'
import { Callout, Readout, Seg } from '../fund/parts'
import { RefParas, RefP, Related, type PrepNote } from './common'
import { CPFT, FLOW, INSIDE, INTRO, PARTS, PKGS, QUIZ, S, TAKEAWAY, type InsideMode, type PartId, type PkgId, type StageId } from './data/package'
import { CpFtFig, FlowFig, InsideFig, PackageFig } from './PackageFigs'
import './prep.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const MODES: Array<{ id: InsideMode; label: typeof S.wire }> = [
  { id: 'wire', label: S.wire },
  { id: 'flip', label: S.flip },
]

export function PrepPackagePage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const flow = useStepPlayer(FLOW.length, 2000)
  const [pkg, setPkg] = useState<PkgId>(PKGS[0].id)
  const [mode, setMode] = useState<InsideMode>(MODES[0].id)
  const [part, setPart] = useState<PartId>(INSIDE[MODES[0].id][0])
  const [stage, setStage] = useState<StageId>(CPFT[0].id)
  const [note, setNote] = useState<PrepNote | null>(null)

  const pkgItem = PKGS.find((p) => p.id === pkg) ?? PKGS[0]
  const partItem = PARTS[part]
  const flowItem = FLOW[flow.step]
  const shown: PrepNote = note ?? { kicker: S.kickerPkg, title: { zh: pkgItem.name, en: pkgItem.name }, text: pkgItem.text }

  const flowPlayer = {
    ...flow,
    next: () => {
      setNote({ kicker: S.kickerFlow, title: FLOW[Math.min(flow.step + 1, FLOW.length - 1)].title, text: FLOW[Math.min(flow.step + 1, FLOW.length - 1)].text })
      flow.next()
    },
    goTo: (i: number) => {
      setNote({ kicker: S.kickerFlow, title: FLOW[i].title, text: FLOW[i].text })
      flow.goTo(i)
    },
    toggle: () => {
      setNote(null)
      flow.toggle()
    },
  }

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ui.pPackage.title)}
      goal={t(ui.pPackage.goal)}
      kicker={t(shown.kicker)}
      asideTitle={t(shown.title)}
      asideText={t(shown.text)}
      asideLater={t(S.asideLater)}
      nextId="pParts"
      nextLabel={t(S.next)}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.galleryTitle)} note={t(S.galleryNote)}>
        <Seg
          options={PKGS.map((p) => ({ id: p.id, label: p.name }))}
          value={pkg}
          onChange={(id) => {
            setPkg(id)
            setNote(null)
          }}
        />
        <PackageFig id={pkg} />
        <Readout
          items={[
            { label: S.pitch, value: pkgItem.pitch },
            { label: S.mount, value: t(pkgItem.mount) },
            { label: S.pins, value: String(pkgItem.pins) },
          ]}
        />
        <Callout>
          <p>
            <b>{`${pkgItem.name} · ${t(pkgItem.full)}`}</b>
          </p>
          <p>{t(pkgItem.text)}</p>
          <p>
            <b>{t(S.forTest)}</b>
            {t(pkgItem.test)}
          </p>
        </Callout>
      </Section>

      <Section title={t(S.insideTitle)} note={t(S.insideNote)}>
        <Seg
          options={MODES}
          value={mode}
          onChange={(id) => {
            setMode(id)
            setPart(INSIDE[id][0])
          }}
        />
        <InsideFig
          mode={mode}
          active={part}
          onPick={(id) => {
            setPart(id)
            setNote({ kicker: S.kickerInside, title: PARTS[id].title, text: PARTS[id].text })
          }}
        />
        <Callout tone="warn">
          <p>
            <b>{t(partItem.title)}</b>
          </p>
          <RefP text={partItem.text} onOpen={onModuleChange} />
        </Callout>
        <Related ids={['fOpens', 'connection', 'fQualify', 'pcbStack']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.flowTitle)} note={t(S.flowNote)}>
        <FlowFig step={flow.step} />
        <StepControls player={flowPlayer} stepLabels={FLOW.map((f) => f.title)} />
        <Callout>
          <p>
            <b>{`${flow.step + 1}. ${t(flowItem.title)}`}</b>
          </p>
          <p>{t(flowItem.text)}</p>
        </Callout>
      </Section>

      <Section title={t(S.cpftTitle)} note={t(S.cpftNote)}>
        <CpFtFig active={stage} onPick={setStage} />
        <div className="prep-compare">
          {CPFT.map((col) => (
            <button
              key={col.id}
              type="button"
              className={`prep-compare__col${stage === col.id ? ' is-active' : ''}`}
              aria-pressed={stage === col.id}
              onClick={() => setStage(col.id)}
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
        <Related ids={['intro', 'connection', 'fAte', 'fOpens']} onOpen={onModuleChange} />
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
