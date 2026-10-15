import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Hit } from '../prep/common'
import { FLOW } from './data/mosSelectFlow'
import { solveTj } from './data/mosSelectMath'
import { PKGS, TJ_LIMIT, TJ_MAX, type PkgId } from './data/mosSelectParts'
import { T } from './SelectFigs'

const TH = {
  cap: loc(
    '热路径类比电路：热功率 P 像电流，热阻 RθJA 像电阻，环境温度 Ta 像地。右边是同一个电流下三种封装的结温，柱子下半截是环境温度，上半截是 P × RθJA 的温升。示意，RθJA 取典型值。',
    'Thermal-path analogy: heat power P is like current, thermal resistance RθJA like a resistor, ambient Ta like ground. On the right is the junction temperature of three packages at the same current; the lower part of each bar is ambient, the upper part is the rise P × RθJA. Illustrative, RθJA is typical.',
  ),
  limit: loc('125 °C 设计上限', '125 °C design limit'),
  max: loc('150 °C 绝对最大', '150 °C absolute max'),
  run: loc('热失控', 'runaway'),
  amb: loc('环境 Ta', 'Ambient Ta'),
}

const BY0 = 230
const BY1 = 44
const SCALE = (BY0 - BY1) / 200
const by = (c: number) => BY0 - Math.min(c, 200) * SCALE

type ThermalProps = { active: PkgId; onPick: (id: PkgId) => void; i: number; r25: number; ta: number }

export function ThermalFig({ active, onPick, i, r25, ta }: ThermalProps) {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 270" className="term-fig__svg" role="img" aria-label={t(TH.cap)}>
        <rect width="760" height="270" rx="10" fill="var(--well)" />
        <rect x="10" y="10" width="330" height="250" rx="8" fill="var(--card)" stroke="var(--line)" />
        <g stroke="var(--text-2)" strokeWidth="2" fill="none" strokeLinecap="round">
          <path d="M70 106 V50 H160 V100 M160 160 V222 M40 222 H300 M70 134 V222" />
          <rect x="148" y="100" width="24" height="60" fill="var(--card)" />
          <circle cx="70" cy="120" r="14" fill="var(--card)" />
          <path d="M70 128 V112 M65 118 L70 112 L75 118" stroke="var(--gold)" strokeWidth="2.5" />
        </g>
        <circle cx="160" cy="50" r="3.5" fill="var(--text)" />
        <T x={160} y={38} size={12} color="var(--gold)">
          Tj
        </T>
        <T x={92} y={124} anchor="start" size={12} color="var(--gold)">
          P
        </T>
        <T x={184} y={134} anchor="start" size={12} color="var(--text)">
          RθJA
        </T>
        <T x={190} y={62} anchor="start" size={11} color="var(--text-2)" mono>
          Tj = Ta + P × RθJA
        </T>
        <T x={190} y={82} anchor="start" size={11} color="var(--text-2)" mono>
          P = I² × Rds(on,hot)
        </T>
        <T x={306} y={226} anchor="start" size={11} color="var(--blue)">
          Ta
        </T>
        {[0, 50, 100, 150, 200].map((c) => (
          <g key={c}>
            <line x1="392" y1={by(c)} x2="740" y2={by(c)} stroke="var(--line-3)" strokeOpacity="0.6" />
            <T x={386} y={by(c) + 4} anchor="end" size={10} color="var(--dim)" mono>
              {`${c}`}
            </T>
          </g>
        ))}
        <line x1="392" y1={by(TJ_LIMIT)} x2="740" y2={by(TJ_LIMIT)} stroke="var(--gold)" strokeDasharray="5 4" />
        <line x1="392" y1={by(TJ_MAX)} x2="740" y2={by(TJ_MAX)} stroke="var(--red)" strokeDasharray="5 4" />
        <T x={392} y={22} anchor="start" size={10} color="var(--gold)">
          {t(TH.limit)}
        </T>
        <T x={740} y={22} anchor="end" size={10} color="var(--red)">
          {t(TH.max)}
        </T>
        {PKGS.map((p, k) => {
          const cx = 460 + k * 110
          const r = solveTj(i, r25, p.theta, ta)
          const top = r.runaway ? by(200) : by(r.tj)
          const color = !r.runaway && r.tj <= TJ_LIMIT ? 'var(--green)' : 'var(--red)'
          const on = p.id === active
          return (
            <Hit key={p.id} label={t(p.label)} active={on} onPick={() => onPick(p.id)}>
              <rect x={cx - 32} y={top} width="64" height={BY0 - top} fill={color} fillOpacity="0.55" stroke={on ? 'var(--text)' : 'none'} strokeWidth="2" />
              <rect x={cx - 32} y={by(ta)} width="64" height={BY0 - by(ta)} fill="var(--dim)" fillOpacity="0.55" />
              <T x={cx} y={top - 6} size={11} color={color} mono>
                {r.runaway ? t(TH.run) : `${Math.round(r.tj)} °C`}
              </T>
              <T x={cx} y={BY0 + 16} size={10} color={on ? 'var(--gold)' : 'var(--text-2)'}>
                {t(p.label)}
              </T>
              <T x={cx} y={BY0 + 30} size={10} color="var(--muted)" mono>
                {`${p.theta} °C/W`}
              </T>
            </Hit>
          )
        })}
        <T x={566} y={22} size={10} color="var(--blue)">
          {`${t(TH.amb)} = ${ta} °C`}
        </T>
      </svg>
      <figcaption>{t(TH.cap)}</figcaption>
    </figure>
  )
}

