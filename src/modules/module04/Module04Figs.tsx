import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import {
  CLAMP,
  FORCE_UA,
  OPEN_LIMIT,
  SHORT_LIMIT,
  SIDES,
  VMAX,
  judge,
  zoneOf,
  type Fault,
  type PinSide,
  type PmuMode,
} from './data/content'

const L = {
  logic: loc('逻辑', 'Logic'),
  volt: loc('电压', 'Voltage'),
  levelCap: loc(
    '同一个电压，两种看法。上：数字测试只有三种结果——0、1、或落在两条门限之间的不确定区。下：PMU 读到的是一个连续的数。',
    'One voltage, two views. Top: digital test has only three outcomes — 0, 1, or the uncertain zone between the two thresholds. Bottom: the PMU reads a continuous number.',
  ),
  pmu: loc('PMU', 'PMU'),
  dutLoad: loc('管脚内部 = 一个负载', 'Inside the pin = a load'),
  force: loc('Force', 'Force'),
  measure: loc('Measure', 'Measure'),
  modeCap: loc(
    '金色是 PMU 施加的量，蓝色是它测量的量。FVMI：电压源 + 串联电流表；FIMV：电流源 + 并联电压表。',
    'Gold is what the PMU forces, blue is what it measures. FVMI: a voltage source with a series ammeter. FIMV: a current source with a parallel voltmeter.',
  ),
  pin: loc('被测脚', 'Pin under test'),
  core: loc('内部电路', 'Internal circuit'),
  shortTo: loc('短路 → 0 V', 'Short → 0 V'),
  clampHit: loc('撞到钳位', 'Hit the clamp'),
  zOpen: loc('开路', 'Open'),
  zShort: loc('短路', 'Short'),
  opensCap: loc(
    '流动的金色虚线是电流路径（PMU 抽出 100 µA）。下方数轴是判定窗口，三角是这次的读数。',
    'The moving gold dashes show the current path (the PMU pulls out 100 µA). The number line below is the verdict window; the triangle is this reading.',
  ),
}

/* ---------------- 逻辑 0/1 vs 真实电压 ---------------- */

export function LevelFig({ side, volts }: { side: PinSide; volts: number }) {
  const { t } = useLocale()
  const s = SIDES[side]
  const x = (v: number) => 90 + (v / VMAX) * 440
  const zone = zoneOf(side, volts)
  const sym = zone === 'lo' ? s.sym[0] : zone === 'hi' ? s.sym[1] : 'X'
  const symColor = zone === 'mid' ? 'var(--red)' : 'var(--green)'
  const ticks = [0, 0.5, 1, 1.5, 2, 2.5, 3]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 200" className="term-fig__svg" role="img" aria-label={t(L.levelCap)}>
        <rect width="680" height="200" rx="10" fill="var(--well)" />
        <text x="78" y="66" textAnchor="end" fill="var(--text-2)" fontSize="12">
          {t(L.logic)}
        </text>
        <rect x={x(0)} y="42" width={x(s.lo) - x(0)} height="38" fill="var(--blue-bg-2)" />
        <rect x={x(s.lo)} y="42" width={x(s.hi) - x(s.lo)} height="38" fill="var(--red-bg)" />
        <rect x={x(s.hi)} y="42" width={x(VMAX) - x(s.hi)} height="38" fill="var(--green-bg)" />
        <rect x={x(0)} y="42" width={x(VMAX) - x(0)} height="38" fill="none" stroke="var(--line-2)" />
        <g fontFamily="var(--mono)" fontSize="16" textAnchor="middle">
          <text x={(x(0) + x(s.lo)) / 2} y="67" fill="var(--blue)">
            {s.sym[0]}
          </text>
          <text x={(x(s.lo) + x(s.hi)) / 2} y="67" fill="var(--red)">
            X
          </text>
          <text x={(x(s.hi) + x(VMAX)) / 2} y="67" fill="var(--green)">
            {s.sym[1]}
          </text>
        </g>

        <text x="78" y="134" textAnchor="end" fill="var(--text-2)" fontSize="12">
          {t(L.volt)}
        </text>
        <line x1={x(0)} y1="130" x2={x(VMAX)} y2="130" stroke="var(--line-3)" strokeWidth="2" />
        {ticks.map((v) => (
          <g key={v}>
            <line x1={x(v)} y1="124" x2={x(v)} y2="136" stroke="var(--line-3)" />
            <text x={x(v)} y="152" textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
              {v.toFixed(1)}
            </text>
          </g>
        ))}

        {[
          { v: s.lo, name: s.loName },
          { v: s.hi, name: s.hiName },
        ].map((th) => (
          <g key={th.name}>
            <line x1={x(th.v)} y1="30" x2={x(th.v)} y2="140" stroke="var(--text-2)" strokeDasharray="4 3" />
            <text x={x(th.v)} y="24" textAnchor="middle" fill="var(--sky)" fontSize="11" fontFamily="var(--mono)">
              {`${th.name} ${th.v.toFixed(1)} V`}
            </text>
          </g>
        ))}

        <line x1={x(volts)} y1="38" x2={x(volts)} y2="130" stroke="var(--gold)" strokeWidth="2.5" />
        <path d={`M${x(volts) - 6} 34 L${x(volts) + 6} 34 L${x(volts)} 42 Z`} fill="var(--gold)" />
        <circle cx={x(volts)} cy="130" r="5" fill="var(--gold)" />

        <rect x="556" y="42" width="110" height="38" rx="6" fill="var(--fig-box)" stroke={symColor} />
        <text x="611" y="68" textAnchor="middle" fill={symColor} fontSize="20" fontFamily="var(--mono)">
          {sym}
        </text>
        <rect x="556" y="112" width="110" height="38" rx="6" fill="var(--fig-box)" stroke="var(--gold)" />
        <text x="611" y="137" textAnchor="middle" fill="var(--gold)" fontSize="16" fontFamily="var(--mono)">
          {`${volts.toFixed(2)} V`}
        </text>
        <text x="611" y="182" textAnchor="middle" fill="var(--muted)" fontSize="10">
          {`0 – ${VMAX} V`}
        </text>
      </svg>
      <figcaption>{t(L.levelCap)}</figcaption>
    </figure>
  )
}

