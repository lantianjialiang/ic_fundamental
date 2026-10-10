import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import {
  IDDQ_UA,
  IH_MA,
  ILIM_MA,
  RON,
  VBO0,
  VDDMAX,
  VDDOVR,
  VON,
  fmtIdd,
  onCurrent,
  vbo,
  type ScrMode,
  type SimPoint,
} from './data/latch'

const L = {
  pnp: loc('寄生 PNP'),
  npn: loc('寄生 NPN'),
  anode: loc('阳极：PNP 发射极（P+ 接 VDD）'),
  cathode: loc('阴极：NPN 发射极（N+ 接 GND）'),
  c2b: loc('PNP 集电极 → NPN 基极'),
  b2c: loc('NPN 集电极 → PNP 基极'),
  capOff: loc('平时两只寄生管都关着，VDD 和 GND 之间没有通路。'),
  capOn: loc('触发后：PNP 的集电极电流流过 Rsub 打开 NPN，NPN 的集电极电流流过 Rwell 又打开 PNP——正反馈，VDD 直通 GND。'),
  ivCap: loc('黑线是 SCR 的伏安曲线，蓝色虚线是外部电路的负载线，黄点是当前工作点。'),
  vAxis: loc('阳极电压 (V)'),
  iAxis: loc('电流 (mA)'),
  block: loc('阻断区'),
  neg: loc('负阻区'),
  onReg: loc('导通区 ≈ 1 V'),
  lim: loc('电源限流 300 mA'),
  ig0: loc('门电流 = 0 时'),
  seqCap: loc('上：VDD；下：IDD（对数坐标）。圆点是两次 IDD 测量。'),
  meas: loc('测'),
}

/* ---------------- 等效电路 ---------------- */

