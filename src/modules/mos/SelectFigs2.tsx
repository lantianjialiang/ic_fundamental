import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { rdsAt, type Part } from './data/mosSelectParts'
import { T } from './SelectFigs'

const CAP = {
  cap: loc(
    '三个寄生电容画回器件符号上（示意）：NMOS 符号中间的箭头指向沟道，体二极管阳极在源极、阴极在漏极。',
    'The three parasitic capacitors drawn back onto the device symbol (illustrative): the arrow of the NMOS symbol points into the channel, and the body diode has its anode at the source and its cathode at the drain.',
  ),
  diode: loc('体二极管', 'Body diode'),
  anode: loc('阳极接 S', 'anode at S'),
  cathode: loc('阴极接 D', 'cathode at D'),
  ciss: loc('输入电容：驱动器要充的', 'input: what the driver charges'),
  coss: loc('输出电容：每次开关都充放电', 'output: charged each switch'),
  crss: loc('= Cgd，造成米勒平台', '= Cgd, causes the Miller plateau'),
  qg: loc('栅极总电荷：时间 = Qg ÷ 电流', 'gate charge: time = Qg / current'),
}

const CARDS: Array<{ title: string; sub: keyof typeof CAP }> = [
  { title: 'Ciss = Cgs + Cgd', sub: 'ciss' },
  { title: 'Coss = Cds + Cgd', sub: 'coss' },
  { title: 'Crss = Cgd', sub: 'crss' },
  { title: 'Qg = ∫ Ig dt', sub: 'qg' },
]

function Cap({ x, y, vertical, label, lx, ly }: { x: number; y: number; vertical: boolean; label: string; lx: number; ly: number }) {
  return (
    <g>
      <g stroke="var(--blue)" strokeWidth="3" strokeLinecap="round">
        {vertical ? <path d={`M${x - 12} ${y} H${x + 12} M${x - 12} ${y + 10} H${x + 12}`} /> : <path d={`M${x} ${y - 12} V${y + 12} M${x + 8} ${y - 12} V${y + 12}`} />}
      </g>
      <T x={lx} y={ly} size={12} color="var(--blue)" mono>
        {label}
      </T>
    </g>
  )
}

export function CapFig() {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 252" className="term-fig__svg" role="img" aria-label={t(CAP.cap)}>
        <rect width="760" height="252" rx="10" fill="var(--well)" />
        <g stroke="var(--text-2)" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M60 130 H150" />
          <path d="M150 100 V160" strokeWidth="3" />
          <path d="M162 95 V112 M162 122 V138 M162 148 V165" strokeWidth="3" />
          <path d="M162 103 H260 V30" />
          <path d="M162 157 H260 V230" />
          <path d="M162 130 H210 V157" />
          <path d="M260 50 H450 M260 210 H450" />
          <path d="M330 50 V110 M330 142 V210" />
          <path d="M320 110 H340" strokeWidth="3" />
          <path d="M450 50 V112 M450 122 V210" />
          <path d="M90 130 V70 H104 M112 70 H260" />
          <path d="M90 130 V190 H104 M112 190 H260" />
        </g>
        <polygon points="174,125 162,130 174,135" fill="var(--text-2)" />
        <polygon points="320,142 340,142 330,112" fill="var(--text-2)" />
        <Cap x={450} y={112} vertical label="Cds" lx={468} ly={121} />
        <Cap x={104} y={70} vertical={false} label="Cgd" lx={108} ly={50} />
        <Cap x={104} y={190} vertical={false} label="Cgs" lx={108} ly={222} />
        {[[90, 130], [260, 70], [260, 190], [260, 50], [260, 210], [210, 157]].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" fill="var(--text)" />
        ))}
        <T x={50} y={134} anchor="end" size={12} color="var(--text)">
          G
        </T>
        <T x={270} y={34} anchor="start" size={12} color="var(--text)">
          D
        </T>
        <T x={270} y={236} anchor="start" size={12} color="var(--text)">
          S
        </T>
        <T x={346} y={170} anchor="start" size={10} color="var(--text-2)">
          {t(CAP.diode)}
        </T>
        <T x={346} y={184} anchor="start" size={10} color="var(--muted)">
          {t(CAP.anode)}
        </T>
        <T x={346} y={198} anchor="start" size={10} color="var(--muted)">
          {t(CAP.cathode)}
        </T>
        {CARDS.map((c, k) => {
          const y = 24 + k * 54
          return (
            <g key={c.title}>
              <rect x="516" y={y} width="224" height="48" rx="6" fill="var(--card)" stroke="var(--line)" />
              <T x={528} y={y + 20} anchor="start" size={13} color="var(--gold)" mono>
                {c.title}
              </T>
              <T x={528} y={y + 38} anchor="start" size={10.5} color="var(--text-2)">
                {t(CAP[c.sub])}
              </T>
            </g>
          )
        })}
      </svg>
      <figcaption>{t(CAP.cap)}</figcaption>
    </figure>
  )
}

