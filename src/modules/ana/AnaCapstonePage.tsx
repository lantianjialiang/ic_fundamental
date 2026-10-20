import { useMemo, useState } from 'react'
import { type LText } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { ui } from '../../i18n/ui'
import { LessonFrame, Section } from '../../lab/LessonFrame'
import { QuizList } from '../../lab/QuizList'
import { TaskList } from '../../lab/TaskList'
import { type ModuleId } from '../catalog'
import { Callout, Readout, Seg } from '../fund/parts'
import { RefParas, Related } from '../prep/common'
import '../prep/prep.css'
import { ANA_META } from './meta'
import { BinFig, YieldFig } from './CapstoneFig'
import {
  INTRO,
  ITEM_NAME,
  MISCONCEPTIONS,
  QUIZ,
  S,
  TAKEAWAY,
  YIELD_TARGET,
  cpkOk,
  fmtCpk,
  pct,
  taskItems,
  verdictOf,
} from './capstoneData'
import {
  DEFAULT_GUARDBAND,
  DEFAULT_ORDER,
  DEFAULT_SEED,
  DUT_COUNT,
  ITEMS,
  SEED_STEP,
  SPEC,
  buildCsv,
  runBatch,
  testLimits,
  type ItemId,
  type TestItemSpec,
} from './capstoneModel'
import './ana.css'
import './capstone.css'

type Props = { moduleId: ModuleId; onModuleChange: (id: ModuleId) => void }

type StopMode = 'continue' | 'stop'

const STOP_OPTIONS: Array<{ id: StopMode; label: LText }> = [
  { id: 'continue', label: S.stopContinue },
  { id: 'stop', label: S.stopOn },
]

/** 测试限值的文字形式，例如 [1.17, 1.23] V；无规格的一边显示 — */
function limitText(spec: TestItemSpec, guardband: number): string {
  const { lo, hi } = testLimits(spec, guardband)
  const low = lo === null ? '—' : lo.toFixed(spec.decimals)
  const high = hi === null ? '—' : hi.toFixed(spec.decimals)
  return `[${low}, ${high}] ${spec.unit}`
}

