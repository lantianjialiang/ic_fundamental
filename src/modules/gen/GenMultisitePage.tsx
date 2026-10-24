import { useMemo, useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList, type TaskItem } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Knob, Readout, Seg } from '../fund/parts'
import { PrereqSection } from '../hs/HsPrereq'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import { DEFAULT_MS, DIAG_SITES, FORMULAS, INJECT_OFFSET_V, INTRO, M, MISCONCEPTIONS, PREREQ, QUIZ, TAKEAWAY } from './genMultisiteData'
import { GEN_META } from './meta'
import { MultisiteFig } from './MultisiteFig'
import { SiteGroups } from './SiteGroups'
import { LOT_TESTS, buildLot, encodeFile, parseStdf, summarizeStdf } from './model/stdf'
import { bestSites, cotCents, efficiency, hourlyCost, maxSites, MAX_SITES_SHOWN, sweep, touchdownS, uph, type MsParams } from './model/multisite'
import './gen.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

const VOH_NUM = LOT_TESTS[0].num

export function GenMultisitePage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [n, setN] = useState(1)
  const [p, setP] = useState<MsParams>(DEFAULT_MS)
  const [injected, setInjected] = useState<number | null>(null)
  const [guess, setGuess] = useState<number | null>(null)

  const limit = maxSites(p)
  const best = bestSites(p)
  const points = useMemo(() => sweep(p, MAX_SITES_SHOWN), [p])

  /* 诊断批次：仿真生成 → 写成 STDF → 读回，按 SITE_NUM 分组。注入时只改其中一个 Site 的 VOH。 */
  const diag = useMemo(() => {
    const offsets = Array.from({ length: DIAG_SITES }, (_, i) => (injected === i + 1 ? INJECT_OFFSET_V : 0))
    const lot = buildLot({ seed: 77, lotId: 'LOT-DIAG-001', parts: 80, sites: DIAG_SITES, defectRate: 0.03, siteOffsetV: offsets })
    return summarizeStdf(parseStdf(encodeFile(lot, true)))
  }, [injected])

  const inject = () => {
    setInjected(Math.floor(Math.random() * DIAG_SITES) + 1)
    setGuess(null)
  }

  const clearInject = () => {
    setInjected(null)
    setGuess(null)
  }

  const update = (patch: Partial<MsParams>) => setP((prev) => ({ ...prev, ...patch }))

  const reset = () => {
    setN(1)
    setP(DEFAULT_MS)
    setInjected(null)
    setGuess(null)
  }

  const tasks: TaskItem[] = [
    { id: 'm1', text: M.task1, done: n === best },
    { id: 'm2', text: M.task2, done: limit >= 1 && n === Math.min(limit, MAX_SITES_SHOWN) },
    { id: 'm3', text: M.task3, done: p.serS === 0 },
    { id: 'm4', text: M.task4, done: guess !== null && injected !== null && guess === injected },
  ]

  const curEff = efficiency(p, n)
  const curCot = cotCents(p, n)
  const over = n > limit
  const guessText = guess === null ? t(M.guessNone) : injected === null ? t(M.guessNoInject) : guess === injected ? t(M.guessOk) : t(M.guessBad)
  const asideTitle = over ? t(M.asideOver) : n === best ? t(M.asideBestOk) : t(M.asideBestNo)

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(GEN_META.genMultisite.title)}
      goal={t(GEN_META.genMultisite.goal)}
      kicker={t(M.kickerNow)}
      asideTitle={asideTitle}
      asideText={t(M.curveWhy)}
      asideLater={t(M.asideLater)}
      extra={<TaskList items={tasks} onReset={reset} />}
    >
      <Section title={t(M.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['genStdf', 'memParallel', 'anaStats']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(M.coreTitle)} note={t(M.coreNote)}>
        <div className="gen-controls">
          <Knob label={M.nLabel} value={n} unit="sites" min={1} max={MAX_SITES_SHOWN} step={1} onChange={setN} />
          <Knob label={M.indexLabel} value={p.indexS} unit="s" min={0.5} max={5} step={0.1} onChange={(indexS) => update({ indexS })} />
          <Knob label={M.parLabel} value={p.parS} unit="s" min={0.2} max={3} step={0.1} onChange={(parS) => update({ parS })} />
          <Knob label={M.serLabel} value={p.serS} unit="s" min={0} max={1} step={0.05} onChange={(serS) => update({ serS })} />
          <Knob
            label={M.retestLabel}
            value={Math.round(p.retest * 100)}
            unit="%"
            min={0}
            max={30}
            step={1}
            onChange={(pct) => update({ retest: pct / 100 })}
          />
          <Knob label={M.cBaseLabel} value={p.cBase} unit="$/h" min={50} max={300} step={5} onChange={(cBase) => update({ cBase })} />
          <Knob label={M.cSiteLabel} value={p.cPerSite} unit="$/h" min={0} max={30} step={1} onChange={(cPerSite) => update({ cPerSite })} />
          <Knob label={M.chTotalLabel} value={p.chTotal} unit="ch" min={128} max={1024} step={64} onChange={(chTotal) => update({ chTotal })} />
          <Knob label={M.chDutLabel} value={p.chPerDut} unit="ch" min={8} max={128} step={8} onChange={(chPerDut) => update({ chPerDut })} />
        </div>

        <Readout
          items={[
            { label: M.rMaxLabel, value: String(limit), state: over ? 'fail' : undefined },
            { label: M.rTdLabel, value: `${touchdownS(p, n).toFixed(2)} s` },
            { label: M.rUphLabel, value: uph(p, n).toFixed(0) },
            { label: M.rEffLabel, value: `${(curEff * 100).toFixed(1)} %`, state: curEff >= 0.9 ? 'pass' : undefined },
            { label: M.rCotLabel, value: Number.isFinite(curCot) ? curCot.toFixed(3) : '—', state: n === best ? 'pass' : undefined },
            { label: M.rHourLabel, value: `${hourlyCost(p, n)} $/h` },
          ]}
        />
        <p className="intro__note">{t(M.nMaxNote)}</p>
        {over ? (
          <Callout tone="bad">
            <p>{t(M.overLimit)}</p>
          </Callout>
        ) : null}

        <MultisiteFig points={points} current={n} best={best} limit={limit} />

        <Callout>
          <p>{t(M.formulaTitle)}</p>
          {FORMULAS.map((line) => (
            <p key={line} className="gen-formula">
              {line}
            </p>
          ))}
          <p>{t(M.formulaNote)}</p>
        </Callout>
      </Section>

      <Section title={t(M.siteTitle)} note={t(M.siteNote)}>
        <div className="gen-controls">
          <button type="button" className="lab__btn lab__btn--primary" onClick={inject}>
            {t(M.injectBtn)}
          </button>
          <button type="button" className="lab__btn" onClick={clearInject}>
            {t(M.clearBtn)}
          </button>
        </div>
        <SiteGroups summary={diag} testNum={VOH_NUM} />
        <div className="gen-controls">
          <span className="gen-row__label">{t(M.guessLabel)}</span>
          <Seg
            options={Array.from({ length: DIAG_SITES }, (_, i) => ({ id: String(i + 1), label: `Site ${i + 1}` }))}
            value={guess === null ? '' : String(guess)}
            onChange={(id) => setGuess(Number(id))}
          />
        </div>
        <p className={`intro__note${guess !== null && guess === injected ? ' gen-ok' : ''}`}>{guessText}</p>
        <Callout tone="warn">
          <p>{t(M.siteEnd)}</p>
        </Callout>
      </Section>

      <Section title={t(M.misTitle)}>
        <Callout tone="warn">
          {MISCONCEPTIONS.map((item, index) => (
            <p key={index}>{`${index + 1}. ${t(item)}`}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(M.takeawayTitle)}>
        <Callout tone="ok">
          <p>{t(TAKEAWAY)}</p>
        </Callout>
      </Section>

      <Section title={t(M.quizTitle)} note={t(M.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>

      <PrereqSection title={M.prereqTitle} note={M.prereqNote} items={PREREQ} />
    </LessonFrame>
  )
}
