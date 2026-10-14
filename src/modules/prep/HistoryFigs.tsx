import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Hit } from './common'
import { CHIPS, EVENTS, fmtCount, type EventId } from './data/history'

const L = {
  timeCap: loc('横轴按真实年份等比例画。上下交错只是为了让年份不挤在一起。', 'The axis is drawn to scale in real years. Labels alternate above and below only so they do not crowd.'),
  countCap: loc(
    '每个点是一颗当年的代表性芯片。点子大体贴着虚线走，说明「两年翻一番」在几十年里基本成立。',
    'Each dot is a representative chip of its year. The dots roughly follow the dashed line, showing that “doubling every two years” held for decades.',
  ),
  moore: loc('每两年 ×2', '×2 every 2 years'),
  axisY: loc('晶体管数', 'Transistors'),
  barCap: loc('对数刻度：每向右一大格，时间 ×10。', 'Log scale: each major step to the right is ×10 in time.'),
  s1: loc('1 秒', '1 s'),
  h1: loc('1 小时', '1 hour'),
  d1: loc('1 天', '1 day'),
  y1: loc('1 年', '1 year'),
  y1000: loc('1000 年', '1000 years'),
}

/* ---------- 时间轴 ---------- */

const T0 = 1940
const T1 = 2025
const tx = (year: number) => 40 + ((year - T0) / (T1 - T0)) * 680

export function TimelineFig({ active, onPick }: { active: EventId; onPick: (id: EventId) => void }) {
  const { t } = useLocale()
  const axisY = 78
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 150" className="term-fig__svg" role="group" aria-label={t(L.timeCap)}>
        <rect width="760" height="150" rx="10" fill="var(--well)" />
        <line x1={tx(T0)} y1={axisY} x2={tx(T1)} y2={axisY} stroke="var(--line-2)" strokeWidth="2" />
        {[1940, 1950, 1960, 1970, 1980, 1990, 2000, 2010, 2020].map((d) => (
          <g key={d}>
            <line x1={tx(d)} y1={axisY - 4} x2={tx(d)} y2={axisY + 4} stroke="var(--line-2)" />
            <text x={tx(d)} y="140" textAnchor="middle" fill="var(--dim)" fontSize="10" fontFamily="var(--mono)">
              {d}
            </text>
          </g>
        ))}
        {EVENTS.map((ev, i) => {
          const x = tx(ev.year)
          const up = i % 2 === 0
          const on = active === ev.id
          const labelY = up ? 40 : 120
          return (
            <Hit key={ev.id} label={`${ev.year} ${t(ev.title)}`} active={on} onPick={() => onPick(ev.id)}>
              <rect x={x - 8} y={up ? 26 : axisY} width="16" height={up ? axisY - 26 : 102 - axisY + 26} fill="transparent" />
              <line x1={x} y1={axisY} x2={x} y2={up ? labelY + 4 : labelY - 14} stroke={on ? 'var(--gold)' : 'var(--line-2)'} strokeWidth={on ? 2 : 1} />
              <circle cx={x} cy={axisY} r={on ? 7 : 5} fill={on ? 'var(--gold)' : 'var(--card)'} stroke={on ? 'var(--gold)' : 'var(--blue)'} strokeWidth="2" />
              <text
                x={x}
                y={labelY}
                textAnchor="middle"
                fill={on ? 'var(--gold)' : 'var(--text-2)'}
                fontSize="12"
                fontWeight={on ? 700 : 400}
                fontFamily="var(--mono)"
              >
                {ev.year}
              </text>
            </Hit>
          )
        })}
      </svg>
      <figcaption>{t(L.timeCap)}</figcaption>
    </figure>
  )
}

/* ---------- 晶体管数（对数坐标） ---------- */

const X0 = 70
const X1 = 730
const Y0 = 262
const Y1 = 28
const YR0 = 1968
const YR1 = 2024
const LG0 = 2
const LG1 = 11
const cx = (year: number) => X0 + ((year - YR0) / (YR1 - YR0)) * (X1 - X0)
const cy = (lg: number) => Y0 - ((lg - LG0) / (LG1 - LG0)) * (Y0 - Y1)

function Pow({ exp }: { exp: number }) {
  return (
    <>
      10
      <tspan dy="-5" fontSize="8">
        {exp}
      </tspan>
    </>
  )
}

