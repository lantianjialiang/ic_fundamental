import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { CMOS_LABEL, EDGES, SCOPE_LABEL, type CmosEdge } from './data/mosDynamicScope'
import { QG_LABEL } from './data/mosDynamic'
import { calcEdge, niceDiv, QGD, QGS, qgTotal, VPL, vgsOfCharge, waveAt, type DynParams, type Edge } from './dynamicModel'
import { fmtTime, T } from './DynamicFigs'
import { VDD } from './model'

/* ---------- Vgs 对栅电荷 ---------- */

const QX0 = 70
const QX1 = 720
const QY0 = 230
const QY1 = 40
const Q_MAX = 16e-9
const V_MAX = 12
const qx = (q: number) => QX0 + (q / Q_MAX) * (QX1 - QX0)
const qy = (v: number) => QY0 - (v / V_MAX) * (QY0 - QY1)
const nC = (q: number) => `${(q * 1e9).toFixed(1)} nC`

export function QgFig({ vdrive }: { vdrive: number }) {
  const { t } = useLocale()
  const qg = qgTotal(vdrive)
  const pts = Array.from({ length: 121 }, (_, k) => {
    const q = (k / 120) * qg
    return `${k === 0 ? 'M' : 'L'}${qx(q).toFixed(1)} ${qy(vgsOfCharge(q, vdrive)).toFixed(1)}`
  }).join(' ')
  const segs = [
    { from: 0, to: QGS, name: 'Qgs', tint: 'var(--blue)' },
    { from: QGS, to: QGS + QGD, name: 'Qgd', tint: 'var(--gold)' },
    { from: QGS + QGD, to: qg, name: t(QG_LABEL.rest), tint: 'var(--green)' },
  ]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 300" className="term-fig__svg" role="img" aria-label={t(QG_LABEL.capQg)}>
        <rect width="760" height="300" rx="10" fill="var(--well)" />
        {segs.map((s) => (
          <rect key={s.name} x={qx(s.from)} y={QY1 - 6} width={qx(s.to) - qx(s.from)} height={QY0 - QY1 + 6} fill={s.tint} fillOpacity="0.1" />
        ))}
        {[0, 2, 4, 6, 8, 10, 12].map((v) => (
          <g key={v}>
            <line x1={QX0} y1={qy(v)} x2={QX1} y2={qy(v)} stroke="var(--line-3)" strokeOpacity="0.5" />
            <T x={QX0 - 8} y={qy(v) + 4} anchor="end" size={10} color="var(--dim)" mono>
              {`${v}`}
            </T>
          </g>
        ))}
        {[0, 4, 8, 12, 16].map((q) => (
          <T key={q} x={qx(q * 1e-9)} y={QY0 + 16} size={10} color="var(--dim)" mono>
            {`${q}`}
          </T>
        ))}
        <line x1={QX0} y1={QY0} x2={QX1} y2={QY0} stroke="var(--line-2)" />
        <line x1={QX0} y1={QY0} x2={QX0} y2={QY1 - 6} stroke="var(--line-2)" />
        <line x1={QX0} y1={qy(VPL)} x2={QX1} y2={qy(VPL)} stroke="var(--muted)" strokeDasharray="5 4" />
        <T x={QX1} y={qy(VPL) + 15} anchor="end" size={10} color="var(--muted)" mono>
          {`Vpl ${VPL} V`}
        </T>
        <line x1={QX0} y1={qy(vdrive)} x2={QX1} y2={qy(vdrive)} stroke="var(--muted)" strokeDasharray="5 4" />
        <T x={QX1} y={qy(vdrive) - 6} anchor="end" size={10} color="var(--muted)" mono>
          {`Vdrive ${vdrive} V`}
        </T>
        <T x={QX0} y={QY1 - 16} anchor="start" size={11} color="var(--muted)">
          Vgs (V)
        </T>
        <path d={pts} fill="none" stroke="#f5d442" strokeWidth="2.6" />
        {segs.map((s) => (
          <g key={s.name}>
            <path d={`M${qx(s.from) + 2} ${QY0 + 26} V${QY0 + 32} H${qx(s.to) - 2} V${QY0 + 26}`} fill="none" stroke={s.tint} strokeWidth="1.8" />
            <T x={(qx(s.from) + qx(s.to)) / 2} y={QY0 + 48} size={11} bold color="var(--text)">
              {`${s.name} ${nC(s.to - s.from)}`}
            </T>
          </g>
        ))}
        <T x={QX1} y={QY0 + 70} anchor="end" size={10} color="var(--muted)">
          {`${t(loc('累计栅电荷 Q (nC)', 'Accumulated gate charge Q (nC)'))}`}
        </T>
      </svg>
      <figcaption>{t(QG_LABEL.capQg)}</figcaption>
    </figure>
  )
}

