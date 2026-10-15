import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { keyPick } from '../prep/common'
import { T } from './GatesNet'
import { rowInputs, type Level } from './gatesModel'
import { VDD, VTN, VTP } from './model'
import '../prep/prep.css'

type TruthProps = {
  names: string[]
  out: string
  yOf: (row: number) => Level
  active: number
  onPick: (row: number) => void
  extra?: { head: string; cell: (row: number) => string; bad?: (row: number) => boolean }
}

/** 真值表：当前行高亮，点行就是改输入 */
export function TruthTable({ names, out, yOf, active, onPick, extra }: TruthProps) {
  const rows = 2 ** names.length
  return (
    <div className="prep-table-wrap">
      <table className="prep-truth">
        <thead>
          <tr>
            {names.map((name) => (
              <th key={name}>{name}</th>
            ))}
            <th>{out}</th>
            {extra ? <th>{extra.head}</th> : null}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }, (_, i) => {
            const bits = rowInputs(names, i)
            return (
              <tr key={i} className={i === active ? 'is-active' : undefined} tabIndex={0} onClick={() => onPick(i)} onKeyDown={keyPick(() => onPick(i))}>
                {names.map((name) => (
                  <td key={name}>{bits[name]}</td>
                ))}
                <td>{yOf(i)}</td>
                {extra ? <td style={extra.bad?.(i) ? { color: 'var(--red)', fontWeight: 700 } : undefined}>{extra.cell(i)}</td> : null}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

const WHY_CAP = loc(
  '把输出推向某一端时，四种接法最后能到的电压（教学模型：VDD 3.3 V，Vtn 0.7 V，Vtp −0.7 V）。PMOS 上拉、NMOS 下拉能到满幅；NMOS 上拉卡在 VDD − Vtn（Vgs 降到 Vtn 就关断），PMOS 下拉卡在 |Vtp|（Vsg 降到 |Vtp| 就关断）。',
  'The voltage each of the four arrangements can finally reach when pushing the output toward one rail (teaching model: VDD 3.3 V, Vtn 0.7 V, Vtp −0.7 V). PMOS pull-up and NMOS pull-down reach the full rail; an NMOS pull-up stalls at VDD − Vtn (it turns off when Vgs falls to Vtn) and a PMOS pull-down stalls at |Vtp| (it turns off when Vsg falls to |Vtp|).',
)

const WHY_BARS = [
  { cx: 95, v: VDD, good: true, name: loc('PMOS 上拉', 'PMOS pull-up'), verdict: loc('传好 1', 'good 1') },
  { cx: 205, v: VDD - VTN, good: false, name: loc('NMOS 上拉', 'NMOS pull-up'), verdict: loc('只到 VDD−Vtn', 'stops at VDD−Vtn') },
  { cx: 345, v: 0, good: true, name: loc('NMOS 下拉', 'NMOS pull-down'), verdict: loc('传好 0', 'good 0') },
  { cx: 455, v: -VTP, good: false, name: loc('PMOS 下拉', 'PMOS pull-down'), verdict: loc('只到 |Vtp|', 'stops at |Vtp|') },
]

const Y0 = 196
const SCALE = 44
const yv = (v: number) => Y0 - v * SCALE

export function WhyInvFig() {
  const { t } = useLocale()
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 540 250" className="term-fig__svg" role="img" aria-label={t(WHY_CAP)}>
        <rect width="540" height="250" rx="10" fill="var(--well)" />
        <T x={150} y={20} size={12} color="var(--text)" bold>
          {t(loc('上拉：把 OUT 推向 VDD', 'Pull-up: push OUT toward VDD'))}
        </T>
        <T x={400} y={20} size={12} color="var(--text)" bold>
          {t(loc('下拉：把 OUT 推向 GND', 'Pull-down: push OUT toward GND'))}
        </T>
        <line x1={40} y1={Y0} x2={510} y2={Y0} stroke="var(--line-2)" />
        <line x1={40} y1={yv(VDD)} x2={270} y2={yv(VDD)} stroke="var(--muted)" strokeDasharray="5 4" />
        <T x={34} y={yv(VDD) + 4} anchor="end" size={10} color="var(--dim)" mono>
          3.3
        </T>
        <T x={34} y={Y0 + 4} anchor="end" size={10} color="var(--dim)" mono>
          0
        </T>
        {WHY_BARS.map((bar) => {
          const col = bar.good ? 'var(--green)' : 'var(--red)'
          return (
            <g key={bar.cx}>
              <rect x={bar.cx - 35} y={yv(bar.v)} width={70} height={Math.max(bar.v * SCALE, 1)} fill={col} fillOpacity={0.55} stroke={col} strokeWidth={1.5} />
              <T x={bar.cx} y={yv(bar.v) - 6} size={12} color={col} bold mono>
                {`${bar.v.toFixed(2)} V`}
              </T>
              <T x={bar.cx} y={Y0 + 18} size={11} color="var(--text)">
                {t(bar.name)}
              </T>
              <T x={bar.cx} y={Y0 + 34} size={10} color={col}>
                {t(bar.verdict)}
              </T>
            </g>
          )
        })}
      </svg>
      <figcaption>{t(WHY_CAP)}</figcaption>
    </figure>
  )
}
