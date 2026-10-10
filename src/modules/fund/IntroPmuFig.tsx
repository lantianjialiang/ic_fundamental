import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { fmtOhm } from './parts'
import { KELVIN_V, type PmuMode, type PmuOut } from './data/intro'

export function fmtMa(ma: number) {
  if (Math.abs(ma) < 1) return `${(ma * 1000).toFixed(0)} µA`
  return `${ma.toFixed(ma >= 100 ? 0 : 1)} mA`
}

/* ---------- PMU 加压 / 加流 ---------- */

const PL = {
  dut: loc('DUT 管脚 = 负载 RL'),
  open: loc('开路'),
  clampOff: loc('钳位：关'),
  clampHit: loc('钳位生效'),
  danger: loc('危险！'),
  gnd: loc('地 / VSS'),
  pass: loc('Pass 区'),
  clamp: loc('钳位'),
  meas: loc('读数'),
  cap: loc('上半部分是 PMU 和负载；下面的数轴上，绿色是 Pass 区，金色是读数，红色虚线是钳位。'),
}

export function PmuFig({
  mode,
  force,
  r,
  out,
  clampOn,
  clamp,
  hiOn,
  hi,
  loOn,
  lo,
  fail,
}: {
  mode: PmuMode
  force: number
  r: number
  out: PmuOut
  clampOn: boolean
  clamp: number
  hiOn: boolean
  hi: number
  loOn: boolean
  lo: number
  fail: boolean
}) {
  const { t } = useLocale()
  const fv = mode === 'fvmi'
  const open = !Number.isFinite(r)
  const danger = out.hw || (!clampOn && (fv ? out.i > 100 : out.v > 10))
  const wireStroke = danger ? 'var(--red)' : out.clamped ? 'var(--red-2)' : 'var(--gold)'
  const meas = fv ? out.i : out.v
  const unit = fv ? 'mA' : 'V'
  const fmtM = (x: number) => (fv ? fmtMa(x) : `${x.toFixed(2)} V`)

  // 数轴
  const vals = [hiOn ? hi : 0, clampOn ? clamp : 0, loOn ? lo : 0, meas, fv ? 1 : 0.5]
  const axisMax = Math.max(...vals) * 1.15
  const ax = (v: number) => 40 + (Math.min(v, axisMax) / axisMax) * 600
  const passL = ax(loOn ? lo : 0)
  const passR = ax(hiOn ? hi : axisMax)
  const mx = ax(meas)

  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 330" className="term-fig__svg" role="img" aria-label={t(PL.cap)}>
        <rect width="680" height="330" rx="10" fill="var(--well)" />
        {/* PMU */}
        <rect x="20" y="30" width="230" height="180" rx="10" fill="var(--blue-bg)" stroke="var(--blue)" />
        <text x="36" y="52" fill="var(--text)" fontSize="14">
          PMU
        </text>
        <text x="36" y="196" fill="var(--text-2)" fontSize="12" fontFamily="var(--mono)">
          {fv ? `Force ${force.toFixed(2)} V · Measure I` : `Force ${force.toFixed(1)} mA · Measure V`}
        </text>
        <circle cx="80" cy="125" r="28" fill="var(--card)" stroke="var(--text-2)" strokeWidth="2" />
        {fv ? (
          <>
            <text x="80" y="118" textAnchor="middle" fill="var(--text)" fontSize="14">
              +
            </text>
            <text x="80" y="144" textAnchor="middle" fill="var(--text)" fontSize="16">
              −
            </text>
          </>
        ) : (
          <path d="M80 145 V106 M72 114 L80 104 L88 114" fill="none" stroke="var(--text)" strokeWidth="2" />
        )}
        {/* 钳位 */}
        <path d="M187 70 V95" stroke="var(--line-2)" strokeWidth="1.5" />
        <rect
          x="140"
          y="95"
          width="96"
          height="60"
          rx="6"
          fill={out.clamped ? 'var(--red-bg)' : 'var(--fig-box)'}
          stroke={out.clamped ? 'var(--red)' : 'var(--line)'}
          strokeWidth={out.clamped ? 2 : 1}
        />
        <text x="188" y="117" textAnchor="middle" fill={out.clamped ? 'var(--red)' : 'var(--text-2)'} fontSize="12" fontFamily="var(--mono)">
          CLAMP
        </text>
        <text x="188" y="137" textAnchor="middle" fill="var(--text)" fontSize="12" fontFamily="var(--mono)">
          {clampOn ? (fv ? `I ≤ ${clamp} mA` : `V ≤ ${clamp} V`) : t(PL.clampOff)}
        </text>
        {out.clamped ? (
          <text x="188" y="150" textAnchor="middle" fill="var(--red)" fontSize="10">
            {t(PL.clampHit)}
          </text>
        ) : null}
        {/* 导线 */}
        <path d="M80 97 V70 H520 V105" fill="none" stroke={wireStroke} strokeWidth="3" />
        <path d="M80 153 V240 H520 V195" fill="none" stroke={wireStroke} strokeWidth="3" />
        <text x="300" y="256" textAnchor="middle" fill="var(--muted)" fontSize="11">
          {t(PL.gnd)}
        </text>
        <text x="380" y="60" textAnchor="middle" fill={danger ? 'var(--red)' : 'var(--gold)'} fontSize="13" fontFamily="var(--mono)">
          {`I = ${fmtMa(out.i)} →`}
        </text>
        {danger ? (
          <text x="380" y="100" textAnchor="middle" fill="var(--red)" fontSize="16">
            {t(PL.danger)}
          </text>
        ) : null}
        {/* DUT */}
        <rect x="450" y="40" width="200" height="220" rx="10" fill="none" stroke="var(--line)" strokeDasharray="6 5" />
        <text x="640" y="58" textAnchor="end" fill="var(--muted)" fontSize="11">
          {t(PL.dut)}
        </text>
        <path
          d="M520 105 l12 6 l-24 12 l24 12 l-24 12 l24 12 l-24 12 l12 6 V195"
          fill="none"
          stroke={open ? 'var(--line-2)' : 'var(--text)'}
          strokeWidth="2"
        />
        {open ? (
          <>
            <rect x="510" y="76" width="20" height="24" fill="var(--well)" />
            <text x="520" y="95" textAnchor="middle" fill="var(--red)" fontSize="18">
              ✕
            </text>
          </>
        ) : null}
        <text x="546" y="140" fill="var(--text)" fontSize="13" fontFamily="var(--mono)">
          {open ? `RL = ${t(PL.open)}` : `RL = ${fmtOhm(r)}`}
        </text>
        <text x="546" y="162" fill="var(--gold)" fontSize="13" fontFamily="var(--mono)">
          {`V = ${out.v.toFixed(2)} V`}
        </text>

        {/* 数轴：极限、钳位、读数 */}
        <rect x="40" y="282" width="600" height="18" fill="var(--red-bg)" />
        <rect x={passL} y="282" width={Math.max(0, passR - passL)} height="18" fill="var(--green-bg)" stroke="var(--green-line)" />
        <text x={(passL + passR) / 2} y="295" textAnchor="middle" fill="var(--green)" fontSize="10">
          {t(PL.pass)}
        </text>
        {hiOn ? (
          <text x={ax(hi)} y="314" textAnchor="middle" fill="var(--text-2)" fontSize="10" fontFamily="var(--mono)">
            {`FGT ${hi} ${unit}`}
          </text>
        ) : null}
        {loOn ? (
          <text x={ax(lo)} y="314" textAnchor="middle" fill="var(--text-2)" fontSize="10" fontFamily="var(--mono)">
            {`FLT ${lo} ${unit}`}
          </text>
        ) : null}
        {clampOn ? (
          <>
            <line x1={ax(clamp)} y1="276" x2={ax(clamp)} y2="306" stroke="var(--red)" strokeWidth="2" strokeDasharray="4 3" />
            <text x={ax(clamp)} y="326" textAnchor="middle" fill="var(--red)" fontSize="10">
              {`${t(PL.clamp)} ${clamp} ${unit}`}
            </text>
          </>
        ) : null}
        <path d={`M${mx} 280 L${mx - 6} 268 L${mx + 6} 268 Z`} fill={fail ? 'var(--red)' : 'var(--gold)'} />
        <text x={mx} y="264" textAnchor="middle" fill={fail ? 'var(--red)' : 'var(--gold)'} fontSize="11" fontFamily="var(--mono)">
          {`${t(PL.meas)} ${fmtM(meas)}`}
        </text>
      </svg>
      <figcaption>{t(PL.cap)}</figcaption>
    </figure>
  )
}

