import { useLocale } from '../../i18n/LocaleContext'
import { Hit } from '../prep/common'
import { LED_LABEL, NEED_LABEL } from './data/mosSwitchCases'
import { BOARD, CASES, bootCapVoltage, nHighGateNeed, switchState, type SwitchCase } from './data/mosSwitchModel'
import { Gnd, Led, MosSym, T } from './SwitchFigs'

const fmtNode = (v: number) => (v < 0.1 ? `${(v * 1000).toFixed(2)} mV` : `${v.toFixed(2)} V`)

function Resistor({ x, y, h = 40 }: { x: number; y: number; h?: number }) {
  return <rect x={x - 8} y={y} width="16" height={h} fill="var(--card)" stroke="var(--text)" strokeWidth="2" />
}

export function LedFig({ id, high, onToggle }: { id: SwitchCase; high: boolean; onToggle: () => void }) {
  const { t } = useLocale()
  const c = CASES[id]
  const st = switchState(id, high)
  const highSide = id !== 'nLow'
  const kind = id === 'pHigh' ? 'p' : 'n'
  const cy = highSide ? 100 : 205
  const gateColor = st.vg > 0.05 ? 'var(--blue)' : 'var(--dim)'
  const path = st.on ? 'var(--gold)' : 'var(--line-3)'
  const gateY = cy
  const ledY = highSide ? 165 : 135
  const rTop = highSide ? 190 : 62
  const nodeY = highSide ? 148 : 166
  const nodeText = highSide ? `${t(LED_LABEL.vnodeHigh)} = ${fmtNode(st.vNode)}` : `${t(LED_LABEL.vds)} = ${fmtNode(st.vds)}`
  const stateColor = st.on ? 'var(--green)' : 'var(--dim)'
  const aria = `${t(LED_LABEL.hint)}: ${t(high ? LED_LABEL.high : LED_LABEL.low)}`
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 300" className="term-fig__svg" role="img" aria-label={t(LED_LABEL.cap)}>
        <rect width="760" height="300" rx="10" fill="var(--well)" />
        <rect x="20" y="100" width="140" height="100" rx="8" fill="var(--card)" stroke="var(--line)" />
        <T x={90} y={120} color="var(--text)">
          {t(LED_LABEL.gpio)}
        </T>
        <Hit label={aria} active={high} onPick={onToggle}>
          <rect x="50" y="132" width="80" height="30" rx="15" fill={high ? 'var(--gold)' : 'var(--line-3)'} fillOpacity="0.5" stroke="var(--text-2)" strokeWidth="1.5" />
          <circle cx={high ? 115 : 65} cy="147" r="11" fill="var(--text)" />
        </Hit>
        <T x={90} y={188} size={12} bold color="var(--text)" mono>
          {`${t(high ? LED_LABEL.high : LED_LABEL.low)} = ${st.vg.toFixed(1)} V`}
        </T>
        <T x={90} y={222} size={10} color="var(--muted)">
          {t(LED_LABEL.hint)}
        </T>
        <path d={`M160 150 H330 V${gateY} H368`} fill="none" stroke={gateColor} strokeWidth="2.2" />
        <circle cx="160" cy="150" r="3.5" fill="var(--text)" />
        <T x={245} y={142} size={11} color={gateColor === 'var(--dim)' ? 'var(--muted)' : 'var(--blue)'} mono>
          {`Vg = ${st.vg.toFixed(1)} V`}
        </T>
        <path d="M380 40 H460" stroke="var(--text-2)" strokeWidth="2.5" />
        <T x={374} y={44} anchor="end" color="var(--text)" bold>
          {`+${c.vdd} V`}
        </T>
        <g fill="none" strokeWidth="2.4" strokeLinecap="round">
          {highSide ? (
            <>
              <path d="M420 40 V70" stroke={path} />
              <path d="M420 130 V156" stroke={path} />
              <path d="M420 174 V190" stroke={path} />
              <path d="M420 230 V262" stroke={path} />
            </>
          ) : (
            <>
              <path d="M420 40 V62" stroke={path} />
              <path d="M420 102 V126" stroke={path} />
              <path d="M420 144 V175" stroke={path} />
              <path d="M420 235 V250" stroke={path} />
            </>
          )}
        </g>
        <Resistor x={420} y={rTop} />
        <Led x={420} y={ledY} lit={st.lit} />
        <MosSym kind={kind} x={398} y={cy} flip={id === 'pHigh'} color={st.on ? 'var(--gold)' : 'var(--text)'} />
        <Gnd x={420} y={highSide ? 262 : 250} />
        <T x={360} y={highSide ? cy - 12 : cy + 28} anchor="end" size={11} color="var(--text)" mono>
          {`Vgs = ${st.vgs.toFixed(2)} V`}
        </T>
        <T x={440} y={rTop + 24} anchor="start" size={11} color="var(--text)" mono>
          {`${c.rSeries} Ω`}
        </T>
        <T x={456} y={ledY + 4} anchor="start" size={10} color="var(--muted)">
          {t(LED_LABEL.ledName)}
        </T>
        <T x={432} y={nodeY} anchor="start" size={10} color="var(--muted)" mono>
          {nodeText}
        </T>
        <T x={650} y={118} size={20} bold color={stateColor}>
          {t(st.on ? LED_LABEL.on : LED_LABEL.off)}
        </T>
        <T x={650} y={146} size={13} color="var(--text)" mono>
          {`I = ${(st.i * 1000).toFixed(2)} mA`}
        </T>
        <T x={650} y={172} size={13} color={st.lit ? 'var(--gold)' : 'var(--muted)'}>
          {`${t(LED_LABEL.led)}: ${t(st.lit ? LED_LABEL.lit : LED_LABEL.dark)}`}
        </T>
        {st.fail ? (
          <T x={650} y={202} size={16} bold color="var(--red)">
            {t(LED_LABEL.fail)}
          </T>
        ) : null}
      </svg>
      <figcaption>{t(LED_LABEL.cap)}</figcaption>
    </figure>
  )
}