/* ---------- 示波器 ---------- */

const SX0 = 50
const SX1 = 710
const SY0 = 308
const SY1 = 52
const DIV_X = (SX1 - SX0) / 10
const DIV_Y = (SY0 - SY1) / 8
const CH = { vgs: '#f5d442', vds: '#38d6e8', id: '#ff5fd2' }

export function ScopeFig({ params, edge }: { params: DynParams; edge: Edge }) {
  const { t } = useLocale()
  const c = calcEdge(params, edge)
  const tDiv = niceDiv(c.tEnd, 9)
  const tStart = -tDiv
  const spanT = tDiv * 10
  const px = (sec: number) => SX0 + ((sec - tStart) / spanT) * (SX1 - SX0)
  const yVolt = (v: number) => SY0 - (v / 2) * DIV_Y
  const yAmp = (a: number) => SY0 - a * DIV_Y
  const n = 500
  const path = (pick: (w: ReturnType<typeof waveAt>) => number, yOf: (v: number) => number) =>
    Array.from({ length: n + 1 }, (_, k) => {
      const w = waveAt(c, tStart + (spanT * k) / n)
      return `${k === 0 ? 'M' : 'L'}${(SX0 + (k / n) * (SX1 - SX0)).toFixed(1)} ${Math.max(SY1 - 4, yOf(pick(w))).toFixed(1)}`
    }).join(' ')
  const lastX = [-100, -100]
  const marks = c.marks.map((m, i) => {
    const x = px(m)
    const row = i % 2
    const show = x - lastX[row] >= 22
    if (show) {
      lastX[row] = x
    }
    return { x, row, show, label: `t${i + 1}` }
  })
  const xT = px(c.tpd)
  const barY = SY0 + 18
  const tpdText = `tPD ${fmtTime(c.tpd)}`
  const tpdW = tpdText.length * 6.2
  const tpdRight = xT + 8 + tpdW <= 735
  const edgeLabel = EDGES.find((e) => e.id === edge) ?? EDGES[0]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 372" className="term-fig__svg" role="img" aria-label={t(SCOPE_LABEL.cap)}>
        <rect width="760" height="372" rx="10" fill="var(--well)" />
        <rect x={SX0} y={SY1} width={SX1 - SX0} height={SY0 - SY1} fill="#0b1118" stroke="#3a4656" />
        {Array.from({ length: 11 }, (_, i) => (
          <line key={`v${i}`} x1={SX0 + i * DIV_X} y1={SY1} x2={SX0 + i * DIV_X} y2={SY0} stroke="#2a3441" />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <line key={`h${i}`} x1={SX0} y1={SY1 + i * DIV_Y} x2={SX1} y2={SY1 + i * DIV_Y} stroke="#2a3441" />
        ))}
        {Array.from({ length: 51 }, (_, i) => (
          <line key={`m${i}`} x1={SX0 + i * (DIV_X / 5)} y1={SY1 + 4 * DIV_Y - 3} x2={SX0 + i * (DIV_X / 5)} y2={SY1 + 4 * DIV_Y + 3} stroke="#3a4656" />
        ))}
        {[0, 2, 4, 6, 8].map((k) => (
          <g key={k}>
            <T x={SX0 - 6} y={yAmp(k) + 4} anchor="end" size={9} color="var(--dim)" mono>
              {`${k * 2}`}
            </T>
            <T x={SX1 + 6} y={yAmp(k) + 4} anchor="start" size={9} color="var(--dim)" mono>
              {`${k}`}
            </T>
          </g>
        ))}
        <T x={SX0 - 6} y={SY1 - 8} anchor="end" size={9} color="var(--muted)" mono>
          V
        </T>
        <T x={SX1 + 6} y={SY1 - 8} anchor="start" size={9} color="var(--muted)" mono>
          A
        </T>
        {marks.map((m) => (
          <g key={m.label}>
            <line x1={m.x} y1={SY1} x2={m.x} y2={SY0} stroke="#8aa0b8" strokeDasharray="3 4" strokeOpacity="0.8" />
            {m.show ? (
              <T x={m.x} y={34 + m.row * 12} size={10} color="#9fb0c0" mono>
                {m.label}
              </T>
            ) : null}
          </g>
        ))}
        <path d={path((w) => w.id, yAmp)} fill="none" stroke={CH.id} strokeWidth="2" />
        <path d={path((w) => w.vds, yVolt)} fill="none" stroke={CH.vds} strokeWidth="2" />
        <path d={path((w) => w.vgs, yVolt)} fill="none" stroke={CH.vgs} strokeWidth="2.2" />
        <T x={SX0} y={16} anchor="start" size={12} bold color="var(--text)">
          {t(edgeLabel.label)}
        </T>
        <T x={SX1} y={16} anchor="end" size={12} color="var(--text-2)" mono>
          {`${fmtTime(tDiv)}/div`}
        </T>
        <path d={`M${px(0)} ${barY} H${xT} M${px(0)} ${barY - 5} V${barY + 5} M${xT} ${barY - 5} V${barY + 5}`} stroke="var(--gold)" strokeWidth="2" fill="none" />
        <T x={tpdRight ? xT + 8 : px(0) - 8} y={barY + 4} anchor={tpdRight ? 'start' : 'end'} size={10} color="var(--gold)" mono>
          {tpdText}
        </T>
        {[
          { color: CH.vgs, text: 'CH1 Vgs 2 V/div' },
          { color: CH.vds, text: 'CH2 Vds 2 V/div' },
          { color: CH.id, text: 'CH3 Id 1 A/div' },
        ].map((ch, i) => (
          <g key={ch.text}>
            <rect x={SX0 + i * 220} y={SY0 + 40} width="14" height="10" fill={ch.color} />
            <T x={SX0 + i * 220 + 22} y={SY0 + 49} anchor="start" size={11} color="var(--text-2)" mono>
              {ch.text}
            </T>
          </g>
        ))}
      </svg>
      <figcaption>{t(SCOPE_LABEL.cap)}</figcaption>
    </figure>
  )
}

