import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { RC_LABEL, type RcMode } from './data/mosPrimer'
import { VDD } from './model'

function T({ x, y, children, anchor = 'middle', color = 'var(--text-2)', size = 11, mono = false }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; color?: string; size?: number; mono?: boolean }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} fontFamily={mono ? 'var(--mono)' : undefined}>
      {children}
    </text>
  )
}

/** 时间轴满量程，单位 ms */
export const T_MAX = 500

/** tau 单位 ms */
export const rcVoltage = (mode: RcMode, tMs: number, tau: number) => (mode === 'charge' ? VDD * (1 - Math.exp(-tMs / tau)) : VDD * Math.exp(-tMs / tau))

const X0 = 320
const X1 = 730
const Y0 = 210
const Y1 = 36
const px = (tMs: number) => X0 + (tMs / T_MAX) * (X1 - X0)
const py = (v: number) => Y0 - (v / 3.5) * (Y0 - Y1)

function Circuit({ mode }: { mode: RcMode }) {
  const charge = mode === 'charge'
  return (
    <g>
      <g stroke="var(--text-2)" strokeWidth="2" fill="none">
        <path d="M40 120 V60 H86" />
        <path d="M40 140 V220 H230 V160" />
        <path d="M86 100 V220" />
        <path d="M122 60 H140 M200 60 H230 V128" />
        <path d={charge ? 'M122 60 L90 60' : 'M122 60 L90 98'} stroke="var(--gold)" strokeWidth="2.5" />
      </g>
      <g stroke="var(--text)" strokeLinecap="round">
        <path d="M24 120 H56" strokeWidth="2.5" />
        <path d="M32 140 H48" strokeWidth="4" />
        <path d="M212 128 H248 M212 160 H248" strokeWidth="3" />
      </g>
      <rect x="140" y="50" width="60" height="20" fill="var(--card)" stroke="var(--text)" strokeWidth="2" />
      <circle cx="86" cy="60" r="3.5" fill="var(--text)" />
      <circle cx="86" cy="100" r="3.5" fill="var(--text)" />
      <circle cx="122" cy="60" r="3.5" fill="var(--text)" />
      <T x={20} y={114} anchor="end" size={13} color="var(--text)">
        +
      </T>
      <T x={48} y={110} anchor="start" size={11} color="var(--muted)" mono>
        {`${VDD} V`}
      </T>
      <T x={170} y={42} size={12} color="var(--text)">
        R
      </T>
      <T x={256} y={148} anchor="start" size={12} color="var(--text)">
        C
      </T>
      <T x={256} y={118} anchor="start" size={11} color="var(--gold)">
        Vc
      </T>
      <g stroke="var(--blue)" strokeWidth="1.8" fill="none">
        <path d={charge ? 'M150 84 H190 M182 79 L190 84 L182 89' : 'M190 84 H150 M158 79 L150 84 L158 89'} />
      </g>
      <T x={170} y={102} size={11} color="var(--blue)">
        I
      </T>
      <path d="M130 220 V230 M120 230 H140 M124 236 H136 M128 242 H132" stroke="var(--text-2)" strokeWidth="2" />
    </g>
  )
}

export function RcFig({ mode, tau }: { mode: RcMode; tau: number }) {
  const { t } = useLocale()
  const n = 200
  const pts = Array.from({ length: n + 1 }, (_, k) => {
    const tm = (k / n) * T_MAX
    return `${k === 0 ? 'M' : 'L'}${px(tm).toFixed(1)} ${py(rcVoltage(mode, tm, tau)).toFixed(1)}`
  }).join(' ')
  // 标注约 48 px 宽，相邻标注至少隔 56 px 才画，τ 很小时只留 1τ
  const marks: number[] = []
  for (const m of [1, 3, 5]) {
    const last = marks[marks.length - 1]
    if (m * tau <= T_MAX && (last === undefined || px(m * tau) - px(last * tau) >= 56)) {
      marks.push(m)
    }
  }
  const ticksX = [0, 100, 200, 300, 400, 500]
  const ticksY = [0, 1, 2, 3]

  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 260" className="term-fig__svg" role="img" aria-label={t(RC_LABEL.cap)}>
        <rect width="760" height="260" rx="10" fill="var(--well)" />
        <rect x="10" y="10" width="270" height="240" rx="8" fill="var(--card)" stroke="var(--line)" />
        <Circuit mode={mode} />
        {ticksY.map((v) => (
          <g key={v}>
            <line x1={X0} y1={py(v)} x2={X1} y2={py(v)} stroke="var(--line-3)" strokeOpacity="0.5" />
            <T x={X0 - 8} y={py(v) + 4} anchor="end" size={10} color="var(--dim)" mono>
              {`${v}`}
            </T>
          </g>
        ))}
        {ticksX.map((tm) => (
          <T key={tm} x={px(tm)} y={Y0 + 16} size={10} color="var(--dim)" mono>
            {`${tm}`}
          </T>
        ))}
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="var(--line-2)" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="var(--line-2)" />
        <line x1={X0} y1={py(VDD)} x2={X1} y2={py(VDD)} stroke="var(--muted)" strokeDasharray="5 4" />
        <T x={X1} y={py(VDD) - 6} anchor="end" size={10} color="var(--muted)" mono>
          {`${VDD} V`}
        </T>
        <T x={X0} y={Y1 - 12} anchor="start" size={11} color="var(--muted)">
          {`${t(RC_LABEL.vc)} (V)`}
        </T>
        <T x={X1} y={Y0 + 34} anchor="end" size={11} color="var(--muted)">
          {t(RC_LABEL.time)}
        </T>
        {marks.map((m) => {
          const v = rcVoltage(mode, m * tau, tau)
          const x = px(m * tau)
          const y = py(v)
          return (
            <g key={m}>
              <line x1={x} y1={Y0} x2={x} y2={y} stroke="var(--line-3)" strokeDasharray="3 3" />
              <circle cx={x} cy={y} r="3.5" fill="var(--blue)" />
              <T x={x + 6} y={mode === 'charge' ? y + 16 : y - 8} anchor="start" size={10} color="var(--blue)" mono>
                {`${m}τ ${((v / VDD) * 100).toFixed(1)}%`}
              </T>
            </g>
          )
        })}
        <path d={pts} fill="none" stroke="var(--gold)" strokeWidth="2.4" />
      </svg>
      <figcaption>{t(RC_LABEL.cap)}</figcaption>
    </figure>
  )
}
