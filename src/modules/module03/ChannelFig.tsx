import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { LV, TM, type DutCase, type PeId } from './data/content'

const L = {
  ate: loc('ATE · Pin Electronics', 'ATE · Pin Electronics'),
  pattern: loc('Pattern 内存', 'Pattern memory'),
  driver: loc('Driver', 'Driver'),
  comparator: loc('Comparator', 'Comparator'),
  path: loc('Load Board / Socket', 'Load board / socket'),
  expect: loc('期望', 'Expect'),
  read: loc('读到', 'Read'),
  stuck: loc('✕ 卡在 0', '✕ stuck at 0'),
  cap: loc(
    '上：两路 Channel，A 脚驱动、Y 脚比较。下：同一拍的波形，竖线是驱动沿和 Strobe。金色是当前这一步，蓝色是已完成的步骤。',
    'Top: two channels, driving pin A and comparing pin Y. Bottom: waveforms for the same cycle; the vertical lines are the drive edge and the strobe. Gold is the current step, blue is done.',
  ),
}

const xt = (t: number) => 160 + t * 23
const yA = (v: number) => 292 - v * 10
const yY = (v: number) => 348 - v * 12

const FOCUS_BOX: Record<PeId, [number, number, number, number]> = {
  driver: [292, 14, 66, 78],
  comparator: [292, 168, 66, 70],
  timing: [154, 90, 142, 68],
  level: [304, 90, 162, 68],
}

