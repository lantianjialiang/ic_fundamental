import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { type Fault } from './data/opens'

const L = {
  pmu: loc('PMU'),
  chip: loc('芯片内部'),
  core: loc('内部电路'),
  pin: loc('被测脚'),
  vdd: loc('VDD = 0 V'),
  vss: loc('VSS = 0 V'),
  nb: loc('相邻脚 = 0 V'),
  short: loc('短路 → 0 V'),
  cap: loc('黄色是此刻导通的路径。负电流走下面的对地二极管，正电流走上面的对 VDD 二极管。'),
}

export function OpensFig({ fault, pos, volt }: { fault: Fault; pos: boolean; volt: number }) {
  const { t } = useLocale()
  const hot = 'var(--gold)'
  const dim = 'var(--line-2)'
  const diodeOn = fault === 'good' || (fault === 'res' && Math.abs(volt) >= 0.6)
  const lowOn = !pos && diodeOn
  const highOn = pos && diodeOn
  const shortOn = fault === 'short' || fault === 'res'
  const nbOn = fault === 'neighbor'
  const open = fault === 'open'
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 260" className="term-fig__svg" role="img" aria-label={t(L.cap)}>
        <rect width="680" height="260" rx="10" fill="var(--well)" />
        {/* PMU */}
        <rect x="30" y="100" width="110" height="60" rx="8" fill="var(--blue-bg)" stroke="var(--blue)" />
        <text x="85" y="125" textAnchor="middle" fill="var(--text)" fontSize="14">
          {t(L.pmu)}
        </text>
        <text x="85" y="146" textAnchor="middle" fill="var(--gold)" fontSize="13" fontFamily="monospace">
          {`${volt >= 0 ? '+' : ''}${volt.toFixed(2)} V`}
        </text>
        {/* PMU → 管脚 */}
        <line x1="140" y1="130" x2={open ? 205 : 260} y2="130" stroke={open ? dim : hot} strokeWidth="3" />
        {open ? (
          <>
            <line x1="225" y1="130" x2="260" y2="130" stroke={dim} strokeWidth="3" />
            <text x="215" y="137" textAnchor="middle" fill="var(--red)" fontSize="20">
              ✕
            </text>
          </>
        ) : null}
        <text x="200" y="118" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {pos ? '+I →' : '← −I'}
        </text>
        {/* 芯片外框 */}
        <rect x="250" y="20" width="400" height="220" rx="12" fill="none" stroke="var(--line)" strokeDasharray="6 5" />
        <text x="640" y="40" textAnchor="end" fill="var(--muted)" fontSize="12">
          {t(L.chip)}
        </text>
        <circle cx="270" cy="130" r="7" fill="var(--card)" stroke="var(--text)" />
        <text x="270" y="158" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(L.pin)}
        </text>
        {/* 节点到二极管 */}
        <line x1="277" y1="130" x2="380" y2="130" stroke={lowOn || highOn ? hot : 'var(--muted)'} strokeWidth="2" />
        <line x1="380" y1="130" x2="380" y2="90" stroke={highOn ? hot : 'var(--muted)'} strokeWidth="2" />
        <line x1="380" y1="130" x2="380" y2="170" stroke={lowOn ? hot : 'var(--muted)'} strokeWidth="2" />
        {/* 上二极管：阳极在下（管脚），阴极在上（VDD） */}
        <path d="M368 90 L392 90 L380 72 Z" fill={highOn ? hot : 'var(--card)'} stroke={highOn ? hot : 'var(--muted)'} />
        <line x1="366" y1="70" x2="394" y2="70" stroke={highOn ? hot : 'var(--muted)'} strokeWidth="2" />
        <line x1="380" y1="70" x2="380" y2="50" stroke={highOn ? hot : 'var(--muted)'} strokeWidth="2" />
        <text x="380" y="42" textAnchor="middle" fill="var(--sky)" fontSize="12">
          {t(L.vdd)}
        </text>
        {/* 下二极管：阳极在下（VSS），阴极在上（管脚） */}
        <path d="M368 192 L392 192 L380 174 Z" fill={lowOn ? hot : 'var(--card)'} stroke={lowOn ? hot : 'var(--muted)'} />
        <line x1="366" y1="172" x2="394" y2="172" stroke={lowOn ? hot : 'var(--muted)'} strokeWidth="2" />
        <line x1="380" y1="192" x2="380" y2="212" stroke={lowOn ? hot : 'var(--muted)'} strokeWidth="2" />
        <text x="380" y="228" textAnchor="middle" fill="var(--sky)" fontSize="12">
          {t(L.vss)}
        </text>
        {/* 内部电路 */}
        <line x1="380" y1="130" x2="500" y2="130" stroke="var(--muted)" strokeWidth="2" />
        <rect x="500" y="105" width="120" height="50" rx="8" fill="var(--card)" stroke="var(--line)" />
        <text x="560" y="135" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(L.core)}
        </text>
        {/* 短路 / 相邻脚 */}
        {shortOn ? (
          <>
            <path
              d="M300 130 L300 212"
              stroke={hot}
              strokeWidth="2.5"
              strokeDasharray={fault === 'res' ? '0' : '6 4'}
            />
            {fault === 'res' ? (
              <path d="M300 160 l8 4 l-16 8 l16 8 l-16 8 l8 4" fill="none" stroke={hot} strokeWidth="2" />
            ) : null}
            <text x="292" y="228" textAnchor="end" fill="var(--red)" fontSize="12">
              {fault === 'res' ? '1 kΩ → 0 V' : t(L.short)}
            </text>
          </>
        ) : null}
        {nbOn ? (
          <>
            <circle cx="270" cy="200" r="7" fill="var(--card)" stroke="var(--text)" />
            <path d="M270 137 L270 193" stroke={hot} strokeWidth="2.5" strokeDasharray="6 4" />
            <text x="282" y="222" fill="var(--red)" fontSize="12">
              {t(L.nb)}
            </text>
          </>
        ) : null}
      </svg>
      <figcaption>{t(L.cap)}</figcaption>
    </figure>
  )
}
