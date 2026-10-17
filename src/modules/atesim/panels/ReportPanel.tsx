import { useLocale } from '../../../i18n/LocaleContext'
import { fmtVal, type ItemStats, type LotStats, type ProgramItem } from '../api'
import { BinBars, Histogram, TrendChart } from '../charts'
import { itemCondition, itemLabel, limitText, tf } from '../model'
import { S } from '../text'

type Props = {
  lot: LotStats | null
  program: ProgramItem[]
  seed: number
  stopOnFirstFail: boolean
  batch: { count: number; retest: number; seed: number }
  scenarioName: string | null
  scenarioDescribe: string | null
  madeAt: string | null
  onGenerate: () => void
  onPrint: () => void
}

/** worstItem：Cpk 最低的启用项（作为良率瓶颈） */
function worstItem(items: ItemStats[]): ItemStats | null {
  const usable = items.filter((item) => item.enabled && item.values.length && !Number.isNaN(item.cpk))
  if (!usable.length) return null
  return usable.reduce((worst, item) => (item.cpk < worst.cpk ? item : worst), usable[0])
}

/** ReportPanel：把最近一次批量结果整理成可打印的报告 */
export function ReportPanel({
  lot,
  program,
  seed,
  stopOnFirstFail,
  batch,
  scenarioName,
  scenarioDescribe,
  madeAt,
  onGenerate,
  onPrint,
}: Props) {
  const { t } = useLocale()
  const ready = !!(lot && madeAt)
  const worst = lot ? worstItem(lot.items) : null

  // 复测写成一句完整的话，避免出现「复测 不复测 次」
  const retestText =
    batch.retest > 0
      ? tf(t, S.report.retestTimes, { n: batch.retest })
      : t(S.report.retestNone)

  return (
    <div className="atesim-stack">
      <section className="atesim-card atesim-toolbar atesim-noprint">
        <button type="button" className="lab__btn lab__btn--primary" onClick={onGenerate} disabled={!lot}>
          {t(S.report.make)}
        </button>
        <button type="button" className="lab__btn" onClick={onPrint} disabled={!ready}>
          {t(S.report.print)}
        </button>
        <span className="atesim-hint">{t(S.report.hint)}</span>
      </section>

      {!ready ? (
        <section className="atesim-card">
          <p className="atesim-empty">{t(S.report.empty)}</p>
        </section>
      ) : (
        <section className="atesim-card atesim-report">
          <header className="atesim-report__head">
            <h2>{t(S.report.title)}</h2>
            <p className="atesim-hint">
              {tf(t, S.report.meta, {
                time: madeAt || '',
                seed,
                stopMode: t(stopOnFirstFail ? S.common.stopOnFail : S.common.runAll),
                retest: retestText,
                scenario: scenarioName ? tf(t, S.report.metaScenario, { name: scenarioName }) : '',
              })}
            </p>
          </header>

          <div className="atesim-kpi atesim-kpi--report">
            <div className="atesim-kpi__item is-good">
              <b>{t(S.report.kpiYield)}</b>
              <span>{lot.yieldPct.toFixed(2)}%</span>
            </div>
            <div className="atesim-kpi__item">
              <b>{t(S.report.kpiOverkill)}</b>
              <span>{lot.overkillPct.toFixed(2)}%</span>
            </div>
            <div className="atesim-kpi__item">
              <b>{t(S.report.kpiUnderkill)}</b>
              <span>{lot.underkillPct.toFixed(2)}%</span>
            </div>
            <div className="atesim-kpi__item">
              <b>{t(S.report.kpiTime)}</b>
              <span>{lot.avgTimeMs.toFixed(0)} ms</span>
            </div>
            <div className="atesim-kpi__item">
              <b>{t(S.report.kpiTotal)}</b>
              <span>{lot.total}</span>
            </div>
          </div>

          <h3>{t(S.report.programTitle)}</h3>
          <div className="atesim-scroll">
            <table className="dtable atesim-table">
              <thead>
                <tr>
                  <th>{t(S.report.colNo)}</th>
                  <th>{t(S.report.colItem)}</th>
                  <th>{t(S.report.colCondition)}</th>
                  <th>{t(S.report.colLimit)}</th>
                  <th>{t(S.report.colBin)}</th>
                  <th>{t(S.report.colTime)}</th>
                  <th>{t(S.report.colStatus)}</th>
                </tr>
              </thead>
              <tbody>
                {program.map((item) => (
                  <tr key={item.id}>
                    <td className="num">{item.order}</td>
                    <td>{itemLabel(item.id, t)}</td>
                    <td className="atesim-cond">{itemCondition(item.id, t)}</td>
                    <td className="num">{limitText(item, t)}</td>
                    <td className="num">{item.bin}</td>
                    <td className="num">{item.timeMs} ms</td>
                    <td>{t(item.enabled ? S.report.enabled : S.report.disabled)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3>{t(S.report.binTitle)}</h3>
          <BinBars stats={lot} />

          <h3>{t(S.report.itemTitle)}</h3>
          <div className="atesim-scroll">
            <table className="dtable atesim-table">
              <thead>
                <tr>
                  <th>{t(S.report.colItem)}</th>
                  <th>{t(S.report.colLimit)}</th>
                  <th>{t(S.report.colMean)}</th>
                  <th>{t(S.report.colSigma)}</th>
                  <th>{t(S.report.colCpk)}</th>
                  <th>{t(S.report.colPassRate)}</th>
                </tr>
              </thead>
              <tbody>
                {lot.items.map((item) => (
                  <tr key={item.id}>
                    <td>{itemLabel(item.id, t)}</td>
                    <td className="num">{limitText(item, t)}</td>
                    <td className="num">{fmtVal(item.mean, item.digits)}</td>
                    <td className="num">{fmtVal(item.sigma, item.digits + 1)}</td>
                    <td className="num">{Number.isNaN(item.cpk) ? '—' : item.cpk.toFixed(2)}</td>
                    <td className="num">
                      {item.passRate === null ? '—' : (item.passRate * 100).toFixed(1) + '%'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {worst ? (
            <>
              <h3>
                {itemLabel(worst.id, t)} · Cpk {worst.cpk.toFixed(2)}
              </h3>
              <Histogram item={worst} />
            </>
          ) : null}

          <h3>{t(S.lot.trendTitle)}</h3>
          <TrendChart records={lot.records} />

          <h3>{t(S.report.conclusion)}</h3>
          <ul className="atesim-bullets">
            <li>{tf(t, S.report.concl1, { n: lot.total, yield: lot.yieldPct.toFixed(2) })}</li>
            <li>
              {tf(t, lot.overkillPct > 1 ? S.report.conclOverkillBad : S.report.conclOverkillOk, {
                pct: lot.overkillPct.toFixed(2),
              })}
            </li>
            <li>
              {tf(t, lot.underkillPct > 0.2 ? S.report.conclUnderkillBad : S.report.conclUnderkillOk, {
                pct: lot.underkillPct.toFixed(2),
              })}
            </li>
            {worst ? (
              <li>
                {tf(t, S.report.conclWorst, {
                  name: itemLabel(worst.id, t),
                  cpk: worst.cpk.toFixed(2),
                })}
              </li>
            ) : null}
            {scenarioName ? (
              <li>
                {tf(t, S.report.conclScenario, {
                  name: scenarioName,
                  describe: scenarioDescribe || '',
                })}
              </li>
            ) : null}
          </ul>
        </section>
      )}
    </div>
  )
}
