import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'

const STRUCTURES = ['Planar FET', 'FinFET', 'Nanowire GAA', 'Nanosheet GAA']
const GATE = 'var(--blue)'
const CHANNEL = 'var(--gold)'

export function FetCrossSections() {
  const { t } = useLocale()
  return (
    <div className="home__grid" aria-label={t(loc('栅极与沟道横截面', 'Gate and channel cross-sections'))}>
      {STRUCTURES.map((name, index) => (
        <figure key={name} className="term-fig">
          <svg viewBox="0 0 120 92" width="120" height="92" aria-hidden="true">
            {index === 0 && <>
              <rect x="20" y="51" width="80" height="24" fill="var(--panel-2)" stroke="var(--muted)" />
              <rect x="38" y="47" width="44" height="7" fill={CHANNEL} />
              <rect x="34" y="27" width="52" height="17" fill={GATE} />
            </>}
            {index === 1 && <>
              <rect x="20" y="73" width="80" height="7" fill="var(--panel-2)" stroke="var(--muted)" />
              <path d="M40 72V24h40v48H69V35H51v37Z" fill={GATE} />
              <rect x="54" y="38" width="12" height="35" fill={CHANNEL} />
            </>}
            {index >= 2 && <>
              <rect x="24" y="14" width="72" height="64" rx="4" fill={GATE} />
              {[28, 46, 64].map((cy) => index === 2
                ? <circle key={cy} cx="60" cy={cy} r="5" fill={CHANNEL} stroke="var(--card)" strokeWidth="2" />
                : <rect key={cy} x="38" y={cy - 4} width="44" height="8" rx="3" fill={CHANNEL} stroke="var(--card)" strokeWidth="2" />)}
            </>}
          </svg>
          <figcaption>{name}</figcaption>
        </figure>
      ))}
      <p className="intro__note" style={{ gridColumn: '1 / -1' }}>
        {t(loc('蓝色是栅极，金色是沟道。截面示意省略源漏，白色间隔表示栅介质。', 'Blue marks the gate and gold marks the channel. The cross-sections omit source and drain. The separation represents gate dielectric.'))}
      </p>
    </div>
  )
}