const NX0 = 270
const NX1 = 690
const V_MAX = 40
const nx = (v: number) => NX0 + (v / V_MAX) * (NX1 - NX0)

export function NeedFig({ vload, vgsFull }: { vload: number; vgsFull: number }) {
  const { t } = useLocale()
  const start = vload + BOARD.vth
  const need = nHighGateNeed(vload, vgsFull)
  const rows: Array<{ label: typeof NEED_LABEL.gpio; v: number; kind: 'start' | 'need' | 'full' }> = [
    { label: NEED_LABEL.gpio, v: CASES.nHigh.vHigh, kind: 'start' },
    { label: NEED_LABEL.tied, v: vload, kind: 'start' },
    { label: NEED_LABEL.need, v: need, kind: 'need' },
    { label: NEED_LABEL.boot, v: vload + bootCapVoltage(), kind: 'full' },
  ]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 256" className="term-fig__svg" role="img" aria-label={t(NEED_LABEL.cap)}>
        <rect width="760" height="256" rx="10" fill="var(--well)" />
        {[0, 10, 20, 30, 40].map((v) => (
          <g key={v}>
            <line x1={nx(v)} y1="34" x2={nx(v)} y2="214" stroke="var(--line-3)" strokeOpacity="0.5" />
            <T x={nx(v)} y={232} size={10} color="var(--dim)" mono>
              {`${v}`}
            </T>
          </g>
        ))}
        <T x={NX1} y={248} anchor="end" size={10} color="var(--muted)">
          {t(NEED_LABEL.vg)}
        </T>
        <line x1={nx(start)} y1="28" x2={nx(start)} y2="214" stroke="var(--gold)" strokeWidth="2" strokeDasharray="6 4" />
        <T x={nx(start)} y={20} size={11} color="var(--gold)" mono>
          {`Vload + Vth = ${start.toFixed(1)} V`}
        </T>
        {rows.map((row, k) => {
          const y = 44 + k * 44
          const ok = row.kind === 'start' ? row.v > start : row.v >= need
          const color = row.kind === 'need' ? 'var(--blue)' : ok ? 'var(--green)' : 'var(--red)'
          const verdict = row.kind === 'need' ? '' : ` · ${t(ok ? NEED_LABEL.enough : NEED_LABEL.short)}`
          const value = `${row.v.toFixed(1)} V${verdict}`
          return (
            <g key={k}>
              <T x={20} y={y + 16} anchor="start" size={11} color="var(--text)">
                {t(row.label)}
              </T>
              <rect x={NX0} y={y} width={Math.max(nx(row.v) - NX0, 1)} height="24" rx="3" fill={color} fillOpacity="0.75" />
              <rect x={nx(row.v) + 4} y={y + 3} width={value.length * 6.8 + 8} height="18" rx="3" fill="var(--well)" />
              <T x={nx(row.v) + 8} y={y + 16} anchor="start" size={11} color={color} mono>
                {value}
              </T>
            </g>
          )
        })}
      </svg>
      <figcaption>{t(NEED_LABEL.cap)}</figcaption>
    </figure>
  )
}