export function ChannelFig({ step, dut, focus }: { step: number; dut: DutCase; focus: PeId }) {
  const { t } = useLocale()
  const hot = 'var(--gold)'
  const done = 'var(--blue)'
  const idle = 'var(--line-2)'
  const col = (k: number) => (step === k ? hot : step > k ? done : idle)
  const txt = (k: number) => (step >= k ? 'var(--text)' : 'var(--dim)')
  // DUT 输出高电平由它自己的 VDD 决定，不等于测试机的驱动电平
  const yOut = dut === 'good' ? LV.vdd : 0
  const readH = yOut >= LV.voh
  const pass = readH
  const yPath =
    dut === 'good'
      ? `M${xt(0)} ${yY(0)} H${xt(TM.drive + TM.tpd)} V${yY(LV.vdd)} H${xt(TM.period)}`
      : `M${xt(0)} ${yY(0)} H${xt(TM.period)}`

  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 380" className="term-fig__svg" role="img" aria-label={t(L.cap)}>
        <rect width="680" height="380" rx="10" fill="var(--well)" />
        <rect x="10" y="10" width="470" height="230" rx="10" fill="none" stroke="var(--line)" strokeDasharray="6 5" />
        <text x="470" y="232" textAnchor="end" fill="var(--muted)" fontSize="11">
          {t(L.ate)}
        </text>

        {/* Pattern 内存 */}
        <rect x="20" y="20" width="120" height="110" rx="8" fill="var(--fig-box)" stroke={col(0)} strokeWidth={step === 0 ? 2 : 1.2} />
        <text x="80" y="37" textAnchor="middle" fill="var(--text)" fontSize="12">
          {t(L.pattern)}
        </text>
        <rect x="24" y="82" width="112" height="20" rx="3" fill={step >= 0 ? 'var(--gold-bg)' : 'none'} />
        <g fontFamily="var(--mono)" fontSize="12">
          <text x="66" y="58" textAnchor="middle" fill="var(--sky)">
            A
          </text>
          <text x="110" y="58" textAnchor="middle" fill="var(--gold)">
            Y
          </text>
          {[
            ['0', 'L'],
            ['1', 'H'],
            ['0', 'L'],
          ].map(([a, y], i) => (
            <g key={i}>
              <text x="34" y={77 + i * 20} fill="var(--dim)" fontSize="10">
                {i}
              </text>
              <text x="66" y={77 + i * 20} textAnchor="middle" fill="var(--text)">
                {a}
              </text>
              <text x="110" y={77 + i * 20} textAnchor="middle" fill="var(--text)">
                {y}
              </text>
            </g>
          ))}
        </g>
        {/* 数据线、期望线 */}
        <path d="M140 52 H300" stroke={col(0)} strokeWidth="2" />
        <text x="200" y="46" textAnchor="middle" fill={txt(0)} fontSize="11" fontFamily="var(--mono)">
          A = 1
        </text>
        <path d="M90 130 V170" stroke={col(0)} strokeWidth="2" />
        <text x="96" y="154" fill={txt(0)} fontSize="11" fontFamily="var(--mono)">
          {`${t(L.expect)} H`}
        </text>

        {/* Timing */}
        <rect x="160" y="96" width="130" height="56" rx="8" fill="var(--fig-box)" stroke={step === 1 || step === 5 ? hot : step > 1 ? done : idle} strokeWidth="1.5" />
        <text x="225" y="114" textAnchor="middle" fill="var(--text)" fontSize="12">
          Timing
        </text>
        <text x="225" y="131" textAnchor="middle" fill="var(--text-2)" fontSize="10" fontFamily="var(--mono)">
          {`T = ${TM.period} ns`}
        </text>
        <text x="225" y="145" textAnchor="middle" fill="var(--text-2)" fontSize="10" fontFamily="var(--mono)">
          {`↑${TM.drive} ns · S ${TM.strobe} ns`}
        </text>
        <path d="M230 96 V72 H296" fill="none" stroke={col(1)} strokeWidth="2" />
        <path d="M290 67 L298 72 L290 77" fill="none" stroke={col(1)} strokeWidth="2" />
        <path d="M262 152 V188" stroke={col(5)} strokeWidth="2" strokeDasharray={step >= 5 ? undefined : '4 3'} />
        <path d="M257 182 L262 190 L267 182" fill="none" stroke={col(5)} strokeWidth="2" />

        {/* Level */}
        <rect x="310" y="96" width="150" height="56" rx="8" fill="var(--fig-box)" stroke={step === 2 || step === 4 ? hot : step > 2 ? done : idle} strokeWidth="1.5" />
        <text x="400" y="114" textAnchor="middle" fill="var(--text)" fontSize="12">
          Level
        </text>
        <text x="400" y="131" textAnchor="middle" fill="var(--text-2)" fontSize="10" fontFamily="var(--mono)">
          {`VIH ${LV.vih.toFixed(1)} · VIL ${LV.vil.toFixed(1)}`}
        </text>
        <text x="400" y="145" textAnchor="middle" fill="var(--text-2)" fontSize="10" fontFamily="var(--mono)">
          {`VOH ${LV.voh.toFixed(1)} · VOL ${LV.vol.toFixed(1)}`}
        </text>
        <path d="M335 96 V70" stroke={col(2)} strokeWidth="2" />
        <path d="M330 76 L335 68 L340 76" fill="none" stroke={col(2)} strokeWidth="2" />
        <path d="M335 152 V182" stroke={col(4)} strokeWidth="2" />
        <path d="M330 176 L335 184 L340 176" fill="none" stroke={col(4)} strokeWidth="2" />

        {/* Driver */}
        <path d="M300 36 L300 84 L350 60 Z" fill="var(--fig-box-2)" stroke={col(2)} strokeWidth="2" />
        <text x="326" y="28" textAnchor="middle" fill="var(--text-2)" fontSize="11">
          {t(L.driver)}
        </text>
        <path d="M350 60 H488" stroke={col(3)} strokeWidth="2.5" />
        <text x="420" y="52" textAnchor="middle" fill="var(--muted)" fontSize="10">
          {t(L.path)}
        </text>
        {step >= 3 ? (
          <text x="420" y="76" textAnchor="middle" fill={col(3)} fontSize="11" fontFamily="var(--mono)">
            {`${LV.vih.toFixed(1)} V`}
          </text>
        ) : null}

        {/* Comparator + 采样开关 */}
        <path d="M350 176 L350 216 L300 196 Z" fill="var(--fig-box-2)" stroke={col(4)} strokeWidth="2" />
        <text x="326" y="232" textAnchor="middle" fill="var(--text-2)" fontSize="11">
          {t(L.comparator)}
        </text>
        <path d="M488 196 H350" stroke={col(4)} strokeWidth="2.5" />
        {step >= 4 ? (
          <text x="420" y="212" textAnchor="middle" fill={col(4)} fontSize="11" fontFamily="var(--mono)">
            {`${yOut.toFixed(1)} V`}
          </text>
        ) : null}
        <path d="M300 196 H272 M252 196 H140" stroke={col(5)} strokeWidth="2" />
        <circle cx="272" cy="196" r="2.5" fill={col(5)} />
        <circle cx="252" cy="196" r="2.5" fill={col(5)} />
        <line x1="252" y1="196" x2={step >= 5 ? 272 : 268} y2={step >= 5 ? 196 : 184} stroke={col(5)} strokeWidth="2" />
        {step >= 5 ? (
          <text x="230" y="214" textAnchor="middle" fill={hot} fontSize="13" fontFamily="var(--mono)">
            {readH ? 'H' : 'L'}
          </text>
        ) : null}

        {/* 比较结果 */}
        <rect
          x="20"
          y="170"
          width="120"
          height="58"
          rx="8"
          fill={step >= 6 ? (pass ? 'var(--green-bg)' : 'var(--red-bg)') : 'var(--fig-box)'}
          stroke={step >= 6 ? (pass ? 'var(--green)' : 'var(--red)') : col(6)}
          strokeWidth={step >= 6 ? 2 : 1.2}
        />
        <g fontSize="11" fontFamily="var(--mono)">
          <text x="80" y="188" textAnchor="middle" fill="var(--text-2)">
            {`${t(L.expect)} H`}
          </text>
          <text x="80" y="204" textAnchor="middle" fill={step >= 5 ? 'var(--text)' : 'var(--dim)'}>
            {`${t(L.read)} ${step >= 5 ? (readH ? 'H' : 'L') : '–'}`}
          </text>
          {step >= 6 ? (
            <text x="80" y="221" textAnchor="middle" fill={pass ? 'var(--green)' : 'var(--red)'} fontSize="13">
              {pass ? 'PASS' : 'FAIL'}
            </text>
          ) : null}
        </g>

        {/* DUT */}
        <rect x="506" y="28" width="120" height="196" rx="10" fill="var(--fig-box)" stroke="var(--line-2)" strokeWidth="1.5" />
        <text x="600" y="46" textAnchor="middle" fill="var(--text)" fontSize="13">
          DUT
        </text>
        <circle cx="494" cy="60" r="6" fill="var(--card)" stroke={col(3)} strokeWidth="2" />
        <text x="494" y="44" textAnchor="middle" fill="var(--sky)" fontSize="12" fontFamily="var(--mono)">
          A
        </text>
        <circle cx="494" cy="196" r="6" fill="var(--card)" stroke={col(4)} strokeWidth="2" />
        <text x="494" y="222" textAnchor="middle" fill="var(--gold)" fontSize="12" fontFamily="var(--mono)">
          Y
        </text>
        <path d="M500 60 H566 V104" fill="none" stroke={step >= 3 ? col(3) : idle} strokeWidth="2" />
        <path d="M552 104 L580 104 L566 128 Z" fill="var(--fig-box-2)" stroke={step >= 4 ? col(4) : idle} strokeWidth="2" />
        <path d="M566 128 V196 H500" fill="none" stroke={dut === 'stuck' ? 'var(--red)' : step >= 4 ? col(4) : idle} strokeWidth="2" />
        {dut === 'stuck' ? (
          <text x="574" y="168" fill="var(--red)" fontSize="11">
            {t(L.stuck)}
          </text>
        ) : null}

        {/* PE 点选框 */}
        <rect
          x={FOCUS_BOX[focus][0]}
          y={FOCUS_BOX[focus][1]}
          width={FOCUS_BOX[focus][2]}
          height={FOCUS_BOX[focus][3]}
          rx="10"
          fill="none"
          stroke="var(--purple)"
          strokeWidth="2"
          strokeDasharray="5 4"
        />

        {/* 波形 */}
        <line x1={xt(0)} y1="356" x2={xt(TM.period)} y2="356" stroke="var(--line-2)" />
        {[0, TM.drive, TM.drive + TM.tpd, TM.strobe, TM.period].map((v) => (
          <g key={v}>
            <line x1={xt(v)} y1="356" x2={xt(v)} y2="360" stroke="var(--line-3)" />
            <text x={xt(v)} y="372" textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
              {`${v} ns`}
            </text>
          </g>
        ))}
        <text x="140" y={yA(1.5) + 4} textAnchor="end" fill="var(--sky)" fontSize="12" fontFamily="var(--mono)">
          A
        </text>
        <text x="140" y={yY(1.5) + 4} textAnchor="end" fill="var(--gold)" fontSize="12" fontFamily="var(--mono)">
          Y
        </text>
        <line x1={xt(0)} y1={yY(LV.voh)} x2={xt(TM.period)} y2={yY(LV.voh)} stroke="var(--line-3)" strokeDasharray="3 3" />
        <line x1={xt(0)} y1={yY(LV.vol)} x2={xt(TM.period)} y2={yY(LV.vol)} stroke="var(--line-3)" strokeDasharray="3 3" />
        <text x={xt(TM.period) + 6} y={yY(LV.voh) + 4} fill="var(--muted)" fontSize="9" fontFamily="var(--mono)">
          VOH
        </text>
        <text x={xt(TM.period) + 6} y={yY(LV.vol) + 4} fill="var(--muted)" fontSize="9" fontFamily="var(--mono)">
          VOL
        </text>
        <line x1={xt(TM.drive)} y1="256" x2={xt(TM.drive)} y2="352" stroke={step >= 1 ? col(1) : idle} strokeDasharray="4 3" />
        <path
          d={step >= 3 ? `M${xt(0)} ${yA(0)} H${xt(TM.drive)} V${yA(LV.vih)} H${xt(TM.period)}` : `M${xt(0)} ${yA(0)} H${xt(TM.period)}`}
          fill="none"
          stroke={step >= 3 ? 'var(--sky)' : idle}
          strokeWidth="2"
        />
        <path d={step >= 4 ? yPath : `M${xt(0)} ${yY(0)} H${xt(TM.period)}`} fill="none" stroke={step >= 4 ? 'var(--gold)' : idle} strokeWidth="2" />
        {step >= 5 ? (
          <g>
            <line x1={xt(TM.strobe)} y1="256" x2={xt(TM.strobe)} y2="352" stroke="var(--purple)" strokeWidth="1.5" />
            <text x={xt(TM.strobe)} y="252" textAnchor="middle" fill="var(--purple)" fontSize="11">
              Strobe
            </text>
            <circle cx={xt(TM.strobe)} cy={yY(yOut)} r="4" fill={readH ? 'var(--green)' : 'var(--red)'} />
          </g>
        ) : null}
      </svg>
      <figcaption>{t(L.cap)}</figcaption>
    </figure>
  )
}