export function ScrCircuitFig({ fired }: { fired: boolean }) {
  const { t } = useLocale()
  const hot = fired ? 'var(--gold)' : 'var(--line-2)'
  const zig = (x: number, y0: number, y1: number) => {
    const h = (y1 - y0) / 6
    let d = `M${x} ${y0}`
    for (let k = 0; k < 6; k += 1) d += ` L${x + (k % 2 === 0 ? 8 : -8)} ${y0 + h * (k + 0.5)}`
    return `${d} L${x} ${y1}`
  }
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 270" className="term-fig__svg" role="img" aria-label={t(fired ? L.capOn : L.capOff)}>
        <rect width="680" height="270" rx="10" fill="var(--well)" />
        {/* 电源轨 */}
        <line x1="120" y1="30" x2="560" y2="30" stroke="var(--sky)" strokeWidth="3" />
        <text x="110" y="34" textAnchor="end" fill="var(--sky)" fontSize="13">
          VDD
        </text>
        <line x1="120" y1="240" x2="560" y2="240" stroke="var(--sky)" strokeWidth="3" />
        <text x="110" y="244" textAnchor="end" fill="var(--sky)" fontSize="13">
          GND
        </text>
        {/* PNP */}
        <rect x="190" y="70" width="140" height="50" rx="8" fill={fired ? 'var(--gold-bg)' : 'var(--fig-box)'} stroke={hot} strokeWidth="2" />
        <text x="260" y="100" textAnchor="middle" fill="var(--text)" fontSize="13">
          {t(L.pnp)}
        </text>
        {/* NPN */}
        <rect x="360" y="150" width="140" height="50" rx="8" fill={fired ? 'var(--gold-bg)' : 'var(--fig-box)'} stroke={hot} strokeWidth="2" />
        <text x="430" y="180" textAnchor="middle" fill="var(--text)" fontSize="13">
          {t(L.npn)}
        </text>
        {/* 阳极：VDD → PNP 发射极 */}
        <line x1="230" y1="30" x2="230" y2="70" stroke={hot} strokeWidth={fired ? 4 : 2} />
        <text x="150" y="56" fill="var(--muted)" fontSize="11">
          {t(L.anode)}
        </text>
        {/* PNP 集电极 → NPN 基极，Rsub 到 GND */}
        <path d="M230 120 L230 175 L360 175" fill="none" stroke={hot} strokeWidth={fired ? 4 : 2} />
        <path d={zig(230, 190, 230)} fill="none" stroke="var(--text-2)" strokeWidth="1.5" />
        <line x1="230" y1="175" x2="230" y2="190" stroke="var(--text-2)" strokeWidth="1.5" />
        <line x1="230" y1="230" x2="230" y2="240" stroke="var(--text-2)" strokeWidth="1.5" />
        <text x="214" y="214" textAnchor="end" fill="var(--muted)" fontSize="12">
          Rsub
        </text>
        <text x="296" y="168" textAnchor="middle" fill="var(--muted)" fontSize="11">
          {t(L.c2b)}
        </text>
        {/* NPN 集电极 → PNP 基极，Rwell 到 VDD */}
        <path d="M470 150 L470 95 L330 95" fill="none" stroke={hot} strokeWidth={fired ? 4 : 2} />
        <path d={zig(470, 40, 80)} fill="none" stroke="var(--text-2)" strokeWidth="1.5" />
        <line x1="470" y1="30" x2="470" y2="40" stroke="var(--text-2)" strokeWidth="1.5" />
        <line x1="470" y1="80" x2="470" y2="95" stroke="var(--text-2)" strokeWidth="1.5" />
        <text x="486" y="64" fill="var(--muted)" fontSize="12">
          Rwell
        </text>
        <text x="400" y="88" textAnchor="middle" fill="var(--muted)" fontSize="11">
          {t(L.b2c)}
        </text>
        {/* 阴极：NPN 发射极 → GND */}
        <line x1="400" y1="200" x2="400" y2="240" stroke={hot} strokeWidth={fired ? 4 : 2} />
        <text x="412" y="226" fill="var(--muted)" fontSize="11">
          {t(L.cathode)}
        </text>
        {fired ? (
          <>
            <path d="M560 50 L560 220" stroke="var(--red)" strokeWidth="3" />
            <path d="M552 208 L560 222 L568 208" fill="none" stroke="var(--red)" strokeWidth="3" />
            <text x="574" y="140" fill="var(--red)" fontSize="13">
              I ↑↑
            </text>
          </>
        ) : null}
      </svg>
      <figcaption>{t(fired ? L.capOn : L.capOff)}</figcaption>
    </figure>
  )
}

/* ---------------- 伏安特性 ---------------- */

const IV = { x0: 70, x1: 650, y0: 260, y1: 30, vMax: 10, iMax: 400 }
const xv = (v: number) => IV.x0 + (Math.max(0, Math.min(v, IV.vMax)) / IV.vMax) * (IV.x1 - IV.x0)
const yi = (i: number) => IV.y0 - (Math.max(0, Math.min(i, IV.iMax)) / IV.iMax) * (IV.y0 - IV.y1)

function curvePath(vb: number) {
  let d = `M${xv(0)} ${yi(0)}`
  for (let k = 1; k <= 20; k += 1) {
    const v = (vb * k) / 20
    d += ` L${xv(v)} ${yi(6 * (v / vb) ** 4)}`
  }
  return d
}

