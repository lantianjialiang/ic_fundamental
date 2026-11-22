import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { IDDQ_LIMIT, IN_LIMIT, IN_PINS, type IddKind, type InMethod } from './data/dc'

const IDD_WINDOWS = {
  gross: { focus: [54, 104], text: loc('上电后在保护窗口读一次。限流由电源执行，图中只示意什么时候检查。', 'Read once in the power-up guard window. The supply enforces the current limit. The graph shows the timing of the check.') },
  static: { focus: [132, 204], text: loc('输入保持固定，输出空载。等切换尖峰消退后，在稳定平台取读数。', 'Hold inputs fixed and leave outputs unloaded. Read the plateau after the switching transient settles.') },
  iddq: { focus: [223, 405], text: loc('切换向量后停在稳定状态读一次。图中的短竖线对应下方八个停点 V1–V8。', 'After each vector change, stop and read the settled state. The eight markers correspond to V1–V8 below.') },
  dynamic: { focus: [415, 554], text: loc('连续跑向量，在多个周期的测量窗里取平均。虚线示意平均值的位置。', 'Run vectors continuously and average over multiple cycles. The dashed line shows the average.') },
}
const IDD_TIMES = [234, 257, 280, 303, 326, 349, 372, 395]
const IDD_POINTS = [143, 136, 69, 141, 138, 66, 142, 137]
const dynamicWave = Array.from({ length: 7 }, (_, i) => {
  const x = 415 + 19 * i
  return `L${x + 4} 105 L${x + 7} 76 L${x + 14} 116 L${x + 19} 127`
}).join(' ')

export function IddSamplingFigure({ kind, readings }: { kind: IddKind; readings: readonly number[] }) {
  const { t } = useLocale()
  const active = IDD_WINDOWS[kind]
  const [lo, hi] = active.focus
  return (
    <figure className="term-fig">
      <svg className="term-fig__svg" viewBox="0 0 580 199" role="img" aria-label={t(active.text)} data-idd-mode={kind}>
        <rect width="580" height="199" fill="var(--well)" />
        <rect x={lo} y="46" width={hi - lo} height="107" fill="var(--blue-bg)" stroke="var(--blue)" />
        <path d="M36 46 V155 H555 M550 151 L557 155 L550 159" fill="none" stroke="var(--muted)" strokeWidth="2" />
        <text x="18" y="43" fill="var(--text)" fontSize="17">IDD</text>
        <text x="557" y="183" textAnchor="end" fill="var(--text)" fontSize="17">{t(loc('时间', 'Time'))}</text>
        <path d="M37 151 H59 L67 68 Q76 77 90 102 L104 111 H122 L126 133 H214"
          fill="none" stroke="var(--blue-strong)" strokeWidth="3" />
        <circle cx="89" cy="100" r="4" fill={kind === 'gross' ? 'var(--gold)' : 'var(--blue-strong)'} />
        <circle cx="167" cy="133" r="4" fill={kind === 'static' ? 'var(--gold)' : 'var(--blue-strong)'} />
        <path d={`M214 133 ${IDD_TIMES.map((x, i) => {
          const y = readings[i] > IDDQ_LIMIT ? IDD_POINTS[i] : 142 - 2 * (i % 3)
          return `L${x - 10} 102 L${x - 7} ${y} H${x + 4}`
        }).join(' ')} L415 127 ${dynamicWave}`} fill="none" stroke="var(--blue-strong)" strokeWidth="3" strokeLinejoin="round" />
        {IDD_TIMES.map((x, i) => <g key={x}>
          <path d={`M${x} 153 V161`} stroke={kind === 'iddq' ? 'var(--gold)' : 'var(--muted)'} strokeWidth="2" />
          <text x={x} y="177" textAnchor="middle" fill="var(--text-2)" fontSize="14">{i + 1}</text>
        </g>)}
        {kind === 'dynamic' && <path d="M416 104 H552" stroke="var(--gold)" strokeWidth="2" strokeDasharray="6 4" />}
        {[[80, 'Gross'], [168, 'Static'], [315, 'IDDQ'], [483, 'Dynamic']].map(([x, label]) => (
          <text key={label} x={x} y="30" textAnchor="middle" fill="var(--text)" fontWeight="600" fontSize="18">{label}</text>
        ))}
      </svg>
      <figcaption aria-live="polite">{t(active.text)} {t(loc('波形纵轴为示意，停点的 µA 读数见下方。', 'The waveform is schematic. The stop readings in µA are below.'))}</figcaption>
    </figure>
  )
}