const FL = {
  cap: loc('选型流程：八步按顺序走，前一步不过就不要往下算。点任意一框跳到那一步。', 'The selection flow: eight steps in order; if one fails, do not carry on. Click any box to jump to that step.'),
}

export function FlowFig({ step, onPick }: { step: number; onPick: (index: number) => void }) {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 200" className="term-fig__svg" role="img" aria-label={t(FL.cap)}>
        <rect width="760" height="200" rx="10" fill="var(--well)" />
        <g stroke="var(--text-2)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M180 52 H204 M364 52 H388 M548 52 H572" />
          <path d="M180 148 H204 M364 148 H388 M548 148 H572" />
          <path d="M652 80 V100 H100 V120" />
        </g>
        <g fill="var(--text-2)">
          <polygon points="204,52 196,47 196,57" />
          <polygon points="388,52 380,47 380,57" />
          <polygon points="572,52 564,47 564,57" />
          <polygon points="204,148 196,143 196,153" />
          <polygon points="388,148 380,143 380,153" />
          <polygon points="572,148 564,143 564,153" />
          <polygon points="100,120 95,112 105,112" />
        </g>
        {FLOW.map((s, k) => {
          const x = 20 + (k % 4) * 184
          const y = k < 4 ? 24 : 120
          const on = k === step
          const done = k < step
          return (
            <Hit key={s.id} label={t(s.title)} active={on} onPick={() => onPick(k)}>
              <rect x={x} y={y} width="160" height="56" rx="8" fill={on ? 'var(--gold)' : 'var(--card)'} fillOpacity={on ? 0.22 : 1} stroke={on ? 'var(--gold)' : done ? 'var(--green)' : 'var(--line)'} strokeWidth={on ? 2.5 : 1.5} />
              <circle cx={x + 22} cy={y + 28} r="12" fill={done ? 'var(--green)' : on ? 'var(--gold)' : 'var(--line-2)'} />
              <T x={x + 22} y={y + 33} size={12} color={done || on ? 'var(--well)' : 'var(--text)'}>
                {`${k + 1}`}
              </T>
              <T x={x + 42} y={y + 33} anchor="start" size={11.5} color="var(--text)">
                {t(s.short)}
              </T>
            </Hit>
          )
        })}
      </svg>
      <figcaption>{t(FL.cap)}</figcaption>
    </figure>
  )
}
