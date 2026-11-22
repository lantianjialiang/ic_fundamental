import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Seg } from '../fund/parts'
import { ROLE_TITLE, TEST_TITLE } from './picOverviewData'
import { type RoleId, type TestId } from './picOverviewModel'

const ELECTRIC = '#6ad0f9'
const LIGHT = '#67dfab'
const CONTROL = '#d5b0fa'
const BG = '#142435'
const TEXT = '#e5eef8'
const GOLD = '#ffdb80'

const CHANNELS = [
  { id: 'tx', label: loc('跟踪发送数据', 'Trace transmit data'), detail: loc('交换 ASIC 的电数据经过 EIC 驱动调制器。激光提供光载波，调制后的光经过耦合器和 FAU 进入光纤。', 'The ASIC sends electrical data via the EIC to the modulator. The laser supplies the carrier. Modulated light exits through the coupler and FAU into the fiber.') },
  { id: 'laser', label: loc('跟踪激光载波', 'Trace the laser carrier'), detail: loc('外置激光先把连续光送进 PIC 的输入耦合端，再沿波导喂给调制器。', 'The external laser feeds continuous light into the PIC input coupler and through a waveguide to the modulator.') },
  { id: 'control', label: loc('跟踪偏置控制', 'Trace bias control'), detail: loc('偏置和监测走低速电控制。这里画 EIC 调整调制器工作点的支路。', 'Bias and monitoring use low-speed electrical control. This branch shows the EIC adjusting the modulator operating point.') },
] as const

const BLOCKS = [
  { id: 'asic', x: 31, y: 91, w: 98, h: 66, label: 'ASIC' },
  { id: 'eic', x: 167, y: 91, w: 81, h: 66, label: 'EIC' },
  { id: 'els', x: 175, y: 25, w: 74, h: 39, label: 'ELS' },
  { id: 'mod', x: 282, y: 105, w: 80, h: 37, label: 'MOD' },
  { id: 'gc', x: 382, y: 131, w: 32, h: 29, label: 'GC' },
  { id: 'fau', x: 445, y: 131, w: 56, h: 29, label: 'FAU' },
  { id: 'fiber', x: 517, y: 131, w: 62, h: 29, label: 'Fiber' },
] as const

const PATHS = [
  { id: 'data', channel: 'tx', d: 'M129 124 H163 M248 124 H278', tip: 'M157 119 L164 124 L157 129 M272 119 L279 124 L272 129', color: ELECTRIC, dash: undefined },
  { id: 'modulated', channel: 'tx', d: 'M322 142 V146 H379 M414 146 H442 M501 146 H514', tip: 'M373 141 L380 146 L373 151 M436 141 L443 146 L436 151 M508 141 L515 146 L508 151', color: LIGHT, dash: undefined },
  { id: 'carrier', channel: 'laser', d: 'M249 45 H339 V102', tip: 'M334 95 L339 102 L344 95', color: LIGHT, dash: undefined },
  { id: 'bias', channel: 'control', d: 'M248 101 H268 V113 H279', tip: 'M273 108 L280 113 L273 118', color: CONTROL, dash: '5 4' },
] as const

export function PicOverviewFig({ role }: { role: RoleId }) {
  const { t } = useLocale()
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]['id']>('tx')
  const active = CHANNELS.find(({ id }) => id === channel) ?? CHANNELS[0]
  return (
    <figure className="pic-fig pic-route">
      <Seg options={CHANNELS} value={channel} onChange={setChannel} />
      <svg viewBox="0 0 600 218" role="img" aria-label={t(active.detail)} className="pic-svg" data-channel={channel} data-role={role}>
        <rect width="600" height="218" rx="10" fill={BG} />
        <rect x="19" y="72" width="410" height="120" rx="10" fill="#1d3551" stroke="#7c9eb9" strokeWidth="2" strokeDasharray="6 4" />
        <rect x="267" y="79" width="154" height="101" rx="8" fill="#123a42" stroke={role === 'pic' ? GOLD : '#4b898d'} strokeWidth={role === 'pic' ? 3 : 1.5} />
        <text x="280" y="98" fill={TEXT} fontSize="16">PIC</text>
        <text x="31" y="183" fill={TEXT} fontSize="16">{t(loc('共封装边界', 'Co-package boundary'))}</text>
        {BLOCKS.map(({ id, x, y, w, h, label }) => (
          <g key={id}>
            <rect x={x} y={y} width={w} height={h} rx="6" fill="#24384f" stroke={id === role ? GOLD : '#6886a0'} strokeWidth={id === role ? 3 : 1.5}/>
            <text x={x + w / 2} y={y + h / 2 + 6} fill={TEXT} textAnchor="middle" fontSize={id === 'gc' ? 14 : 17}>{label}</text>
          </g>
        ))}
        {PATHS.map(({ id, channel: route, d, tip, color, dash }) => (
          <path key={id} data-route={id} data-lit={route === channel} d={`${d} ${tip}`} stroke={color} fill="none" strokeWidth={route === channel ? 4 : 2}
            strokeDasharray={dash} strokeLinecap="round" strokeLinejoin="round" opacity={route === channel ? 1 : .45} />
        ))}
        <circle cx="339" cy="83" r="6" fill={BG} stroke={LIGHT} strokeWidth="2" />
      </svg>
      <ul className="pic-route-legend">
        <li style={{ borderColor: ELECTRIC }}>{t(loc('高速电数据', 'High-speed electrical data'))}</li>
        <li style={{ borderColor: LIGHT }}>{t(loc('光载波或光数据', 'Optical carrier or data'))}</li>
        <li style={{ borderColor: CONTROL }}>{t(loc('低速偏置控制', 'Low-speed bias control'))}</li>
      </ul>
      <figcaption className="pic-summary" aria-live="polite">{t(active.detail)} {t(loc('当前定位', 'Selected role'))} · {t(ROLE_TITLE[role])}</figcaption>
    </figure>
  )
}

