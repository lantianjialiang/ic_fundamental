import { useMemo } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { FIG, S } from './interfaceData'
import { BITS, extrapolatedBer, type InterfaceAnalysis, type InterfacePath } from './interfaceModel'

const CW = 480
const CH = 270
const PAD_L = 62
const PAD_R = 16
const PAD_T = 14
const PAD_B = 34
const PLOT_W = CW - PAD_L - PAD_R
const PLOT_H = CH - PAD_T - PAD_B
/** 纵轴下限 log10(BER) = −14；更低的点与外推曲线都画在底边 */
const LOG_MIN = -14
const TARGET_LOG = -12
const Y_TICKS = [0, -2, -4, -6, -8, -10, -12, -14]
const X_TICKS = [0, 0.25, 0.5, 0.75, 1]
const MONO = 'Consolas, ui-monospace, monospace'

/** 示波器风格的深色底，颜色写死：与 EyeFig 保持一致 */
const BG = '#0d1117'
const GRID = '#2a313c'
const BOX = '#161b22'
const EDGE = '#3d4756'
const LABEL = '#8b949e'
const TEXT = '#c9d1d9'
const MEAS = '#58a6ff'
const EXT = '#e8c45a'
const TARGET = '#f85149'
const NOW = '#3fb950'

const xOf = (phase: number) => PAD_L + phase * PLOT_W
const yOf = (log: number) => PAD_T + (Math.min(0, Math.max(LOG_MIN, log)) / LOG_MIN) * PLOT_H

