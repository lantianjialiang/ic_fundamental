import { useLocale } from '../../i18n/LocaleContext'
import { loc } from '../../i18n/locale'
import { T } from './FlowFigs'

// 画布局部坐标：578 × 302
const WIRE = 'var(--sky)'
const BODY = 'var(--gold)'
const TXT = 'var(--text)'

const L = {
  msgHint: loc(
    '有错误或警告时，这里会出现红色或黄色的行；双击一行就跳到出错的位置。',
    'Errors and warnings show up here as red or yellow rows; double-click one to jump to it.',
  ),
  partsCap: loc('器件属性（值和封装名要填好）', 'Part properties (fill in value and footprint)'),
}

const PARTS = [
  { k: 'J', val: 'USB-C', fp: 'USB-C_16P' },
  { k: 'R', val: '330R', fp: '0603' },
  { k: 'D', val: 'LED', fp: '0603_LED' },
  { k: 'C', val: '100nF', fp: '0603' },
  { k: 'U', val: 'TEMP', fp: 'SOT-23' },
  { k: 'TP', val: 'TP', fp: 'TP_1.5' },
]

function Dot({ x, y }: { x: number; y: number }) {
  return <circle cx={x} cy={y} r="2.6" fill={WIRE} />
}

export function SchSheet({ annotated }: { annotated: boolean }) {
  const n = (k: string) => (annotated ? `${k}1` : `${k}?`)
  const wire = { stroke: WIRE, strokeWidth: 1.5, fill: 'none' }
  const body = { stroke: BODY, strokeWidth: 1.6, fill: 'none' }
  return (
    <g>
      <rect x="6" y="4" width="566" height="170" rx="4" fill="var(--card)" stroke="var(--line)" />
      <path d="M78 50 H430 M90 130 H430 M78 100 H90 V130" {...wire} />
      <path d="M190 50 V62 M190 90 V98 M190 114 V130" {...wire} />
      <path d="M290 50 V84 M290 92 V130 M380 50 V66 M380 110 V130 M420 88 H486" {...wire} />
      <path d="M260 130 V138" {...wire} />
      <path d="M252 138 H268 M255 142 H265 M258 146 H262" stroke={TXT} strokeWidth="1.5" />
      {[[190, 50], [190, 130], [290, 50], [290, 130], [380, 50], [380, 130]].map(([x, y]) => (
        <Dot key={`${x}-${y}`} x={x} y={y} />
      ))}
      <rect x="18" y="36" width="60" height="76" {...body} />
      <rect x="184" y="62" width="12" height="28" {...body} />
      <path d="M182 98 H198 L190 114 Z" {...body} />
      <path d="M181 114 H199" {...body} />
      <path d="M203 102 L211 94 M203 109 L211 101" stroke={BODY} strokeWidth="1.2" />
      <path d="M280 84 H300 M280 92 H300" stroke={BODY} strokeWidth="2" />
      <rect x="340" y="66" width="80" height="44" {...body} />
      <circle cx="490" cy="88" r="4" {...body} />
      <T x={48} y={30} bold color={TXT} size={11}>{n('J')}</T>
      <T x={48} y={78} color="var(--text-2)" size={10}>USB-C</T>
      <T x={74} y={54} anchor="end" size={9}>VBUS</T>
      <T x={74} y={104} anchor="end" size={9}>GND</T>
      <T x={110} y={44} anchor="start" size={10} mono color="var(--green)">VBUS</T>
      <T x={176} y={74} anchor="end" bold color={TXT}>{n('R')}</T>
      <T x={176} y={86} anchor="end" size={10}>330R</T>
      <T x={172} y={108} anchor="end" bold color={TXT}>{n('D')}</T>
      <T x={172} y={120} anchor="end" size={10}>LED</T>
      <T x={276} y={86} anchor="end" bold color={TXT}>{n('C')}</T>
      <T x={276} y={100} anchor="end" size={10}>100nF</T>
      <T x={334} y={76} anchor="end" bold color={TXT}>{n('U')}</T>
      <T x={334} y={88} anchor="end" size={10}>TEMP</T>
      <T x={380} y={80} size={9}>VCC</T>
      <T x={380} y={104} size={9}>GND</T>
      <T x={416} y={92} anchor="end" size={9}>OUT</T>
      <T x={386} y={62} anchor="start" size={9} color="var(--muted)">3</T>
      <T x={386} y={124} anchor="start" size={9} color="var(--muted)">1</T>
      <T x={426} y={102} anchor="start" size={9} color="var(--muted)">2</T>
      <T x={448} y={82} size={10} mono color="var(--green)">TEMP_OUT</T>
      <T x={490} y={106} bold color={TXT}>{n('TP')}</T>
    </g>
  )
}

export function PartsTable() {
  const { t } = useLocale()
  return (
    <g>
      <T x={14} y={196} anchor="start" bold color="var(--gold)" size={11}>{t(L.partsCap)}</T>
      <T x={14} y={214} anchor="start" size={10} mono color="var(--muted)">Designator</T>
      <T x={130} y={214} anchor="start" size={10} mono color="var(--muted)">Comment</T>
      <T x={230} y={214} anchor="start" size={10} mono color="var(--muted)">Footprint</T>
      {PARTS.map((p, i) => (
        <g key={p.k}>
          <T x={14} y={230 + i * 13} anchor="start" size={10} mono>{`${p.k}?`}</T>
          <T x={130} y={230 + i * 13} anchor="start" size={10} mono>{p.val}</T>
          <T x={230} y={230 + i * 13} anchor="start" size={10} mono>{p.fp}</T>
        </g>
      ))}
    </g>
  )
}