const TEST_CONNECTIONS = {
  cutback: { source: loc('可调激光', 'Tunable laser'), device: loc('长 / 短波导', 'Long / short guides'), sink: loc('光功率计', 'Power meter'), links: ['optical', 'optical'],
    detail: loc('探头从晶圆上的输入耦合器注光，在输出耦合器收光。两条不同长度波导的功率差用来求单位长度损耗。', 'Inject into the wafer input coupler and collect from the output coupler. Compare power for two guide lengths to obtain loss per unit length.') },
  dark: { source: loc('SMU 反偏', 'SMU reverse bias'), device: loc('遮光 PD', 'Dark PD'), sink: loc('SMU 测电流', 'SMU current'), links: ['electric', 'electric'],
    detail: loc('遮光后，用电探针给 PD 两端施加反偏，由同一台 SMU 读暗电流。', 'With light blocked, bias the photodiode through electrical probes and read dark current with the same SMU.') },
  kgd: { source: loc('光探头与探针', 'Optical & DC probes'), device: loc('待筛光学裸片', 'Bare photonic die'), sink: loc('光电读数', 'Optical & DC reads'), links: ['both', 'both'],
    detail: loc('合格裸片筛选同时接光耦合端与电焊盘。核对插损、电响应等项目后，再把合格裸片送去组装。', 'Screen the bare die through its couplers and electrical pads. Check insertion loss and electrical response before selecting good dies for assembly.') },
  loop: { source: loc('BERT 发码', 'BERT generator'), device: loc('EIC + PIC', 'EIC + PIC'), sink: loc('BERT 判错', 'BERT error check'), links: ['electric', 'electric'],
    detail: loc('BERT 电端接光引擎，光端从 Tx 回到 Rx，回来的电数据送回 BERT 比对误码。', 'A BERT drives the engine electrically. Loop the optical Tx back to Rx and return the recovered electrical bits to the BERT.') },
  align: { source: loc('激光 + 位移台', 'Laser + positioner'), device: loc('FAU ↔ 耦合面', 'FAU ↔ coupler'), sink: loc('光功率计', 'Power meter'), links: ['optical', 'optical'],
    detail: loc('位移台挪动封装口的 FAU，用光功率读数反馈位置。功率最高的区域是主动对准的目标。', 'Move the FAU at the package interface and use optical power as position feedback. Active alignment searches for peak power.') },
  sys: { source: loc('流量源', 'Traffic generator'), device: loc('交换 ASIC + 引擎', 'ASIC + engine'), sink: loc('远端接收端', 'Far-end receiver'), links: ['electric', 'optical'],
    detail: loc('从系统接口送入流量，经 ASIC、电通道和已接好的光引擎，从光纤另一端核对链路误码。', 'Send traffic at the system interface through the ASIC, the electrical channel and the installed engine. Check link errors at the far fiber end.') },
} as const

export function PicTestWiring({ test }: { test: TestId }) {
  const { t } = useLocale()
  const { source, device, sink, links, detail } = TEST_CONNECTIONS[test]
  return (
    <figure className="pic-fig pic-route">
      <svg viewBox="0 0 580 121" className="pic-svg" role="img" aria-label={t(detail)} data-test-wiring={test}>
        <rect width="580" height="121" rx="10" fill={BG} />
        {([ [14, source], [209, device], [404, sink] ] as const).map(([x, label], index) => (
          <g key={index}>
            <rect x={x} y="40" width="162" height="54" rx="6" fill={index === 1 ? '#12454a' : '#263e55'} stroke="#7393ac" />
            <text x={x + 81} y="72" fill={TEXT} fontSize="16" textAnchor="middle">{t(label)}</text>
          </g>
        ))}
        {links.map((link, i) => {
          const x = i === 0 ? 177 : 372
          const colors = link === 'both' ? [ELECTRIC, LIGHT] : [link === 'optical' ? LIGHT : ELECTRIC]
          return <g key={x}>{colors.map((color, n) => <path key={color} d={`M${x} ${62 + 9 * n} h28 m-7 -5 l7 5 l-7 5`}
            stroke={color} fill="none" strokeWidth="2.5" />)}</g>
        })}
        {test === 'loop' && <>
          <path d="M242 39 V22 H338 V39 M332 33 L338 39 L344 33" stroke={LIGHT} fill="none" strokeWidth="2.5" />
          <text x="290" y="17" textAnchor="middle" fill={LIGHT} fontSize="14">Tx → Rx</text>
        </>}
      </svg>
      <figcaption className="pic-summary" aria-live="polite"><strong>{t(TEST_TITLE[test])}</strong> · {t(detail)}</figcaption>
    </figure>
  )
}
