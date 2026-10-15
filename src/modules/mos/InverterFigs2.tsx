import { type ReactNode } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { Hit } from '../prep/common'
import { FL } from './data/mosInverterFig'
import { FIG, PARTS, type PartId } from './data/mosInverter'
import { KEY, Schematic, T, VTC } from './InverterFigs'
import { VDD } from './model'

/* ---------- 结构：电路符号 + 剖面示意 ---------- */

const XHITS: Partial<Record<PartId, { x: number; y: number; w: number; h: number }>> = {
  pmos: { x: 382, y: 226, w: 200, h: 108 },
  nmos: { x: 586, y: 226, w: 158, h: 150 },
  in: { x: 476, y: 140, w: 176, h: 28 },
  out: { x: 516, y: 170, w: 100, h: 28 },
}

// 掺杂区：p 型材料偏蓝，n 型偏绿；+ 表示重掺杂
function Doped({ x, w, kind }: { x: number; w: number; kind: 'n' | 'p' }) {
  const color = kind === 'n' ? 'var(--green)' : 'var(--blue)'
  return (
    <g>
      <rect x={x} y={250} width={w} height={16} fill={color} fillOpacity="0.55" stroke={color} />
      <T x={x + w / 2} y={262} size={9} color="var(--text)" bold>{`${kind}+`}</T>
    </g>
  )
}

function CrossSection({ active }: { active: PartId }) {
  const { t } = useLocale()
  const wire = { stroke: 'var(--text-2)', strokeWidth: 2, fill: 'none' }
  return (
    <g>
      <rect x="370" y="10" width="380" height="380" rx="8" fill="var(--card)" stroke="var(--line)" />
      <rect x="380" y="250" width="360" height="130" fill="var(--blue)" fillOpacity="0.12" stroke="var(--line-2)" />
      <rect x="388" y="250" width="190" height="80" fill="var(--green)" fillOpacity="0.2" stroke="var(--green)" strokeDasharray="4 3" />
      <Doped x={396} w={28} kind="n" />
      <Doped x={440} w={28} kind="p" />
      <Doped x={512} w={28} kind="p" />
      <Doped x={592} w={28} kind="n" />
      <Doped x={668} w={28} kind="n" />
      <Doped x={708} w={26} kind="p" />
      {[470, 624].map((x) => (
        <g key={x}>
          <rect x={x} y={245} width={40} height={5} fill="var(--gold)" />
          <rect x={x} y={231} width={40} height={14} fill="var(--dim)" />
        </g>
      ))}
      <g {...wire}>
        <path d="M410 250 V212 H454 V250" />
        <path d="M526 250 V190 H606 V250" />
        <path d="M682 250 V212 H721 V250" />
        <path d="M490 231 V160 H644 V231" />
      </g>
      <T x={432} y={202} size={11} color="var(--text)">VDD</T>
      <T x={566} y={180} size={11} color="var(--gold)" bold>OUT</T>
      <T x={702} y={202} size={11} color="var(--text)">GND</T>
      <T x={567} y={150} size={11} color="var(--text)" bold>IN</T>
      <T x={483} y={290} size={12} color="var(--text)" bold>PMOS</T>
      <T x={483} y={310} size={10}>{t(FL.nwell)}</T>
      <T x={664} y={290} size={12} color="var(--text)" bold>NMOS</T>
      <T x={640} y={356} size={10}>{t(FL.psub)}</T>
      {PARTS.map((p) => {
        const h = XHITS[p.id]
        return h ? (
          <rect key={p.id} x={h.x} y={h.y} width={h.w} height={h.h} rx="6" fill="none" stroke={active === p.id ? 'var(--gold)' : 'none'} strokeWidth="1.8" strokeDasharray="5 3" pointerEvents="none" />
        ) : null
      })}
    </g>
  )
}

export function StructFig({ active, onPick }: { active: PartId; onPick: (id: PartId) => void }) {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 400" className="term-fig__svg" role="img" aria-label={t(FL.structAria)}>
        <rect width="760" height="400" rx="10" fill="var(--well)" />
        <rect x="10" y="10" width="350" height="380" rx="8" fill="var(--card)" stroke="var(--line)" />
        <g transform="translate(10 10)">
          <Schematic active={active} onPick={onPick} />
        </g>
        <CrossSection active={active} />
        {PARTS.map((p) => {
          const h = XHITS[p.id]
          return h ? (
            <Hit key={p.id} label={t(p.title)} active={active === p.id} onPick={() => onPick(p.id)}>
              <rect x={h.x} y={h.y} width={h.w} height={h.h} rx="6" fill="transparent" />
            </Hit>
          ) : null
        })}
      </svg>
      <figcaption>{t(FL.structCap)}</figcaption>
    </figure>
  )
}

/* ---------- VTC 单位增益点 + 噪声容限 ---------- */

