import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'

const LANES = [
  { id: 'cp', x: 18, title: loc('CP 晶圆测试', 'CP wafer sort'), motion: loc('探针台移动晶圆', 'Prober moves wafer'), mechanical: 'prober',
    parts: [{ id: 'lb', label: loc('接口板', 'Interface board') }, { id: 'pc', label: loc('探针卡与探针', 'Probe card & needles') }, { id: 'wafer', label: loc('晶圆上的裸片焊盘', 'Wafer die pads') }] },
  { id: 'ft', x: 319, title: loc('FT 成品测试', 'FT final test'), motion: loc('分选机上料与分 Bin', 'Handler loads and bins'), mechanical: 'handler',
    parts: [{ id: 'lb', label: loc('负载板', 'Load board') }, { id: 'socket', label: loc('测试座与触点', 'Socket & contacts') }, { id: 'pkg', label: loc('封装器件端子', 'Packaged device terminals') }] },
]

export function AtePeripheralFig({ active }: { active: string }) {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 620 230" className="term-fig__svg" role="img" data-peripheral={active}
        aria-label={t(loc('两条链路中测试信号和器件搬运的方向', 'Signal path and mechanical handling in CP and FT'))}>
        <rect width="620" height="230" fill="var(--well)" />
        {LANES.map(({ id, x, title, motion, mechanical, parts }) => (
          <g key={id} transform={`translate(${x} 0)`}>
            <rect x="0" y="9" width="283" height="207" rx="10" fill="var(--panel)" stroke="var(--line-2)" />
            <text x="12" y="30" fill="var(--text)" fontSize="16" fontWeight="bold">{t(title)}</text>
            <path d="M28 64 V187 M23 181 L28 188 L33 181" stroke="var(--blue-strong)" strokeWidth="2.5" fill="none" />
            <text x="47" y="57" fill="var(--text)" fontSize="15">{t(loc('ATE 测试头', 'ATE test head'))}</text>
            {parts.map(({ id: part, label }, index) => {
              const y = 70 + 36 * index
              const hot = part === active
              return <g key={part} data-part={part} data-highlight={hot}>
                <path d={`M28 ${y + 13} H45`} stroke="var(--blue-strong)" strokeWidth="2" />
                <rect x="45" y={y} width="195" height="27" rx="4" fill={hot ? 'var(--gold-bg)' : 'var(--well)'}
                  stroke={hot ? 'var(--gold)' : 'var(--line-2)'} strokeWidth={hot ? 2.5 : 1} />
                <text x="56" y={y + 18} fill="var(--text)" fontSize="15">{t(label)}</text>
              </g>
            })}
            <path data-part={mechanical} data-highlight={active === mechanical}
              d="M258 197 V155 H244 M249 150 L244 155 L249 160" stroke={active === mechanical ? 'var(--gold)' : 'var(--muted)'}
              strokeWidth={active === mechanical ? 3 : 1.5} fill="none" strokeDasharray="4 3" />
            <text x="242" y="203" textAnchor="end" fill={active === mechanical ? 'var(--gold)' : 'var(--text-2)'} fontSize="15">{t(motion)}</text>
          </g>
        ))}
      </svg>
      <figcaption>{t(loc('实线跟踪测试信号经过的接口。虚线跟踪搬运：探针台对准晶圆，分选机把封装送入测试座。', 'Solid lines trace the signal interfaces. Dashed lines trace handling: the prober aligns the wafer and the handler delivers the package to the socket.'))}</figcaption>
    </figure>
  )
}
