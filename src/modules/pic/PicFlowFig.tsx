import { Hit } from '../prep/common'

const BG = '#0d1117'
const GOLD = '#e8c45a'
const TEXT = '#c9d1d9'
const MUTED = '#8b949e'
const EDGE = '#3d4756'

export function PicFlowFig({
  steps,
  selected,
  onSelect,
  aria,
  summary,
}: {
  steps: Array<{ id: string; label: string; enabled: boolean; ariaLabel: string }>
  selected: string
  onSelect: (id: string) => void
  aria: string
  summary: string
}) {
  const W = 760
  const H = 128
  const y = 48
  const r = 16
  const pitch = (W - 80) / Math.max(1, steps.length - 1)
  const xOf = (index: number) => 40 + index * pitch

  return (
    <figure className="pic-fig">
      <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={aria} className="pic-svg">
        <rect width={W} height={H} rx={10} fill={BG} />
        {steps.slice(0, -1).map((step, index) => (
          <line
            key={step.id}
            x1={xOf(index) + r + 4}
            x2={xOf(index + 1) - r - 4}
            y1={y}
            y2={y}
            stroke={EDGE}
            strokeWidth={1.4}
          />
        ))}
        {steps.map((step, index) => {
          const active = step.id === selected
          const stroke = step.enabled || active ? GOLD : MUTED
          return (
            <Hit key={step.id} label={step.ariaLabel} active={active} onPick={() => onSelect(step.id)}>
              <circle cx={xOf(index)} cy={y} r={r} fill={step.enabled ? '#1c2128' : '#12161c'} stroke={stroke} strokeWidth={active ? 3 : 1.5} />
              <text x={xOf(index)} y={y + 4} fill={step.enabled ? TEXT : MUTED} fontSize={12} textAnchor="middle">
                {String(index + 1)}
              </text>
              <text x={xOf(index)} y={y + r + 22} fill={step.enabled ? TEXT : MUTED} fontSize={11} textAnchor="middle">
                {step.label}
              </text>
            </Hit>
          )
        })}
      </svg>
      <p className="pic-summary">{summary}</p>
    </figure>
  )
}