const NX0 = 56
const NX1 = 300
const NY0 = 225
const NY1 = 40
const nx = (v: number) => NX0 + (v / VDD) * (NX1 - NX0)
const ny = (v: number) => NY0 - (v / VDD) * (NY0 - NY1)

const f2 = (v: number) => v.toFixed(2)
const VTC_PATH = VTC.map((p, k) => `${k === 0 ? 'M' : 'L'}${nx(p.vin).toFixed(1)} ${ny(p.vout).toFixed(1)}`).join(' ')

function Bar({ x, from, to, color, label }: { x: number; from: number; to: number; color: string; label?: ReactNode }) {
  const top = ny(to)
  const h = ny(from) - top
  return (
    <g>
      <rect x={x} y={top} width={70} height={h} fill={color} fillOpacity="0.3" stroke={color} />
      {label ? <T x={x + 35} y={top + h / 2 + 4} size={10} color="var(--text)">{label}</T> : null}
    </g>
  )
}

export function NoiseFig({ send1, vr }: { send1: boolean; vr: number }) {
  const { t } = useLocale()
  const g = 'var(--green)'
  const clamp = (v: number) => Math.min(Math.max(v, 0), VDD)
  const level = send1 ? KEY.voh : KEY.vol
  const bracket = (lo: number, hi: number, name: string, value: number) => (
    <g>
      <path d={`M494 ${ny(lo)} H506 M500 ${ny(lo)} V${ny(hi)} M494 ${ny(hi)} H506`} stroke="var(--gold)" strokeWidth="1.8" fill="none" />
      <T x={512} y={(ny(lo) + ny(hi)) / 2 + 4} anchor="start" size={10} color="var(--gold)" mono>{`${name} ${f2(value)} V`}</T>
    </g>
  )
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 260" className="term-fig__svg" role="img" aria-label={t(FL.noiseAria)}>
        <rect width="760" height="260" rx="10" fill="var(--well)" />
        <rect x="10" y="10" width="320" height="240" rx="8" fill="var(--card)" stroke="var(--line)" />
        {[0, 1, 2, 3].map((v) => (
          <g key={v}>
            <line x1={NX0} y1={ny(v)} x2={NX1} y2={ny(v)} stroke="var(--line-3)" strokeOpacity="0.5" />
            <T x={NX0 - 8} y={ny(v) + 4} anchor="end" size={10} color="var(--dim)" mono>{`${v}`}</T>
            <T x={nx(v)} y={NY0 + 16} size={10} color="var(--dim)" mono>{`${v}`}</T>
          </g>
        ))}
        <path d={`M${NX0} ${NY0} H${NX1} M${NX0} ${NY0} V${NY1}`} stroke="var(--line-2)" fill="none" />
        <T x={NX0} y={NY1 - 12} anchor="start" size={11} color="var(--muted)">Vout (V)</T>
        <T x={NX1} y={NY0 + 32} anchor="end" size={11} color="var(--muted)">Vin (V)</T>
        <line x1={nx(0)} y1={ny(0)} x2={nx(VDD)} y2={ny(VDD)} stroke="var(--muted)" strokeDasharray="5 4" />
        <path
          d={VTC_PATH}
          fill="none"
          stroke="var(--blue)"
          strokeWidth="2.4"
        />
        <g stroke="var(--gold)" strokeDasharray="2 3" fill="none">
          <path d={`M${NX0} ${ny(KEY.voh)} H${nx(KEY.vil)} V${NY0}`} />
          <path d={`M${nx(KEY.vih)} ${NY0} V${ny(KEY.vol)} H${NX1}`} />
        </g>
        <circle cx={nx(KEY.vm)} cy={ny(KEY.vm)} r="4.5" fill="var(--green)" />
        <circle cx={nx(KEY.vil)} cy={ny(KEY.voh)} r="4.5" fill="var(--gold)" />
        <circle cx={nx(KEY.vih)} cy={ny(KEY.vol)} r="4.5" fill="var(--gold)" />
        <T x={nx(KEY.vm) - 10} y={ny(KEY.vm) - 4} anchor="end" size={10} color="var(--green)" mono>{`VM ${f2(KEY.vm)} V`}</T>
        <T x={nx(KEY.vil) + 10} y={ny(KEY.voh) - 4} anchor="start" size={10} color="var(--gold)" mono>{`VIL ${f2(KEY.vil)} V`}</T>
        <T x={nx(KEY.vih) - 8} y={ny(KEY.vol) - 10} anchor="end" size={10} color="var(--gold)" mono>{`VIH ${f2(KEY.vih)} V`}</T>
        <T x={NX0 + 4} y={ny(KEY.voh) + 12} anchor="start" size={10} color="var(--gold)" mono>{`VOH ${f2(KEY.voh)} V`}</T>
        <T x={NX1 - 4} y={ny(KEY.vol) - 4} anchor="end" size={10} color="var(--gold)" mono>{`VOL ${f2(KEY.vol)} V`}</T>
        <T x={420} y={30} size={11} color="var(--muted)">{t(FIG.driver)}</T>
        <T x={630} y={30} size={11} color="var(--muted)">{t(FIG.receiver)}</T>
        <Bar x={385} from={0} to={KEY.vol} color={g} label="0" />
        <Bar x={385} from={KEY.voh} to={VDD} color={g} label="1" />
        <Bar x={595} from={0} to={KEY.vil} color={g} label={t(FL.read0)} />
        <Bar x={595} from={KEY.vil} to={KEY.vih} color="var(--red)" label={t(FIG.undef)} />
        <Bar x={595} from={KEY.vih} to={VDD} color={g} label={t(FL.read1)} />
        <g stroke="var(--line-3)" strokeDasharray="2 3">
          <line x1="455" y1={ny(KEY.vol)} x2="500" y2={ny(KEY.vol)} />
          <line x1="455" y1={ny(KEY.voh)} x2="500" y2={ny(KEY.voh)} />
          <line x1="500" y1={ny(KEY.vil)} x2="595" y2={ny(KEY.vil)} />
          <line x1="500" y1={ny(KEY.vih)} x2="595" y2={ny(KEY.vih)} />
        </g>
        {bracket(KEY.vol, KEY.vil, 'NML', KEY.nml)}
        {bracket(KEY.vih, KEY.voh, 'NMH', KEY.nmh)}
        <T x={379} y={ny(KEY.voh) + 4} anchor="end" size={10} color="var(--text-2)" mono>{`VOH ${f2(KEY.voh)}`}</T>
        <T x={379} y={ny(KEY.vol) + 4} anchor="end" size={10} color="var(--text-2)" mono>{`VOL ${f2(KEY.vol)}`}</T>
        <T x={671} y={ny(KEY.vih) + 4} anchor="start" size={10} color="var(--text-2)" mono>{`VIH ${f2(KEY.vih)}`}</T>
        <T x={671} y={ny(KEY.vil) + 4} anchor="start" size={10} color="var(--text-2)" mono>{`VIL ${f2(KEY.vil)}`}</T>
        <circle cx={420} cy={ny(level)} r="5" fill="var(--gold)" stroke="var(--card)" strokeWidth="1.5" />
        <circle cx={630} cy={ny(clamp(vr))} r="5" fill="var(--gold)" stroke="var(--card)" strokeWidth="1.5" />
      </svg>
      <figcaption>{t(FIG.noiseCap)}</figcaption>
    </figure>
  )
}