/** 浴盆曲线：实测点（实心 = 有错误，空心 = 0 错误画在上限处）+ 双狄拉克外推虚线 */
export function BathtubFig({ analysis, phase }: { analysis: InterfaceAnalysis; phase: number }) {
  const { t } = useLocale()
  const curve = useMemo(() => {
    const points: string[] = []
    for (let i = 0; i <= 200; i += 1) {
      const p = i / 200
      const ber = extrapolatedBer(p, analysis.djUi, analysis.sigmaUi)
      const log = ber > 0 ? Math.log10(ber) : LOG_MIN
      points.push(`${xOf(p).toFixed(1)},${yOf(log).toFixed(1)}`)
    }
    return points.join(' ')
  }, [analysis.djUi, analysis.sigmaUi])

  const nowX = xOf(phase)
  const labelLeft = phase > 0.7
  const bottom = PAD_T + PLOT_H

  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${CW} ${CH}`} className="hs-eye" role="img" aria-label={t(FIG.bathAria)}>
        <rect x={0} y={0} width={CW} height={CH} fill={BG} />
        {Y_TICKS.map((log) => (
          <g key={log}>
            <line x1={PAD_L} x2={PAD_L + PLOT_W} y1={yOf(log)} y2={yOf(log)} stroke={GRID} strokeWidth={1} />
            <text x={PAD_L - 6} y={yOf(log)} fill={LABEL} fontSize={11} fontFamily={MONO} textAnchor="end" dominantBaseline="middle">
              {`1e${log}`}
            </text>
          </g>
        ))}
        {X_TICKS.map((p) => (
          <g key={p}>
            <line x1={xOf(p)} x2={xOf(p)} y1={PAD_T} y2={bottom} stroke={GRID} strokeWidth={1} />
            <text x={xOf(p)} y={bottom + 13} fill={LABEL} fontSize={11} fontFamily={MONO} textAnchor="middle">
              {`${p}`}
            </text>
          </g>
        ))}
        <line x1={PAD_L} x2={PAD_L + PLOT_W} y1={yOf(TARGET_LOG)} y2={yOf(TARGET_LOG)} stroke={TARGET} strokeWidth={1} strokeDasharray="3 3" />
        <text x={xOf(0.5)} y={yOf(TARGET_LOG) - 5} fill={TARGET} fontSize={11} textAnchor="middle">
          {t(S.targetLine)}
        </text>
        <polyline points={curve} fill="none" stroke={EXT} strokeWidth={1.5} strokeDasharray="5 4" />
        {analysis.sweep.map((point) => {
          if (point.errors > 0) {
            return <circle key={point.phase} cx={xOf(point.phase)} cy={yOf(Math.log10(point.errors / BITS))} r={2.6} fill={MEAS} />
          }
          return <circle key={point.phase} cx={xOf(point.phase)} cy={yOf(Math.log10(analysis.floor))} r={3} fill="none" stroke={LABEL} strokeWidth={1.2} />
        })}
        <line x1={nowX} x2={nowX} y1={PAD_T} y2={bottom} stroke={NOW} strokeWidth={1.5} />
        <text x={labelLeft ? nowX - 6 : nowX + 6} y={PAD_T + 14} fill={NOW} fontSize={11} textAnchor={labelLeft ? 'end' : 'start'}>
          {t(S.markNow)}
        </text>
        <text x={PAD_L + PLOT_W / 2} y={CH - 6} fill={TEXT} fontSize={11} textAnchor="middle">
          {t(S.axisPhase)}
        </text>
        <text x={12} y={PAD_T + PLOT_H / 2} fill={TEXT} fontSize={11} textAnchor="middle" transform={`rotate(-90 12 ${PAD_T + PLOT_H / 2})`}>
          {'log10(BER)'}
        </text>
      </svg>
      <figcaption>
        <p>{t(FIG.bathCap)}</p>
        <p>{t(S.curveMeasured)}</p>
        <p>{t(S.curveExt)}</p>
      </figcaption>
    </figure>
  )
}

const PW = 480
const PH = 196

/** 测试路径示意：外部链路（经夹具与比较器采样引脚）与 Loopback（芯片内部 Tx 接回 Rx） */
export function PathFig({ path }: { path: InterfacePath }) {
  const { t } = useLocale()
  const loop = path === 'loop'
  return (
    <figure className="term-fig">
      <svg viewBox={`0 0 ${PW} ${PH}`} className="hs-eye" role="img" aria-label={t(FIG.pathAria)}>
        <rect x={0} y={0} width={PW} height={PH} fill={BG} />
        <rect x={4} y={24} width={160} height={146} rx={8} fill={BOX} stroke={EDGE} />
        <text x={84} y={50} fill={TEXT} fontSize={13} fontWeight={600} textAnchor="middle">
          {t(FIG.ateTitle)}
        </text>
        <text x={84} y={74} fill={LABEL} fontSize={11} textAnchor="middle">
          {t(loop ? FIG.readCount : FIG.comparator)}
        </text>

        <rect x={316} y={24} width={160} height={146} rx={8} fill={BOX} stroke={EDGE} />
        <text x={396} y={50} fill={TEXT} fontSize={13} fontWeight={600} textAnchor="middle">
          {t(FIG.dutTitle)}
        </text>
        <rect x={332} y={72} width={64} height={36} rx={4} fill="none" stroke={LABEL} />
        <text x={364} y={94} fill={TEXT} fontSize={12} textAnchor="middle">
          Tx
        </text>
        <rect x={332} y={112} width={64} height={36} rx={4} fill="none" stroke={LABEL} />
        <text x={364} y={134} fill={TEXT} fontSize={12} textAnchor="middle">
          Rx
        </text>

        <g opacity={loop ? 0.3 : 1}>
          <line x1={164} x2={332} y1={90} y2={90} stroke={MEAS} strokeWidth={2} />
          <line x1={164} x2={332} y1={130} y2={130} stroke={MEAS} strokeWidth={2} />
          <text x={240} y={82} fill={LABEL} fontSize={11} textAnchor="middle">
            {t(FIG.fixture)}
          </text>
          {loop ? null : (
            <text x={240} y={148} fill={LABEL} fontSize={11} textAnchor="middle">
              {t(FIG.addedJitter)}
            </text>
          )}
        </g>

        <g opacity={loop ? 1 : 0.3}>
          <path d="M396 90 C 446 90, 446 130, 396 130" fill="none" stroke={NOW} strokeWidth={2} />
          <text x={440} y={114} fill={NOW} fontSize={11}>
            {t(FIG.loopLabel)}
          </text>
          <line x1={164} x2={316} y1={158} y2={158} stroke={NOW} strokeWidth={2} />
          <text x={240} y={152} fill={NOW} fontSize={11} textAnchor="middle">
            {t(FIG.errLine)}
          </text>
        </g>

        <text x={396} y={164} fill={loop ? NOW : LABEL} fontSize={11} textAnchor="middle" opacity={loop ? 1 : 0.5}>
          {t(FIG.checker)}
        </text>
      </svg>
      <figcaption>{t(FIG.pathCap)}</figcaption>
    </figure>
  )
}