const RDS = {
  cap: loc(
    'Rds(on) 只在手册标出的 Vgs 点上有保证（圆点）。没有圆点落在驱动电压以内，就没有保证，哪怕 Vgs(th) 看起来很低。',
    'Rds(on) is only guaranteed at the Vgs points the datasheet marks (dots). With no dot at or below the drive voltage there is no guarantee, even if Vgs(th) looks low.',
  ),
  axisX: loc('栅源电压 Vgs (V)', 'Gate-source voltage Vgs (V)'),
  axisY: loc('Rds(on) 最大值，25 °C', 'Rds(on) max, 25 °C'),
  vth: loc('Vgs(th) 最大', 'Vgs(th) max'),
  drive: loc('驱动', 'Drive'),
  none: loc('驱动电压以内没有 Rds(on) 数据', 'No Rds(on) data at or below the drive voltage'),
}

const X0 = 70
const X1 = 730
const Y0 = 200
const Y1 = 30
const VMAX = 12
const rx = (v: number) => X0 + (v / VMAX) * (X1 - X0)
const ry = (mohm: number) => Y0 - (Math.log10(mohm) / 4) * (Y0 - Y1)

export function RdsFig({ part, vdrive }: { part: Part; vdrive: number }) {
  const { t } = useLocale()
  const hit = rdsAt(part, vdrive)
  const vth = part.vth.max
  const driveLeft = vdrive < vth
  const note = hit.ok
    ? loc(`取 ${hit.spec.mohm} mΩ（Vgs = ${hit.spec.vgs} V）当保守值`, `Use ${hit.spec.mohm} mΩ (Vgs = ${hit.spec.vgs} V) as the conservative value`)
    : RDS.none
  const noteRight = rx(vdrive) < 400
  const noteX = noteRight ? Math.max(rx(vdrive), rx(vth)) + 8 : rx(vdrive) - 8
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 256" className="term-fig__svg" role="img" aria-label={t(RDS.cap)}>
        <rect width="760" height="256" rx="10" fill="var(--well)" />
        {[1, 10, 100, 1000, 10000].map((m) => (
          <g key={m}>
            <line x1={X0} y1={ry(m)} x2={X1} y2={ry(m)} stroke="var(--line-3)" strokeOpacity="0.6" />
            <T x={X0 - 8} y={ry(m) + 4} anchor="end" size={10} color="var(--dim)" mono>
              {m >= 1000 ? `${m / 1000} Ω` : `${m} mΩ`}
            </T>
          </g>
        ))}
        {[0, 2, 4, 6, 8, 10, 12].map((v) => (
          <T key={v} x={rx(v)} y={Y0 + 16} size={10} color="var(--dim)" mono>
            {`${v}`}
          </T>
        ))}
        <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="var(--line-2)" />
        <line x1={X0} y1={Y0} x2={X0} y2={Y1} stroke="var(--line-2)" />
        <rect x={X0} y={Y1} width={rx(vth) - X0} height={Y0 - Y1} fill="var(--red)" fillOpacity="0.1" />
        <line x1={rx(vth)} y1={Y1 - 4} x2={rx(vth)} y2={Y0} stroke="var(--red)" strokeDasharray="4 3" />
        <line x1={rx(vdrive)} y1={Y1 - 4} x2={rx(vdrive)} y2={Y0} stroke="var(--gold)" strokeWidth="2" />
        <T x={rx(vth) + (driveLeft ? 4 : -4)} y={22} anchor={driveLeft ? 'start' : 'end'} size={10} color="var(--red)">
          {`${t(RDS.vth)} ${vth} V`}
        </T>
        <T x={rx(vdrive) + (driveLeft ? -4 : 4)} y={22} anchor={driveLeft ? 'end' : 'start'} size={10} color="var(--gold)">
          {`${t(RDS.drive)} ${vdrive} V`}
        </T>
        {part.rds.map((s) => {
          const ok = s.vgs <= vdrive + 1e-9
          return (
            <g key={s.vgs}>
              <circle cx={rx(s.vgs)} cy={ry(s.mohm)} r="5" fill={ok ? 'var(--green)' : 'var(--dim)'} />
              <T x={rx(s.vgs)} y={ry(s.mohm) - 10} size={10} color={ok ? 'var(--green)' : 'var(--dim)'} mono>
                {`${s.mohm} mΩ`}
              </T>
            </g>
          )
        })}
        <T x={noteX} y={186} anchor={noteRight ? 'start' : 'end'} size={11} color={hit.ok ? 'var(--green)' : 'var(--red)'}>
          {t(note)}
        </T>
        <T x={X1} y={Y0 + 42} anchor="end" size={11} color="var(--muted)">
          {t(RDS.axisX)}
        </T>
        <text transform={`translate(14 ${(Y0 + Y1) / 2}) rotate(-90)`} textAnchor="middle" fill="var(--muted)" fontSize="10">
          {t(RDS.axisY)}
        </text>
      </svg>
      <figcaption>{t(RDS.cap)}</figcaption>
    </figure>
  )
}
