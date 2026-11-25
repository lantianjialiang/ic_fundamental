import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'

const TRIGGER_PATHS = {
  rail: { d: 'M106 60 V104 H165 V140', heading: loc('I/O 过冲', 'I/O overshoot'),
    detail: loc('看正过冲这一例：I/O 相对所在域 VDD 抬高，P+ / N 阱保护结正偏，电荷进入阱区。', 'For this positive-overshoot example, I/O rises above its domain rail. The P+/N-well protection junction is forward biased and injects into the well.') },
  seq: { d: 'M47 59 H86 V79 H106 V104 H165 V140', heading: loc('已上电域 → 未上电域', 'Powered → unpowered domain'),
    detail: loc('另一电源域已上电并驱动这个接口。本域 VDD 仍低，接口的保护结被正偏，注入点仍在接收域。', 'A powered domain drives this interface while the receiving rail is still low. The receiving domain’s protection junction is forward biased.') },
  ir: { d: 'M430 64 V125 H354 V153 H302', heading: loc('局部地抬升', 'Local ground shifts up'),
    detail: loc('大电流在地回路造成压降。此例中局部 P 衬底电位抬升，使相邻 N+ 与 P 衬底之间的结正偏。', 'Large current creates a ground-return drop. In this example the local p-substrate rises enough to forward-bias its junction with a neighboring N+ region.') },
}

export function LatchTriggerFig({ mode }: { mode: string }) {
  const { t } = useLocale()
  const id = Object.hasOwn(TRIGGER_PATHS, mode) ? mode as keyof typeof TRIGGER_PATHS : 'rail'
  const point = TRIGGER_PATHS[id]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 490 195" className="term-fig__svg" role="img" aria-label={t(point.detail)} data-latch-trigger={id}>
        <rect width="490" height="195" fill="var(--well)" />
        <rect x="52" y="110" width="389" height="68" rx="4" fill="#795569" />
        <path d="M71 110 H230 V139 Q230 158 205 158 H94 Q71 158 71 139Z" fill="#456c91" />
        <rect x="83" y="111" width="46" height="18" rx="4" fill="#d587a1" />
        <rect x="181" y="111" width="32" height="18" rx="4" fill="#84b6e0" />
        <rect x="284" y="111" width="37" height="18" rx="4" fill="#84b6e0" />
        <rect x="411" y="111" width="35" height="18" rx="4" fill="#d587a1" />
        <g fill="#f3f7f8" fontSize="16" textAnchor="middle">
          <text x="106" y="126">P+</text><text x="197" y="126">N+</text><text x="303" y="126">N+</text><text x="429" y="126">P+</text>
          <text x="139" y="149">{t(loc('N 阱', 'N-well'))}</text><text x="370" y="166">{t(loc('P 衬底', 'P-substrate'))}</text>
        </g>
        <g stroke="var(--muted)" fill="none" strokeWidth="2"><path d="M106 59 V109 M197 67 V109 M303 67 V109 M429 66 V109" /></g>
        <text x="197" y="63" textAnchor="middle" fontSize="15" fill="var(--text)">VDD</text>
        <text x="303" y="63" textAnchor="middle" fontSize="15" fill="var(--text)">GND</text>
        <path d={point.d} data-injection fill="none" stroke="#ffdc7b" strokeWidth="3.5" strokeLinejoin="round" />
        <path d={id === 'ir' ? 'M308 147 L302 153 L308 159' : 'M159 133 L165 140 L171 133'} fill="none" stroke="#ffdc7b" strokeWidth="3" />
        <text x={id === 'ir' ? 451 : 30} y="32" textAnchor={id === 'ir' ? 'end' : 'start'} fontSize="17" fill="var(--text)">{t(point.heading)}</text>
      </svg>
      <figcaption aria-live="polite">{t(point.detail)}</figcaption>
    </figure>
  )
}
