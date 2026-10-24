import { useMemo } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { Readout, Seg } from '../fund/parts'
import { S } from './genStdfData'
import { histogram, type LotSummary } from './model/stdf'

type Props = {
  summary: LotSummary
  testNum: number
  onPickTest: (num: number) => void
}

const BW = 480
const BH = 180
const HIST_BINS = 24

function fmt(n: number | null, digits = 3): string {
  return n === null ? '—' : n.toFixed(digits)
}

/** 批次统计：颗数 / 良率、Hard Bin 柱图、所选参数的分布与 Cpk */
export function LotStats({ summary, testNum, onPickTest }: Props) {
  const { t } = useLocale()
  const test = summary.tests.find((item) => item.num === testNum) ?? summary.tests[0]
  const maxBin = Math.max(1, ...summary.hardBins.map((b) => b.count))

  const hist = useMemo(() => {
    if (!test) {
      return null
    }
    const pool = [...test.values]
    if (test.lo !== null) {
      pool.push(test.lo)
    }
    if (test.hi !== null) {
      pool.push(test.hi)
    }
    const lo = Math.min(...pool)
    const hi = Math.max(...pool)
    const pad = (hi - lo) * 0.05 || 1
    const from = lo - pad
    const to = hi + pad
    return { from, to, counts: histogram(test.values, HIST_BINS, from, to) }
  }, [test])

  if (summary.partN === 0 || !test || !hist) {
    return <p className="intro__note">{t(S.statNoData)}</p>
  }

  const maxCount = Math.max(1, ...hist.counts)
  const hx = (v: number) => 40 + ((v - hist.from) / (hist.to - hist.from)) * 420
  const binW = 420 / HIST_BINS
  const barW = BW / Math.max(1, summary.hardBins.length)
  const limitText = `${test.lo === null ? t(S.statNoLimit) : test.lo}  …  ${test.hi === null ? t(S.statNoLimit) : test.hi}`

  return (
    <div className="gen-stats">
      <Readout
        items={[
          { label: S.statParts, value: String(summary.partN) },
          { label: S.statPass, value: String(summary.passN), state: 'pass' },
          { label: S.statFail, value: String(summary.failN), state: summary.failN > 0 ? 'fail' : undefined },
          { label: S.statYield, value: `${(summary.yieldRatio * 100).toFixed(1)} %` },
          { label: S.statLot, value: summary.lotId || '—' },
          { label: S.statType, value: summary.partType || '—' },
        ]}
      />

      <figure className="term-fig">
        <svg viewBox={`0 0 ${BW} ${BH + 30}`} className="term-fig__svg" role="img" aria-label={t(S.statBinAria)}>
          <rect width={BW} height={BH + 30} rx="10" fill="var(--well)" />
          {summary.hardBins.map((b, i) => {
            const h = (b.count / maxBin) * (BH - 40)
            const x = i * barW + barW * 0.2
            return (
              <g key={b.bin}>
                <rect x={x} y={BH - h} width={barW * 0.6} height={h} fill={b.bin === 1 ? 'var(--green)' : 'var(--red)'} fillOpacity="0.7" />
                <text x={x + barW * 0.3} y={BH - h - 4} textAnchor="middle" fill="var(--text)" fontSize="11" fontFamily="var(--mono)">
                  {b.count}
                </text>
                <text x={x + barW * 0.3} y={BH + 14} textAnchor="middle" fill="var(--text)" fontSize="11">
                  {`B${b.bin} ${b.name}`}
                </text>
              </g>
            )
          })}
          <line x1="0" x2={BW} y1={BH} y2={BH} stroke="var(--line-2)" />
        </svg>
        <figcaption>{t(S.statBinNote)}</figcaption>
      </figure>

      <Seg
        options={summary.tests.map((item) => ({ id: String(item.num), label: `${item.name} (${item.unit})` }))}
        value={String(test.num)}
        onChange={(id) => onPickTest(Number(id))}
      />

      <figure className="term-fig">
        <svg viewBox={`0 0 ${BW} ${BH + 30}`} className="term-fig__svg" role="img" aria-label={t(S.statHistAria)}>
          <rect width={BW} height={BH + 30} rx="10" fill="var(--well)" />
          {hist.counts.map((count, i) => {
            if (count === 0) {
              return null
            }
            const h = (count / maxCount) * (BH - 20)
            const x = 40 + i * binW
            return <rect key={i} x={x} y={BH - h} width={Math.max(binW - 1, 1)} height={h} fill="var(--muted)" fillOpacity="0.6" />
          })}
          {test.lo !== null ? (
            <line x1={hx(test.lo)} x2={hx(test.lo)} y1="8" y2={BH} stroke="var(--red)" strokeWidth="2" strokeDasharray="5 3" />
          ) : null}
          {test.hi !== null ? (
            <line x1={hx(test.hi)} x2={hx(test.hi)} y1="8" y2={BH} stroke="var(--red)" strokeWidth="2" strokeDasharray="5 3" />
          ) : null}
          <line x1="40" x2="460" y1={BH} y2={BH} stroke="var(--line-2)" />
          <text x="40" y={BH + 16} fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
            {hist.from.toFixed(2)}
          </text>
          <text x="460" y={BH + 16} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
            {hist.to.toFixed(2)}
          </text>
        </svg>
        <figcaption>{t(S.statParamNote)}</figcaption>
      </figure>

      <Readout
        items={[
          { label: S.statLimits, value: `${limitText} ${test.unit}` },
          { label: S.statMean, value: `${fmt(test.mean, 4)} ${test.unit}` },
          { label: S.statSd, value: fmt(test.sd, 4) },
          { label: S.statCpk, value: fmt(test.cpk, 2), state: test.cpk !== null && test.cpk >= 1.33 ? 'pass' : test.cpk !== null ? 'fail' : undefined },
          { label: S.statFails, value: String(test.failN), state: test.failN > 0 ? 'fail' : undefined },
        ]}
      />
    </div>
  )
}
