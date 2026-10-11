import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { MODES, VDD, type Mode } from './data/content'

const L = {
  dut: loc('DUT 输出级', 'DUT output stage'),
  up: loc('上拉管', 'Pull-up'),
  down: loc('下拉管', 'Pull-down'),
  pin: loc('输出脚', 'Output pin'),
  sourceDir: loc('DUT Source → PMU 吸入', 'DUT sources → PMU draws'),
  sinkDir: loc('PMU 灌入 → DUT Sink', 'PMU pushes → DUT sinks'),
  vohMin: loc('VOH min 2.4 V', 'VOH min 2.4 V'),
  volMax: loc('VOL max 0.4 V', 'VOL max 0.4 V'),
  capVoh: loc(
    '输出为 1：上拉管导通，把 VDD 经 R_on 接到管脚。PMU 抽走 IOH，R_on 上的压降让 VOH 低于 VDD。',
    'Output is 1: the pull-up is on and connects VDD to the pin through R_on. The PMU draws IOH, and the drop across R_on pulls VOH below VDD.',
  ),
  capVol: loc(
    '输出为 0：下拉管导通，把管脚经 R_on 接地。PMU 灌入 IOL，R_on 上的压降把 VOL 抬离 0 V。',
    'Output is 0: the pull-down is on and connects the pin to ground through R_on. The PMU pushes in IOL, and the drop across R_on lifts VOL above 0 V.',
  ),
}

/** 电压刻度：0–3.3 V 映射到 y 270–30 */
const vy = (v: number) => 270 - (v / VDD) * 240

function resistor(x: number, y: number, on: boolean) {
  return (
    <path
      d={`M${x} ${y} l0 10 l10 5 l-20 10 l20 10 l-20 10 l10 5 l0 10`}
      fill="none"
      stroke={on ? 'var(--gold)' : 'var(--line-2)'}
      strokeWidth="2.5"
    />
  )
}