/* ---------- 动态功耗 P = C·V²·f ---------- */

/** C 单位 pF，f 单位 MHz，结果 W */
export const dynPower = (cPf: number, v: number, fMhz: number) => cPf * 1e-12 * v * v * fMhz * 1e6

export function fmtP(w: number) {
  if (w >= 1e-3) {
    return `${(w * 1e3).toFixed(2)} mW`
  }
  if (w >= 1e-6) {
    return `${(w * 1e6).toFixed(2)} µW`
  }
  return `${(w * 1e9).toFixed(2)} nW`
}

export function fmtE(j: number) {
  return j >= 1e-9 ? `${(j * 1e9).toFixed(2)} nJ` : `${(j * 1e12).toFixed(1)} pJ`
}

const gnd = (x: number, y: number) => `M${x - 12} ${y} H${x + 12} M${x - 8} ${y + 6} H${x + 8} M${x - 4} ${y + 12} H${x + 4}`

function Mini({ b, charge }: { b: number; charge: boolean }) {
  const { t } = useLocale()
  const pc = charge ? 'var(--green)' : 'var(--dim)'
  const nc = charge ? 'var(--dim)' : 'var(--green)'
  const path = charge ? `M60 ${b + 8} V${b + 52} H200 V${b + 66}` : `M200 ${b + 66} V${b + 52} H60 V${b + 90}`
  const arrow = charge ? `60,${b + 51} 55,${b + 44} 65,${b + 44}` : `60,${b + 61} 55,${b + 54} 65,${b + 54}`
  return (
    <g>
      <g stroke="var(--text-2)" strokeWidth="2" fill="none">
        <path d={`M60 ${b + 8} V${b + 18} M60 ${b + 40} V${b + 62} M60 ${b + 84} V${b + 90} M60 ${b + 52} H200 M200 ${b + 52} V${b + 66} M200 ${b + 72} V${b + 90}`} />
        <path d={`${gnd(60, b + 90)} ${gnd(200, b + 90)}`} />
        <path d={`M44 ${b + 8} H76 M188 ${b + 66} H212 M188 ${b + 72} H212`} stroke="var(--text)" strokeWidth="3" />
      </g>
      <path d={path} fill="none" stroke="var(--green)" strokeWidth="3" strokeDasharray="7 5" strokeLinecap="round" />
      <polygon points={arrow} fill="var(--green)" />
      <rect x="32" y={b + 18} width="56" height="22" rx="3" fill="var(--card)" stroke={pc} strokeWidth="2" />
      <rect x="32" y={b + 62} width="56" height="22" rx="3" fill="var(--card)" stroke={nc} strokeWidth="2" />
      <circle cx="60" cy={b + 52} r="3.5" fill="var(--text)" />
      <T x={60} y={b + 33} size={10} color={pc} bold>PMOS</T>
      <T x={60} y={b + 77} size={10} color={nc} bold>NMOS</T>
      <T x={84} y={b + 12} anchor="start" size={10} color="var(--text)">VDD</T>
      <T x={218} y={b + 74} anchor="start" size={11} color="var(--text)">CL</T>
      <T x={108} y={b + 34} anchor="start" size={11} color="var(--green)" bold>{t(charge ? FL.charge : FL.discharge)}</T>
    </g>
  )
}