export function AnnotateDialog() {
  return (
    <g>
      <rect x="6" y="180" width="566" height="116" rx="4" fill="var(--panel)" stroke="var(--line)" />
      <T x={14} y={196} anchor="start" bold color="var(--gold)" size={11}>Annotate</T>
      <T x={320} y={196} anchor="start" size={10} mono color="var(--text-2)">Order: Down Then Across</T>
      <T x={14} y={212} anchor="start" size={10} mono color="var(--muted)">Current</T>
      <T x={110} y={212} anchor="start" size={10} mono color="var(--muted)">Proposed</T>
      <T x={210} y={212} anchor="start" size={10} mono color="var(--muted)">Sheet</T>
      {PARTS.map((p, i) => (
        <g key={p.k}>
          <T x={14} y={227 + i * 11} anchor="start" size={10} mono>{`${p.k}?`}</T>
          <T x={110} y={227 + i * 11} anchor="start" size={10} mono color="var(--green)">{`${p.k}1`}</T>
          <T x={210} y={227 + i * 11} anchor="start" size={10} mono>LED_Sensor.SchDoc</T>
        </g>
      ))}
      <rect x="440" y="266" width="120" height="20" rx="3" fill="var(--gold-bg)" stroke="var(--gold)" strokeWidth="1.6" />
      <T x={500} y={280} size={10} bold color="var(--gold)">Execute Changes</T>
    </g>
  )
}

export function MessagesPanel() {
  const { t } = useLocale()
  return (
    <g>
      <rect x="6" y="180" width="566" height="116" rx="4" fill="var(--panel)" stroke="var(--line)" />
      <T x={14} y={196} anchor="start" bold color="var(--gold)" size={11}>Messages</T>
      <T x={14} y={214} anchor="start" size={10} mono color="var(--muted)">Class</T>
      <T x={80} y={214} anchor="start" size={10} mono color="var(--muted)">Document</T>
      <T x={210} y={214} anchor="start" size={10} mono color="var(--muted)">Message</T>
      <circle cx="20" cy="228" r="4" fill="var(--green)" />
      <T x={30} y={232} anchor="start" size={10} mono>Info</T>
      <T x={80} y={232} anchor="start" size={10} mono>LED_Sensor.PrjPcb</T>
      <T x={210} y={232} anchor="start" size={10} mono color="var(--green)">Compile successful, no errors found.</T>
      <T x={14} y={262} anchor="start" size={10} color="var(--text-2)">{t(L.msgHint)}</T>
    </g>
  )
}

const ECO_ROWS = [
  ['Component', 'J1'],
  ['Component', 'R1'],
  ['Component', 'D1'],
  ['Component', 'C1'],
  ['Component', 'U1'],
  ['Component', 'TP1'],
  ['Net', 'VBUS'],
  ['Net', 'GND'],
  ['Net', 'TEMP_OUT'],
]

export function EcoDialog() {
  return (
    <g>
      <rect x="6" y="4" width="566" height="292" rx="4" fill="var(--panel)" stroke="var(--line)" />
      <T x={14} y={20} anchor="start" bold color="var(--gold)" size={11}>Engineering Change Order</T>
      <T x={14} y={40} anchor="start" size={10} mono color="var(--muted)">Action</T>
      <T x={70} y={40} anchor="start" size={10} mono color="var(--muted)">Affected Object</T>
      <T x={230} y={40} anchor="start" size={10} mono color="var(--muted)">Affected Document</T>
      <T x={420} y={40} size={10} mono color="var(--muted)">Check</T>
      <T x={490} y={40} size={10} mono color="var(--muted)">Done</T>
      {ECO_ROWS.map(([kind, name], i) => {
        const y = 58 + i * 18
        return (
          <g key={name}>
            <T x={14} y={y} anchor="start" size={10} mono>Add</T>
            <T x={70} y={y} anchor="start" size={10} mono>{`${kind} ${name}`}</T>
            <T x={230} y={y} anchor="start" size={10} mono>LED_Sensor.PcbDoc</T>
            <path d={`M414 ${y - 4} l4 4 l8 -9`} stroke="var(--green)" strokeWidth="2" fill="none" />
            <circle cx="490" cy={y - 3} r="4" fill="none" stroke="var(--dim)" />
          </g>
        )
      })}
      <rect x="14" y="250" width="120" height="22" rx="3" fill="var(--card)" stroke="var(--line)" />
      <T x={74} y={265} size={10}>Validate Changes</T>
      <rect x="144" y="250" width="120" height="22" rx="3" fill="var(--gold-bg)" stroke="var(--gold)" strokeWidth="1.8" />
      <T x={204} y={265} size={10} bold color="var(--gold)">Execute Changes</T>
      <rect x="274" y="250" width="120" height="22" rx="3" fill="var(--card)" stroke="var(--line)" />
      <T x={334} y={265} size={10}>Report Changes</T>
    </g>
  )
}
