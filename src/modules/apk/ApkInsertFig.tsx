import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'

export type InsertId = 'kgd' | 'tsv' | 'kgs' | 'post' | 'pkg'

const CONTACTS = {
  kgd: { x: 226, y: 107, text: loc('探针 → 裸片测试焊盘', 'Probe → bare die test pad') },
  tsv: { x: 125, y: 134, text: loc('探针 → 中介层测试焊盘', 'Probe → interposer test pad') },
  kgs: { x: 116, y: 153, text: loc('测试载具 → 基底 die', 'Test carrier → base die') },
  post: { x: 106, y: 151, text: loc('可接触测试端 → 环回', 'Accessible test port → loopback') },
  pkg: { x: 124, y: 180, text: loc('Socket → 成品端子', 'Socket → package terminals') },
}

export function ApkInsertFig({ stage }: { stage: InsertId }) {
  const { t } = useLocale()
  const contact = CONTACTS[stage]
  const assembled = stage === 'post' || stage === 'pkg'
  const stacked = assembled || stage === 'kgs'
  return (
    <svg className="term-fig__svg" viewBox="0 0 448 229" role="img" aria-label={t(contact.text)}>
      <rect width="448" height="229" rx="10" fill="var(--well)" />
      <g data-insert-assembly={stage}>
        {stage === 'kgd' && <>
          <rect x="138" y="109" width="145" height="24" rx="4" fill="#72acbf" fillOpacity=".45" stroke="#72acbf" />
          <path d="M164 108 H177 M221 108 H234 M251 108 H264" stroke="#e6bd65" strokeWidth="4" />
          <text x="210" y="156" textAnchor="middle" fill="var(--text)" fontSize="15">{t(loc('单颗裸片', 'Bare die'))}</text>
          <path d="M262 74 L256 108 M231 72 L226 108" stroke="var(--muted)" strokeWidth="2.5" />
        </>}
        {(stage === 'tsv' || assembled) && <>
          <rect x="104" y="136" width="269" height="18" rx="3" fill="#80a5c8" fillOpacity=".4" stroke="#80a5c8" />
          <path d="M125 134 H144 M334 134 H353" stroke="#e6bd65" strokeWidth="4" />
          {[145, 186, 229, 271, 329].map((x) => <path key={x} d={`M${x} 138 V154`} stroke="#e6bd65" strokeWidth="3" />)}
          <text x="227" y={assembled ? 149 : 187} textAnchor="middle" fill="var(--text)" fontSize="14">{t(loc('中介层', 'Interposer'))}</text>
          {stage === 'tsv' && <path d="M116 108 L125 134 M356 108 L346 134 M125 136 H145 V151 H329 V136 H346"
            stroke="var(--blue)" fill="none" strokeWidth="2.6" strokeLinejoin="round" />}
        </>}
        {stacked && <>
          {[72, 88, 104].map((y) => <rect key={y} x="243" y={y} width="86" height="13" rx="2" fill="#72acbf" fillOpacity=".43" stroke="#72acbf" />)}
          <rect x="238" y="119" width="96" height="11" rx="2" fill="#8cb576" fillOpacity=".6" stroke="#8cb576" />
          <path d="M259 76 V124 M273 76 V124 M289 76 V124" stroke="#e6bd65" opacity=".6" strokeWidth="1.5" />
          <text x="286" y="63" fill="var(--text)" textAnchor="middle" fontSize="14">HBM</text>
        </>}
        {stage === 'kgs' && <>
          <rect x="102" y="148" width="257" height="15" rx="4" fill="#cb9b59" fillOpacity=".34" stroke="#cb9b59" />
          <path d="M116 153 H281 V91 H319 M313 87 L319 91 L313 95" stroke="var(--blue)" fill="none" strokeWidth="2.7" />
          <text x="229" y="186" textAnchor="middle" fill="var(--text)" fontSize="15">{t(loc('测试载具与基底访问', 'Test carrier and base access'))}</text>
        </>}
        {assembled && <>
          <rect x="125" y="92" width="89" height="38" rx="4" fill="#8cb576" fillOpacity=".39" stroke="#8cb576" />
          <text x="169" y="114" textAnchor="middle" fill="var(--text)" fontSize="14">GPU</text>
          <rect x="96" y="160" width="285" height="15" rx="3" fill="#cb9b59" fillOpacity=".4" stroke="#cb9b59" />
          {stage === 'post' ? (
            <path d="M106 151 H130 V120 H175 V141 H259 V125 H310 V145 H182 V122" stroke="var(--blue)" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
          ) : <>
            <path d="M105 153 V48 H372 V153" fill="none" stroke="var(--muted)" strokeWidth="4" />
            {[124, 149, 175, 200, 225, 251, 277, 303, 328, 354].map((x) => (
              <circle key={x} cx={x} cy="180" r="4.5" fill="#e6bd65" />
            ))}
            <path d="M124 194 H362 M124 189 V180 H149 V170 H170 V126" stroke="var(--blue)" strokeWidth="2.6" fill="none" />
          </>}
        </>}
      </g>
      <circle data-insert-contact={stage} cx={contact.x} cy={contact.y} r="8" fill="none" stroke="var(--blue)" strokeWidth="2" />
      <text x="224" y="215" textAnchor="middle" fontSize="15" fill="var(--text)">{t(contact.text)}</text>
    </svg>
  )
}
