import { useLocale } from '../../../i18n/LocaleContext'
import { fmtVal, type LotProgress, type LotStats, type ProgramItem } from '../api'
import { BinBars, Histogram, TrendChart, WaferMap } from '../charts'
import { itemLabel, limitText, tf } from '../model'
import { S } from '../text'

type Props = {
  lot: LotStats | null
  program: ProgramItem[]
  batch: { count: number; retest: number; seed: number }
  stopOnFirstFail: boolean
  progress: LotProgress | null
  progressNote: string
  running: boolean
  histItem: string
  waferIndex: number
  onRun: () => void
  onCancel: () => void
  onBatchChange: (patch: Partial<{ count: number; retest: number; seed: number }>) => void
  onStopModeChange: (value: boolean) => void
  onHistItemChange: (id: string) => void
  onWaferChange: (index: number) => void
  onExportCsv: () => void
  onExportJson: () => void
  onImportFile: (file: File) => void
}

const COUNTS = [100, 200, 500, 1000, 2000, 5000]
const RETESTS = [0, 1, 2, 3]

/** LotPanel：批量运行、KPI、Bin/趋势/直方图/Wafer Map、导入导出 */
export function LotPanel({
  lot,
  program,
  batch,
  stopOnFirstFail,
  progress,
  progressNote,
  running,
  histItem,
  waferIndex,
  onRun,
  onCancel,
  onBatchChange,
  onStopModeChange,
  onHistItemChange,
  onWaferChange,
  onExportCsv,
  onExportJson,
  onImportFile,
}: Props) {
  const { t } = useLocale()
  const enabledItems = program.filter((item) => item.enabled)
  const hist = lot ? lot.items.find((item) => item.id === histItem) || lot.items[0] : null
  const wafers = lot?.wafers || []
  const waferPos = Math.min(Math.max(0, waferIndex), Math.max(0, wafers.length - 1))

  const kpis = lot
    ? [
        {
          label: t(S.lot.kpiYield),
          value: lot.yieldPct.toFixed(2) + '%',
          sub: tf(t, S.lot.kpiYieldSub, { pct: lot.firstPassYieldPct.toFixed(2) }),
          tone: lot.yieldPct >= 95 ? 'good' : lot.yieldPct >= 85 ? 'warn' : 'bad',
        },
        {
          label: t(S.lot.kpiGood),
          value: lot.good + ' / ' + lot.total,
          sub: t(S.lot.kpiGoodSub),
          tone: '',
        },
        {
          label: t(S.lot.kpiOverkill),
          value: lot.overkillPct.toFixed(2) + '%',
          sub: tf(t, S.lot.kpiOverkillSub, { n: lot.overkill }),
          tone: lot.overkillPct <= 1 ? 'good' : lot.overkillPct <= 5 ? 'warn' : 'bad',
        },
        {
          label: t(S.lot.kpiUnderkill),
          value: lot.underkillPct.toFixed(2) + '%',
          sub: tf(t, S.lot.kpiUnderkillSub, { n: lot.underkill }),
          tone: lot.underkillPct <= 0.2 ? 'good' : lot.underkillPct <= 2 ? 'warn' : 'bad',
        },
        {
          label: t(S.lot.kpiTime),
          value: lot.avgTimeMs.toFixed(0) + ' ms',
          sub: tf(t, S.lot.kpiTimeSub, { sec: (lot.totalTimeMs / 1000).toFixed(1) }),
          tone: '',
        },
        {
          label: t(S.lot.kpiRetest),
          value: String(lot.retestRecovered),
          sub: tf(t, S.lot.kpiRetestSub, { sec: (lot.retestExtraMs / 1000).toFixed(1) }),
          tone: '',
        },
      ]
    : []

  return (
    <div className="atesim-stack">
      <section className="atesim-card atesim-toolbar">
        <label className="atesim-field">
          <span>{t(S.common.count)}</span>
          <select
            className="atesim-select"
            value={batch.count}
            onChange={(e) => onBatchChange({ count: Number(e.target.value) })}
          >
            {COUNTS.map((count) => (
              <option key={count} value={count}>
                {count} {t(S.common.dice)}
              </option>
            ))}
          </select>
        </label>
        <label className="atesim-field">
          <span>{t(S.common.retest)}</span>
          <select
            className="atesim-select"
            value={batch.retest}
            onChange={(e) => onBatchChange({ retest: Number(e.target.value) })}
          >
            {RETESTS.map((retest) => (
              <option key={retest} value={retest}>
                {t([S.lot.noRetest, S.lot.once, S.lot.twice, S.lot.thrice][retest] || S.lot.noRetest)}
              </option>
            ))}
          </select>
        </label>
        <label className="atesim-field">
          <span>{t(S.common.seed)}</span>
          <input
            className="atesim-input atesim-input--wide"
            inputMode="numeric"
            value={batch.seed}
            onChange={(e) => onBatchChange({ seed: Number(e.target.value) || 0 })}
          />
        </label>
        <label className="atesim-field">
          <span>{t(S.common.stopMode)}</span>
          <select
            className="atesim-select"
            value={stopOnFirstFail ? '1' : '0'}
            onChange={(e) => onStopModeChange(e.target.value === '1')}
          >
            <option value="1">{t(S.common.stopOnFail)}</option>
            <option value="0">{t(S.common.runAll)}</option>
          </select>
        </label>
        <div className="atesim-toolbar__actions">
          <button type="button" className="lab__btn lab__btn--primary" onClick={onRun} disabled={running}>
            {t(S.lot.run)}
          </button>
          <button type="button" className="lab__btn" onClick={onCancel} disabled={!running}>
            {t(S.lot.cancel)}
          </button>
        </div>
      </section>

      <section className="atesim-progress">
        <div className="atesim-progress__bar">
          <i
            style={{
              width:
                (progress ? (progress.done / Math.max(1, progress.total)) * 100 : lot ? 100 : 0) + '%',
            }}
          />
        </div>
        <span className="atesim-hint">
          {progressNote ||
            (progress
              ? tf(t, S.lot.progress, {
                  done: progress.done,
                  total: progress.total,
                  yield: progress.yieldPct.toFixed(1),
                })
              : t(S.lot.progressIdle))}
        </span>
      </section>

      {lot ? (
        <>
          <div className="atesim-kpi">
            {kpis.map((kpi) => (
              <div key={kpi.label} className={'atesim-kpi__item' + (kpi.tone ? ' is-' + kpi.tone : '')}>
                <b>{kpi.label}</b>
                <span>{kpi.value}</span>
                <em>{kpi.sub}</em>
              </div>
            ))}
          </div>

          <div className="atesim-two">
            <section className="atesim-card">
              <div className="atesim-card__head">
                <h2>{t(S.lot.binTitle)}</h2>
              </div>
              <BinBars stats={lot} />
            </section>
            <section className="atesim-card">
              <div className="atesim-card__head">
                <h2>{t(S.lot.trendTitle)}</h2>
              </div>
              <TrendChart records={lot.records} />
              <p className="atesim-hint">{t(S.lot.trendHint)}</p>
            </section>
          </div>

          <section className="atesim-card">
            <div className="atesim-card__head">
              <h2>{t(S.lot.histTitle)}</h2>
              <select
                className="atesim-select"
                aria-label={t(S.program.colItem)}
                value={hist?.id || ''}
                onChange={(e) => onHistItemChange(e.target.value)}
              >
                {enabledItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {itemLabel(item.id, t)}
                  </option>
                ))}
              </select>
            </div>
            {hist ? (
              <>
                <p className="atesim-stats">
                  {tf(t, S.lot.histStats, {
                    n: hist.tested,
                    mean: fmtVal(hist.mean, hist.digits),
                    sigma: fmtVal(hist.sigma, hist.digits + 1),
                    cpk: Number.isNaN(hist.cpk) ? '—' : hist.cpk.toFixed(2),
                    limit: limitText(hist, t),
                  })}
                </p>
                <Histogram item={hist} />
              </>
            ) : null}
          </section>

          <section className="atesim-card">
            <div className="atesim-card__head">
              <h2>{t(S.lot.waferTitle)}</h2>
              <select
                className="atesim-select"
                aria-label={t(S.lot.waferTitle)}
                value={waferPos}
                onChange={(e) => onWaferChange(Number(e.target.value))}
              >
                {wafers.map((wafer, index) => (
                  <option key={wafer.wafer} value={index}>
                    {tf(t, S.lot.waferOption, { n: wafer.wafer + 1 })}
                  </option>
                ))}
              </select>
            </div>
            {wafers[waferPos] ? <WaferMap wafer={wafers[waferPos]} items={lot.items} /> : null}
          </section>
        </>
      ) : (
        <section className="atesim-card">
          <p className="atesim-empty">{t(S.lot.progressIdle)}</p>
        </section>
      )}

      <section className="atesim-card">
        <div className="atesim-card__head">
          <h2>{t(S.lot.ioTitle)}</h2>
          <div className="atesim-actions">
            <button type="button" className="lab__btn" onClick={onExportCsv}>
              {t(S.lot.exportCsv)}
            </button>
            <button type="button" className="lab__btn" onClick={onExportJson}>
              {t(S.lot.exportJson)}
            </button>
            <label className="lab__btn atesim-file">
              {t(S.lot.importJson)}
              <input
                type="file"
                accept="application/json,.json"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onImportFile(file)
                  e.target.value = ''
                }}
              />
            </label>
          </div>
        </div>
        <p className="atesim-hint">{t(S.lot.ioHint)}</p>
      </section>
    </div>
  )
}