export function AnaCapstonePage({ moduleId, onModuleChange }: Props) {
  const { t } = useLocale()
  const [order, setOrder] = useState<ItemId[]>(DEFAULT_ORDER)
  const [stopMode, setStopMode] = useState<StopMode>(STOP_OPTIONS[0].id)
  const [guardband, setGuardband] = useState<Record<ItemId, number>>(DEFAULT_GUARDBAND)
  const [seed, setSeed] = useState<number>(DEFAULT_SEED)

  const stopOnFail = stopMode === 'stop'
  const batch = useMemo(
    () => runBatch({ order, stopOnFail, guardband, seed }),
    [order, stopOnFail, guardband, seed],
  )
  const csv = useMemo(() => buildCsv(batch, order), [batch, order])
  const verdict = verdictOf(batch)
  const verdictPass = batch.yieldRate >= YIELD_TARGET && cpkOk(batch)

  const moveItem = (index: number, delta: -1 | 1) => {
    const target = index + delta
    if (target < 0 || target >= order.length) {
      return
    }
    setOrder((prev) => {
      const next = [...prev]
      const moved = next[index]
      next[index] = next[target]
      next[target] = moved
      return next
    })
  }

  const reset = () => {
    setOrder(DEFAULT_ORDER)
    setStopMode(STOP_OPTIONS[0].id)
    setGuardband(DEFAULT_GUARDBAND)
    setSeed(DEFAULT_SEED)
  }

  const downloadCsv = () => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `vdut-cap1_seed${seed}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 0)
  }

  const cpkText = ITEMS.map((spec, k) => `${spec.id.toUpperCase()} ${fmtCpk(batch.itemStats[k].cpk)}`).join('  ')

  return (
    <LessonFrame
      moduleId={moduleId}
      onModuleChange={onModuleChange}
      title={t(ANA_META.anaCapstone.title)}
      goal={t(ANA_META.anaCapstone.goal)}
      kicker={t(S.kickerNow)}
      asideTitle={t(verdict.title)}
      asideText={t(verdict.text)}
      asideLater={t(S.asideLater)}
      extra={<TaskList items={taskItems(batch, stopOnFail, csv)} onReset={reset} />}
    >
      <Section title={t(S.introTitle)}>
        <RefParas paras={INTRO} onOpen={onModuleChange} />
        <Related ids={['anaStats', 'anaLdo', 'anaStatic', 'anaTrim']} onOpen={onModuleChange} />
      </Section>

      <Section title={t(S.coreTitle)} note={t(S.coreNote)}>
        <div className="ana-field">
          <span className="ana-field__label">{t(S.stopLabel)}</span>
          <Seg options={STOP_OPTIONS} value={stopMode} onChange={setStopMode} />
        </div>

        <div className="cap-order">
          <div className="cap-order__row cap-order__row--head">
            <span className="cap-order__no" />
            <span className="cap-order__name">{t(S.orderHead)}</span>
            <span className="cap-order__moves" />
            <span className="cap-order__guard">{t(S.guardHead)}</span>
          </div>
          {order.map((id, index) => {
            const spec = SPEC[id]
            const guardOptions = spec.guardbands.map((g) => ({ id: String(g), label: `${g.toFixed(spec.decimals)} ${spec.unit}` }))
            return (
              <div className="cap-order__row" key={id}>
                <span className="cap-order__no">{index + 1}</span>
                <span className="cap-order__name">
                  {t(ITEM_NAME[id])}
                  <span className="cap-order__limit">{limitText(spec, guardband[id])}</span>
                </span>
                <span className="cap-order__moves">
                  <button
                    type="button"
                    className="lab__btn"
                    aria-label={t(S.moveUp)}
                    disabled={index === 0}
                    onClick={() => moveItem(index, -1)}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    className="lab__btn"
                    aria-label={t(S.moveDown)}
                    disabled={index === order.length - 1}
                    onClick={() => moveItem(index, 1)}
                  >
                    ↓
                  </button>
                </span>
                <span className="cap-order__guard">
                  <Seg
                    options={guardOptions}
                    value={String(guardband[id])}
                    onChange={(value) => setGuardband((prev) => ({ ...prev, [id]: Number(value) }))}
                  />
                </span>
              </div>
            )
          })}
        </div>

        <div className="cap-head">
          <span className="cap-head__name">
            {t(S.batchLabel)}: {seed}
          </span>
          <button type="button" className="lab__btn" onClick={() => setSeed((prev) => prev + SEED_STEP)}>
            {t(S.newBatch)}
          </button>
        </div>
      </Section>

      <Section title={t(S.resultTitle)} note={t(S.resultNote)}>
        <div className="ana-grid">
          <BinFig batch={batch} />
          <YieldFig batch={batch} order={order} />
        </div>
        <div className="ana-grid">
          <div className="ana-cell">
            <Readout
              items={[
                { label: S.rYield, value: `${pct(batch.yieldRate)}% (${batch.passCount}/${DUT_COUNT})`, state: batch.yieldRate >= YIELD_TARGET ? 'pass' : 'fail' },
                { label: S.rAvgTime, value: `${batch.avgTimeMs.toFixed(1)} ms` },
                { label: S.rOverkill, value: String(batch.overkill) },
                { label: S.rEscape, value: String(batch.escape) },
                { label: S.rCpk, value: cpkText },
                { label: S.rVerdict, value: t(verdictPass ? S.pass : S.fail), state: verdictPass ? 'pass' : 'fail' },
              ]}
            />
          </div>
          <div className="ana-cell">
            <p className="cap-export__note">{t(S.csvNote)}</p>
            <button type="button" className="lab__btn lab__btn--primary" aria-label={t(S.csvAria)} onClick={downloadCsv}>
              {t(S.csvBtn)}
            </button>
          </div>
        </div>
      </Section>

      <Section title={t(S.misTitle)}>
        <Callout tone="warn">
          {MISCONCEPTIONS.map((item, index) => (
            <p key={index}>{`${index + 1}. ${t(item)}`}</p>
          ))}
        </Callout>
      </Section>

      <Section title={t(S.takeawayTitle)}>
        <Callout tone="ok">
          <p>{t(TAKEAWAY)}</p>
        </Callout>
      </Section>

      <Section title={t(S.quizTitle)} note={t(S.quizNote)}>
        <QuizList questions={QUIZ} yes={t(ui.fund.yes)} no={t(ui.fund.no)} />
      </Section>
    </LessonFrame>
  )
}
