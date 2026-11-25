import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Seg } from '../fund/parts'
import { Gnd, MosSym, T } from './SwitchFigs'
import { BOOT, bootCapVoltage } from './data/mosSwitchModel'

const MODES = [
  { id: 'refresh', label: loc('周期切换', 'Periodic switching') },
  { id: 'hold', label: loc('长时间请求导通', 'Hold on for a long time') },
] as const

export function HighSideDriveFig({ approach }: { approach: string }) {
  const { t } = useLocale()
  const [mode, setMode] = useState<(typeof MODES)[number]['id']>('refresh')
  const bootstrap = approach === 'bootstrap'
  const pmos = approach === 'pmos'
  const depleted = bootstrap && mode === 'hold'
  const vb = bootCapVoltage()
  const source = t(pmos ? loc('源极在母线', 'Source at bus') : loc('源极在负载端', 'Source at load'))
  const driver = t(bootstrap ? loc('自举驱动', 'Bootstrap driver') : pmos ? loc('限幅下拉', 'Clamped pull-down') : loc('独立振荡电荷泵', 'Clocked charge pump'))
  const feed = t(bootstrap ? loc('SW 拉低时补电', 'Recharge while SW is low') :
    pmos ? loc('母线提供栅源参考', 'Bus is the gate reference') : loc('振荡器运行时补电', 'Refresh with oscillator running'))
  const result = depleted
    ? loc('长时间保持时，开关点缺少低电平补电窗口。自举电容电压下降，栅源驱动无法持续。', 'A long hold removes the low switch-node recharge interval. The bootstrap voltage droops and gate drive cannot be sustained.')
    : pmos
      ? loc(`例：S = ${BOOT.vbus} V，限幅驱动将 G 拉到 ${(BOOT.vbus - vb).toFixed(1)} V，VGS = −${vb.toFixed(1)} V。限幅避免 VGS 超过器件额定值。`, `Example: S = ${BOOT.vbus} V. The clamp lets G reach ${(BOOT.vbus - vb).toFixed(1)} V, giving VGS = −${vb.toFixed(1)} V. The clamp keeps VGS within the device rating.`)
      : loc(`按同样的示例过驱，导通时 S ≈ ${BOOT.vbus} V，G ≈ ${(BOOT.vbus + vb).toFixed(1)} V，VGS ≈ +${vb.toFixed(1)} V。`, `At the same illustrative overdrive, S ≈ ${BOOT.vbus} V, G ≈ ${(BOOT.vbus + vb).toFixed(1)} V and VGS ≈ +${vb.toFixed(1)} V.`)
  const current = depleted ? 'var(--muted)' : 'var(--gold)'
  const sy = pmos ? 50 : 110
  return (
    <figure className="term-fig">
      <Seg options={MODES} value={mode} onChange={setMode} />
      <svg viewBox="0 0 465 220" className="term-fig__svg" role="img" aria-label={t(result)} data-drive={approach} data-depleted={depleted}>
        <rect width="465" height="220" fill="var(--well)" />
        <path d="M310 28 V50 M310 110 V130 l-7 5 14 8 -14 8 14 8 -14 8 7 5 V188" stroke={current} strokeWidth="3" fill="none" />
        <MosSym x={288} y={80} kind={pmos ? 'p' : 'n'} flip={pmos} color={current} />
        <Gnd x={310} y={188} />
        <T x={310} y={22} size={16} bold>{`${BOOT.vbus} V`}</T>
        <T x={327} y={159} size={16} anchor="start">{t(loc('同一负载', 'Same load'))}</T>
        <rect x="18" y="59" width="173" height="42" rx="6" fill="var(--blue-bg)" stroke="var(--blue)" />
        <T x={104} y={85} size={16}>{driver}</T>
        <path d="M191 80 H258" stroke={current} strokeWidth="2.5" />
        <circle cx="310" cy={sy} r="4" fill="var(--blue-strong)" />
        <path d={`M310 ${sy} H213 V112 H105 V101`} fill="none" stroke="var(--blue-strong)" strokeWidth="2" strokeDasharray="5 4" />
        <T x={320} y={sy + 5} size={15} anchor="start">{source}</T>
        <T x={22} y={135} size={15} anchor="start">{feed}</T>
        <T x={22} y={178} size={19} anchor="start" mono>{depleted ? 'VGS ↓' : `VGS ≈ ${pmos ? '−' : '+'}${vb.toFixed(1)} V`}</T>
      </svg>
      <figcaption aria-live="polite">{t(result)} {t(loc('蓝色虚线标出驱动的栅源参考。', 'The dashed blue line marks the driver’s source reference.'))}</figcaption>
    </figure>
  )
}