/* ---------- CMOS RC 延时 ---------- */

const CX0 = 330
const CX1 = 730
const CY0 = 210
const CY1 = 40
const cvy = (v: number) => CY0 - (v / 3.5) * (CY0 - CY1)

export function CmosFig({ edge, tau }: { edge: CmosEdge; tau: number }) {
  const { t } = useLocale()
  const rise = edge === 'rise'
  const step = niceDiv(5 * tau, 5)
  const span = step * 5
  const cx = (sec: number) => CX0 + (sec / span) * (CX1 - CX0)
  const vOut = (sec: number) => (rise ? VDD * (1 - Math.exp(-sec / tau)) : VDD * Math.exp(-sec / tau))
  const pts = Array.from({ length: 201 }, (_, k) => `${k === 0 ? 'M' : 'L'}${cx((k / 200) * span).toFixed(1)} ${cvy(vOut((k / 200) * span)).toFixed(1)}`).join(' ')
  const tpd = Math.LN2 * tau
  const xP = cx(tpd)
  const yHalf = cvy(VDD / 2)
  const tpdText = `tPD ${fmtTime(tpd)}`
  const wire = { stroke: 'var(--text-2)', strokeWidth: 2, fill: 'none' }
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 270" className="term-fig__svg" role="img" aria-label={t(CMOS_LABEL.cap)}>
        <rect width="760" height="270" rx="10" fill="var(--well)" />
        <rect x="10" y="10" width="290" height="250" rx="8" fill="var(--card)" stroke="var(--line)" />
        <T x={24} y={32} anchor="start" size={11} color="var(--muted)">
          {t(CMOS_LABEL.eq)}
        </T>
        <g {...wire}>
          <path d="M44 120 H90 M150 120 H220 V160 M220 168 V210" />
          {rise ? null : <path d="M44 120 V150 M30 150 H58 M35 156 H53 M40 162 H48" />}
        </g>
        <rect x="90" y="108" width="60" height="24" fill="var(--card)" stroke="var(--text)" strokeWidth="2" />
        <circle cx="44" cy="120" r="4" fill="var(--card)" stroke="var(--text)" strokeWidth="2" />
        <circle cx="220" cy="120" r="3.5" fill="var(--text)" />
        <g stroke="var(--text)" strokeWidth="2.6" strokeLinecap="round">
          <path d="M204 160 H236 M204 168 H236" />
        </g>
        <path d="M220 210 V218 M208 218 H232 M213 224 H227 M218 230 H222" stroke="var(--text-2)" strokeWidth="2" />
        <T x={44} y={100} size={12} bold color="var(--text)" mono>
          {rise ? `${VDD} V` : '0 V'}
        </T>
        <T x={120} y={100} size={12} bold color="var(--text)">
          Ron
        </T>
        <T x={220} y={104} size={11} color="var(--gold)">
          Vout
        </T>
        <T x={246} y={168} anchor="start" size={11} color="var(--text)">
          C_load
        </T>
        {[0, 1, 2, 3].map((v) => (
          <g key={v}>
            <line x1={CX0} y1={cvy(v)} x2={CX1} y2={cvy(v)} stroke="var(--line-3)" strokeOpacity="0.5" />
            <T x={CX0 - 8} y={cvy(v) + 4} anchor="end" size={10} color="var(--dim)" mono>
              {`${v}`}
            </T>
          </g>
        ))}
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <T key={k} x={cx(k * step)} y={CY0 + 16} size={10} color="var(--dim)" mono>
            {fmtTime(k * step)}
          </T>
        ))}
        <line x1={CX0} y1={CY0} x2={CX1} y2={CY0} stroke="var(--line-2)" />
        <line x1={CX0} y1={CY0} x2={CX0} y2={CY1} stroke="var(--line-2)" />
        <line x1={CX0} y1={cvy(VDD)} x2={CX1} y2={cvy(VDD)} stroke="var(--muted)" strokeDasharray="5 4" />
        <T x={CX1} y={cvy(VDD) - 6} anchor="end" size={10} color="var(--muted)" mono>
          {`${VDD} V`}
        </T>
        <line x1={CX0} y1={yHalf} x2={CX1} y2={yHalf} stroke="var(--muted)" strokeDasharray="2 4" />
        <T x={CX1} y={yHalf - 5} anchor="end" size={10} color="var(--muted)" mono>
          {`VDD / 2`}
        </T>
        <path d={pts} fill="none" stroke="var(--gold)" strokeWidth="2.4" />
        <line x1={xP} y1={CY0} x2={xP} y2={yHalf} stroke="var(--blue)" strokeDasharray="3 3" />
        <circle cx={xP} cy={yHalf} r="4" fill="var(--blue)" />
        <T x={xP + 8} y={rise ? yHalf + 18 : yHalf - 10} anchor="start" size={11} bold color="var(--blue)" mono>
          {tpdText}
        </T>
        <T x={CX0} y={CY1 - 12} anchor="start" size={11} color="var(--muted)">
          {`${t(CMOS_LABEL.out)} (V)`}
        </T>
        <T x={CX1} y={CY0 + 34} anchor="end" size={11} color="var(--muted)">
          {t(CMOS_LABEL.time)}
        </T>
      </svg>
      <figcaption>{t(CMOS_LABEL.cap)}</figcaption>
    </figure>
  )
}