export function ScrIvFig({ vs, ig, r, limit, mode }: { vs: number; ig: number; r: number; limit: boolean; mode: ScrMode }) {
  const { t } = useLocale()
  const vb = vbo(ig)
  const vHold = VON + (IH_MA * RON) / 1000
  const vTop = VON + (IV.iMax * RON) / 1000
  // 负载线：电源 vs 经 r 供电，可选限流
  const load: Array<[number, number]> = [[vs, 0]]
  const iShort = r > 0 ? (vs / r) * 1000 : Infinity
  if (limit && iShort > ILIM_MA) {
    load.push([Math.max(0, vs - (ILIM_MA * r) / 1000), ILIM_MA], [0, ILIM_MA])
  } else if (iShort > IV.iMax) {
    load.push([Math.max(0, vs - (IV.iMax * r) / 1000), IV.iMax])
  } else {
    load.push([0, iShort])
  }
  const iOn = onCurrent(vs, r, limit)
  const op: [number, number] = mode === 'on' ? [VON + (iOn * RON) / 1000, iOn] : [vs, 6 * Math.min(1, vs / vb) ** 4]
  const off = iOn > IV.iMax && mode === 'on'
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 300" className="term-fig__svg" role="img" aria-label={t(L.ivCap)}>
        <rect width="680" height="300" rx="10" fill="var(--well)" />
        {/* 坐标轴与网格 */}
        {[0, 2, 4, 6, 8, 10].map((v) => (
          <g key={v}>
            <line x1={xv(v)} y1={IV.y1} x2={xv(v)} y2={IV.y0} stroke="var(--line-soft)" />
            <text x={xv(v)} y={IV.y0 + 16} textAnchor="middle" fill="var(--dim)" fontSize="11">
              {v}
            </text>
          </g>
        ))}
        {[0, 100, 200, 300, 400].map((i) => (
          <g key={i}>
            <line x1={IV.x0} y1={yi(i)} x2={IV.x1} y2={yi(i)} stroke="var(--line-soft)" />
            <text x={IV.x0 - 6} y={yi(i) + 4} textAnchor="end" fill="var(--dim)" fontSize="11">
              {i}
            </text>
          </g>
        ))}
        <line x1={IV.x0} y1={IV.y0} x2={IV.x1} y2={IV.y0} stroke="var(--line-2)" />
        <line x1={IV.x0} y1={IV.y0} x2={IV.x0} y2={IV.y1} stroke="var(--line-2)" />
        <text x={IV.x1} y={IV.y0 + 32} textAnchor="end" fill="var(--muted)" fontSize="12">
          {t(L.vAxis)}
        </text>
        <text x={IV.x0 + 6} y={IV.y1 - 10} fill="var(--muted)" fontSize="12">
          {t(L.iAxis)}
        </text>
        {/* IH 与限流 */}
        <line x1={IV.x0} y1={yi(IH_MA)} x2={IV.x1} y2={yi(IH_MA)} stroke="var(--purple)" strokeDasharray="3 4" />
        <text x={IV.x1 - 4} y={yi(IH_MA) - 5} textAnchor="end" fill="var(--purple)" fontSize="11">
          {`IH = ${IH_MA} mA`}
        </text>
        {limit ? (
          <>
            <line x1={IV.x0} y1={yi(ILIM_MA)} x2={IV.x1} y2={yi(ILIM_MA)} stroke="var(--red)" strokeDasharray="6 4" />
            <text x={IV.x1 - 4} y={yi(ILIM_MA) - 5} textAnchor="end" fill="var(--red)" fontSize="11">
              {t(L.lim)}
            </text>
          </>
        ) : null}
        {/* 门电流 = 0 时的参考曲线 */}
        {ig > 0 ? (
          <>
            <path d={curvePath(VBO0)} fill="none" stroke="var(--dim)" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x={xv(VBO0)} y={yi(0) - 10} textAnchor="middle" fill="var(--dim)" fontSize="10">
              {t(L.ig0)}
            </text>
          </>
        ) : null}
        {/* SCR 曲线 */}
        <path d={curvePath(vb)} fill="none" stroke="var(--text)" strokeWidth="2.5" />
        <path
          d={`M${xv(vb)} ${yi(6)} Q${xv((vb + vHold) / 2)} ${yi(10)} ${xv(vHold)} ${yi(IH_MA)}`}
          fill="none"
          stroke="var(--text-2)"
          strokeWidth="1.5"
          strokeDasharray="5 4"
        />
        <line x1={xv(vHold)} y1={yi(IH_MA)} x2={xv(vTop)} y2={yi(IV.iMax)} stroke="var(--text)" strokeWidth="2.5" />
        <line x1={xv(vb)} y1={IV.y1 + 30} x2={xv(vb)} y2={IV.y0} stroke="var(--gold)" strokeDasharray="2 4" />
        <text x={xv(vb)} y={IV.y1 + 24} textAnchor="middle" fill="var(--gold)" fontSize="12" fontFamily="var(--mono)">
          {`VBO = ${vb.toFixed(2)} V`}
        </text>
        <text x={xv(Math.min(vb, 8) / 2 + 0.6)} y={yi(0) - 8} textAnchor="middle" fill="var(--muted)" fontSize="11">
          {t(L.block)}
        </text>
        <text x={xv(vHold) + 8} y={yi(150)} fill="var(--muted)" fontSize="11">
          {t(L.onReg)}
        </text>
        {vb > 3 ? (
          <text x={xv((vb + vHold) / 2)} y={yi(30)} textAnchor="middle" fill="var(--dim)" fontSize="10">
            {t(L.neg)}
          </text>
        ) : null}
        {/* 负载线 */}
        <polyline
          points={load.map(([v, i]) => `${xv(v)},${yi(i)}`).join(' ')}
          fill="none"
          stroke="var(--blue)"
          strokeWidth="1.5"
          strokeDasharray="6 4"
        />
        {/* 工作点 */}
        <circle
          cx={xv(op[0])}
          cy={yi(op[1])}
          r="7"
          fill={mode === 'on' ? 'var(--red)' : mode === 'fizzle' ? 'var(--purple)' : 'var(--gold)'}
          stroke="var(--text)"
          strokeWidth="1.5"
        />
        {off ? (
          <text x={xv(op[0]) + 12} y={IV.y1 + 12} fill="var(--red)" fontSize="13" fontFamily="var(--mono)">
            {`↑ ${iOn >= 1000 ? `${(iOn / 1000).toFixed(1)} A` : `${iOn.toFixed(0)} mA`}`}
          </text>
        ) : null}
      </svg>
      <figcaption>{t(L.ivCap)}</figcaption>
    </figure>
  )
}

