import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Knob } from '../fund/parts'
import { gcLossDb } from './core/photonics'

const BG = '#142435'
const CHIP = '#243f58'
const GREEN = '#72e2b6'
const BLUE = '#8cd4f8'
const GOLD = '#ffdc83'
const WHITE = '#e5eef8'

function CouplerSection({ edge, displacement }: { edge: boolean; displacement: number }) {
  const { t } = useLocale()
  const name = edge ? loc('边缘耦合 · 从端面进入', 'Edge coupler · facet entry') : loc('光栅耦合 · 从上表面进入', 'Grating coupler · top entry')
  const shift = displacement * 5
  return (
    <figure className="pic-fig">
      <svg className="pic-svg" viewBox="0 0 310 180" role="img" aria-label={t(name)} data-coupler={edge ? 'edge' : 'grating'}>
        <rect width="310" height="180" rx="9" fill={BG} />
        {edge ? <>
          <path d="M147 61 H284 V145 H147Z" fill={CHIP} stroke="#6885a1" strokeWidth="2" />
          <path d="M148 105 L188 96 H279 V114 H188Z" fill={GREEN} />
          <path d="M146 63 V144" stroke={WHITE} strokeDasharray="4 4" strokeWidth="2" />
          <g transform={`translate(0 ${-shift})`} data-fiber-offset={displacement}>
            <rect x="20" y="92" width="83" height="26" rx="4" fill="#557d98" stroke={BLUE} />
            <path d="M25 105 H138 M129 98 L138 105 L129 112" fill="none" stroke={GREEN} strokeWidth="3" />
          </g>
          <text x="191" y="80" fill={WHITE} fontSize="16">{t(loc('芯片端面', 'Chip facet'))}</text>
          <path d="M119 105 H146" stroke={GOLD} strokeWidth="2" strokeDasharray="3 3" />
          <text x="31" y="161" fill={GOLD} fontSize="15">{t(loc('偏移沿端面方向 ↕', 'Offset along the facet ↕'))}</text>
        </> : <>
          <rect x="24" y="108" width="262" height="37" fill={CHIP} stroke="#6885a1" strokeWidth="2" />
          <path d="M139 116 H279" stroke={GREEN} strokeWidth="6" />
          {[129, 136, 143, 150, 157].map((x) => <rect key={x} x={x} y="106" width="4" height="12" fill={BLUE} />)}
          <path d="M144 105 V79" stroke={GOLD} strokeWidth="2" strokeDasharray="3 3" />
          <g transform={`translate(${shift} 0)`} data-fiber-offset={displacement}>
            <path d="M105 28 L126 22 L144 67 L125 74Z" fill="#557d98" stroke={BLUE} />
            <path d="M116 28 L143 103 M132 96 L143 103 L146 91" fill="none" stroke={GREEN} strokeWidth="3" />
          </g>
          <text x="193" y="98" fill={WHITE} fontSize="16">{t(loc('表面光栅', 'Surface grating'))}</text>
          <text x="31" y="165" fill={GOLD} fontSize="15">{t(loc('偏移沿芯片表面 ↔', 'Offset along the chip surface ↔'))}</text>
        </>}
      </svg>
      <figcaption className="pic-summary">{t(name)}</figcaption>
    </figure>
  )
}

export function PicAlignGeometry({ w, example }: { w: number; example: boolean }) {
  const { t } = useLocale()
  const [manualShift, setShift] = useState(0)
  const shift = example ? w : manualShift
  const offset = Math.abs(shift)
  const loss = gcLossDb(offset, w, 0)
  const center = 214 + shift * 9
  const radius = w * 9
  const sourceLabel = loc('光纤模式', 'Fiber mode')
  return (
    <div className="pic-route pic-couplers">
      <div className="knobs">
        {!example && <Knob label={loc('沿耦合面的横向位移', 'Lateral shift across the coupling plane')} value={manualShift}
          unit="µm" min={-8} max={8} step={0.5} onChange={setShift} />}
      </div>
      <div className="pic-coupler-grid">
        <CouplerSection edge={false} displacement={shift} />
        <CouplerSection edge displacement={shift} />
      </div>
      <figure className="pic-fig">
        <svg className="pic-svg" viewBox="0 0 428 170" role="img"
          aria-label={t(loc('波导模式与光纤模式的横截面重叠', 'Cross-sectional overlap of guide and fiber modes'))} data-offset={shift}>
          <rect width="428" height="170" rx="9" fill={BG} />
          <path d="M38 77 H389" stroke="#6d859e" strokeDasharray="5 4" />
          <ellipse cx="214" cy="77" rx={radius} ry="36" fill={BLUE} fillOpacity=".28" stroke={BLUE} strokeWidth="2" />
          <ellipse cx={center} cy="77" rx={radius} ry="36" fill={GREEN} fillOpacity=".32" stroke={GREEN} strokeWidth="2" strokeDasharray="6 4" />
          <path d={`M214 75 V128 M${center} 75 V128 M214 128 H${center}`} fill="none" stroke={GOLD} strokeWidth="2" />
          <text x="214" y="153" textAnchor="middle" fill={GOLD} fontSize="18">{`|Δ| = ${offset.toFixed(1)} µm`}</text>
          <path d={`M214 78 H${214 + radius}`} stroke={BLUE} strokeWidth="2" />
          <text x="16" y="28" fill={BLUE} fontSize="16">{t(loc('波导模式', 'Guide mode'))} · w = {w.toFixed(1)} µm</text>
          <text x="412" y="28" textAnchor="end" fill={GREEN} fontSize="16">{t(sourceLabel)}</text>
        </svg>
        <figcaption className="pic-summary" aria-live="polite">
          {t(loc(`当前额外损耗 = 4.343 × (${offset.toFixed(1)} / ${w.toFixed(1)})² ≈ ${loss.toFixed(3)} dB。图中横向偏移垂直于入射方向，正负移位的损耗在本模型相同。两张截面用于比较入光方向。实际公差取决于耦合器设计。`, `Added loss = 4.343 × (${offset.toFixed(1)} / ${w.toFixed(1)})² ≈ ${loss.toFixed(3)} dB. Lateral shift is transverse to propagation. Its sign does not affect loss in this model. The two sections compare launch directions. Actual tolerance depends on coupler design.`))}
        </figcaption>
      </figure>
    </div>
  )
}
