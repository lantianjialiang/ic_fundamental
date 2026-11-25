import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { Readout, Seg } from '../fund/parts'
import { MECH_BY_ID } from './relAccelData'
import { type MechId } from './relAccelModel'

const VIEWS = [
  { id: 'stress', label: loc('应力作用在哪', 'Where the stress acts') },
  { id: 'symptom', label: loc('失效后看什么', 'What failure looks like') },
] as const

const SITES: Record<MechId, { site: LText; x: number; y: number; stress: string; symptom: string }> = {
  em: { site: loc('金属线窄段', 'Metal constriction'), x: 189, y: 42,
    stress: 'M122 42 H185 M178 37 L185 42 L178 47',
    symptom: 'M169 35 H186 L180 42 L186 50 H168 M200 35 H219 V50 H200 L206 42 Z' },
  tddb: { site: loc('栅介质厚度方向', 'Through the gate dielectric'), x: 210, y: 105,
    stress: 'M200 90 V110 M196 105 L200 111 L204 105 M225 90 V110 M221 105 L225 111 L229 105',
    symptom: 'M211 82 V96 L205 102 L215 107 L208 112 V122' },
  hci: { site: loc('漏端附近的界面', 'Interface near the drain'), x: 261, y: 113,
    stress: 'M220 125 Q249 130 261 106 M252 111 L261 106 L263 115',
    symptom: 'M244 109 L250 115 M244 115 L250 109 M257 107 L263 113 M257 113 L263 107' },
  nbti: { site: loc('栅下沟道界面', 'Channel interface under the gate'), x: 177, y: 112,
    stress: 'M164 92 V107 M160 102 L164 108 L168 102 M180 92 V107 M176 102 L180 108 L184 102 M196 92 V107 M192 102 L196 108 L200 102',
    symptom: 'M154 111 H223 M159 115 V121 M177 115 V121 M195 115 V121 M213 115 V121' },
  tmf: { site: loc('焊点与基板接合处', 'Solder joint at the board'), x: 296, y: 182,
    stress: 'M295 166 H269 M274 161 L269 166 L274 171 M296 201 H323 M317 196 L323 201 L317 206',
    symptom: 'M283 180 L293 177 L289 185 L300 181 L296 189 L309 186' },
  corr: { site: loc('潮气进入的焊盘边缘', 'Moisture path at a pad edge'), x: 343, y: 44,
    stress: 'M318 22 Q338 27 342 41 M334 36 L342 42 L347 33',
    symptom: 'M325 47 Q329 35 336 43 T347 40 T360 43 M340 50 L347 57 L355 51' },
  esd: { site: loc('I/O 焊盘与输入保护区', 'I/O pad and input protection'), x: 86, y: 47,
    stress: 'M56 14 L48 30 H61 L54 47 L71 25 H59 L67 14',
    symptom: 'M74 40 L86 49 L81 58 L93 59 L88 74 L103 66' },
}

export function RelMechanismFig({ mechanism }: { mechanism: MechId }) {
  const { t } = useLocale()
  const [view, setView] = useState<(typeof VIEWS)[number]['id']>('stress')
  const site = SITES[mechanism]
  const info = MECH_BY_ID[mechanism]
  const stress = view === 'stress'
  const color = stress ? 'var(--blue)' : 'var(--red)'
  return (
    <figure className="term-fig">
      <Seg options={VIEWS} value={view} onChange={setView} />
      <svg viewBox="0 0 418 224" className="term-fig__svg" role="img" aria-label={t(info.name)}>
        <rect width="418" height="224" rx="10" fill="var(--well)" />
        <rect x="36" y="103" width="346" height="53" rx="5" fill="var(--fig-box)" stroke="var(--line-2)" />
        <rect x="39" y="196" width="341" height="12" rx="4" fill="var(--fig-box)" stroke="var(--line-2)" />
        {[122, 296].map((x) => <path key={x} d={`M${x} 156 V170`} stroke="var(--muted)" strokeWidth="6" />)}
        {[122, 296].map((x) => <circle key={x} cx={x} cy="182" r="11" fill="var(--gold)" fillOpacity=".28" stroke="var(--gold)" />)}
        <path d="M89 49 H135 L154 42 H216 L236 49 H329" fill="none" stroke="var(--muted)" strokeWidth="9" strokeLinejoin="round" />
        <rect x="66" y="40" width="32" height="18" rx="3" fill="var(--gold)" fillOpacity=".5" />
        <rect x="327" y="40" width="32" height="18" rx="3" fill="var(--gold)" fillOpacity=".5" />
        <path d="M274 50 V113" stroke="var(--muted)" strokeWidth="6" />
        <path d="M168 78 V91 M248 78 V91" stroke="var(--muted)" />
        <rect x="156" y="81" width="100" height="18" rx="3" fill="var(--blue)" fillOpacity=".3" stroke="var(--blue)" />
        <path d="M150 107 H263" stroke="var(--gold)" strokeWidth="4" />
        <path d="M120 122 H294" stroke="var(--blue)" strokeWidth="2" />
        <path d="M131 121 V108 H152 M263 108 H283 V121" stroke="var(--blue)" fill="none" strokeWidth="3" />
        <g fill="var(--text)" fontSize="13">
          <text x="107" y="22">{t(loc('金属互连', 'Metal routing'))}</text>
          <text x="168" y="75">{t(loc('栅极', 'Gate'))}</text>
          <text x="57" y="115">{t(loc('栅介质', 'Gate oxide'))}</text>
          <text x="309" y="127">{t(loc('漏端', 'Drain'))}</text>
          <text x="173" y="186">{t(loc('封装焊点', 'Package joint'))}</text>
        </g>
        <g data-mechanism={mechanism} data-mechanism-view={view}>
          <circle cx={site.x} cy={site.y} r="21" fill={color} fillOpacity=".13" stroke={color} strokeDasharray="3 3" />
          {!stress && mechanism === 'em' && <rect x="170" y="34" width="48" height="17" fill="var(--well)" />}
          <path d={stress ? site.stress : site.symptom} stroke={color} fill="none" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </svg>
      <Readout items={[
        { label: loc('受影响的位置', 'Affected location'), value: t(site.site) },
        { label: stress ? loc('应力与变化', 'Stress and physical change') : loc('测试时看到的现象', 'Observable test symptom'),
          value: t(stress ? info.cause : info.symptom) },
        { label: loc('对应模型', 'Applicable model'), value: t(info.model) },
      ]} />
    </figure>
  )
}
