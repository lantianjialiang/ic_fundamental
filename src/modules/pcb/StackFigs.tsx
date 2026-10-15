import { useLocale } from '../../i18n/LocaleContext'
import { loc, type LText } from '../../i18n/locale'
import { Hit } from '../prep/common'
import { S } from './data/pcbStack'
import { dielectricKinds, KIND_COLOR, KIND_LABEL, STACKS, VIA_COLOR, VIA_IDS, spanText, viaSpan, type ViaId } from './data/pcbStackModel'
import { type ViaCardId } from './data/pcbStackVia'

/** 文字宽度估计：CJK 按 1 × 字号，其余按 0.56 × 字号 */
export function estW(text: string, size: number) {
  let w = 0
  for (const ch of text) {
    w += ch.charCodeAt(0) > 255 ? size : 0.56 * size
  }
  return w
}

const L = {
  names: {
    through: loc('通孔', 'Through via'),
    blind: loc('盲孔', 'Blind via'),
    buried: loc('埋孔', 'Buried via'),
    micro: loc('微孔（激光）', 'Microvia (laser)'),
  } as Record<ViaId, LText>,
  pad: loc('焊盘', 'Pad'),
  drill: loc('钻孔', 'Drill'),
  ring: loc('孔环', 'Annular ring'),
  anti: loc('反焊盘', 'Antipad'),
}

const STACK6 = STACKS[STACKS.length - 1]
const COUNT = STACK6.layers.length
const BX0 = 76
const BX1 = 744
const LY = STACK6.layers.map((_, i) => 64 + i * 50)
const CU = 6
const PAD_HW = 16
const ANTI_HW = 24
const COL_X: Record<ViaId, number> = { through: 230, blind: 400, buried: 530, micro: 660 }
const BARREL_HW: Record<ViaId, number> = { through: 8, blind: 7, buried: 7, micro: 5 }

function planeSegments(layer: number): Array<[number, number]> {
  const gaps: Array<[number, number]> = []
  for (const id of VIA_IDS) {
    const span = viaSpan(id, COUNT)
    if (span && span[0] < layer && layer < span[1]) {
      gaps.push([COL_X[id] - ANTI_HW, COL_X[id] + ANTI_HW])
    }
  }
  gaps.sort((a, b) => a[0] - b[0])
  const out: Array<[number, number]> = []
  let cursor = BX0
  for (const gap of gaps) {
    out.push([cursor, gap[0]])
    cursor = gap[1]
  }
  out.push([cursor, BX1])
  return out
}

/** 引线标注：文字在目标左边（默认）时引线从文字右端出发；right 时文字在目标右边，引线从文字左端出发 */
export function Callout3({ x, y, text, tx, ty, right = false }: { x: number; y: number; text: string; tx: number; ty: number; right?: boolean }) {
  const x0 = right ? x - 5 : x + estW(text, 11) + 5
  return (
    <g pointerEvents="none">
      <text x={x} y={y + 4} fill="var(--text-2)" fontSize="11" fontWeight="600">
        {text}
      </text>
      <line x1={x0} y1={y} x2={tx} y2={ty} stroke="var(--text-2)" strokeWidth="1" />
      <circle cx={tx} cy={ty} r="2.2" fill="var(--text-2)" />
    </g>
  )
}

function ViaColumn({ id, active }: { id: ViaId; active: boolean }) {
  const span = viaSpan(id, COUNT)
  if (!span) {
    return null
  }
  const cx = COL_X[id]
  const color = VIA_COLOR[id]
  const hw = BARREL_HW[id]
  const yTop = LY[span[0] - 1]
  const yBot = LY[span[1] - 1]
  const micro = id === 'micro'
  // 通孔、盲孔的孔腔是空的（顶面开口）；埋孔压合时被树脂填满；微孔电镀铜填实
  const hollow = id === 'through' || id === 'blind'
  const bottomOpen = id === 'through'
  const padHw = micro ? 14 : PAD_HW
  const pads: number[] = []
  for (let layer = span[0]; layer <= span[1]; layer += 1) {
    // 平面层上落点直接连铜皮，不另画焊盘；信号层上画焊盘和一小段走线
    if (STACK6.layers[layer - 1] === 'sig') {
      pads.push(layer)
    }
  }
  return (
    <g opacity={active ? 1 : 0.5} pointerEvents="none">
      {micro ? (
        <polygon points={`${cx - 10},${yTop} ${cx + 10},${yTop} ${cx + hw},${yBot} ${cx - hw},${yBot}`} fill={color} stroke={color} strokeWidth="1" />
      ) : (
        <>
          {hollow ? <rect x={cx - hw} y={yTop - CU / 2} width={hw * 2} height={yBot - yTop + (bottomOpen ? CU : 0)} fill="var(--well)" /> : null}
          <rect x={cx - hw - 3} y={yTop} width="3" height={yBot - yTop} fill={color} />
          <rect x={cx + hw} y={yTop} width="3" height={yBot - yTop} fill={color} />
        </>
      )}
      {pads.map((layer) => {
        const y = LY[layer - 1] - CU / 2 - 1
        const closed = micro && layer === span[0]
        return (
          <g key={layer}>
            <rect x={cx - padHw - 38} y={y + 1} width="38" height={CU} fill={KIND_COLOR.sig} />
            <rect x={cx + padHw} y={y + 1} width="38" height={CU} fill={KIND_COLOR.sig} />
            {closed ? (
              <rect x={cx - padHw} y={y} width={padHw * 2} height={CU + 2} fill={color} />
            ) : (
              <>
                <rect x={cx - padHw} y={y} width={padHw - hw} height={CU + 2} fill={color} />
                <rect x={cx + hw} y={y} width={padHw - hw} height={CU + 2} fill={color} />
              </>
            )}
          </g>
        )
      })}
    </g>
  )
}

