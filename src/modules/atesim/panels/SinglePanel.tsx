import { useLocale } from '../../../i18n/LocaleContext'
import { fmtVal, type ProgramItem } from '../api'
import { binLong, itemCondition, itemLabel, limitText, tf } from '../model'
import { S } from '../text'
import { type SingleOut } from '../state'

type Props = {
  single: SingleOut | null
  program: ProgramItem[]
  seed: number
  nextDie: number
  debug: boolean
  history: Array<{ index: number; bin: number; trueGood: boolean }>
  onNext: () => void
  onRun10: () => void
  onReset: () => void
  onToggleDebug: () => void
}

/** SinglePanel：逐颗测试，看 Bin、逐项读数与引脚明细 */
export function SinglePanel({
  single,
  program,
  seed,
  nextDie,
  debug,
  history,
  onNext,
  onRun10,
  onReset,
  onToggleDebug,
}: Props) {
  const { t, locale } = useLocale()
  const enabled = program.filter((item) => item.enabled)
  const byId = new Map((single?.result.results || []).map((r) => [r.id, r]))
  const continuity = byId.get('continuity')
  const defects = single
    ? Object.keys(single.die.defects).filter((key) => single.die.defects[key])
    : []

  return (
    <div className="atesim-stack">
      <section className="atesim-card atesim-toolbar">
        <button type="button" className="lab__btn lab__btn--primary" onClick={onNext}>
          {t(S.single.next)}
        </button>
        <button type="button" className="lab__btn" onClick={onRun10}>
          {t(S.single.run10)}
        </button>
        <button type="button" className="lab__btn" onClick={onReset}>
          {t(S.single.resetSeq)}
        </button>
        <label className="atesim-check">
          <input type="checkbox" checked={debug} onChange={onToggleDebug} />
          {t(S.single.debug)}
        </label>
        <span className="atesim-toolbar__spacer" />
        <span className="atesim-hint">{tf(t, S.single.seedIndex, { seed, index: nextDie })}</span>
      </section>

      <div className="atesim-single">
        <section className="atesim-card atesim-bincard">
          <div
            className={
              'atesim-bin-big' +
              (single ? (single.result.bin === 1 ? ' is-good' : ' is-bad') : '')
            }
          >
            {single ? single.result.bin : '—'}
          </div>
          <p className="atesim-bin-name">
            {single
              ? tf(t, S.single.binLine, {
                  bin: binLong(single.result.bin, t),
                  ms: single.result.timeMs,
                })
              : t(S.single.waiting)}
          </p>
          <div className="atesim-meta">
            {single ? (
              <>
                <p>
                  {tf(t, S.single.metaIndex, {
                    index: single.die.index,
                    wafer: single.die.wafer,
                  })}
                </p>
                <p>
                  {tf(t, S.single.metaCoord, {
                    x: single.die.x.toFixed(3),
                    y: single.die.y.toFixed(3),
                  })}
                  {single.die.inCluster ? t(S.single.metaCluster) : ''}
                </p>
                <p>{tf(t, S.single.metaProcess, { p: single.die.process.toFixed(2) })}</p>
                {debug ? (
                  <p>
                    {tf(t, S.single.metaTrue, {
                      truth: t(single.die.trueGood ? S.common.good : S.common.bad),
                    })}
                    {defects.length
                      ? tf(t, S.single.metaDefects, {
                          list: defects
                            .map((key) => t(S.single.defect[key] || key))
                            .join(' / '),
                        })
                      : ''}
                  </p>
                ) : (
                  <p className="atesim-hint">{t(S.single.metaHint)}</p>
                )}
              </>
            ) : (
              <p className="atesim-hint">{t(S.single.metaHint)}</p>
            )}
          </div>
        </section>

        <section className="atesim-card">
          <div className="atesim-card__head">
            <h2>{t(S.single.resultTitle)}</h2>
            <span className="atesim-hint">
              {single
                ? tf(t, S.single.timeLine, { ms: single.result.timeMs, n: single.result.testedItems })
                : ''}
            </span>
          </div>
          <div className="atesim-scroll">
            <table className="dtable atesim-table">
              <thead>
                <tr>
                  <th>{t(S.single.colItem)}</th>
                  <th>{t(S.single.colCondition)}</th>
                  <th>{t(S.single.colReading)}</th>
                  <th>{t(S.single.colLimit)}</th>
                  <th>{t(S.single.colVerdict)}</th>
                </tr>
              </thead>
              <tbody>
                {!single ? (
                  <tr>
                    <td colSpan={5} className="atesim-empty">
                      {t(S.single.empty)}
                    </td>
                  </tr>
                ) : (
                  enabled.map((item) => {
                    const res = byId.get(item.id)
                    if (!res) {
                      return (
                        <tr key={item.id}>
                          <td>
                            <b>{itemLabel(item.id, t)}</b>
                          </td>
                          <td className="atesim-cond">{itemCondition(item.id, t)}</td>
                          <td className="num">—</td>
                          <td className="num">{limitText(item, t)}</td>
                          <td>
                            <span className="atesim-badge is-skip">{t(S.common.skipped)}</span>
                          </td>
                        </tr>
                      )
                    }
                    return (
                      <tr key={item.id} className={res.pass ? '' : 'is-fail'}>
                        <td>
                          <b>{itemLabel(item.id, t)}</b>
                          {locale === 'zh' ? <span className="atesim-sub">{res.name}</span> : null}
                        </td>
                        <td className="atesim-cond">{itemCondition(item.id, t)}</td>
                        <td className="num">
                          {fmtVal(res.value, res.digits)} <span className="atesim-sub">{res.unit}</span>
                        </td>
                        <td className="num">{limitText(res, t)}</td>
                        <td>
                          <span className={'atesim-badge ' + (res.pass ? 'is-pass' : 'is-fail')}>
                            {res.pass ? t(S.common.pass) : t(S.common.fail)}
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          {continuity?.detail.pins ? (
            <p className="atesim-pins">
              {tf(t, S.single.pins, {
                pins: continuity.detail.pins
                  .map((pin) => pin.name + ' ' + pin.value.toFixed(3) + 'V ' + (pin.pass ? '✓' : '✗'))
                  .join('   '),
                worst: continuity.detail.worstPin || '—',
              })}
            </p>
          ) : null}
        </section>
      </div>

      <section className="atesim-card">
        <div className="atesim-card__head">
          <h3>{tf(t, S.single.historyTitle, { n: history.length })}</h3>
        </div>
        {history.length ? (
          <div className="atesim-chips">
            {history.slice(-80).map((entry) => (
              <span
                key={entry.index}
                className={'atesim-chip ' + (entry.bin === 1 ? 'is-good' : 'is-bad')}
              >
                #{entry.index} B{entry.bin}
                {debug ? (entry.trueGood ? ' √' : ' ×') : ''}
              </span>
            ))}
          </div>
        ) : (
          <p className="atesim-hint">{t(S.single.noHistory)}</p>
        )}
      </section>
    </div>
  )
}
