import { useState } from 'react'
import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { Readout, Seg } from '../fund/parts'
import { dbToRatio } from './core/units'
import { FIG, S } from './rfNfData'
import { NOISE_BW_MHZ, type NfAnalysis, type StageKey } from './rfNfModel'

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

const SOURCES = [
  { id: 'cold', label: loc('冷态噪声源', 'Cold source') },
  { id: 'hot', label: loc('热态噪声源', 'Hot source') },
] as const

export function YFactorFig({ analysis, enr }: { analysis: NfAnalysis; enr: number }) {
  const { t } = useLocale()
  const [source, setSource] = useState<(typeof SOURCES)[number]['id']>('cold')
  const hot = source === 'hot'
  const { nHotDbm, nColdDbm, y, nfFromYDb } = analysis
  const reading = hot ? nHotDbm : nColdDbm
  const delta = nHotDbm - nColdDbm
  const enrLinear = dbToRatio(enr)
  const noiseFactor = enrLinear / (y - 1)
  const color = hot ? GOLD : BLUE
  return (
    <figure className="term-fig rf-nf-fig">
      <Seg options={SOURCES} value={source} onChange={setSource} />
      <svg viewBox="0 0 410 110" role="img" className="rf-svg"
        aria-label={t(loc('切换噪声源状态，测量同一接收机的输出', 'Switch source states and measure the same receiver output'))}>
        <rect width="410" height="110" rx="10" fill={BG} />
        <path d="M121 55 H150 M257 55 H285" stroke={color} strokeWidth="3" />
        <path d="M143 50 L150 55 L143 60 M278 50 L285 55 L278 60" fill="none" stroke={color} strokeWidth="2" />
        <rect x="10" y="20" width="111" height="70" rx="7" fill={BOX} stroke={color} />
        <rect x="150" y="20" width="107" height="70" rx="7" fill={BOX} stroke={EDGE} />
        <rect x="285" y="20" width="115" height="70" rx="7" fill={BOX} stroke={EDGE} />
        <g textAnchor="middle" fontSize="15" fill={TEXT}>
          <text x="65" y="46">{t(SOURCES[hot ? 1 : 0].label)}</text>
          <text x="203" y="46">{t(loc('被测接收机', 'Receiver'))}</text>
          <text x="343" y="46">{t(loc('噪声功率计', 'Power meter'))}</text>
        </g>
        <g textAnchor="middle" fontSize="14" fontFamily="var(--mono)">
          <text x="65" y="71" fill={color}>{hot ? `ENR ${enr} dB` : `T₀`}</text>
          <text x="203" y="71" fill={MUTED}>LNA → MIX → IF</text>
          <text x="343" y="71" fill={color} data-y-reading={source}>{reading.toFixed(2)} dBm</text>
        </g>
      </svg>
      <figcaption>
        {t(loc(`只切换噪声源，接收链路与 ${NOISE_BW_MHZ} MHz 测量带宽始终相同。冷态输入对应参考噪声温度 T₀，热态增加标定的噪声功率。`,
          `Only the source switches. The receiver and ${NOISE_BW_MHZ} MHz measurement bandwidth stay fixed. The cold source is at reference temperature T₀. The hot source adds calibrated noise power.`))}
      </figcaption>
      <Readout items={[
        { label: loc('测热、冷读数之差', 'Subtract hot and cold readings'), value: `${nHotDbm.toFixed(2)} − (${nColdDbm.toFixed(2)}) ≈ ${delta.toFixed(2)} dB` },
        { label: loc('把 dB 差换成线性功率比', 'Convert the dB difference to a power ratio'), value: `Y = 10^(${delta.toFixed(2)} / 10) ≈ ${y.toFixed(3)}` },
        { label: loc('用线性 ENR 和 Y 求噪声因子', 'Find the noise factor from linear ENR and Y'), value: `F = ENR / (Y − 1) ≈ ${enrLinear.toFixed(3)} / (${y.toFixed(3)} − 1) ≈ ${noiseFactor.toFixed(3)}` },
        { label: loc('把噪声因子换成 dB', 'Convert the noise factor to dB'), value: `NF = 10 log₁₀(${noiseFactor.toFixed(3)}) ≈ ${nfFromYDb.toFixed(2)} dB` },
      ]} />
    </figure>
  )
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
