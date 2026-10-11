import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { LATCH_MARGIN, sampleAt, type PState, type Sample } from './data/program'

const L = {
  vin: loc('输入 VIH', 'Input VIH'),
  out: loc('输出 / 外部', 'Output / ext'),
  init: loc('初始', 'Init'),
  limit: loc('VDD + 0.5 V', 'VDD + 0.5 V'),
  latch: loc('可能闩锁', 'Possible latch-up'),
  float: loc('悬空', 'floating'),
  aria: loc('上电下电电压随时间变化', 'Power-up / power-down voltages over time'),
}

const X0 = 130
const X1 = 660
const ROW_TOP = 22
const ROW_H = 70
const ROW_GAP = 14
const VMAX = 6
const DT = 0.02

type Run = { pts: Sample[]; float: boolean }

function splitRuns(list: Sample[]): Run[] {
  const runs: Run[] = []
  list.forEach((s) => {
    const float = s.vin === null
    const last = runs[runs.length - 1]
    if (last && last.float === float) last.pts.push(s)
    else runs.push({ pts: last ? [last.pts[last.pts.length - 1], s] : [s], float })
  })
  return runs
}

function spans(list: Sample[], test: (s: Sample) => boolean) {
  const out: Array<[number, number]> = []
  let start: number | null = null
  list.forEach((s, i) => {
    if (test(s) && start === null) start = s.t
    if ((!test(s) || i === list.length - 1) && start !== null) {
      out.push([start, s.t])
      start = null
    }
  })
  return out
}

export function PowerSeqFig({ states, play }: { states: PState[]; play: number }) {
  const { t } = useLocale()
  const total = states.length
  const x = (tt: number) => X0 + (tt / total) * (X1 - X0)
  const rowTop = (r: number) => ROW_TOP + r * (ROW_H + ROW_GAP)
  const y = (r: number, v: number) => rowTop(r) + ROW_H - (Math.min(v, VMAX) / VMAX) * ROW_H
  const height = rowTop(3) + 26

  const samples: Sample[] = []
  for (let tt = 0; tt <= Math.min(play, total) + 1e-9; tt += DT) samples.push(sampleAt(states, Math.min(tt, total - 1e-6)))

  const path = (r: number, pts: Sample[], get: (s: Sample) => number) =>
    pts.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(s.t).toFixed(1)} ${y(r, get(s)).toFixed(1)}`).join(' ')

  const latchSpans = spans(samples, (s) => s.latch)
  const floatSpans = spans(samples, (s) => s.float)
  const runs = splitRuns(samples)
  const slots = Array.from({ length: total }, (_, k) => k)
  const names = ['VDD', t(L.vin), t(L.out)]

  return (
    <svg viewBox={`0 0 680 ${height}`} className="term-fig__svg" role="img" aria-label={t(L.aria)}>
      <rect width="680" height={height} rx="10" fill="var(--well)" />
      {/* 每一步一格 */}
      {slots.map((k) => (
        <g key={k}>
          <line x1={x(k)} y1={ROW_TOP - 6} x2={x(k)} y2={rowTop(3) - 4} stroke="var(--line)" />
          <text x={x(k + 0.5)} y={rowTop(3) + 10} textAnchor="middle" fill="var(--dim)" fontSize="11">
            {k === 0 ? t(L.init) : `${k}`}
          </text>
        </g>
      ))}
      <line x1={x(total)} y1={ROW_TOP - 6} x2={x(total)} y2={rowTop(3) - 4} stroke="var(--line)" />
      {/* 闩锁区域 */}
      {latchSpans.map(([a, b]) => (
        <g key={`l${a}`}>
          <rect x={x(a)} y={ROW_TOP - 6} width={Math.max(2, x(b) - x(a))} height={rowTop(3) - ROW_TOP + 2} fill="var(--red)" opacity="0.16" />
          <text x={x(a) + 4} y={ROW_TOP + 6} fill="var(--red)" fontSize="11">
            {t(L.latch)}
          </text>
        </g>
      ))}
      {floatSpans.map(([a, b]) => (
        <rect key={`f${a}`} x={x(a)} y={rowTop(1)} width={Math.max(2, x(b) - x(a))} height={ROW_H} fill="var(--gold)" opacity="0.12" />
      ))}
      {/* 行框与名字 */}
      {names.map((name, r) => (
        <g key={name}>
          <line x1={X0} y1={y(r, 0)} x2={X1} y2={y(r, 0)} stroke="var(--line-2)" />
          <text x={12} y={rowTop(r) + ROW_H / 2 + 4} fill="var(--text-2)" fontSize="12">
            {name}
          </text>
          <text x={X0 - 6} y={y(r, 5) + 4} textAnchor="end" fill="var(--dim)" fontSize="10">
            5 V
          </text>
          <text x={X0 - 6} y={y(r, 0) + 4} textAnchor="end" fill="var(--dim)" fontSize="10">
            0
          </text>
        </g>
      ))}
      {samples.length > 1 ? (
        <>
          {/* VDD + 0.5 V 参考线 */}
          {[1, 2].map((r) => (
            <path key={r} d={path(r, samples, (s) => s.vdd + LATCH_MARGIN)} fill="none" stroke="var(--gold)" strokeDasharray="4 4" strokeWidth="1.2" />
          ))}
          <path d={path(0, samples, (s) => s.vdd)} fill="none" stroke="var(--blue)" strokeWidth="2.2" />
          {runs.map((run, i) =>
            run.float ? (
              <path key={i} d={path(1, run.pts, () => 1.6)} fill="none" stroke="var(--muted)" strokeWidth="2" strokeDasharray="5 4" />
            ) : (
              <path key={i} d={path(1, run.pts, (s) => s.vin ?? 0)} fill="none" stroke="var(--green)" strokeWidth="2.2" />
            ),
          )}
          {runs
            .filter((run) => run.float)
            .map((run) => (
              <text key={`z${run.pts[0].t}`} x={x(run.pts[0].t) + 4} y={y(1, 1.6) - 4} fill="var(--muted)" fontSize="10">
                {`Z · ${t(L.float)}`}
              </text>
            ))}
          <path d={path(2, samples, (s) => s.out)} fill="none" stroke="var(--purple)" strokeWidth="2.2" />
        </>
      ) : null}
      <text x={X1} y={ROW_TOP - 8} textAnchor="end" fill="var(--gold)" fontSize="10">
        {`- - ${t(L.limit)}`}
      </text>
      {/* 播放头 */}
      <line x1={x(Math.min(play, total))} y1={ROW_TOP - 6} x2={x(Math.min(play, total))} y2={rowTop(3) - 4} stroke="var(--sky)" strokeWidth="1.5" />
    </svg>
  )
}