/* ---------------- PMU 的两种方式 ---------------- */

function Ground({ x, y, color = 'var(--line-3)' }: { x: number; y: number; color?: string }) {
  return <path d={`M${x - 10} ${y} H${x + 10} M${x - 6} ${y + 4} H${x + 6} M${x - 2} ${y + 8} H${x + 2}`} stroke={color} strokeWidth="1.5" />
}

export function PmuModeFig({ mode }: { mode: PmuMode }) {
  const { t } = useLocale()
  const fv = mode === 'fvmi'
  const gold = 'var(--gold)'
  const blue = 'var(--sky)'
  // 标签统一放在各自元件正下方（接地符号之下），源在 x=90、表在 x=250：
  // 最长的 “Force 100 µA” 约 87 px（47–133），“Measure V” 约 65 px（217–283），中间留 80 px 以上
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 200" className="term-fig__svg" role="img" aria-label={t(L.modeCap)}>
        <rect width="680" height="200" rx="10" fill="var(--well)" />
        <rect x="20" y="16" width="300" height="170" rx="10" fill="none" stroke="var(--blue)" strokeDasharray="6 5" />
        <text x="32" y="34" fill="var(--blue)" fontSize="12">
          {t(L.pmu)}
        </text>
        {/* 源 */}
        <path d="M90 77 V50 H380" fill="none" stroke="var(--text-2)" strokeWidth="2" />
        <path d="M90 123 V140" stroke="var(--text-2)" strokeWidth="2" />
        <Ground x={90} y={140} />
        <circle cx="90" cy="100" r="23" fill="var(--fig-box)" stroke={gold} strokeWidth="2" />
        {fv ? (
          <g fill={gold} fontSize="16" textAnchor="middle" fontFamily="var(--mono)">
            <text x="90" y="96">
              +
            </text>
            <text x="90" y="116">
              −
            </text>
          </g>
        ) : (
          <path d="M90 113 V87 M84 94 L90 86 L96 94" fill="none" stroke={gold} strokeWidth="2" />
        )}
        <text x="90" y="172" textAnchor="middle" fill={gold} fontSize="12" fontFamily="var(--mono)">
          {fv ? `${t(L.force)} 3.3 V` : `${t(L.force)} 100 µA`}
        </text>
        {/* 表 */}
        {fv ? (
          <g>
            <circle cx="250" cy="50" r="16" fill="var(--fig-box)" stroke={blue} strokeWidth="2" />
            <text x="250" y="55" textAnchor="middle" fill={blue} fontSize="14" fontFamily="var(--mono)">
              A
            </text>
            <text x="250" y="88" textAnchor="middle" fill={blue} fontSize="12" fontFamily="var(--mono)">
              {`${t(L.measure)} I`}
            </text>
          </g>
        ) : (
          <g>
            <path d="M250 50 V84 M250 116 V140" stroke="var(--text-2)" strokeWidth="2" />
            <circle cx="250" cy="50" r="3.5" fill="var(--text-2)" />
            <Ground x={250} y={140} />
            <circle cx="250" cy="100" r="16" fill="var(--fig-box)" stroke={blue} strokeWidth="2" />
            <text x="250" y="105" textAnchor="middle" fill={blue} fontSize="14" fontFamily="var(--mono)">
              V
            </text>
            <text x="250" y="172" textAnchor="middle" fill={blue} fontSize="12" fontFamily="var(--mono)">
              {`${t(L.measure)} V`}
            </text>
          </g>
        )}
        {/* DUT */}
        <rect x="380" y="16" width="280" height="170" rx="10" fill="var(--fig-box)" stroke="var(--line-2)" />
        <text x="648" y="34" textAnchor="end" fill="var(--text)" fontSize="13">
          DUT
        </text>
        <circle cx="380" cy="50" r="6" fill="var(--card)" stroke="var(--text)" strokeWidth="2" />
        <path d="M386 50 H460 V80" fill="none" stroke="var(--text-2)" strokeWidth="2" />
        <path d="M460 80 l8 4 l-16 8 l16 8 l-16 8 l16 8 l-8 4 V140" fill="none" stroke="var(--text-2)" strokeWidth="2" />
        <Ground x={460} y={140} />
        <text x="486" y="105" fill="var(--muted)" fontSize="12">
          {t(L.dutLoad)}
        </text>
      </svg>
      <figcaption>{t(L.modeCap)}</figcaption>
    </figure>
  )
}

