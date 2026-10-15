import { useLocale } from '../../i18n/LocaleContext'
import { Hit } from '../prep/common'
import { SCALE_LABEL } from './data/mosRealScale'
import { T, pow10 } from './RealFigs'
import { idTotal, NODES, T_REF, type NodeId, type ScaleNode } from './realModel'

const P = { x0: 60, x1: 420, y0: 40, y1: 290, vMax: 1.5, lMin: -20, lMax: -2 }
const sx = (v: number) => P.x0 + (v / P.vMax) * (P.x1 - P.x0)
const sy = (l: number) => P.y0 + ((P.lMax - l) / (P.lMax - P.lMin)) * (P.y1 - P.y0)

function path(node: ScaleNode, vds: number) {
  const pts: string[] = []
  for (let v = 0; v <= P.vMax + 1e-9; v += 0.01) {
    const l = Math.log10(Math.max(idTotal(v, vds, T_REF, node.dev), 1e-30))
    pts.push(`${pts.length === 0 ? 'M' : 'L'}${sx(v).toFixed(1)} ${Math.max(sy(l), P.y0 - 20).toFixed(1)}`)
  }
  return pts.join(' ')
}

/** 曲线在 log10(Id) = level 处对应的 Vgs */
function vAt(node: ScaleNode, vds: number, level: number) {
  for (let v = 0; v <= P.vMax; v += 0.002) {
    if (Math.log10(idTotal(v, vds, T_REF, node.dev)) >= level) {
      return v
    }
  }
  return P.vMax
}

const BAR_H = 30
const BASE = 250
const CX = (k: number) => 495 + k * 56

export function ScaleFig({ node, onPick }: { node: ScaleNode; onPick: (id: NodeId) => void }) {
  const { t } = useLocale()
  const lowVds = 0.05
  const level = -9
  const vLow = vAt(node, lowVds, level)
  const vHigh = vAt(node, node.vdd, level)
  const dMv = Math.max(vLow - vHigh, 0) * 1000
  const ticks = [-18, -14, -10, -6, -2]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 340" className="term-fig__svg" role="img" aria-label={t(SCALE_LABEL.cap)}>
        <rect width="760" height="340" rx="10" fill="var(--well)" />
        <clipPath id="mosRealScaleClip">
          <rect x={P.x0} y={P.y0} width={P.x1 - P.x0} height={P.y1 - P.y0} />
        </clipPath>
        <rect x={P.x0} y={P.y0} width={P.x1 - P.x0} height={P.y1 - P.y0} fill="var(--card)" stroke="var(--line)" />
        {ticks.map((l) => (
          <g key={l}>
            <path d={`M${P.x0} ${sy(l)} H${P.x1}`} stroke="var(--line-3)" />
            <T x={P.x0 - 6} y={sy(l) + 4} anchor="end" size={10} color="var(--muted)">
              {pow10(l)}
            </T>
          </g>
        ))}
        {[0, 0.5, 1, 1.5].map((v) => (
          <g key={v}>
            <path d={`M${sx(v)} ${P.y0} V${P.y1}`} stroke="var(--line-3)" />
            <T x={sx(v)} y={P.y1 + 16} size={10} color="var(--muted)">
              {String(v)}
            </T>
          </g>
        ))}
        <T x={P.x0} y={30} anchor="start">
          {t(SCALE_LABEL.axisY)}
        </T>
        <T x={P.x1} y={P.y1 + 34} anchor="end">
          {t(SCALE_LABEL.axisX)}
        </T>
        <g clipPath="url(#mosRealScaleClip)" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={path(node, lowVds)} stroke="var(--blue)" strokeWidth="3" />
          <path d={path(node, node.vdd)} stroke="var(--gold)" strokeWidth="3" />
          <path d={`M${sx(vHigh)} ${sy(level)} H${sx(vLow)}`} stroke="var(--red)" strokeWidth="2" />
        </g>
        <T x={sx(vLow) + 10} y={sy(level) + 15} anchor="start" color="var(--red)" bold>
          {`ΔVth ≈ ${dMv.toFixed(0)} mV`}
        </T>
        <path d="M170 17 H198" stroke="var(--blue)" strokeWidth="3" />
        <T x={204} y={21} anchor="start">
          {t(SCALE_LABEL.low)}
        </T>
        <path d="M330 17 H358" stroke="var(--gold)" strokeWidth="3" />
        <T x={364} y={21} anchor="start">
          {t(SCALE_LABEL.high)}
        </T>
        <T x={460} y={30} anchor="start" color="var(--text)" size={12} bold>
          {t(SCALE_LABEL.bars)}
        </T>
        <rect x="460" y="40" width="290" height="250" rx="8" fill="var(--card)" stroke="var(--line)" />
        <rect x="476" y="52" width="10" height="10" fill="var(--blue-bg-2)" stroke="var(--blue)" />
        <T x={492} y={61} anchor="start" size={10}>
          {t(SCALE_LABEL.barVdd)}
        </T>
        <rect x="540" y="52" width="10" height="10" fill="var(--gold-bg-2)" stroke="var(--gold)" />
        <T x={556} y={61} anchor="start" size={10}>
          {t(SCALE_LABEL.barVth)}
        </T>
        <path d="M468 250 H742" stroke="var(--line-2)" />
        {NODES.map((n, k) => {
          const on = n.id === node.id
          return (
            <Hit key={n.id} label={n.name} active={on} onPick={() => onPick(n.id)}>
              <rect x={CX(k) - 26} y="70" width="52" height="214" rx="6" fill={on ? 'var(--gold-bg)' : 'transparent'} stroke={on ? 'var(--gold)' : 'none'} />
              <rect x={CX(k) - 20} y={BASE - n.vdd * BAR_H} width="18" height={n.vdd * BAR_H} fill="var(--blue-bg-2)" stroke="var(--blue)" />
              <rect x={CX(k) + 2} y={BASE - n.dev.vth0 * BAR_H} width="18" height={n.dev.vth0 * BAR_H} fill="var(--gold-bg-2)" stroke="var(--gold)" />
              <T x={CX(k) - 11} y={BASE - n.vdd * BAR_H - 4} size={9} color="var(--blue)">
                {n.vdd.toFixed(1)}
              </T>
              <T x={CX(k) + 11} y={BASE - n.dev.vth0 * BAR_H - 4} size={9} color="var(--gold)">
                {n.dev.vth0.toFixed(2)}
              </T>
              <T x={CX(k)} y={268} size={10} color={on ? 'var(--text)' : 'var(--muted)'} bold={on}>
                {n.name}
              </T>
            </Hit>
          )
        })}
      </svg>
      <figcaption>{t(SCALE_LABEL.cap)}</figcaption>
    </figure>
  )
}