/* ---------------- 测试流程 VDD / IDD 曲线 ---------------- */

const SQ = { x0: 80, x1: 650, vTop: 24, vBot: 124, dTop: 160, dBot: 280 }
const STEPS = 12
const sx = (k: number) => SQ.x0 + (k * (SQ.x1 - SQ.x0)) / STEPS
const syv = (v: number) => SQ.vBot - (Math.min(v, 8) / 8) * (SQ.vBot - SQ.vTop)
const syd = (ua: number) => SQ.dBot - (Math.log10(Math.max(1, ua)) / 6) * (SQ.dBot - SQ.dTop)

export function LatchSeqFig({ points, step }: { points: SimPoint[]; step: number }) {
  const { t } = useLocale()
  const shown = points.slice(0, step + 1)
  const stair = (val: (p: SimPoint) => number) =>
    shown
      .map((p, k) => {
        const y = val(p)
        return `${k === 0 ? 'M' : 'L'}${sx(k)} ${y} L${sx(k + 1)} ${y}`
      })
      .join(' ')
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 680 310" className="term-fig__svg" role="img" aria-label={t(L.seqCap)}>
        <rect width="680" height="310" rx="10" fill="var(--well)" />
        {/* 当前步高亮 */}
        <rect x={sx(step)} y={SQ.vTop - 6} width={sx(1) - sx(0)} height={SQ.dBot - SQ.vTop + 12} fill="var(--gold)" opacity="0.1" />
        {/* VDD 区 */}
        <line x1={SQ.x0} y1={SQ.vBot} x2={SQ.x1} y2={SQ.vBot} stroke="var(--line-2)" />
        <text x={SQ.x0 - 8} y={(SQ.vTop + SQ.vBot) / 2} textAnchor="end" fill="var(--text-2)" fontSize="12" fontFamily="var(--mono)">
          VDD
        </text>
        {[
          { v: VDDMAX, label: 'VDDMAX 5.25 V', c: 'var(--green)' },
          { v: VDDOVR, label: 'VDDOVR 7.0 V', c: 'var(--red)' },
        ].map((m) => (
          <g key={m.label}>
            <line x1={SQ.x0} y1={syv(m.v)} x2={SQ.x1} y2={syv(m.v)} stroke={m.c} strokeDasharray="3 4" opacity="0.7" />
            <text x={SQ.x1 + 2} y={syv(m.v) - 3} textAnchor="end" fill={m.c} fontSize="10">
              {m.label}
            </text>
          </g>
        ))}
        <path d={stair((p) => syv(p.vdd))} fill="none" stroke="var(--sky)" strokeWidth="2.5" />
        {/* IDD 区（对数） */}
        <line x1={SQ.x0} y1={SQ.dBot} x2={SQ.x1} y2={SQ.dBot} stroke="var(--line-2)" />
        <text x={SQ.x0 - 8} y={(SQ.dTop + SQ.dBot) / 2} textAnchor="end" fill="var(--text-2)" fontSize="12" fontFamily="var(--mono)">
          IDD
        </text>
        {[
          { ua: 1, label: '1 µA' },
          { ua: 1000, label: '1 mA' },
          { ua: 1e6, label: '1 A' },
        ].map((m) => (
          <text key={m.label} x={SQ.x0 + 4} y={syd(m.ua) - 3} fill="var(--dim)" fontSize="10">
            {m.label}
          </text>
        ))}
        <line x1={SQ.x0} y1={syd(IDDQ_UA)} x2={SQ.x1} y2={syd(IDDQ_UA)} stroke="var(--gold)" strokeDasharray="3 4" opacity="0.8" />
        <text x={SQ.x1 + 2} y={syd(IDDQ_UA) - 3} textAnchor="end" fill="var(--gold)" fontSize="10">
          {`IDDQ ${IDDQ_UA} µA`}
        </text>
        <line x1={SQ.x0} y1={syd(ILIM_MA * 1000)} x2={SQ.x1} y2={syd(ILIM_MA * 1000)} stroke="var(--red)" strokeDasharray="3 4" opacity="0.8" />
        <text x={SQ.x1 + 2} y={syd(ILIM_MA * 1000) - 3} textAnchor="end" fill="var(--red)" fontSize="10">
          {t(L.lim)}
        </text>
        <path d={stair((p) => syd(p.idd))} fill="none" stroke="var(--purple)" strokeWidth="2.5" />
        {/* 两次测量 */}
        {[3, 8].map((k) =>
          step >= k && points[k] ? (
            <g key={k}>
              <circle cx={(sx(k) + sx(k + 1)) / 2} cy={syd(points[k].idd)} r="5" fill="var(--gold)" stroke="var(--text)" />
              <text x={(sx(k) + sx(k + 1)) / 2} y={syd(points[k].idd) - 9} textAnchor="middle" fill="var(--gold)" fontSize="10" fontFamily="var(--mono)">
                {fmtIdd(points[k].idd)}
              </text>
            </g>
          ) : null,
        )}
        {/* 步号 */}
        {Array.from({ length: STEPS }, (_, k) => k).map((k) =>
          k === 0 ? null : (
            <text
              key={k}
              x={(sx(k) + sx(k + 1)) / 2}
              y={300}
              textAnchor="middle"
              fill={k === step ? 'var(--gold)' : 'var(--dim)'}
              fontSize="11"
              fontFamily="var(--mono)"
            >
              {k}
            </text>
          ),
        )}
        <text x={SQ.x0 - 8} y={300} textAnchor="end" fill="var(--dim)" fontSize="10">
          #
        </text>
        {[3, 8].map((k) => (
          <text key={`m${k}`} x={(sx(k) + sx(k + 1)) / 2} y={SQ.dTop - 8} textAnchor="middle" fill="var(--muted)" fontSize="10">
            {t(L.meas)}
          </text>
        ))}
      </svg>
      <figcaption>{t(L.seqCap)}</figcaption>
    </figure>
  )
}