export function CountChartFig({ active, onPick }: { active: string; onPick: (id: string) => void }) {
  const { t } = useLocale()
  const mooreLg = (year: number) => Math.log10(2300) + ((year - 1971) / 2) * Math.log10(2)
  const sel = CHIPS.find((c) => c.id === active) ?? CHIPS[0]
  const sx = cx(sel.year)
  const sy = cy(Math.log10(sel.count))
  const right = sel.year < 2005
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 300" className="term-fig__svg" role="group" aria-label={t(L.countCap)}>
        <rect width="760" height="300" rx="10" fill="var(--well)" />
        {[3, 5, 7, 9, 11].map((lg) => (
          <g key={lg}>
            <line x1={X0} y1={cy(lg)} x2={X1} y2={cy(lg)} stroke="var(--line-3)" />
            <text x={X0 - 8} y={cy(lg) + 4} textAnchor="end" fill="var(--dim)" fontSize="11" fontFamily="var(--mono)">
              <Pow exp={lg} />
            </text>
          </g>
        ))}
        {[1970, 1980, 1990, 2000, 2010, 2020].map((yr) => (
          <g key={yr}>
            <line x1={cx(yr)} y1={Y0} x2={cx(yr)} y2={Y0 + 5} stroke="var(--line-2)" />
            <text x={cx(yr)} y={Y0 + 18} textAnchor="middle" fill="var(--dim)" fontSize="10" fontFamily="var(--mono)">
              {yr}
            </text>
          </g>
        ))}
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="var(--line-2)" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="var(--line-2)" />
        <text x={X0} y={Y1 - 10} fill="var(--muted)" fontSize="11">
          {t(L.axisY)}
        </text>
        <line
          x1={cx(1971)}
          y1={cy(mooreLg(1971))}
          x2={cx(2021)}
          y2={cy(mooreLg(2021))}
          stroke="var(--blue)"
          strokeDasharray="6 5"
          strokeWidth="1.4"
        />
        <line x1="92" y1="52" x2="122" y2="52" stroke="var(--blue)" strokeDasharray="6 5" strokeWidth="1.4" />
        <text x="130" y="56" fill="var(--blue)" fontSize="11">
          {t(L.moore)}
        </text>
        {CHIPS.map((c) => {
          const on = c.id === active
          return (
            <Hit key={c.id} label={c.name} active={on} onPick={() => onPick(c.id)}>
              <circle cx={cx(c.year)} cy={cy(Math.log10(c.count))} r="12" fill="transparent" />
              <circle
                cx={cx(c.year)}
                cy={cy(Math.log10(c.count))}
                r={on ? 7 : 5}
                fill={on ? 'var(--gold)' : 'var(--green-bg)'}
                stroke={on ? 'var(--gold)' : 'var(--green)'}
                strokeWidth="2"
              />
            </Hit>
          )
        })}
        <g pointerEvents="none">
          <text x={right ? sx + 14 : sx - 14} y={right ? sy + 10 : sy - 18} textAnchor={right ? 'start' : 'end'} fill="var(--text)" fontSize="12">
            {`${sel.name} · ${sel.year}`}
          </text>
          <text x={right ? sx + 14 : sx - 14} y={right ? sy + 24 : sy - 4} textAnchor={right ? 'start' : 'end'} fill="var(--gold)" fontSize="11">
            {t(fmtCount(sel.count))}
          </text>
        </g>
      </svg>
      <figcaption>{t(L.countCap)}</figcaption>
    </figure>
  )
}

/* ---------- 穷举时间条 ---------- */

const B0 = -6
const B1 = 12
const bx = (lg: number) => 40 + ((Math.min(Math.max(lg, B0), B1) - B0) / (B1 - B0)) * 680

export function ExhaustBarFig({ seconds, tone }: { seconds: number; tone: 'ok' | 'warn' | 'bad' }) {
  const { t } = useLocale()
  const marks = [
    { lg: 0, label: L.s1 },
    { lg: Math.log10(3600), label: L.h1 },
    { lg: Math.log10(86400), label: L.d1 },
    { lg: Math.log10(3.156e7), label: L.y1 },
    { lg: Math.log10(3.156e10), label: L.y1000 },
  ]
  const color = tone === 'ok' ? 'var(--green)' : tone === 'warn' ? 'var(--gold)' : 'var(--red)'
  const end = bx(Math.log10(seconds))
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 120" className="term-fig__svg" role="img" aria-label={t(L.barCap)}>
        <rect width="760" height="120" rx="10" fill="var(--well)" />
        <rect x="40" y="50" width="680" height="20" rx="4" fill="var(--fig-box)" stroke="var(--line-2)" />
        <rect x="40" y="50" width={Math.max(end - 40, 2)} height="20" rx="4" fill={color} opacity="0.75" style={{ transition: 'width 0.25s' }} />
        {marks.map((m, i) => {
          const up = i % 2 === 0
          return (
            <g key={m.label.zh}>
              <line x1={bx(m.lg)} y1="44" x2={bx(m.lg)} y2="76" stroke="var(--text-2)" strokeDasharray="2 2" />
              <text x={bx(m.lg)} y={up ? 36 : 94} textAnchor="middle" fill="var(--text-2)" fontSize="11">
                {t(m.label)}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption>{t(L.barCap)}</figcaption>
    </figure>
  )
}
