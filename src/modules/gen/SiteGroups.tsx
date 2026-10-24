import { useLocale } from '../../i18n/LocaleContext'
import { M } from './genMultisiteData'
import { type LotSummary } from './model/stdf'

type Props = {
  summary: LotSummary
  /** 用于分组比较的测试项编号（VOH = 1001） */
  testNum: number
}

/** 按 SITE_NUM 分组：每个 Site 的颗数、失效数与参数均值，并与其它 Site 的均值比较 */
export function SiteGroups({ summary, testNum }: Props) {
  const { t } = useLocale()
  const rows = summary.sites.map((site) => ({ site: site.site, n: site.n, fails: site.fails, mean: site.means[testNum] ?? 0 }))
  return (
    <table className="gen-sites">
      <thead>
        <tr>
          <th>{t(M.colSite)}</th>
          <th>{t(M.colN)}</th>
          <th>{t(M.colFails)}</th>
          <th>{t(M.colMean)}</th>
          <th>{t(M.colDelta)}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => {
          const others = rows.filter((r) => r.site !== row.site)
          const othersMean = others.length > 0 ? others.reduce((sum, r) => sum + r.mean, 0) / others.length : row.mean
          const deltaMv = (row.mean - othersMean) * 1000
          return (
            <tr key={row.site}>
              <td>{row.site}</td>
              <td>{row.n}</td>
              <td>{row.fails}</td>
              <td>{row.mean.toFixed(4)}</td>
              <td>{`${deltaMv >= 0 ? '+' : ''}${deltaMv.toFixed(1)}`}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
