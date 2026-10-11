import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'

const L = {
  pmu: loc('PMU', 'PMU'),
  out: loc('输出脚', 'Output pin'),
  cap: loc(
    '输出级可以看成两只开关电阻：上拉 Rp 接 VDD，下拉 Rn 接地。哪只导通由预处理向量决定；黄色是此刻电流走的路。',
    'The output stage can be modeled as two switched resistors: pull-up Rp to VDD and pull-down Rn to ground. The preconditioning vectors decide which one is on; yellow shows the current path right now.',
  ),
  in: loc('灌入', 'Sink'),
  outI: loc('抽出', 'Source'),
}

/** test: 测哪一项；high: 输出实际是否为高 */
export function DriverFig({
  test,
  high,
  rn,
  rp,
  volt,
}: {
  test: 'vol' | 'voh'
  high: boolean
  rn: number
  rp: number
  volt: number
}) {
  const { t } = useLocale()
  const hot = 'var(--gold)'
  const off = 'var(--line-2)'
  const pOn = high
  const nOn = !high
  const sink = test === 'vol'
  const res = (x: number, y: number, on: boolean) => (
    <path
      d={`M${x} ${y} l0 10 l10 5 l-20 10 l20 10 l-20 10 l10 5 l0 10`}
      fill="none"
      stroke={on ? hot : off}
      strokeWidth="2.5"
    />
  )
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 250" className="term-fig__svg" role="img" aria-label={t(L.cap)}>
        <rect width="680" height="250" rx="10" fill="var(--well)" />
        <text x="200" y="28" textAnchor="middle" fill="var(--sky)" fontSize="13">
          VDD = 4.75 V
        </text>
        <line x1="140" y1="36" x2="260" y2="36" stroke="var(--sky)" strokeWidth="2" />
        <line x1="200" y1="36" x2="200" y2="60" stroke={pOn ? hot : off} strokeWidth="2.5" />
        {res(200, 60, pOn)}
        <text x="222" y="95" fill={pOn ? 'var(--text)' : 'var(--dim)'} fontSize="13">
          {`Rp = ${rp} Ω ${pOn ? 'ON' : 'OFF'}`}
        </text>
        <line x1="200" y1="110" x2="200" y2="125" stroke={pOn || nOn ? hot : off} strokeWidth="2.5" />
        <circle cx="200" cy="125" r="5" fill="var(--text)" />
        <line x1="200" y1="125" x2="200" y2="140" stroke={nOn ? hot : off} strokeWidth="2.5" />
        {res(200, 140, nOn)}
        <text x="222" y="175" fill={nOn ? 'var(--text)' : 'var(--dim)'} fontSize="13">
          {`Rn = ${rn} Ω ${nOn ? 'ON' : 'OFF'}`}
        </text>
        <line x1="200" y1="190" x2="200" y2="214" stroke={nOn ? hot : off} strokeWidth="2.5" />
        <line x1="170" y1="214" x2="230" y2="214" stroke="var(--muted)" strokeWidth="2" />
        <line x1="182" y1="221" x2="218" y2="221" stroke="var(--muted)" strokeWidth="2" />
        <line x1="194" y1="228" x2="206" y2="228" stroke="var(--muted)" strokeWidth="2" />
        {/* 输出脚 → PMU */}
        <line x1="200" y1="125" x2="470" y2="125" stroke={hot} strokeWidth="2.5" />
        <text x="335" y="115" textAnchor="middle" fill={hot} fontSize="13">
          {sink ? `← ${t(L.in)} IOL = 8 mA` : `${t(L.outI)} IOH = 5.2 mA →`}
        </text>
        <text x="215" y="145" fill="var(--muted)" fontSize="12">
          {t(L.out)}
        </text>
        <rect x="470" y="95" width="160" height="60" rx="8" fill="var(--blue-bg)" stroke="var(--blue)" />
        <text x="550" y="119" textAnchor="middle" fill="var(--text)" fontSize="14">
          {t(L.pmu)}
        </text>
        <text x="550" y="141" textAnchor="middle" fill="var(--gold)" fontSize="14" fontFamily="monospace">
          {`${volt >= 0 ? '+' : ''}${volt.toFixed(2)} V`}
        </text>
      </svg>
      <figcaption>{t(L.cap)}</figcaption>
    </figure>
  )
}
