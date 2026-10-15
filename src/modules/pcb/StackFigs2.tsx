import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { Hit } from '../prep/common'
import { S } from './data/pcbStack'
import { dielectricKinds, KIND_COLOR, STACKS, VIA_COLOR } from './data/pcbStackModel'
import { DIM, TERMS, type TermId } from './data/pcbStackVia'
import { Callout3 } from './StackFigs'

const L = {
  signalVia: loc('信号过孔', 'Signal via'),
  groundVia: loc('地过孔', 'Ground via'),
  topA: loc('L2 GND 俯视', 'L2 GND, top view'),
  subA: loc('信号过孔：反焊盘', 'Signal via: antipad'),
  subB: loc('地过孔：热焊盘', 'Ground via: thermal relief'),
  pad: loc('焊盘', 'Pad'),
  drill: loc('钻孔', 'Drill'),
  ring: loc('孔环', 'Annular ring'),
  anti: loc('反焊盘', 'Antipad'),
  gap: loc('间隙', 'Gap'),
  spoke: loc('辐条', 'Spokes'),
}

const STACK4 = STACKS[1]
const COUNT = STACK4.layers.length
const LY = [80, 140, 200, 260]
const BX0 = 56
const BX1 = 392
const CU = 6
const PAD_HW = 16
const HOLE_HW = 8
const ANTI_HW = 26
const AX = 120
const BX = 300
const PX = 100 // 俯视图比例：100 px = 1 mm

function planeSegments(layer: number): Array<[number, number]> {
  // 信号过孔 A 穿过 L2、L3 都要避让；地过孔 B 连在 L2（GND）上，只在 L3（PWR）避让
  const gaps: number[] = layer === 2 ? [AX] : layer === 3 ? [AX, BX] : []
  const out: Array<[number, number]> = []
  let cursor = BX0
  for (const g of gaps) {
    out.push([cursor, g - ANTI_HW])
    cursor = g + ANTI_HW
  }
  out.push([cursor, BX1])
  return out
}

function Via({ cx, color }: { cx: number; color: string }) {
  const yTop = LY[0]
  const yBot = LY[COUNT - 1]
  return (
    <g pointerEvents="none">
      <rect x={cx - HOLE_HW} y={yTop - CU / 2} width={HOLE_HW * 2} height={yBot - yTop + CU} fill="var(--well)" />
      <rect x={cx - HOLE_HW - 3} y={yTop} width="3" height={yBot - yTop} fill={color} />
      <rect x={cx + HOLE_HW} y={yTop} width="3" height={yBot - yTop} fill={color} />
      {[0, COUNT - 1].map((i) => (
        <g key={i}>
          <rect x={cx - PAD_HW - 38} y={LY[i] - CU / 2} width="38" height={CU} fill={KIND_COLOR.sig} />
          <rect x={cx + PAD_HW} y={LY[i] - CU / 2} width="38" height={CU} fill={KIND_COLOR.sig} />
          <rect x={cx - PAD_HW} y={LY[i] - CU / 2 - 1} width={PAD_HW - HOLE_HW} height={CU + 2} fill={color} />
          <rect x={cx + HOLE_HW} y={LY[i] - CU / 2 - 1} width={PAD_HW - HOLE_HW} height={CU + 2} fill={color} />
        </g>
      ))}
    </g>
  )
}