const PX0 = 380
const PX1 = 740
const PY0 = 215
const PY1 = 50

export function PowerFig({ c, v, f }: { c: number; v: number; f: number }) {
  const { t } = useLocale()
  const vMax = 3.5
  const pMax = dynPower(c, vMax, f)
  const x = (volt: number) => PX0 + (volt / vMax) * (PX1 - PX0)
  const y = (p: number) => PY0 - (p / pMax) * (PY0 - PY1)
  const pts = Array.from({ length: 36 }, (_, k) => {
    const volt = (k / 35) * vMax
    return `${k === 0 ? 'M' : 'L'}${x(volt).toFixed(1)} ${y(dynPower(c, volt, f)).toFixed(1)}`
  }).join(' ')
  const p = dynPower(c, v, f)
  const pHalf = dynPower(c, v / 2, f)
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 260" className="term-fig__svg" role="img" aria-label={t(FL.powerAria)}>
        <rect width="760" height="260" rx="10" fill="var(--well)" />
        <rect x="10" y="10" width="290" height="240" rx="8" fill="var(--card)" stroke="var(--line)" />
        <Mini b={14} charge />
        <Mini b={128} charge={false} />
        {[0, 0.25, 0.5, 0.75, 1].map((k) => (
          <g key={k}>
            <line x1={PX0} y1={y(pMax * k)} x2={PX1} y2={y(pMax * k)} stroke="var(--line-3)" strokeOpacity="0.5" />
            <T x={PX0 - 6} y={y(pMax * k) + 4} anchor="end" size={10} color="var(--dim)" mono>{fmtP(pMax * k)}</T>
          </g>
        ))}
        {[0, 1, 2, 3].map((volt) => (
          <T key={volt} x={x(volt)} y={PY0 + 16} size={10} color="var(--dim)" mono>{`${volt}`}</T>
        ))}
        <path d={`M${PX0} ${PY0} H${PX1} M${PX0} ${PY0} V${PY1}`} stroke="var(--line-2)" fill="none" />
        <T x={PX0} y={PY1 - 14} anchor="start" size={11} color="var(--muted)">P = C·V²·f</T>
        <T x={PX1} y={PY0 + 34} anchor="end" size={11} color="var(--muted)">{t(FL.supplyAxis)}</T>
        <path d={pts} fill="none" stroke="var(--gold)" strokeWidth="2.4" />
        <line x1={x(v)} y1={PY0} x2={x(v)} y2={y(p)} stroke="var(--line-3)" strokeDasharray="3 3" />
        <line x1={x(v / 2)} y1={PY0} x2={x(v / 2)} y2={y(pHalf)} stroke="var(--line-3)" strokeDasharray="3 3" />
        <circle cx={x(v)} cy={y(p)} r="5" fill="var(--gold)" />
        <circle cx={x(v / 2)} cy={y(pHalf)} r="5" fill="var(--card)" stroke="var(--gold)" strokeWidth="2" />
        <circle cx={PX0 + 20} cy={PY1 + 12} r="5" fill="var(--gold)" />
        <T x={PX0 + 32} y={PY1 + 16} anchor="start" size={11} color="var(--text-2)" mono>{`${fmtP(p)} @ ${v.toFixed(2)} V`}</T>
        <circle cx={PX0 + 20} cy={PY1 + 32} r="5" fill="var(--card)" stroke="var(--gold)" strokeWidth="2" />
        <T x={PX0 + 32} y={PY1 + 36} anchor="start" size={11} color="var(--text-2)" mono>{`${fmtP(pHalf)} @ ${(v / 2).toFixed(2)} V`}</T>
      </svg>
      <figcaption>{`${t(FL.powerCap2)} ${t(FIG.powerCap)}`}</figcaption>
    </figure>
  )
}