export function OutputStageFig({
  mode,
  ma,
  ron,
  volt,
  pass,
}: {
  mode: Mode
  ma: number
  ron: number
  volt: number
  pass: boolean
}) {
  const { t } = useLocale()
  const high = mode === 'voh'
  const hot = 'var(--gold)'
  const off = 'var(--line-2)'
  const limit = MODES[mode].limit
  const flowing = ma > 0
  const flowStyle = { animationDuration: `${Math.max(0.25, 1.6 - ma * 0.11).toFixed(2)}s` }
  const iName = high ? 'IOH' : 'IOL'
  const formula = high
    ? `VOH = ${VDD.toFixed(1)} − ${ma.toFixed(1)} mA × ${ron} Ω`
    : `VOL = ${ma.toFixed(1)} mA × ${ron} Ω`
  const zoneTop = high ? vy(VDD) : vy(limit)
  const zoneH = high ? vy(limit) - vy(VDD) : vy(0) - vy(limit)

  return (
    <figure className="term-fig">
      <svg viewBox="0 0 720 300" className="term-fig__svg" role="img" aria-label={t(high ? L.capVoh : L.capVol)}>
        <defs>
          <marker id="m06-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0 0 L10 5 L0 10 Z" fill="var(--gold)" />
          </marker>
        </defs>
        <rect width="720" height="300" rx="10" fill="var(--well)" />

        {/* 芯片边界 */}
        <rect x="40" y="14" width="300" height="272" rx="10" fill="none" stroke="var(--line)" strokeDasharray="6 5" />
        <text x="54" y="34" fill="var(--muted)" fontSize="12">
          {t(L.dut)}
        </text>

        {/* VDD 与上拉管 */}
        <line x1="120" y1="50" x2="220" y2="50" stroke="var(--sky)" strokeWidth="2" />
        <text x="228" y="54" fill="var(--sky)" fontSize="12">
          {`VDD ${VDD.toFixed(1)} V`}
        </text>
        <line x1="170" y1="50" x2="170" y2="65" stroke={high ? hot : off} strokeWidth="2.5" />
        {resistor(170, 65, high)}
        <line x1="170" y1="125" x2="170" y2="150" stroke={high ? hot : off} strokeWidth="2.5" />
        <text x="194" y="90" fill={high ? 'var(--text)' : 'var(--dim)'} fontSize="13">
          {t(L.up)} {high ? 'ON' : 'OFF'}
        </text>
        {high ? (
          <text x="194" y="108" fill="var(--gold)" fontSize="13" fontFamily="var(--mono)">
            {`R_on = ${ron} Ω`}
          </text>
        ) : null}

        {/* 下拉管与地 */}
        <line x1="170" y1="150" x2="170" y2="175" stroke={high ? off : hot} strokeWidth="2.5" />
        {resistor(170, 175, !high)}
        <line x1="170" y1="235" x2="170" y2="252" stroke={high ? off : hot} strokeWidth="2.5" />
        <line x1="148" y1="252" x2="192" y2="252" stroke="var(--muted)" strokeWidth="2" />
        <line x1="157" y1="259" x2="183" y2="259" stroke="var(--muted)" strokeWidth="2" />
        <line x1="165" y1="266" x2="175" y2="266" stroke="var(--muted)" strokeWidth="2" />
        <text x="194" y="200" fill={high ? 'var(--dim)' : 'var(--text)'} fontSize="13">
          {t(L.down)} {high ? 'OFF' : 'ON'}
        </text>
        {!high ? (
          <text x="194" y="218" fill="var(--gold)" fontSize="13" fontFamily="var(--mono)">
            {`R_on = ${ron} Ω`}
          </text>
        ) : null}

        {/* 输出节点 → 管脚 → PMU */}
        <line x1="170" y1="150" x2="440" y2="150" stroke={flowing ? hot : 'var(--muted)'} strokeWidth="2.5" />
        <circle cx="170" cy="150" r="4.5" fill="var(--text)" />
        <circle cx="340" cy="150" r="7" fill="var(--card)" stroke="var(--text)" />
        <text x="340" y="176" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(L.pin)}
        </text>

        {/* 电流路径：流动虚线 + 箭头 */}
        {flowing ? (
          <>
            <path
              className="m06-flow"
              style={flowStyle}
              d={high ? 'M170 50 L170 150 L440 150' : 'M440 150 L170 150 L170 252'}
              fill="none"
              stroke="var(--text)"
              strokeWidth="2"
            />
            {high ? (
              <>
                <line x1="150" y1="80" x2="150" y2="118" stroke={hot} strokeWidth="2" markerEnd="url(#m06-arrow)" />
                <line x1="240" y1="140" x2="300" y2="140" stroke={hot} strokeWidth="2" markerEnd="url(#m06-arrow)" />
              </>
            ) : (
              <>
                <line x1="300" y1="140" x2="240" y2="140" stroke={hot} strokeWidth="2" markerEnd="url(#m06-arrow)" />
                <line x1="150" y1="190" x2="150" y2="228" stroke={hot} strokeWidth="2" markerEnd="url(#m06-arrow)" />
              </>
            )}
          </>
        ) : null}
        <text x="390" y="128" textAnchor="middle" fill="var(--gold)" fontSize="13" fontFamily="var(--mono)">
          {`${iName} = ${ma.toFixed(1)} mA`}
        </text>
        <text x="390" y="112" textAnchor="middle" fill="var(--muted)" fontSize="11">
          {t(high ? L.sourceDir : L.sinkDir)}
        </text>

        {/* PMU */}
        <rect x="440" y="125" width="130" height="62" rx="8" fill="var(--blue-bg)" stroke="var(--blue)" />
        <text x="505" y="148" textAnchor="middle" fill="var(--text)" fontSize="14">
          PMU
        </text>
        <text x="505" y="172" textAnchor="middle" fill="var(--text-2)" fontSize="11" fontFamily="var(--mono)">
          Force I · Measure V
        </text>
        <text x="380" y="222" fill="var(--text-2)" fontSize="12" fontFamily="var(--mono)">
          {formula}
        </text>
        <text x="380" y="244" fill={pass ? 'var(--green-2)' : 'var(--red-2)'} fontSize="15" fontFamily="var(--mono)" fontWeight="700">
          {`= ${volt.toFixed(2)} V  ${pass ? 'PASS' : 'FAIL'}`}
        </text>

        {/* 电压刻度：绿色是合格区 */}
        <rect x="650" y={vy(VDD)} width="18" height={vy(0) - vy(VDD)} fill="var(--red-bg)" stroke="var(--line)" />
        <rect x="650" y={zoneTop} width="18" height={zoneH} fill="var(--green-bg)" />
        <text x="644" y={vy(VDD) + 4} textAnchor="end" fill="var(--muted)" fontSize="11">
          3.3 V
        </text>
        <text x="644" y={vy(0) + 4} textAnchor="end" fill="var(--muted)" fontSize="11">
          0 V
        </text>
        <line x1="600" y1={vy(limit)} x2="672" y2={vy(limit)} stroke="var(--gold)" strokeDasharray="5 3" strokeWidth="1.5" />
        <text x="644" y={vy(limit) + (high ? -6 : 14)} textAnchor="end" fill="var(--gold)" fontSize="11">
          {t(high ? L.vohMin : L.volMax)}
        </text>
        <path
          d={`M672 ${vy(volt)} l10 -6 l0 12 Z`}
          fill={pass ? 'var(--green)' : 'var(--red)'}
        />
        <line x1="650" y1={vy(volt)} x2="672" y2={vy(volt)} stroke={pass ? 'var(--green)' : 'var(--red)'} strokeWidth="3" />
      </svg>
      <figcaption>{t(high ? L.capVoh : L.capVol)}</figcaption>
    </figure>
  )
}
