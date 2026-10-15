import { useLocale } from '../../i18n/LocaleContext'
import { BETA, CMP_FIG, IB } from './data/mosIntroQuiz'
import { MosSymbol, T } from './IntroFigs'

const INK = 'var(--text)'
const GOLD = 'var(--gold)'

/** NPN：发射极箭头背离基极；局部坐标原点在基极板中点 */
function NpnSymbol() {
  return (
    <g fill="none" stroke={INK} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-90 0 H0 M0 -24 V24" />
      <path d="M0 -10 L24 -26 V-46" />
      <path d="M0 10 L24 26 V46" />
      <polygon points="21,24 10.5,21.8 14.9,15.2" fill={INK} stroke="none" />
    </g>
  )
}

export function CmpFig() {
  const { t } = useLocale()
  const icMa = (BETA * IB * 1e3).toFixed(2)
  const ibUa = (IB * 1e6).toFixed(0)
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 290" className="term-fig__svg" role="img" aria-label={`${t(CMP_FIG.bjtTitle)} / ${t(CMP_FIG.mosTitle)}`}>
        <rect width="760" height="290" rx="10" fill="var(--well)" />
        <rect x="10" y="10" width="360" height="270" rx="8" fill="var(--card)" stroke="var(--line)" />
        <rect x="390" y="10" width="360" height="270" rx="8" fill="var(--card)" stroke="var(--line)" />
        <T x={26} y={32} anchor="start" size={12} bold>
          {t(CMP_FIG.bjtTitle)}
        </T>
        <T x={406} y={32} anchor="start" size={12} bold>
          {t(CMP_FIG.mosTitle)}
        </T>

        {/* 左：BJT，基极电流一直在流 */}
        <g transform="translate(250 140)">
          <NpnSymbol />
        </g>
        <path d="M160 140 H238" stroke={GOLD} strokeWidth="2.5" />
        <polygon points="248,140 238,136 238,144" fill={GOLD} />
        <T x={40} y={128} anchor="start" size={12} bold color={GOLD}>
          {`IB = ${ibUa} µA`}
        </T>
        <T x={288} y={118} anchor="start" size={12} color={INK}>
          {'IC = β·IB'}
        </T>
        <T x={288} y={136} anchor="start" size={12} bold color={GOLD}>
          {`= ${icMa} mA`}
        </T>
        <T x={274} y={88} size={13} bold color={INK}>
          C
        </T>
        <T x={274} y={206} size={13} bold color={INK}>
          E
        </T>
        <T x={166} y={158} anchor="start" size={13} bold color={INK}>
          B
        </T>
        <T x={190} y={262} size={12} bold color={GOLD}>
          {t(CMP_FIG.baseDc)}
        </T>

        {/* 右：MOS，栅极直流不取电流，但有栅电容 Cgs（G–S 之间） */}
        <g transform="translate(540 100)">
          <MosSymbol type="n" style="three" mode="enh" labels={false} />
        </g>
        <path d="M410 160 H540" stroke={INK} strokeWidth="2.5" />
        <path d="M500 160 V188 M490 188 H510 M490 196 H510 M500 196 V220 H620" stroke={INK} strokeWidth="2" fill="none" />
        <circle cx="500" cy="160" r="3" fill={INK} />
        <T x={410} y={148} anchor="start" size={12} bold color={GOLD}>
          {t(CMP_FIG.gateDc)}
        </T>
        <T x={484} y={196} anchor="end" size={11} color={INK}>
          Cgs
        </T>
        <T x={534} y={154} anchor="end" size={13} bold color={INK}>
          G
        </T>
        <T x={620} y={92} size={13} bold color={INK}>
          D
        </T>
        <T x={632} y={226} anchor="start" size={13} bold color={INK}>
          S
        </T>
        <T x={570} y={262} size={12} bold color={GOLD}>
          {t(CMP_FIG.gateCap)}
        </T>
      </svg>
      <figcaption>{t(CMP_FIG.illustr)}</figcaption>
    </figure>
  )
}
