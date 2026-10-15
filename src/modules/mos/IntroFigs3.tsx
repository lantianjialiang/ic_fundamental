import { useLocale } from '../../i18n/LocaleContext'
import { S } from './data/mosIntro'
import { SW_FIG } from './data/mosIntroFig'
import { MosSymbol, T } from './IntroFigs'
import { nId, VDD, VTN } from './model'
import './mosIntro.css'

/** 负载电阻 Ω（示意参数） */
export const RL = 1000
const IMAX = VDD / RL

/** 解 Id(Vgs, Vds)·RL + Vds = VDD：左边随 Vds 单调递增，二分即可 */
export function solveSwitch(vgs: number) {
  let lo = 0
  let hi = VDD
  for (let i = 0; i < 50; i += 1) {
    const mid = (lo + hi) / 2
    if (nId(vgs, mid) * RL + mid > VDD) {
      hi = mid
    } else {
      lo = mid
    }
  }
  const vds = (lo + hi) / 2
  return { vds, id: (VDD - vds) / RL, on: vgs > VTN }
}

export const fmtMa = (i: number) => `${(i * 1e3).toFixed(2)} mA`

const WIRE = 'var(--text-2)'

function Gnd({ x, y }: { x: number; y: number }) {
  return <path d={`M${x - 14} ${y} H${x + 14} M${x - 9} ${y + 6} H${x + 9} M${x - 4} ${y + 12} H${x + 4}`} stroke={WIRE} strokeWidth="2" fill="none" />
}

function Resistor({ x }: { x: number }) {
  return (
    <g>
      <rect x={x - 8} y={80} width="16" height="44" fill="var(--card)" stroke={WIRE} strokeWidth="2" />
      <T x={x + 16} y={104} anchor="start" size={11}>
        {`RL ${RL / 1000} kΩ`}
      </T>
    </g>
  )
}

function Rail({ x }: { x: number }) {
  return (
    <g>
      <T x={x} y={56} size={12} bold color="var(--text)">
        {`${SW_FIG.rail} ${VDD} V`}
      </T>
      <path d={`M${x - 14} 66 H${x + 14}`} stroke={WIRE} strokeWidth="2.5" />
    </g>
  )
}

export function SwitchFig({ vgs }: { vgs: number }) {
  const { t } = useLocale()
  const { vds, id, on } = solveSwitch(vgs)
  const LX = 190
  const DX = 570
  const flowW = 2 + 3 * (id / IMAX)
  const stateColor = on ? 'var(--green)' : 'var(--red)'
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 320" className="term-fig__svg" role="img" aria-label={t(SW_FIG.cap)}>
        <rect width="760" height="320" rx="10" fill="var(--well)" />
        <rect x="10" y="10" width="360" height="300" rx="8" fill="var(--card)" stroke="var(--line)" />
        <rect x="390" y="10" width="360" height="300" rx="8" fill="var(--card)" stroke="var(--line)" />
        <T x={26} y={32} anchor="start" size={12} bold>
          {t(SW_FIG.analogy)}
        </T>
        <T x={406} y={32} anchor="start" size={12} bold>
          {t(SW_FIG.real)}
        </T>

        {/* 左：理想开关 */}
        <Rail x={LX} />
        <path d={`M${LX} 66 V80 M${LX} 124 V150 M${LX} 220 V266`} stroke={WIRE} strokeWidth="2" fill="none" />
        {on ? <path className="mosIntro-flow" d={`M${LX} 66 V266`} stroke="var(--green)" strokeWidth={flowW} fill="none" /> : null}
        <Resistor x={LX} />
        <circle cx={LX} cy="150" r="4" fill={WIRE} />
        <circle cx={LX} cy="220" r="4" fill={WIRE} />
        <line className="mosIntro-blade" x1={LX} y1="150" x2={LX} y2="220" stroke="var(--text)" strokeWidth="3.5" strokeLinecap="round" style={{ transform: `rotate(${on ? 0 : 30}deg)`, transformOrigin: `${LX}px 150px` }} />
        <Gnd x={LX} y={266} />
        <T x={LX + 14} y={136} anchor="start" size={11} color="var(--text)">
          {`${SW_FIG.vout} ${(on ? 0 : VDD).toFixed(2)} V`}
        </T>
        <T x={LX + 30} y={190} anchor="start" size={13} bold color={stateColor}>
          {t(on ? SW_FIG.closed : SW_FIG.open)}
        </T>
        <T x={LX + 14} y={246} anchor="start" size={11} color="var(--text)">
          {`Id ${fmtMa(on ? IMAX : 0)}`}
        </T>
        <T x={30} y={176} anchor="start" size={11} color="var(--text)">
          {`Vgs ${vgs.toFixed(1)} V`}
        </T>
        <T x={30} y={194} anchor="start" size={11} color="var(--muted)">
          {`Vth ${VTN} V`}
        </T>

        {/* 右：真实 NMOS，D 在 (DX,130)，S 在 (DX,250) */}
        <Rail x={DX} />
        <path d={`M${DX} 66 V80 M${DX} 124 V130 M${DX} 250 V266 M410 190 H490`} stroke={WIRE} strokeWidth="2" fill="none" />
        {on ? <path className="mosIntro-flow" d={`M${DX} 66 V166 H540 M540 214 H${DX} V266`} stroke="var(--green)" strokeWidth={flowW} fill="none" /> : null}
        <Resistor x={DX} />
        <g transform="translate(490 130)">
          <MosSymbol type="n" style="three" mode="enh" chanColor={on ? 'var(--green)' : 'var(--text)'} labels={false} />
        </g>
        <Gnd x={DX} y={266} />
        <T x={484} y={184} anchor="end" size={13} bold color="var(--text)">
          G
        </T>
        <T x={DX + 10} y={152} anchor="start" size={13} bold color="var(--text)">
          D
        </T>
        <T x={DX + 10} y={248} anchor="start" size={13} bold color="var(--text)">
          S
        </T>
        <T x={DX + 16} y={124} anchor="start" size={11} color="var(--text)">
          {`${SW_FIG.vout} ${vds.toFixed(2)} V`}
        </T>
        <T x={DX + 16} y={214} anchor="start" size={11} color="var(--text)">
          {`Id ${fmtMa(id)}`}
        </T>
        <T x={400} y={168} anchor="start" size={11} color="var(--text)">
          {`Vgs ${vgs.toFixed(1)} V`}
        </T>
        <T x={400} y={214} anchor="start" size={11} color="var(--muted)">
          {`Vth ${VTN} V`}
        </T>
        <T x={400} y={236} anchor="start" size={13} bold color={stateColor}>
          {t(on ? S.on : S.off)}
        </T>
      </svg>
      <figcaption>{t(SW_FIG.cap)}</figcaption>
    </figure>
  )
}