/* ---------- Kelvin 四线制 ---------- */

const KL = {
  wire: loc('导线电阻'),
  out: loc('PMU 输出'),
  dut: loc('DUT 上'),
  kelvin: loc('Kelvin 连接点'),
  local: loc('Sense 接在 PMU 出口'),
  cap2: loc('两线制：Sense 在 PMU 内部就接到 Force 上，导线压降没人管。'),
  cap4: loc('四线制：Sense 线一直拉到 DUT，在 Kelvin 连接点和 Force 线汇合。'),
}

export function KelvinFig({ four, rw, iMa, vOut, vDut }: { four: boolean; rw: number; iMa: number; vOut: number; vDut: number }) {
  const { t } = useLocale()
  const drop = (iMa / 1000) * rw
  const zig = 'l6 -7 l12 14 l12 -14 l12 14 l12 -14 l12 14 l6 -7'
  const kx = four ? 556 : 206
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 260" className="term-fig__svg" role="img" aria-label={t(four ? KL.cap4 : KL.cap2)}>
        <rect width="680" height="260" rx="10" fill="var(--well)" />
        <rect x="20" y="40" width="170" height="170" rx="10" fill="var(--blue-bg)" stroke="var(--blue)" />
        <text x="105" y="128" textAnchor="middle" fill="var(--text)" fontSize="14">
          PMU
        </text>
        <text x="105" y="148" textAnchor="middle" fill="var(--gold)" fontSize="12" fontFamily="var(--mono)">
          {`${t(KL.out)} ${vOut.toFixed(3)} V`}
        </text>
        {['Force+', 'Sense+', 'Sense−', 'Force−'].map((s, i) => (
          <text key={s} x="182" y={[74, 109, 154, 189][i]} textAnchor="end" fill="var(--muted)" fontSize="10" fontFamily="var(--mono)">
            {s}
          </text>
        ))}
        {/* Force 线 */}
        <path d={`M190 70 H330 ${zig} H600 V100`} fill="none" stroke="var(--gold)" strokeWidth="2.5" />
        <path d={`M190 185 H330 ${zig} H600 V160`} fill="none" stroke="var(--gold)" strokeWidth="2.5" />
        <text x="366" y="56" textAnchor="middle" fill="var(--muted)" fontSize="11">
          {`${t(KL.wire)} ${rw.toFixed(1)} Ω`}
        </text>
        <text x="366" y="212" textAnchor="middle" fill="var(--muted)" fontSize="11">
          {`${t(KL.wire)} ${rw.toFixed(1)} Ω`}
        </text>
        <text x="366" y="92" textAnchor="middle" fill="var(--red)" fontSize="11" fontFamily="var(--mono)">
          {`−${drop.toFixed(3)} V`}
        </text>
        <text x="366" y="172" textAnchor="middle" fill="var(--red)" fontSize="11" fontFamily="var(--mono)">
          {`−${drop.toFixed(3)} V`}
        </text>
        {/* Sense 线 */}
        {four ? (
          <>
            <path d="M190 105 H556 V70" fill="none" stroke="var(--sky)" strokeWidth="1.5" strokeDasharray="5 4" />
            <path d="M190 150 H556 V185" fill="none" stroke="var(--sky)" strokeWidth="1.5" strokeDasharray="5 4" />
          </>
        ) : (
          <>
            <path d="M190 105 H206 V70" fill="none" stroke="var(--sky)" strokeWidth="1.5" strokeDasharray="4 3" />
            <path d="M190 150 H206 V185" fill="none" stroke="var(--sky)" strokeWidth="1.5" strokeDasharray="4 3" />
          </>
        )}
        <circle cx={kx} cy="70" r="5" fill="var(--sky)" />
        <circle cx={kx} cy="185" r="5" fill="var(--sky)" />
        <text x={kx} y={four ? 240 : 236} textAnchor="middle" fill="var(--sky)" fontSize="11">
          {t(four ? KL.kelvin : KL.local)}
        </text>
        <path d={`M${kx} 191 V226`} stroke="var(--sky)" strokeOpacity="0.5" />
        {/* DUT */}
        <rect x="530" y="30" width="130" height="200" rx="10" fill="none" stroke="var(--line)" strokeDasharray="6 5" />
        <text x="650" y="48" textAnchor="end" fill="var(--muted)" fontSize="11">
          DUT
        </text>
        <path d="M600 100 l10 5 l-20 10 l20 10 l-20 10 l20 10 l-10 5 V160" fill="none" stroke="var(--text)" strokeWidth="2" />
        <text x="618" y="134" fill={Math.abs(vDut - KELVIN_V) > 0.005 ? 'var(--red)' : 'var(--green)'} fontSize="12" fontFamily="var(--mono)">
          {`${vDut.toFixed(3)} V`}
        </text>
        <text x="618" y="118" fill="var(--muted)" fontSize="10">
          {t(KL.dut)}
        </text>
      </svg>
      <figcaption>{t(four ? KL.cap4 : KL.cap2)}</figcaption>
    </figure>
  )
}

/* ---------- 量程切换毛刺 ---------- */

const RL = {
  dut: loc('DUT 管脚上的电压'),
  spike: loc('换量程的毛刺'),
}

export function RangeFig({ volt, glitch }: { volt: number; glitch: boolean }) {
  const { t } = useLocale()
  const y = 80 - (volt / 10) * 50
  const d = glitch
    ? `M40 ${y} H330 L336 ${y - 50} L342 ${y + 30} L348 ${y - 15} L354 ${y} H640`
    : `M40 ${y} H640`
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 110" className="term-fig__svg" role="img" aria-label={t(RL.dut)}>
        <rect width="680" height="110" rx="10" fill="var(--well)" />
        <line x1="40" y1="80" x2="640" y2="80" stroke="var(--line)" />
        <path d={d} fill="none" stroke={glitch ? 'var(--red)' : 'var(--gold)'} strokeWidth="2" />
        <text x="40" y="100" fill="var(--muted)" fontSize="11">
          {t(RL.dut)}
        </text>
        {glitch ? (
          <text x="362" y={Math.max(14, y - 34)} fill="var(--red)" fontSize="12">
            {t(RL.spike)}
          </text>
        ) : null}
      </svg>
    </figure>
  )
}
