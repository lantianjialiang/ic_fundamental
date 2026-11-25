import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Knob, Readout, Seg } from '../fund/parts'
import { type AccelAnalysis, type AccelState } from './snsAccelModel'

const POSES = [
  { id: 'plus', label: loc('X 朝向重力', 'X with gravity') },
  { id: 'minus', label: loc('X 背向重力', 'X against gravity') },
] as const

export function SnsAccelStimulus({ state, analysis }: { state: AccelState; analysis: AccelAnalysis }) {
  const { t } = useLocale()
  const [pose, setPose] = useState<(typeof POSES)[number]['id']>('plus')
  const [rotation, setRotation] = useState(45)
  const [energized, setEnergized] = useState(false)
  const flip = state.plan === 'flip'
  const mechanical = state.plan !== 'selftest'
  const theta = (flip ? (pose === 'plus' ? 0 : 180) : rotation) + state.tiltDeg
  const projected = Math.cos(theta * Math.PI / 180)
  return (
    <figure className="term-fig">
      {flip && <Seg options={POSES} value={pose} onChange={setPose} />}
      {state.plan === 'spinner' && <Knob label={loc('转台角度', 'Rotary fixture angle')} value={rotation} unit="°" min={0} max={180} step={1} onChange={setRotation} />}
      {!mechanical && (
        <label className="hs-field__label">
          <input type="checkbox" checked={energized} onChange={(event) => setEnergized(event.target.checked)} />
          {' '}{t(loc('施加自检电压', 'Apply self-test voltage'))}
        </label>
      )}
      <svg className="term-fig__svg" viewBox="0 0 400 214" role="img" aria-label={t(loc('比较重力投影和片内静电力', 'Compare gravity projection and on-die electrostatic force'))}>
        <rect width="400" height="214" rx="10" fill="var(--well)" />
        {mechanical ? (
          <g data-accel-angle={theta}>
            <path d="M57 49 V150 M50 141 L57 151 L64 141" stroke="var(--blue)" strokeWidth="3" fill="none" />
            <text x="57" y="177" textAnchor="middle" fontSize="15" fill="var(--text)">{t(loc('重力 1 g', 'Gravity 1 g'))}</text>
            {state.plan === 'spinner' && <circle cx="205" cy="102" r="79" fill="none" stroke="var(--muted)" strokeDasharray="4 5" />}
            <g transform={`rotate(${-theta} 205 102)`}>
              <rect x="174" y="71" width="62" height="62" rx="6" fill="var(--fig-box)" stroke="var(--line-2)" />
              <rect x="192" y="89" width="26" height="26" rx="3" fill="var(--blue)" fillOpacity=".3" stroke="var(--blue)" />
              <path d="M205 102 V169 M198 160 L205 170 L212 160" fill="none" stroke="var(--gold)" strokeWidth="3" />
            </g>
            <text x="334" y="65" textAnchor="middle" fontSize="15" fill="var(--gold)">+X</text>
            <path d="M334 106 H374 M334 106 H294" stroke="var(--line-2)" strokeWidth="2" />
            <path data-accel-projection={projected} d={`M334 106 H${334 + projected * 39}`} stroke="var(--gold)" strokeWidth="5" />
            <circle cx="334" cy="106" r="2" fill="var(--text)" />
            <text x="334" y="137" textAnchor="middle" fontSize="15" fill="var(--text)">{projected >= 0 ? '+' : '−'}{Math.abs(projected).toFixed(3)} g</text>
          </g>
        ) : (
          <g data-accel-selftest={energized ? 'on' : 'off'}>
            <rect x="79" y="64" width="231" height="92" rx="10" fill="var(--fig-box)" stroke="var(--line-2)" />
            <rect x="256" y="81" width="20" height="58" rx="3" fill={energized ? 'var(--blue)' : 'var(--muted)'} />
            <path d={`M96 110 H${energized ? 173 : 151}`} stroke="var(--muted)" strokeWidth="3" strokeDasharray="5 3" />
            <rect x={energized ? 173 : 151} y="88" width="56" height="44" rx="4" fill="var(--gold)" fillOpacity=".45" stroke="var(--gold)" />
            {energized && <path d="M225 110 H251 M243 104 L251 110 L243 116" fill="none" stroke="var(--gold)" strokeWidth="2" />}
            <g fill="var(--text)" fontSize="15" textAnchor="middle">
              <text x="194" y="43">{t(loc('芯片与夹具静止', 'Chip and fixture stationary'))}</text>
              <text x="156" y="182">{t(loc('活动质量块', 'Proof mass'))}</text>
              <text x="270" y="182">{t(loc('自检电极', 'Self-test electrode'))}</text>
            </g>
          </g>
        )}
      </svg>
      <figcaption>
        {t({
          flip: loc('蓝箭头固定指向重力，金箭头随芯片翻转并标出 +X。右侧是重力在 +X 上的有符号投影。对照两次 X 轴读数即可求偏移和灵敏度。',
            'The blue arrow stays aligned with gravity. The gold arrow turns with the device and marks +X. The right side shows the signed projection. The two X readings give offset and sensitivity.'),
          spinner: loc('将转台定在不同角度，依次读取静态重力投影。90° 附近到达零点，180° 附近反向。安装倾角也计入实际轴向夹角。',
            'Index the fixture at different angles and read the static gravity projection. It crosses zero near 90° and reverses near 180°. Mount tilt contributes to the actual axial angle.'),
          selftest: loc('接通自检电极，静电力拉动质量块。输出响应可检查电极、质量块与读出链；外部加速度和安装条件的校准仍由翻转或转台完成。',
            'Energizing the electrode pulls the proof mass electrostatically. The response checks the electrode, mass and readout chain. Flip or rotary tests calibrate external acceleration and mounting.'),
        }[state.plan])}
      </figcaption>
      {mechanical && <Readout items={[
        { label: loc('重力沿 +X 的分量', 'Gravity projected onto +X'), value: `1 g × cos(${theta}°) ≈ ${projected.toFixed(3)} g` },
        ...(flip ? [
          { label: loc('所选姿态的 X 轴读数', 'X reading at the selected pose'), value: `${(pose === 'plus' ? analysis.vPlus : analysis.vMinus).toFixed(4)} V` },
          { label: loc('两次读数取平均得到偏移', 'Average the two readings for offset'), value: `(${analysis.vPlus.toFixed(4)} + ${analysis.vMinus.toFixed(4)}) / 2 ≈ ${analysis.offsetV.toFixed(4)} V` },
          { label: loc('两次读数差除以标称 2 g', 'Divide the voltage difference by the nominal 2 g'), value: `(${analysis.vPlus.toFixed(4)} − ${analysis.vMinus.toFixed(4)}) / 2 ≈ ${analysis.sVg.toFixed(4)} V/g` },
        ] : []),
      ]} />}
    </figure>
  )
}