function ring(cx: number, cy: number, ro: number, ri: number) {
  const arc = (r: number) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`
  return `${arc(ro)} ${arc(ri)}`
}

type TopProps = { cx: number; thermal: boolean; active: TermId; onPick: (id: TermId) => void; label: (id: TermId) => string }

function TopView({ cx, thermal, active, onPick, label }: TopProps) {
  const cy = 176
  const rDrill = (DIM.drill / 2) * PX
  const rPad = (DIM.pad / 2) * PX
  const rAnti = (DIM.antipad / 2) * PX
  const sw = DIM.spoke * PX
  const on = (id: TermId) => active === id
  const outline = (id: TermId) => (on(id) ? { stroke: 'var(--text)', strokeWidth: 2.5 } : { stroke: 'none' })
  const color = VIA_COLOR.through
  return (
    <g>
      <rect x={cx - 80} y={cy - 80} width="160" height="160" fill={KIND_COLOR.gnd} opacity="0.85" />
      <Hit label={label('antipad')} active={on('antipad')} onPick={() => onPick('antipad')}>
        <circle cx={cx} cy={cy} r={rAnti} fill={on('antipad') ? 'var(--gold-bg)' : 'var(--well)'} stroke={on('antipad') ? 'var(--text)' : 'var(--text-2)'} strokeWidth={on('antipad') ? 2.5 : 1} strokeDasharray={on('antipad') ? undefined : '3 3'} />
      </Hit>
      {thermal ? (
        <Hit label={label('thermal')} active={on('thermal')} onPick={() => onPick('thermal')}>
          {[0, 90, 180, 270].map((deg) => (
            <rect key={deg} x={cx - sw / 2} y={cy - rAnti - 2} width={sw} height={rAnti - rPad + 4} fill={KIND_COLOR.gnd} opacity="0.85" transform={`rotate(${deg} ${cx} ${cy})`} {...outline('thermal')} />
          ))}
        </Hit>
      ) : null}
      <Hit label={label('pad')} active={on('pad')} onPick={() => onPick('pad')}>
        <circle cx={cx} cy={cy} r={rPad} fill={color} {...outline('pad')} />
      </Hit>
      <Hit label={label('ring')} active={on('ring')} onPick={() => onPick('ring')}>
        <path d={ring(cx, cy, rPad, rDrill)} fillRule="evenodd" fill={on('ring') ? 'var(--gold)' : color} {...outline('ring')} />
      </Hit>
      <Hit label={label('drill')} active={on('drill')} onPick={() => onPick('drill')}>
        <circle cx={cx} cy={cy} r={rDrill} fill={on('drill') ? 'var(--gold-bg)' : 'var(--well)'} stroke={on('drill') ? 'var(--text)' : 'var(--text-2)'} strokeWidth={on('drill') ? 2.5 : 1} />
      </Hit>
    </g>
  )
}

export function TermFig({ active, onPick }: { active: TermId; onPick: (id: TermId) => void }) {
  const { t } = useLocale()
  const label = (id: TermId) => t((TERMS.find((x) => x.id === id) ?? TERMS[0]).title)
  const on = (id: TermId) => active === id
  const dk = dielectricKinds(COUNT)
  const mm = (v: number) => `${v.toFixed(2)} mm`
  const ringW = (DIM.pad - DIM.drill) / 2
  const gapW = (DIM.antipad - DIM.pad) / 2
  const rowsA = [
    { c: 'var(--well)', text: `${t(L.drill)} Ø${mm(DIM.drill)}` },
    { c: VIA_COLOR.through, text: `${t(L.pad)} Ø${mm(DIM.pad)}` },
    { c: VIA_COLOR.through, text: `${t(L.ring)} ${mm(ringW)}` },
    { c: 'var(--well)', text: `${t(L.anti)} Ø${mm(DIM.antipad)}` },
  ]
  const rowsB = [
    { c: VIA_COLOR.through, text: `${t(L.pad)} Ø${mm(DIM.pad)}` },
    { c: 'var(--well)', text: `${t(L.gap)} ${mm(gapW)}` },
    { c: KIND_COLOR.gnd, text: `${t(L.spoke)} 4 × ${mm(DIM.spoke)}` },
  ]
  const outlineA = (id: TermId) => (on(id) ? { stroke: 'var(--text)', strokeWidth: 2.5 } : { stroke: 'none' })
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 800 340" className="term-fig__svg" role="group" aria-label={t(S.termCap)}>
        <rect width="800" height="340" rx="10" fill="var(--well)" />
        {dk.map((kind, i) => (
          <rect key={i} x={BX0} y={LY[i]} width={BX1 - BX0} height={LY[i + 1] - LY[i]} fill={kind === 'core' ? '#9fb36a' : '#d1bd72'} opacity="0.3" />
        ))}
        {STACK4.layers.map((kind, i) => {
          if (kind === 'sig') {
            return null
          }
          return planeSegments(i + 1).map(([a, b], k) => <rect key={`${i}-${k}`} x={a} y={LY[i] - CU / 2} width={b - a} height={CU} fill={KIND_COLOR[kind]} />)
        })}
        {STACK4.layers.map((kind, i) => (
          <text key={i} x={BX0 - 6} y={LY[i] + 4} textAnchor="end" fill="var(--text-2)" fontSize="10" fontFamily="var(--mono)">
            {`L${i + 1} ${kind === 'sig' ? 'SIG' : kind === 'gnd' ? 'GND' : 'PWR'}`}
          </text>
        ))}
        <Via cx={AX} color={VIA_COLOR.through} />
        <Via cx={BX} color={VIA_COLOR.through} />
        <text x={AX} y="44" textAnchor="middle" fill="var(--text-2)" fontSize="12" fontWeight="700">
          {t(L.signalVia)}
        </text>
        <text x={BX} y="44" textAnchor="middle" fill="var(--text-2)" fontSize="12" fontWeight="700">
          {t(L.groundVia)}
        </text>
        <Hit label={label('pad')} active={on('pad')} onPick={() => onPick('pad')}>
          <rect x={AX - PAD_HW - 3} y={LY[0] - 7} width={PAD_HW * 2 + 6} height="14" fill="transparent" {...outlineA('pad')} />
        </Hit>
        <Hit label={label('ring')} active={on('ring')} onPick={() => onPick('ring')}>
          <rect x={AX - PAD_HW - 3} y={LY[3] - 7} width={PAD_HW * 2 + 6} height="14" fill="transparent" {...outlineA('ring')} />
        </Hit>
        <Hit label={label('drill')} active={on('drill')} onPick={() => onPick('drill')}>
          <rect x={AX - HOLE_HW} y={LY[0] + 6} width={HOLE_HW * 2} height={LY[1] - LY[0] - 12} fill={on('drill') ? 'var(--gold-bg)' : 'transparent'} {...outlineA('drill')} />
        </Hit>
        <Hit label={label('antipad')} active={on('antipad')} onPick={() => onPick('antipad')}>
          <rect x={AX - ANTI_HW} y={LY[1] - 7} width={ANTI_HW * 2} height="14" fill={on('antipad') ? 'var(--gold-bg)' : 'transparent'} {...outlineA('antipad')} />
        </Hit>
        <Hit label={label('thermal')} active={on('thermal')} onPick={() => onPick('thermal')}>
          <rect x={BX - ANTI_HW} y={LY[1] - 7} width={ANTI_HW * 2} height="14" fill="transparent" {...outlineA('thermal')} strokeDasharray="4 3" />
        </Hit>
        <Callout3 right x={172} y={58} text={t(L.pad)} tx={AX + PAD_HW} ty={LY[0] - 5} />
        <Callout3 right x={172} y={108} text={t(L.drill)} tx={AX + 3} ty={108} />
        <Callout3 right x={172} y={170} text={t(L.anti)} tx={AX + 20} ty={LY[1] + 2} />
        <Callout3 right x={172} y={230} text={t(L.ring)} tx={AX + 12} ty={LY[3] - 2} />
        <text x="500" y="44" textAnchor="middle" fill="var(--text-2)" fontSize="12" fontWeight="700">
          {t(L.topA)}
        </text>
        <text x="500" y="64" textAnchor="middle" fill="var(--muted)" fontSize="11">
          {t(L.subA)}
        </text>
        <text x="690" y="44" textAnchor="middle" fill="var(--text-2)" fontSize="12" fontWeight="700">
          {t(L.topA)}
        </text>
        <text x="690" y="64" textAnchor="middle" fill="var(--muted)" fontSize="11">
          {t(L.subB)}
        </text>
        <TopView cx={500} thermal={false} active={active} onPick={onPick} label={label} />
        <TopView cx={690} thermal active={active} onPick={onPick} label={label} />
        {[
          { x: 420, rows: rowsA },
          { x: 610, rows: rowsB },
        ].map((col) =>
          col.rows.map((row, i) => (
            <g key={`${col.x}-${i}`}>
              <rect x={col.x} y={274 + i * 16} width="10" height="9" fill={row.c} stroke="var(--text-2)" strokeWidth="0.6" />
              <text x={col.x + 15} y={282 + i * 16} fill="var(--text-2)" fontSize="11">
                {row.text}
              </text>
            </g>
          )),
        )}
      </svg>
      <figcaption>{t(S.termCap)}</figcaption>
    </figure>
  )
}