const pinX = (i: number) => 52 + i * 43

export function InputPmuFigure({ method, pin, reading, onPin, total }: {
  method: InMethod; pin: number; reading: number; onPin: (index: number) => void; total: number
}) {
  const { t } = useLocale()
  const serial = method === 'serial'
  const parallel = method === 'parallel'
  const activeX = pinX(pin)
  const mid = (pinX(0) + pinX(IN_PINS.length - 1)) / 2
  const caption = serial
    ? loc(`单台 PMU 接到 ${IN_PINS[pin]}，该脚 IIH = ${reading.toFixed(2)} µA。`, `One PMU is connected to ${IN_PINS[pin]}. Its IIH is ${reading.toFixed(2)} µA.`)
    : parallel
      ? loc('每个 PMU 独立 Force 高电平并测该脚电流，同一次量测留下 12 个可定位的独立读数。', 'Each PMU forces a high voltage and measures one pin. One measurement interval yields 12 separate readings.')
      : loc(`所有分支接到同一个节点，PMU 只读 Σ IIH = ${total.toFixed(2)} µA。这个读数没有引脚编号。`, `All branches share one node. The PMU measures Σ IIH = ${total.toFixed(2)} µA, with no pin identity in that reading.`)
  return (
    <figure className="term-fig">
      <svg className="term-fig__svg" viewBox="0 0 578 191" role="img" aria-label={t(caption)} data-pmu-mode={method}>
        <rect width="578" height="191" fill="var(--well)" />
        {!parallel && <>
          <rect x={mid - 78} y="15" width="156" height="33" rx="6" fill="var(--blue-bg)" stroke="var(--blue)" strokeWidth="2" />
          <text x={mid} y="38" textAnchor="middle" fill="var(--text)" fontSize="19">PMU · FV / MI</text>
          <path d={`M${mid} 48 V76 ${serial ? `H${activeX} V109` : `M${pinX(0)} 76 H${pinX(IN_PINS.length - 1)}`}`}
            stroke="var(--blue-strong)" fill="none" strokeWidth="3" />
        </>}
        <rect x="25" y="111" width="528" height="55" rx="7" fill="var(--panel)" stroke="var(--line-2)" strokeWidth="2" />
        {IN_PINS.map((name, i) => {
          const x = pinX(i)
          const on = !serial || i === pin
          return (
            <g key={name} data-connected={on}>
              {parallel && <>
                <rect x={x - 14} y="16" width="28" height="30" rx="5" fill="var(--blue-bg)" stroke="var(--blue)" strokeWidth="2" />
                <text x={x} y="36" textAnchor="middle" fill="var(--text)" fontSize="15">P</text>
              </>}
              {(parallel || !serial) && <path d={`M${x} ${parallel ? 46 : 76} V110`} stroke="var(--blue-strong)" strokeWidth="2" />}
              <circle cx={x} cy="111" r="5" fill={on ? 'var(--blue-strong)' : 'var(--muted)'} />
              <text x={x} y="137" textAnchor="middle" fill="var(--text)" fontSize="17">{name}</text>
            </g>
          )
        })}
        <text x={mid} y="158" textAnchor="middle" fill="var(--text-2)" fontSize="16">{t(loc('DUT 输入', 'DUT inputs'))}</text>
      </svg>
      {serial && <div className="knobs">
        <label>
          <span>{t(loc('逐脚移动到', 'Move to pin'))} <strong>{IN_PINS[pin]}</strong></span>
          <input type="range" min={0} max={IN_PINS.length - 1} value={pin} onChange={(event) => onPin(Number(event.target.value))} />
        </label>
      </div>}
      <figcaption aria-live="polite">
        {t(caption)} {t(loc(`单脚限值 ±${IN_LIMIT} µA。这里画的是高电平 IIH，FV/MI 表示强加电压、测量电流。`, `The per-pin limit is ±${IN_LIMIT} µA. This shows high-level IIH. FV/MI means force voltage, measure current.`))}
      </figcaption>
    </figure>
  )
}