/* ---------------- 开短路小实验 ---------------- */

export function OpensMiniFig({ fault, volt }: { fault: Fault; volt: number }) {
  const { t } = useLocale()
  const hot = 'var(--gold)'
  const wire = 'var(--muted)'
  const open = fault === 'open'
  const short = fault === 'short'
  const good = fault === 'good'
  const verdict = judge(volt)
  const nx = (v: number) => 70 + ((v + 3.5) / 4) * 560
  const flow = good ? 'M380 222 V200 M380 180 V135 H164' : short ? 'M290 222 V135 H164' : ''
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 320" className="term-fig__svg" role="img" aria-label={t(L.opensCap)}>
        <rect width="680" height="320" rx="10" fill="var(--well)" />
        {/* PMU */}
        <rect x="24" y="100" width="140" height="70" rx="8" fill="var(--blue-bg)" stroke="var(--blue)" />
        <text x="94" y="122" textAnchor="middle" fill="var(--text)" fontSize="13">
          {t(L.pmu)}
        </text>
        <text x="94" y="140" textAnchor="middle" fill="var(--text-2)" fontSize="11" fontFamily="var(--mono)">
          {`${FORCE_UA} µA · ±${CLAMP} V`}
        </text>
        <text x="94" y="160" textAnchor="middle" fill={hot} fontSize="14" fontFamily="var(--mono)">
          {`${volt.toFixed(3)} V`}
        </text>
        {open ? (
          <text x="94" y="190" textAnchor="middle" fill="var(--red)" fontSize="11">
            {t(L.clampHit)}
          </text>
        ) : null}
        {/* PMU → 管脚 */}
        <path d={open ? 'M164 135 H200 M226 135 H263' : 'M164 135 H263'} stroke={wire} strokeWidth="2.5" />
        {open ? (
          <text x="213" y="142" textAnchor="middle" fill="var(--red)" fontSize="20">
            ✕
          </text>
        ) : null}
        {/* 芯片 */}
        <rect x="250" y="20" width="410" height="230" rx="12" fill="none" stroke="var(--line)" strokeDasharray="6 5" />
        <text x="648" y="40" textAnchor="end" fill="var(--muted)" fontSize="12">
          DUT
        </text>
        <circle cx="270" cy="135" r="7" fill="var(--card)" stroke="var(--text)" />
        <text x="270" y="118" textAnchor="middle" fill="var(--muted)" fontSize="11">
          {t(L.pin)}
        </text>
        <path d="M277 135 H500 M380 135 V90 M380 135 V180" fill="none" stroke={wire} strokeWidth="2" />
        {/* 对 VDD 二极管：阳极在管脚侧 */}
        <path d="M368 90 L392 90 L380 72 Z" fill="var(--card)" stroke={wire} />
        <line x1="366" y1="70" x2="394" y2="70" stroke={wire} strokeWidth="2" />
        <line x1="380" y1="70" x2="380" y2="52" stroke={wire} strokeWidth="2" />
        <text x="380" y="44" textAnchor="middle" fill="var(--sky)" fontSize="12">
          VDD = 0 V
        </text>
        {/* 对地二极管：阳极在 VSS 侧 */}
        <path d="M368 200 L392 200 L380 182 Z" fill={good ? hot : 'var(--card)'} stroke={good ? hot : wire} />
        <line x1="366" y1="180" x2="394" y2="180" stroke={good ? hot : wire} strokeWidth="2" />
        <line x1="380" y1="200" x2="380" y2="222" stroke={wire} strokeWidth="2" />
        <text x="380" y="238" textAnchor="middle" fill="var(--sky)" fontSize="12">
          VSS = 0 V
        </text>
        <rect x="500" y="112" width="130" height="46" rx="8" fill="var(--card)" stroke="var(--line)" />
        <text x="565" y="140" textAnchor="middle" fill="var(--muted)" fontSize="12">
          {t(L.core)}
        </text>
        {short ? (
          <g>
            <path d="M290 135 V222" stroke="var(--red)" strokeWidth="2.5" />
            <Ground x={290} y={222} color="var(--red)" />
            {/* 标签夹在短路线与对地二极管之间（298–约 370，二极管从 366 起但在 y≤200） */}
            <text x="298" y="214" fill="var(--red)" fontSize="12">
              {t(L.shortTo)}
            </text>
          </g>
        ) : null}
        {flow ? <path d={flow} fill="none" stroke={hot} strokeWidth="3" strokeDasharray="8 6" className="m04-flow" /> : null}
        {good ? (
          <text x="400" y="196" fill={hot} fontSize="11" fontFamily="var(--mono)">
            ≈ 0.65 V
          </text>
        ) : null}

        {/* 判定数轴 */}
        <rect x={nx(-3.5)} y="262" width={nx(OPEN_LIMIT) - nx(-3.5)} height="22" fill="var(--red-bg)" />
        <rect x={nx(OPEN_LIMIT)} y="262" width={nx(SHORT_LIMIT) - nx(OPEN_LIMIT)} height="22" fill="var(--green-bg)" />
        <rect x={nx(SHORT_LIMIT)} y="262" width={nx(0.5) - nx(SHORT_LIMIT)} height="22" fill="var(--red-bg)" />
        <g fontSize="11" textAnchor="middle">
          <text x={(nx(-3.5) + nx(OPEN_LIMIT)) / 2} y="277" fill="var(--red)">
            {t(L.zOpen)}
          </text>
          <text x={(nx(OPEN_LIMIT) + nx(SHORT_LIMIT)) / 2} y="277" fill="var(--green)">
            PASS
          </text>
          <text x={(nx(SHORT_LIMIT) + nx(0.5)) / 2} y="277" fill="var(--red)">
            {t(L.zShort)}
          </text>
        </g>
        {[-3, OPEN_LIMIT, SHORT_LIMIT, 0].map((v) => (
          <text key={v} x={nx(v)} y="300" textAnchor="middle" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
            {v.toFixed(v === 0 || v === -3 ? 0 : 1)}
          </text>
        ))}
        <path
          d={`M${nx(volt) - 6} 256 L${nx(volt) + 6} 256 L${nx(volt)} 266 Z`}
          fill={verdict === 'pass' ? 'var(--green)' : 'var(--red)'}
        />
        <line x1={nx(volt)} y1="262" x2={nx(volt)} y2="284" stroke={verdict === 'pass' ? 'var(--green)' : 'var(--red)'} strokeWidth="2" />
      </svg>
      <figcaption>{t(L.opensCap)}</figcaption>
    </figure>
  )
}
