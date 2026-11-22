import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { COMPLIANCE_UNIT, FORCE_UNIT, PARAM_LABEL } from './pwrStaticData'
import { type StaticState } from './pwrStaticModel'

const WIRING = {
  bvdss: { force: 'Iᴅ', measure: 'Vᴅꜱ', detail: loc('G–S 短接，沟道关断。SMU 在 D–S 强制小电流，并读达到该电流所需的漏源电压。', 'G–S is shorted to keep the channel off. The SMU forces a small D–S current and reads the voltage required to reach it.') },
  idss: { force: 'Vᴅꜱ', measure: 'Iᴅ', detail: loc('G–S 短接，SMU 在 D–S 施加漏源电压。此时读到的是关断状态的漏极电流。', 'G–S is shorted. The SMU biases D–S and reads the drain current with the channel off.') },
  igss: { force: 'Vɢꜱ', measure: 'Iɢ', detail: loc('D–S 短接到同一个电位。把 SMU 换接到 G–S，读受栅极偏置驱动的漏电。', 'D–S is shorted to hold both terminals at the same potential. The SMU is connected across G–S to read leakage under gate bias.') },
  vth: { force: 'Iᴅ', measure: 'Vɢꜱ', detail: loc('此接法把 G 与 D 短接。SMU 在漏极强制指定小电流，读这一公共节点相对 S 的电压，即该 Id 条件下的 Vth。', 'This setup ties G to D. The SMU forces the specified small drain current and reads the common node relative to S, giving Vth at that Id.') },
  rdson: { force: 'Iᴅ', measure: 'Vᴅꜱ', detail: loc('先加独立栅极偏置导通 MOSFET，再让蓝线输送测试电流。金色虚线在器件端独立取样电压，Rds(on) = Vds / Id。', 'An independent gate bias turns on the MOSFET. The blue leads then carry the test current. The separate gold pair senses voltage at the DUT. Rds(on) = Vds / Id.') },
}

export function PwrStaticWiring({ state, clipped }: { state: StaticState; clipped: boolean }) {
  const { t } = useLocale()
  const { param } = state
  const mode = WIRING[param]
  const gateLeak = param === 'igss'
  const kelvin = param === 'rdson'
  const short = gateLeak ? 'DS' : param === 'vth' ? 'GD' : kelvin ? undefined : 'GS'
  const forcePos = gateLeak ? 330 : 80
  const force = `${state.force} ${FORCE_UNIT[param]}`
  const compliance = `${state.compliance} ${COMPLIANCE_UNIT[param]}`
  const limitLabel = loc(
    `SMU 的 compliance = ${compliance}。达到此限制时，仪表停止增加输出，读数可能被截断。`,
    `The SMU compliance is ${compliance}. At the limit the instrument stops increasing its output, so the reading may be clipped.`,
  )

  return (
    <figure className="term-fig pwr-wiring">
      <svg className="term-fig__svg" viewBox="0 0 570 260" role="img" aria-label={t(mode.detail)}
        data-wiring={param} data-clip={clipped}>
        <rect width="570" height="260" fill="var(--well)" />
        <rect x="167" y="62" width="234" height="143" rx="10" fill="var(--panel)" stroke="var(--line-2)" strokeDasharray="5 4" />
        <text x="337" y="143" textAnchor="middle" fill="var(--muted)" fontSize="17">MOSFET</text>
        <g stroke="var(--text-2)" strokeWidth="2.5" fill="none" strokeLinejoin="round">
          <path d="M211 130 H234 V101 M234 130 V170" />
          <path d="M279 74 V102 H250 V119 M250 125 V145 M250 151 V169 H279 V218" />
          <path d="M251 135 H269 V170 H279" />
        </g>
        <text x="202" y="125" textAnchor="end" fill="var(--text)" fontSize="17">G</text>
        <text x="292" y="85" fill="var(--text)" fontSize="17">D</text>
        <text x="293" y="203" fill="var(--text)" fontSize="17">S</text>
        <g fill="none" stroke="var(--blue-strong)" strokeWidth="3" strokeLinejoin="round">
          {gateLeak
            ? <path d="M100 121 H135 V130 H211 M100 153 H125 V218 H279" />
            : <path d="M471 116 H365 V74 H279 M471 155 H436 V218 H279" />}
          {kelvin && <path d="M100 121 H135 V130 H211 M100 153 H125 V218 H279" />}
        </g>
        {short && <path data-short={short} d={{
          GS: 'M211 130 H153 V218 H279',
          GD: 'M211 130 H153 V74 H279',
          DS: 'M279 74 H399 V218 H279',
        }[short]} fill="none" stroke="var(--green)" strokeWidth="3.5" strokeLinejoin="round" />}
        {kelvin && <>
          <path data-sense="kelvin" d="M291 100 H350 V28 H461 M291 190 H380 V48 H461"
            fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeDasharray="5 4" />
          <path d="M279 100 H291 M279 190 H291" stroke="var(--gold)" strokeWidth="2.5" />
          <rect x="461" y="16" width="95" height="40" rx="6" fill="var(--gold-bg)" stroke="var(--gold)" />
          <text x="508" y="42" fill="var(--text)" textAnchor="middle" fontSize="16">Sense</text>
        </>}
        {(gateLeak || kelvin) && <>
          <rect x="14" y="97" width="86" height="75" rx="7" fill="var(--blue-bg)" stroke="var(--blue)" />
          <text x="57" y="121" textAnchor="middle" fill="var(--text)" fontWeight="bold" fontSize="18">{gateLeak ? 'SMU' : 'VGS'}</text>
          <text x="57" y="148" textAnchor="middle" fill="var(--text-2)" fontSize="16">{gateLeak ? 'FV / MI' : 'Bias'}</text>
        </>}
        {!gateLeak && <>
          <rect x="471" y="97" width="85" height="75" rx="7" fill="var(--blue-bg)" stroke="var(--blue)" />
          <text x="514" y="121" textAnchor="middle" fill="var(--text)" fontWeight="bold" fontSize="18">SMU</text>
          <text x="514" y="148" textAnchor="middle" fill="var(--text-2)" fontSize="16">{param === 'idss' ? 'FV / MI' : kelvin ? 'FI' : 'FI / MV'}</text>
        </>}
        {[[211, 130], [279, 74], [279, 218]].map(([x, y]) => <circle key={y} cx={x} cy={y} r="4.5" fill="var(--text)" />)}
        {kelvin && <path d="M279 100 V74 M279 190 V218" stroke="var(--text-2)" strokeWidth="2" />}
        <text x={forcePos} y="245" fill="var(--text)" fontSize="16">{`Force ${mode.force} · ${force}`}</text>
        <text x={gateLeak ? 80 : 330} y="245" fill="var(--text)" fontSize="16">{`Measure ${mode.measure}`}</text>
      </svg>
      <figcaption aria-live="polite">
        <strong>{t(PARAM_LABEL[param])} · {t(loc('接线示意', 'Wiring'))}</strong>{' '}
        {t(mode.detail)} {t(limitLabel)}{' '}
        {clipped && <strong>{t(loc('当前已触发。', 'Limit active now.'))}</strong>}
      </figcaption>
    </figure>
  )
}
