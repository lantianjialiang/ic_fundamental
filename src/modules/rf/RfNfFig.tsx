import { useLocale } from '../../i18n/LocaleContext'
import { type LText } from '../../i18n/locale'
import { FIG, S } from './rfNfData'
import { type NfAnalysis, type StageKey } from './rfNfModel'

/** 示波器风格的深色底，颜色写死在 SVG 里 */
const BG = '#0d1117'
const BOX = '#161b22'
const EDGE = '#3d4756'
const TEXT = '#c9d1d9'
const MUTED = '#8b949e'
const GOLD = '#e8c45a'
const BLUE = '#58a6ff'

const STAGE_NAME: Record<StageKey, LText> = {
  lna: S.stageLna,
  mixer: S.stageMixer,
  if: S.stageIf,
}

/** 三级链路框图：每一框写出名称、增益和噪声系数，框间箭头表示信号方向 */
export function ChainFig({ analysis }: { analysis: NfAnalysis }) {
  const { t } = useLocale()
  return (
    <figure className="term-fig rf-nf-fig">
      <svg viewBox="0 0 528 100" role="img" aria-label={t(FIG.chainAria)} className="rf-svg">
        <rect x={0} y={0} width={528} height={100} rx={10} fill={BG} />
        {analysis.stages.map((stage, index) => {
          const x = index * 194
          const hasNext = index < analysis.stages.length - 1
          return (
            <g key={stage.key}>
              <rect x={x + 1} y={12} width={138} height={76} rx={8} fill={BOX} stroke={EDGE} />
              <text x={x + 70} y={34} textAnchor="middle" fill={TEXT} fontSize={13}>
                {t(STAGE_NAME[stage.key])}
              </text>
              <text x={x + 70} y={58} textAnchor="middle" fill={BLUE} fontSize={12}>
                {`G = ${stage.gainDb.toFixed(0)} dB`}
              </text>
              <text x={x + 70} y={76} textAnchor="middle" fill={GOLD} fontSize={12}>
                {`NF = ${stage.nfDb.toFixed(1)} dB`}
              </text>
              {hasNext ? (
                <g>
                  <path d={`M ${x + 140} 50 H ${x + 186}`} stroke={MUTED} strokeWidth={2} fill="none" />
                  <polygon points={`${x + 194},50 ${x + 186},45 ${x + 186},55`} fill={MUTED} />
                </g>
              ) : null}
            </g>
          )
        })}
      </svg>
      <figcaption>{t(FIG.chainCap)}</figcaption>
    </figure>
  )
}

const BAR_X = 130
const BAR_W = 280

/** 条形图：每一级占超出噪声（F − 1）的份额，LNA 用金色 */
export function ShareFig({ analysis }: { analysis: NfAnalysis }) {
  const { t } = useLocale()
  return (
    <figure className="term-fig rf-nf-fig">
      <svg viewBox="0 0 480 150" role="img" aria-label={t(FIG.barAria)} className="rf-svg">
        <rect x={0} y={0} width={480} height={150} rx={10} fill={BG} />
        <text x={12} y={22} fill={TEXT} fontSize={12}>
          {t(FIG.barTitle)}
        </text>
        {analysis.stages.map((stage, index) => {
          const y = 42 + index * 34
          const width = Math.min(Math.max(stage.share, 0), 1) * BAR_W
          return (
            <g key={stage.key}>
              <text x={12} y={y + 13} fill={MUTED} fontSize={12}>
                {t(STAGE_NAME[stage.key])}
              </text>
              <rect x={BAR_X} y={y} width={BAR_W} height={18} rx={4} fill={BOX} />
              <rect x={BAR_X} y={y} width={width} height={18} rx={4} fill={index === 0 ? GOLD : BLUE} />
              <text x={BAR_X + BAR_W + 8} y={y + 13} fill={TEXT} fontSize={12}>
                {`${(stage.share * 100).toFixed(0)}%`}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption>{t(FIG.barCap)}</figcaption>
    </figure>
  )
}