export function ViaFig({ active, onPick }: { active: ViaCardId; onPick: (id: ViaCardId) => void }) {
  const { t } = useLocale()
  const col: ViaId = active === 'hdi' ? 'micro' : active
  const dk = dielectricKinds(COUNT)
  let lx = BX0
  const legend: Array<{ color: string; text: string; opacity: number }> = [
    { color: KIND_COLOR.sig, text: t(KIND_LABEL.sig), opacity: 1 },
    { color: KIND_COLOR.gnd, text: t(KIND_LABEL.gnd), opacity: 1 },
    { color: KIND_COLOR.pwr, text: t(KIND_LABEL.pwr), opacity: 1 },
    { color: '#9fb36a', text: t(S.coreWord), opacity: 0.6 },
    { color: '#d1bd72', text: t(S.ppWord), opacity: 0.6 },
  ]
  return (
    <figure className="term-fig">
      <svg viewBox="0 0 760 392" className="term-fig__svg" role="group" aria-label={t(S.viaCap)}>
        <rect width="760" height="392" rx="10" fill="var(--well)" />
        {dk.map((kind, i) => (
          <rect key={i} x={BX0} y={LY[i]} width={BX1 - BX0} height={LY[i + 1] - LY[i]} fill={kind === 'core' ? '#9fb36a' : '#d1bd72'} opacity="0.3" />
        ))}
        {STACK6.layers.map((kind, i) => {
          if (kind === 'sig') {
            return null
          }
          return planeSegments(i + 1).map(([a, b], k) => <rect key={`${i}-${k}`} x={a} y={LY[i] - CU / 2} width={b - a} height={CU} fill={KIND_COLOR[kind]} />)
        })}
        {STACK6.layers.map((kind, i) => (
          <text key={i} x={BX0 - 6} y={LY[i] + 4} textAnchor="end" fill="var(--text-2)" fontSize="11" fontFamily="var(--mono)">
            {`L${i + 1} ${kind === 'sig' ? 'SIG' : kind === 'gnd' ? 'GND' : 'PWR'}`}
          </text>
        ))}
        {VIA_IDS.map((id) => {
          const cx = COL_X[id]
          const on = col === id
          const span = viaSpan(id, COUNT)
          return (
            <Hit key={id} label={t(L.names[id])} active={on} onPick={() => onPick(id)}>
              <rect x={cx - 62} y={40} width="124" height="290" rx="8" fill={on ? 'var(--gold-bg)' : 'transparent'} opacity={on ? 0.6 : 1} stroke={on ? 'var(--gold)' : 'none'} />
              <text x={cx} y={30} textAnchor="middle" fill={on ? 'var(--text)' : 'var(--text-2)'} fontSize="12" fontWeight="700">
                {t(L.names[id])}
              </text>
              {span ? (
                <text x={cx} y={350} textAnchor="middle" fill="var(--muted)" fontSize="11" fontFamily="var(--mono)">
                  {spanText(span)}
                </text>
              ) : null}
            </Hit>
          )
        })}
        {VIA_IDS.map((id) => (
          <ViaColumn key={id} id={id} active={col === id} />
        ))}
        <Callout3 x={84} y={52} text={t(L.pad)} tx={COL_X.through - PAD_HW + 2} ty={LY[0] - 4} />
        <Callout3 x={84} y={90} text={t(L.drill)} tx={COL_X.through - 3} ty={90} />
        <Callout3 x={84} y={140} text={t(L.ring)} tx={COL_X.through - 12} ty={LY[2] + 1} />
        <Callout3 x={84} y={240} text={t(L.anti)} tx={COL_X.through - 16} ty={LY[3] + 1} />
        {legend.map((item) => {
          const x = lx
          lx += 14 + 5 + estW(item.text, 11) + 18
          return (
            <g key={item.text}>
              <rect x={x} y={366} width="14" height="9" fill={item.color} opacity={item.opacity} />
              <text x={x + 19} y={375} fill="var(--text-2)" fontSize="11">
                {item.text}
              </text>
            </g>
          )
        })}
      </svg>
      <figcaption>{t(S.viaCap)}</figcaption>
    </figure>
  )
}
