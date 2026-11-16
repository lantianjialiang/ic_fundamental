import { useState } from 'react'
import { loc } from '../../i18n/locale'
import { useLocale } from '../../i18n/LocaleContext'
import { StepControls, useStepPlayer } from '../../lab/StepPlayer'
import { inMask, MASK_FLAT_UI, MASK_HALF_UI, MASK_MV, SPU, type EyeAnalysis } from './eyeModel'

const STEPS = [
  loc('原始波形', 'Source waveform'),
  loc('切成 2 UI 片段', 'Cut into 2 UI segments'),
  loc('对齐并叠加', 'Align and overlay'),
  loc('检查 mask', 'Check the mask'),
]
const COLORS = ['var(--blue)', 'var(--gold)', 'var(--green)', 'var(--red)']
const SPAN = 2 * SPU
const y = (mv: number) => 74 - mv * 0.12
const plotWidth = 448

export function EyeFormation({ analysis }: { analysis: EyeAnalysis }) {
  const { t } = useLocale()
  const player = useStepPlayer(STEPS.length, 2200)
  const [selected, setSelected] = useState<number | null>(null)
  const overlay = player.step >= 2
  const masking = player.step === 3
  const x = (sample: number) => 16 + sample * plotWidth / (overlay ? SPAN : SPAN * COLORS.length)
  const segments = COLORS.map((color, index) => ({
    color,
    samples: Array.from(analysis.wave.subarray(index * SPAN, (index + 1) * SPAN)),
  }))

  return (
    <div>
      <StepControls player={player} stepLabels={STEPS} />
      <p role="status">{t(STEPS[player.step])}</p>
      {player.step > 0 && <div className="row-actions">
        {segments.map(({ color }, index) => (
          <button key={color} type="button" className="lab__btn" aria-pressed={selected === index}
            onClick={() => setSelected(selected === index ? null : index)}>
            {t(loc(`片段 ${index + 1}`, `Segment ${index + 1}`))}
          </button>
        ))}
      </div>}
      <svg viewBox="0 0 480 152" width="100%" role="img" aria-label={t(STEPS[player.step])}>
        <path d="M16 74h448" stroke="var(--line)" />
        {player.step === 0 && <polyline fill="none" stroke="var(--blue)" strokeWidth="2"
          points={segments.flatMap(({ samples }) => samples).map((mv, index) => `${x(index)},${y(mv)}`).join(' ')} />}
        {player.step > 0 && segments.map(({ color, samples }, index) => {
          const offset = overlay ? 0 : index * SPAN
          const points = samples.map((mv, sample) => `${x(offset + sample)},${y(mv)}`).join(' ')
          return (
            <g key={color} opacity={selected !== null && selected !== index ? 0.2 : 1}>
              {player.step === 1 && <path d={`M${x(offset)} 16v116`} stroke="var(--line)" />}
              <polyline points={points} fill="none" stroke={color} strokeWidth="2" />
              {player.step === 1 && <text x={x(offset) + 4} y="144" fill="currentColor">{index + 1}</text>}
              {masking && samples.map((mv, sample) => {
                const phase = sample / SPU
                return inMask(Math.min(Math.abs(phase - 0.5), Math.abs(phase - 1.5)), mv)
                  ? <circle key={sample} cx={x(sample)} cy={y(mv)} r="2" fill="var(--red)" />
                  : null
              })}
            </g>
          )
        })}
        {masking && [0.5, 1.5].map((center) => (
          <polygon key={center} fill="none" stroke="var(--gold)" points={[
            [-MASK_HALF_UI, 0], [-MASK_FLAT_UI, MASK_MV], [MASK_FLAT_UI, MASK_MV],
            [MASK_HALF_UI, 0], [MASK_FLAT_UI, -MASK_MV], [-MASK_FLAT_UI, -MASK_MV],
          ].map(([phase, mv]) => `${x((center + phase) * SPU)},${y(mv)}`).join(' ')} />
        ))}
      </svg>
      <p className="intro__note">{t(loc('取实训波形开头四段，每段 2 UI。颜色对应原始片段，红点标出这些片段中落入禁区的样点。完整判定见下方眼图。', 'The first four 2 UI segments come from the lab waveform. Colors identify the source segments, and red dots mark their mask hits. The eye diagram below reports the full result.'))}</p>
    </div>
  )
}
